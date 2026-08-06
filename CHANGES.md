# Change Report — Feature & Fix Batch (August 2026)

**Branch:** `feature/local-changes-2026-08`
**Deploys to:** production (`main`)

This batch adds customer-facing/admin features, fixes several dark-theme defects,
fixes a product-page stock-count display bug, and changes home-page category
interaction to navigate to dedicated category pages. No database schema changes, no
data migrations. Backend source logic is unchanged — the only backend edit is one
added npm script.

---

## 1. Dark Theme — Defects Fixed

Continuation of commit `99e8e96` ("fix: issue of changing from light to dark theme").

- **Flash of light theme on load (FOUC)** — `frontend/index.html`: a small blocking
  script in `<head>` applies the saved theme class before first paint, wrapped in
  `try/catch` so private-browsing `localStorage` errors can't break page load.
- **Duplicated theme logic → shared hook** — `frontend/src/hooks/useDarkMode.js` (NEW):
  one hook consumed by both the storefront `Header` and admin `DashboardHeader`, with
  cross-tab sync via a `storage` listener and safe `localStorage` persistence.
  `App.jsx` drops the now-redundant effect.
- **Analytics charts unreadable in dark mode** — `AnalyticsDashboard.jsx`: Recharts
  renders to SVG and cannot read Tailwind `dark:` classes, so a `chartTheme` object
  (driven by `useDarkMode`) themes grid lines, ticks, hover cursor, tooltips, legends,
  and dot strokes across all four charts.
- **Stat card contrast** — `StatCard.jsx`: dark variants for icon colours and the
  "vs last month" caption.
- **Analytics heading** — `AnalyticsDashboard.jsx`: added `dark:text-white`.

## 2. Global Product Search — NEW

The backend `GET /api/products/search` endpoint already existed and was deployed, but no
frontend called it.

- `frontend/src/pages/SearchResultsPage.jsx` (NEW) — route `/search?q=…`: server-side
  search, sort (relevance / price / rating / newest), filters (category, gender, max
  price), result count, loading skeletons, error + empty states, dark-mode styled,
  `noindex`.
- `Header.jsx` — desktop search field plus a collapsible search bar for mobile/tablet.
- `App.jsx` — registered the public `/search` route.

SPA routing is safe: `frontend/vercel.json` rewrites `/(.*) → /index.html`.

## 3. "Recommended for You" on My Orders — NEW

The backend `GET /api/products/recommendations` endpoint also already existed but was
never called.

- `MyOrdersPage.jsx` — a recommendations row below the orders list, reusing `ProductCard`.
  Fetch failures are swallowed, so the section can never break the orders page.

## 4. Admin — Inline Restock & Low-Stock Filter

`OwnerDashboard.jsx`:

- Exact stock counts in the products table (was a binary In/Out badge), colour-coded.
- Inline stock editing (number input, save/cancel, Enter/Escape, spinner) that sends
  `{ stock }` only — a partial update, leaving all other fields untouched.
- Low-stock count chip in the header and a "Low stock only" filter toggle.
- **Age-group products handled correctly:** the `Product` `pre('save')` hook recomputes
  top-level `stock` as the sum of per-age-group stock, so a direct `{ stock }` write is
  overwritten for those products. The inline editor therefore only offers free-text
  editing for simple products; age-group products show the derived total and a button to
  the edit modal.

## 5. Product Detail — Stock Count Display Fix

`CategoryProductDetailPage.jsx`:

- **Before:** age-group products showed "Out of stock" (and disabled Add-to-Cart) until
  an age group was selected, because `currentStock` was hard-forced to `0`.
- **Now:** shows the **full total stock** upfront (e.g. `12 in stock total`), and the
  **specific age group's count** after selection (e.g. `4 in stock`). The "Sold Out"
  badge only shows when the entire product is out. Add-to-Cart is enabled when stock
  exists; clicking without a selection still prompts for an age group. Selecting a group
  resets quantity to 1.

Frontend-only; the total is derived from per-age stock the backend already stores.

## 6. Home Page — Category Click Navigates to Category Page

`HomePage.jsx` (+ reuses the existing `CategoryPage.jsx` and `/category/:slug` route):

- **Before:** clicking a category (the "Shop by Collections" cards or the filter-bar
  category pills/select) filtered the product list *in place* on the home page.
- **Now:** clicking a category **navigates** to a dedicated category page
  (`/category/:slug`) that lists only that category's products. The old in-place
  category pills (desktop), category `<select>` (mobile), category URL sync, and the
  subcategory chip row were removed from the home page — that browsing now lives on the
  category page, which already has its own subcategory filter.
- `CategoryPage.jsx` already provides a **"Back to Home" button** and a **fully
  responsive** layout (2-col on mobile → 3-col `sm` → 4-col `md`, responsive hero and
  typography). Navigation uses the category's `slug` from the API, with a kebab-case
  fallback derived from the name for the hardcoded placeholder categories.
- The home page keeps its other in-place filters (search, price, gender, age group) for
  the "Featured Products" grid; only category selection now routes away.

No backend calls changed — `CategoryPage` uses the same public `GET /api/products` and
`GET /api/categories` endpoints already in production.

## 7. Backend — One npm Script

`backend/package.json`: added a `dev:local` script for running the server locally with a
git-ignored `.env.local` override. `start` (production) and dependencies are unchanged,
so backend behaviour and deploys are unaffected.

---

## Verification

- `vite build` — passes.
- ESLint — at the pre-existing baseline (24 problems, all pre-existing; the bulk are a
  `motion`-used-in-JSX false positive). Zero new issues introduced.
- Backend `node --check` on all tracked `.js` — passes.

Not verified in a browser — build/lint/static-analysis only. Recommended manual checks:
theme toggle on storefront + admin (and a hard reload in dark mode to confirm no flash),
header search on desktop + mobile, analytics tab in dark mode, admin inline restock, and
an age-group product's stock count before/after selecting a group.
