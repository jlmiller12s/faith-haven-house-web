"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const MOCK_APPLICANTS = [
  { id: "app-101", name: "John Doe", date: "2026-07-05", status: "pre_screen_submitted" },
  { id: "app-102", name: "Robert Smith", date: "2026-07-02", status: "admissions_interview_pending" },
  { id: "app-103", name: "David Johnson", date: "2026-06-29", status: "committee_review_pending" },
  { id: "app-104", name: "Michael Brown", date: "2026-06-25", status: "welcome_day_scheduled" }
];

export default function StaffAdmissionsDashboard() {
  return (
    <>
      <Header />
      <main className="container" style={{ marginTop: "8rem", marginBottom: "8rem" }}>
        <div style={{
          backgroundColor: "#FCE8E6",
          border: "1px solid #F5C2C1",
          color: "#A83232",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            🔒 Staff-Only Secure Route Placeholder
          </h2>
          <p style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
            <strong>Developer Warning:</strong> This route acts as a placeholder architecture for the future Secure Admissions Workflow. 
            Do not link this route in any public menus or directories. Database endpoints, user authentication (Next-Auth or similar), 
            clinical role authorization checks, and secure HIPAA-compliant encrypted storage must be integrated before this dashboard becomes operational.
          </p>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "12px", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "2rem", color: "var(--color-slate)", fontWeight: "700" }}>Admissions Management</h1>
            <span style={{ fontSize: "0.85rem", backgroundColor: "var(--color-cloud)", padding: "0.4rem 0.8rem", borderRadius: "20px", fontWeight: "600" }}>
              Staff View (Inactive)
            </span>
          </div>

          <p style={{ color: "var(--color-steel)", marginBottom: "2rem" }}>
            Once operational, this dashboard lists initial interest submissions, tracks document status flags, and allows admissions team members to schedule interviews and record committee decisions.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-slate)" }}>
                  <th style={{ padding: "0.8rem" }}>Applicant</th>
                  <th style={{ padding: "0.8rem" }}>Date Submitted</th>
                  <th style={{ padding: "0.8rem" }}>Current Status</th>
                  <th style={{ padding: "0.8rem" }}>Review Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_APPLICANTS.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid var(--color-border)", verticalAlign: "middle" }}>
                    <td style={{ padding: "1rem 0.8rem", fontWeight: "600" }}>{app.name}</td>
                    <td style={{ padding: "1rem 0.8rem", color: "var(--color-steel)" }}>{app.date}</td>
                    <td style={{ padding: "1rem 0.8rem" }}>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "12px",
                        backgroundColor: "#E2F0D9",
                        color: "#385723",
                        textTransform: "uppercase"
                      }}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 0.8rem" }}>
                      <Link 
                        href={`/staff/admissions/${app.id}`} 
                        className="btn btn-outline" 
                        style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem", cursor: "pointer" }}
                      >
                        Inspect Application &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
