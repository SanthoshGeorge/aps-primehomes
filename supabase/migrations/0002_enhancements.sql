-- APS PrimeHomes Property Manager — enhancements after first round of testing
-- Run this in the Supabase SQL editor on top of 0001_init.sql.

-- 1. Notes on the current tenant/lease (matches the Keys & Access notes field).
alter table public.leases add column if not exists notes text;

-- 2. Notes on utility accounts.
alter table public.utility_accounts add column if not exists notes text;

-- 3. Insurance renewal notification (30 days before renewal_date), same pattern
--    as the lease-expiry notified_expiry flag.
alter table public.insurance_policies
  add column if not exists notified_renewal boolean not null default false;

-- 3b. notification_log needs to support insurance-renewal rows too, which
--     have no lease_id — relax the column and add the matching FK.
alter table public.notification_log alter column lease_id drop not null;
alter table public.notification_log
  add column if not exists insurance_policy_id uuid references public.insurance_policies(id) on delete cascade;

-- 4. Mortgage term is now tracked in years instead of months.
--    NOTE: this renames the column in place — any test values you already
--    entered in months will now be read as years (e.g. a test "360" months
--    will show as "360" years). Re-enter real values after this migration.
alter table public.mortgages rename column term_months to term_years;
