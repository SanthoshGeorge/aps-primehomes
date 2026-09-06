export type Owner = {
  id: string;
  name: string;
  email: string;
};

export type Property = {
  id: string;
  nickname: string;
  address: string;
  property_type: string | null;
  date_acquired: string | null;
  status: "active" | "archived";
  created_at: string;
};

export type Lease = {
  id: string;
  property_id: string;
  tenant_name: string;
  tenant_phone: string | null;
  tenant_email: string | null;
  rent_amount: number | null;
  start_date: string;
  end_date: string;
  is_current: boolean;
  notified_expiry: boolean;
  created_at: string;
};

export type KeysAccess = {
  id: string;
  property_id: string;
  key_count: number | null;
  spare_key_holder_id: string | null;
  garage_opener_count: number | null;
  garage_opener_holder_id: string | null;
  notes: string | null;
};

export type Mortgage = {
  id: string;
  property_id: string;
  lender: string | null;
  account_last4: string | null;
  original_amount: number | null;
  interest_rate: number | null;
  term_months: number | null;
  monthly_payment: number | null;
  maturity_date: string | null;
};

export type InsurancePolicy = {
  id: string;
  property_id: string;
  carrier: string | null;
  policy_number: string | null;
  coverage_summary: string | null;
  annual_premium: number | null;
  renewal_date: string | null;
};

export type HoaInfo = {
  id: string;
  property_id: string;
  hoa_name: string | null;
  due_amount: number | null;
  due_frequency: "monthly" | "annual" | null;
  contact: string | null;
};

export type UtilityAccount = {
  id: string;
  property_id: string;
  utility_type: string;
  provider: string | null;
  account_reference: string | null;
};

export type ServiceContact = {
  id: string;
  property_id: string;
  name: string;
  trade: string | null;
  phone: string | null;
  notes: string | null;
};

export type LeaseStatus = "vacant" | "active" | "expiring_soon" | "expired";
