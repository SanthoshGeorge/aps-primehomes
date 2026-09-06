"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionState = { error?: string; success?: boolean } | undefined;

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) || "").trim();
  return v || null;
}

// ── Property details ──────────────────────────────────────────────
export async function updateProperty(propertyId: string, _prev: ActionState, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      nickname: str(formData, "nickname"),
      address: str(formData, "address"),
      property_type: str(formData, "property_type"),
      date_acquired: str(formData, "date_acquired"),
    })
    .eq("id", propertyId);

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function setPropertyStatus(propertyId: string, status: "active" | "archived") {
  const supabase = createClient();
  await supabase.from("properties").update({ status }).eq("id", propertyId);
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/");
}

// ── Lease ──────────────────────────────────────────────────────────
export async function addLease(propertyId: string, _prev: ActionState, formData: FormData) {
  const tenant_name = str(formData, "tenant_name");
  const start_date = str(formData, "start_date");
  const end_date = str(formData, "end_date");

  if (!tenant_name || !start_date || !end_date) {
    return { error: "Tenant name, start date, and end date are required." };
  }

  const supabase = createClient();

  // Only one lease can be "current" per property.
  await supabase.from("leases").update({ is_current: false }).eq("property_id", propertyId).eq("is_current", true);

  const { error } = await supabase.from("leases").insert({
    property_id: propertyId,
    tenant_name,
    tenant_phone: str(formData, "tenant_phone"),
    tenant_email: str(formData, "tenant_email"),
    rent_amount: num(formData, "rent_amount"),
    start_date,
    end_date,
    is_current: true,
    notified_expiry: false,
  });

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function endCurrentLease(propertyId: string) {
  const supabase = createClient();
  await supabase.from("leases").update({ is_current: false }).eq("property_id", propertyId).eq("is_current", true);
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/");
}

// ── Keys & access (upsert, one row per property) ────────────────────
export async function saveKeysAccess(propertyId: string, _prev: ActionState, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("keys_access").upsert(
    {
      property_id: propertyId,
      key_count: num(formData, "key_count"),
      spare_key_holder_id: str(formData, "spare_key_holder_id"),
      garage_opener_count: num(formData, "garage_opener_count"),
      garage_opener_holder_id: str(formData, "garage_opener_holder_id"),
      notes: str(formData, "notes"),
    },
    { onConflict: "property_id" }
  );

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

// ── Mortgage (upsert) ────────────────────────────────────────────────
export async function saveMortgage(propertyId: string, _prev: ActionState, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("mortgages").upsert(
    {
      property_id: propertyId,
      lender: str(formData, "lender"),
      account_last4: str(formData, "account_last4"),
      original_amount: num(formData, "original_amount"),
      interest_rate: num(formData, "interest_rate"),
      term_months: num(formData, "term_months"),
      monthly_payment: num(formData, "monthly_payment"),
      maturity_date: str(formData, "maturity_date"),
    },
    { onConflict: "property_id" }
  );

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

// ── Insurance (upsert) ───────────────────────────────────────────────
export async function saveInsurance(propertyId: string, _prev: ActionState, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("insurance_policies").upsert(
    {
      property_id: propertyId,
      carrier: str(formData, "carrier"),
      policy_number: str(formData, "policy_number"),
      coverage_summary: str(formData, "coverage_summary"),
      annual_premium: num(formData, "annual_premium"),
      renewal_date: str(formData, "renewal_date"),
    },
    { onConflict: "property_id" }
  );

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

// ── HOA (upsert) ─────────────────────────────────────────────────────
export async function saveHoa(propertyId: string, _prev: ActionState, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("hoa_info").upsert(
    {
      property_id: propertyId,
      hoa_name: str(formData, "hoa_name"),
      due_amount: num(formData, "due_amount"),
      due_frequency: str(formData, "due_frequency"),
      contact: str(formData, "contact"),
    },
    { onConflict: "property_id" }
  );

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

// ── Utility accounts (many) ──────────────────────────────────────────
export async function addUtility(propertyId: string, _prev: ActionState, formData: FormData) {
  const utility_type = str(formData, "utility_type");
  if (!utility_type) return { error: "Utility type is required." };

  const supabase = createClient();
  const { error } = await supabase.from("utility_accounts").insert({
    property_id: propertyId,
    utility_type,
    provider: str(formData, "provider"),
    account_reference: str(formData, "account_reference"),
  });

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function deleteUtility(propertyId: string, utilityId: string) {
  const supabase = createClient();
  await supabase.from("utility_accounts").delete().eq("id", utilityId);
  revalidatePath(`/properties/${propertyId}`);
}

// ── Service contacts (many) ──────────────────────────────────────────
export async function addContact(propertyId: string, _prev: ActionState, formData: FormData) {
  const name = str(formData, "name");
  if (!name) return { error: "Name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("service_contacts").insert({
    property_id: propertyId,
    name,
    trade: str(formData, "trade"),
    phone: str(formData, "phone"),
    notes: str(formData, "notes"),
  });

  if (error) return { error: error.message };
  revalidatePath(`/properties/${propertyId}`);
  return { success: true };
}

export async function deleteContact(propertyId: string, contactId: string) {
  const supabase = createClient();
  await supabase.from("service_contacts").delete().eq("id", contactId);
  revalidatePath(`/properties/${propertyId}`);
}
