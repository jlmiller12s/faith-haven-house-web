export async function submitPrescreen({ payload, createAdmission, sendEmail }) {
  const admission = await createAdmission(payload);
  const baseResult = {
    caseId: admission.case_id,
    caseNumber: admission.case_number,
  };

  if (!payload.email) {
    return {
      ...baseResult,
      emailSent: false,
      emailStatus: "not_requested",
    };
  }

  try {
    await sendEmail({
      admission,
      payload,
      idempotencyKey: `prescreen-confirmation/${admission.case_id}`,
    });
    return { ...baseResult, emailSent: true, emailStatus: "sent" };
  } catch {
    return { ...baseResult, emailSent: false, emailStatus: "delayed" };
  }
}
