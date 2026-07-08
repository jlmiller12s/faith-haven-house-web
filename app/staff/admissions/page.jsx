"use client";
import { useState, useEffect } from "react";
import { useStaffSession } from "../StaffClientProvider";
import { getAdmissionsQueue, deleteCases } from "@/lib/crmService";
import Link from "next/link";

export default function AdmissionsQueuePage() {
  const { activeStaff } = useStaffSession();
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);

  const canDelete = ["super_admin", "executive_director", "admissions_coordinator"].includes(activeStaff?.role);

  useEffect(() => {
    async function load() {
      const list = await getAdmissionsQueue();
      setQueue(list);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCaseIds(filteredQueue.map(item => item.id));
    } else {
      setSelectedCaseIds([]);
    }
  };

  const handleSelectRow = (caseId) => {
    setSelectedCaseIds(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId) 
        : [...prev, caseId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedCaseIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete the ${selectedCaseIds.length} selected pre-screen submissions/cases? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteCases(selectedCaseIds, activeStaff.id);
      setSelectedCaseIds([]);
      const list = await getAdmissionsQueue();
      setQueue(list);
    } catch (err) {
      alert(`Error deleting cases: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    <main className="crm-container">
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="crm-title">Admissions Queue</h1>
          <p className="crm-subtitle">Manage prospective resident cases and admissions progress stages.</p>
        </div>
        {selectedCaseIds.length > 0 && canDelete && (
          <button 
            onClick={handleDeleteSelected}
            className="btn" 
            style={{ 
              backgroundColor: "var(--color-terracotta)", 
              color: "#FFFFFF", 
              padding: "0.6rem 1.2rem", 
              fontSize: "0.9rem",
              borderRadius: "6px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            🗑️ Delete Selected ({selectedCaseIds.length})
          </button>
        )}
      </div>

      {/* Search & Filters Panel */}
      <div className="crm-card" style={{
        padding: "1.5rem",
        marginBottom: "2rem",
        display: "flex",
        gap: "1.5rem",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: "250px" }}>
          <label className="crm-label">Search Cases</label>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeStaff?.role === "read_only_auditor" ? "Search case number..." : "Search name, phone, email, case number..."}
            className="crm-input"
          />
        </div>

        {/* Status Filter */}
        <div style={{ width: "200px" }}>
          <label className="crm-label">Workflow Stage</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="crm-select"
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
          <label className="crm-label">Assignment</label>
          <select 
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="crm-select"
          >
            <option value="all">All Assignments</option>
            <option value="me">Assigned to Me</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="crm-table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              {canDelete && (
                <th style={{ width: "40px", paddingLeft: "1.5rem" }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={filteredQueue.length > 0 && selectedCaseIds.length === filteredQueue.length}
                    style={{ cursor: "pointer", width: "1.1rem", height: "1.1rem" }}
                  />
                </th>
              )}
              <th>Case Number</th>
              <th>Applicant</th>
              <th>Status Stage</th>
              <th>Assigned Coordinator</th>
              <th>Next Task</th>
              <th>Created Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length === 0 ? (
              <tr>
                <td colSpan={canDelete ? 8 : 7} style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
                  No admissions cases match the filter settings.
                </td>
              </tr>
            ) : (
              filteredQueue.map(item => (
                <tr key={item.id}>
                  {canDelete && (
                    <td style={{ paddingLeft: "1.5rem" }}>
                      <input 
                        type="checkbox" 
                        onChange={() => handleSelectRow(item.id)} 
                        checked={selectedCaseIds.includes(item.id)}
                        style={{ cursor: "pointer", width: "1.1rem", height: "1.1rem" }}
                      />
                    </td>
                  )}
                  <td style={{ fontWeight: "600", color: "var(--color-slate)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                    {item.caseNumber}
                  </td>
                  <td style={{ fontWeight: "600", color: "var(--color-charcoal)" }}>
                    {activeStaff?.role === "read_only_auditor" ? (
                      <span style={{ color: "var(--color-steel)", fontStyle: "italic" }}>[Redacted for Privacy]</span>
                    ) : (
                      item.applicantName
                    )}
                  </td>
                  <td>
                    <span className={`crm-badge ${item.status === "welcome_day_scheduled" || item.status === "admitted" ? "teal" : "slate"}`}>
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-steel)" }}>
                    {item.assignedCoordinatorName}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "var(--color-steel)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.nextTask}
                  </td>
                  <td style={{ color: "var(--color-steel)" }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/staff/admissions/${item.id}`} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
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
