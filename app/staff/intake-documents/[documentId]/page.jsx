"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStaffSession } from "../../StaffClientProvider";
import {
  canManageElectronicForm,
  getElectronicFormDefinition,
  validateElectronicForm,
} from "@/lib/electronicIntakeForms.mjs";
import {
  getAdmissionsQueue,
  getElectronicIntakeForm,
  saveElectronicIntakeForm,
} from "@/lib/crmService";

function initialResponses(form, selectedCase, activeStaff) {
  const values = {};
  for (const field of form.fields) {
    if (field.type === "checkbox") values[field.id] = false;
    if (field.autoFill === "applicantName") values[field.id] = selectedCase?.applicantName || "";
    if (field.autoFill === "staffName") values[field.id] = activeStaff ? `${activeStaff.first_name} ${activeStaff.last_name}`.trim() : "";
  }
  return values;
}

export default function ElectronicIntakeFormPage({ params }) {
  const { documentId } = use(params);
  const form = useMemo(() => getElectronicFormDefinition(decodeURIComponent(documentId)), [documentId]);
  const { activeStaff } = useStaffSession();
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [responses, setResponses] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedStatus, setSavedStatus] = useState(null);
  const [savedUpdatedAt, setSavedUpdatedAt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canUseForm = canManageElectronicForm(form, activeStaff?.role);
  const selectedCase = cases.find((item) => item.id === selectedCaseId);

  useEffect(() => {
    async function loadCases() {
      try {
        const queue = await getAdmissionsQueue();
        setCases(queue.filter((item) => item.status !== "closed"));
      } catch (error) {
        setFeedback({ type: "error", text: error?.message || "Applicant files could not be loaded." });
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  useEffect(() => {
    if (!selectedCaseId || !form || !canUseForm) return;
    let cancelled = false;
    async function loadForm() {
      setLoading(true);
      setFeedback(null);
      setFieldErrors({});
      setSavedStatus(null);
      setSavedUpdatedAt(null);
      try {
        const saved = await getElectronicIntakeForm(selectedCaseId, form.documentTypeId);
        if (cancelled) return;
        setResponses(saved?.responses || initialResponses(form, selectedCase, activeStaff));
        setSavedStatus(saved?.status || null);
        setSavedUpdatedAt(saved?.updated_at || null);
      } catch (error) {
        if (!cancelled) setFeedback({ type: "error", text: error?.message || "This form could not be loaded." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadForm();
    return () => { cancelled = true; };
  }, [activeStaff, canUseForm, form, selectedCaseId]);

  if (!form) {
    return <main className="crm-container"><div className="crm-card"><h1 className="crm-title">Form not found</h1><p>This electronic form is not available.</p><Link href="/staff/intake-documents" className="btn btn-outline">Back to documents</Link></div></main>;
  }

  const updateResponse = (fieldId, value) => {
    setResponses((current) => ({ ...current, [fieldId]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  };

  const save = async (status) => {
    if (!selectedCaseId) {
      setFeedback({ type: "error", text: "Choose an applicant file before saving." });
      return;
    }

    if (status === "completed") {
      const validation = validateElectronicForm(form.id, responses);
      if (!validation.success) {
        const errors = Object.fromEntries(validation.errors.map((error) => [error.field, error.message]));
        setFieldErrors(errors);
        setFeedback({ type: "error", text: `Complete the ${validation.errors.length} required field${validation.errors.length === 1 ? "" : "s"} highlighted below.` });
        window.requestAnimationFrame(() => document.getElementById(`field-${validation.errors[0].field}`)?.focus());
        return;
      }
    }

    setSaving(true);
    setFeedback(null);
    try {
      const result = await saveElectronicIntakeForm({
        caseId: selectedCaseId,
        documentTypeId: form.documentTypeId,
        formVersion: form.version,
        responses,
        status,
        actorId: activeStaff.id,
        expectedUpdatedAt: savedUpdatedAt,
      });
      if (!result.success) throw new Error(result.error || "The form could not be saved.");
      setSavedStatus(status);
      setSavedUpdatedAt(result.updatedAt || savedUpdatedAt);
      setFeedback({
        type: result.warning ? "warning" : "success",
        text: result.warning || (status === "completed" ? "Form completed and added to the applicant file." : "Draft saved. You can return and finish it later."),
      });
    } catch (error) {
      setFeedback({ type: "error", text: error?.message || "The form could not be saved." });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const error = fieldErrors[field.id];
    const describedBy = error ? `error-${field.id}` : undefined;
    if (field.type === "checkbox") {
      return (
        <label className={`electronic-form-checkbox ${error ? "has-error" : ""}`} key={field.id}>
          <input id={`field-${field.id}`} type="checkbox" checked={responses[field.id] === true} disabled={saving || savedStatus === "completed"} onChange={(event) => updateResponse(field.id, event.target.checked)} aria-describedby={describedBy} />
          <span>{field.label}{field.required && <span className="electronic-required" aria-hidden="true"> *</span>}</span>
          {error && <small id={`error-${field.id}`}>{error}</small>}
        </label>
      );
    }

    const common = {
      id: `field-${field.id}`,
      value: responses[field.id] || "",
      onChange: (event) => updateResponse(field.id, event.target.value),
      className: error ? "has-error" : "",
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy,
      disabled: saving || savedStatus === "completed",
    };

    return (
      <div className={`electronic-form-field ${field.type === "textarea" ? "is-wide" : ""}`} key={field.id}>
        <label htmlFor={`field-${field.id}`}>{field.label}{field.required && <span className="electronic-required" aria-hidden="true"> *</span>}</label>
        {field.type === "textarea" ? <textarea {...common} rows={4} /> : field.type === "select" ? (
          <select {...common}><option value="">Choose an option</option>{field.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
        ) : (
          <input {...common} type={field.sensitive ? "password" : field.type} inputMode={field.inputMode} autoComplete={field.sensitive ? "off" : undefined} />
        )}
        {field.sensitive && <small>Stored only in the protected applicant file.</small>}
        {error && <small className="electronic-field-error" id={`error-${field.id}`}>{error}</small>}
      </div>
    );
  };

  return (
    <main className="crm-container electronic-form-page">
      <Link href="/staff/intake-documents" className="electronic-form-back">← Back to intake documents</Link>
      <header className="electronic-form-header">
        <div>
          <p>{form.number} · Version {form.version}</p>
          <h1>{form.title}</h1>
          <span>Completed by {form.completedBy}</span>
        </div>
        {savedStatus && <strong className={`electronic-status ${savedStatus}`}>{savedStatus}</strong>}
      </header>

      <div className="electronic-form-purpose"><strong>Purpose</strong><p>{form.purpose}</p></div>
      {!canUseForm && (
        <div className="crm-alert-banner error" role="alert">
          {activeStaff?.role === "read_only_auditor"
            ? "Audit-only accounts cannot open applicant intake forms."
            : "This clinical form is restricted to a licensed behavioral health professional or super administrator."}
        </div>
      )}
      {feedback && <div className={`crm-alert-banner ${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.text}</div>}

      {canUseForm && (
        <>
          <section className="electronic-case-picker">
            <label htmlFor="electronic-case">Applicant file</label>
            <select id="electronic-case" value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)} disabled={saving}>
              <option value="">Choose an applicant</option>
              {cases.map((item) => <option key={item.id} value={item.id}>{item.applicantName} · {item.caseNumber}</option>)}
            </select>
            {selectedCase && <Link href={`/staff/admissions/${selectedCase.id}`}>Open applicant file</Link>}
          </section>

          {!loading && cases.length === 0 && <div className="crm-card electronic-empty"><h2>No active applicant files</h2><p>Create or receive a pre-screen submission before completing an intake form.</p><Link href="/staff/admissions" className="btn btn-outline">Go to admissions</Link></div>}
          {loading && <div className="electronic-form-loading" role="status">Loading…</div>}

          {!loading && selectedCaseId && (
            <form className="electronic-form" onSubmit={(event) => { event.preventDefault(); save("completed"); }} noValidate>
              {form.sections.map((section, index) => (
                <fieldset key={section.id} className="electronic-form-section">
                  <legend><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</legend>
                  {section.description && <p className="electronic-section-description">{section.description}</p>}
                  {section.id === "certification" && <div className="electronic-certification">{form.certification}</div>}
                  <div className="electronic-form-grid">{section.fields.map(renderField)}</div>
                </fieldset>
              ))}
              <div className="electronic-form-actions">
                <p><strong>{selectedCase.applicantName}</strong><span>{savedStatus === "draft" ? "Draft saved" : savedStatus === "completed" ? "Completed form" : "Not yet saved"}</span></p>
                {savedStatus === "completed" && <strong>This completed form is locked to protect the signed record.</strong>}
                {savedStatus !== "completed" && <>
                <button type="button" className="btn btn-outline" disabled={saving} onClick={() => save("draft")}>{saving ? "Saving…" : "Save draft"}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Complete form"}</button>
                </>}
              </div>
            </form>
          )}
        </>
      )}
    </main>
  );
}
