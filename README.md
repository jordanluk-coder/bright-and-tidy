# Bright & Tidy Home Cleaning — Website

A fast, single-page website for Bright & Tidy Home Cleaning (Hemet, CA), serving
Lake Elsinore, Menifee, Murrieta, and Temecula.

**No build step needed** — it's plain HTML/CSS/JS. Open `index.html` in a browser
to view it, or upload the whole folder to any web host.

```
index.html        ← the whole site
css/styles.css    ← design (colors pulled from your logo)
js/main.js        ← estimate calculator, quote form, mobile menu
assets/           ← your logos
```

---

## ✅ Before you launch — replace these placeholders

*(Already done: phone number (951) 593-8266 and the brightandtidyco.com domain
are wired into the contact links and SEO metadata.)*

1. **Reviews** — the reviews section currently shows a "please leave us a
   review" invitation instead of reviews. Two things to do as they roll in:
   - When you set up your **Google Business Profile**, copy your review link
     (Profile → "Ask for reviews") and paste it into the `data-review-link=""`
     attribute in `index.html` — the "Review us on Google" button will appear
     automatically (it's hidden while the link is empty).
   - Once you have 2–3 real customer reviews, they can be added back as cards
     in this section (the styling for review cards is already in the CSS).

2. **Prices** — pulled from your `Bright-and-Tidy-Pricing real.xlsx`
   (Price List tab) on 2026-07-14. The estimator mirrors the sheet's Quote
   Calculator: tiered rates by home size, frequency discounts on standard
   cleans only (weekly 20% / bi-weekly 15% / monthly 10% / one-time +20%),
   and the seven add-ons. If the spreadsheet changes, update:
   - Calculator + add-on prices: the `PRICING` object at the top of `js/main.js`
     **and** the add-on checkbox values in `index.html` (search `est-addons`)
   - "From" package prices &amp; the add-ons grid: in `index.html`
     (search `plan__price` and `addons__grid`)
   - Memberships (mirrors the sheet's Membership Plans tab): computed live from
     `PRICING` standard rates — visits/month live in the `MEMBERSHIPS` object in
     `js/main.js` (monthly 1, bi-weekly 2.17, weekly 4.33)

   **Membership payments tip:** Square supports recurring billing — in your
   Square Dashboard look for *Subscriptions* (or use recurring Invoices) to
   charge members monthly, matching the site's membership prices.

3. **Email** — the site shows `info@brightandtidyco.com` everywhere (contact
   links, quote form, search metadata). ⚠️ **That address must exist before
   launch** or visitor emails will bounce. Set it up as an alias/forward to
   `jordan.luk@brightandtidyco.com` wherever your domain's email is hosted —
   this takes ~2 minutes and is free on all of these:
   - **Google Workspace:** Admin console → Directory → Users →
     your user → *Add alternate emails* → add `info`.
   - **Microsoft 365:** Admin center → Users → Active users →
     your user → *Manage username and email* → add `info` as an alias.
   - **Domain registrar email (GoDaddy, Namecheap, etc.):** look for
     *Email Forwarding* in the domain's DNS/email settings and forward
     `info@brightandtidyco.com` → `jordan.luk@brightandtidyco.com`.

   Replies you send will come from your main address unless you also enable
   "send as" for the alias (both Google and Microsoft support this).

---

## 💳 Square — fully configured ✅

**Online booking (primary):** the header "Book Online" button and all three
pricing "Book…" buttons open the Square Appointments booking page
(`https://app.squareup.com/appointments/book/7bcyuyt6g1f9l9/LX3E49911ABSN/start`,
set via `data-square-link` in `index.html`). Customers pick the service, home
size, and an open time slot; Square collects a **$50 deposit** and saves their
card on file. Configured in Square: three services × five home-size variations
(prices mirror the Price List), 1-day cancellation cutoff with the policy text,
deposit rule on all services, card on file, and client self-rescheduling.

- **Charging the balance after a clean:** open the appointment in the Square
  app → charge the remainder to the card on file (one tap).
- **Blocking days off:** Square app → Calendar → add a Personal Event or edit
  your hours — blocked time never shows to customers.
- **The old $50 payment link** (`https://square.link/u/QOSsJGtU`) still works —
  handy for text-to-pay when someone books by phone instead.
- **Memberships:** use Square **recurring invoices** (Dashboard → Invoices →
  Recurring) — set each member up once and Square auto-bills monthly.

> 🔐 **Security note:** never share your Square password with anyone — no
> legitimate service or developer needs it. Since it was shared in chat while
> setting up this site, please change it in Square → Account → Sign-in & security.

---

## 📬 Making the forms deliver to your inbox

The site has two lead forms: the **"20% off" quote form** and the **"Get a call
back" pop-up** (hero button — visitors leave their number for you to call or
text back from your business line).

Both are wired to **FormSubmit** (free, no account) via the `FORM_BACKEND_URL`
line at the top of `js/main.js` — submissions are emailed to the address in
that URL, labeled "quote" or "call-back", and visitors see a success message
on the page.

**One-time activation:** the first submission triggers a confirmation email
from FormSubmit to that address — click **Activate** in it and delivery is on.
The activation email also contains a **random alias string**; replacing the
plain email address in `FORM_BACKEND_URL` with that alias hides the address
from bots reading the page source (recommended).

If `FORM_BACKEND_URL` is ever set to `""`, both forms fall back to opening the
visitor's email app pre-filled via `mailto:`.

---

## 🌐 Putting it online

Any static host works. Easiest options:

- **Netlify** (free): drag-and-drop the `bright-and-tidy-website` folder at
  [app.netlify.com/drop](https://app.netlify.com/drop) — live in ~30 seconds.
- **GitHub Pages** (free): push this folder to a repo → Settings → Pages.
- **Square Online**: since you have Square, note that Square also offers simple
  websites — but this custom site is faster and fully yours; you can still use
  Square purely for payments.

Then connect your domain `brightandtidyco.com` in your host's settings
(both Netlify and GitHub Pages walk you through adding the DNS records at your
domain registrar — it's usually two records and takes effect within an hour).

---

## 🎨 Design notes

- Colors are sampled directly from your logo: brand blue `#185FA5`, sparkle
  blue `#378ADD`, charcoal `#1F2421`, on a warm cream background.
- Layout combines your three reference designs: the warm welcoming layout with
  an instant-estimate widget, blue trust accents with a top contact bar and
  pricing packages, and a dark elegant "why choose us" section.
- To add real photos later (recommended once you have them), the service cards'
  gradient headers (`.service__art`) are the natural spot to swap in images.
