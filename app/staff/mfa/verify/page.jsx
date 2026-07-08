"use client";

import { useState, useEffect } from "react";
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
};

export default function MfaVerifyPage() {
  const router = useRouter();
  const [factors, setFactors] = useState([]);
  const [selectedFactorId, setSelectedFactorId] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFactors() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.filter((f) => f.status === "verified") || [];
      setFactors(verified);
      if (verified.length > 0) setSelectedFactorId(verified[0].id);
      setLoading(false);
    }
    loadFactors();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Create challenge for selected factor
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: selectedFactorId });

      if (challengeError) {
        setError("We could not verify that code. Please try again.");
        setSubmitting(false);
        return;
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: selectedFactorId,
        challengeId: challenge.id,
        code: code.replace(/\s/g, ""),
      });

      if (verifyError) {
        setError("We could not verify that code. Please try again.");
        setCode("");
        setSubmitting(false);
        return;
      }

      // Confirm AAL2 reached
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel === "aal2") {
        router.push("/staff");
        router.refresh();
      } else {
        setError("We could not verify that code. Please try again.");
        setSubmitting(false);
      }
    } catch {
      setError("We could not verify that code. Please try again.");
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
              margin: "0 0 0.5rem",
              fontFamily: "Lora, Georgia, serif",
            }}
          >
            Verify Your Identity
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: BRAND.steel,
              margin: 0,
              lineHeight: "1.6",
            }}
          >
            Enter the 6-digit code from your authenticator app to continue to
            the RAP Portal.
          </p>
        </div>

        {loading ? (
          <div
            style={{ textAlign: "center", padding: "2rem", color: BRAND.steel }}
          >
            Loading…
          </div>
        ) : factors.length === 0 ? (
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
            No authenticator app is linked to your account. Please complete MFA
            setup first.
            <div style={{ marginTop: "1rem" }}>
              <a
                href="/staff/mfa/setup"
                style={{
                  color: BRAND.navy,
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                Go to MFA Setup →
              </a>
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
              onSubmit={handleVerify}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <div>
                <label
                  htmlFor="mfa-verify-code"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: BRAND.navy,
                    marginBottom: "0.4rem",
                  }}
                >
                  6-Digit Code
                </label>
                <input
                  id="mfa-verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123 456"
                  autoComplete="one-time-code"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    fontSize: "1.5rem",
                    letterSpacing: "0.25em",
                    textAlign: "center",
                    border: `1px solid ${BRAND.cardBorder}`,
                    borderRadius: "6px",
                    backgroundColor: "#FFFFFF",
                    color: BRAND.navy,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: "700",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || code.replace(/\s/g, "").length < 6}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  backgroundColor:
                    submitting || code.replace(/\s/g, "").length < 6
                      ? BRAND.steel
                      : BRAND.navy,
                  color: BRAND.ivory,
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  cursor:
                    submitting || code.replace(/\s/g, "").length < 6
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.02em",
                }}
              >
                {submitting ? "Verifying…" : "Verify and Continue"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <a
                href="/staff/logout"
                style={{
                  fontSize: "0.82rem",
                  color: BRAND.steel,
                  textDecoration: "none",
                }}
              >
                Sign out and use a different account
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
