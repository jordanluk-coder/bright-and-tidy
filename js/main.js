/* =========================================================
   Bright & Tidy Home Cleaning — main.js
   ========================================================= */

/* ---------- Config ----------
   FORM_BACKEND_URL: form-delivery endpoint (FormSubmit AJAX). Quote-form and
   call-back submissions are emailed to the address in this URL — no email
   app needed. After activating FormSubmit, you can replace the address with
   the random alias from your activation email to hide it from bots.
   If ever set to "", forms fall back to opening the visitor's email app. */
const FORM_BACKEND_URL = "https://formsubmit.co/ajax/jordan.luk@brightandtidyco.com";
const BUSINESS_EMAIL = "info@brightandtidyco.com";

// Sends form fields to the backend if configured; returns false otherwise
// so callers can fall back to a mailto: link.
async function sendToBackend(fields) {
  if (!FORM_BACKEND_URL) return false;
  const res = await fetch(FORM_BACKEND_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ _template: "table", ...fields }),
  });
  if (!res.ok) throw new Error(`Form backend responded ${res.status}`);
  const data = await res.json().catch(() => ({}));
  if (data.success === "false" || data.ok === false) {
    throw new Error("Form backend rejected the submission");
  }
  return true;
}

// ---------- Mobile navigation ----------
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");

navToggle.addEventListener("click", () => {
  const open = siteNav.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});

// Close the mobile menu after tapping a link
siteNav.querySelectorAll(".nav__link").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------- Instant estimate widget ----------
// SINGLE SOURCE OF TRUTH for prices — mirrors the live HouseCall Pro online
// booking form (book.housecallpro.com/book/bright--tidy-llc), verified against
// it on 2026-07-26, so the estimator never quotes a price the booking widget
// won't honour. HCP's size brackets are 1-1000 / 1001-1499 / 1500-1999 /
// 2000-2499 / 2500-2999 / 3000-3500 — mirrored here exactly.
//   oneTime.refresh/deep/move = flat one-time rates shown in the widget
//   plans.<freq>              = recurring price PER VISIT
// HCP doesn't display recurring prices in the widget, but each recurring
// service's description states the rule: weekly save 20%, bi-weekly 15%,
// monthly 10% off the one-time Refresh. These are that rule applied.
const SIZES = {
  s1: {
    label: "Under 1,000 sq ft", hint: "1 bd / 1 ba",
    oneTime: { refresh: 183, deep: 205, move: 345 },
    plans: { weekly: 146, biweekly: 156, monthly: 165 },
  },
  s2: {
    label: "1,001–1,499 sq ft", hint: "2 bd",
    oneTime: { refresh: 213, deep: 240, move: 405 },
    plans: { weekly: 170, biweekly: 181, monthly: 192 },
  },
  s3: {
    label: "1,500–1,999 sq ft", hint: "3 bd / 2 ba",
    oneTime: { refresh: 243, deep: 275, move: 465 },
    plans: { weekly: 194, biweekly: 207, monthly: 219 },
  },
  s4: {
    label: "2,000–2,499 sq ft", hint: "4 bd",
    oneTime: { refresh: 273, deep: 310, move: 525 },
    plans: { weekly: 218, biweekly: 232, monthly: 246 },
  },
  s5: {
    label: "2,500–2,999 sq ft", hint: "4–5 bd",
    oneTime: { refresh: 303, deep: 345, move: 585 },
    plans: { weekly: 242, biweekly: 258, monthly: 273 },
  },
  s6: {
    label: "3,000–3,500 sq ft", hint: "5+ bd",
    oneTime: { refresh: 333, deep: 380, move: 645 },
    plans: { weekly: 266, biweekly: 283, monthly: 300 },
  },
  // "custom" (over 3,500 sq ft) isn't offered in HCP online booking —
  // the estimator routes it to a call-back quote instead.
};

// Bi-weekly bills as 26 cleans a year ÷ 12 months, weekly as 52 ÷ 12.
const VISITS_PER_MONTH = { weekly: 52 / 12, biweekly: 26 / 12, monthly: 1 };

const FREQ_LABELS = {
  onetime: "One-time visit",
  weekly: "Weekly — save 20%",
  biweekly: "Every 2 weeks — save 15%",
  monthly: "Monthly — save 10%",
};

const TYPE_LABELS = {
  standard: "The Refresh (standard)",
  deep: "The Deep Clean",
  move: "The Fresh Start (move in/out)",
};

// Add-on catalogue and, per service, exactly which ones HouseCall Pro offers
// at online booking. The Fresh Start bundles the kitchen extras, so HCP only
// sells windows/laundry/dishes on top of it.
const ADDONS = {
  fridge:   { label: "Inside refrigerator", price: 45 },
  oven:     { label: "Inside oven", price: 45 },
  windows:  { label: "Interior windows", price: 75 },
  cabinets: { label: "Inside cabinets &amp; drawers", price: 50 },
  laundry:  { label: "Laundry (per load)", price: 30 },
  dishes:   { label: "Dishes (per load)", price: 25 },
};

const ADDONS_FOR = {
  standard: ["fridge", "oven", "cabinets", "laundry", "dishes"],
  deep: ["fridge", "oven", "windows", "cabinets", "laundry", "dishes"],
  move: ["windows", "laundry", "dishes"],
};

// Per-visit price for a size + service type + frequency.
// Deep/Move are one-time only; recurring pricing applies to the standard clean.
// Returns null for the custom (over 3,500 sq ft) size.
function visitPriceFor(sizeKey, type, freq) {
  const s = SIZES[sizeKey];
  if (!s) return null;
  if (type !== "standard") return s.oneTime[type];
  if (freq === "onetime" || !freq) return s.oneTime.refresh;
  return s.plans[freq];
}

const estimatorForm = document.getElementById("estimator-form");
const estResult = document.getElementById("est-result");
const estPrice = document.getElementById("est-price");
const estSummary = document.getElementById("est-summary");
const estTypeSelect = document.getElementById("est-type");
const estFreqField = document.getElementById("est-freq-field");

let lastEstimate = null;

// Show exactly the add-ons HouseCall Pro offers for the chosen service, so the
// estimator can't include an extra the booking widget won't let them pick.
const addonNote = document.getElementById("est-addon-note");
const ADDON_NOTES = {
  move: "Inside the oven, refrigerator and cabinets are already included in The Fresh Start.",
  standard: "Interior windows are available on The Deep Clean — just ask and we'll quote it.",
};

function refreshAddonAvailability() {
  const type = estTypeSelect.value;
  const offered = ADDONS_FOR[type] || [];
  document.querySelectorAll("#est-addons input").forEach((cb) => {
    const on = offered.includes(cb.dataset.addon);
    const label = cb.closest("label");
    label.hidden = !on;
    cb.disabled = !on;
    if (!on) cb.checked = false;
  });
  addonNote.textContent = ADDON_NOTES[type] || "";
  addonNote.hidden = !ADDON_NOTES[type];
}

// Frequency discounts only apply to standard cleans — hide the field otherwise
estTypeSelect.addEventListener("change", () => {
  estFreqField.hidden = estTypeSelect.value !== "standard";
  refreshAddonAvailability();
});
refreshAddonAvailability();

const estBook = document.getElementById("est-book");

estimatorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const sizeKey = document.getElementById("est-size").value;
  const size = SIZES[sizeKey];
  const type = estTypeSelect.value;
  const freq = type === "standard" ? document.getElementById("est-freq").value : "onetime";
  const addons = Array.from(
    document.querySelectorAll("#est-addons input:checked")
  ).map((cb) => ({ name: ADDONS[cb.dataset.addon].label, price: ADDONS[cb.dataset.addon].price }));

  // Over 3,500 sq ft has no fixed price — send them to a custom quote instead.
  if (!size) {
    estPrice.textContent = "Custom";
    estSummary.textContent = "Over 3,500 sq ft · we'll give you a fast custom quote";
    estBook.textContent = "Get a custom quote →";
    estBook.classList.remove("js-hcp-book");
    estBook.classList.add("js-custom-quote");
    estResult.hidden = false;
    lastEstimate = null;
    return;
  }

  const freqLabel = type === "standard" && freq !== "onetime" ? FREQ_LABELS[freq].split(" — ")[0] : null;
  const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
  const total = visitPriceFor(sizeKey, type, freq) + addonTotal;

  estPrice.textContent = `$${total}`;
  estSummary.textContent = [
    size.label,
    TYPE_LABELS[type],
    freqLabel,
    addons.length ? `${addons.length} add-on${addons.length > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  estBook.textContent = "Book This Clean →";
  estBook.classList.add("js-hcp-book");
  estBook.classList.remove("js-custom-quote");
  estResult.hidden = false;

  lastEstimate = { tierLabel: size.label, typeLabel: TYPE_LABELS[type], freqLabel, addons, total };
});

// "Book This Clean" opens the HouseCall Pro booking modal (see the .js-hcp-book
// handler below); the customer re-picks size and service there.

// ---------- Membership plans ----------
// Reads recurring prices straight from SIZES (the HouseCall Pro price book), so
// the cards always match the widget. Buttons open the HCP booking modal.
const MEMBERSHIPS = {
  monthly: { label: "Monthly Refresh" },
  biweekly: { label: "Bi-Weekly" },
  weekly: { label: "Weekly" },
};

const memSize = document.getElementById("mem-size");

function renderMemberships() {
  const size = SIZES[memSize.value];
  Object.keys(MEMBERSHIPS).forEach((key) => {
    const visit = size.plans[key];
    document.getElementById(`mem-${key}-mo`).textContent =
      `$${Math.round(visit * VISITS_PER_MONTH[key])}`;
    document.getElementById(`mem-${key}-visit`).textContent = `$${visit} per visit`;
  });
}

memSize.addEventListener("change", renderMemberships);
renderMemberships();

// Membership "Start …" buttons carry the .js-hcp-book class, so they open the
// HouseCall Pro booking modal via the delegated handler below — customers pick
// their recurring plan there. No separate call-back handler is needed.

// ---------- Review button ----------
// Hidden until a Google Business review link is pasted into data-review-link
// in index.html (the "Review us on Google" button in the reviews section).
const reviewBtn = document.querySelector(".js-review-btn");
if (reviewBtn) {
  if (reviewBtn.dataset.reviewLink) {
    reviewBtn.href = reviewBtn.dataset.reviewLink;
  } else {
    reviewBtn.hidden = true;
  }
}

// ---------- Online booking (HouseCall Pro) ----------
// The widget script in index.html loads async and defines window.HCPWidget,
// which opens the booking flow in a modal over the page. Delegated so every
// .js-hcp-book button works, including any added later.
document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".js-hcp-book");
  if (!trigger) return;
  e.preventDefault();

  // A visitor can click before the async script lands, so poll briefly (3s)
  // before falling back to the call-back modal.
  let tries = 0;
  (function openWidget() {
    if (window.HCPWidget && typeof window.HCPWidget.openModal === "function") {
      window.HCPWidget.openModal();
    } else if (tries++ < 20) {
      setTimeout(openWidget, 150);
    } else {
      openCallback("Our booking window didn't load. Leave your number and we'll call or text you right back to get you scheduled.");
    }
  })();
});

// Homes over 3,500 sq ft have no fixed online price — the estimator swaps its
// Book button to .js-custom-quote, which opens the call-back modal instead.
document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".js-custom-quote");
  if (!trigger) return;
  e.preventDefault();
  openCallback("Homes over 3,500 sq ft get a custom quote — leave your number and we'll call or text you right back with your price.");
});

// ---------- Call-back modal ----------
const cbModal = document.getElementById("callback-modal");
const cbStatus = document.getElementById("cb-status");
const cbSub = document.getElementById("cb-sub");
const CB_DEFAULT_SUB = cbSub.textContent;

// message: optional custom line (used by the membership buttons)
function openCallback(message) {
  cbStatus.className = "callback__status";
  cbSub.textContent = message || CB_DEFAULT_SUB;
  cbModal.showModal();
}

document.getElementById("callback-open").addEventListener("click", () => openCallback());

document.getElementById("callback-close").addEventListener("click", () => cbModal.close());

// Clicking the dimmed backdrop closes the modal
cbModal.addEventListener("click", (event) => {
  if (event.target === cbModal) cbModal.close();
});

document.getElementById("callback-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const phone = document.getElementById("cb-phone").value.trim();
  const name = document.getElementById("cb-name").value.trim();

  if (phone.replace(/\D/g, "").length < 10) {
    cbStatus.textContent = "Please enter a full phone number so we can reach you.";
    cbStatus.className = "callback__status is-error";
    return;
  }

  try {
    const sent = await sendToBackend({
      _subject: `Call-back request — ${name || phone}`,
      phone,
      name: name || "(not given)",
      form: "call-back",
    });
    if (sent) {
      document.getElementById("callback-form").reset();
      cbStatus.textContent =
        "Got it! 📞 We'll call or text you back from (951) 593-8266 — save the number so you know it's us.";
      cbStatus.className = "callback__status is-success";
      return;
    }
  } catch {
    cbStatus.textContent =
      "Something went wrong — please call or text us directly at (951) 593-8266.";
    cbStatus.className = "callback__status is-error";
    return;
  }

  const body = [
    `Phone: ${phone}`,
    name ? `Name: ${name}` : null,
    "",
    "Call-back requested from the Bright & Tidy website.",
  ]
    .filter(Boolean)
    .join("\n");

  window.location.href =
    `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  cbStatus.textContent =
    "Almost done — your email app just opened with your request. Hit send and we'll be in touch!";
  cbStatus.className = "callback__status is-success";
});

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
