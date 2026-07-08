export function parseSubmissionResponse(httpOk, body) {
  if (httpOk && body?.success === true && body?.caseNumber) {
    return {
      ok: true,
      caseNumber: body.caseNumber,
      emailSent: body.emailSent === true,
    };
  }

  return {
    ok: false,
    error:
      body?.error || "We could not confirm that your pre-screen was saved.",
  };
}
