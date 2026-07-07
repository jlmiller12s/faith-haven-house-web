"use client";

import { useState, useEffect } from "react";
import { useStaffSession } from "../layout";
import { getStaffProfiles, updateStaffRole } from "@/lib/crmService";

export default function TeamManagementPage() {
  const { activeStaff } = useStaffSession();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadProfiles = async () => {
    const list = await getStaffProfiles();
    setProfiles(list);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleRoleChange = async (staffId, nextRole) => {
    setMessage("");
    const res = await updateStaffRole(staffId, nextRole, activeStaff.id);
    if (res.success) {
      setMessage("✓ Role updated successfully. Audit trail updated.");
      loadProfiles();
    }
  };

  const isSuperAdmin = activeStaff?.role === "super_admin";

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>Loading team roster...</div>;
  }

  if (!isSuperAdmin) {
    return (
      <main style={{ padding: "3rem", textAlign: "center" }}>
        <h2 style={{ color: "#A83232" }}>🔒 Access Denied</h2>
        <p style={{ color: "var(--color-steel)", marginTop: "0.5rem" }}>
          You do not have the super_admin privileges required to inspect or modify CRM staff roles.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2.5rem 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--color-slate)", fontWeight: "800", letterSpacing: "-0.01em" }}>
          Team & Role Management
        </h1>
        <p style={{ color: "var(--color-steel)" }}>
          Manage access controls and roles for admissions staff profiles.
        </p>
      </div>

      {message && (
        <div style={{ backgroundColor: "#F2F9F2", color: "#2E5B2E", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          {message}
        </div>
      )}

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-cloud)", borderBottom: "2px solid var(--color-border)", color: "var(--color-slate)", fontWeight: "700" }}>
              <th style={{ padding: "1rem" }}>Staff Member</th>
              <th style={{ padding: "1rem" }}>Email Address</th>
              <th style={{ padding: "1rem" }}>Assigned Role</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border)", fontSize: "0.9rem" }}>
                <td style={{ padding: "1rem", fontWeight: "600" }}>{p.first_name} {p.last_name}</td>
                <td style={{ padding: "1rem", color: "var(--color-steel)" }}>{p.email}</td>
                <td style={{ padding: "1rem", fontWeight: "600", color: "var(--color-teal)" }}>
                  {p.role.replace(/_/g, " ").toUpperCase()}
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.4rem", borderRadius: "4px", backgroundColor: "#E2F0D9", color: "#385723", fontWeight: "700" }}>
                    ACTIVE
                  </span>
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  {p.id !== activeStaff.id ? (
                    <select
                      value={p.role}
                      onChange={(e) => handleRoleChange(p.id, e.target.value)}
                      style={{ padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--color-border)", fontSize: "0.82rem" }}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="executive_director">Executive Director</option>
                      <option value="admissions_coordinator">Admissions Coordinator</option>
                      <option value="admissions_interviewer">Admissions Interviewer</option>
                      <option value="behavioral_health_clinician">Behavioral Health Clinician</option>
                      <option value="admissions_committee_member">Admissions Committee Member</option>
                      <option value="case_manager">Case Manager</option>
                      <option value="read_only_auditor">Read-Only Auditor</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "var(--color-steel)", fontStyle: "italic" }}>Current Session</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
