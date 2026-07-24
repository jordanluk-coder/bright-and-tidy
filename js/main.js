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
// SINGLE SOURCE OF TRUTH for prices — mirrors the HouseCall Pro price book
// (Bright_and_Tidy_Pricing_SqFt.docx) exactly, so the site never drifts from
// what customers see in the online-booking widget. Prices are flat, by square
// footage. Both the estimator and the memberships section read from SIZES.
//   oneTime.refresh/deep/move  = one-time flat rates
//   plans.<freq>.visit         = recurring price per visit
//   plans.<freq>.month         = recurring price per month (as published)
const SIZES = {
  s1: {
    label: "Under 1,000 sq ft", hint: "1 bd / 1 ba",
    oneTime: { refresh: 158, deep: 180, move: 320 },
    plans: { weekly: { visit: 130, month: 562 }, biweekly: { visit: 138, month: 298 }, monthly: { visit: 146, month: 146 } },
  },
  s2: {
    label: "1,000–1,499 sq ft", hint: "2 bd",
    oneTime: { refresh: 188, deep: 215, move: 380 },
    plans: { weekly: { visit: 155, month: 672 }, biweekly: { visit: 164, month: 355 }, monthly: { visit: 174, month: 174 } },
  },
  s3: {
    label: "1,500–1,999 sq ft", hint: "3 bd / 2 ba",
    oneTime: { refresh: 218, deep: 250, move: 440 },
    plans: { weekly: { visit: 179, month: 776 }, biweekly: { visit: 190, month: 412 }, monthly: { visit: 201, month: 201 } },
  },
  s4: {
    label: "2,000–2,499 sq ft", hint: "4 bd",
    oneTime: { refresh: 248, deep: 285, move: 500 },
    plans: { weekly: { visit: 204, month: 884 }, biweekly: { visit: 217, month: 470 }, monthly: { visit: 229, month: 229 } },
  },
  s5: {
    label: "2,500–2,999 sq ft", hint: "4–5 bd",
    oneTime: { refresh: 278, deep: 320, move: 560 },
    plans: { weekly: { visit: 229, month: 992 }, biweekly: { visit: 243, month: 527 }, monthly: { visit: 257, month: 257 } },
  },
  s6: {
    label: "3,000–3,500 sq ft", hint: "5+ bd",
    oneTime: { refresh: 308, deep: 355, move: 620 },
    plans: { weekly: { visit: 253, month: 1096 }, biweekly: { visit: 269, month: 583 }, monthly: { visit: 285, month: 285 } },
  },
  // "custom" (over 3,500 sq ft) has no fixed price — handled as a call-back quote.
};

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

// Per-visit price for a size + service type + frequency.
// Deep/Move are one-time only; recurring prices apply to the standard clean.
// Returns null for the custom (over 3,500 sq ft) size.
function visitPriceFor(sizeKey, type, freq) {
  const s = SIZES[sizeKey];
  if (!s) return null;
  if (type !== "standard") return s.oneTime[type];
  if (freq === "onetime" || !freq) return s.oneTime.refresh;
  return s.plans[freq].visit;
}

const estimatorForm = document.getElementById("estimator-form");
const estResult = document.getElementById("est-result");
const estPrice = document.getElementById("est-price");
const estSummary = document.getElementById("est-summary");
const estTypeSelect = document.getElementById("est-type");
const estFreqField = document.getElementById("est-freq-field");

let lastEstimate = null;

// Deep cleans and move in / move out packages already bundle most extras —
// only genuinely additive add-ons stay selectable for those services.
const EXTRA_ONLY_ADDONS = ["Dishes (per load)", "Laundry (1 load)", "Extra pet hair"];

function refreshAddonAvailability() {
  const bundled = estTypeSelect.value !== "standard";
  document.querySelectorAll("#est-addons input").forEach((cb) => {
    const off = bundled && !EXTRA_ONLY_ADDONS.includes(cb.dataset.name);
    cb.disabled = off;
    if (off) cb.checked = false;
    const label = cb.closest("label");
    label.classList.toggle("is-included", off);
    label.querySelector("span").textContent = off ? "Included" : `+$${cb.value}`;
  });
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
  ).map((cb) => ({ name: cb.dataset.name, price: Number(cb.value) }));

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
    document.getElementById(`mem-${key}-mo`).textContent = `$${size.plans[key].month}`;
    document.getElementById(`mem-${key}-visit`).textContent = `$${size.plans[key].visit} per visit`;
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
