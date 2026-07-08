import { z } from "zod";
import { isMockMode, getMockDb, supabase } from "./supabase";
import { mapAdmissionsCase } from "./crmRecordMappers.mjs";

// =====================================================
// ZOD VALIDATION SCHEMAS
// =====================================================

export const StatusChangeSchema = z.object({
  caseId: z.string().uuid(),
  status: z.string().min(1),
  actorId: z.string().min(1),
  reason: z.string().optional()
});

export const TaskCreateSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
  createdBy: z.string().min(1)
});

export const NoteCreateSchema = z.object({
  caseId: z.string().uuid(),
  authorId: z.string().min(1),
  visibility: z.enum(["general_staff", "restricted_admissions", "clinical_restricted", "committee_restricted"]),
  content: z.string().min(1)
});

export const DocumentUpdateSchema = z.object({
  caseId: z.string().uuid(),
  documentTypeId: z.string().min(1),
  status: z.enum(["not_requested", "requested", "submitted", "reviewed", "complete"]),
  reviewedBy: z.string().optional(),
  notes: z.string().optional()
});

export const CommitteeDecisionSchema = z.object({
  admissionsCaseId: z.string().uuid(),
  committeeReviewDate: z.string(),
  decision: z.enum([
    "admit",
    "admit_with_conditions",
    "wait_list",
    "defer_pending_information_or_treatment",
    "decline_admission"
  ]),
  conditionsOfAdmission: z.string().optional(),
  committeeComments: z.string().optional(),
  chairId: z.string().min(1),
  executiveDirectorId: z.string().min(1)
});

export const WelcomeDaySchema = z.object({
  admissionsCaseId: z.string().uuid(),
  welcomeDayDate: z.string(),
  staffMemberId: z.string().min(1),
  roomAssignment: z.string().optional(),
  admissionApprovedConfirmed: z.boolean(),
  bedroomPrepared: z.boolean(),
  entranceAccessCreated: z.boolean(),
  residentFileComplete: z.boolean(),
  identityVerified: z.boolean(),
  covenantSigned: z.boolean(),
  financialSnapshotComplete: z.boolean(),
  emergencyContactComplete: z.boolean(),
  accessCodeAssignmentComplete: z.boolean(),
  houseTourComplete: z.boolean(),
  firstCaseManagementMeetingDate: z.string().optional(),
  prayerOfferedIfDesired: z.boolean(),
  officiallyAdmitted: z.boolean()
});

// =====================================================
// SERVICE LAYER
// =====================================================

// Helper to log safe audit entries (no sensitive details)
export async function logAuditEvent(event, supabaseClient = null) {
  const ipHash = "dummy_ip_hash_local";
  const newLog = {
    id: `au-${Math.random().toString(36).substr(2, 9)}`,
    actor_id: event.actorId,
    action: event.action,
    entity_type: event.entityType,
    entity_id: event.entityId,
    admissions_case_id: event.caseId || null,
    metadata_safe: event.metadata || {},
    ip_hash: ipHash,
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    const db = getMockDb();
    db.audit.unshift(newLog);
  } else {
    const client = supabaseClient || supabase;
    await client.from("audit_logs").insert(newLog);
  }
}

// Helper to record activity events for timelines
export async function logActivityEvent(event, supabaseClient = null) {
  const newEvent = {
    id: `e-${Math.random().toString(36).substr(2, 9)}`,
    admissions_case_id: event.caseId,
    event_type: event.eventType,
    title: event.title,
    summary: event.summary,
    actor_id: event.actorId,
    visibility: event.visibility || "general_staff",
    created_at: new Date().toISOString()
  };

  if (isMockMode) {
    const db = getMockDb();
    db.events.unshift(newEvent);
  } else {
    const client = supabaseClient || supabase;
    await client.from("activity_events").insert(newEvent);
  }
}

// Fetch all staff profiles
export async function getStaffProfiles() {
  if (isMockMode) {
    return getMockDb().staff;
  }
  const { data } = await supabase.from("staff_profiles").select("*");
  return data || [];
}

// Update staff profile role (Super Admin only)
export async function updateStaffRole(staffId, newRole, actorId) {
  if (isMockMode) {
    const db = getMockDb();
    const staff = db.staff.find(s => s.id === staffId);
    if (staff) {
      staff.role = newRole;
      await logAuditEvent({
        actorId,
        action: "role_changed",
        entityType: "staff_profile",
        entityId: staffId,
        metadata: { staffEmail: staff.email, nextRole: newRole }
      });
      return { success: true };
    }
  } else {
    await supabase.from("staff_profiles").update({ role: newRole }).eq("id", staffId);
    await logAuditEvent({
      actorId,
      action: "role_changed",
      entityType: "staff_profile",
      entityId: staffId,
      metadata: { nextRole: newRole }
    });
    return { success: true };
  }
  return { success: false };
}

// Fetch Admissions Queue
export async function getAdmissionsQueue() {
  if (isMockMode) {
    const db = getMockDb();
    return db.cases.map(c => {
      const applicant = db.applicants.find(a => a.id === c.applicantId);
      const coordinator = db.staff.find(s => s.id === c.assignedCoordinatorId);
      const tasks = db.tasks.filter(t => t.admissions_case_id === c.id && t.status !== "completed");
      return {
        ...c,
        applicantName: applicant ? `${applicant.legal_first_name} ${applicant.legal_last_name}` : "Unknown",
        applicantPhone: applicant ? applicant.phone : "",
        applicantEmail: applicant ? applicant.email : "",
        referralSource: applicant ? applicant.referral_source : "",
        assignedCoordinatorName: coordinator ? `${coordinator.first_name} ${coordinator.last_name}` : "Unassigned",
        nextTask: tasks.length > 0 ? tasks[0].title : "None"
      };
    });
  }

  // Real database fetch joins applicants & coordinator
  const { data, error } = await supabase
    .from("admissions_cases")
    .select(`
      *,
      applicants (legal_first_name, legal_last_name, phone, email, referral_source),
      coordinator:staff_profiles!admissions_cases_assigned_coordinator_id_fkey (first_name, last_name)
    `);

  if (error) throw new Error(`Unable to load admissions queue: ${error.message}`);
  
  return (data || []).map(c => ({
    ...mapAdmissionsCase(c),
    applicantName: c.applicants ? `${c.applicants.legal_first_name} ${c.applicants.legal_last_name}` : "Unknown",
    applicantPhone: c.applicants ? c.applicants.phone : "",
    applicantEmail: c.applicants ? c.applicants.email : "",
    referralSource: c.applicants ? c.applicants.referral_source : "",
    assignedCoordinatorName: c.coordinator ? `${c.coordinator.first_name} ${c.coordinator.last_name}` : "Unassigned",
    nextTask: "Check tasks tab"
  }));
}

// Fetch Single Case Details
export async function getCaseDetails(caseId) {
  if (isMockMode) {
    const db = getMockDb();
    const caseObj = db.cases.find(c => c.id === caseId);
    if (!caseObj) return null;

    const applicant = db.applicants.find(a => a.id === caseObj.applicantId);
    const prescreen = db.prescreens.find(ps => ps.applicant_id === caseObj.applicantId);
    const docs = db.documents.filter(d => d.admissions_case_id === caseId);
    const interview = db.interviews.find(i => i.admissions_case_id === caseId);
    const clinical = db.clinical.find(i => i.admissions_case_id === caseId);
    const decision = db.decisions.find(d => d.admissions_case_id === caseId);
    const welcome = db.welcome.find(w => w.admissions_case_id === caseId);
    const tasks = db.tasks.filter(t => t.admissions_case_id === caseId);
    const notes = db.notes.filter(n => n.admissions_case_id === caseId);
    const timeline = db.events.filter(e => e.admissions_case_id === caseId);
    const auditLogs = db.audit.filter(a => a.admissions_case_id === caseId);

    return {
      case: caseObj,
      applicant,
      prescreen,
      documents: docs,
      interview,
      clinical,
      decision,
      welcome,
      tasks,
      notes,
      timeline,
      auditLogs
    };
  }

  // Real Supabase queries
  const { data: caseRow, error: caseError } = await supabase.from("admissions_cases").select("*").eq("id", caseId).single();
  if (caseError) {
    console.error("[getCaseDetails] caseError:", caseError);
    throw new Error(`Unable to load admission case: ${caseError.message}`);
  }
  const caseObj = mapAdmissionsCase(caseRow);
  if (!caseObj) return null;

  const { data: applicant, error: applicantError } = await supabase.from("applicants").select("*").eq("id", caseObj.applicant_id).single();
  if (applicantError) console.error("[getCaseDetails] applicantError:", applicantError);

  const { data: prescreen, error: prescreenError } = await supabase.from("prescreen_submissions").select("*").eq("admissions_case_id", caseId).maybeSingle();
  if (prescreenError) console.error("[getCaseDetails] prescreenError:", prescreenError);

  const { data: documents, error: documentsError } = await supabase.from("admissions_documents").select("*").eq("admissions_case_id", caseId);
  if (documentsError) console.error("[getCaseDetails] documentsError:", documentsError);

  const { data: interview, error: interviewError } = await supabase.from("admissions_interviews").select("*").eq("admissions_case_id", caseId).maybeSingle();
  if (interviewError) console.error("[getCaseDetails] interviewError:", interviewError);

  const { data: clinical, error: clinicalError } = await supabase.from("behavioral_health_reviews").select("*").eq("admissions_case_id", caseId).maybeSingle();
  if (clinicalError) console.error("[getCaseDetails] clinicalError:", clinicalError);

  const { data: decision, error: decisionError } = await supabase.from("committee_decisions").select("*").eq("admissions_case_id", caseId).maybeSingle();
  if (decisionError) console.error("[getCaseDetails] decisionError:", decisionError);

  const { data: welcome, error: welcomeError } = await supabase.from("welcome_day_records").select("*").eq("admissions_case_id", caseId).maybeSingle();
  if (welcomeError) console.error("[getCaseDetails] welcomeError:", welcomeError);

  const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").eq("admissions_case_id", caseId);
  if (tasksError) console.error("[getCaseDetails] tasksError:", tasksError);

  const { data: notes, error: notesError } = await supabase.from("notes").select("*").eq("admissions_case_id", caseId);
  if (notesError) console.error("[getCaseDetails] notesError:", notesError);

  const { data: timeline, error: timelineError } = await supabase.from("activity_events").select("*").eq("admissions_case_id", caseId);
  if (timelineError) console.error("[getCaseDetails] timelineError:", timelineError);

  const { data: auditLogs, error: auditLogsError } = await supabase.from("audit_logs").select("*").eq("admissions_case_id", caseId);
  if (auditLogsError) console.error("[getCaseDetails] auditLogsError:", auditLogsError);

  return {
    case: caseObj,
    applicant: applicant || null,
    prescreen: prescreen || null,
    documents: documents || [],
    interview: interview || null,
    clinical: clinical || null,
    decision: decision || null,
    welcome: welcome || null,
    tasks: tasks || [],
    notes: notes || [],
    timeline: timeline || [],
    auditLogs: auditLogs || []
  };
}

// Update Case Assignments
export async function updateAssignments(caseId, fields, actorId) {
  if (isMockMode) {
    const db = getMockDb();
    const caseObj = db.cases.find(c => c.id === caseId);
    if (caseObj) {
      if (fields.coordinatorId !== undefined) caseObj.assignedCoordinatorId = fields.coordinatorId;
      if (fields.interviewerId !== undefined) caseObj.assignedInterviewerId = fields.interviewerId;
      if (fields.clinicianId !== undefined) caseObj.assignedClinicianId = fields.clinicianId;
      
      await logAuditEvent({
        actorId,
        action: "applicant_record_updated",
        entityType: "admissions_case",
        entityId: caseId,
        caseId,
        metadata: { assignments: fields }
      });
      return { success: true };
    }
  } else {
    const payload = {};
    if (fields.coordinatorId !== undefined) payload.assigned_coordinator_id = fields.coordinatorId;
    if (fields.interviewerId !== undefined) payload.assigned_interviewer_id = fields.interviewerId;
    if (fields.clinicianId !== undefined) payload.assigned_clinician_id = fields.clinicianId;

    await supabase.from("admissions_cases").update(payload).eq("id", caseId);
    await logAuditEvent({
      actorId,
      action: "applicant_record_updated",
      entityType: "admissions_case",
      entityId: caseId,
      caseId,
      metadata: { assignments: fields }
    });
    return { success: true };
  }
  return { success: false };
}

// Update Admissions Case Status
export async function updateCaseStatus(params, actorId) {
  const result = StatusChangeSchema.safeParse(params);
  if (!result.success) return { success: false, error: result.error };

  const { caseId, status, reason } = result.data;

  if (isMockMode) {
    const db = getMockDb();
    const caseObj = db.cases.find(c => c.id === caseId);
    if (caseObj) {
      const oldStatus = caseObj.status;
      caseObj.status = status;
      caseObj.updatedAt = new Date().toISOString();

      if (status === "admitted") {
        caseObj.admittedAt = new Date().toISOString();
      } else if (status === "closed") {
        caseObj.closedAt = new Date().toISOString();
        caseObj.closedReasonCategory = reason || "Unspecified";
      }

      await logActivityEvent({
        caseId,
        eventType: "status_changed",
        title: "Status Changed",
        summary: `Case status changed from ${oldStatus.replace(/_/g, " ")} to ${status.replace(/_/g, " ")}.`,
        actorId
      });

      await logAuditEvent({
        actorId,
        action: "status_changed",
        entityType: "admissions_case",
        entityId: caseId,
        caseId,
        metadata: { oldStatus, nextStatus: status }
      });

      return { success: true };
    }
  } else {
    const payload = { status, updated_at: new Date().toISOString() };
    if (status === "admitted") payload.admitted_at = new Date().toISOString();
    if (status === "closed") {
      payload.closed_at = new Date().toISOString();
      payload.closed_reason_category = reason || "Unspecified";
    }

    await supabase.from("admissions_cases").update(payload).eq("id", caseId);
    
    await logActivityEvent({
      caseId,
      eventType: "status_changed",
      title: "Status Changed",
      summary: `Case status updated to ${status}.`,
      actorId
    });

    await logAuditEvent({
      actorId,
      action: "status_changed",
      entityType: "admissions_case",
      entityId: caseId,
      caseId,
      metadata: { nextStatus: status }
    });
    return { success: true };
  }
  return { success: false };
}

// Add Note
export async function addCaseNote(params, actorId) {
  const result = NoteCreateSchema.safeParse(params);
  if (!result.success) return { success: false, error: result.error };

  const { caseId, visibility, content } = result.data;
  const newNote = {
    id: `n-${Math.random().toString(36).substr(2, 9)}`,
    admissions_case_id: caseId,
    author_id: actorId,
    visibility,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isMockMode) {
    const db = getMockDb();
    db.notes.unshift(newNote);

    await logActivityEvent({
      caseId,
      eventType: "note_added",
      title: "Note Added",
      summary: `An internal note was recorded with ${visibility.replace(/_/g, " ")} visibility.`,
      actorId,
      visibility
    });

    await logAuditEvent({
      actorId,
      action: "note_created",
      entityType: "note",
      entityId: newNote.id,
      caseId,
      metadata: { visibility }
    });

    return { success: true };
  } else {
    await supabase.from("notes").insert(newNote);
    
    await logActivityEvent({
      caseId,
      eventType: "note_added",
      title: "Note Added",
      summary: `Internal note saved under ${visibility}.`,
      actorId,
      visibility
    });

    await logAuditEvent({
      actorId,
      action: "note_created",
      entityType: "note",
      entityId: newNote.id,
      caseId,
      metadata: { visibility }
    });
    return { success: true };
  }
}

// Add/Update Task
export async function saveTask(params, actorId) {
  const result = TaskCreateSchema.safeParse(params);
  if (!result.success) return { success: false, error: result.error };

  const taskData = result.data;
  const taskId = `t-${Math.random().toString(36).substr(2, 9)}`;

  const newTask = {
    id: taskId,
    admissions_case_id: taskData.caseId,
    title: taskData.title,
    description: taskData.description || "",
    assigned_to: taskData.assignedTo || null,
    due_date: taskData.dueDate || null,
    status: "todo",
    priority: taskData.priority,
    created_by: taskData.createdBy,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isMockMode) {
    const db = getMockDb();
    db.tasks.unshift(newTask);

    await logActivityEvent({
      caseId: taskData.caseId,
      eventType: "task_created",
      title: "Task Assigned",
      summary: `New task: "${taskData.title}" was assigned.`,
      actorId
    });

    await logAuditEvent({
      actorId,
      action: "task_created",
      entityType: "task",
      entityId: taskId,
      caseId: taskData.caseId,
      metadata: { title: taskData.title }
    });
    return { success: true };
  } else {
    await supabase.from("tasks").insert(newTask);
    await logActivityEvent({
      caseId: taskData.caseId,
      eventType: "task_created",
      title: "Task Assigned",
      summary: `Task: ${taskData.title}`,
      actorId
    });
    await logAuditEvent({
      actorId,
      action: "task_created",
      entityType: "task",
      entityId: taskId,
      caseId: taskData.caseId,
      metadata: { title: taskData.title }
    });
    return { success: true };
  }
}

// Complete Task
export async function toggleTaskComplete(taskId, actorId) {
  if (isMockMode) {
    const db = getMockDb();
    const task = db.tasks.find(t => t.id === taskId);
    if (task) {
      const nextStatus = task.status === "completed" ? "todo" : "completed";
      task.status = nextStatus;
      task.completed_at = nextStatus === "completed" ? new Date().toISOString() : null;

      await logAuditEvent({
        actorId,
        action: "task_updated",
        entityType: "task",
        entityId: taskId,
        caseId: task.admissions_case_id,
        metadata: { title: task.title, status: nextStatus }
      });
      return { success: true };
    }
  } else {
    const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).single();
    if (task) {
      const nextStatus = task.status === "completed" ? "todo" : "completed";
      const completedAt = nextStatus === "completed" ? new Date().toISOString() : null;
      await supabase.from("tasks").update({ status: nextStatus, completed_at: completedAt }).eq("id", taskId);
      await logAuditEvent({
        actorId,
        action: "task_updated",
        entityType: "task",
        entityId: taskId,
        caseId: task.admissions_case_id,
        metadata: { status: nextStatus }
      });
      return { success: true };
    }
  }
  return { success: false };
}

// Update Admissions Document Check
export async function updateDocumentStatus(params, actorId) {
  const result = DocumentUpdateSchema.safeParse(params);
  if (!result.success) return { success: false, error: result.error };

  const { caseId, documentTypeId, status, notes } = result.data;

  if (isMockMode) {
    const db = getMockDb();
    let doc = db.documents.find(d => d.admissions_case_id === caseId && d.document_type_id === documentTypeId);
    
    if (!doc) {
      // Create lazy document slot reference if not initialized
      doc = {
        id: `ad-${Math.random().toString(36).substr(2, 9)}`,
        admissions_case_id: caseId,
        document_type_id: documentTypeId,
        status: "not_requested",
        requested_at: new Date().toISOString(),
        submitted_at: null,
        reviewed_at: null,
        reviewed_by: null,
        file_path: null,
        file_name: null,
        file_mime_type: null,
        file_size: null,
        expires_at: null,
        notes: ""
      };
      db.documents.push(doc);
    }

    const docTypeObj = db.documentTypes.find(dt => dt.id === documentTypeId || dt.documentNumber === documentTypeId);
    const docTitle = docTypeObj ? docTypeObj.title : "Admissions Document";

    doc.status = status;
    if (status === "requested") doc.requested_at = new Date().toISOString();
    if (status === "submitted") doc.submitted_at = new Date().toISOString();
    if (status === "complete" || status === "reviewed") {
      doc.reviewed_at = new Date().toISOString();
      doc.reviewed_by = actorId;
    }
    if (notes) doc.notes = notes;

    await logActivityEvent({
      caseId,
      eventType: "document_updated",
      title: "Document Updated",
      summary: `Document "${docTitle}" status changed to ${status.replace(/_/g, " ")}.`,
      actorId
    });

    await logAuditEvent({
      actorId,
      action: status === "complete" ? "document_viewed" : "document_requested",
      entityType: "admissions_document",
      entityId: doc.id,
      caseId,
      metadata: { documentType: documentTypeId, status }
    });

    return { success: true };
  } else {
    // Real Supabase insert/update logic
    const { data: existingDocs } = await supabase
      .from("admissions_documents")
      .select("*")
      .eq("admissions_case_id", caseId)
      .eq("document_type_id", documentTypeId);

    const docPayload = {
      status,
      updated_at: new Date().toISOString()
    };
    if (status === "requested") docPayload.requested_at = new Date().toISOString();
    if (status === "submitted") docPayload.submitted_at = new Date().toISOString();
    if (status === "complete") {
      docPayload.reviewed_at = new Date().toISOString();
      docPayload.reviewed_by = actorId;
    }
    if (notes) docPayload.notes = notes;

    if (existingDocs && existingDocs.length > 0) {
      await supabase.from("admissions_documents").update(docPayload).eq("id", existingDocs[0].id);
    } else {
      await supabase.from("admissions_documents").insert({
        admissions_case_id: caseId,
        document_type_id: documentTypeId,
        ...docPayload
      });
    }

    await logActivityEvent({
      caseId,
      eventType: "document_updated",
      title: "Document Updated",
      summary: `Document changed status to ${status}.`,
      actorId
    });

    await logAuditEvent({
      actorId,
      action: "document_requested",
      entityType: "admissions_document",
      entityId: documentTypeId,
      caseId,
      metadata: { status }
    });
    return { success: true };
  }
}

// Record Committee Decision
export async function saveCommitteeDecision(params, actorId) {
  const result = CommitteeDecisionSchema.safeParse(params);
  if (!result.success) return { success: false, error: result.error };

  const data = result.data;
  const newDecision = {
    id: `dec-${Math.random().toString(36).substr(2, 9)}`,
    admissions_case_id: data.admissionsCaseId,
    committee_review_date: data.committeeReviewDate,
    decision: data.decision,
    conditions_of_admission: data.conditionsOfAdmission || "",
    committee_comments: data.committeeComments || "",
    chair_id: data.chairId,
    executive_director_id: data.executiveDirectorId,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isMockMode) {
    const db = getMockDb();
    db.decisions.push(newDecision);

    // Sync Case Status based on decision
    const caseObj = db.cases.find(c => c.id === data.admissionsCaseId);
    if (caseObj) {
      if (data.decision === "admit") caseObj.status = "welcome_day_scheduled";
      else if (data.decision === "admit_with_conditions") caseObj.status = "welcome_day_scheduled";
      else if (data.decision === "wait_list") caseObj.status = "wait_list";
      else if (data.decision === "decline_admission") caseObj.status = "closed";
    }

    await logActivityEvent({
      caseId: data.admissionsCaseId,
      eventType: "committee_reviewed",
      title: "Committee Decision Recorded",
      summary: `Admissions committee decision registered as "${data.decision.replace(/_/g, " ")}".`,
      actorId
    });

    await logAuditEvent({
      actorId,
      action: "committee_decision_recorded",
      entityType: "committee_decision",
      entityId: newDecision.id,
      caseId: data.admissionsCaseId,
      metadata: { decision: data.decision }
    });
    return { success: true };
  } else {
    await supabase.from("committee_decisions").insert(newDecision);
    
    // Sync Case Status
    let nextStatus = "committee_review_pending";
    if (data.decision === "admit" || data.decision === "admit_with_conditions") nextStatus = "welcome_day_scheduled";
    else if (data.decision === "wait_list") nextStatus = "wait_list";
    else if (data.decision === "decline_admission") nextStatus = "closed";

    await supabase.from("admissions_cases").update({ status: nextStatus }).eq("id", data.admissionsCaseId);

    await logActivityEvent({
      caseId: data.admissionsCaseId,
      eventType: "committee_reviewed",
      title: "Committee Reviewed",
      summary: `Decision: ${data.decision}`,
      actorId
    });

    await logAuditEvent({
      actorId,
      action: "committee_decision_recorded",
      entityType: "committee_decision",
      entityId: newDecision.id,
      caseId: data.admissionsCaseId,
      metadata: { decision: data.decision }
    });
    return { success: true };
  }
}

// Complete Welcome Day Checklist
export async function saveWelcomeDay(params, actorId) {
  const result = WelcomeDaySchema.safeParse(params);
  if (!result.success) return { success: false, error: result.error };

  const data = result.data;
  const welcomeId = `wel-${Math.random().toString(36).substr(2, 9)}`;

  const newWelcome = {
    id: welcomeId,
    admissions_case_id: data.admissionsCaseId,
    welcome_day_date: data.welcomeDayDate,
    staff_member_id: data.staffMemberId,
    room_assignment: data.roomAssignment || "",
    admission_approved_confirmed: data.admissionApprovedConfirmed,
    bedroom_prepared: data.bedroomPrepared,
    entrance_access_created: data.entranceAccessCreated,
    resident_file_complete: data.residentFileComplete,
    identity_verified: data.identityVerified,
    covenant_signed: data.covenantSigned,
    financial_snapshot_complete: data.financialSnapshotComplete,
    emergency_contact_complete: data.emergencyContactComplete,
    access_code_assignment_complete: data.accessCodeAssignmentComplete,
    house_tour_complete: data.houseTourComplete,
    first_case_management_meeting_date: data.firstCaseManagementMeetingDate || null,
    prayer_offered_if_desired: data.prayerOfferedIfDesired,
    officially_admitted: data.officiallyAdmitted,
    completed_at: data.officiallyAdmitted ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isMockMode) {
    const db = getMockDb();
    
    // Remove old welcome day record if it exists
    db.welcome = db.welcome.filter(w => w.admissions_case_id !== data.admissionsCaseId);
    db.welcome.push(newWelcome);

    // Sync Case Status
    const caseObj = db.cases.find(c => c.id === data.admissionsCaseId);
    if (caseObj) {
      caseObj.welcomeDayDate = data.welcomeDayDate;
      if (data.officiallyAdmitted) {
        caseObj.status = "admitted";
        caseObj.admittedAt = new Date().toISOString();

        // Create resident conversion audit trail
        await logActivityEvent({
          caseId: data.admissionsCaseId,
          eventType: "resident_admitted",
          title: "Admitted into Residency",
          summary: "Welcome Day checklists completed. Applicant record converted to active resident.",
          actorId
        });

        await logAuditEvent({
          actorId,
          action: "welcome_day_completed",
          entityType: "welcome_day",
          entityId: welcomeId,
          caseId: data.admissionsCaseId,
          metadata: { room: data.roomAssignment, status: "admitted" }
        });
      }
    }

    return { success: true };
  } else {
    await supabase.from("welcome_day_records").delete().eq("admissions_case_id", data.admissionsCaseId);
    await supabase.from("welcome_day_records").insert(newWelcome);

    if (data.officiallyAdmitted) {
      await supabase.from("admissions_cases").update({
        status: "admitted",
        welcome_day_date: data.welcomeDayDate,
        admitted_at: new Date().toISOString()
      }).eq("id", data.admissionsCaseId);

      await logActivityEvent({
        caseId: data.admissionsCaseId,
        eventType: "resident_admitted",
        title: "Resident Admitted",
        summary: "Residency onboarding complete.",
        actorId
      });

      await logAuditEvent({
        actorId,
        action: "welcome_day_completed",
        entityType: "welcome_day",
        entityId: welcomeId,
        caseId: data.admissionsCaseId,
        metadata: { status: "admitted" }
      });
    }
    return { success: true };
  }
}

// Fetch All Audit Logs
export async function getAuditLogs() {
  if (isMockMode) {
    const db = getMockDb();
    return db.audit.map(log => {
      const staff = db.staff.find(s => s.id === log.actor_id);
      return {
        ...log,
        actorEmail: staff ? staff.email : "System / Unknown"
      };
    });
  }

  const { data } = await supabase
    .from("audit_logs")
    .select(`
      *,
      staff_profiles (email)
    `)
    .order("created_at", { ascending: false });

  return (data || []).map(log => ({
    ...log,
    actorEmail: log.staff_profiles ? log.staff_profiles.email : "System"
  }));
}

// Bulk Delete Admissions Cases
export async function deleteCases(caseIds, actorId) {
  if (isMockMode) {
    const db = getMockDb();
    
    // Find case records to get applicantIds
    const casesToDelete = db.cases.filter(c => caseIds.includes(c.id));
    const applicantIds = casesToDelete.map(c => c.applicantId);

    // Filter out deleted records in mock DB
    db.cases = db.cases.filter(c => !caseIds.includes(c.id));
    db.applicants = db.applicants.filter(a => !applicantIds.includes(a.id));
    db.prescreens = db.prescreens.filter(ps => !caseIds.includes(ps.admissions_case_id));
    db.documents = db.documents.filter(d => !caseIds.includes(d.admissions_case_id));
    db.tasks = db.tasks.filter(t => !caseIds.includes(t.admissions_case_id));
    db.notes = db.notes.filter(n => !caseIds.includes(n.admissions_case_id));
    db.events = db.events.filter(e => !caseIds.includes(e.admissions_case_id));
    db.audit = db.audit.filter(a => !caseIds.includes(a.admissions_case_id));
    db.interviews = db.interviews.filter(i => !caseIds.includes(i.admissions_case_id));
    db.clinical = db.clinical.filter(c => !caseIds.includes(c.admissions_case_id));
    db.decisions = db.decisions.filter(d => !caseIds.includes(d.admissions_case_id));
    db.welcome = db.welcome.filter(w => !caseIds.includes(w.admissions_case_id));

    return { success: true };
  }

  // Real Supabase deletion
  const { data: casesData, error: casesFetchError } = await supabase
    .from("admissions_cases")
    .select("applicant_id")
    .in("id", caseIds);
    
  if (casesFetchError) throw new Error(`Fetch error: ${casesFetchError.message}`);
  const applicantIds = casesData.map(c => c.applicant_id).filter(Boolean);

  // 2. Delete from admissions_cases (cascades to other tables)
  const { error: caseDeleteError } = await supabase
    .from("admissions_cases")
    .delete()
    .in("id", caseIds);

  if (caseDeleteError) throw new Error(`Delete cases error: ${caseDeleteError.message}`);

  // 3. Delete from applicants
  if (applicantIds.length > 0) {
    const { error: applicantDeleteError } = await supabase
      .from("applicants")
      .delete()
      .in("id", applicantIds);
    if (applicantDeleteError) console.error("Error deleting applicants:", applicantDeleteError.message);
  }

  // 4. Log Audit Event
  await logAuditEvent({
    actorId,
    action: "applicant_record_deleted",
    entityType: "admissions_case",
    entityId: caseIds.join(","),
    metadata: { deletedCount: caseIds.length }
  });

  return { success: true };
}
