"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  errorBg: "#FFF1F0",
  errorBorder: "#C0392B",
};

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase handles the token via the URL hash (#access_token=...)
    // The browser client automatically picks this up on mount.
    const supabase = createRapSupabaseBrowser();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createRapSupabaseBrowser();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError("We could not update your password. Please request a new reset link.");
        setSubmitting(false);
        return;
      }

      // Sign out of all other sessions
      await supabase.auth.signOut({ scope: "others" });
      router.push("/staff/login?reset=1");
    } catch {
      setError("A connection error occurred. Please try again.");
      setSubmitting(false);
    }
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
            Update Password
          </h1>
          <p style={{ fontSize: "0.875rem", color: BRAND.steel, margin: 0 }}>
            RAP Portal · Resident Admissions Portal
          </p>
        </div>

        {!sessionReady ? (
          <div
            style={{
              backgroundColor: "#EAF4FB",
              border: "1px solid #294C60",
              borderRadius: "8px",
              padding: "1.25rem",
              fontSize: "0.9rem",
              color: BRAND.navy,
              textAlign: "center",
              lineHeight: "1.6",
            }}
          >
            <p style={{ margin: "0 0 1rem" }}>
              Waiting for your reset session to initialize…
            </p>
            <p style={{ margin: 0, fontSize: "0.82rem", color: BRAND.steel }}>
              If this page does not load, please request a new reset link.
            </p>
            <div style={{ marginTop: "1rem" }}>
              <Link
                href="/staff/forgot-password"
                style={{ color: BRAND.navy, fontWeight: "600", textDecoration: "none" }}
              >
                Request New Link
              </Link>
            </div>
          </div>
        ) : (
          <>
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

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <div>
                <label
                  htmlFor="new-password"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: BRAND.navy,
                    marginBottom: "0.4rem",
                  }}
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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

              <div>
                <label
                  htmlFor="confirm-password"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: BRAND.navy,
                    marginBottom: "0.4rem",
                  }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
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
                {submitting ? "Updating…" : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
