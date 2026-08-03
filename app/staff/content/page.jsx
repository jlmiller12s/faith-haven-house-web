"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStaffSession } from "@/app/staff/StaffClientProvider";

export default function WebsiteContentManager() {
  const { activeStaff } = useStaffSession();
  const [fields, setFields] = useState([]);
  const [content, setContent] = useState({});
  const [saved, setSaved] = useState({});
  const [page, setPage] = useState("Homepage");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [busyKey, setBusyKey] = useState("");
  const fileRefs = useRef({});

  useEffect(() => {
    fetch("/api/staff/content")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to load website content.");
        setFields(payload.fields);
        setContent(payload.content);
        setSaved(payload.content);
      })
      .catch((error) => setStatus({ type: "error", message: error.message }));
  }, []);

  const pages = [...new Set(fields.map((field) => field.page))];
  const visible = fields.filter((field) => field.page === page);
  const sections = useMemo(
    () => [...new Set(visible.map((field) => field.section))],
    [visible]
  );

  async function saveField(field) {
    setBusyKey(field.key);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch("/api/staff/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: field.key, value: content[field.key] }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to publish this change.");
      setSaved((current) => ({ ...current, [field.key]: content[field.key] }));
      setStatus({ type: "success", message: `${field.label} published.` });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setBusyKey("");
    }
  }

  async function uploadImage(field, file) {
    if (!file) return;
    setBusyKey(field.key);
    setStatus({ type: "", message: "" });
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/staff/content/media", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Image upload failed.");
      setContent((current) => ({ ...current, [field.key]: payload.url }));
      setStatus({ type: "success", message: "Image uploaded. Select Publish change to make it live." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setBusyKey("");
    }
  }

  if (!["super_admin", "executive_director"].includes(activeStaff?.role)) {
    return <main className="cms-shell"><h1>Website Content</h1><p>You do not have permission to edit the public website.</p></main>;
  }

  return (
    <main className="cms-shell">
      <div className="cms-heading">
        <div>
          <span className="section-eyebrow">Public Website CMS</span>
          <h1>Website Content</h1>
          <p>Update public text and photos without changing the site layout.</p>
        </div>
        <a className="btn btn-outline" href={page === "About" ? "/about" : "/"} target="_blank" rel="noreferrer">
          Preview {page} ↗
        </a>
      </div>

      {status.message && <div className={`cms-alert ${status.type}`} role="status">{status.message}</div>}

      <div className="cms-page-tabs" role="tablist">
        {pages.map((item) => (
          <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>
            {item}
          </button>
        ))}
      </div>

      {sections.map((section) => (
        <section className="cms-section" key={section}>
          <div className="cms-section-title">
            <h2>{section}</h2>
            <span>{visible.filter((field) => field.section === section).length} editable item(s)</span>
          </div>
          {visible.filter((field) => field.section === section).map((field) => {
            const dirty = content[field.key] !== saved[field.key];
            return (
              <div className="cms-field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea id={field.key} rows={5} value={content[field.key] || ""} onChange={(event) => setContent({ ...content, [field.key]: event.target.value })} />
                ) : field.type === "image" ? (
                  <div className="cms-image-row">
                    {content[field.key] ? (
                      <img src={content[field.key]} alt={`${field.label} preview`} />
                    ) : (
                      <div className="cms-image-placeholder">No image uploaded</div>
                    )}
                    <div>
                      <input ref={(node) => { fileRefs.current[field.key] = node; }} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" hidden onChange={(event) => uploadImage(field, event.target.files?.[0])} />
                      <button type="button" className="btn btn-secondary" disabled={busyKey === field.key} onClick={() => fileRefs.current[field.key]?.click()}>
                        {busyKey === field.key ? "Uploading…" : "Replace image"}
                      </button>
                      <small>JPG, PNG, WebP, AVIF, or GIF · maximum 5 MB</small>
                    </div>
                  </div>
                ) : (
                  <input id={field.key} type="text" value={content[field.key] || ""} onChange={(event) => setContent({ ...content, [field.key]: event.target.value })} />
                )}
                <div className="cms-field-actions">
                  <span>{dirty ? "Unpublished change" : "Published"}</span>
                  <button type="button" className="btn btn-primary" disabled={!dirty || busyKey === field.key} onClick={() => saveField(field)}>
                    {busyKey === field.key ? "Publishing…" : "Publish change"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </main>
  );
}
