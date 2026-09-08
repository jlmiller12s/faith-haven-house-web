"use client";

import { useState, useTransition } from "react";
import { deleteApplication } from "./actions";
import styles from "./volunteers.module.css";

export default function DeleteApplication({ id, name }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    setError("");
    startTransition(async () => {
      try {
        const result = await deleteApplication(id);
        if (!result.ok) setError(result.error);
      } catch {
        setError("The application could not be deleted. Please try again.");
      }
    });
  }

  return <div className={styles.deleteArea}>
    {confirming ? <>
      <p>Delete the application from <strong>{name}</strong>? This permanently removes the submission and cannot be undone.</p>
      <div className={styles.deleteButtons}>
        <button type="button" className={styles.deleteButton} onClick={remove} disabled={pending}>{pending ? "Deleting…" : "Confirm delete"}</button>
        <button type="button" className={styles.cancelButton} onClick={() => { setConfirming(false); setError(""); }} disabled={pending}>Cancel</button>
      </div>
    </> : <button type="button" className={styles.deleteButton} onClick={() => setConfirming(true)} aria-label={`Delete application from ${name}`}>Delete application</button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
