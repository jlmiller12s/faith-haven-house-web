"use client";

import Link from "next/link";
import Image from "next/image";

const BRAND = {
  background: "#173247",
  card: "#FAF8EF",
  cardBorder: "#5E7890",
  navy: "#294C60",
  cream: "#EDE8D0",
  charcoal: "#222222",
  steel: "#5E7890",
  ivory: "#FAF8EF",
};

/**
 * Staff Signup — Invite Only
 *
 * The RAP Portal does not support self-registration.
 * New staff accounts are created by a super_admin via /staff/invite.
 */
export default function StaffSignupPage() {
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
      <div
        style={{
          backgroundColor: BRAND.card,
          border: `1px solid ${BRAND.cardBorder}`,
          borderRadius: "12px",
          padding: "3rem 2.5rem",
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(23,50,71,0.18)",
        }}
      >
        <div style={{ marginBottom: "1.25rem" }}>
          <Image
            src="/assets/fhh-logo-standalone-icon.png"
            alt="Faith Haven House"
            width={56}
            height={56}
            style={{ objectFit: "contain" }}
          />
        </div>

        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: BRAND.navy,
            margin: "0 0 0.5rem",
            fontFamily: "Lora, Georgia, serif",
          }}
        >
          RAP Portal Access
        </h1>
        <div
          style={{
            fontSize: "0.78rem",
            color: BRAND.steel,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: "600",
            marginBottom: "1.75rem",
          }}
        >
          Staff Access Only — Invite Required
        </div>

        <div
          style={{
            backgroundColor: "#EAF4FB",
            border: "1px solid #294C60",
            borderRadius: "8px",
            padding: "1.25rem",
            marginBottom: "2rem",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "0.9rem",
              color: BRAND.navy,
              margin: 0,
              lineHeight: "1.6",
              fontWeight: "500",
            }}
          >
            Staff access is by invitation only. New accounts are created by a
            RAP Portal administrator.
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: BRAND.steel,
              margin: "0.75rem 0 0",
              lineHeight: "1.5",
            }}
          >
            If you should have access, please contact the administrator or the
            Faith Haven House office.
          </p>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <Link
            href="/contact"
            style={{
              display: "block",
              padding: "0.85rem",
              backgroundColor: BRAND.navy,
              color: BRAND.ivory,
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "0.9rem",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            Contact Administrator
          </Link>
          <Link
            href="/staff/login"
            style={{
              display: "block",
              padding: "0.85rem",
              backgroundColor: "transparent",
              color: BRAND.navy,
              border: `1px solid ${BRAND.cardBorder}`,
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
