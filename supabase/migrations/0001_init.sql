-- APS PrimeHomes Property Manager — initial schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────
-- Owners: one row per invited Supabase auth user
-- ─────────────────────────────────────────────────────────────────
create table public.owners (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Auto-create an owners row whenever a new auth user is created (i.e. when
-- Santhosh invites Roshan and Jiju from the Supabase dashboard).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.owners (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- Properties
-- ─────────────────────────────────────────────────────────────────
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  address text not null,
  property_type text,
  date_acquired date,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────
-- Leases (full history; the current one has is_current = true)
-- ─────────────────────────────────────────────────────────────────
create table public.leases (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_name text not null,
  tenant_phone text,
  tenant_email text,
  rent_amount numeric,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default true,
  notified_expiry boolean not null default false,
  created_at timestamptz not null default now()
);

create index leases_property_id_idx on public.leases(property_id);
create index leases_current_idx on public.leases(property_id) where is_current;
-- Used by the daily notification check.
create index leases_notify_scan_idx on public.leases(end_date) where is_current and not notified_expiry;

-- ─────────────────────────────────────────────────────────────────
-- Keys & access (one row per property)
-- ─────────────────────────────────────────────────────────────────
create table public.keys_access (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  key_count int,
  spare_key_holder_id uuid references public.owners(id),
  garage_opener_count int,
  garage_opener_holder_id uuid references public.owners(id),
  notes text
);

-- ─────────────────────────────────────────────────────────────────
-- Mortgage (one row per property)
-- ─────────────────────────────────────────────────────────────────
create table public.mortgages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  lender text,
  account_last4 text,
  original_amount numeric,
  interest_rate numeric,
  term_months int,
  monthly_payment numeric,
  maturity_date date
);

-- ─────────────────────────────────────────────────────────────────
-- Insurance (one row per property)
-- ─────────────────────────────────────────────────────────────────
create table public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  carrier text,
  policy_number text,
  coverage_summary text,
  annual_premium numeric,
  renewal_date date
);

-- ─────────────────────────────────────────────────────────────────
-- HOA (one row per property)
-- ─────────────────────────────────────────────────────────────────
create table public.hoa_info (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties(id) on delete cascade,
  hoa_name text,
  due_amount numeric,
  due_frequency text check (due_frequency in ('monthly', 'annual')),
  contact text
);

-- ─────────────────────────────────────────────────────────────────
-- Utility accounts (many per property)
-- ─────────────────────────────────────────────────────────────────
create table public.utility_accounts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  utility_type text not null,
  provider text,
  account_reference text
);

create index utility_accounts_property_id_idx on public.utility_accounts(property_id);

-- ─────────────────────────────────────────────────────────────────
-- Service contacts (many per property)
-- ─────────────────────────────────────────────────────────────────
create table public.service_contacts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  trade text,
  phone text,
  notes text
);

create index service_contacts_property_id_idx on public.service_contacts(property_id);

-- ─────────────────────────────────────────────────────────────────
-- Notification log (audit trail for the daily lease-expiry check)
-- ─────────────────────────────────────────────────────────────────
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references public.leases(id) on delete cascade,
  type text not null default 'lease_expiry',
  sent_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────
-- Row Level Security
--
-- Public sign-up is disabled for this project (set in the Supabase dashboard
-- under Authentication -> Providers -> Email -> "Allow new users to sign up").
-- The only accounts that will ever exist are the 3 invited owners, so
-- "authenticated" and "one of the 3 owners" are equivalent here. All 3 owners
-- get equal read/write access, per the requirements doc. Properties have no
-- delete policy on purpose — archive instead of deleting, to preserve history.
-- ─────────────────────────────────────────────────────────────────

alter table public.owners enable row level security;
alter table public.properties enable row level security;
alter table public.leases enable row level security;
alter table public.keys_access enable row level security;
alter table public.mortgages enable row level security;
alter table public.insurance_policies enable row level security;
alter table public.hoa_info enable row level security;
alter table public.utility_accounts enable row level security;
alter table public.service_contacts enable row level security;
alter table public.notification_log enable row level security;

create policy "owners are readable by any owner" on public.owners
  for select using (auth.role() = 'authenticated');
create policy "owners can update their own row" on public.owners
  for update using (auth.uid() = id);

create policy "properties: owners can read" on public.properties
  for select using (auth.role() = 'authenticated');
create policy "properties: owners can insert" on public.properties
  for insert with check (auth.role() = 'authenticated');
create policy "properties: owners can update" on public.properties
  for update using (auth.role() = 'authenticated');

create policy "leases: owners full access select" on public.leases
  for select using (auth.role() = 'authenticated');
create policy "leases: owners full access insert" on public.leases
  for insert with check (auth.role() = 'authenticated');
create policy "leases: owners full access update" on public.leases
  for update using (auth.role() = 'authenticated');
create policy "leases: owners full access delete" on public.leases
  for delete using (auth.role() = 'authenticated');

create policy "keys_access: owners full access select" on public.keys_access
  for select using (auth.role() = 'authenticated');
create policy "keys_access: owners full access insert" on public.keys_access
  for insert with check (auth.role() = 'authenticated');
create policy "keys_access: owners full access update" on public.keys_access
  for update using (auth.role() = 'authenticated');

create policy "mortgages: owners full access select" on public.mortgages
  for select using (auth.role() = 'authenticated');
create policy "mortgages: owners full access insert" on public.mortgages
  for insert with check (auth.role() = 'authenticated');
create policy "mortgages: owners full access update" on public.mortgages
  for update using (auth.role() = 'authenticated');

create policy "insurance_policies: owners full access select" on public.insurance_policies
  for select using (auth.role() = 'authenticated');
create policy "insurance_policies: owners full access insert" on public.insurance_policies
  for insert with check (auth.role() = 'authenticated');
create policy "insurance_policies: owners full access update" on public.insurance_policies
  for update using (auth.role() = 'authenticated');

create policy "hoa_info: owners full access select" on public.hoa_info
  for select using (auth.role() = 'authenticated');
create policy "hoa_info: owners full access insert" on public.hoa_info
  for insert with check (auth.role() = 'authenticated');
create policy "hoa_info: owners full access update" on public.hoa_info
  for update using (auth.role() = 'authenticated');

create policy "utility_accounts: owners full access select" on public.utility_accounts
  for select using (auth.role() = 'authenticated');
create policy "utility_accounts: owners full access insert" on public.utility_accounts
  for insert with check (auth.role() = 'authenticated');
create policy "utility_accounts: owners full access update" on public.utility_accounts
  for update using (auth.role() = 'authenticated');
create policy "utility_accounts: owners full access delete" on public.utility_accounts
  for delete using (auth.role() = 'authenticated');

create policy "service_contacts: owners full access select" on public.service_contacts
  for select using (auth.role() = 'authenticated');
create policy "service_contacts: owners full access insert" on public.service_contacts
  for insert with check (auth.role() = 'authenticated');
create policy "service_contacts: owners full access update" on public.service_contacts
  for update using (auth.role() = 'authenticated');
create policy "service_contacts: owners full access delete" on public.service_contacts
  for delete using (auth.role() = 'authenticated');

create policy "notification_log: owners can read" on public.notification_log
  for select using (auth.role() = 'authenticated');
-- No insert/update policy for notification_log: only the service-role key
-- (used by the scheduled function) writes to it, bypassing RLS entirely.
