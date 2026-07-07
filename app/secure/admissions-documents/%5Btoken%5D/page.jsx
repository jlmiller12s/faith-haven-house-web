"use client";

import { use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SecureDocumentGateway({ params }) {
  const resolvedParams = use(params);
  const { token } = resolvedParams;

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
            🔒 Secure Admissions Document Gateway (Inactive)
          </h2>
          <p style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
            <strong>Developer Warning:</strong> This is a secure document upload gateway placeholder for token <code>{token}</code>. 
            Do not collect real Social Security Numbers, state ID scans, medical details, background check consent forms, or signature files until secure database storage, 
            encryption-at-rest (such as AWS KMS or Supabase vault), strict CORS policies, and server-side compliance logs are configured.
          </p>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "12px", boxShadow: "var(--shadow-md)" }}>
          <h1 style={{ fontSize: "1.75rem", color: "var(--color-slate)", fontWeight: "700", marginBottom: "0.5rem" }}>
            Secure Document Upload Gate
          </h1>
          <p style={{ color: "var(--color-steel)", marginBottom: "2rem" }}>
            Applicants use this private gateway link to upload required admissions documents directly to their file after initial staff review.
          </p>

          <div style={{
            border: "2px dashed var(--color-border)",
            borderRadius: "8px",
            padding: "3rem 1rem",
            textAlign: "center",
            backgroundColor: "var(--color-cloud)"
          }}>
            <span style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }}>📁</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--color-slate)", marginBottom: "0.5rem" }}>
              Upload Intake Files
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
              Securely drag and drop your completed Resident Intake Application, ID scans, or consent forms here.
            </p>
            <button className="btn btn-primary" disabled style={{ cursor: "not-allowed", opacity: 0.6 }}>
              Select Files (Gateway Inactive)
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
