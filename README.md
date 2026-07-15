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

1. **Sample reviews** — the three reviews in the "What neighbors are saying"
   section are **placeholders written to show the design**. Replace them with
   real reviews from real customers before going live (each one is marked with
   *"sample review — replace with a real one"* on the page so you can't miss them).

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

## 💳 Connecting Square payments (no developer account needed)

The three "Book…" buttons in the Pricing section are ready for **Square Payment
Links**. You create these yourself in about 2 minutes — no code, and you never
need to share your Square login with anyone:

1. Sign in at [squareup.com](https://squareup.com) → open your **Dashboard**.
2. Go to **Payments → Payment Links** (sometimes under *Online Checkout*).
3. Click **Create a link** → choose **Collect a payment** or **Sell an item**.
4. Name it (e.g. "The Deep Clean — deposit"), set the amount, and copy the link
   (it looks like `https://square.link/u/AbCdEfGh`).
5. In `index.html`, find the three buttons marked with this comment:
   `<!-- Replace the href below with your Square payment link for this package -->`
   and paste your link into the `data-square-link=""` attribute, e.g.:

   ```html
   <a href="#quote" class="btn btn--primary btn--block js-square-btn"
      data-square-link="https://square.link/u/AbCdEfGh">Book The Deep Clean</a>
   ```

   That's it — the button will now open Square's secure checkout. Until a link
   is added, the buttons simply scroll to the quote form (nothing breaks).

**Tip:** many cleaning companies take a small booking deposit online and collect
the balance after the clean — payment links work great for that.

**Optional upgrade:** [Square Appointments](https://squareup.com/us/en/appointments)
gives you a full self-serve booking calendar. It has a free plan and provides an
embeddable booking widget / link you could add as a "Book online" button later.

> 🔐 **Security note:** never share your Square password with anyone — no
> legitimate service or developer needs it. Since it was shared in chat while
> setting up this site, please change it in Square → Account → Sign-in & security.

---

## 📬 Making the forms deliver to your inbox

The site has two lead forms: the **"20% off" quote form** and the **"Get a call
back" pop-up** (hero button — visitors leave their number for you to call or
text back from your business line).

Out of the box, both open the visitor's email app pre-filled (works everywhere,
zero setup). **Strongly recommended:** upgrade them to submit silently straight
to your inbox — it takes 5 minutes and one pasted line:

1. Create a free account at [formspree.io](https://formspree.io) (free plan:
   50 submissions/month).
2. Click **New form**, name it "Bright & Tidy website", and copy the endpoint
   URL it gives you (looks like `https://formspree.io/f/abcdwxyz`).
3. Open `js/main.js` and paste it into the line at the very top:

   ```js
   const FORM_BACKEND_URL = "https://formspree.io/f/abcdwxyz";
   ```

That's it — both forms now email you every submission (each one is labeled
"quote" or "call-back" with the visitor's phone number), and visitors see a
success message instead of an email app opening.

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
