# RAP Portal — Supabase Auth Setup Guide

This document contains every manual configuration step required in the Supabase Dashboard
to activate the production authentication system for the Faith Haven House RAP Portal.

---

## 1. Environment Variables

Add these to your **Vercel project → Settings → Environment Variables**:

| Variable | Where to find it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role key | ✅ Yes (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL, e.g. `https://faith-haven-house-web.vercel.app` | ✅ Yes |

> **SECURITY**: `SUPABASE_SERVICE_ROLE_KEY` must **never** be set as `NEXT_PUBLIC_*`.
> It is only accessed in server-side API routes (`/api/staff/invite`).

---

## 2. Supabase Dashboard — Auth Configuration

### 2a. Site URL and Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to:
   ```
   https://faith-haven-house-web.vercel.app
   ```
3. Add to **Redirect URLs** (one per line):
   ```
   https://faith-haven-house-web.vercel.app/auth/callback
   https://faith-haven-house-web.vercel.app/staff/reset-password
   https://faith-haven-house-web.vercel.app/staff/login
   http://localhost:3006/auth/callback
   http://localhost:3006/staff/reset-password
   ```

### 2b. Email Confirmation (Required)

1. Go to **Authentication → Providers → Email**
2. Ensure **"Confirm email"** is **enabled**
3. Set **"Email OTP Expiry"** to `3600` seconds (1 hour)

### 2c. Enable MFA / TOTP

1. Go to **Authentication → Multi-Factor Authentication**
2. Enable **"TOTP"** (Time-Based One-Time Password)
3. Optional: Set enforcement policy — the RAP Portal enforces this per-profile via `mfa_required` column

### 2d. Customize Email Templates

Go to **Authentication → Email Templates** and customize these:

#### Confirm Signup
Subject: `Confirm your Faith Haven House RAP Portal account`

Body:
```html
<p>Hello,</p>
<p>You have been invited to the Faith Haven House RAP Portal (Resident Admissions Portal).</p>
<p>Please confirm your account by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Account</a></p>
<p>If you did not request this, you can safely ignore this email.</p>
<p>Faith Haven House</p>
```

#### Reset Password
Subject: `Reset your Faith Haven House RAP Portal password`

Body:
```html
<p>Hello,</p>
<p>You requested a password reset for your Faith Haven House RAP Portal account.</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link expires in 1 hour. If you did not request this, no action is needed.</p>
<p>Faith Haven House</p>
```

#### Invite User
Subject: `You've been invited to the Faith Haven House RAP Portal`

Body:
```html
<p>Hello,</p>
<p>You have been invited to join the Faith Haven House RAP Portal (Resident Admissions Portal).</p>
<p>Click the link below to set your password and activate your account:</p>
<p><a href="{{ .ConfirmationURL }}">Accept Invitation</a></p>
<p>After setting your password, you will be prompted to set up multi-factor authentication.</p>
<p>Faith Haven House</p>
```

---

## 3. Run the Database Migration

Apply the auth setup migration to your Supabase database. You can do this via:

### Option A: Supabase Dashboard SQL Editor

1. Go to **SQL Editor** in your Supabase Dashboard
2. Paste the contents of `supabase/migrations/20260708000000_rap_auth_setup.sql`
3. Click **Run**

### Option B: Supabase CLI

```bash
supabase db push
```

---

## 4. Create Your First Admin Account

After applying the migration, create the initial super admin via the Supabase Dashboard:

1. Go to **Authentication → Users → Invite User**
2. Enter the admin email address
3. After the user accepts the invite, go to **Table Editor → staff_profiles**
4. Find the row with the admin's `auth_user_id` (or insert manually):

```sql
INSERT INTO public.staff_profiles (auth_user_id, first_name, last_name, email, role, is_active, mfa_required)
VALUES (
  '<uuid from auth.users>',
  'Admin',
  'User',
  'admin@faithhavenhouse.org',
  'super_admin',
  true,
  true
);
```

Or if using the automated migration seed, update the placeholder UUID after the auth user is created.

---

## 5. Invite Additional Staff

Once logged in as super admin:

1. Go to `/staff/invite` in the RAP Portal
2. Fill in the staff member's name, email, and role
3. The system will send a Supabase invite email
4. After they confirm, their account is active

---

## 6. Production Readiness Checklist

Before going live, verify:

- [ ] Email confirmation is ON in Supabase Dashboard
- [ ] TOTP MFA is enabled
- [ ] Redirect URLs include `/auth/callback` and `/staff/reset-password`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (not `NEXT_PUBLIC_*`)
- [ ] `NEXT_PUBLIC_SITE_URL` is set to the Vercel production URL
- [ ] Auth migration has been applied to the production database
- [ ] At least one super admin account exists and is active
- [ ] No dummy/demo accounts exist in `auth.users` or `staff_profiles`
- [ ] RLS is enabled on all tables (verify in Supabase Dashboard → Table Editor)
- [ ] Email templates have been customized
- [ ] `/staff/*` routes redirect unauthenticated users to login (test in incognito)

---

## 7. Role Permission Summary

| Role | Dashboard | Admissions | Residents | Team | Invite | Audit | Notes |
|---|---|---|---|---|---|---|---|
| super_admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | All |
| executive_director | ✅ | ✅ | ✅ | ✅ | — | — | Restricted |
| admissions_coordinator | ✅ | ✅ | ✅ | — | — | — | General + Restricted |
| admissions_interviewer | ✅ | ✅ | — | — | — | — | General + Restricted |
| behavioral_health_clinician | ✅ | ✅ | — | — | — | — | Clinical |
| admissions_committee_member | ✅ | ✅ | — | — | — | — | Committee |
| case_manager | ✅ | ✅ | ✅ | — | — | — | General |
| read_only_auditor | ✅ | ✅ | — | — | — | ✅ | Read-only |

---

## 8. Security Notes

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or `NEXT_PUBLIC_*` variables
- The service role key bypasses RLS — it is used only in `/api/staff/invite` on the server
- All role checks use DB values, never client-provided values
- Errors on login/MFA never reveal whether an account exists (privacy-safe)
- Audit logs are append-only (no UPDATE or DELETE policies)
- MFA enforcement is at the middleware level — even if clients bypass the UI, the session will not reach `aal2` without verification
