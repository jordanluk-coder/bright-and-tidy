/* =========================================================
   Bright & Tidy Home Cleaning — page.js

   Landing pages (/services/… and /house-cleaning/…) only need a slice of
   main.js: the mobile nav, the HouseCall Pro booking trigger, click-to-call
   tracking and the footer year. main.js is deliberately NOT loaded here —
   it binds the estimator and membership widgets at the top level, which
   only exist on the homepage.

   Conversion IDs and the phone number mirror main.js; keep them in sync.
   ========================================================= */

const CONVERSIONS = {
  clickToCall: "AW-18326347594/q-4OCK2Wn9gcEMq-16JE",
};

function trackConversion(sendTo) {
  if (typeof gtag !== "function") return;
  gtag("event", "conversion", { send_to: sendTo });
}

// ---------- Mobile navigation ----------
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  siteNav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- Online booking (HouseCall Pro) ----------
// Same delegated pattern as main.js. The widget script loads async, so poll
// briefly before falling back — here the fallback is the homepage booking
// section, since landing pages don't carry the call-back modal.
document.addEventListener("click", (e) => {
  const trigger = e.target.closest(".js-hcp-book");
  if (!trigger) return;
  e.preventDefault();

  let tries = 0;
  (function openWidget() {
    if (window.HCPWidget && typeof window.HCPWidget.openModal === "function") {
      window.HCPWidget.openModal();
    } else if (tries++ < 20) {
      setTimeout(openWidget, 150);
    } else {
      window.location.href = "/#book";
    }
  })();
});

// ---------- Click-to-call tracking ----------
document.addEventListener("click", (e) => {
  if (!e.target.closest('a[href^="tel:"]')) return;
  trackConversion(CONVERSIONS.clickToCall);
});

// ---------- Footer year ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
