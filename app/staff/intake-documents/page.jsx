"use client";

import { useState } from "react";
import { useStaffSession } from "../StaffClientProvider";

const INTAKE_DOCUMENTS = [
  {
    id: "FHH-7.1",
    title: "Admissions Interview Evaluation",
    number: "FHH 7.1",
    version: "v1.0",
    category: "Admissions Documents",
    description: "Used during the admissions interview process to evaluate applicant readiness, fit, and next steps.",
    filename: "FHH_7.1_Admissions_Interview_Evaluation_v1.0.docx",
  },
  {
    id: "FHH-7.2",
    title: "Behavioral Health Admission Readiness Assessment",
    number: "FHH 7.2",
    version: "v1.0",
    category: "Admissions Documents",
    description: "Helps assess behavioral health readiness and support needs during the admissions process.",
    filename: "FHH_7.2_Behavioral_Health_Admission_Readiness_Assessment_v1.0.docx",
  },
  {
    id: "FHH-7.3",
    title: "Admissions Committee Decision Form",
    number: "FHH 7.3",
    version: "v1.0",
    category: "Admissions Documents",
    description: "Used by the admissions committee to document decisions, conditions, approvals, or next steps.",
    filename: "FHH_7.3_Admissions_Committee_Decision_Form_v1.0.docx",
  },
  {
    id: "FHH-7.4",
    title: "Welcome Day Checklist",
    number: "FHH 7.4",
    version: "v1.0",
    category: "Admissions Documents",
    description: "A checklist for preparing and guiding a resident’s first day at Faith Haven House.",
    filename: "FHH_7.4_Welcome_Day_Checklist_v1.0.docx",
  },
  {
    id: "FHH-8.1",
    title: "Resident Intake Application",
    number: "FHH 8.1",
    version: "v1.1",
    category: "Resident Intake Documents",
    description: "Main resident application form for collecting intake details, background information, and applicant responses.",
    filename: "FHH_8.1_Resident_Intake_Application_v1.1.docx",
  },
  {
    id: "FHH-8.2",
    title: "Background Check Acknowledgment",
    number: "FHH 8.2",
    version: "v1.1",
    category: "Resident Intake Documents",
    description: "Confirms applicant acknowledgment of the background check process.",
    filename: "FHH_8.2_Background_Check_Acknowledgment_v1.1.docx",
  },
  {
    id: "FHH-8.3",
    title: "Authorization for Release of Information",
    number: "FHH 8.3",
    version: "v1.1",
    category: "Resident Intake Documents",
    description: "Authorizes Faith Haven House to request or share necessary information with approved parties.",
    filename: "FHH_8.3_Authorization_for_Release_of_Information_v1.1.docx",
  },
  {
    id: "FHH-8.4",
    title: "Drug and Alcohol Testing Consent",
    number: "FHH 8.4",
    version: "v1.1",
    category: "Resident Intake Documents",
    description: "Documents applicant consent for drug and alcohol testing requirements.",
    filename: "FHH_8.4_Drug_and_Alcohol_Testing_Consent_v1.1.docx",
  },
  {
    id: "FHH-PPTX",
    title: "Faith Haven House PowerPoint Template",
    number: "FHH Template",
    version: "v1.0",
    category: "Presentation Templates",
    description: "A branded presentation template for Faith Haven House board updates, donor presentations, community meetings, and internal reports.",
    filename: "Faith-Haven-House-Presentation-Template.pptx",
    customPath: "/Faith-Haven-House-Presentation-Template.pptx"
  }
];

export default function IntakeDocumentsPage() {
  const { activeStaff } = useStaffSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredDocs = INTAKE_DOCUMENTS.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="crm-container">
      {/* Header section */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="crm-title">Intake & Admissions Documents</h1>
        <p className="crm-subtitle">
          Use this document repository to download the current Faith Haven House admissions forms, resident intake forms, and presentation templates. These documents support applicant screening, admissions review, onboarding, consent, and branded reporting.
        </p>
      </div>

      {/* Warning/Info banner */}
      <div className="crm-alert-banner warning" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.25rem" }}>⚠️</span>
        <p style={{ margin: 0, fontWeight: "600" }}>
          Before using a document, confirm you are downloading the latest approved version.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="crm-card"
        style={{
          padding: "1.5rem",
          marginBottom: "2.5rem",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: "280px" }}>
          <label className="crm-label" style={{ fontWeight: "600", color: "var(--color-slate-dark)", display: "block", marginBottom: "0.5rem" }}>
            Search Documents
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, number, or description..."
            className="crm-input"
            style={{ width: "100%", padding: "0.6rem 0.9rem", borderRadius: "6px" }}
          />
        </div>

        {/* Category Selector Tabs */}
        <div>
          <label className="crm-label" style={{ fontWeight: "600", color: "var(--color-slate-dark)", display: "block", marginBottom: "0.5rem" }}>
            Filter by Category
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Resources" },
              { id: "Admissions Documents", label: "Admissions" },
              { id: "Resident Intake Documents", label: "Resident Intake" },
              { id: "Presentation Templates", label: "Presentation Templates" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                type="button"
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  borderRadius: "20px",
                  border: "1px solid var(--color-slate)",
                  cursor: "pointer",
                  backgroundColor: selectedCategory === cat.id ? "var(--color-slate)" : "transparent",
                  color: selectedCategory === cat.id ? "#FFFFFF" : "var(--color-slate-dark)",
                  transition: "all 0.15s ease",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="crm-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "2rem",
                position: "relative",
                borderLeft: doc.category === "Admissions Documents" 
                  ? "4px solid var(--color-teal)" 
                  : doc.category === "Resident Intake Documents"
                  ? "4px solid var(--color-terracotta)"
                  : "4px solid var(--color-slate-dark)",
              }}
            >
              <div>
                {/* Meta Row: Code and Version */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      color: "var(--color-steel)",
                    }}
                  >
                    {doc.number}
                  </span>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: "700",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "4px",
                        backgroundColor: "var(--color-border)",
                        color: "var(--color-charcoal)",
                      }}
                    >
                      {doc.version}
                    </span>
                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: "700",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "20px",
                        backgroundColor: doc.category === "Admissions Documents" 
                          ? "rgba(92, 158, 173, 0.12)" 
                          : doc.category === "Resident Intake Documents"
                          ? "rgba(200, 107, 74, 0.12)"
                          : "rgba(41, 76, 96, 0.12)",
                        color: doc.category === "Admissions Documents" 
                          ? "var(--color-teal)" 
                          : doc.category === "Resident Intake Documents"
                          ? "var(--color-terracotta-dark)"
                          : "var(--color-slate-dark)",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {doc.category === "Admissions Documents" 
                        ? "Admissions" 
                        : doc.category === "Resident Intake Documents"
                        ? "Intake"
                        : "Template"}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "var(--color-slate-dark)",
                    margin: "0 0 0.75rem 0",
                    lineHeight: "1.3",
                  }}
                >
                  {doc.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--color-steel)",
                    lineHeight: "1.5",
                    margin: "0 0 2rem 0",
                  }}
                >
                  {doc.description}
                </p>
              </div>

              {/* Action row: Download button */}
              <a
                href={doc.customPath || `/intake-documents/${doc.filename}`}
                download={doc.filename}
                className="btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  backgroundColor: "var(--color-slate)",
                  color: "#FFFFFF",
                  padding: "0.65rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "opacity 0.15s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {doc.category === "Presentation Templates" ? "📥 Download PowerPoint Template" : "📥 Download Form"}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--color-steel)", margin: 0 }}>
            No documents matched your search criteria.
          </p>
        </div>
      )}
    </main>
  );
}
