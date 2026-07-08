"use client";

import Link from "next/link";
import Image from "next/image";

const BRAND = {
  background: "#173247",
  card: "#FAF8EF",
  cardBorder: "#5E7890",
  navy: "#294C60",
  steel: "#5E7890",
  ivory: "#FAF8EF",
  charcoal: "#222222",
};

export default function UnauthorizedPage() {
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
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(23,50,71,0.18)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <Image
            src="/assets/fhh-logo-standalone-icon.png"
            alt="Faith Haven House"
            width={52}
            height={52}
            style={{ objectFit: "contain" }}
          />
        </div>

        <h1
          style={{
            fontSize: "1.35rem",
            fontWeight: "700",
            color: BRAND.navy,
            margin: "0 0 0.75rem",
            fontFamily: "Lora, Georgia, serif",
          }}
        >
          Access Not Authorized
        </h1>

        <div
          style={{
            backgroundColor: "#FFF8EC",
            border: "1px solid #D4A017",
            borderRadius: "8px",
            padding: "1.25rem",
            marginBottom: "2rem",
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "0.9rem",
              color: "#7A4F00",
              margin: 0,
              lineHeight: "1.6",
            }}
          >
            Your account is not authorized for RAP Portal access. Please
            contact an administrator.
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
          <a
            href="/staff/logout"
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
            Sign Out
          </a>
        </div>

        <p
          style={{
            fontSize: "0.72rem",
            color: BRAND.steel,
            marginTop: "1.5rem",
            lineHeight: "1.5",
            opacity: 0.8,
          }}
        >
          Authorized staff access only. Activity may be logged.
        </p>
      </div>
    </div>
  );
}
