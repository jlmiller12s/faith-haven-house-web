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

export default function MfaSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState("loading"); // loading | enroll | verify | success
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function startEnrollment() {
      const supabase = createSupabaseBrowserClient();

      // Check if already enrolled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = factors?.totp?.find((f) => f.status === "verified");
      if (verified) {
        // Already set up — go to verify
        router.push("/staff/mfa/verify");
        return;
      }

      // Enroll a new TOTP factor
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Faith Haven House RAP Portal",
      });

      if (enrollError || !data) {
        setError("Failed to initialize MFA setup. Please refresh and try again.");
        setStep("error");
        return;
      }

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStep("enroll");
    }

    startEnrollment();
  }, [router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // Create challenge
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) {
        setError("We could not verify that code. Please try again.");
        setSubmitting(false);
        return;
      }

      // Verify the TOTP code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.replace(/\s/g, ""),
      });

      if (verifyError) {
        setError("We could not verify that code. Please try again.");
        setSubmitting(false);
        return;
      }

      setStep("success");
      setTimeout(() => router.push("/staff"), 1500);
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
          maxWidth: "480px",
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
            Set Up Multi-Factor Authentication
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: BRAND.steel,
              margin: 0,
              lineHeight: "1.6",
            }}
          >
            To protect resident and admissions information, staff accounts must
            use multi-factor authentication before accessing the RAP Portal.
          </p>
        </div>

        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "2rem", color: BRAND.steel }}>
            Initializing MFA setup…
          </div>
        )}

        {step === "error" && (
          <div
            style={{
              backgroundColor: BRAND.errorBg,
              border: `1px solid ${BRAND.errorBorder}`,
              borderRadius: "8px",
              padding: "1.25rem",
              color: "#7B2D00",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {step === "enroll" && (
          <>
            {/* Step 1: Scan QR */}
            <div
              style={{
                backgroundColor: "#EAF4FB",
                border: "1px solid #294C60",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                color: BRAND.navy,
                lineHeight: "1.6",
              }}
            >
              <strong>Step 1:</strong> Open your authenticator app (Google
              Authenticator, Authy, 1Password, etc.) and scan the QR code below.
            </div>

            {qrCode && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                }}
              >
                {/* QR code is a data URI SVG from Supabase */}
                <div
                  style={{
                    display: "inline-block",
                    padding: "1rem",
                    backgroundColor: "#FFFFFF",
                    border: `1px solid ${BRAND.cardBorder}`,
                    borderRadius: "8px",
                  }}
                  dangerouslySetInnerHTML={{ __html: qrCode }}
                />
              </div>
            )}

            {/* Manual secret fallback */}
            <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                style={{
                  background: "none",
                  border: "none",
                  color: BRAND.steel,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: "inherit",
                }}
              >
                {showSecret ? "Hide manual setup key" : "Can't scan? Show setup key"}
              </button>
              {showSecret && secret && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#F5F5F5",
                    borderRadius: "6px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.85rem",
                    color: BRAND.charcoal,
                    letterSpacing: "0.1em",
                    wordBreak: "break-all",
                  }}
                >
                  {secret}
                </div>
              )}
            </div>

            {/* Step 2: Enter code */}
            <div
              style={{
                backgroundColor: "#EAF4FB",
                border: "1px solid #294C60",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
                color: BRAND.navy,
                lineHeight: "1.6",
              }}
            >
              <strong>Step 2:</strong> Enter the 6-digit code from your
              authenticator app to complete setup.
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
                  marginBottom: "1rem",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  htmlFor="mfa-setup-code"
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
                  id="mfa-setup-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9 ]*"
                  maxLength={7}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123 456"
                  autoComplete="one-time-code"
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
                {submitting ? "Verifying…" : "Activate MFA"}
              </button>
            </form>
          </>
        )}

        {step === "success" && (
          <div
            role="status"
            style={{
              backgroundColor: "#F0FFF4",
              border: "1px solid #27AE60",
              borderRadius: "8px",
              padding: "1.5rem",
              textAlign: "center",
              color: "#1A5C38",
              fontSize: "0.95rem",
              fontWeight: "600",
              lineHeight: "1.6",
            }}
          >
            ✓ Multi-factor authentication is active.
            <br />
            <span style={{ fontSize: "0.85rem", fontWeight: "400" }}>
              Redirecting to the RAP Portal…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
