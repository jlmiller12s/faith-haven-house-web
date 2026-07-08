"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { createRapSupabaseBrowser } from "@/lib/supabase-browser";

// -------------------------------------------------------
// Staff Session Context
// -------------------------------------------------------
const StaffSessionContext = createContext(null);

export function useStaffSession() {
  return useContext(StaffSessionContext);
}

// Routes that render without the staff header / nav
const BARE_PATHS = [
  "/staff/login",
  "/staff/forgot-password",
  "/staff/reset-password",
  "/staff/mfa/setup",
  "/staff/mfa/verify",
  "/staff/signup",
  "/staff/unauthorized",
  "/staff/auth/callback",
];

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeStaff, setActiveStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initSession() {
      try {
        const supabase = createRapSupabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setActiveStaff(null);
          setLoading(false);
          return;
        }

        // Fetch staff profile from DB — role always comes from server
        const { data: profile } = await supabase
          .from("staff_profiles")
          .select("id, first_name, last_name, email, role, is_active")
          .eq("auth_user_id", user.id)
          .single();

        if (profile && profile.is_active) {
          setActiveStaff(profile);
        } else {
          setActiveStaff(null);
        }
      } catch {
        setActiveStaff(null);
      }
      setLoading(false);
    }

    initSession();

    // Listen for auth state changes (sign-out, token refresh)
    const supabase = createRapSupabaseBrowser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          setActiveStaff(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = () => {
    // Route to server-side logout (clears session server-side)
    router.push("/staff/logout");
  };

  // Loading spinner
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#FAF8EF",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "4px solid rgba(0,0,0,0.1)",
            borderLeftColor: "#294C60",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Bare layout for auth/utility pages
  const isBare = BARE_PATHS.some((p) => pathname === p || pathname.startsWith(p));
  if (isBare) {
    return (
      <StaffSessionContext.Provider value={{ activeStaff, setActiveStaff, handleLogout }}>
        {children}
      </StaffSessionContext.Provider>
    );
  }

  return (
    <StaffSessionContext.Provider value={{ activeStaff, setActiveStaff, handleLogout }}>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF8EF",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* RAP PORTAL HEADER */}
        <header
          style={{
            backgroundColor: "#294C60",
            color: "#FAF8EF",
            padding: "0.9rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(23,50,71,0.15)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Left: Brand + Nav */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}
          >
            <Link
              href="/staff"
              style={{ textDecoration: "none" }}
              aria-label="RAP Portal dashboard"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
              >
                <Image
                  src="/assets/fhh-logo-standalone-icon.png"
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                  style={{ objectFit: "contain" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: "800",
                      color: "#FAF8EF",
                      lineHeight: "1.1",
                      letterSpacing: "0.01em",
                      fontFamily: "Inter, system-ui, sans-serif",
                    }}
                  >
                    RAP Portal
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(250,248,239,0.65)",
                      fontWeight: "500",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Resident Admissions Portal
                  </div>
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav
              style={{
                display: "flex",
                gap: "1.25rem",
                alignItems: "center",
              }}
            >
              {[
                { href: "/staff", label: "Dashboard", match: pathname === "/staff" },
                {
                  href: "/staff/admissions",
                  label: "Admissions",
                  match: pathname.startsWith("/staff/admissions"),
                },
                ...(activeStaff?.role !== "read_only_auditor"
                  ? [
                      {
                        href: "/staff/residents",
                        label: "Residents",
                        match: pathname === "/staff/residents",
                      },
                    ]
                  : []),
                ...(activeStaff?.role === "super_admin"
                  ? [
                      {
                        href: "/staff/team",
                        label: "Team",
                        match: pathname === "/staff/team",
                      },
                      {
                        href: "/staff/invite",
                        label: "Invite Staff",
                        match: pathname === "/staff/invite",
                      },
                    ]
                  : []),
                ...(["super_admin", "read_only_auditor"].includes(
                  activeStaff?.role
                )
                  ? [
                      {
                        href: "/staff/audit",
                        label: "Audit Trail",
                        match: pathname === "/staff/audit",
                      },
                    ]
                  : []),
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: item.match
                      ? "#FFFFFF"
                      : "rgba(250,248,239,0.72)",
                    fontWeight: item.match ? "700" : "500",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    letterSpacing: "0.01em",
                    borderBottom: item.match
                      ? "2px solid rgba(250,248,239,0.5)"
                      : "2px solid transparent",
                    paddingBottom: "2px",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Staff name + Sign Out */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            {activeStaff && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    color: "#FAF8EF",
                  }}
                >
                  {activeStaff.first_name} {activeStaff.last_name}
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "rgba(250,248,239,0.6)",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    letterSpacing: "0.04em",
                  }}
                >
                  {activeStaff.role?.replace(/_/g, " ")}
                </div>
              </div>
            )}
            <a
              href="/staff/logout"
              style={{
                background: "transparent",
                border: "1px solid rgba(250,248,239,0.25)",
                color: "#FAF8EF",
                borderRadius: "5px",
                padding: "0.35rem 0.85rem",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontWeight: "600",
                textDecoration: "none",
                fontFamily: "inherit",
                letterSpacing: "0.02em",
                transition: "border-color 0.15s",
              }}
            >
              Sign Out
            </a>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </StaffSessionContext.Provider>
  );
}
