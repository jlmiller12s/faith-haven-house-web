"use client";

import { useState } from "react";
import { useStaffSession } from "../layout";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();
  const { profiles, setActiveStaff, isMockMode } = useStaffSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Simulate login via profiles list matching email
    const match = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (match) {
      setActiveStaff(match);
      localStorage.setItem("fhh_crm_active_staff_id", match.id);
      router.push("/staff");
    } else {
      setError("Invalid email address or unauthorized staff account. User enumeration checks are active.");
    }
  };

  const handleQuickLogin = (profile) => {
    setActiveStaff(profile);
    localStorage.setItem("fhh_crm_active_staff_id", profile.id);
    router.push("/staff");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--color-slate)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "440px",
        width: "100%",
        backgroundColor: "var(--color-ivory)",
        padding: "3rem",
        borderRadius: "12px",
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "0.5rem" }}>🏰</span>
          <h1 style={{ fontSize: "1.75rem", color: "var(--color-slate)", fontWeight: "700" }}>Faith Haven House</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-steel)" }}>Internal CRM Portal - Staff Access Only</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#FCE8E6",
            border: "1px solid #F5C2C1",
            color: "#A83232",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            marginBottom: "1.5rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@faithhavenhouse.org"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FFFFFF"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-charcoal)", marginBottom: "0.35rem" }}>
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FFFFFF"
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.85rem",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "0.5rem"
            }}
          >
            Sign In Securely
          </button>
        </form>

        {isMockMode && (
          <div style={{
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px dashed var(--color-border)"
          }}>
            <h3 style={{ fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-steel)", marginBottom: "0.75rem", letterSpacing: "0.02em" }}>
              🧪 Sandbox Quick Profiles Logins
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {profiles.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p)}
                  style={{
                    textAlign: "left",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--color-teal)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--color-border)"}
                >
                  <div>
                    <strong>{p.first_name} {p.last_name}</strong>
                    <span style={{ display: "block", fontSize: "0.72rem", color: "var(--color-steel)" }}>{p.email}</span>
                  </div>
                  <span style={{ fontSize: "0.68rem", backgroundColor: "var(--color-cloud)", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase" }}>
                    {p.role.split("_")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
