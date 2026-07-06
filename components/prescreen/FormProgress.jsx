const STEP_LABELS = [
  "Contact Info",
  "Situation",
  "Support Goals",
  "Program Readiness",
  "Practical Readiness",
  "Safety & Follow-Up",
  "Review & Submit"
];

export default function FormProgress({ currentStep, setStep }) {
  const totalSteps = STEP_LABELS.length;
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="form-progress-wrapper" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      <div className="form-progress-steps">
        <div className="form-progress-line">
          <div
            className="form-progress-line-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {STEP_LABELS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <button
              key={label}
              type="button"
              className={`form-step-node${isActive ? " active" : ""}${isCompleted ? " completed" : ""}`}
              onClick={() => {
                if (stepNum < currentStep) {
                  setStep(stepNum);
                }
              }}
              disabled={stepNum > currentStep}
              title={`Step ${stepNum}: ${label}`}
              aria-current={isActive ? "step" : undefined}
            >
              <div className="step-node-bubble">
                {isCompleted ? "✓" : stepNum}
              </div>
              <span className="step-node-label">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
