-- Payments table for Konnect integration
create table if not exists payments (
  id text primary key, -- orderId format: KW-{timestamp}-{userId slice}
  user_id uuid references auth.users(id) on delete set null,
  listing_id uuid references listings(id) on delete set null,
  plan text not null check (plan in ('premium_monthly', 'premium_annual')),
  amount integer not null, -- in millimes (4900 = 49 TND)
  currency text not null default 'TND',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'expired')),
  payment_ref text, -- Konnect payment reference
  raw jsonb, -- raw Konnect response
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_payments_updated_at on payments;
create trigger update_payments_updated_at
  before update on payments
  for each row execute function update_updated_at_column();

-- Add premium_expires_at to listings if not exists
alter table listings add column if not exists premium_expires_at timestamptz;

-- Add plan to profiles if not exists
alter table profiles add column if not exists plan text not null default 'free';
alter table profiles add column if not exists premium_expires_at timestamptz;

-- RLS
alter table payments enable row level security;

-- Users can read their own payments
create policy "Users can view own payments"
  on payments for select
  using (auth.uid() = user_id);

-- Only service role can insert/update payments
create policy "Service role manages payments"
  on payments for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Index for fast lookups
create index if not exists payments_user_id_idx on payments(user_id);
create index if not exists payments_payment_ref_idx on payments(payment_ref);
create index if not exists payments_status_idx on payments(status);
