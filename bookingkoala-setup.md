# Bright & Tidy — BookingKoala Setup Spec

Everything needed to configure BookingKoala to match the live Square setup.
Hand this to BookingKoala's onboarding/support team (included with your paid
plan) or enter it yourself, section by section.

Account: brightandtidy.bookingkoala.com
Business phone: (951) 593-8266 · Email: info@brightandtidyco.com

---

## 1. Payments — connect Square
- Connect the **existing Square account** as the payment processor (do NOT
  create a new one). Money then lands in the same Square account already in use.
- Require a **card on file** to book.
- Require a **$50 deposit** at booking; the balance is charged after the clean.

## 2. Services & pricing  (the 3 cleans)
Enter these as the **one-time base prices** by home size. BookingKoala applies
the frequency discounts (Section 3) automatically on top — do NOT pre-discount.

| Home size        | Standard | Deep Cleaning | Move In / Out |
|------------------|---------:|--------------:|--------------:|
| 1 bed / 1 bath   | $158     | $180          | $320          |
| 2 bed / 1–2 bath | $194     | $230          | $370          |
| 3 bed / 2 bath   | $238     | $290          | $430          |
| 4 bed / 2–3 bath | $281     | $360          | $500          |
| 5+ bed / 3+ bath | $331     | $430          | $570          |

> Note on the pricing model: BookingKoala prices by bedrooms/bathrooms (often a
> per-count table or additive base + per-bed + per-bath). These are the **target
> prices** to reproduce — the onboarding team can map them to BookingKoala's
> table. Standard's numbers are the recurring baseline × 1.2 (the one-time rate);
> Deep and Move are flat one-time rates.

## 3. Frequencies — ALREADY DONE ✅ (verified, no action needed)
- One-Time — 0%
- Weekly — 20% off
- Every Other Week (bi-weekly) — 15% off  *(set as default)*
- Every 4 Weeks (monthly) — 10% off

## 4. Add-ons / Extras
| Add-on                     | Price | Offer on which services            |
|----------------------------|------:|------------------------------------|
| Inside Refrigerator        | $45   | Standard only (bundled in Deep/Move) |
| Inside Oven                | $45   | Standard only                      |
| Interior Windows           | $75   | Standard only                      |
| Inside Cabinets & Drawers  | $50   | Standard only                      |
| Laundry (per load)         | $25   | All services                       |
| Dishes (per load)          | $25   | All services                       |
| Extra Pet Hair             | $25   | All services                       |

> The 4 "Standard only" extras are already included in Deep Clean and Move
> In/Out, so don't offer them there (avoids double-charging). If BookingKoala
> can't limit an extra to specific services, offer all 7 everywhere and note the
> overlap.

## 5. Service area (ZIP codes — verify your exact coverage)
- Hemet: 92543, 92544, 92545
- Lake Elsinore: 92530, 92532
- Menifee: 92584, 92585, 92586, 92587
- Murrieta: 92562, 92563
- Temecula: 92590, 92591, 92592

## 6. Availability / hours
- **Sunday through Saturday, 9:00 AM – 8:00 PM** (all seven days).

## 7. Cancellation policy (24-hour)
> Reschedule or cancel free of charge up to 24 hours before your appointment —
> your $50 deposit moves to the new date or is refunded in full. Cancellations
> with less than 24 hours' notice (or no access at arrival) forfeit the deposit.
> If we ever cancel on you, you receive a full refund, priority rebooking, and
> 15% off the rescheduled clean.

## 8. Website connection (Claude does this part)
- Once the above is live and tested, get the BookingKoala booking-page link /
  embed (Settings → Design Forms & Website).
- Claude repoints the "Book Online" buttons on brightandtidyco.com to it.
- This is done LAST, so the current Square booking keeps running until the
  BookingKoala flow is confirmed working.

---

## Status
- ✅ Account created, branded, "Home Cleaning" industry pre-loaded
- ✅ Frequencies match exactly (no action needed)
- ⬜ Everything in sections 1, 2, 4, 5, 6, 7 — to enter
- ⬜ Section 8 — Claude handles once the rest is done
