export default function PrivacyNotice() {
  return (
    <div className="prescreen-privacy-callout" role="region" aria-label="Privacy Warning">
      <div className="prescreen-privacy-icon" aria-hidden="true">🔒</div>
      <div className="prescreen-privacy-content">
        <h4>Important Privacy Notice</h4>
        <p>
          Please do not include your Social Security number, medical diagnosis, medication details, or other highly sensitive information in this form.
        </p>
      </div>
    </div>
  );
}
