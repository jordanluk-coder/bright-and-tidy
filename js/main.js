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
// Prices mirror the "Price List" tab of Bright-and-Tidy-Pricing real.xlsx.
// Frequency multipliers apply to STANDARD cleans only, per the price list.
const PRICING = {
  tiers: {
    t1: { label: "1 bed / 1 bath", standard: 132, deep: 180, move: 320 },
    t2: { label: "2 bed / 1–2 bath", standard: 162, deep: 230, move: 370 },
    t3: { label: "3 bed / 2 bath", standard: 198, deep: 290, move: 430 },
    t4: { label: "4 bed / 2–3 bath", standard: 234, deep: 360, move: 500 },
    t5: { label: "5+ bed / 3+ bath", standard: 276, deep: 430, move: 570 },
  },
  frequency: {
    weekly: { label: "Weekly", mult: 0.8 },
    biweekly: { label: "Every 2 weeks", mult: 0.85 },
    monthly: { label: "Monthly", mult: 0.9 },
    onetime: { label: "One-time visit", mult: 1.2 },
  },
  typeLabels: {
    standard: "Standard clean",
    deep: "Deep cleaning",
    move: "Move in / move out",
  },
};

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

estimatorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const tier = PRICING.tiers[document.getElementById("est-size").value];
  const type = estTypeSelect.value;
  const addons = Array.from(
    document.querySelectorAll("#est-addons input:checked")
  ).map((cb) => ({ name: cb.dataset.name, price: Number(cb.value) }));

  let visitPrice = tier[type];
  let freqLabel = null;
  if (type === "standard") {
    const freq = PRICING.frequency[document.getElementById("est-freq").value];
    visitPrice *= freq.mult;
    freqLabel = freq.label;
  }

  const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
  const total = Math.round(visitPrice) + addonTotal;

  estPrice.textContent = `$${total}`;
  estSummary.textContent = [
    tier.label,
    PRICING.typeLabels[type],
    freqLabel,
    addons.length ? `${addons.length} add-on${addons.length > 1 ? "s" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  estResult.hidden = false;

  lastEstimate = { tierLabel: tier.label, typeLabel: PRICING.typeLabels[type], freqLabel, addons, total };
});

// "Book This Clean" opens the HouseCall Pro booking modal (see the .js-hcp-book
// handler below); the customer re-picks size and service there.

// ---------- Membership plans ----------
// Mirrors the "Membership Plans" tab: monthly price = standard rate ×
// frequency discount × visits per month (bi-weekly 26/yr ÷ 12, weekly 52 ÷ 12).
const MEMBERSHIPS = {
  monthly: { label: "Monthly Refresh", freq: "monthly", visitsPerMonth: 1 },
  biweekly: { label: "Bi-Weekly", freq: "biweekly", visitsPerMonth: 26 / 12 },
  weekly: { label: "Weekly", freq: "weekly", visitsPerMonth: 52 / 12 },
};

const memSize = document.getElementById("mem-size");

function renderMemberships() {
  const tier = PRICING.tiers[memSize.value];
  Object.entries(MEMBERSHIPS).forEach(([key, plan]) => {
    const perVisit = tier.standard * PRICING.frequency[plan.freq].mult;
    document.getElementById(`mem-${key}-mo`).textContent =
      `$${Math.round(perVisit * plan.visitsPerMonth)}`;
    document.getElementById(`mem-${key}-visit`).textContent =
      `$${Math.round(perVisit)} per visit`;
  });
}

memSize.addEventListener("change", renderMemberships);
renderMemberships();

// Memberships need recurring billing set up by hand, so they can't go through
// online booking — these open the call-back modal with the plan noted.
let pendingMembership = null;

document.querySelectorAll(".js-mem-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = MEMBERSHIPS[btn.dataset.plan];
    const tier = PRICING.tiers[memSize.value];
    const monthly = document.getElementById(`mem-${btn.dataset.plan}-mo`).textContent;
    pendingMembership = `${plan.label} membership — ${tier.label} (${monthly}/month)`;
    openCallback(`Leave your number and we'll set up your ${plan.label} plan — ${tier.label}, ${monthly}/month.`);
  });
});

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

document.getElementById("callback-open").addEventListener("click", () => {
  pendingMembership = null;
  openCallback();
});

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

  const subject = pendingMembership
    ? `Membership request — ${name || phone}`
    : `Call-back request — ${name || phone}`;

  try {
    const sent = await sendToBackend({
      _subject: subject,
      phone,
      name: name || "(not given)",
      interested_in: pendingMembership || "(general call-back)",
      form: pendingMembership ? "membership" : "call-back",
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
