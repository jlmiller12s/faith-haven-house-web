"use client";

import { useState, useEffect } from "react";
import { useStaffSession } from "../layout";
import { getAuditLogs } from "@/lib/crmService";

export default function AuditLogsPage() {
  const { activeStaff } = useStaffSession();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await getAuditLogs();
      setLogs(list);
      setLoading(false);
    }
    load();
  }, []);

  const isAuthorized = ["super_admin", "read_only_auditor"].includes(activeStaff?.role);

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>Loading system audit log...</div>;
  }

  if (!isAuthorized) {
    return (
      <main className="crm-container" style={{ textAlign: "center", paddingTop: "5rem" }}>
        <div className="crm-alert-banner warning" style={{ display: "inline-block", maxWidth: "500px" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.5rem 0", color: "var(--color-terracotta-dark)" }}>🔒 Access Denied</h2>
          <p style={{ margin: 0 }}>
            You do not have the authorization roles required to inspect the immutable CRM audit trail logs.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="crm-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="crm-title">System Audit Trail Logs</h1>
        <p className="crm-subtitle">
          Immutable logs of actions (views, downloads, edits, deletions, role updates, logins) recorded across CRM portfolios.
        </p>
      </div>

      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Staff Member</th>
              <th>Action Triggered</th>
              <th>Entity Type</th>
              <th>Metadata Safe Summary</th>
              <th>Client IP Hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--color-steel)" }}>
                  No audit logs recorded in system logs.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: "var(--color-steel)" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: "600" }}>
                    {log.actorEmail}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      backgroundColor: "var(--color-cloud)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontWeight: "600",
                      color: "var(--color-slate-dark)"
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-steel)" }}>
                    {log.entity_type} ({log.entity_id})
                  </td>
                  <td style={{ color: "var(--color-steel)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {JSON.stringify(log.metadata_safe)}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-steel)", fontSize: "0.8rem" }}>
                    {log.ip_hash}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
