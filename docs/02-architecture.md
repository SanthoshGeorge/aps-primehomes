# APS PrimeHomes — Property Manager
## Phase 2: Architecture & Design (AIDLC — Architect)

Status: **APPROVED** (2026-09-06) — Netlify/Brevo confirmed; repo will be handed over as a private zip for Santhosh to push to GitHub himself.

Builds on the approved [`01-requirements.md`](./01-requirements.md).

## 1. Stack decision

| Concern | Choice | Why |
|---|---|---|
| App framework | Next.js (App Router, TypeScript, Tailwind CSS) | One codebase for UI + API routes; huge free-tier ecosystem support. |
| Hosting | **Netlify** (free Starter plan) | Free plan explicitly permits commercial use — Vercel's free "Hobby" plan is contractually **restricted to non-commercial, personal use**, and this app is for an LLC's business operations, so Vercel Hobby is a real (if commonly-overlooked) ToS risk. Netlify's free plan has no such restriction and includes scheduled functions (cron) at no cost. |
| Database + Auth | **Supabase** (free tier) | Managed Postgres + built-in email/password auth, generous free tier (500MB DB, unlimited API requests, 50k MAU) — far more than 3 users and a handful of properties will ever need. |
| Transactional email | **Brevo** (free tier, 300 emails/day) | Needed to send to all 3 owners, not just the account holder. Resend's free tier only allows sending to *your own* account email until you verify a whole domain (confirmed against Resend's own docs) — that would mean buying a domain, which conflicts with the zero-cost goal. Brevo's free plan sends to any recipient using a **single verified sender email** (a one-time confirmation link — no DNS/domain needed). SendGrid was considered but ended its free tier in 2025. |
| Source control | GitHub, **private** repository | Holds tenant contact info and partial financial data. |
| Domain | None — use Netlify's free `*.netlify.app` subdomain | Buying a custom domain (~$10-15/yr) isn't free; not required for a 3-person internal tool. |

**Net monthly cost: $0.** No component of this stack requires a credit card to sign up for the free tier used here.

### Facts verified against current provider documentation (2026-09-06)
- Vercel Hobby plan restricts use to "non-commercial, personal use only" — [Vercel Hobby Plan docs](https://vercel.com/docs/plans/hobby).
- Netlify's free plan permits commercial use (you just can't resell Netlify's hosting itself) — Netlify staff, [Netlify community forum](https://answers.netlify.com/t/can-we-use-netlify-free-plan-for-commercial-purposes/41545).
- Netlify Scheduled Functions are available on all plans including free — [Netlify docs](https://docs.netlify.com/build/functions/scheduled-functions/).
- Supabase free tier: 500MB DB, unlimited API requests/users, but **projects pause after 7 days of inactivity** — [Supabase pricing](https://supabase.com/pricing).
- Resend's `resend.dev` sending domain can only send to your own account email until a custom domain is verified — [Resend knowledge base](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).
- SendGrid discontinued its free tier in 2025 — [Twilio SendGrid changelog](https://www.twilio.com/en-us/changelog/sendgrid-free-plan).
- Brevo's free plan (300 emails/day) uses single sender email verification, not domain verification.

These are worth re-checking if this project sits untouched for a long time before deployment, since free-tier terms do change (SendGrid is the proof).

## 2. Data model

All tables live in Supabase Postgres, in the `public` schema, with Row Level Security (RLS) enabled.

```
owners
  id            uuid PK  (= auth.users.id)
  name          text
  email         text

properties
  id              uuid PK default gen_random_uuid()
  nickname        text
  address         text
  property_type   text
  date_acquired   date
  status          text   check in ('active','archived') default 'active'
  created_at      timestamptz default now()

leases                                    -- full history, not just current
  id                uuid PK
  property_id       uuid FK -> properties
  tenant_name       text
  tenant_phone      text
  tenant_email      text
  rent_amount       numeric
  start_date        date
  end_date          date
  is_current        boolean default true
  notified_expiry   boolean default false  -- set true once the 60-day email has fired
  notes             text
  created_at        timestamptz default now()

keys_access          (one row per property)
  id                    uuid PK
  property_id           uuid FK -> properties, unique
  key_count             int
  spare_key_holder_id   uuid FK -> owners
  garage_opener_count   int
  garage_opener_holder_id uuid FK -> owners
  notes                 text

mortgages             (one row per property)
  id               uuid PK
  property_id      uuid FK -> properties, unique
  lender           text
  account_last4    text        -- last 4 digits only, see §4 Security
  original_amount  numeric
  interest_rate    numeric
  term_years       int     -- renamed from term_months after first round of testing
  monthly_payment  numeric
  maturity_date    date

insurance_policies    (one row per property)
  id                 uuid PK
  property_id        uuid FK -> properties, unique
  carrier            text
  policy_number      text
  coverage_summary   text
  annual_premium     numeric
  renewal_date       date
  notified_renewal   boolean default false  -- set true once the 30-day renewal email has fired

hoa_info               (one row per property)
  id             uuid PK
  property_id    uuid FK -> properties, unique
  hoa_name       text
  due_amount     numeric
  due_frequency  text check in ('monthly','annual')
  contact        text

utility_accounts       (many per property)
  id                 uuid PK
  property_id        uuid FK -> properties
  utility_type       text   -- electric / gas / water / trash / internet / other
  provider           text
  account_reference  text
  notes              text

service_contacts       (many per property)
  id           uuid PK
  property_id  uuid FK -> properties
  name         text
  trade        text        -- e.g. "plumber", "landscaper"
  phone        text
  notes        text

notification_log
  id                   uuid PK
  lease_id             uuid FK -> leases, nullable            -- set for lease_expiry rows
  insurance_policy_id  uuid FK -> insurance_policies, nullable -- set for insurance_renewal rows
  type                 text default 'lease_expiry'  -- 'lease_expiry' | 'insurance_renewal'
  sent_at              timestamptz default now()

expenses               (many per property)
  id             uuid PK
  property_id    uuid FK -> properties
  expense_date   date
  category       text   check in ('maintenance','repair','turnover','other')
  amount         numeric
  vendor         text     -- who was paid
  description    text
  created_at     timestamptz default now()
```

Design notes:
- `leases` keeps full history (past tenants) per §5.2 of the requirements — the "current" lease is the row with `is_current = true`; a vacant property has no current row. Past tenants live on their own page (`properties/[id]/history`), linked from the current-lease card, so the main property page stays short as more history accumulates.
- `mortgages`/`insurance_policies`/`hoa_info` are 1:1 with a property, split into their own tables (rather than extra columns on `properties`) purely for readability and so file-upload columns (v2) can be added to the relevant table later without touching unrelated data.
- `utility_accounts`, `service_contacts`, and `expenses` are 1:many, matching the "multiple handyman contacts" / ongoing cost-tracking requirements.
- No table stores a full mortgage/loan account number, tenant government ID, or payment card data (§6 of requirements).
- `notification_log.lease_id` is nullable (originally `not null`) so the same table can also log insurance-renewal notifications, which have no associated lease — exactly one of `lease_id` / `insurance_policy_id` is set per row, matching `type`.
- All dollar-amount fields (`rent_amount`, mortgage `original_amount`/`monthly_payment`, `annual_premium`, HOA `due_amount`, expense `amount`) are entered and displayed through a shared `MoneyInput` component with a fixed `$` prefix, so formatting is consistent everywhere.
- `expenses` deliberately isn't tied to a specific lease — maintenance, repair, and turnover/relisting costs are logged by date and category only, kept on its own page (`properties/[id]/expenses`, linked from the property header) rather than as another section on the already-long main property page. Category is a fixed list (Maintenance, Repair, Turnover/Relisting, Other) rather than free text, so totals-by-category stay meaningful. A cross-property rollup and richer reporting were deferred — Santhosh plans to add a "Reports" entry point later for per-property and portfolio-wide views.

## 3. Auth & security model

- Supabase Auth, email + password. **Public sign-up will be disabled** in the Supabase dashboard — the only way to get an account is for an owner to be invited by email from the Supabase dashboard (admin action, one-time setup for the 3 owners in §8).
- Because only the 3 owners will ever have accounts, RLS policy is intentionally simple: every table allows `select/insert/update` when `auth.role() = 'authenticated'`. "Logged in" and "one of the 3 owners" are equivalent by construction — no per-owner row restrictions are needed, matching the requirement that all 3 owners have equal access.
- The Supabase **service role key** (which bypasses RLS) is used only by the server-side notification check (§4) and is never sent to the browser.
- `.env` files are git-ignored; secrets live only in Netlify's environment variable settings.

## 4. Notification design (lease expiry + insurance renewal)

- A single Netlify Scheduled Function (`netlify/functions/lease-check.mts`) runs once a day (e.g. `0 13 * * *`, ~8am/7am Chicago depending on DST) and performs two independent checks, both sent to all 3 owner addresses via Brevo's API:
  1. **Lease expiry (60-day window):** queries `leases` where `is_current = true`, `notified_expiry = false`, and `end_date` is within 60 days of today. For each match, sends one email naming the property, tenant, and exact end date, then marks `notified_expiry = true` and inserts a `notification_log` row (`type = 'lease_expiry'`, `lease_id` set).
  2. **Insurance renewal (30-day window):** queries `insurance_policies` where `notified_renewal = false` and `renewal_date` is within 30 days of today. For each match, sends one email naming the property, carrier, and renewal date, then marks `notified_renewal = true` and inserts a `notification_log` row (`type = 'insurance_renewal'`, `insurance_policy_id` set).
- Both checks run in parallel (`Promise.all`) and share one owner lookup and email-sending helper; a failure in one check (e.g. the email send throws) leaves that item's flag `false` so it's retried on the next day's run, and doesn't block the other check.
- A lease renewal is entered as a **new** `leases` row (old row's `is_current` set to false) — so the notified flag naturally resets for the new lease term. Editing an insurance policy's details always resets `notified_renewal` to `false`, so a corrected renewal date re-arms the reminder.
- This same job, on its daily run, also touches the database — which incidentally keeps the Supabase free project from auto-pausing (pause trigger is 7 days of *no* activity; a daily query prevents that entirely).

## 5. Application structure

```
app/
  login/page.tsx
  (dashboard)/page.tsx              -- property list + expiring-soon flags
  properties/[id]/page.tsx          -- full detail: lease, keys, mortgage, insurance, HOA, utilities, contacts
  properties/[id]/history/page.tsx  -- past tenants for this property (linked from the lease card)
  properties/[id]/expenses/page.tsx -- maintenance/repair/turnover expenses (linked from the property header)
  properties/new/page.tsx
lib/
  supabase/client.ts                -- browser client (anon key)
  supabase/server.ts                -- server client (for server components / route handlers)
  email/brevo.ts                    -- sendLeaseExpiryEmail()
netlify/functions/lease-check.ts    -- the scheduled function from §4
supabase/migrations/*.sql           -- versioned schema, source of truth for the DB
docs/                               -- these AIDLC phase documents
.env.example
netlify.toml                        -- build settings + scheduled function config
```

Environment variables (set in Netlify, never committed):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`.

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Supabase free project pauses after 7 days idle | Daily scheduled function keeps it active automatically. |
| Netlify scheduled function fails silently | `notification_log` gives a visible audit trail; can be checked manually if an expected email doesn't arrive. |
| Free-tier terms change (as SendGrid's did) | Stack choices and their sources are documented above (§1) so a future review is quick. |
| One shared RLS policy means any of the 3 owners can edit/delete anything | Accepted — matches the requirement that all 3 co-owners have equal access; mitigated by `status = 'archived'` instead of hard-delete on properties. |
| Brevo single sender email gets flagged as spam by recipient providers | Low volume (a handful of emails/month); can add SPF/DKIM later if a real domain is ever purchased. |

## 7. Sign-off

Approved by Santhosh 2026-09-06.
