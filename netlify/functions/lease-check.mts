import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const LEASE_NOTICE_WINDOW_DAYS = 60;
const INSURANCE_NOTICE_WINDOW_DAYS = 30;

function daysBetween(fromStr: string, toStr: string): number {
  return Math.round(
    (new Date(toStr + "T00:00:00").getTime() - new Date(fromStr + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Runs once a day. Two independent checks, both sent to all owners:
 *  - a current lease ending within 60 days (notified_expiry flag on leases)
 *  - an insurance policy renewing within 30 days (notified_renewal flag on
 *    insurance_policies)
 * Each fires exactly once per lease/policy — see docs/02-architecture.md §4.
 */
export default async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "APS PrimeHomes Notifications";

  if (!supabaseUrl || !serviceRoleKey || !brevoApiKey || !senderEmail) {
    console.error("lease-check: missing required environment variables — aborting");
    return new Response("misconfigured", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const todayStr = new Date().toISOString().slice(0, 10);

  const leaseCutoff = new Date();
  leaseCutoff.setDate(leaseCutoff.getDate() + LEASE_NOTICE_WINDOW_DAYS);
  const leaseCutoffStr = leaseCutoff.toISOString().slice(0, 10);

  const insuranceCutoff = new Date();
  insuranceCutoff.setDate(insuranceCutoff.getDate() + INSURANCE_NOTICE_WINDOW_DAYS);
  const insuranceCutoffStr = insuranceCutoff.toISOString().slice(0, 10);

  const [{ data: leases, error: leaseErr }, { data: policies, error: policyErr }] = await Promise.all([
    supabase
      .from("leases")
      .select("id, tenant_name, end_date, property_id, properties(nickname, address)")
      .eq("is_current", true)
      .eq("notified_expiry", false)
      .gte("end_date", todayStr)
      .lte("end_date", leaseCutoffStr),
    supabase
      .from("insurance_policies")
      .select("id, carrier, renewal_date, property_id, properties(nickname, address)")
      .eq("notified_renewal", false)
      .not("renewal_date", "is", null)
      .gte("renewal_date", todayStr)
      .lte("renewal_date", insuranceCutoffStr),
  ]);

  if (leaseErr) console.error("lease-check: failed to query leases", leaseErr);
  if (policyErr) console.error("lease-check: failed to query insurance_policies", policyErr);

  const dueLeases = leases || [];
  const duePolicies = policies || [];

  if (dueLeases.length === 0 && duePolicies.length === 0) {
    console.log("lease-check: nothing due for notification today");
    return new Response("ok - nothing to notify", { status: 200 });
  }

  const { data: owners, error: ownerErr } = await supabase.from("owners").select("email, name");
  if (ownerErr || !owners || owners.length === 0) {
    console.error("lease-check: failed to load owners", ownerErr);
    return new Response("no owners to notify", { status: 500 });
  }
  const recipients = owners.map((o) => ({ email: o.email, name: o.name }));

  async function sendEmail(subject: string, html: string) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "api-key": brevoApiKey! },
      body: JSON.stringify({ sender: { name: senderName, email: senderEmail }, to: recipients, subject, htmlContent: html }),
    });
    if (!res.ok) throw new Error(`Brevo send failed (${res.status}): ${await res.text()}`);
  }

  // ── Lease-expiry notifications ──────────────────────────────────────
  for (const lease of dueLeases as any[]) {
    const property = Array.isArray(lease.properties) ? lease.properties[0] : lease.properties;
    const label = property?.nickname || property?.address || "a property";
    const daysLeft = daysBetween(todayStr, lease.end_date);

    try {
      await sendEmail(
        `Lease at ${label} expires in ${daysLeft} days (${lease.end_date})`,
        `<p>Heads up — a lease is coming up for renewal.</p>
         <ul>
           <li><strong>Property:</strong> ${label}${property?.address ? ` (${property.address})` : ""}</li>
           <li><strong>Tenant:</strong> ${lease.tenant_name}</li>
           <li><strong>Lease end date:</strong> ${lease.end_date} (${daysLeft} days from now)</li>
         </ul>
         <p>Sent automatically by the APS PrimeHomes property manager.</p>`
      );

      await supabase.from("leases").update({ notified_expiry: true }).eq("id", lease.id);
      await supabase.from("notification_log").insert({ lease_id: lease.id, type: "lease_expiry" });
      console.log(`lease-check: notified owners about lease ${lease.id} (${label})`);
    } catch (err) {
      console.error(`lease-check: error sending/logging for lease ${lease.id}`, err); // leave notified_expiry = false so we retry tomorrow
    }
  }

  // ── Insurance-renewal notifications ─────────────────────────────────
  for (const policy of duePolicies as any[]) {
    const property = Array.isArray(policy.properties) ? policy.properties[0] : policy.properties;
    const label = property?.nickname || property?.address || "a property";
    const daysLeft = daysBetween(todayStr, policy.renewal_date);

    try {
      await sendEmail(
        `Insurance for ${label} renews in ${daysLeft} days (${policy.renewal_date})`,
        `<p>Heads up — an insurance policy is coming up for renewal.</p>
         <ul>
           <li><strong>Property:</strong> ${label}${property?.address ? ` (${property.address})` : ""}</li>
           <li><strong>Carrier:</strong> ${policy.carrier || "—"}</li>
           <li><strong>Renewal date:</strong> ${policy.renewal_date} (${daysLeft} days from now)</li>
         </ul>
         <p>Sent automatically by the APS PrimeHomes property manager.</p>`
      );

      await supabase.from("insurance_policies").update({ notified_renewal: true }).eq("id", policy.id);
      await supabase.from("notification_log").insert({ insurance_policy_id: policy.id, type: "insurance_renewal" });
      console.log(`lease-check: notified owners about insurance ${policy.id} (${label})`);
    } catch (err) {
      console.error(`lease-check: error sending/logging for insurance ${policy.id}`, err); // leave notified_renewal = false so we retry tomorrow
    }
  }

  return new Response(`ok - processed ${dueLeases.length} lease(s), ${duePolicies.length} polic(y/ies)`, { status: 200 });
};

export const config: Config = {
  // Once a day. Netlify's free-tier scheduling isn't minute-precise — that's
  // fine here since we're checking a multi-week window, not a deadline to
  // the minute. See docs/02-architecture.md §4.
  schedule: "0 13 * * *",
};
