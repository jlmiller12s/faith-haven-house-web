const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function buildConfirmationEmail({
  to,
  from,
  replyTo,
  firstName,
  caseNumber,
  contactMethod,
}) {
  const safeName = escapeHtml(firstName);
  const safeCaseNumber = escapeHtml(caseNumber);
  const safeContactMethod = escapeHtml(contactMethod || "phone");

  return {
    from,
    to,
    reply_to: replyTo,
    subject: "We received your pre-screen information | Faith Haven House",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#173247;background:#faf8ef;border:1px solid #ded8c5;border-radius:8px">
        <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 20px">Faith Haven House</h1>
        <p>Dear ${safeName},</p>
        <p>Thank you for submitting your initial housing pre-screen. We received your information and created a secure admissions record.</p>
        <div style="background:#fff;padding:16px;margin:20px 0;border:1px solid #ded8c5;border-radius:6px">
          <strong>Your reference number</strong><br>
          <span style="font-family:monospace;font-size:18px">${safeCaseNumber}</span>
        </div>
        <h2 style="font-family:Georgia,serif;font-size:20px">What happens next?</h2>
        <p>Our admissions team will review your pre-screen. If the program may be a fit, a team member will contact you by ${safeContactMethod}.</p>
        <p><strong>Submitting this form does not guarantee placement.</strong> Admission depends on program fit, available space, and review.</p>
        <p>Questions or contact updates? Call <strong>636-577-5876</strong>.</p>
        <p style="font-size:13px;color:#5e7890">Faith Haven House · St. Charles County, Missouri</p>
      </div>
    `,
  };
}

export async function sendConfirmationEmail({
  apiKey,
  idempotencyKey,
  message,
  fetchImpl = fetch,
}) {
  if (!apiKey) throw new Error("Confirmation email is not configured.");

  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Confirmation email provider rejected delivery: ${detail}`);
  }

  const body = await response.json();
  return { sent: true, id: body.id };
}
