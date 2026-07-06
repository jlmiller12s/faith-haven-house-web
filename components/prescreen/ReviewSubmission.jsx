export default function ReviewSubmission({ formData, setStep, acks, setAcks, ackErrors }) {
  const handleAckChange = (key) => {
    setAcks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <div className="step-header">
        <h2>Step 7: Review &amp; Submit</h2>
        <p>Please review your information before submitting. Click &quot;Edit&quot; next to any section to make changes.</p>
      </div>

      <div className="review-summary-box">
        {/* Step 1 Review */}
        <div className="review-section">
          <div className="review-section-header">
            <h3>1. Contact Information</h3>
            <button type="button" className="btn-edit-step" onClick={() => setStep(1)}>Edit</button>
          </div>
          <div className="review-item">
            <span className="review-item-label">Full Name:</span>
            <span className="review-item-value">{formData.fullName || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Phone Number:</span>
            <span className="review-item-value">{formData.phone || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Preferred Contact:</span>
            <span className="review-item-value">{formData.contactMethod || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">City &amp; County:</span>
            <span className="review-item-value">{formData.cityCounty || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Email Address:</span>
            <span className="review-item-value">{formData.email || "N/A"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">OK to Voicemail/Text:</span>
            <span className="review-item-value">{formData.canContactMessage || "—"}</span>
          </div>
        </div>

        {/* Step 2 Review */}
        <div className="review-section">
          <div className="review-section-header">
            <h3>2. Current Situation</h3>
            <button type="button" className="btn-edit-step" onClick={() => setStep(2)}>Edit</button>
          </div>
          <div className="review-item">
            <span className="review-item-label">Housing Situation:</span>
            <span className="review-item-value">{formData.housingSituation || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Timeline Needed:</span>
            <span className="review-item-value">{formData.timeframe || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">How You Heard:</span>
            <span className="review-item-value">{formData.referralSource || "—"}</span>
          </div>
        </div>

        {/* Step 3 Review */}
        <div className="review-section">
          <div className="review-section-header">
            <h3>3. Support Goals</h3>
            <button type="button" className="btn-edit-step" onClick={() => setStep(3)}>Edit</button>
          </div>
          <div className="review-item">
            <span className="review-item-label">Hoped Accomplishments:</span>
            <span className="review-item-value">
              {Array.isArray(formData.supportGoals) && formData.supportGoals.length > 0
                ? formData.supportGoals.join(", ")
                : "—"}
            </span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Biggest Challenge:</span>
            <span className="review-item-value">{formData.biggestChallenge || "—"}</span>
          </div>
          {formData.futureGoals && (
            <div className="review-item">
              <span className="review-item-label">6-12 Month Vision:</span>
              <span className="review-item-value">{formData.futureGoals}</span>
            </div>
          )}
        </div>

        {/* Step 4 Review */}
        <div className="review-section">
          <div className="review-section-header">
            <h3>4. Program Readiness</h3>
            <button type="button" className="btn-edit-step" onClick={() => setStep(4)}>Edit</button>
          </div>
          <div className="review-item">
            <span className="review-item-label">Structured Program:</span>
            <span className="review-item-value">{formData.willingStructured || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Personal Roadmap:</span>
            <span className="review-item-value">{formData.willingRoadmap || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Substance-Free Rules:</span>
            <span className="review-item-value">{formData.willingSubstanceFree || "—"}</span>
          </div>
        </div>

        {/* Step 5 Review */}
        <div className="review-section">
          <div className="review-section-header">
            <h3>5. Practical Readiness</h3>
            <button type="button" className="btn-edit-step" onClick={() => setStep(5)}>Edit</button>
          </div>
          <div className="review-item">
            <span className="review-item-label">Employment Status:</span>
            <span className="review-item-value">{formData.employmentStatus || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Source of Income:</span>
            <span className="review-item-value">{formData.incomeSource || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Government Photo ID:</span>
            <span className="review-item-value">{formData.hasPhotoId || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Employment Docs:</span>
            <span className="review-item-value">{formData.hasWorkDocs || "—"}</span>
          </div>
          <div className="review-item">
            <span className="review-item-label">Transportation:</span>
            <span className="review-item-value">{formData.transportationStatus || "—"}</span>
          </div>
        </div>

        {/* Step 6 Review */}
        <div className="review-section">
          <div className="review-section-header">
            <h3>6. Safety &amp; Follow-Up</h3>
            <button type="button" className="btn-edit-step" onClick={() => setStep(6)}>Edit</button>
          </div>
          <div className="review-item">
            <span className="review-item-label">Immediate Emergency:</span>
            <span className="review-item-value">{formData.immediateCrisis || "—"}</span>
          </div>
          {formData.safeContactDetails && (
            <div className="review-item">
              <span className="review-item-label">Safest Contact Note:</span>
              <span className="review-item-value">{formData.safeContactDetails}</span>
            </div>
          )}
          <div className="review-item">
            <span className="review-item-label">Working with Case Mgr/Org:</span>
            <span className="review-item-value">{formData.workingWithOrg || "—"}</span>
          </div>
          {formData.permissionContactOrg && (
            <div className="review-item">
              <span className="review-item-label">Permission to Contact Org:</span>
              <span className="review-item-value">{formData.permissionContactOrg}</span>
            </div>
          )}
          <div className="review-item">
            <span className="review-item-label">Reasonable Accommodation:</span>
            <span className="review-item-value">{formData.needsAccommodation || "—"}</span>
          </div>
          {formData.additionalNotes && (
            <div className="review-item">
              <span className="review-item-label">Additional Notes:</span>
              <span className="review-item-value">{formData.additionalNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Acknowledgements */}
      <div className="acknowledgements-box">
        <h4>Required Acknowledgements</h4>
        {ackErrors && <p className="field-error-message" style={{ marginBottom: "1rem" }}>{ackErrors}</p>}

        <label className="ack-checkbox-label">
          <input
            type="checkbox"
            checked={!!acks.ackNotGuarantee}
            onChange={() => handleAckChange("ackNotGuarantee")}
          />
          <span>I understand this is an initial interest and pre-screening form, not a guarantee of placement.</span>
        </label>

        <label className="ack-checkbox-label">
          <input
            type="checkbox"
            checked={!!acks.ackStaffConversation}
            onChange={() => handleAckChange("ackStaffConversation")}
          />
          <span>I understand that Faith Haven House may request additional information during a private staff conversation.</span>
        </label>

        <label className="ack-checkbox-label">
          <input
            type="checkbox"
            checked={!!acks.ackNoSensitiveData}
            onChange={() => handleAckChange("ackNoSensitiveData")}
          />
          <span>I understand that I should not submit highly sensitive personal, medical, or legal information through this online form.</span>
        </label>

        <label className="ack-checkbox-label">
          <input
            type="checkbox"
            checked={!!acks.ackAccurate}
            onChange={() => handleAckChange("ackAccurate")}
          />
          <span>I confirm that the information I submitted is accurate to the best of my knowledge.</span>
        </label>

        <label className="ack-checkbox-label">
          <input
            type="checkbox"
            checked={!!acks.ackPermissionContact}
            onChange={() => handleAckChange("ackPermissionContact")}
          />
          <span>I give Faith Haven House permission to contact me using the method I selected above.</span>
        </label>
      </div>
    </div>
  );
}
