"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BASE_STEPS = [
  {
    target: null,
    eyebrow: "Welcome to the RAP Portal",
    title: "Your work starts here",
    body: "This short tour shows you where to review admissions, manage documents, publish updates, and find the tools available to your role.",
  },
  {
    target: '[data-tour="dashboard"]',
    eyebrow: "Dashboard",
    title: "See what needs attention",
    body: "Start here for a snapshot of new pre-screens, cases in progress, and tasks assigned to you.",
  },
  {
    target: '[data-tour="admissions"]',
    eyebrow: "Admissions",
    title: "Move applicants through the process",
    body: "Open the admissions queue, filter cases, review applicant records, and continue the next appropriate step.",
  },
  {
    target: '[data-tour="intake-documents"]',
    eyebrow: "Intake documents",
    title: "Find approved forms",
    body: "Download the current intake and admissions documents from one organized library.",
  },
  {
    target: '[data-tour="blog"]',
    eyebrow: "Blog manager",
    title: "Share news and stories",
    body: "Create drafts, review content, and publish updates to the public Faith Haven House website.",
  },
  {
    target: '[data-tour="residents"]',
    eyebrow: "Residents",
    title: "Review the active resident directory",
    body: "Authorized staff can use this area to find current resident records and program information.",
  },
  {
    target: '[data-tour="team"]',
    eyebrow: "Team administration",
    title: "Manage staff access",
    body: "Super administrators can manage staff roles and invite new team members from these controls.",
  },
  {
    target: '[data-tour="audit"]',
    eyebrow: "Audit trail",
    title: "Review portal activity",
    body: "Authorized administrators and auditors can review recorded system activity here.",
  },
  {
    target: '[data-tour="sign-out"]',
    eyebrow: "Account safety",
    title: "Sign out when you finish",
    body: "Always sign out on a shared device. You can replay this tour anytime with the Tour button.",
  },
];

const EMPTY_RECT = { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 };

export default function RapPortalTour({ open, onClose }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState(EMPTY_RECT);
  const dialogRef = useRef(null);

  const steps = useMemo(() => {
    if (typeof document === "undefined") return BASE_STEPS;
    return BASE_STEPS.filter((step) => !step.target || document.querySelector(step.target));
  }, [open]);

  const current = steps[stepIndex] || steps[0];
  const isLast = stepIndex === steps.length - 1;

  const updateTarget = useCallback(() => {
    if (!open || !current?.target) {
      setRect(EMPTY_RECT);
      return;
    }
    const element = document.querySelector(current.target);
    if (!element) return;
    const next = element.getBoundingClientRect();
    setRect({
      top: next.top,
      left: next.left,
      width: next.width,
      height: next.height,
      right: next.right,
      bottom: next.bottom,
    });
  }, [current, open]);

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    updateTarget();
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [open, updateTarget]);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") onClose("skipped");
      if (event.key === "ArrowRight" && !isLast) setStepIndex((value) => value + 1);
      if (event.key === "ArrowLeft" && stepIndex > 0) setStepIndex((value) => value - 1);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isLast, onClose, open, stepIndex]);

  if (!open || !current) return null;

  const hasTarget = Boolean(current.target && rect.width);
  const placeBelow = hasTarget && rect.bottom < window.innerHeight * 0.48;
  const positionStyle = hasTarget
    ? {
        left: Math.min(Math.max(rect.left, 18), Math.max(18, window.innerWidth - 398)),
        ...(placeBelow
          ? { top: Math.min(rect.bottom + 10, window.innerHeight - 360) }
          : { bottom: Math.max(window.innerHeight - rect.top + 10, 18) }),
      }
    : {};

  return (
    <div className="rap-tour-layer" aria-live="polite">
      <button
        type="button"
        className={`rap-tour-scrim${hasTarget ? " has-spotlight" : ""}`}
        aria-label="Skip portal tour"
        onClick={() => onClose("skipped")}
      />
      {hasTarget && (
        <div
          className="rap-tour-spotlight"
          aria-hidden="true"
          style={{
            top: rect.top - 7,
            left: rect.left - 7,
            width: rect.width + 14,
            height: rect.height + 14,
          }}
        />
      )}
      <section
        ref={dialogRef}
        className={`rap-tour-card${hasTarget ? " is-anchored" : " is-welcome"}`}
        style={positionStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rap-tour-title"
        tabIndex={-1}
      >
        <div className="rap-tour-progress" aria-label={`Step ${stepIndex + 1} of ${steps.length}`}>
          {steps.map((_, index) => (
            <span key={index} className={index <= stepIndex ? "is-active" : ""} />
          ))}
        </div>
        <p className="rap-tour-eyebrow">
          {current.eyebrow}
          <span>{stepIndex + 1} / {steps.length}</span>
        </p>
        <h2 id="rap-tour-title">{current.title}</h2>
        <p className="rap-tour-body">{current.body}</p>
        <div className="rap-tour-actions">
          <button type="button" className="rap-tour-skip" onClick={() => onClose("skipped")}>
            Skip tour
          </button>
          <div>
            {stepIndex > 0 && (
              <button type="button" className="rap-tour-back" onClick={() => setStepIndex((value) => value - 1)}>
                Back
              </button>
            )}
            <button
              type="button"
              className="rap-tour-next"
              onClick={() => isLast ? onClose("completed") : setStepIndex((value) => value + 1)}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
