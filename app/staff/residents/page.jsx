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
    <main style={{ padding: "2.5rem 3rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--color-slate)", fontWeight: "800", letterSpacing: "-0.01em" }}>
          Active Residents Directory
        </h1>
        <p style={{ color: "var(--color-steel)" }}>
          Directory of admitted residents currently active in the Faith Haven House transitional housing program.
        </p>
      </div>

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", boxShadow: "var(--shadow-sm)", padding: "2.5rem" }}>
        {residents.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "8px", color: "var(--color-steel)" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "1rem" }}>👥</span>
            <h3>No Active Residents</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--color-steel)", marginTop: "0.25rem" }}>
              Admissions cases will appear here once Welcome Day checkups are completed and candidates are marked as Admitted.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-slate)", fontWeight: "700" }}>
                  <th style={{ padding: "0.8rem" }}>Case Ref</th>
                  <th style={{ padding: "0.8rem" }}>Resident Name</th>
                  <th style={{ padding: "0.8rem" }}>Room Assignment</th>
                  <th style={{ padding: "0.8rem" }}>Admitted Date</th>
                  <th style={{ padding: "0.8rem" }}>Roadmap Integration</th>
                </tr>
              </thead>
              <tbody>
                {residents.map(res => (
                  <tr key={res.id} style={{ borderBottom: "1px solid var(--color-border)", fontSize: "0.9rem" }}>
                    <td style={{ padding: "1rem 0.8rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{res.caseNumber}</td>
                    <td style={{ padding: "1rem 0.8rem", fontWeight: "600" }}>
                      {activeStaff?.role === "read_only_auditor" ? "[Redacted]" : res.applicantName}
                    </td>
                    <td style={{ padding: "1rem 0.8rem" }}>Room 102</td>
                    <td style={{ padding: "1rem 0.8rem", color: "var(--color-steel)" }}>
                      {res.admittedAt ? new Date(res.admittedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </td>
                    <td style={{ padding: "1rem 0.8rem" }}>
                      <span style={{ fontSize: "0.75rem", padding: "0.15rem 0.5rem", borderRadius: "4px", backgroundColor: "#E2F0D9", color: "#385723", fontWeight: "700" }}>
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
