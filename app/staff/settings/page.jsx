"use client";

import { useStaffSession } from "../layout";

export default function SettingsPlaceholderPage() {
  const { activeStaff } = useStaffSession();

  return (
    <main style={{ padding: "2.5rem 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--color-slate)", fontWeight: "800", letterSpacing: "-0.01em" }}>
          CRM Settings & Parameter Configuration
        </h1>
        <p style={{ color: "var(--color-steel)" }}>
          Configure workflow checklist items, document upload thresholds, and compliance retention details.
        </p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", padding: "2.5rem", borderRadius: "10px", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontSize: "1.25rem", color: "var(--color-slate)", fontWeight: "700", marginBottom: "1rem" }}>
          Workflow Settings Placeholder
        </h3>
        <p style={{ color: "var(--color-steel)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          This page represents placeholder setup configurations for Document Types, workflow criteria filters, and retention limits.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ border: "1px solid var(--color-border)", borderRadius: "6px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Secure Documents Retention Limits</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Purge old intake scans after 7 years.</p>
            </div>
            <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
              Active (7 Years)
            </button>
          </div>

          <div style={{ border: "1px solid var(--color-border)", borderRadius: "6px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Inactivity Logout Timer</strong>
              <p style={{ fontSize: "0.8rem", color: "var(--color-steel)" }}>Force log out after 15 minutes of inactivity.</p>
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
