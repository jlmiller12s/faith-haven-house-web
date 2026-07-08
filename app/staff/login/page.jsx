"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const BRAND = {
  background: "#173247",
  card: "#FAF8EF",
  cardBorder: "#5E7890",
  navy: "#294C60",
  cream: "#EDE8D0",
  charcoal: "#222222",
  steel: "#5E7890",
  ivory: "#FAF8EF",
  errorBg: "#FFF1F0",
  errorBorder: "#C0392B",
  infoBg: "#EAF4FB",
  infoBorder: "#294C60",
  successBg: "#F0FFF4",
  successBorder: "#27AE60",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const confirmed = searchParams.get("confirmed");
    const signedout = searchParams.get("signedout");
    const errParam = searchParams.get("error");
    const infoParam = searchParams.get("info");

    if (confirmed === "1") {
      setInfo("Your email has been confirmed. Please sign in to continue.");
    } else if (signedout === "1") {
      setInfo("You have been signed out.");
    } else if (errParam === "confirmation_failed") {
      setError(
        "We could not confirm that email link. Please request a new one or contact an administrator."
      );
    } else if (infoParam === "invite_only") {
      setInfo(
        "Staff access is by invitation only. Please contact your RAP Portal administrator."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      // 1. Sign in
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        // Generic error — do not reveal whether email exists
        setError(
          "We could not sign you in with those credentials. Please check your email and password."
        );
        setSubmitting(false);
        return;
      }

      const user = data?.user;
      if (!user) {
        setError("Sign in failed. Please try again.");
        setSubmitting(false);
        return;
      }

      // 2. Check email confirmation
      if (!user.email_confirmed_at) {
        await supabase.auth.signOut();
        setError(
          "Please confirm your email before accessing the RAP Portal. Check your inbox for a confirmation link."
        );
        setSubmitting(false);
        return;
      }

      // 3. Check active staff profile
      const { data: profile, error: profileError } = await supabase
        .from("staff_profiles")
        .select("id, is_active, mfa_required, role")
        .eq("auth_user_id", user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError(
          "Your account is not authorized for RAP Portal access. Please contact an administrator."
        );
        setSubmitting(false);
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setError(
          "Your account is not authorized for RAP Portal access. Please contact an administrator."
        );
        setSubmitting(false);
        return;
      }

      // 4. MFA check — middleware will also enforce, but pre-check here for UX
      if (profile.mfa_required) {
        const { data: aalData } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalData?.currentLevel !== "aal2") {
          const { data: factorData } = await supabase.auth.mfa.listFactors();
          const hasVerified = factorData?.totp?.some(
            (f) => f.status === "verified"
          );
          router.push(hasVerified ? "/staff/mfa/verify" : "/staff/mfa/setup");
          return;
        }
      }

      // 5. All clear — go to dashboard
      router.push("/staff");
      router.refresh();
    } catch (err) {
      setError(err?.message || "A connection error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: BRAND.background,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Card */}
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
        {/* Logo + Brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Image
              src="/assets/fhh-logo-standalone-icon.png"
              alt="Faith Haven House"
              width={64}
              height={64}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: BRAND.navy,
              margin: "0 0 0.25rem",
              fontFamily: "Lora, Georgia, serif",
              letterSpacing: "-0.01em",
            }}
          >
            Faith Haven House
          </h1>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "700",
              color: BRAND.navy,
              margin: "0 0 0.15rem",
              letterSpacing: "0.01em",
            }}
          >
            RAP Portal
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              color: BRAND.steel,
              fontWeight: "500",
            }}
          >
            Resident Admissions Portal
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: BRAND.steel,
              marginTop: "0.15rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: "600",
            }}
          >
            Staff Access Only
          </div>
        </div>

        {/* Status messages */}
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
              lineHeight: "1.5",
            }}
          >
            {error}
          </div>
        )}

        {info && (
          <div
            role="status"
            style={{
              backgroundColor: BRAND.infoBg,
              border: `1px solid ${BRAND.infoBorder}`,
              borderRadius: "6px",
              padding: "0.85rem 1rem",
              fontSize: "0.875rem",
              color: BRAND.navy,
              marginBottom: "1.5rem",
              lineHeight: "1.5",
            }}
          >
            {info}
          </div>
        )}

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label
              htmlFor="rap-email"
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
              id="rap-email"
              type="email"
              required
              autoComplete="email"
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
              onFocus={(e) =>
                (e.target.style.borderColor = BRAND.navy)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = BRAND.cardBorder)
              }
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.4rem",
              }}
            >
              <label
                htmlFor="rap-password"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: BRAND.navy,
                }}
              >
                Password
              </label>
              <Link
                href="/staff/forgot-password"
                style={{
                  fontSize: "0.8rem",
                  color: BRAND.steel,
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="rap-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
              onFocus={(e) =>
                (e.target.style.borderColor = BRAND.navy)
              }
              onBlur={(e) =>
                (e.target.style.borderColor = BRAND.cardBorder)
              }
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
              transition: "background-color 0.2s",
              marginTop: "0.25rem",
            }}
          >
            {submitting ? "Signing in…" : "Sign In Securely"}
          </button>
        </form>

        {/* Access request */}
        <div
          style={{
            textAlign: "center",
            marginTop: "1.75rem",
            paddingTop: "1.25rem",
            borderTop: `1px solid ${BRAND.cream}`,
          }}
        >
          <p
            style={{
              fontSize: "0.82rem",
              color: BRAND.steel,
              margin: "0 0 0.35rem",
            }}
          >
            Need access? Contact your RAP Portal administrator.
          </p>
          <Link
            href="/contact"
            style={{
              fontSize: "0.82rem",
              color: BRAND.navy,
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Request Access →
          </Link>
        </div>

        {/* Security notice */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.72rem",
            color: BRAND.steel,
            marginTop: "1.5rem",
            lineHeight: "1.5",
            opacity: 0.8,
          }}
        >
          Authorized staff access only. Activity may be logged to protect
          resident and admissions information.
        </p>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
