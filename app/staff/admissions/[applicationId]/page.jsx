"use client";

import { use, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { admissionsDocuments } from "@/components/admissions/admissionsData";
import CrmIcon from "@/lib/crmIcons";

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
        <div className="crm-alert-banner warning" style={{ display: "flex", gap: "0.5rem", alignItems: "start" }}>
          <CrmIcon name="lock" style={{ width: "1.25rem", height: "1.25rem", color: "var(--color-terracotta-dark)", marginTop: "0.15rem", flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.5rem", margin: 0, fontFamily: "var(--font-serif)" }}>
              Secure Admissions File Review Placeholder
            </h2>
            <p style={{ fontSize: "0.9rem", lineHeight: "1.5", margin: "0.25rem 0 0 0" }}>
              <strong>Developer Warning:</strong> This is a placeholder layout for review of <code>{applicationId}</code>. 
              Do not implement public download links for admissions documents. The full application files contain sensitive personal data (SSN, ID scans, background check logs, drug screen audits) and must be hosted on secure server environments with strict role-based access checks.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
          
          {/* Back button */}
          <div>
            <Link href="/staff/admissions" className="btn btn-outline" style={{ display: "inline-flex", padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}>
              &larr; Back to Admissions List
            </Link>
          </div>

          <div className="crm-card" style={{ padding: "2rem" }}>
            <h1 className="crm-card-title" style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
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
                      backgroundColor: isComplete ? "rgba(92, 158, 173, 0.05)" : "#FFFFFF"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span className="crm-badge slate">
                          Ref {doc.binderReference}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-steel)" }}>
                          Doc {doc.documentNumber}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--color-charcoal)", marginBottom: "0.2rem" }}>
                        {doc.title}
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--color-steel)", margin: 0 }}>
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
                          cursor: "pointer"
                        }}
                      >
                        {isComplete ? "Complete" : "Mark Received"}
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
