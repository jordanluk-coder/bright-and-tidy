/* =========================================================
   Bright & Tidy Home Cleaning — main.js
   ========================================================= */

/* ---------- Config ----------
   FORM_BACKEND_URL: paste your Formspree endpoint here (see README.md,
   "Making the forms deliver to your inbox") and the quote form + call-back
   requests will be emailed to you automatically, no email app needed.
   Example: const FORM_BACKEND_URL = "https://formspree.io/f/abcdwxyz";
   While it's empty, forms fall back to opening the visitor's email app. */
const FORM_BACKEND_URL = "";
const BUSINESS_EMAIL = "info@brightandtidyco.com";

// Sends form fields to the backend if configured; returns false otherwise
// so callers can fall back to a mailto: link.
async function sendToBackend(fields) {
  if (!FORM_BACKEND_URL) return false;
  const res = await fetch(FORM_BACKEND_URL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Form backend responded ${res.status}`);
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
    t1: { label: "1 bed / 1 bath", standard: 110, deep: 180, move: 320 },
    t2: { label: "2 bed / 1–2 bath", standard: 135, deep: 230, move: 370 },
    t3: { label: "3 bed / 2 bath", standard: 165, deep: 290, move: 430 },
    t4: { label: "4 bed / 2–3 bath", standard: 195, deep: 360, move: 500 },
    t5: { label: "5+ bed / 3+ bath", standard: 230, deep: 430, move: 570 },
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
const EXTRA_ONLY_ADDONS = ["Dishes (1 sink load)", "Laundry (1 load)", "Extra pet hair"];

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

// Carry the estimate details into the quote form when "Book It" is clicked
const SERVICE_OPTION_FOR_TYPE = {
  "Standard clean": "Standard / Recurring",
  "Deep cleaning": "Deep Cleaning",
  "Move in / move out": "Move In / Move Out",
};

document.getElementById("est-book").addEventListener("click", () => {
  if (!lastEstimate) return;
  const msg = document.getElementById("q-msg");
  if (!msg.value) {
    const parts = [
      `${lastEstimate.typeLabel} — ${lastEstimate.tierLabel}`,
      lastEstimate.freqLabel,
      lastEstimate.addons.length
        ? `add-ons: ${lastEstimate.addons.map((a) => a.name).join(", ")}`
        : null,
    ].filter(Boolean);
    msg.value = `${parts.join(", ")} (online estimate $${lastEstimate.total})`;
  }
  const mapped = SERVICE_OPTION_FOR_TYPE[lastEstimate.typeLabel];
  if (mapped) document.getElementById("q-service").value = mapped;
});

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

// Carry the chosen plan into the quote form
document.querySelectorAll(".js-mem-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = MEMBERSHIPS[btn.dataset.plan];
    const tier = PRICING.tiers[memSize.value];
    const monthly = document.getElementById(`mem-${btn.dataset.plan}-mo`).textContent;
    const msg = document.getElementById("q-msg");
    if (!msg.value) {
      msg.value = `${plan.label} membership — ${tier.label} (${monthly}/month)`;
    }
    document.getElementById("q-service").value = "Standard / Recurring";
  });
});

// ---------- Square payment buttons ----------
// Paste your Square payment links into the data-square-link attributes
// in index.html (see README.md). Until then, buttons lead to the quote form.
document.querySelectorAll(".js-square-btn").forEach((btn) => {
  const link = btn.dataset.squareLink;
  if (link) {
    btn.href = link;
    btn.target = "_blank";
    btn.rel = "noopener";
  }
});

// ---------- Quote / 20% off form ----------
// Delivers via FORM_BACKEND_URL when configured; otherwise opens the
// visitor's email app (mailto). See README.md.
const quoteForm = document.getElementById("quote-form");
const quoteStatus = document.getElementById("quote-status");

quoteForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("q-name").value.trim();
  const phone = document.getElementById("q-phone").value.trim();
  const email = document.getElementById("q-email").value.trim();
  const city = document.getElementById("q-city").value;
  const service = document.getElementById("q-service").value;
  const msg = document.getElementById("q-msg").value.trim();

  if (!name || !phone || !email) {
    quoteStatus.textContent = "Please fill in your name, phone, and email so we can reach you.";
    quoteStatus.className = "offer__fine is-error";
    return;
  }

  const subject = `20% off quote request — ${name} (${city})`;

  try {
    const sent = await sendToBackend({
      _subject: subject,
      name, phone, email, city, service,
      notes: msg || "(none)",
      form: "quote",
    });
    if (sent) {
      quoteForm.reset();
      quoteStatus.textContent = "Request sent! We'll text or email your quote shortly. 🎉";
      quoteStatus.className = "offer__fine is-success";
      return;
    }
  } catch {
    quoteStatus.textContent =
      `Something went wrong sending your request — please call or text us at (951) 593-8266, or email ${BUSINESS_EMAIL}.`;
    quoteStatus.className = "offer__fine is-error";
    return;
  }

  const body = [
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `City: ${city}`,
    `Service: ${service}`,
    msg ? `Notes: ${msg}` : null,
    "",
    "Sent from the Bright & Tidy website quote form.",
  ]
    .filter(Boolean)
    .join("\n");

  window.location.href =
    `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  quoteStatus.textContent =
    "Almost done — your email app just opened with your request. Hit send and we'll reply with your quote!";
  quoteStatus.className = "offer__fine is-success";
});

// ---------- Call-back modal ----------
const cbModal = document.getElementById("callback-modal");
const cbStatus = document.getElementById("cb-status");

document.getElementById("callback-open").addEventListener("click", () => {
  cbStatus.className = "callback__status";
  cbModal.showModal();
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

  const subject = `Call-back request — ${name || phone}`;

  try {
    const sent = await sendToBackend({
      _subject: subject,
      phone,
      name: name || "(not given)",
      form: "call-back",
    });
    if (sent) {
      document.getElementById("callback-form").reset();
      cbStatus.textContent = "Got it! We'll call or text you back shortly. 📞";
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
