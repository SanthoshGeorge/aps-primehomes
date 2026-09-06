import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const NOTICE_WINDOW_DAYS = 60;

/**
 * Runs once a day. Finds current leases ending within the next 60 days that
 * haven't been notified about yet, emails all 3 owners, and marks them
 * notified so the email fires exactly once per lease. See
 * docs/02-architecture.md §4 for the full design.
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

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + NOTICE_WINDOW_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: leases, error: leaseErr } = await supabase
    .from("leases")
    .select("id, tenant_name, end_date, property_id, properties(nickname, address)")
    .eq("is_current", true)
    .eq("notified_expiry", false)
    .gte("end_date", todayStr)
    .lte("end_date", cutoffStr);

  if (leaseErr) {
    console.error("lease-check: failed to query leases", leaseErr);
    return new Response("query failed", { status: 500 });
  }

  if (!leases || leases.length === 0) {
    console.log("lease-check: no leases due for notification today");
    return new Response("ok - nothing to notify", { status: 200 });
  }

  const { data: owners, error: ownerErr } = await supabase.from("owners").select("email, name");
  if (ownerErr || !owners || owners.length === 0) {
    console.error("lease-check: failed to load owners", ownerErr);
    return new Response("no owners to notify", { status: 500 });
  }
  const recipients = owners.map((o) => ({ email: o.email, name: o.name }));

  for (const lease of leases as any[]) {
    const property = Array.isArray(lease.properties) ? lease.properties[0] : lease.properties;
    const label = property?.nickname || property?.address || "a property";
    const daysLeft = Math.round(
      (new Date(lease.end_date + "T00:00:00").getTime() - new Date(todayStr + "T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const subject = `Lease at ${label} expires in ${daysLeft} days (${lease.end_date})`;
    const html = `
      <p>Heads up — a lease is coming up for renewal.</p>
      <ul>
        <li><strong>Property:</strong> ${label}${property?.address ? ` (${property.address})` : ""}</li>
        <li><strong>Tenant:</strong> ${lease.tenant_name}</li>
        <li><strong>Lease end date:</strong> ${lease.end_date} (${daysLeft} days from now)</li>
      </ul>
      <p>Sent automatically by the APS PrimeHomes property manager.</p>
    `;

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: recipients,
          subject,
          htmlContent: html,
        }),
      });

      if (!res.ok) {
        console.error(`lease-check: Brevo send failed for lease ${lease.id}`, await res.text());
        continue; // leave notified_expiry = false so we retry tomorrow
      }

      await supabase.from("leases").update({ notified_expiry: true }).eq("id", lease.id);
      await supabase.from("notification_log").insert({ lease_id: lease.id, type: "lease_expiry" });
      console.log(`lease-check: notified owners about lease ${lease.id} (${label})`);
    } catch (err) {
      console.error(`lease-check: error sending/logging for lease ${lease.id}`, err);
    }
  }

  return new Response(`ok - processed ${leases.length} lease(s)`, { status: 200 });
};

export const config: Config = {
  // Once a day. Vercel/Netlify Hobby-tier scheduling isn't minute-precise —
  // that's fine here since we're checking a 60-day window, not a deadline to
  // the minute. See docs/02-architecture.md §4.
  schedule: "0 13 * * *",
};
