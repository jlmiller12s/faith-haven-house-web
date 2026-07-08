"use client";

import { useState, useEffect } from "react";
import { useStaffSession } from "./StaffClientProvider";
import { getAdmissionsQueue, getCaseDetails } from "@/lib/crmService";
import Link from "next/link";
import CrmIcon from "@/lib/crmIcons";

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
    <main className="crm-container">
      
      {/* Header and Welcome */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 className="crm-title">
          Welcome back, {activeStaff?.first_name}
        </h1>
        <p className="crm-subtitle">
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
          { label: "New Pre-Screens", count: preScreenCount, iconName: "meals" },
          { label: "Staff Follow-Up", count: followUpCount, iconName: "mentor" },
          { label: "Documents Requested", count: docsPendingCount, iconName: "accountability" },
          { label: "Interviews Pending", count: interviewCount, iconName: "monitor" },
          { label: "Committee Review", count: committeeCount, iconName: "faith" },
          { label: "Welcome Days Scheduled", count: welcomeCount, iconName: "hope" }
        ].map((card, idx) => (
          <div 
            key={idx} 
            className="crm-card"
            style={{
              padding: "1.5rem",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <span style={{ fontSize: "0.78rem", textTransform: "uppercase", fontWeight: "700", color: "var(--color-steel)", display: "block", marginBottom: "0.5rem", letterSpacing: "0.03em" }}>
                {card.label}
              </span>
              <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--color-slate-dark)", lineHeight: 1 }}>
                {card.count}
              </span>
            </div>
            <CrmIcon name={card.iconName} style={{ width: "2.5rem", height: "2.5rem", opacity: 0.8 }} />
          </div>
        ))}
      </div>

      {/* Grid: My Work & Pending Timelines */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left: My Work List */}
        <div className="crm-card" style={{ padding: "2rem" }}>
          <h2 className="crm-card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CrmIcon name="cases" style={{ width: "1.5rem", height: "1.5rem", color: "var(--color-slate-dark)" }} />
            My Assigned Cases ({myAssignedCases.length})
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
                    alignItems: "center",
                    backgroundColor: "var(--color-ivory)"
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
                    <span className="crm-badge slate">
                      {c.case.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>

                  <Link href={`/staff/admissions/${c.case.id}`} className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                    Manage Case &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Assigned Follow-up Tasks */}
        <div className="crm-card" style={{ padding: "2rem" }}>
          <h2 className="crm-card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CrmIcon name="tasks" style={{ width: "1.5rem", height: "1.5rem", color: "var(--color-slate-dark)" }} />
            My Tasks ({myTasks.length})
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
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--color-charcoal)", margin: 0 }}>{t.title}</h4>
                    <span className={`crm-badge ${t.priority === "high" ? "terracotta" : "slate"}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--color-steel)", marginBottom: "0.5rem", marginTop: "0.25rem" }}>{t.description}</p>
                  <Link href={`/staff/admissions/${t.admissions_case_id}`} style={{ fontSize: "0.78rem", color: "var(--color-teal)", fontWeight: "600", textDecoration: "none" }}>
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
