# APS PrimeHomes — Property Manager
## Changelog (post-launch)

The requirements and architecture docs (`01-requirements.md`, `02-architecture.md`) capture the
approved v1 baseline and are not rewritten every time something changes. This file is the
running, plain-language record of what's changed since v1 shipped, so it's not necessary to dig
through `git log` to answer "did we build that yet?"

Full detail for any entry is in its git commit message and the architecture doc's data model.

---

### Insurance renewal reminder

An automatic email 30 days before an insurance policy's renewal date, sent to all 3 owners, the
same mechanism as the existing lease-expiry reminder. A `notified_renewal` flag on
`insurance_policies` stops it from repeating, and resets automatically whenever the policy is
edited (most commonly because the renewal date itself just changed).

Originally listed in the requirements doc (§7) as a future enhancement, out of scope for v1.

### Post-launch data cleanups

- All dollar amounts across the app now display through one shared `$`-prefixed input component,
  so formatting is consistent everywhere.
- Past tenant history moved off the main property page onto its own page
  (`/properties/[id]/history`), linked from the current-lease card, so the main page doesn't grow
  as more tenants cycle through.
- Added free-text notes fields to leases and utility accounts.
- Mortgage term is now tracked and entered in years instead of months.

### Branding

A real logo (house icon plus "APS" and "Prime Homes" wordmark) replaced the plain text header in
the nav bar and on the login page. The nav bar was widened and made responsive so it holds up on
mobile screens as well as desktop.

### Self-service password change

A "Change password" link on the Settings page, pointing at the existing (previously undiscoverable)
`/update-password` page. Lets Roshan and Jiju set their own password later without asking Santhosh
to do it for them.

### Collapsible property sections with autosave

The property detail page had grown long with 7 stacked sections. Each is now a collapsible
accordion, all collapsed by default except the current tenant and lease section. The
single-record editable sections (property details, keys and access, mortgage, insurance, HOA)
autosave about 1.2 seconds after you stop typing, or immediately on blur, and also save if you
navigate away mid-edit, so there's no Save button to remember and no lost edits. Add and remove
actions (lease renewals, utilities, contacts, expenses) keep their explicit buttons, since those
create new records rather than edit one in place.

### Property expense tracking

A new `expenses` table and a dedicated `/properties/[id]/expenses` page track maintenance,
repair, and turnover/relisting costs (brokerage fees, cleaning, repairs done to re-list a vacant
unit) per property, by date, category, amount, vendor, and description. Kept on its own page
rather than another section on the property page, reached by a plain "Expenses" link on the
property header. Shows totals for the current year, all time, and a by-category breakdown.

Originally listed in the requirements doc (§7) as "expense/income tracking," out of scope for v1.
Scoped down to expenses only (no income/rent-roll tracking) based on what was actually asked for.

**Deferred for later:** linking an expense to a specific lease/tenant turnover, a cross-property
rollup view, and a "Reports" entry point for running reports per property or across the whole
portfolio.
