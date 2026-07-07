"use client";

import { useState } from "react";
import { useStaffSession } from "../layout";
import { useRouter } from "next/navigation";
import CrmIcon from "@/lib/crmIcons";

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
      <div className="crm-card" style={{ maxWidth: "440px", width: "100%", padding: "3rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <CrmIcon name="monogram" style={{ width: "4rem", height: "4rem" }} />
          </div>
          <h1 style={{ fontSize: "1.75rem", color: "var(--color-slate-dark)", fontWeight: "700", fontFamily: "var(--font-serif)" }}>
            Faith Haven House
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-steel)" }}>Internal CRM Portal - Staff Access Only</p>
        </div>

        {error && (
          <div className="crm-alert-banner warning" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="crm-form-group">
            <label className="crm-label">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@faithhavenhouse.org"
              className="crm-input"
            />
          </div>

          <div className="crm-form-group">
            <label className="crm-label">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="crm-input"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
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
            <h3 style={{ fontSize: "0.82rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-slate-dark)", marginBottom: "0.75rem", letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <CrmIcon name="flask" style={{ width: "1rem", height: "1rem", color: "var(--color-slate)" }} />
              Sandbox Quick Logins
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {profiles.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleQuickLogin(p)}
                  style={{
                    textAlign: "left",
                    padding: "0.6rem 0.9rem",
                    backgroundColor: "var(--color-ivory)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    transition: "var(--transition)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-charcoal)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-teal)";
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.backgroundColor = "var(--color-ivory)";
                  }}
                >
                  <div>
                    <strong>{p.first_name} {p.last_name}</strong>
                    <span style={{ display: "block", fontSize: "0.72rem", color: "var(--color-steel)" }}>{p.email}</span>
                  </div>
                  <span className="crm-badge slate">
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
