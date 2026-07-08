"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createRapSupabaseBrowser } from "@/lib/supabase-browser";

const BRAND = {
  background: "#173247",
  card: "#FAF8EF",
  cardBorder: "#5E7890",
  navy: "#294C60",
  cream: "#EDE8D0",
  steel: "#5E7890",
  ivory: "#FAF8EF",
  charcoal: "#222222",
};

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createRapSupabaseBrowser();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://faith-haven-house-web.vercel.app";

      // Fire and forget — do NOT reveal whether the email exists
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${siteUrl}/staff/reset-password`,
      });
    } catch {
      // Silently ignore — same UX whether success or failure
    }

    // Always show the same success message regardless of outcome
    setSubmitted(true);
    setSubmitting(false);
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
          maxWidth: "440px",
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
            Reset Password
          </h1>
          <p style={{ fontSize: "0.875rem", color: BRAND.steel, margin: 0 }}>
            RAP Portal · Resident Admissions Portal
          </p>
        </div>

        {submitted ? (
          <div
            role="status"
            style={{
              backgroundColor: "#F0FFF4",
              border: "1px solid #27AE60",
              borderRadius: "8px",
              padding: "1.25rem",
              fontSize: "0.9rem",
              color: "#1A5C38",
              lineHeight: "1.6",
              textAlign: "center",
            }}
          >
            If a staff account exists for that email, a reset link has been
            sent. Please check your inbox.
            <div style={{ marginTop: "1.25rem" }}>
              <Link
                href="/staff/login"
                style={{
                  color: BRAND.navy,
                  fontWeight: "700",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p
              style={{
                fontSize: "0.875rem",
                color: BRAND.steel,
                lineHeight: "1.6",
                marginBottom: "1.75rem",
              }}
            >
              Enter your staff email address and we'll send a reset link if an
              account exists for that address.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <div>
                <label
                  htmlFor="reset-email"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: BRAND.navy,
                    marginBottom: "0.4rem",
                  }}
                >
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@faithhavenhouse.org"
                  style={{
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
                  }}
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
                {submitting ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link
                href="/staff/login"
                style={{
                  fontSize: "0.85rem",
                  color: BRAND.steel,
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                ← Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
