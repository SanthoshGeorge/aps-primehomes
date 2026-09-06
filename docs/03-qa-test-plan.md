# APS PrimeHomes — Property Manager
## Phase 4: QA & Verification (AIDLC — QA)

Status: **Automated checks complete — manual checks pending live deployment**

## 1. Automated checks (run in the build environment, 2026-09-06)

| Check | Command | Result |
|---|---|---|
| Dependency install | `npm install` | Passed. One security advisory was surfaced (Next.js 14.2.15, React Server Components DoS/source-exposure — CVE-2025-55183/55184/67779) and fixed by pinning `next`/`eslint-config-next` to the patched `14.2.35` before proceeding. |
| Production build (compiles + full TypeScript check across the app) | `next build` | Passed — all 8 routes compiled, no type errors. |
| Lint | `next lint` (next/core-web-vitals) | Passed — no warnings or errors. |
| Type-check the Netlify scheduled function (excluded from the main Next.js `tsconfig` since it's a separate runtime) | `tsc --noEmit` against `netlify/functions/lease-check.mts` | Passed. |

These confirm the code is internally consistent (types line up between the DB schema, the
Server Actions, and the components) and free of the known Next.js vulnerability. They do **not**
confirm the app works against a real Supabase project — that needs the manual pass below, which
requires the accounts created during deployment (§3 of the README).

## 2. Manual test plan — run this once, right after first deploy

Walk through as each of the 3 owners where noted; otherwise any one owner is enough.

1. **Invite-only auth**
   - [ ] Confirm Supabase's public sign-up toggle is off (Authentication → Providers → Email).
   - [ ] Each of the 3 invite emails arrives and its link signs the owner in and lands on
         `/update-password`.
   - [ ] After setting a password, signing out and back in with email+password works.
   - [ ] Visiting the site while signed out redirects to `/login` (try `/`, `/properties/new`,
         and a `/properties/<id>` URL directly).

2. **Properties**
   - [ ] Add a property from `/properties/new` — lands on its detail page.
   - [ ] It appears on the dashboard with a "Vacant" badge (no lease yet).
   - [ ] Edit its nickname/address/type/date on the detail page and confirm it saves.
   - [ ] Archive it — disappears from the default dashboard, appears under "View archived."
   - [ ] Restore it — reappears in the active list.

3. **Lease & notification logic**
   - [ ] Add a lease with an end date **more than 60 days out** → dashboard badge shows
         "Active."
   - [ ] Edit the same property's lease end date to **within 60 days** (e.g. 30 days out) →
         badge changes to "Expiring soon."
   - [ ] Set an end date in the past → badge shows "Expired."
   - [ ] "Mark vacant" clears the current lease and the badge returns to "Vacant"; the old
         lease still shows under "Lease history."
   - [ ] Add a second lease (a renewal) — the old one moves into history, the new one becomes
         current.
   - [ ] In Supabase Table Editor, manually set a test lease's `end_date` to 45 days from today
         and `notified_expiry` to `false`, then in Netlify manually trigger the `lease-check`
         function (Functions tab → select it → "Trigger function," or wait for its next daily
         run). Confirm: all 3 owners receive the email, and `notified_expiry` flips to `true` /
         a row appears in `notification_log`. Confirm a second manual trigger does **not**
         re-send it (already notified).

4. **Keys, mortgage, insurance, HOA, utilities, contacts**
   - [ ] Fill in each section once and reload the page — values persist.
   - [ ] Keys & garage opener "held by" dropdowns list all 3 owners by name.
   - [ ] Add two utility accounts and one service contact; remove one of each — list updates
         without a full page reload.

5. **Multi-owner access**
   - [ ] A second owner signs in and sees the same properties and data (shared, not
         per-owner-siloed), and can edit a section the first owner filled in.
   - [ ] Each owner can rename themselves under Settings, and that name is what shows up in the
         key-holder dropdowns going forward.

6. **Cost / infra sanity**
   - [ ] Netlify site shows on the free plan with no payment method required.
   - [ ] Supabase project shows on the Free tier.
   - [ ] Brevo account shows on the Free plan with the sender verified.

## 3. Known limitations (by design, not bugs)

- No document/file upload yet (v1 scope — see requirements doc §7).
- Netlify Hobby-tier cron timing can drift by up to ~1 hour; irrelevant given the 60-day check
  window.
- All 3 owners have equal edit rights on everything, including each other's entries — matches
  the requirement that all co-owners have equal access.

## 4. Sign-off

Pending Santhosh completing the manual pass above after first deployment.
