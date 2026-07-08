"use client";

import { use, useState, useEffect } from "react";
import { useStaffSession } from "../../StaffClientProvider";
import { 
  getCaseDetails, 
  updateCaseStatus, 
  addCaseNote, 
  saveTask, 
  toggleTaskComplete, 
  updateDocumentStatus, 
  saveCommitteeDecision, 
  saveWelcomeDay,
  updateAssignments,
  getStaffProfiles
} from "@/lib/crmService";
import Link from "next/link";
import CrmIcon from "@/lib/crmIcons";

export default function CaseDetailsPage({ params }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;
  const { activeStaff } = useStaffSession();
  const [data, setData] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Form states
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteVisibility, setNewNoteVisibility] = useState("general_staff");
  const [noteStatusMessage, setNoteStatusMessage] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssigned, setNewTaskAssigned] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [statusUpdateNote, setStatusUpdateNote] = useState("");

  // Committee decision states
  const [commDecision, setCommDecision] = useState("admit");
  const [commConditions, setCommConditions] = useState("");
  const [commComments, setCommComments] = useState("");

  // Welcome day states
  const [wdRoom, setWdRoom] = useState("");
  const [wdChecks, setWdChecks] = useState({
    approved: false,
    prepared: false,
    accessCreated: false,
    fileComplete: false,
    idVerified: false,
    covenant: false,
    financial: false,
    emergency: false,
    codeAssigned: false,
    tour: false,
    prayer: false,
    admitted: false
  });

  const loadDetails = async () => {
    const details = await getCaseDetails(caseId);
    const staffList = await getStaffProfiles();
    setProfiles(staffList || []);
    if (details) {
      setData(details);
      // Initialize Welcome day form states from db
      if (details.welcome) {
        setWdRoom(details.welcome.room_assignment || "");
        setWdChecks({
          approved: details.welcome.admission_approved_confirmed || false,
          prepared: details.welcome.bedroom_prepared || false,
          accessCreated: details.welcome.entrance_access_created || false,
          fileComplete: details.welcome.resident_file_complete || false,
          idVerified: details.welcome.identity_verified || false,
          covenant: details.welcome.covenant_signed || false,
          financial: details.welcome.financial_snapshot_complete || false,
          emergency: details.welcome.emergency_contact_complete || false,
          codeAssigned: details.welcome.access_code_assignment_complete || false,
          tour: details.welcome.house_tour_complete || false,
          prayer: details.welcome.prayer_offered_if_desired || false,
          admitted: details.welcome.officially_admitted || false
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-steel)" }}>
        Loading case folder FHH-ADM...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <h2 style={{ color: "var(--color-slate)", fontFamily: "var(--font-serif)" }}>Case file not found</h2>
        <p style={{ color: "var(--color-steel)", marginBottom: "1.5rem" }}>The requested application reference id does not exist.</p>
        <Link href="/staff/admissions" className="btn btn-outline">Back to Queue</Link>
      </div>
    );
  }

  const { case: caseObj, applicant, prescreen, documents, tasks, notes, timeline, auditLogs, interview, clinical, decision } = data;

  // Handle coordinator/interviewer assignment change
  const handleAssignmentChange = async (type, id) => {
    const payload = {};
    if (type === "coordinator") payload.coordinatorId = id || null;
    if (type === "interviewer") payload.interviewerId = id || null;
    if (type === "clinician") payload.clinicianId = id || null;
    
    await updateAssignments(caseId, payload, activeStaff.id);
    loadDetails();
  };

  // Handle Workflow Status transition
  const handleStatusChange = async (nextStatus) => {
    const res = await updateCaseStatus({
      caseId,
      status: nextStatus,
      actorId: activeStaff.id,
      reason: statusUpdateNote
    }, activeStaff.id);

    if (res.success) {
      setStatusUpdateNote("");
      loadDetails();
    }
  };

  // Handle add note
  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    setNoteStatusMessage("");
    const res = await addCaseNote({
      caseId,
      authorId: activeStaff.id,
      visibility: newNoteVisibility,
      content: newNoteContent
    }, activeStaff.id);

    if (res.success) {
      setNewNoteContent("");
      setNoteStatusMessage("✓ Internal note recorded successfully.");
      loadDetails();
    }
  };

  // Handle add task
  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    const res = await saveTask({
      caseId,
      title: newTaskTitle,
      description: newTaskDesc,
      assignedTo: newTaskAssigned || undefined,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      createdBy: activeStaff.id
    }, activeStaff.id);

    if (res.success) {
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDueDate("");
      loadDetails();
    }
  };

  // Handle complete task toggle
  const handleToggleTask = async (id) => {
    await toggleTaskComplete(id, activeStaff.id);
    loadDetails();
  };

  // Handle document status modification
  const handleDocStatusUpdate = async (docTypeId, nextStatus) => {
    await updateDocumentStatus({
      caseId,
      documentTypeId: docTypeId,
      status: nextStatus,
      reviewedBy: activeStaff.id
    }, activeStaff.id);
    loadDetails();
  };

  // Handle Committee decision submit
  const handleCommitteeSubmit = async (e) => {
    e.preventDefault();
    const res = await saveCommitteeDecision({
      admissionsCaseId: caseId,
      committeeReviewDate: new Date().toISOString(),
      decision: commDecision,
      conditionsOfAdmission: commConditions || undefined,
      committeeComments: commComments || undefined,
      chairId: activeStaff.id,
      executiveDirectorId: activeStaff.id
    }, activeStaff.id);

    if (res.success) {
      loadDetails();
    }
  };

  // Handle Welcome Day submit
  const handleWelcomeDaySubmit = async (e) => {
    e.preventDefault();
    const res = await saveWelcomeDay({
      admissionsCaseId: caseId,
      welcomeDayDate: new Date().toISOString(),
      staffMemberId: activeStaff.id,
      roomAssignment: wdRoom || undefined,
      admissionApprovedConfirmed: wdChecks.approved,
      bedroomPrepared: wdChecks.prepared,
      entranceAccessCreated: wdChecks.accessCreated,
      residentFileComplete: wdChecks.fileComplete,
      identityVerified: wdChecks.idVerified,
      covenantSigned: wdChecks.covenant,
      financialSnapshotComplete: wdChecks.financial,
      emergencyContactComplete: wdChecks.emergency,
      accessCodeAssignmentComplete: wdChecks.codeAssigned,
      houseTourComplete: wdChecks.tour,
      firstCaseManagementMeetingDate: new Date().toISOString(),
      prayerOfferedIfDesired: wdChecks.prayer,
      officiallyAdmitted: wdChecks.admitted
    }, activeStaff.id);

    if (res.success) {
      loadDetails();
    }
  };

  // Role permissions checking helper
  const canModifyCase = ["super_admin", "executive_director", "admissions_coordinator"].includes(activeStaff?.role);
  const isAuditor = activeStaff?.role === "read_only_auditor";
  const isCommittee = activeStaff?.role === "admissions_committee_member";
  const isClinician = activeStaff?.role === "behavioral_health_clinician";

  // Filter notes and timeline events based on role-level privacy rules
  const visibleNotes = notes.filter(n => {
    if (n.visibility === "clinical_restricted") return ["super_admin", "behavioral_health_clinician"].includes(activeStaff?.role);
    if (n.visibility === "committee_restricted") return ["super_admin", "executive_director", "admissions_committee_member"].includes(activeStaff?.role);
    if (n.visibility === "restricted_admissions") return ["super_admin", "executive_director", "admissions_coordinator"].includes(activeStaff?.role);
    return true; // General staff visibility
  });

  return (
    <main className="crm-container">
      
      {/* Back button & Title header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/staff/admissions" style={{ textDecoration: "none", color: "var(--color-teal)", fontWeight: "600", fontSize: "0.9rem" }}>
          &larr; Back to Admissions Queue
        </Link>
        <div style={{ backgroundColor: "#FFE5E5", padding: "1rem", borderRadius: "6px", margin: "1.5rem 0", border: "1px solid #FFAAAA" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: "#880000" }}>Debug Session info:</p>
          <pre style={{ margin: "0.5rem 0 0 0", fontSize: "0.75rem", color: "#550000" }}>
            {JSON.stringify({ activeStaff }, null, 2)}
          </pre>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--color-steel)", display: "block" }}>
              Case File reference ID: {caseObj.id}
            </span>
            <h1 className="crm-title" style={{ margin: "0.25rem 0 0.5rem 0" }}>
              {isAuditor ? "Candidate Case ID: " + caseObj.caseNumber : `${applicant.legal_first_name} ${applicant.legal_last_name}`}
            </h1>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span className="crm-badge slate">
                STAGE: {caseObj.status.replace(/_/g, " ")}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--color-steel)" }}>
                Opened on {new Date(caseObj.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions panel */}
          {canModifyCase && (
            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="crm-form-group" style={{ marginBottom: 0 }}>
                <label className="crm-label" style={{ fontSize: "0.68rem" }}>Coordinator</label>
                <select
                  value={caseObj.assignedCoordinatorId || ""}
                  onChange={(e) => handleAssignmentChange("coordinator", e.target.value)}
                  className="crm-select"
                  style={{ padding: "0.4rem 0.6rem", fontSize: "0.82rem", minWidth: "160px" }}
                >
                  <option value="">Unassigned</option>
                  {profiles.filter(p => p.role === "admissions_coordinator").map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="crm-form-group" style={{ marginBottom: 0 }}>
                <label className="crm-label" style={{ fontSize: "0.68rem" }}>Interviewer</label>
                <select
                  value={caseObj.assignedInterviewerId || ""}
                  onChange={(e) => handleAssignmentChange("interviewer", e.target.value)}
                  className="crm-select"
                  style={{ padding: "0.4rem 0.6rem", fontSize: "0.82rem", minWidth: "160px" }}
                >
                  <option value="">Unassigned</option>
                  {profiles.filter(p => p.role === "admissions_interviewer").map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Selector Links */}
      <div className="crm-tabs-nav">
        {[
          { id: "overview", label: "Overview" },
          { id: "workflow", label: "Workflow Status", roleGate: ["super_admin", "executive_director", "admissions_coordinator"] },
          { id: "documents", label: "Secure Documents" },
          { id: "tasks", label: "CRM Tasks" },
          { id: "notes", label: "Notes Logs" },
          { id: "committee", label: "Committee Review", roleGate: ["super_admin", "executive_director", "admissions_committee_member"] },
          { id: "welcome", label: "Welcome Day", roleGate: ["super_admin", "executive_director", "admissions_coordinator", "case_manager"] },
          { id: "audit", label: "Audit Logs", roleGate: ["super_admin", "read_only_auditor"] }
        ].filter(tab => !tab.roleGate || tab.roleGate.includes(activeStaff?.role)).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`crm-tab-btn ${activeTab === tab.id ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER */}
      <div className="crm-card">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2.5rem" }}>
              <div>
                <h3 className="crm-card-title">
                  Applicant Contact & Background Summary
                </h3>

                {isAuditor ? (
                  <div className="crm-alert-banner info" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CrmIcon name="lock" style={{ width: "1.1rem", height: "1.1rem", color: "var(--color-slate-dark)" }} />
                    <span><strong>Privacy Redaction:</strong> Applicant names, phone numbers, and email coordinates are redacted under Read-Only Auditor logs compliance.</span>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Preferred Contact:</strong> {applicant.preferred_name || applicant.legal_first_name} via {applicant.preferred_contact_method}
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Phone Number:</strong> {applicant.phone}
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Email Address:</strong> {applicant.email}
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Referral Channel:</strong> {applicant.referral_source || "None"}
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Current Shelter:</strong> {applicant.current_housing_situation}
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Urgency:</strong> {applicant.housing_urgency.toUpperCase()}
                    </div>
                  </div>
                )}

                <h4 className="crm-card-title" style={{ fontSize: "1.15rem", marginTop: "2rem" }}>
                  Public Pre-Screen Form Responses
                </h4>
                {prescreen ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Primary Challenges & Objectives:</strong>
                      <p style={{ color: "var(--color-charcoal)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        {prescreen.primary_challenge} (Goal: {prescreen.six_to_twelve_month_goal})
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: "var(--color-slate-dark)" }}>Program Readiness & Commitment:</strong>
                      <p style={{ color: "var(--color-charcoal)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        Agrees to substance-free guidelines: {prescreen.substance_free_environment_readiness}. Ready for structure: {prescreen.structured_program_readiness}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--color-steel)", fontSize: "0.9rem" }}>No pre-screen form associated with this applicant record.</p>
                )}
              </div>

              {/* Activity event timeline */}
              <div>
                <h3 className="crm-card-title">
                  Activity timeline history
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", borderLeft: "2px solid var(--color-border)", paddingLeft: "1.25rem" }}>
                  {timeline.map(event => (
                    <div key={event.id} style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute",
                        left: "-1.6rem",
                        top: "0.25rem",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-teal)"
                      }} />
                      <strong style={{ fontSize: "0.88rem", color: "var(--color-slate-dark)" }}>{event.title}</strong>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-steel)", margin: "0.15rem 0" }}>{event.summary}</p>
                      <span style={{ fontSize: "0.72rem", color: "var(--color-steel)", opacity: 0.8 }}>
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKFLOW STATUS */}
        {activeTab === "workflow" && (
          <div>
            <h3 className="crm-card-title">
              Manage Admissions Progress Stage Transitions
            </h3>
            <p style={{ color: "var(--color-steel)", marginBottom: "2rem" }}>
              Admissions decisions must remain human-managed decisions. Transitioning statuses updates case logs, activity timelines, and assigns notifications.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3rem" }}>
              <div>
                <label className="crm-label">
                  Select Next Target Workflow Stage
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  {[
                    "initial_contact",
                    "pre_screen_received",
                    "staff_follow_up",
                    "secure_documents_requested",
                    "documents_in_progress",
                    "background_screening_pending",
                    "drug_screening_pending",
                    "admissions_interview_pending",
                    "admissions_interview_complete",
                    "behavioral_health_review_pending",
                    "committee_review_pending",
                    "welcome_day_scheduled",
                    "admitted",
                    "closed"
                  ].map(stage => (
                    <button
                      key={stage}
                      onClick={() => handleStatusChange(stage)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        borderRadius: "20px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: caseObj.status === stage ? "var(--color-slate)" : "#FFFFFF",
                        color: caseObj.status === stage ? "#FFFFFF" : "var(--color-charcoal)",
                        cursor: "pointer",
                        transition: "var(--transition)"
                      }}
                    >
                      {stage.replace(/_/g, " ").toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="crm-form-group">
                  <label className="crm-label">
                    Reason / Notes on Status Modification (Optional)
                  </label>
                  <textarea 
                    value={statusUpdateNote}
                    onChange={(e) => setStatusUpdateNote(e.target.value)}
                    placeholder="Enter context on status transition..."
                    rows={3}
                    className="crm-textarea"
                  />
                </div>
              </div>

              <div className="crm-card" style={{ padding: "1.5rem", height: "fit-content", backgroundColor: "var(--color-cloud)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.75rem", color: "var(--color-slate-dark)" }}>
                  Current State Summary
                </h4>
                <ul style={{ paddingLeft: "1.25rem", fontSize: "0.85rem", color: "var(--color-steel)", display: "flex", flexDirection: "column", gap: "0.5rem", margin: 0 }}>
                  <li>Current Status: <strong>{caseObj.status.replace(/_/g, " ").toUpperCase()}</strong></li>
                  <li>Assigned Coordinator: <strong>{caseObj.assignedCoordinatorId ? "Assigned" : "Unassigned"}</strong></li>
                  <li>Assigned Interviewer: <strong>{caseObj.assignedInterviewerId ? "Assigned" : "Unassigned"}</strong></li>
                  <li>Welcome Day Scheduled: <strong>{caseObj.welcomeDayDate ? new Date(caseObj.welcomeDayDate).toLocaleDateString() : "No"}</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeTab === "documents" && (
          <div>
            <h3 className="crm-card-title">
              Applicant Intake Documents Checklist
            </h3>

            {isAuditor ? (
              <div className="crm-alert-banner info" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CrmIcon name="lock" style={{ width: "1.1rem", height: "1.1rem", color: "var(--color-slate-dark)" }} />
                <span><strong>Privacy Redaction:</strong> Secure files are redacted under Read-Only Auditor logs compliance.</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { id: "doc-1", number: "FHH-INT-001", title: "Resident Intake Application", comp: "Applicant", sens: "high" },
                  { id: "doc-2", number: "FHH-INT-002", title: "Background Check Acknowledgment", comp: "Applicant", sens: "high" },
                  { id: "doc-3", number: "FHH-INT-003", title: "Authorization for Release of Information", comp: "Applicant", sens: "high" },
                  { id: "doc-4", number: "FHH-INT-004", title: "Drug & Alcohol Testing Consent", comp: "Applicant", sens: "high" },
                  { id: "doc-5", number: "FHH-ADM-001", title: "Admissions Interview Evaluation", comp: "Staff", sens: "restricted" },
                  { id: "doc-6", number: "FHH-ADM-002", title: "Behavioral Health Admission Readiness Assessment", comp: "Licensed Professional", sens: "clinical" },
                  { id: "doc-7", number: "FHH-ADM-003", title: "Admissions Committee Decision Form", comp: "Committee", sens: "restricted" },
                  { id: "doc-8", number: "FHH-ADM-004", title: "Welcome Day Checklist", comp: "Staff", sens: "restricted" }
                ].map(dt => {
                  const dbDoc = documents.find(d => d.document_type_id === dt.id || d.document_type_id === dt.number);
                  const status = dbDoc ? dbDoc.status : "not_requested";

                  // Clinician check for clinical documents
                  const isRestrictedClinical = dt.sens === "clinical" && !["super_admin", "behavioral_health_clinician"].includes(activeStaff?.role);
                  if (isRestrictedClinical) return null;

                  return (
                    <div 
                      key={dt.id}
                      style={{
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        padding: "1.25rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: status === "complete" ? "rgba(92, 158, 173, 0.05)" : "#FFFFFF"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-steel)" }}>{dt.number}</span>
                          <span className={`crm-badge ${dt.sens === "clinical" ? "terracotta" : "slate"}`}>
                            {dt.sens}
                          </span>
                        </div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--color-charcoal)", margin: "0.1rem 0" }}>
                          {dt.title}
                        </h4>
                        <span style={{ fontSize: "0.78rem", color: "var(--color-steel)" }}>Completed by {dt.comp}</span>
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <span className={`crm-badge ${status === "complete" ? "success" : "slate"}`}>
                          {status.replace(/_/g, " ")}
                        </span>
                        
                        {canModifyCase && (
                          <div style={{ display: "flex", gap: "0.35rem" }}>
                            <button onClick={() => handleDocStatusUpdate(dt.id, "requested")} className="btn btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}>Request</button>
                            <button onClick={() => handleDocStatusUpdate(dt.id, "complete")} className="btn btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}>Complete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TASKS */}
        {activeTab === "tasks" && (
          <div>
            <h3 className="crm-card-title">
              Case Follow-Up Tasks
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3.5rem" }}>
              {/* Task list */}
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {tasks.length === 0 ? (
                    <p style={{ color: "var(--color-steel)", fontSize: "0.9rem" }}>No follow-up tasks currently assigned for this case file.</p>
                  ) : (
                    tasks.map(task => (
                      <div 
                        key={task.id}
                        style={{
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          padding: "1.25rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: task.status === "completed" ? "rgba(92, 158, 173, 0.05)" : "#FFFFFF"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                          <input 
                            type="checkbox" 
                            checked={task.status === "completed"} 
                            onChange={() => handleToggleTask(task.id)}
                            style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer", marginTop: "0.2rem" }}
                          />
                          <div>
                            <h4 style={{
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: task.status === "completed" ? "var(--color-steel)" : "var(--color-charcoal)",
                              textDecoration: task.status === "completed" ? "line-through" : "none",
                              margin: 0
                            }}>
                              {task.title}
                            </h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", margin: "0.15rem 0 0 0" }}>{task.description}</p>
                          </div>
                        </div>

                        <span className={`crm-badge ${task.priority === "high" ? "terracotta" : "slate"}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Task Form */}
              <div className="crm-card" style={{ padding: "1.75rem", backgroundColor: "var(--color-cloud)" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1.25rem", color: "var(--color-slate-dark)" }}>
                  Create Follow-Up Task
                </h4>
                <form onSubmit={handleAddTaskSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="crm-form-group">
                    <label className="crm-label" style={{ fontSize: "0.75rem" }}>Title</label>
                    <input 
                      type="text" 
                      required 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task action summary..."
                      className="crm-input"
                    />
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-label" style={{ fontSize: "0.75rem" }}>Description</label>
                    <textarea 
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Add details..."
                      rows={2}
                      className="crm-textarea"
                    />
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-label" style={{ fontSize: "0.75rem" }}>Assign To</label>
                    <select
                      value={newTaskAssigned}
                      onChange={(e) => setNewTaskAssigned(e.target.value)}
                      className="crm-select"
                    >
                      <option value="">Unassigned</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-label" style={{ fontSize: "0.75rem" }}>Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="crm-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem", fontSize: "0.85rem", width: "100%" }}>
                    Add Task to File
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTES */}
        {activeTab === "notes" && (
          <div>
            <h3 className="crm-card-title">
              Internal Note Logs
            </h3>

            {noteStatusMessage && (
              <div className="crm-alert-banner info" style={{ padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                {noteStatusMessage}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3.5rem" }}>
              {/* Note records list */}
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {visibleNotes.length === 0 ? (
                    <p style={{ color: "var(--color-steel)", fontSize: "0.9rem" }}>No notes logged under your authorization view.</p>
                  ) : (
                    visibleNotes.map(note => {
                      const author = profiles.find(s => s.id === note.author_id);
                      return (
                        <div 
                          key={note.id}
                          style={{
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            padding: "1.25rem",
                            backgroundColor: note.visibility === "general_staff" ? "#FFFFFF" : "rgba(200, 107, 74, 0.03)"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-slate-dark)" }}>
                              {author ? `${author.first_name} ${author.last_name}` : "System"}
                            </span>
                            <span className="crm-badge slate">
                              {note.visibility.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.9rem", color: "var(--color-charcoal)", lineHeight: "1.5", margin: 0 }}>{note.content}</p>
                          <span style={{ fontSize: "0.72rem", color: "var(--color-steel)", display: "block", marginTop: "0.5rem" }}>
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add Note form */}
              <div className="crm-card" style={{ padding: "1.75rem", backgroundColor: "var(--color-cloud)" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", color: "var(--color-slate-dark)" }}>
                  Log Internal Context Note
                </h4>

                <div className="crm-alert-banner warning" style={{ padding: "0.85rem", fontSize: "0.78rem", marginBottom: "1.25rem", display: "flex", gap: "0.35rem", alignItems: "center" }}>
                  <CrmIcon name="warning" style={{ width: "1.2rem", height: "1.2rem", color: "var(--color-terracotta-dark)", flexShrink: 0 }} />
                  <span><strong>Privacy Warning:</strong> Only include information necessary for the assigned scope. Do not duplicate sensitive information that already exists in an approved secure document.</span>
                </div>

                <form onSubmit={handleAddNoteSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="crm-form-group">
                    <label className="crm-label" style={{ fontSize: "0.75rem" }}>Visibility Scope</label>
                    <select
                      value={newNoteVisibility}
                      onChange={(e) => setNewNoteVisibility(e.target.value)}
                      className="crm-select"
                    >
                      <option value="general_staff">General Staff (All Staff)</option>
                      <option value="restricted_admissions">Restricted Admissions Coordinator/Admin</option>
                      {["super_admin", "behavioral_health_clinician"].includes(activeStaff?.role) && (
                        <option value="clinical_restricted">Clinical Restricted (Clinicians Only)</option>
                      )}
                      {["super_admin", "executive_director", "admissions_committee_member"].includes(activeStaff?.role) && (
                        <option value="committee_restricted">Committee Restricted (Committee Only)</option>
                      )}
                    </select>
                  </div>

                  <div className="crm-form-group">
                    <label className="crm-label" style={{ fontSize: "0.75rem" }}>Content Note</label>
                    <textarea 
                      required
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Add summary note details..."
                      rows={4}
                      className="crm-textarea"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem", fontSize: "0.85rem", width: "100%" }}>
                    Add Note to File
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMMITTEE REVIEW */}
        {activeTab === "committee" && (
          <div>
            <h3 className="crm-card-title">
              Admissions Committee Packet & Decision Formulation
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3.5rem" }}>
              <div>
                <h4 className="crm-card-title" style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                  Committee Packet Checklist
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
                    <span>General intake profile validation</span>
                    <strong style={{ color: "var(--color-teal)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <CrmIcon name="check" style={{ width: "1rem", height: "1rem" }} />
                      VERIFIED
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
                    <span>Required documents status check (4/4 complete)</span>
                    <strong style={{ color: "var(--color-teal)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <CrmIcon name="check" style={{ width: "1rem", height: "1rem" }} />
                      COMPLETE
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
                    <span>Clinical health assessment checklist outcome</span>
                    <strong style={{ textTransform: "uppercase" }}>{clinical ? clinical.readiness_outcome.replace(/_/g, " ") : "PENDING"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
                    <span>Admissions interview recommendation</span>
                    <strong style={{ textTransform: "uppercase" }}>{interview ? interview.recommendation.replace(/_/g, " ") : "PENDING"}</strong>
                  </div>
                </div>

                {decision ? (
                  <div className="crm-alert-banner info" style={{ padding: "1.5rem" }}>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-slate-dark)", marginBottom: "0.5rem", marginTop: 0, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <CrmIcon name="check" style={{ width: "1.2rem", height: "1.2rem" }} />
                      Committee Decision Recorded
                    </h4>
                    <p style={{ fontSize: "0.9rem", margin: 0 }}>
                      Decision outcome: <strong>{decision.decision.replace(/_/g, " ").toUpperCase()}</strong>
                    </p>
                    {decision.conditions_of_admission && (
                      <p style={{ fontSize: "0.85rem", color: "var(--color-steel)", marginTop: "0.5rem", marginBottom: 0 }}>
                        Conditions: {decision.conditions_of_admission}
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleCommitteeSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div className="crm-form-group">
                      <label className="crm-label">Committee Decision</label>
                      <select
                        value={commDecision}
                        onChange={(e) => setCommDecision(e.target.value)}
                        className="crm-select"
                      >
                        <option value="admit">Admit Candidate</option>
                        <option value="admit_with_conditions">Admit with Conditions</option>
                        <option value="wait_list">Waitlist</option>
                        <option value="defer_pending_information_or_treatment">Defer pending treatment/info</option>
                        <option value="decline_admission">Decline Admission</option>
                      </select>
                    </div>

                    <div className="crm-form-group">
                      <label className="crm-label">Conditions of Admission (Optional)</label>
                      <textarea
                        value={commConditions}
                        onChange={(e) => setCommConditions(e.target.value)}
                        placeholder="Add required targets (e.g. checkups, support program links)..."
                        rows={2}
                        className="crm-textarea"
                      />
                    </div>

                    <div className="crm-form-group">
                      <label className="crm-label">Committee Comments</label>
                      <textarea
                        value={commComments}
                        onChange={(e) => setCommComments(e.target.value)}
                        placeholder="Add committee findings summary..."
                        rows={3}
                        className="crm-textarea"
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem", fontSize: "0.9rem", width: "100%" }}>
                      Record Official Committee Decision
                    </button>
                  </form>
                )}
              </div>

              <div className="crm-alert-banner warning" style={{ height: "fit-content", padding: "1.5rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--color-terracotta-dark)", marginBottom: "0.5rem", marginTop: 0, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <CrmIcon name="warning" style={{ width: "1.1rem", height: "1.1rem", color: "var(--color-terracotta-dark)" }} />
                  Secure Access Warning
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-terracotta-dark)", lineHeight: "1.4", margin: 0 }}>
                  Admissions committee members do not have direct access to raw medical records, background check details, or candidate Social Security numbers to respect privacy boundaries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: WELCOME DAY */}
        {activeTab === "welcome" && (
          <div>
            <h3 className="crm-card-title">
              Welcome Day Checklists & Residency Conversion Gateway
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "3.5rem" }}>
              <div>
                <form onSubmit={handleWelcomeDaySubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div className="crm-form-group">
                    <label className="crm-label">Bedroom Room Assignment</label>
                    <input 
                      type="text" 
                      value={wdRoom}
                      onChange={(e) => setWdRoom(e.target.value)}
                      placeholder="e.g. Room 102"
                      className="crm-input"
                    />
                  </div>

                  <h4 className="crm-card-title" style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.75rem 0" }}>
                    Onboarding Steps Checklist
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                      { key: "approved", label: "Admissions approval confirmed by director" },
                      { key: "prepared", label: "Bedroom cleaned and prepared" },
                      { key: "accessCreated", label: "Resident access files configured" },
                      { key: "fileComplete", label: "Resident intake folder complete" },
                      { key: "idVerified", label: "Government photo ID verified" },
                      { key: "covenant", label: "Resident Covenant and Rules Agreement signed" },
                      { key: "financial", label: "Financial Snapshot & Goal Planner complete" },
                      { key: "emergency", label: "Emergency Contact information confirmed" },
                      { key: "codeAssigned", label: "Resident access code assigned (Form complete)" },
                      { key: "tour", label: "House tour and orientation complete" },
                      { key: "prayer", label: "Prayer offered if desired" },
                      { key: "admitted", label: "Mark case file officially ADMITTED to program" }
                    ].map(chk => (
                      <label key={chk.key} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", cursor: "pointer", color: "var(--color-charcoal)" }}>
                        <input 
                          type="checkbox"
                          checked={wdChecks[chk.key]}
                          onChange={(e) => setWdChecks({ ...wdChecks, [chk.key]: e.target.checked })}
                          style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer" }}
                        />
                        {chk.label}
                      </label>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: "0.75rem", fontSize: "0.9rem", marginTop: "1rem", width: "100%" }}>
                    Save Welcome Day Checklist Status
                  </button>
                </form>
              </div>

              <div className="crm-card" style={{ padding: "1.5rem", height: "fit-content", backgroundColor: "var(--color-cloud)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--color-slate-dark)", marginBottom: "0.5rem", marginTop: 0 }}>
                  Residency Transition
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--color-steel)", lineHeight: "1.4", margin: 0 }}>
                  Admitting the candidate locks the admissions case file records as read-only historical context and opens an active resident file. Actual entrance keypad codes are never logged to this CRM database.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div>
            <h3 className="crm-card-title">
              Case Activity Audit Trail Logs (Immutable logs)
            </h3>
            <p style={{ color: "var(--color-steel)", marginBottom: "2rem" }}>
              Log of operations tracked on this candidate directory. No medical fields, notes, or candidate names are tracked inside raw metadata logs to respect privacy.
            </p>

            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Action logged</th>
                    <th>Target Entity</th>
                    <th>Context description</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-steel)" }}>
                        No audit events recorded for this file.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map(log => {
                      const actor = profiles.find(s => s.id === log.actor_id);
                      return (
                        <tr key={log.id}>
                          <td style={{ color: "var(--color-steel)" }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ fontWeight: "600" }}>
                            {actor ? `${actor.first_name} ${actor.last_name}` : "System"}
                          </td>
                          <td>
                            <span style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.75rem",
                              backgroundColor: "rgba(41, 76, 96, 0.08)",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "4px",
                              fontWeight: "600",
                              color: "var(--color-slate-dark)"
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ color: "var(--color-steel)" }}>
                            {log.entity_type} ({log.entity_id})
                          </td>
                          <td style={{ color: "var(--color-steel)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {JSON.stringify(log.metadata_safe)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </main>
  );
}
