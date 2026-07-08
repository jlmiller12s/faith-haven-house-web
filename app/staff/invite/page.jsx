"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const BRAND = {
  background: "#173247",
  card: "#FAF8EF",
  cardBorder: "#5E7890",
  navy: "#294C60",
  cream: "#EDE8D0",
  steel: "#5E7890",
  ivory: "#FAF8EF",
  charcoal: "#222222",
  errorBg: "#FFF1F0",
  errorBorder: "#C0392B",
  successBg: "#F0FFF4",
  successBorder: "#27AE60",
};

const ROLE_OPTIONS = [
  { value: "admissions_coordinator", label: "Admissions Coordinator" },
  { value: "admissions_interviewer", label: "Admissions Interviewer" },
  { value: "behavioral_health_clinician", label: "Behavioral Health Clinician" },
  { value: "admissions_committee_member", label: "Admissions Committee Member" },
  { value: "case_manager", label: "Case Manager" },
  { value: "read_only_auditor", label: "Read-Only Auditor" },
  { value: "executive_director", label: "Executive Director" },
  { value: "super_admin", label: "Super Admin" },
];

export default function StaffInvitePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "admissions_coordinator",
    note: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Client-side role guard — middleware and API route enforce server-side
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Invitation failed. Please try again.");
      } else {
        setSuccess(
          `Invitation sent to ${form.email}. They will receive an email to confirm and set their password.`
        );
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          role: "admissions_coordinator",
          note: "",
        });
      }
    } catch {
      setError("A network error occurred. Please try again.");
    }

    setSubmitting(false);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    border: `1px solid ${BRAND.cardBorder}`,
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
    color: BRAND.charcoal,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: BRAND.navy,
    marginBottom: "0.4rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BRAND.background,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: BRAND.card,
          border: `1px solid ${BRAND.cardBorder}`,
          borderRadius: "12px",
          padding: "3rem 2.5rem",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(23,50,71,0.18)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Image
            src="/assets/fhh-logo-standalone-icon.png"
            alt="Faith Haven House"
            width={52}
            height={52}
            style={{ objectFit: "contain", marginBottom: "1rem" }}
          />
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: "700",
              color: BRAND.navy,
              margin: "0 0 0.25rem",
              fontFamily: "Lora, Georgia, serif",
            }}
          >
            Invite Staff Member
          </h1>
          <p style={{ fontSize: "0.875rem", color: BRAND.steel, margin: 0 }}>
            RAP Portal · Super Admin Only
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#EAF4FB",
            border: "1px solid #294C60",
            borderRadius: "8px",
            padding: "0.85rem 1rem",
            marginBottom: "1.75rem",
            fontSize: "0.82rem",
            color: BRAND.navy,
            lineHeight: "1.6",
          }}
        >
          The invited user will receive an email to confirm their account and
          set their password. MFA setup will be required on first sign-in.
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: BRAND.errorBg,
              border: `1px solid ${BRAND.errorBorder}`,
              borderRadius: "6px",
              padding: "0.85rem 1rem",
              fontSize: "0.875rem",
              color: "#7B2D00",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              backgroundColor: BRAND.successBg,
              border: `1px solid ${BRAND.successBorder}`,
              borderRadius: "6px",
              padding: "0.85rem 1rem",
              fontSize: "0.875rem",
              color: "#1A5C38",
              marginBottom: "1.5rem",
              lineHeight: "1.6",
            }}
          >
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            <div>
              <label htmlFor="invite-first" style={labelStyle}>
                First Name
              </label>
              <input
                id="invite-first"
                type="text"
                required
                placeholder="Sarah"
                style={inputStyle}
                {...field("firstName")}
              />
            </div>
            <div>
              <label htmlFor="invite-last" style={labelStyle}>
                Last Name
              </label>
              <input
                id="invite-last"
                type="text"
                required
                placeholder="Jenkins"
                style={inputStyle}
                {...field("lastName")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="invite-email" style={labelStyle}>
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              required
              placeholder="name@faithhavenhouse.org"
              style={inputStyle}
              {...field("email")}
            />
          </div>

          <div>
            <label htmlFor="invite-role" style={labelStyle}>
              Permission Role
            </label>
            <select
              id="invite-role"
              required
              style={{ ...inputStyle, cursor: "pointer" }}
              {...field("role")}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="invite-note" style={labelStyle}>
              Optional Note{" "}
              <span style={{ fontWeight: "400", color: BRAND.steel }}>
                (internal only)
              </span>
            </label>
            <textarea
              id="invite-note"
              rows={3}
              placeholder="Context for this invitation…"
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: "1.5",
              }}
              {...field("note")}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "0.9rem",
              backgroundColor: submitting ? BRAND.steel : BRAND.navy,
              color: BRAND.ivory,
              border: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
            }}
          >
            {submitting ? "Sending Invitation…" : "Send Staff Invitation"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a
            href="/staff"
            style={{
              fontSize: "0.85rem",
              color: BRAND.steel,
              textDecoration: "none",
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
