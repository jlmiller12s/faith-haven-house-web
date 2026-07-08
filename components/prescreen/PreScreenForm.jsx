"use client";

import { useState } from "react";
import FormProgress from "./FormProgress";
import ReviewSubmission from "./ReviewSubmission";
import SubmissionSuccess from "./SubmissionSuccess";

const INITIAL_FORM_DATA = {
  // Step 1
  fullName: "",
  phone: "",
  contactMethod: "",
  cityCounty: "",
  email: "",
  canContactMessage: "",

  // Step 2
  housingSituation: "",
  timeframe: "",
  referralSource: "",

  // Step 3
  supportGoals: [],
  biggestChallenge: "",
  futureGoals: "",

  // Step 4
  willingStructured: "",
  willingRoadmap: "",
  willingSubstanceFree: "",

  // Step 5
  employmentStatus: "",
  incomeSource: "",
  hasPhotoId: "",
  hasWorkDocs: "",
  transportationStatus: "",

  // Step 6
  immediateCrisis: "",
  safeContactDetails: "",
  workingWithOrg: "",
  permissionContactOrg: "",
  needsAccommodation: "",
  additionalNotes: "",
};

const INITIAL_ACKS = {
  ackNotGuarantee: false,
  ackStaffConversation: false,
  ackNoSensitiveData: false,
  ackAccurate: false,
  ackPermissionContact: false,
};

export default function PreScreenForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [acks, setAcks] = useState(INITIAL_ACKS);
  const [errors, setErrors] = useState({});
  const [ackError, setAckError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleGoal = (goal) => {
    setFormData(prev => {
      const current = prev.supportGoals || [];
      const updated = current.includes(goal)
        ? current.filter(g => g !== goal)
        : [...current, goal];
      return { ...prev, supportGoals: updated };
    });
    if (errors.supportGoals) {
      setErrors(prev => ({ ...prev, supportGoals: undefined }));
    }
  };

  // Validation per step
  const validateCurrentStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required.";
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone Number is required.";
      } else if (!/^[0-9()\s\-\+\.]{7,20}$/.test(formData.phone.trim())) {
        newErrors.phone = "Please enter a valid phone number.";
      }
      if (!formData.contactMethod) newErrors.contactMethod = "Please select a preferred contact method.";
      if (!formData.cityCounty.trim()) newErrors.cityCounty = "City and County is required.";
      if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
      if (!formData.canContactMessage) newErrors.canContactMessage = "Please answer if we can leave a message or text.";
    }

    if (step === 2) {
      if (!formData.housingSituation) newErrors.housingSituation = "Please select your current housing situation.";
      if (!formData.timeframe) newErrors.timeframe = "Please select how soon you need support.";
      if (!formData.referralSource) newErrors.referralSource = "Please select how you heard about us.";
    }

    if (step === 3) {
      if (!formData.supportGoals || formData.supportGoals.length === 0) {
        newErrors.supportGoals = "Please select at least one support goal.";
      }
      if (!formData.biggestChallenge.trim()) {
        newErrors.biggestChallenge = "Please describe the biggest challenge you are facing.";
      }
    }

    if (step === 4) {
      if (!formData.willingStructured) newErrors.willingStructured = "Please answer this question.";
      if (!formData.willingRoadmap) newErrors.willingRoadmap = "Please answer this question.";
      if (!formData.willingSubstanceFree) newErrors.willingSubstanceFree = "Please answer this question.";
    }

    if (step === 5) {
      if (!formData.employmentStatus) newErrors.employmentStatus = "Please select employment status.";
      if (!formData.incomeSource) newErrors.incomeSource = "Please select income source.";
      if (!formData.hasPhotoId) newErrors.hasPhotoId = "Please answer photo ID question.";
      if (!formData.hasWorkDocs) newErrors.hasWorkDocs = "Please answer work documentation question.";
      if (!formData.transportationStatus) newErrors.transportationStatus = "Please answer transportation question.";
    }

    if (step === 6) {
      if (!formData.immediateCrisis) newErrors.immediateCrisis = "Please answer emergency support question.";
      if (!formData.workingWithOrg) newErrors.workingWithOrg = "Please select if working with an organization.";
      if (formData.workingWithOrg === "Yes" && !formData.permissionContactOrg) {
        newErrors.permissionContactOrg = "Please indicate if we may contact the organization.";
      }
      if (!formData.needsAccommodation) newErrors.needsAccommodation = "Please answer accommodation question.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verify all acknowledgements checked
    const allChecked = Object.values(acks).every(Boolean);
    if (!allChecked) {
      setAckError("Please review and check all acknowledgement boxes before submitting.");
      return;
    }

    setAckError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/prescreen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, acknowledgements: acks }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        window.scrollTo({ top: 200, behavior: "smooth" });
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "There was an issue submitting your form. Please try again or call us directly at 636-577-5876.");
      }
    } catch (err) {
      console.error(err);
      alert(err?.message || "Submission error. Please check your network or call 636-577-5876.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <SubmissionSuccess />;
  }

  return (
    <div className="prescreen-card">
      <FormProgress currentStep={step} setStep={setStep} />

      <form onSubmit={step === 7 ? handleSubmit : (e) => e.preventDefault()}>
        {/* STEP 1: Contact Information */}
        {step === 1 && (
          <div>
            <div className="step-header">
              <h2>Step 1: Contact Information</h2>
              <p>Provide basic contact details so our team can follow up with you.</p>
            </div>

            <div className="options-grid two-col" style={{ gap: "1.25rem", marginBottom: "1.5rem" }}>
              <div className="form-field-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="fullName">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={`form-input${errors.fullName ? " has-error" : ""}`}
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="e.g. John Smith"
                />
                {errors.fullName && <div className="field-error-message">{errors.fullName}</div>}
              </div>

              <div className="form-field-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="phone">
                  Phone Number <span className="required-star">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={`form-input${errors.phone ? " has-error" : ""}`}
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(636) 555-0199"
                />
                {errors.phone && <div className="field-error-message">{errors.phone}</div>}
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Preferred Contact Method <span className="required-star">*</span>
              </label>
              <div className="options-grid two-col">
                {["Phone call", "Text message", "Email", "I do not currently have reliable phone or email access"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.contactMethod === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="contactMethod"
                      value={opt}
                      checked={formData.contactMethod === opt}
                      onChange={(e) => updateField("contactMethod", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.contactMethod && <div className="field-error-message">{errors.contactMethod}</div>}
            </div>

            <div className="options-grid two-col" style={{ gap: "1.25rem", marginBottom: "1.5rem" }}>
              <div className="form-field-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="cityCounty">
                  City and County <span className="required-star">*</span>
                </label>
                <input
                  id="cityCounty"
                  type="text"
                  className={`form-input${errors.cityCounty ? " has-error" : ""}`}
                  value={formData.cityCounty}
                  onChange={(e) => updateField("cityCounty", e.target.value)}
                  placeholder="e.g. Saint Peters, St. Charles County"
                />
                {errors.cityCounty && <div className="field-error-message">{errors.cityCounty}</div>}
              </div>

              <div className="form-field-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email">
                  Email Address <span className="form-help-text">(Optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input${errors.email ? " has-error" : ""}`}
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@example.com"
                />
                {errors.email && <div className="field-error-message">{errors.email}</div>}
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Is it okay for Faith Haven House to leave a voicemail or send a text message? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "Please discuss with me first"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.canContactMessage === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="canContactMessage"
                      value={opt}
                      checked={formData.canContactMessage === opt}
                      onChange={(e) => updateField("canContactMessage", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.canContactMessage && <div className="field-error-message">{errors.canContactMessage}</div>}
            </div>
          </div>
        )}

        {/* STEP 2: Current Situation */}
        {step === 2 && (
          <div>
            <div className="step-header">
              <h2>Step 2: Current Situation</h2>
              <p>Help us understand your current living environment and urgent needs.</p>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Which option best describes your current housing situation? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {[
                  "Staying with family or friends temporarily",
                  "Living in a shelter",
                  "Living in a vehicle",
                  "Staying in a hotel or temporary lodging",
                  "Renting but at immediate risk of losing housing",
                  "Living outdoors or in an unsafe location",
                  "Being discharged from another setting soon",
                  "Other"
                ].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.housingSituation === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="housingSituation"
                      value={opt}
                      checked={formData.housingSituation === opt}
                      onChange={(e) => updateField("housingSituation", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.housingSituation && <div className="field-error-message">{errors.housingSituation}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                How soon do you need housing support? <span className="required-star">*</span>
              </label>
              <div className="options-grid two-col">
                {[
                  "Today or within 24 hours",
                  "Within the next 7 days",
                  "Within the next 30 days",
                  "I am planning ahead",
                  "I am not sure"
                ].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.timeframe === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="timeframe"
                      value={opt}
                      checked={formData.timeframe === opt}
                      onChange={(e) => updateField("timeframe", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.timeframe && <div className="field-error-message">{errors.timeframe}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                How did you hear about Faith Haven House? <span className="required-star">*</span>
              </label>
              <div className="options-grid two-col">
                {[
                  "Church or faith community",
                  "Friend or family member",
                  "Case manager or social worker",
                  "Hospital, treatment, or recovery program",
                  "Community organization",
                  "Online search or social media",
                  "Other"
                ].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.referralSource === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="referralSource"
                      value={opt}
                      checked={formData.referralSource === opt}
                      onChange={(e) => updateField("referralSource", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.referralSource && <div className="field-error-message">{errors.referralSource}</div>}
            </div>
          </div>
        )}

        {/* STEP 3: Support Goals */}
        {step === 3 && (
          <div>
            <div className="step-header">
              <h2>Step 3: Support Goals</h2>
              <p>Identify what resources and assistance you hope to access.</p>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                What are you hoping Faith Haven House can help you accomplish? <span className="required-star">*</span>
                <span className="form-help-text" style={{ display: "block" }}>Select all that apply.</span>
              </label>
              <div className="options-grid two-col">
                {[
                  "Safe, stable housing",
                  "Employment or job-search support",
                  "Getting identification or important documents",
                  "Budgeting, credit, or financial literacy",
                  "Transportation planning",
                  "Life coaching or mentorship",
                  "Bible study or spiritual support",
                  "Connection to community resources",
                  "Creating a plan for long-term housing",
                  "Other"
                ].map((goal) => {
                  const isChecked = (formData.supportGoals || []).includes(goal);
                  return (
                    <label key={goal} className={`option-card-label${isChecked ? " selected" : ""}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGoal(goal)}
                      />
                      <span className="option-card-text">{goal}</span>
                    </label>
                  );
                })}
              </div>
              {errors.supportGoals && <div className="field-error-message">{errors.supportGoals}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="biggestChallenge">
                What is the biggest challenge you are facing right now? <span className="required-star">*</span>
              </label>
              <textarea
                id="biggestChallenge"
                rows={3}
                className={`form-textarea${errors.biggestChallenge ? " has-error" : ""}`}
                value={formData.biggestChallenge}
                onChange={(e) => updateField("biggestChallenge", e.target.value)}
                placeholder="Briefly describe your main challenge..."
              />
              {errors.biggestChallenge && <div className="field-error-message">{errors.biggestChallenge}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="futureGoals">
                What would you like your situation to look like over the next 6 to 12 months? <span className="form-help-text">(Optional)</span>
              </label>
              <textarea
                id="futureGoals"
                rows={3}
                className="form-textarea"
                value={formData.futureGoals}
                onChange={(e) => updateField("futureGoals", e.target.value)}
                placeholder="Share your goals or vision..."
              />
            </div>
          </div>
        )}

        {/* STEP 4: Program Readiness */}
        {step === 4 && (
          <div>
            <div className="step-header">
              <h2>Step 4: Program Readiness</h2>
              <p className="form-help-text" style={{ fontSize: "1rem", color: "#294C60", fontWeight: 600 }}>
                Faith Haven House is designed to be a structured environment built around stability, accountability, personal growth, and forward movement.
              </p>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Are you willing to participate in a structured program that may include house rules, regular check-ins, life coaching, goal setting, financial literacy, and community responsibilities? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I would like to learn more before answering"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.willingStructured === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="willingStructured"
                      value={opt}
                      checked={formData.willingStructured === opt}
                      onChange={(e) => updateField("willingStructured", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.willingStructured && <div className="field-error-message">{errors.willingStructured}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Are you willing to work with staff on a personal roadmap toward stability, employment, housing readiness, and long-term independence? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I would like to discuss this"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.willingRoadmap === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="willingRoadmap"
                      value={opt}
                      checked={formData.willingRoadmap === opt}
                      onChange={(e) => updateField("willingRoadmap", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.willingRoadmap && <div className="field-error-message">{errors.willingRoadmap}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Are you willing to follow Faith Haven House program rules regarding a safe, substance-free living environment and any testing or referral process described in the program policy? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I would like to discuss this privately"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.willingSubstanceFree === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="willingSubstanceFree"
                      value={opt}
                      checked={formData.willingSubstanceFree === opt}
                      onChange={(e) => updateField("willingSubstanceFree", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.willingSubstanceFree && <div className="field-error-message">{errors.willingSubstanceFree}</div>}
            </div>
          </div>
        )}

        {/* STEP 5: Practical Readiness */}
        {step === 5 && (
          <div>
            <div className="step-header">
              <h2>Step 5: Practical Readiness</h2>
              <p>Tell us about your current documentation, income, and transportation status.</p>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Are you currently employed? <span className="required-star">*</span>
              </label>
              <div className="options-grid two-col">
                {["Full-time", "Part-time", "Self-employed", "Not currently employed", "Other"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.employmentStatus === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="employmentStatus"
                      value={opt}
                      checked={formData.employmentStatus === opt}
                      onChange={(e) => updateField("employmentStatus", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.employmentStatus && <div className="field-error-message">{errors.employmentStatus}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Do you currently have any source of income? <span className="required-star">*</span>
              </label>
              <div className="options-grid two-col">
                {["Employment income", "Benefits or assistance", "Family or community support", "No current income", "Prefer to discuss privately"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.incomeSource === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="incomeSource"
                      value={opt}
                      checked={formData.incomeSource === opt}
                      onChange={(e) => updateField("incomeSource", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.incomeSource && <div className="field-error-message">{errors.incomeSource}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Do you currently have a government-issued photo ID? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I am working on getting one"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.hasPhotoId === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="hasPhotoId"
                      value={opt}
                      checked={formData.hasPhotoId === opt}
                      onChange={(e) => updateField("hasPhotoId", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.hasPhotoId && <div className="field-error-message">{errors.hasPhotoId}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Do you currently have the documents needed for employment, such as a Social Security card or other work-eligibility documentation? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I am working on getting them", "I am not sure"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.hasWorkDocs === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="hasWorkDocs"
                      value={opt}
                      checked={formData.hasWorkDocs === opt}
                      onChange={(e) => updateField("hasWorkDocs", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.hasWorkDocs && <div className="field-error-message">{errors.hasWorkDocs}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Do you have reliable transportation for work, appointments, or program activities? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I need support with transportation", "I am not sure"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.transportationStatus === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="transportationStatus"
                      value={opt}
                      checked={formData.transportationStatus === opt}
                      onChange={(e) => updateField("transportationStatus", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.transportationStatus && <div className="field-error-message">{errors.transportationStatus}</div>}
            </div>
          </div>
        )}

        {/* STEP 6: Safety & Follow-Up */}
        {step === 6 && (
          <div>
            <div className="step-header">
              <h2>Step 6: Safety &amp; Follow-Up</h2>
              <p>Safety, crisis support resources, and coordination permissions.</p>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Do you need immediate emergency, crisis, detox, or medical support today? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I am not sure"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.immediateCrisis === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="immediateCrisis"
                      value={opt}
                      checked={formData.immediateCrisis === opt}
                      onChange={(e) => updateField("immediateCrisis", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.immediateCrisis && <div className="field-error-message">{errors.immediateCrisis}</div>}
            </div>

            {/* Conditional field for emergency / crisis */}
            {(formData.immediateCrisis === "Yes" || formData.immediateCrisis === "I am not sure") && (
              <div className="form-field-group" style={{ backgroundColor: "rgba(200, 107, 74, 0.08)", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #C86B4A" }}>
                <div style={{ color: "#C86B4A", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                  🚨 Emergency Assistance Note:
                </div>
                <p style={{ fontSize: "0.9rem", color: "#222222", marginBottom: "0.85rem", lineHeight: 1.4 }}>
                  If you are in immediate danger or experiencing a medical emergency, call 911 or seek emergency assistance right away.
                </p>
                <label className="form-label" htmlFor="safeContactDetails" style={{ fontSize: "0.95rem" }}>
                  Please tell us the safest way to contact you or connect you with an appropriate resource. <span className="form-help-text" style={{ display: "block" }}>Do not include medical diagnoses or detailed health information here.</span>
                </label>
                <textarea
                  id="safeContactDetails"
                  rows={2}
                  className="form-textarea"
                  value={formData.safeContactDetails}
                  onChange={(e) => updateField("safeContactDetails", e.target.value)}
                  placeholder="Safest contact method or resource notes..."
                />
              </div>
            )}

            <div className="form-field-group">
              <label className="form-label">
                Are you currently working with a case manager, church leader, hospital, treatment program, veteran service, or another support organization? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I am not sure"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.workingWithOrg === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="workingWithOrg"
                      value={opt}
                      checked={formData.workingWithOrg === opt}
                      onChange={(e) => updateField("workingWithOrg", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.workingWithOrg && <div className="field-error-message">{errors.workingWithOrg}</div>}
            </div>

            {formData.workingWithOrg === "Yes" && (
              <div className="form-field-group" style={{ paddingLeft: "1rem", borderLeft: "3px solid #294C60" }}>
                <label className="form-label">
                  May we contact that person or organization after speaking with you first? <span className="required-star">*</span>
                </label>
                <div className="options-grid">
                  {["Yes", "No", "Not applicable"].map((opt) => (
                    <label key={opt} className={`option-card-label${formData.permissionContactOrg === opt ? " selected" : ""}`}>
                      <input
                        type="radio"
                        name="permissionContactOrg"
                        value={opt}
                        checked={formData.permissionContactOrg === opt}
                        onChange={(e) => updateField("permissionContactOrg", e.target.value)}
                      />
                      <span className="option-card-text">{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.permissionContactOrg && <div className="field-error-message">{errors.permissionContactOrg}</div>}
              </div>
            )}

            <div className="form-field-group">
              <label className="form-label">
                Do you need a reasonable accommodation to complete the application, participate in an interview, or communicate with Faith Haven House? <span className="required-star">*</span>
              </label>
              <div className="options-grid">
                {["Yes", "No", "I would prefer to discuss this privately"].map((opt) => (
                  <label key={opt} className={`option-card-label${formData.needsAccommodation === opt ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="needsAccommodation"
                      value={opt}
                      checked={formData.needsAccommodation === opt}
                      onChange={(e) => updateField("needsAccommodation", e.target.value)}
                    />
                    <span className="option-card-text">{opt}</span>
                  </label>
                ))}
              </div>
              {errors.needsAccommodation && <div className="field-error-message">{errors.needsAccommodation}</div>}
            </div>

            <div className="form-field-group">
              <label className="form-label" htmlFor="additionalNotes">
                Is there anything else you would like the Faith Haven House team to know before contacting you? <span className="form-help-text">(Optional)</span>
              </label>
              <textarea
                id="additionalNotes"
                rows={3}
                className="form-textarea"
                value={formData.additionalNotes}
                onChange={(e) => updateField("additionalNotes", e.target.value)}
                placeholder="Any additional thoughts or questions..."
              />
            </div>
          </div>
        )}

        {/* STEP 7: Review & Submit */}
        {step === 7 && (
          <ReviewSubmission
            formData={formData}
            setStep={setStep}
            acks={acks}
            setAcks={setAcks}
            ackErrors={ackError}
          />
        )}

        {/* Bottom Navigation Actions */}
        <div className="step-actions">
          {step > 1 ? (
            <button type="button" className="btn-back" onClick={handlePrev}>
              ← Back
            </button>
          ) : <div />}

          {step < 7 ? (
            <button type="button" className="btn-continue" onClick={handleNext}>
              Continue →
            </button>
          ) : (
            <button type="submit" className="btn-submit-form" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Initial Interest Form"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
