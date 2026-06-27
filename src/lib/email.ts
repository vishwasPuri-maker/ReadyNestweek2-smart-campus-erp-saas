// Transactional email via Brevo (free tier, no custom domain required — send from a
// verified sender address). If BREVO_API_KEY / EMAIL_FROM are not configured, we fall
// back to logging the message so local dev and onboarding still work end-to-end.

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<{ delivered: boolean }> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Smart Campus";

  if (!apiKey || !from) {
    // Dev / not-configured fallback: print instead of sending.
    console.log(
      `\n[email:dev fallback] (set BREVO_API_KEY + EMAIL_FROM to actually send)\n` +
        `To: ${to}\nSubject: ${subject}\n${text ?? html}\n`,
    );
    return { delivered: false };
  }

  const res = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: from, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text ?? html.replace(/<[^>]+>/g, " "),
    }),
  });

  if (!res.ok) {
    // Don't leak provider internals to callers/users; log server-side, throw generic.
    console.error(`Brevo send failed (${res.status}): ${await res.text()}`);
    throw new Error("Failed to send email");
  }

  return { delivered: true };
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<{ delivered: boolean }> {
  return sendEmail({
    to,
    subject: "Verify your Smart Campus account",
    text: `Welcome to Smart Campus! Confirm your email to activate your organization:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
        <h2>Welcome to Smart Campus</h2>
        <p>Confirm your email to activate your organization.</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 18px;background:#171717;color:#fff;border-radius:8px;text-decoration:none">Verify email</a></p>
        <p style="color:#666;font-size:13px">Or paste this link: <br>${verifyUrl}</p>
        <p style="color:#666;font-size:13px">This link expires in 24 hours.</p>
      </div>`,
  });
}
