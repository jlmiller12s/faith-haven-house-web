"use client";

import { useState, useEffect } from "react";
import { useStaffSession } from "../layout";
import { getStaffProfiles, updateStaffRole } from "@/lib/crmService";
import CrmIcon from "@/lib/crmIcons";

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
      <main className="crm-container" style={{ textAlign: "center", paddingTop: "5rem" }}>
        <div className="crm-alert-banner warning" style={{ display: "inline-block", maxWidth: "500px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
            <CrmIcon name="lock" style={{ width: "1.5rem", height: "1.5rem", color: "var(--color-terracotta-dark)" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0, color: "var(--color-terracotta-dark)", fontFamily: "var(--font-serif)" }}>Access Denied</h2>
          </div>
          <p style={{ margin: 0 }}>
            You do not have the super_admin privileges required to inspect or modify CRM staff roles.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="crm-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="crm-title">Team & Role Management</h1>
        <p className="crm-subtitle">
          Manage access controls and roles for admissions staff profiles.
        </p>
      </div>

      {message && (
        <div className="crm-alert-banner info" style={{ marginBottom: "1.5rem" }}>
          {message}
        </div>
      )}

      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: "600" }}>{p.first_name} {p.last_name}</td>
                <td style={{ color: "var(--color-steel)" }}>{p.email}</td>
                <td style={{ fontWeight: "600", color: "var(--color-teal)" }}>
                  {p.role.replace(/_/g, " ").toUpperCase()}
                </td>
                <td>
                  <span className="crm-badge teal">
                    ACTIVE
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  {p.id !== activeStaff.id ? (
                    <select
                      value={p.role}
                      onChange={(e) => handleRoleChange(p.id, e.target.value)}
                      className="crm-select"
                      style={{ padding: "0.35rem 0.5rem", fontSize: "0.82rem", width: "auto", display: "inline-block" }}
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
