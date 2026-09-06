# APS PrimeHomes — Property Manager
## Phase 1: Requirements & Inception (AIDLC — Product Owner)

Status: **APPROVED** (2026-09-06)

## 1. Background

APS PrimeHomes is an LLC owned by 3 partners (including Santhosh), currently holding 2 rental
homes with plans to acquire more over time. The owners currently track property, tenant, lease,
key, mortgage and insurance details informally. This project builds a small internal web app so
all 3 owners can see and maintain this information in one place, and get an automatic email
warning before a lease expires.

This build is also being run as a deliberate exercise in Santhosh's AIDLC (AI-Driven Development
Lifecycle) methodology: Product Owner → Architect → Developer → QA, with a human review gate
between each phase.

## 2. Goals

- Single source of truth for property, tenant, lease, key, mortgage, and insurance data.
- Automatic email reminder 2 months before a lease's end date.
- Usable by all 3 owners, each with their own login.
- Effectively zero ongoing cost, using free tiers only.
- Scales from 2 properties to "a few more" without redesign.

## 3. Non-goals (v1)

- Uploading/storing the actual lease, insurance, or mortgage PDF documents. (Deferred to v2 —
  see §7. The data model will be built so this can be added later without breaking changes.)
- Rent collection, accounting, or payment processing.
- Tenant-facing access (this is owners-only).
- Public/marketing site.

## 4. Users

Three owners, each with an individual account (email + password via Supabase Auth). All 3 have
equal read/write access to all properties — no per-owner restrictions, since all 3 co-own the
LLC.

| Owner | Email |
|---|---|
| Santhosh George | santh.george@gmail.com |
| Roshan Remanan | roshan.remanan@gmail.com |
| Jiju Stephen | jijustephen@gmail.com |

## 5. Functional requirements

### 5.1 Properties
- List all properties owned by the LLC (currently 2, expected to grow).
- Each property has: address, nickname/label, property type, date acquired.
- Add / edit / archive a property (archive rather than hard-delete, to preserve history).

### 5.2 Tenant & lease
- Current tenant name and contact info (phone/email).
- Lease start date and end date.
- Monthly rent amount.
- Lease status derived from dates (active / expiring soon / expired / vacant).
- History of past tenants/leases per property (not just the current one).

### 5.3 Lease-expiry notifications
- Automatic email sent when a lease reaches **60 days (2 months) before its end date**.
- Sent once per lease (not repeated every day) — needs a "notified" flag so it doesn't spam.
- Recipients: all 3 owners, every time.
- Sender: "APS PrimeHomes Notifications".
- A daily scheduled check is sufficient (doesn't need to be real-time).

### 5.4 Keys & access
- Number of keys for the property.
- Which owner is holding the extra/spare key(s).
- Garage door opener details (how many, who holds them, remote code/notes if relevant).
- Free-text notes field for anything else access-related (lockbox code, alarm code, etc.)

### 5.5 Mortgage info
- Lender name.
- Loan/account reference (last 4 digits only, not full account number — see §6 security note).
- Original loan amount, interest rate, term.
- Monthly payment amount.
- Maturity/payoff date.

### 5.6 Insurance
- Carrier name.
- Policy number.
- Coverage type / summary.
- Annual premium.
- Renewal date (candidate for its own reminder in a future iteration — see §7).

### 5.7 Dashboard
- Landing page showing all properties at a glance with a flag for leases expiring within 60 days.

### 5.8 HOA, utilities & contacts
- HOA info: HOA name, monthly/annual due, contact.
- Utility accounts: one or more entries per property (utility type — electric/gas/water/trash/
  internet — provider name, account reference).
- Handyman/service contacts: a repeatable list per property (name, trade/specialty, phone,
  notes) — not limited to one contact.

## 6. Non-functional requirements

- **Cost:** must run on free tiers of every service used (hosting, database, email, source
  control). See the Architecture doc for the specific stack.
- **Security/privacy:** this app will hold personal tenant contact info and partial financial
  details. It will sit behind individual owner logins, not be publicly listed, and will avoid
  storing full account/loan numbers (last 4 digits only) or any tenant government ID or payment
  card data.
- **Access:** usable from a phone browser as well as desktop (responsive, not necessarily a
  native app).
- **Maintainability:** plain enough that Santhosh (or a future contributor) can extend it —
  e.g. add insurance-renewal reminders, or document uploads — without a rewrite.

## 7. Future enhancements (explicitly out of scope for v1, but designed for)

- Document upload/storage for lease, insurance, and mortgage PDFs (Supabase Storage).
- Insurance renewal reminder (same mechanism as lease-expiry reminder).
- Expense/income tracking per property.
- Role differences between owners (e.g. one owner as primary point of contact).

## 8. Sign-off

All open questions resolved by Santhosh on 2026-09-06 (owner list, notification recipients,
HOA/utility/contact fields, sender name, private repo). This document is the approved baseline
for the Architecture phase.
