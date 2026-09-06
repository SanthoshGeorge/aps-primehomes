/**
 * Minimal Brevo transactional email client — a plain fetch() call, no SDK,
 * since we only ever send one kind of email. See docs/02-architecture.md §1
 * for why Brevo (vs. Resend/SendGrid) was chosen.
 */
export async function sendEmail(opts: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "APS PrimeHomes Notifications";

  if (!apiKey || !senderEmail) {
    throw new Error("BREVO_API_KEY / BREVO_SENDER_EMAIL are not configured");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo send failed (${res.status}): ${body}`);
  }

  return res.json();
}
