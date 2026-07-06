import Link from "next/link";

export default function SubmissionSuccess() {
  return (
    <div className="success-card" role="alert" aria-live="polite">
      <div className="success-icon-wrapper" aria-hidden="true">
        ✓
      </div>
      <h2>Thank You — We Received Your Information</h2>
      <p className="success-body">
        A Faith Haven House team member will review your submission and follow up using your preferred contact method. Submitting this form does not guarantee placement, but it helps us understand the best next step and available support options.
      </p>
      <Link href="/" className="btn btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
        Return to Home
      </Link>
    </div>
  );
}
