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

const WORKFLOW_NOTE_MARKER = " Reason / notes: ";

export function buildStatusActivitySummary({ oldStatus, nextStatus, reason }) {
  const base = `Case status changed from ${readableStatus(oldStatus)} to ${readableStatus(nextStatus)}.`;
  const savedReason = String(reason || "").trim();
  return savedReason ? `${base}${WORKFLOW_NOTE_MARKER}${savedReason}` : base;
}

export function getWorkflowStatusNote(summary) {
  const savedSummary = String(summary || "");
  const markerIndex = savedSummary.indexOf(WORKFLOW_NOTE_MARKER);
  return markerIndex === -1
    ? ""
    : savedSummary.slice(markerIndex + WORKFLOW_NOTE_MARKER.length).trim();
}

export function stripWorkflowStatusNote(summary) {
  const savedSummary = String(summary || "");
  const markerIndex = savedSummary.indexOf(WORKFLOW_NOTE_MARKER);
  return markerIndex === -1 ? savedSummary : savedSummary.slice(0, markerIndex).trim();
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

export async function persistCaseNoteDelete({ noteId, deleteNote }) {
  const { data, error } = await deleteNote(noteId);

  if (error) {
    return {
      success: false,
      error: `Unable to delete the note: ${error.message || "Unknown database error"}`,
    };
  }

  if (!data) {
    return {
      success: false,
      error: "The note was not found or you do not have permission to delete it.",
    };
  }

  return { success: true, note: data };
}

export async function persistWorkflowStatusNoteDelete({ eventId, summary, updateEvent }) {
  if (!getWorkflowStatusNote(summary)) {
    return {
      success: false,
      error: "This workflow update does not have a saved reason / note to delete.",
    };
  }

  const { data, error } = await updateEvent(eventId, stripWorkflowStatusNote(summary));

  if (error) {
    return {
      success: false,
      error: `Unable to delete the workflow note: ${error.message || "Unknown database error"}`,
    };
  }

  if (!data) {
    return {
      success: false,
      error: "The workflow note was not found or you do not have permission to delete it.",
    };
  }

  return { success: true };
}
