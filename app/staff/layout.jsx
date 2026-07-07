"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { isMockMode } from "@/lib/supabase";
import { getStaffProfiles } from "@/lib/crmService";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// Context for Staff Session
const StaffSessionContext = createContext(null);

export function useStaffSession() {
  return useContext(StaffSessionContext);
}

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profiles, setProfiles] = useState([]);
  const [activeStaff, setActiveStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profiles and active staff profile
  useEffect(() => {
    async function init() {
      const staffList = await getStaffProfiles();
      setProfiles(staffList);

      // Default active profile: super_admin or coordinator for easy initial review
      const savedStaffId = localStorage.getItem("fhh_crm_active_staff_id");
      const defaultStaff = staffList.find(s => s.id === savedStaffId) || staffList.find(s => s.role === "super_admin");
      
      setActiveStaff(defaultStaff || null);
      setLoading(false);
    }
    init();
  }, []);

  // Handle mock profile switching
  const handleSwitchProfile = (staffId) => {
    const nextStaff = profiles.find(s => s.id === staffId);
    if (nextStaff) {
      setActiveStaff(nextStaff);
      localStorage.setItem("fhh_crm_active_staff_id", staffId);
      // Force reload or redirect to staff home to refresh components
      window.location.reload();
    }
  };

  // Log out staff
  const handleLogout = () => {
    localStorage.removeItem("fhh_crm_active_staff_id");
    setActiveStaff(null);
    router.push("/staff/login");
  };

  // Route protection gate
  useEffect(() => {
    if (!loading && !activeStaff && pathname !== "/staff/login") {
      router.push("/staff/login");
    }
  }, [activeStaff, loading, pathname, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--color-ivory)" }}>
        <div className="spinner" style={{ border: "4px solid rgba(0,0,0,0.1)", width: "36px", height: "36px", borderRadius: "50%", borderLeftColor: "var(--color-teal)", animation: "spin 1s linear infinite" }}></div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Render Login page without header wraps
  if (pathname === "/staff/login") {
    return (
      <StaffSessionContext.Provider value={{ activeStaff, profiles, setActiveStaff, isMockMode, handleLogout }}>
        {children}
      </StaffSessionContext.Provider>
    );
  }

  return (
    <StaffSessionContext.Provider value={{ activeStaff, profiles, setActiveStaff, isMockMode, handleLogout }}>
      <div style={{ minHeight: "100vh", backgroundColor: "var(--color-cloud)", display: "flex", flexDirection: "column" }}>
        
        {/* DEVELOPER DIAGNOSTIC TOOLBAR */}
        {isMockMode && (
          <div style={{
            backgroundColor: "#E2F0D9",
            borderBottom: "1px solid #C5E0B4",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            position: "sticky",
            top: 0,
            zIndex: 10000
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1rem" }}>🧪</span>
              <strong style={{ color: "#385723" }}>Developer CRM Sandbox Preview</strong>
              <span style={{ color: "#7F7F7F" }}>|</span>
              <span style={{ color: "var(--color-slate-dark)" }}>Current Active User:</span>
              <select 
                value={activeStaff?.id || ""} 
                onChange={(e) => handleSwitchProfile(e.target.value)}
                style={{
                  padding: "0.2rem 0.6rem",
                  fontSize: "0.8rem",
                  borderRadius: "4px",
                  border: "1px solid #A6C893",
                  backgroundColor: "#FFFFFF",
                  fontWeight: "600",
                  color: "var(--color-charcoal)",
                  cursor: "pointer"
                }}
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.role.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: "0.78rem", color: "#548235", fontWeight: "600" }}>
              Toggle role dropdown to test tab permissions & field redactions instantly
            </div>
          </div>
        )}

        {/* STAFF CRM HEADER */}
        <header style={{
          backgroundColor: "var(--color-slate)",
          color: "var(--color-ivory)",
          padding: "1.25rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <Link href="/staff" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
              <span style={{ fontSize: "1.5rem" }}>🏰</span>
              <strong style={{ fontSize: "1.25rem", color: "var(--color-ivory)", letterSpacing: "-0.01em" }}>FHH CRM Portal</strong>
            </Link>
            <nav style={{ display: "flex", gap: "1.5rem" }}>
              <Link href="/staff" style={{ color: pathname === "/staff" ? "#FFFFFF" : "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "0.9rem", textDecoration: "none" }}>
                Dashboard
              </Link>
              <Link href="/staff/admissions" style={{ color: pathname.startsWith("/staff/admissions") ? "#FFFFFF" : "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "0.9rem", textDecoration: "none" }}>
                Admissions Queue
              </Link>
              {activeStaff?.role !== "read_only_auditor" && (
                <Link href="/staff/residents" style={{ color: pathname === "/staff/residents" ? "#FFFFFF" : "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "0.9rem", textDecoration: "none" }}>
                  Active Residents
                </Link>
              )}
              {activeStaff?.role === "super_admin" && (
                <Link href="/staff/team" style={{ color: pathname === "/staff/team" ? "#FFFFFF" : "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "0.9rem", textDecoration: "none" }}>
                  Team
                </Link>
              )}
              {["super_admin", "read_only_auditor"].includes(activeStaff?.role) && (
                <Link href="/staff/audit" style={{ color: pathname === "/staff/audit" ? "#FFFFFF" : "rgba(255,255,255,0.7)", fontWeight: "600", fontSize: "0.9rem", textDecoration: "none" }}>
                  Audit Trail
                </Link>
              )}
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700" }}>{activeStaff?.first_name} {activeStaff?.last_name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-powder-blue)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.03em" }}>
                {activeStaff?.role.replace(/_/g, " ")}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "var(--color-ivory)",
                borderRadius: "4px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>

      </div>
    </StaffSessionContext.Provider>
  );
}
