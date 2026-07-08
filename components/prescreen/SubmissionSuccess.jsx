import Link from "next/link";

export default function SubmissionSuccess({ caseNumber, emailSent, emailProvided }) {
  return (
    <div className="success-card" role="alert" aria-live="polite">
      <div className="success-icon-wrapper" aria-hidden="true">
        ✓
      </div>
      <h2>Thank You — We Received Your Information</h2>
      <p className="success-body">
        A Faith Haven House team member will review your submission and follow up using your preferred contact method. Submitting this form does not guarantee placement, but it helps us understand the best next step and available support options.
      </p>
      <div style={{
        background: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: "0.5rem",
        padding: "1rem 1.25rem",
        margin: "1.25rem auto",
        maxWidth: "28rem",
      }}>
        <span style={{ display: "block", fontSize: "0.8rem", color: "var(--color-steel)", fontWeight: 700 }}>
          YOUR REFERENCE NUMBER
        </span>
        <strong style={{ fontFamily: "var(--font-mono)", fontSize: "1.15rem" }}>
          {caseNumber}
        </strong>
      </div>
      {emailProvided && (
        <p className="success-body" style={{ fontSize: "0.95rem" }}>
          {emailSent
            ? "A confirmation email has been sent. Please check your inbox and spam folder."
            : "Your admission was saved, but the confirmation email is delayed. Please keep the reference number above."}
        </p>
      )}
      <Link href="/" className="btn btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
        Return to Home
      </Link>
    </div>
  );
}
