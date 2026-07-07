"use client";

import { use, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { admissionsDocuments } from "@/components/admissions/admissionsData";

export default function StaffApplicationDetails({ params }) {
  const resolvedParams = use(params);
  const { applicationId } = resolvedParams;
  const [docList, setDocList] = useState(admissionsDocuments);

  // Toggle checklist mock state
  const handleToggleStatus = (id) => {
    setDocList(prev => prev.map(doc => {
      if (doc.id === id) {
        const nextStatus = doc.status === "complete" ? "not_requested" : "complete";
        return { ...doc, status: nextStatus };
      }
      return doc;
    }));
  };

  return (
    <>
      <Header />
      <main className="container" style={{ marginTop: "8rem", marginBottom: "8rem" }}>
        
        {/* Warning Banner */}
        <div style={{
          backgroundColor: "#FCE8E6",
          border: "1px solid #F5C2C1",
          color: "#A83232",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            🔒 Secure Admissions File Review Placeholder
          </h2>
          <p style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
            <strong>Developer Warning:</strong> This is a placeholder layout for review of <code>{applicationId}</code>. 
            Do not implement public download links for admissions documents. The full application files contain sensitive personal data (SSN, ID scans, background check logs, drug screen audits) and must be hosted on secure server environments with strict role-based access checks.
          </p>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
          
          {/* Back button */}
          <div>
            <Link href="/staff/admissions" className="btn btn-outline" style={{ display: "inline-flex", padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}>
              &larr; Back to Admissions List
            </Link>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "12px", boxShadow: "var(--shadow-md)" }}>
            <h1 style={{ fontSize: "1.75rem", color: "var(--color-slate)", fontWeight: "700", marginBottom: "0.5rem" }}>
              Applicant Intake Checklist: {applicationId}
            </h1>
            <p style={{ color: "var(--color-steel)", marginBottom: "1.5rem" }}>
              Review document checklists and verify readiness indicators for this file.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {docList.map((doc) => {
                const isComplete = doc.status === "complete";
                return (
                  <div 
                    key={doc.id} 
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: isComplete ? "#F5FAF5" : "#FFFFFF"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", backgroundColor: "var(--color-cloud)", color: "var(--color-slate)", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                          Ref {doc.binderReference}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>
                          Doc {doc.documentNumber}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--color-charcoal)", marginBottom: "0.2rem" }}>
                        {doc.title}
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--color-steel)" }}>
                        Completed By: <strong>{doc.completedBy}</strong> | Visibility: <code>{doc.visibility}</code>
                      </p>
                    </div>

                    <div>
                      <button
                        onClick={() => handleToggleStatus(doc.id)}
                        className={`btn ${isComplete ? "btn-primary" : "btn-outline"}`}
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          borderColor: isComplete ? "var(--color-teal)" : "var(--color-border)",
                          backgroundColor: isComplete ? "var(--color-teal)" : "transparent",
                          color: isComplete ? "#FFFFFF" : "var(--color-charcoal)",
                          cursor: "pointer"
                        }}
                      >
                        {isComplete ? "✓ Complete" : "Mark Received"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
