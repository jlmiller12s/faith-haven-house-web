# AGENTS.md — AI Agent Guidance & Repository Blueprint

This file serves as the primary instructions and contextual reference for any AI agent (Claude Code, Gemini, ChatGPT, Codex, Cursor, etc.) working with or maintaining this codebase.

## 1. Project Overview & Context
- **Project Name:** Faith Haven House Website (`faith-haven-house-web`)
- **Organization:** Faith Haven House (Emergency Shelter & Resident Rehabilitation Center)
- **Description:** A modern, high-performance web application and Resident Admissions Portal (RAP) rebuild for Faith Haven House.
- **Repository (GitHub):** `git@github.com:jlmiller12s/faith-haven-house-web.git`
- **GitHub Web URL:** `https://github.com/jlmiller12s/faith-haven-house-web`
- **Hosting & Deployment (Vercel):** `https://vercel.com/jimmies-projects-1b6c5a25/faith-haven-house-web`

---

## 2. Technology Stack & Frameworks
- **Framework:** Next.js 15+ (App Router)
- **UI & Runtime:** React 19, JavaScript (JSX/ESM)
- **Backend & Database:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- **Styling:** Custom CSS tokens & variables defined in `app/globals.css`
- **Animations & Smooth Scroll:** GSAP (`gsap`), Lenis (`lenis`)
- **Data Validation:** Zod (`zod`)
- **Document Generation:** PptxGenJS (`pptxgenjs`)
- **Analytics:** Vercel Analytics (`@vercel/analytics`)

---

## 3. Directory Structure & Architecture

```
fhh-website/
├── app/                      # Next.js App Router Pages & API Routes
│   ├── layout.jsx            # Root layout component
│   ├── page.jsx              # Main landing / home page
│   ├── globals.css           # Global CSS variables & token design system
│   ├── admissions/           # Resident Admissions Portal (RAP) & intake
│   ├── api/                  # Serverless API endpoints (volunteer, intake, etc.)
│   ├── auth/                 # Authentication callback & login handling
│   ├── get-help/             # Pre-screen & intake engine for residents
│   ├── staff/                # Staff dashboard & CRM features
│   └── ...                   # Additional route pages (about, blog, stories, etc.)
├── components/               # Modular React UI components (Hero, Volunteer, etc.)
├── docs/                     # Architectural specs, auth setups & launch checklists
│   ├── admissions-crm-architecture.md
│   ├── admissions-crm-launch-checklist.md
│   └── rap-portal-supabase-auth-setup.md
├── hooks/                    # Custom React hooks
├── lib/                      # Supabase client helpers & utility functions
├── public/                   # Static assets (images, logos, icons, fonts)
├── supabase/                 # Database migrations, SQL setup scripts, and schemas
├── middleware.js             # Auth check and route protection middleware
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies and npm scripts
└── README.md                 # Developer quick-start guide
```

---

## 4. Development Workflow & Commands

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm (v9+)

### Local Development Commands
- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Run Local Dev Server (Pinned to Port 3006):**
  ```bash
  npm run dev
  ```
  *Note: Always use port 3006 (`http://localhost:3006`) to prevent port collisions.*

- **Build for Production:**
  ```bash
  npm run build
  ```

- **Run Linter:**
  ```bash
  npm run lint
  ```

- **Run Node Unit Tests:**
  ```bash
  npm run test
  ```

---

## 5. Guidelines & Conventions for AI Agents

1. **Strict Port Usage:** Dev server must run on port `3006`.
2. **Styling & Design Tokens:** Do not introduce ad-hoc utility classes or inline styles where global CSS variables exist. Refer to `app/globals.css` for primary colors, typography, spacing, and component classes.
3. **No Fallback / Dummy Data in Production Code:** Always ensure component states handle real API/Supabase responses gracefully.
4. **Supabase Integration:**
   - Use server side client (`@supabase/ssr`) in App Router routes and server actions.
   - Use browser client for client side components.
   - Ensure environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are defined in `.env.local`.
5. **Route Protection & Security:** Check `middleware.js` before making changes to auth routes, RAP portal, or `/staff` routes.
6. **Code Safety & Quality:**
   - Never suppress errors or wrap calls in empty `try/catch` blocks.
   - Preserve existing comments and docstrings.
   - Test changes with `npm run build` and `npm run test` before committing.
