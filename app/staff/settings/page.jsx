"use client";

import { useStaffSession } from "../StaffClientProvider";

export default function SettingsPlaceholderPage() {
  const { activeStaff } = useStaffSession();

  return (
    <main className="crm-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="crm-title">CRM Settings & Parameter Configuration</h1>
        <p className="crm-subtitle">
          Configure workflow checklist items, document upload thresholds, and compliance retention details.
        </p>
      </div>

      <div className="crm-card" style={{ padding: "2.5rem" }}>
        <h3 className="crm-card-title">
          Workflow Settings Placeholder
        </h3>
        <p style={{ color: "var(--color-steel)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          This page represents placeholder setup configurations for Document Types, workflow criteria filters, and retention limits.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "6px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-ivory)" }}>
            <div>
              <strong style={{ color: "var(--color-slate-dark)" }}>Secure Documents Retention Limits</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--color-steel)", margin: "0.15rem 0 0 0" }}>Purge old intake scans after 7 years.</p>
            </div>
            <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
              Active (7 Years)
            </button>
          </div>

          <div style={{ border: "1px solid var(--color-border)", borderRadius: "6px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--color-ivory)" }}>
            <div>
              <strong style={{ color: "var(--color-slate-dark)" }}>Inactivity Logout Timer</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--color-steel)", margin: "0.15rem 0 0 0" }}>Force log out after 15 minutes of inactivity.</p>
            </div>
            <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
              Active (15 Min)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
