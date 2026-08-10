function errorResult(prefix, error) {
  return {
    success: false,
    error: `${prefix}: ${error?.message || "Unknown database error"}`,
  };
}

export async function persistTask({ task, insertTask }) {
  const { id: _ignoredId, ...databaseTask } = task;
  const { data, error } = await insertTask(databaseTask);

  if (error) return errorResult("Unable to create the task", error);

  return {
    success: true,
    taskId: data?.id,
  };
}

export async function persistTaskToggle({
  task,
  updateTask,
  now = () => new Date().toISOString(),
}) {
  const nextStatus = task.status === "completed" ? "todo" : "completed";
  const payload = {
    status: nextStatus,
    completed_at: nextStatus === "completed" ? now() : null,
    updated_at: now(),
  };
  const { data, error } = await updateTask(task.id, payload);

  if (error) return errorResult("Unable to update the task", error);

  return {
    success: true,
    task: data || { ...task, ...payload },
    status: nextStatus,
  };
}

