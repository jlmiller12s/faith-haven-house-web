export const FOLLOW_UP_TASK_TITLES = Object.freeze([
  "Review Prescreen Answers",
  "Review Application",
  "Send Background Check Link",
  "Complete Clinical",
  "Interview",
  "Decide on Admittance",
  "Prepare for Welcome",
]);

function readableStatus(status) {
  return String(status || "unknown").replace(/_/g, " ");
}

export function buildStatusActivitySummary({ oldStatus, nextStatus, reason }) {
  const base = `Case status changed from ${readableStatus(oldStatus)} to ${readableStatus(nextStatus)}.`;
  const savedReason = String(reason || "").trim();
  return savedReason ? `${base} Reason / notes: ${savedReason}` : base;
}

export async function persistCaseNote({ note, insertNote }) {
  const { id: _ignoredId, ...databaseNote } = note;
  const { data, error } = await insertNote(databaseNote);

  if (error) {
    return {
      success: false,
      error: `Unable to save the note: ${error.message || "Unknown database error"}`,
    };
  }

  return {
    success: true,
    noteId: data?.id,
  };
}
