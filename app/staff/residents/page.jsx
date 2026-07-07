"use client";

import { useState, useEffect } from "react";
import { getAdmissionsQueue } from "@/lib/crmService";
import { useStaffSession } from "../layout";

export default function ActiveResidentsPage() {
  const { activeStaff } = useStaffSession();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await getAdmissionsQueue();
      // Candidates with status = 'admitted' are active residents
      setResidents(list.filter(c => c.status === "admitted"));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>Loading resident records...</div>;
  }

  return (
    <main className="crm-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="crm-title">Active Residents Directory</h1>
        <p className="crm-subtitle">
          Directory of admitted residents currently active in the Faith Haven House transitional housing program.
        </p>
      </div>

      <div className="crm-card" style={{ padding: "2.5rem" }}>
        {residents.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "8px", color: "var(--color-steel)" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>👥</span>
            <h3 style={{ fontFamily: "var(--font-serif)", color: "var(--color-slate)" }}>No Active Residents</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-steel)", marginTop: "0.25rem" }}>
              Admissions cases will appear here once Welcome Day checkups are completed and candidates are marked as Admitted.
            </p>
          </div>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Case Ref</th>
                  <th>Resident Name</th>
                  <th>Room Assignment</th>
                  <th>Admitted Date</th>
                  <th>Roadmap Integration</th>
                </tr>
              </thead>
              <tbody>
                {residents.map(res => (
                  <tr key={res.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{res.caseNumber}</td>
                    <td style={{ fontWeight: "600" }}>
                      {activeStaff?.role === "read_only_auditor" ? "[Redacted]" : res.applicantName}
                    </td>
                    <td>Room 102</td>
                    <td style={{ color: "var(--color-steel)" }}>
                      {res.admittedAt ? new Date(res.admittedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </td>
                    <td>
                      <span className="crm-badge teal">
                        ROADMAP ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
