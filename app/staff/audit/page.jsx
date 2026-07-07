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
      <main style={{ padding: "3rem", textAlign: "center" }}>
        <h2 style={{ color: "#A83232" }}>🔒 Access Denied</h2>
        <p style={{ color: "var(--color-steel)", marginTop: "0.5rem" }}>
          You do not have the authorization roles required to inspect the immutable CRM audit trail logs.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2.5rem 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--color-slate)", fontWeight: "800", letterSpacing: "-0.01em" }}>
          System Audit Trail Logs
        </h1>
        <p style={{ color: "var(--color-steel)" }}>
          Immutable logs of actions (views, downloads, edits, deletions, role updates, logins) recorded across CRM portfolios.
        </p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-cloud)", borderBottom: "2px solid var(--color-border)", color: "var(--color-slate)", fontWeight: "700" }}>
              <th style={{ padding: "1rem" }}>Timestamp</th>
              <th style={{ padding: "1rem" }}>Staff Member</th>
              <th style={{ padding: "1rem" }}>Action Triggered</th>
              <th style={{ padding: "1rem" }}>Entity Type</th>
              <th style={{ padding: "1rem" }}>Metadata Safe Summary</th>
              <th style={{ padding: "1rem" }}>Client IP Hash</th>
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
                <tr key={log.id} style={{ borderBottom: "1px solid var(--color-border)", fontSize: "0.85rem", verticalAlign: "middle" }}>
                  <td style={{ padding: "1rem", color: "var(--color-steel)" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "1rem", fontWeight: "600" }}>
                    {log.actorEmail}
                  </td>
                  <td style={{ padding: "1rem" }}>
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
                  <td style={{ padding: "1rem", color: "var(--color-steel)" }}>
                    {log.entity_type} ({log.entity_id})
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-steel)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {JSON.stringify(log.metadata_safe)}
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", color: "var(--color-steel)", fontSize: "0.8rem" }}>
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
