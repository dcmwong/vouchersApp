# Handoff: Family Wallet (gift & loyalty voucher app)

## Overview
**Family Wallet** is a mobile-first app for storing **gift cards and loyalty cards** that a household shares (Mum, Dad, Kids). The home screen is a **coverflow carousel** of cards; tapping a card opens a **full-screen redeem view** with a scannable QR + barcode and a toggle to switch between the gift card and that brand's **loyalty card**. Users can **update a card's balance**, **hide** a card (it disappears from the carousel but can be restored), and **add a new voucher**.

Platform target: **web, mobile-first** (designed at a 402×874 iPhone viewport; may later become a native app).

## About the Design Files
The files in this bundle are **design references created in HTML/React (via in-browser Babel)** — a working prototype that demonstrates the intended look, layout, and behaviour. **They are not production code to copy directly.** The task is to **recreate these designs in the target codebase's environment** using its established patterns and libraries (e.g. React + your component library, React Native, SwiftUI, Flutter, etc.). If no codebase exists yet, pick the most appropriate framework (React + Vite or React Native are both natural fits for a mobile-first wallet) and implement there.

A few prototype-only details to drop when productionising:
- The `IOSDevice` bezel/status bar (`ios-frame.jsx`) is a presentation frame — render your screens fullscreen instead.
- The `TweaksPanel` (`tweaks-panel.jsx`) is a design-exploration tool for swapping palette/font live — **not** an app feature. The palette/font it exposes are the theming knobs; pick the chosen defaults (below) and bake them in (or expose as real settings if desired).
- QR/barcodes are **decorative pseudo-generators** (deterministic noise + finder squares). Replace with a real barcode/QR library (e.g. `bwip-js`, `qrcode`) rendering the card's actual `code`.
- State is in-memory React state with seed data. Wire to your real persistence/backend.

## Fidelity
**High-fidelity.** Final colours, typography, spacing, radii, and interactions are all specified below and in the files. Recreate pixel-accurately using your codebase's libraries.

---

## Design Tokens

### Colour — theme (default palette "Coast")
The app theme is driven by CSS variables. Defaults:
| Token | Value | Use |
|---|---|---|
| `--va-accent` | `#2C6FE0` | primary buttons, FAB, logo accents, active dots/toggles |
| `--va-accent2` | `#17A06A` | secondary accent (e.g. "Undo" link) |
| `--va-bg` | `#F6F1E7` | app background (warm off-white) |
| `--va-surface` | `#FFFFFF` | cards/sheets/menus, fields |
| `--va-ink` | `#2A211B` | primary text (warm near-black) |
| `--va-soft` | `rgba(42,33,27,0.55)` | secondary text |
| `--va-line` | `rgba(42,33,27,0.13)` | borders/dividers, inactive dots |
| `--va-chip` | `rgba(42,33,27,0.065)` | chip/segment track / list-row backgrounds |

Alternate palettes the prototype offered (each `[accent, accent2, bg]`) — keep Coast unless told otherwise:
- Coast `#2C6FE0 / #17A06A / #F6F1E7`
- Harvest `#C2683F / #2F8A82 / #F8F2E8`
- Berry `#8A4FB0 / #D9568A / #F8F1F4`
- Forest `#2E7D54 / #CC8A2B / #F2F2E7`

### Colour — brands (each card's own colour; independent of theme)
| Brand | Tag | Card colour | Loyalty scheme |
|---|---|---|---|
| Tesco | SUPERMARKET | `#00539F` | Clubcard |
| Sainsbury's | SUPERMARKET | `#EE7203` | Nectar |
| M&S | FOOD & HOME | `#00482B` | Sparks |
| Greggs | BAKERY | `#00263A` | Greggs Rewards |
| Boots | HEALTH & BEAUTY | `#05054B` | Advantage Card |
| Costa Coffee | COFFEE | `#6E1A33` | Costa Club |
| Argos | HOME & TECH | `#C9151B` | — |
| Waterstones | BOOKS | `#14352A` | — |
| Nando's | DINING | `#C4122E` | — |

Family member accent colours: Mum `#C2683F`, Dad `#3F6B5E`, Kids `#8E5B86`, Everyone `#6B7280`.

> **Brand note:** these are real retailer *names* used as voucher issuers (descriptive, like any real wallet app). The marks are **plain letter monograms** and the colours are **approximations** — do **not** reproduce the retailers' actual trademarked logos. Swap in officially-licensed assets only if you have rights.

### Typography
Default family **Nunito** (Google Fonts) for both headings (`--va-head`) and body (`--va-body`). Headings use weight **800**; body **500–600**. Alternate families offered: Plus Jakarta Sans, Hanken Grotesk, Quicksand (head) + Nunito (body). Numbers use `font-variant-numeric: tabular-nums`.

Type scale (px): screen title 27/800; section title 18–20/800; big balance 38–46/800; body 14–16; labels 12.5–13.5/600; micro/eyebrow 9.5–11 uppercase with `letter-spacing: 0.14–0.16em`.

### Radius
Cards `24`, redeem hero bottom corners `30`, sheets/menus `18`, fields/buttons `13–14`, monogram tiles `11–14`, QR container `16`, pills/chips `999`.

### Shadow
- Elevated (centre) card: `0 24px 50px -14px rgba(40,25,15,0.5), 0 2px 6px rgba(0,0,0,0.12)`
- Side cards: `0 8px 22px -8px rgba(40,25,15,0.4)`
- FAB: `0 12px 26px -6px var(--va-accent), 0 3px 8px rgba(0,0,0,0.22)`
- Menu/popover: `0 18px 50px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)`
- Toast: `0 12px 30px rgba(0,0,0,0.28)`

### Spacing
Screen horizontal padding `20–22`. Header top padding `~58` (clears the status bar). Full-screen views: top padding `56`, bottom padding `30 + safe-area`.

---

## Data Model
```ts
type Family = { id: 'mom'|'dad'|'kids'|'all'; name: string; color: string };

type Brand = {
  key: string; brand: string; tag: string; color: string;
  loyaltyScheme: string | null;   // e.g. "Clubcard"
};

type Voucher = {
  id: string;
  brandKey: string;               // → Brand
  balance: number;                // GIFT balance in PENCE
  code: string;                   // gift card number, e.g. "7041 8826 3390 1182"
  owner: 'mom'|'dad'|'kids'|'all';// 'all' = shared with everyone
  active: boolean;                // false = hidden from carousel
  loyalty: { code: string; points: number } | null; // attached loyalty card
};
// A "hydrated" voucher = Brand fields merged onto the Voucher instance.
```
Money helper: `£` + `(pence/100).toFixed(2)`. Currency is **GBP**.

---

## Screens / Views

### 1. Home (`VoucherApp`)
- **Layout:** vertical flex. Header (fixed) → carousel (flex-fill, vertically centred) → caption+dots grouped under the cards. A floating **+** button bottom-right.
- **Header:** left = **logo** (V-ticket emblem `logo.png` at ~36px tall + wordmark "Family Wallet" 17px/800). Right = two controls in a row, gap 10: a **Hidden-cards button** (40px circle, outline, clock icon, numeric badge = hidden count) and a **profile avatar** (42px circle, Google-style grey head-and-shoulders silhouette, 2px surface border + 1px line ring). Below header: subtitle `"{n} cards · shared with the family"` (13.5px, soft).
- **Carousel (coverflow):** card size **214×314**, portrait. For each card, `offset = i - index`; cards with `|offset| > 2` are hidden. Transform per card:
  `translateX(offset*56%) translateZ(offset===0 ? 0 : -120px) rotateY(offset*-20deg) scale(1 - |offset|*0.08)`; `z-index: 10-|offset|`; `opacity: |offset|>1 ? 0.5 : 1`; transition `transform .42s cubic-bezier(.2,.8,.25,1), opacity .42s`. Container has `perspective: 1100px`. Centre card has the elevated shadow; non-centre cards get a dark dim overlay (`rgba(20,12,8,0.30)`).
  - Tap **centre** card → open Redeem. Tap a **side** card → set it as centre.
  - **Swipe** left/right (pointer drag > 42px) navigates; left/right round chevron arrows appear when there's a prev/next.
- **Caption:** brand name (18/800) + `"Tap to redeem · £{balance}"` (13, soft) + **dot indicator** (active dot is a 22×7 pill in `--va-accent`; others 7×7 in `--va-line`; tap a dot to jump).
- **Voucher card face:** colour = brand colour, white text, radius 24, padding `22 22 20`. Tonal gradient overlay `linear-gradient(150deg, rgba(255,255,255,.22), transparent 42%), linear-gradient(330deg, rgba(0,0,0,.3), transparent 55%)`. Contents: top row = **monogram tile** (38px, radius 11, white 0.94 bg, brand-colour initial) + **"Gift card"** pill (rgba white .2). Then brand name (20/800, nowrap) + tag (9.5, .16em). Pushed to bottom: "BALANCE" eyebrow + balance (38/800). Bottom-right: owner **avatar** (26px). Footer row: masked code `•••• {last4}` (mono 12) + loyalty chip (`● {scheme}`) if a loyalty card is attached.
- **FAB:** 58px circle, `--va-accent`, white +, bottom-right (`right:18`, `bottom: 30 + safe-area`). Hidden while any full-screen view is open.

### 2. Redeem (full-screen) — `RedeemFull`
- **Enter:** slides up a touch + fades (transition only; base state is fully visible — see "Animation gotcha").
- **Hero** (brand-colour block, white text, bottom radius 30): back **"‹ Wallet"** pill (translucent white) top-left; **"{Owner}'s"** label + owner avatar top-right (or "Shared" for `all`). Then monogram (48px) + brand (24/800) + state eyebrow (`GIFT CARD` or scheme name). Then big value: gift = `£{balance}` (46/800) under "BALANCE"; loyalty = `{points} pts` under "POINTS".
- **Loyalty toggle** (only if the voucher has a loyalty card): a 2-segment control on a `--va-chip` track with a sliding white thumb (`transition: left .22s`). Segments: **"Gift card"** | **"{scheme}"**. Selecting switches which `code` and value the screen shows.
- **Code panel** (centred on `--va-bg`): pseudo-**QR** (184px, white card, radius 16) → **"SCAN AT CHECKOUT"** eyebrow → **barcode** (height 64) → full code string (mono). The code shown is the gift `code` or the `loyalty.code` depending on the toggle.
- **Actions** (bottom row): **"Update balance"** (outline; shown only on the gift side) + **"Hide card"** (danger outline on gift side, plain outline on loyalty side).
- Close via the back pill.

### 3. Amount editor (modal) — `AmountEditor`
Centred card over a `rgba(20,12,8,0.5)` scrim. Title "Update balance", subtitle "{brand} gift card". Big `£` + editable numeric input (46/800, centred). Quick-step buttons: `-5 -1 +1 +5 +10`. **Cancel** (outline) / **Save** (primary). Save writes `balance = round(value*100)` and shows a "Balance updated" toast.

### 4. Add a voucher (full-screen) — `AddVoucher`
Header: **Cancel** (left) · "Add a voucher" (centre, nowrap) · spacer. Body:
- **Choose a brand** — 3-column grid of brand tiles (monogram 36px + name); selected tile gets a 2px `--va-ink` border.
- **Amount (£)** input + **Card number** input (row; fields 50px tall, radius 13, outline).
- **Shared with** — 4 tiles (Mum/Dad/Kids/Everyone) with avatar + name; selected = 2px ink border.
- If the chosen brand has a loyalty scheme: a **"Add {scheme}"** toggle (iOS switch) revealing a loyalty-number field.
- Bottom: **"Add to wallet"** primary button, full-width, disabled (opacity .4) until a brand is chosen **and** amount > 0. On submit, prepend the new (hydrated) voucher, jump carousel to index 0, toast "{brand} added".

### 5. Hidden cards (full-screen) — `HiddenView`
Header: **Done** · "Hidden cards" · spacer. Helper line. List of hidden vouchers: each row = monogram (42) + brand + balance + **Restore** button (pill, accent). Empty state: "Nothing hidden."

### 6. Account menu (popover) — `AccountMenu`
Opens from the profile avatar; anchored top:104 right:18, width 248, radius 18, menu shadow, `va-menu` scale-in (.16s). Contents: profile silhouette + "The Family" + "family@wallet.app"; row of family avatars (Mum/Dad/Kids); divider; rows **"Hidden cards" (count)** → opens HiddenView, **"Invite family"**, **"Sign out"** (last two are placeholders). Full-screen invisible backdrop closes it.

### 7. Toast
Bottom, `--va-ink` bg, `--va-bg` text, radius 14. Message + optional **Undo** link (`--va-accent2`). Auto-dismiss ~4.2s. Used by: balance updated, card hidden (with Undo → restore), voucher added.

---

## Interactions & Behavior
- **Navigation:** tap centre card → Redeem; tap side card → recentre; swipe / arrow buttons / dots → change index.
- **Update balance:** Redeem → "Update balance" → AmountEditor → Save.
- **Hide / restore:** Redeem → "Hide card" sets `active=false`, closes Redeem, clamps the carousel index, shows undoable toast. Restore from the toast, the Account menu's "Hidden cards", or the header clock button.
- **Add:** FAB (or Account menu has none for add) → AddVoucher → "Add to wallet".
- **Loyalty toggle:** swaps the displayed code/value between gift and loyalty within Redeem.
- **Index safety:** when the active list shrinks, clamp `index` into range.

### Animation gotcha (important)
Entrance motion uses a **transition triggered after mount** (double-`requestAnimationFrame` to flip a `reveal` flag), **not** CSS `@keyframes`, and the **base/un-revealed state is fully visible** (only a small `translateY`/scale offset). This is deliberate: keyframes that start at `opacity:0`/off-screen get **paused in throttled/background tabs** and can strand content invisible. Keep this pattern (or your framework's mount-transition equivalent) so a redeem/sheet can never render blank.

### Stacking (iOS-correct)
The app root is a stacking context (`isolation: isolate`) so the device status bar stays above full-screen views. z-index ladder inside the app: cards `≤10`, FAB `30`, full-screen views `40`, account menu `75`, amount-editor scrim `80`, toast `90`.

## State Management
In-memory (lift to your store/server as needed):
`vouchers[]` (hydrated, with `active`), `index` (carousel position), `openId` (redeem target | null), `addOpen`, `hiddenOpen`, `accountOpen`, `editing` + `draft` (amount editor), `showLoyalty` (redeem toggle), `toast {msg, undo?}`. Derived: `active = vouchers.filter(active)`, `hidden = vouchers.filter(!active)`.

## Assets
- `logo.png` — the **Family Wallet** emblem (a "V" built from two ticket halves + a star), supplied by the client; background was knocked out to transparency and cropped tight (233×183). Use as-is, or have the client provide a vector (SVG) for crisp scaling.
- Brand marks are **letter monograms** (first letter of the brand name) on a white tile — no image assets.
- Icons (chevrons, clock, +, person, invite, sign-out) are inline SVG strokes; reuse your icon set.
- Fonts via Google Fonts: Nunito (default), Plus Jakarta Sans, Hanken Grotesk, Quicksand.

## Files (in this bundle)
- `Family Wallet.html` — entry; loads React 18 + Babel, Google Fonts, mounts the app in the device frame, defines theme palettes/fonts + the Tweaks panel.
- `main.jsx` — theme variables, viewport fit-scaling, Tweaks wiring, mounts `<VoucherApp/>`.
- `voucher-data.js` — `FAMILY`, `BRANDS`, seed `VOUCHERS`, `hydrate()`, `money()`, and the pseudo QR/barcode generators (**replace generators with a real library**).
- `voucher-ui.jsx` — `Logo`/`LogoMark`, `Monogram`, `QRCode`, `Barcode`, `Avatar`, `VoucherCard`.
- `voucher-app.jsx` — `VoucherApp` (home + state), `RoundBtn`, `NavArrow`, `ProfileBtn`, `AccountMenu`, the FAB.
- `voucher-detail.jsx` — `RedeemFull`, `AmountEditor`, `AddVoucher`, `HiddenView`, `useReveal`.
- `ios-frame.jsx`, `tweaks-panel.jsx` — prototype scaffolding (device bezel + design tweak panel); **not** app features.
- `logo.png` — app logo (transparent).
```
