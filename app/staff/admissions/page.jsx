"use client";

import { useState, useEffect } from "react";
import { useStaffSession } from "../layout";
import { getAdmissionsQueue } from "@/lib/crmService";
import Link from "next/link";

export default function AdmissionsQueuePage() {
  const { activeStaff } = useStaffSession();
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await getAdmissionsQueue();
      setQueue(list);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
        Loading admissions queue...
      </div>
    );
  }

  // Filter queue list based on user selections
  const filteredQueue = queue.filter(item => {
    // Role level filtering - read_only_auditor can only view general structures
    const matchesSearch = 
      item.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      (activeStaff?.role !== "read_only_auditor" && (
        item.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        item.applicantPhone.includes(search) ||
        item.applicantEmail.toLowerCase().includes(search.toLowerCase())
      ));

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    const matchesAssigned = 
      assignedFilter === "all" || 
      (assignedFilter === "me" && (
        (activeStaff?.role === "admissions_coordinator" && item.assignedCoordinatorId === activeStaff.id) ||
        (activeStaff?.role === "admissions_interviewer" && item.assignedInterviewerId === activeStaff.id) ||
        (activeStaff?.role === "behavioral_health_clinician" && item.assignedClinicianId === activeStaff.id)
      ));

    return matchesSearch && matchesStatus && matchesAssigned;
  });

  return (
    <main style={{ padding: "2.5rem 3rem" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", color: "var(--color-slate)", fontWeight: "800", letterSpacing: "-0.01em" }}>
            Admissions Queue
          </h1>
          <p style={{ color: "var(--color-steel)" }}>Manage prospective resident cases and admissions progress stages.</p>
        </div>
      </div>

      {/* Search & Filters Panel */}
      <div style={{
        backgroundColor: "#FFFFFF",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "2rem",
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-steel)", marginBottom: "0.25rem" }}>
            Search Cases
          </label>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeStaff?.role === "read_only_auditor" ? "Search case number..." : "Search name, phone, email, case number..."}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border)"
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ width: "200px" }}>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-steel)", marginBottom: "0.25rem" }}>
            Workflow Stage
          </label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              backgroundColor: "#FFFFFF"
            }}
          >
            <option value="all">All Stages</option>
            <option value="pre_screen_received">Pre-Screen Received</option>
            <option value="admissions_interview_pending">Interview Pending</option>
            <option value="committee_review_pending">Committee Review Pending</option>
            <option value="welcome_day_scheduled">Welcome Day Scheduled</option>
            <option value="admitted">Admitted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Assigned Filter */}
        <div style={{ width: "180px" }}>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-steel)", marginBottom: "0.25rem" }}>
            Assignment
          </label>
          <select 
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              backgroundColor: "#FFFFFF"
            }}
          >
            <option value="all">All Assignments</option>
            <option value="me">Assigned to Me</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-cloud)", borderBottom: "2px solid var(--color-border)", color: "var(--color-slate)", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase" }}>
              <th style={{ padding: "1rem" }}>Case Number</th>
              <th style={{ padding: "1rem" }}>Applicant</th>
              <th style={{ padding: "1rem" }}>Status Stage</th>
              <th style={{ padding: "1rem" }}>Assigned Coordinator</th>
              <th style={{ padding: "1rem" }}>Next Task</th>
              <th style={{ padding: "1rem" }}>Created Date</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
                  No admissions cases match the filter settings.
                </td>
              </tr>
            ) : (
              filteredQueue.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)", fontSize: "0.9rem", verticalAlign: "middle" }}>
                  <td style={{ padding: "1rem", fontWeight: "600", color: "var(--color-slate)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                    {item.caseNumber}
                  </td>
                  <td style={{ padding: "1rem", fontWeight: "600", color: "var(--color-charcoal)" }}>
                    {activeStaff?.role === "read_only_auditor" ? (
                      <span style={{ color: "var(--color-steel)", fontStyle: "italic" }}>[Redacted for Privacy]</span>
                    ) : (
                      item.applicantName
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                      backgroundColor: item.status === "welcome_day_scheduled" ? "#E2F0D9" : "var(--color-cloud)",
                      color: item.status === "welcome_day_scheduled" ? "#385723" : "var(--color-slate-dark)"
                    }}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-steel)" }}>
                    {item.assignedCoordinatorName}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.8rem", color: "var(--color-steel)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.nextTask}
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-steel)" }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <Link href={`/staff/admissions/${item.id}`} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", cursor: "pointer" }}>
                      Open File &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </main>
  );
}
