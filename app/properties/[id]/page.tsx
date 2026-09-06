import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PropertyHeader from "./PropertyHeader";
import LeaseSection from "./LeaseSection";
import KeysSection from "./KeysSection";
import MortgageSection from "./MortgageSection";
import InsuranceSection from "./InsuranceSection";
import HoaSection from "./HoaSection";
import UtilitiesSection from "./UtilitiesSection";
import ContactsSection from "./ContactsSection";

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [
    { data: property },
    { data: leases },
    { data: keysAccess },
    { data: mortgage },
    { data: insurance },
    { data: hoa },
    { data: utilities },
    { data: contacts },
    { data: owners },
  ] = await Promise.all([
    supabase.from("properties").select("*").eq("id", params.id).single(),
    supabase.from("leases").select("*").eq("property_id", params.id).order("start_date", { ascending: false }),
    supabase.from("keys_access").select("*").eq("property_id", params.id).maybeSingle(),
    supabase.from("mortgages").select("*").eq("property_id", params.id).maybeSingle(),
    supabase.from("insurance_policies").select("*").eq("property_id", params.id).maybeSingle(),
    supabase.from("hoa_info").select("*").eq("property_id", params.id).maybeSingle(),
    supabase.from("utility_accounts").select("*").eq("property_id", params.id).order("utility_type"),
    supabase.from("service_contacts").select("*").eq("property_id", params.id).order("name"),
    supabase.from("owners").select("*").order("name"),
  ]);

  if (!property) return notFound();

  const currentLease = (leases || []).find((l) => l.is_current) || null;
  const history = (leases || []).filter((l) => !l.is_current);

  return (
    <div className="space-y-6 max-w-3xl">
      <PropertyHeader property={property} />
      <LeaseSection propertyId={property.id} currentLease={currentLease} history={history} />
      <KeysSection propertyId={property.id} data={keysAccess} owners={owners || []} />
      <MortgageSection propertyId={property.id} data={mortgage} />
      <InsuranceSection propertyId={property.id} data={insurance} />
      <HoaSection propertyId={property.id} data={hoa} />
      <UtilitiesSection propertyId={property.id} items={utilities || []} />
      <ContactsSection propertyId={property.id} items={contacts || []} />
    </div>
  );
}
