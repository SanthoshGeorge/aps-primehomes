-- APS PrimeHomes Property Manager — property expense tracking
-- Run this in the Supabase SQL editor on top of 0001_init.sql and 0002_enhancements.sql.

-- Maintenance, repairs, and turnover/relisting costs (brokerage fees, cleaning,
-- repairs done specifically to re-list a vacant unit, etc.), tracked per property.
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  expense_date date not null,
  category text not null check (category in ('maintenance', 'repair', 'turnover', 'other')),
  amount numeric not null,
  vendor text,
  description text,
  created_at timestamptz not null default now()
);

create index expenses_property_id_idx on public.expenses(property_id);
create index expenses_property_date_idx on public.expenses(property_id, expense_date desc);

alter table public.expenses enable row level security;

create policy "expenses: owners full access select" on public.expenses
  for select using (auth.role() = 'authenticated');
create policy "expenses: owners full access insert" on public.expenses
  for insert with check (auth.role() = 'authenticated');
create policy "expenses: owners full access update" on public.expenses
  for update using (auth.role() = 'authenticated');
create policy "expenses: owners full access delete" on public.expenses
  for delete using (auth.role() = 'authenticated');
