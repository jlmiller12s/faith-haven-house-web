"use client";

import { useState, useEffect } from "react";
import { useStaffSession } from "./layout";
import { getAdmissionsQueue, getCaseDetails } from "@/lib/crmService";
import Link from "next/link";

export default function StaffDashboard() {
  const { activeStaff } = useStaffSession();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await getAdmissionsQueue();
      // Fetch full details dynamically to simulate count logic
      const fullDetails = await Promise.all(list.map(c => getCaseDetails(c.id)));
      setCases(fullDetails.filter(Boolean));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
        Loading dashboard metrics...
      </div>
    );
  }

  // Calculate generic counts for the metrics grid
  const preScreenCount = cases.filter(c => c.case.status === "pre_screen_received").length;
  const followUpCount = cases.filter(c => c.case.status === "staff_follow_up").length;
  const docsPendingCount = cases.filter(c => ["secure_documents_requested", "documents_in_progress"].includes(c.case.status)).length;
  const interviewCount = cases.filter(c => c.case.status === "admissions_interview_pending").length;
  const committeeCount = cases.filter(c => c.case.status === "committee_review_pending").length;
  const welcomeCount = cases.filter(c => c.case.status === "welcome_day_scheduled").length;

  // Filter My Work cases based on role
  const myAssignedCases = cases.filter(c => {
    if (activeStaff?.role === "admissions_coordinator") return c.case.assignedCoordinatorId === activeStaff.id;
    if (activeStaff?.role === "admissions_interviewer") return c.case.assignedInterviewerId === activeStaff.id;
    if (activeStaff?.role === "behavioral_health_clinician") return c.case.assignedClinicianId === activeStaff.id;
    // Super admins & Executive directors see everything
    return ["super_admin", "executive_director"].includes(activeStaff?.role);
  });

  // Collect active tasks assigned to the user
  const myTasks = cases.flatMap(c => c.tasks || []).filter(t => t.assigned_to === activeStaff?.id && t.status !== "completed");

  return (
    <main style={{ padding: "2.5rem 3rem" }}>
      
      {/* Header and Welcome */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.25rem", color: "var(--color-slate)", fontWeight: "800", letterSpacing: "-0.02em" }}>
          Welcome back, {activeStaff?.first_name}
        </h1>
        <p style={{ color: "var(--color-steel)", fontSize: "1.05rem" }}>
          Here is your transitional living workflow status snapshot.
        </p>
      </div>

      {/* Metrics Row (Dashboard Cards with Counts Only - Secure and generic) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1.25rem",
        marginBottom: "3rem"
      }}>
        {[
          { label: "New Pre-Screens", count: preScreenCount, color: "var(--color-teal)" },
          { label: "Staff Follow-Up", count: followUpCount, color: "var(--color-terracotta)" },
          { label: "Documents Requested", count: docsPendingCount, color: "var(--color-slate-blue)" },
          { label: "Interviews Pending", count: interviewCount, color: "#D78A2A" },
          { label: "Committee Review", count: committeeCount, color: "var(--deep-navy)" },
          { label: "Welcome Days Scheduled", count: welcomeCount, color: "#548235" }
        ].map((card, idx) => (
          <div 
            key={idx} 
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
              borderTop: `4px solid ${card.color}`
            }}
          >
            <span style={{ fontSize: "0.82rem", textTransform: "uppercase", fontWeight: "700", color: "var(--color-steel)", display: "block", marginBottom: "0.5rem" }}>
              {card.label}
            </span>
            <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-charcoal)", lineHeight: 1 }}>
              {card.count}
            </span>
          </div>
        ))}
      </div>

      {/* Grid: My Work & Pending Timelines */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left: My Work List */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "10px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-slate)", fontWeight: "700", marginBottom: "1.25rem" }}>
            📂 My Assigned Cases ({myAssignedCases.length})
          </h2>

          {myAssignedCases.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-steel)", border: "1px dashed var(--color-border)", borderRadius: "6px" }}>
              No active admissions cases currently assigned to your profile.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {myAssignedCases.map(c => (
                <div 
                  key={c.case.id}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-steel)" }}>
                      {c.case.caseNumber}
                    </span>
                    {/* Hide sensitive name from read_only_auditor */}
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--color-charcoal)", margin: "0.2rem 0" }}>
                      {activeStaff?.role === "read_only_auditor" ? "Redacted Profile" : `${c.applicant?.legal_first_name} ${c.applicant?.legal_last_name}`}
                    </h3>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "10px",
                      backgroundColor: "var(--color-cloud)",
                      color: "var(--color-slate)"
                    }}>
                      {c.case.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>

                  <Link href={`/staff/admissions/${c.case.id}`} className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", cursor: "pointer" }}>
                    Manage Case &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Assigned Follow-up Tasks */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "10px", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-slate)", fontWeight: "700", marginBottom: "1.25rem" }}>
            📋 My Tasks ({myTasks.length})
          </h2>

          {myTasks.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-steel)", border: "1px dashed var(--color-border)", borderRadius: "6px" }}>
              No outstanding tasks assigned to you.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {myTasks.map(t => (
                <div 
                  key={t.id}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    padding: "1rem",
                    backgroundColor: "var(--color-ivory)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.25rem" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-charcoal)" }}>{t.title}</h4>
                    <span style={{
                      fontSize: "0.65rem",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "4px",
                      backgroundColor: t.priority === "high" ? "#FCE8E6" : "#FAF8EF",
                      color: t.priority === "high" ? "#A83232" : "var(--color-slate)"
                    }}>
                      {t.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-steel)", marginBottom: "0.5rem" }}>{t.description}</p>
                  <Link href={`/staff/admissions/${t.admissions_case_id}`} style={{ fontSize: "0.78rem", color: "var(--color-teal)", fontWeight: "600" }}>
                    Go to Case file &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </main>
  );
}
