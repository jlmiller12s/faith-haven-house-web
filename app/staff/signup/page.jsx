"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isMockMode, supabase } from "@/lib/supabase";
import { getStaffProfiles } from "@/lib/crmService";
import CrmIcon from "@/lib/crmIcons";

export default function StaffSignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admissions_coordinator");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (isMockMode) {
      // Mock mode registration simulation
      try {
        const staffList = await getStaffProfiles();
        const emailExists = staffList.some(s => s.email.toLowerCase() === email.toLowerCase());
        
        if (emailExists) {
          setError("A staff profile with this email address already exists.");
          setSubmitting(false);
          return;
        }

        const newStaff = {
          id: `staff-${Math.random().toString(36).substr(2, 9)}`,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: role,
          is_active: true
        };

        staffList.push(newStaff);
        setSuccess("✓ Sandbox registration complete! You can now log in with this profile.");
        setTimeout(() => {
          router.push("/staff/login");
        }, 1500);
      } catch (err) {
        setError("Error writing mock data: " + err.message);
      }
      setSubmitting(false);
    } else {
      // Real Supabase Auth Registration
      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/staff/login",
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role
            }
          }
        });

        if (authError) {
          setError(authError.message);
          setSubmitting(false);
          return;
        }

        if (data?.user) {
          setSuccess("✓ Account created successfully! If email verification is enabled, check your inbox. You may now sign in.");
          setTimeout(() => {
            router.push("/staff/login");
          }, 2000);
        }
      } catch (err) {
        setError("Database connection failed: " + err.message);
      }
      setSubmitting(false);
    }
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
      <div className="crm-card" style={{ maxWidth: "480px", width: "100%", padding: "3rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <CrmIcon name="monogram" style={{ width: "4rem", height: "4rem" }} />
          </div>
          <h1 style={{ fontSize: "1.75rem", color: "var(--color-slate-dark)", fontWeight: "700", fontFamily: "var(--font-serif)" }}>
            Create Staff Account
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-steel)" }}>RAP Portal Registration Gateway</p>
        </div>

        {error && (
          <div className="crm-alert-banner warning" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="crm-alert-banner info" style={{ marginBottom: "1.5rem" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="crm-form-group">
              <label className="crm-label">First Name</label>
              <input 
                type="text" 
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className="crm-input"
              />
            </div>
            <div className="crm-form-group">
              <label className="crm-label">Last Name</label>
              <input 
                type="text" 
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Jenkins"
                className="crm-input"
              />
            </div>
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="crm-input"
            />
          </div>

          <div className="crm-form-group">
            <label className="crm-label">Assigned Permission Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="crm-select"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="executive_director">Executive Director</option>
              <option value="admissions_coordinator">Admissions Coordinator</option>
              <option value="admissions_interviewer">Admissions Interviewer</option>
              <option value="behavioral_health_clinician">Behavioral Health Clinician</option>
              <option value="admissions_committee_member">Committee Member</option>
              <option value="case_manager">Case Manager</option>
              <option value="read_only_auditor">Read-Only Auditor</option>
            </select>
            <span style={{ display: "block", fontSize: "0.72rem", color: "var(--color-steel)", marginTop: "0.25rem" }}>
              For sandbox review purposes, you can choose any role directly.
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
          >
            {submitting ? "Processing Registration..." : "Register Staff Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-steel)" }}>
            Already have an account?{" "}
            <Link href="/staff/login" style={{ color: "var(--color-teal)", fontWeight: "600", textDecoration: "none" }}>
              Sign In Securely
            </Link>
          </span>
        </div>

      </div>
    </div>
  );
}
