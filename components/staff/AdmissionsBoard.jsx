"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteCases,
  getAdmissionsQueue,
  updateCaseStatus,
  updatePrescreenReview,
  updateScreeningAnswer,
} from "@/lib/crmService";
import {
  ADMISSIONS_STAGES,
  screeningAnswer,
  stageForStatus,
  statusForStage,
} from "@/lib/admissionsWorkflow.mjs";
import { useStaffSession } from "@/app/staff/StaffClientProvider";

export default function AdmissionsBoard() {
  const { activeStaff } = useStaffSession();
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [draggedCaseId, setDraggedCaseId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [busyCaseId, setBusyCaseId] = useState(null);
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);

  const canModify = ["super_admin", "executive_director", "admissions_coordinator"].includes(activeStaff?.role);
  const canDelete = canModify;

  const loadQueue = async () => {
    setLoading(true);
    try {
      setQueue(await getAdmissionsQueue());
      setFeedback(null);
    } catch (error) {
      setFeedback({ type: "error", text: error?.message || "The admissions board could not be loaded." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const filteredQueue = useMemo(() => {
    const query = search.trim().toLowerCase();
    return queue.filter((item) => {
      const matchesSearch = !query || [
        item.caseNumber,
        activeStaff?.role === "read_only_auditor" ? "" : item.applicantName,
        activeStaff?.role === "read_only_auditor" ? "" : item.applicantPhone,
        activeStaff?.role === "read_only_auditor" ? "" : item.applicantEmail,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesAssigned = assignedFilter === "all" || (
        assignedFilter === "me" && [
          item.assignedCoordinatorId,
          item.assignedInterviewerId,
          item.assignedClinicianId,
        ].includes(activeStaff?.id)
      );
      return matchesSearch && matchesAssigned;
    });
  }, [activeStaff, assignedFilter, queue, search]);

  const moveCase = async (caseId, stageId) => {
    const item = queue.find((candidate) => candidate.id === caseId);
    if (!item || !canModify || stageForStatus(item.status) === stageId) return;

    setBusyCaseId(caseId);
    setFeedback(null);
    const status = statusForStage(stageId);
    try {
      const result = await updateCaseStatus({
        caseId,
        status,
        actorId: activeStaff.id,
        reason: stageId === "closed" ? "Closed from admissions board" : undefined,
      }, activeStaff.id);
      if (!result.success) throw new Error(typeof result.error === "string" ? result.error : "The applicant could not be moved.");
      setQueue((current) => current.map((candidate) => candidate.id === caseId ? { ...candidate, status } : candidate));
      setFeedback({ type: "success", text: `${item.applicantName} moved to ${ADMISSIONS_STAGES.find(stage => stage.id === stageId)?.label}.` });
    } catch (error) {
      setFeedback({ type: "error", text: error?.message || "The applicant could not be moved." });
    } finally {
      setBusyCaseId(null);
      setDraggedCaseId(null);
      setDragOverStage(null);
    }
  };

  const updateMilestone = async (item, milestone, answer) => {
    setBusyCaseId(item.id);
    setFeedback(null);
    try {
      const result = milestone === "prescreen"
        ? await updatePrescreenReview(item.id, answer, activeStaff.id)
        : await updateScreeningAnswer(item.id, "background_check", answer, activeStaff.id);
      if (!result.success) throw new Error(result.error || "The milestone could not be updated.");

      setQueue((current) => current.map((candidate) => {
        if (candidate.id !== item.id) return candidate;
        if (milestone === "prescreen") return { ...candidate, prescreenReviewed: answer === "yes" };
        const screenings = (candidate.screenings || []).filter(screening => screening.screening_type !== "background_check");
        screenings.push({ screening_type: "background_check", status: answer === "yes" ? "completed" : "pending" });
        return { ...candidate, screenings };
      }));
      setFeedback({ type: "success", text: `${milestone === "prescreen" ? "Pre-screen" : "Background check"} updated for ${item.applicantName}.` });
    } catch (error) {
      setFeedback({ type: "error", text: error?.message || "The milestone could not be updated." });
    } finally {
      setBusyCaseId(null);
    }
  };

  const deleteSelected = async () => {
    if (!selectedCaseIds.length || !window.confirm(`Permanently delete ${selectedCaseIds.length} selected case${selectedCaseIds.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteCases(selectedCaseIds, activeStaff.id);
      setSelectedCaseIds([]);
      await loadQueue();
      setFeedback({ type: "success", text: "Selected cases were deleted." });
    } catch (error) {
      setFeedback({ type: "error", text: error?.message || "The selected cases could not be deleted." });
      setLoading(false);
    }
  };

  return (
    <main className="crm-container admissions-board-page">
      <div className="admissions-board-heading">
        <div>
          <p className="admissions-board-eyebrow">Resident admissions pipeline</p>
          <h1 className="crm-title">Admissions board</h1>
          <p className="crm-subtitle">Drag applicant cards to the next stage, or use the stage menu on each card.</p>
        </div>
        <div className="admissions-board-summary" aria-label={`${filteredQueue.length} active admissions cases`}>
          <strong>{filteredQueue.length}</strong>
          <span>cases shown</span>
        </div>
      </div>

      {!canModify && (
        <div className="crm-alert-banner info" role="status">Your role can review this board. An admissions coordinator or director can move applicants and update milestones.</div>
      )}
      {feedback && <div className={`crm-alert-banner ${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.text}</div>}

      <section className="admissions-board-toolbar" aria-label="Admissions board filters">
        <div className="admissions-board-search">
          <label className="crm-label" htmlFor="admissions-search">Search applicants</label>
          <input id="admissions-search" className="crm-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, email, or case number" />
        </div>
        <div>
          <label className="crm-label" htmlFor="assignment-filter">Assignment</label>
          <select id="assignment-filter" className="crm-select" value={assignedFilter} onChange={(event) => setAssignedFilter(event.target.value)}>
            <option value="all">All cases</option>
            <option value="me">Assigned to me</option>
          </select>
        </div>
        {selectedCaseIds.length > 0 && canDelete && <button type="button" className="btn admissions-delete-button" onClick={deleteSelected}>Delete selected ({selectedCaseIds.length})</button>}
      </section>

      {loading ? (
        <div className="admissions-board-loading" role="status">Loading admissions board…</div>
      ) : (
        <div className="admissions-board-scroll" data-tour="admissions-board">
          <div className="admissions-board-rail" aria-label="Admissions workflow stages">
            {ADMISSIONS_STAGES.map((stage, stageIndex) => {
              const cases = filteredQueue.filter((item) => stageForStatus(item.status) === stage.id);
              return (
                <section
                  key={stage.id}
                  className={`admissions-stage ${dragOverStage === stage.id ? "is-drag-over" : ""}`}
                  onDragOver={(event) => { if (canModify) { event.preventDefault(); setDragOverStage(stage.id); } }}
                  onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOverStage(null); }}
                  onDrop={(event) => { event.preventDefault(); if (draggedCaseId) moveCase(draggedCaseId, stage.id); }}
                >
                  <header className="admissions-stage-header">
                    <span className="admissions-stage-number">{String(stageIndex + 1).padStart(2, "0")}</span>
                    <div><h2>{stage.label}</h2><span>{cases.length} {cases.length === 1 ? "case" : "cases"}</span></div>
                  </header>
                  <div className="admissions-stage-cards">
                    {cases.length === 0 ? (
                      <div className="admissions-stage-empty">Drop a case here</div>
                    ) : cases.map((item) => {
                      const isBusy = busyCaseId === item.id;
                      return (
                        <article
                          className={`admissions-case-card ${isBusy ? "is-busy" : ""}`}
                          key={item.id}
                          draggable={canModify && !isBusy}
                          onDragStart={(event) => { setDraggedCaseId(item.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", item.id); }}
                          onDragEnd={() => { setDraggedCaseId(null); setDragOverStage(null); }}
                        >
                          <div className="admissions-case-card-topline">
                            {canDelete && <input type="checkbox" aria-label={`Select ${item.applicantName}`} checked={selectedCaseIds.includes(item.id)} onChange={() => setSelectedCaseIds(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])} />}
                            <span>{item.caseNumber}</span>
                            {canModify && <span className="admissions-drag-handle" aria-hidden="true">⋮⋮</span>}
                          </div>
                          <h3>{activeStaff?.role === "read_only_auditor" ? "Applicant name redacted" : item.applicantName}</h3>
                          <p className="admissions-case-assignee">{item.assignedCoordinatorName || "Unassigned"}</p>

                          <div className="admissions-case-checks">
                            <label>
                              <span>Pre-screen</span>
                              <select value={item.prescreenReviewed ? "yes" : "no"} disabled={!canModify || isBusy} onChange={(event) => updateMilestone(item, "prescreen", event.target.value)} onPointerDown={(event) => event.stopPropagation()}>
                                <option value="no">No</option><option value="yes">Yes</option>
                              </select>
                            </label>
                            <label>
                              <span>Background check</span>
                              <select value={screeningAnswer(item.screenings, "background_check")} disabled={!canModify || isBusy} onChange={(event) => updateMilestone(item, "background", event.target.value)} onPointerDown={(event) => event.stopPropagation()}>
                                <option value="no">No</option><option value="yes">Yes</option>
                              </select>
                            </label>
                          </div>

                          <div className="admissions-next-task"><span>Next task</span><p>{item.nextTask}</p></div>
                          <label className="admissions-stage-select">
                            <span>Move to stage</span>
                            <select value={stage.id} disabled={!canModify || isBusy} onChange={(event) => moveCase(item.id, event.target.value)}>
                              {ADMISSIONS_STAGES.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                            </select>
                          </label>
                          <Link className="admissions-open-file" href={`/staff/admissions/${item.id}`}>Open applicant file <span aria-hidden="true">→</span></Link>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

