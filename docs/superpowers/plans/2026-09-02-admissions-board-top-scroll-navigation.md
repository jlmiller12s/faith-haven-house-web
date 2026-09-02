# Admissions Board Top Scroll Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let staff move horizontally through the seven admissions stages from the top of the board without first scrolling to the bottom of the page.

**Architecture:** Add a small client-side navigation component above the existing board. It mirrors the board's horizontal position in both directions, measures the rail after loading and resizing, and offers accessible previous/next buttons. The existing board remains the source of truth and retains its native bottom scrollbar, drag-and-drop behavior, mobile scroll snapping, and applicant data flow.

**Tech Stack:** Next.js 15, React 19 hooks, existing CSS design tokens, Node test runner, Vercel preview deployments.

## Global Constraints

- Do not change Supabase tables, migrations, API calls, applicant records, workflow statuses, or admissions content.
- Do not publish to production until the staging preview is approved by the user.
- Place the new control directly below the board filters and above the first workflow column.
- Keep the existing bottom scrollbar as a fallback.
- Hide the top navigation when all seven columns fit within the available width.
- Preserve touch swiping and stage snapping on screens at or below 800px.
- Provide 44px minimum button targets, visible focus states, keyboard-operable scrolling, and reduced-motion support.
- Use existing Faith Haven House color, border, spacing, and focus tokens.

---

## What already exists

- `components/staff/AdmissionsBoard.jsx` renders the toolbar and the horizontally scrollable board.
- `app/globals.css` defines `.admissions-board-scroll` with `overflow-x: auto` and `.admissions-board-rail` with a 1,980px minimum width.
- Mobile CSS already uses 82vw-wide stages and horizontal scroll snapping.
- The sticky RAP Portal header remains unchanged.

## Recommended interaction

```text
Search and assignment filters
┌──────┬──────────────────────────────────────────────┬──────┐
│  ←   │ draggable horizontal stage scrollbar        │  →   │
└──────┴──────────────────────────────────────────────┴──────┘
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Pre-screen   │ Interview    │ Background   │ Committee…   │
│              │ & intake     │ check        │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

- Dragging either scrollbar updates the other immediately.
- The arrow buttons move approximately one stage at a time.
- Buttons disable at the first and last horizontal positions.
- On mobile, staff can use the buttons, drag the top scrollbar, or swipe the board.

## Not in scope

- Replacing the Kanban-style seven-column board.
- Changing stage names, workflow order, applicant cards, or drag-and-drop rules.
- Making the top navigation permanently sticky under the RAP header; this small update places it where the user first needs it and avoids header overlap at responsive sizes.
- Removing the native bottom scrollbar.

---

### Task 1: Add a regression test for the new navigation contract

**Files:**
- Create: `test/admissions/board-horizontal-navigation.test.mjs`
- Read: `components/staff/AdmissionsBoard.jsx`
- Read: `components/staff/AdmissionsBoardScrollControls.jsx`
- Read: `app/globals.css`

**Interfaces:**
- Consumes: rendered source for the admissions board and its styles.
- Produces: a test contract requiring the accessible top control, previous/next controls, synchronized board reference, and overflow-only presentation.

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const boardPath = new URL("../../components/staff/AdmissionsBoard.jsx", import.meta.url);
const controlsPath = new URL("../../components/staff/AdmissionsBoardScrollControls.jsx", import.meta.url);
const stylesPath = new URL("../../app/globals.css", import.meta.url);

test("the admissions board exposes accessible horizontal navigation above the rail", async () => {
  const [board, controls, styles] = await Promise.all([
    readFile(boardPath, "utf8"),
    readFile(controlsPath, "utf8"),
    readFile(stylesPath, "utf8"),
  ]);

  assert.match(board, /<AdmissionsBoardScrollControls targetRef={boardScrollRef} \/>/);
  assert.match(board, /className="admissions-board-scroll"[^>]*ref={boardScrollRef}/);
  assert.match(controls, /aria-label="Scroll admissions workflow stages"/);
  assert.match(controls, /aria-label="View earlier admissions stages"/);
  assert.match(controls, /aria-label="View later admissions stages"/);
  assert.match(controls, /ResizeObserver/);
  assert.match(styles, /\.admissions-board-scroll-controls/);
  assert.match(styles, /min-(?:width|height):\s*44px/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test test/admissions/board-horizontal-navigation.test.mjs`

Expected: FAIL because the control component and board reference do not exist yet.

- [ ] **Step 3: Commit the failing test on a staging branch**

```bash
git switch -c feature/admissions-board-top-scroll
git add test/admissions/board-horizontal-navigation.test.mjs
git commit -m "test(admissions): cover top horizontal board navigation"
```

---

### Task 2: Build the synchronized top navigation control

**Files:**
- Create: `components/staff/AdmissionsBoardScrollControls.jsx`

**Interfaces:**
- Consumes: `targetRef`, a React ref whose current value is the existing `.admissions-board-scroll` element.
- Produces: `AdmissionsBoardScrollControls({ targetRef })`, a client component that mirrors horizontal position and overflow state.

- [ ] **Step 1: Create the control component**

Implementation requirements:

```jsx
"use client";

import { useEffect, useRef, useState } from "react";

const EDGE_TOLERANCE = 2;
const STAGE_SCROLL_DISTANCE = 290;

export default function AdmissionsBoardScrollControls({ targetRef }) {
  const controlRef = useRef(null);
  const syncingRef = useRef(false);
  const [state, setState] = useState({
    contentWidth: 0,
    hasOverflow: false,
    atStart: true,
    atEnd: false,
  });

  useEffect(() => {
    const target = targetRef.current;
    const control = controlRef.current;
    if (!target || !control) return undefined;

    const measure = () => {
      const maximum = Math.max(0, target.scrollWidth - target.clientWidth);
      setState({
        contentWidth: target.scrollWidth,
        hasOverflow: maximum > EDGE_TOLERANCE,
        atStart: target.scrollLeft <= EDGE_TOLERANCE,
        atEnd: target.scrollLeft >= maximum - EDGE_TOLERANCE,
      });
    };

    const finishSync = () => {
      window.requestAnimationFrame(() => {
        syncingRef.current = false;
      });
    };

    const syncFromBoard = () => {
      if (!syncingRef.current) {
        syncingRef.current = true;
        control.scrollLeft = target.scrollLeft;
        finishSync();
      }
      measure();
    };

    const syncFromControl = () => {
      if (!syncingRef.current) {
        syncingRef.current = true;
        target.scrollLeft = control.scrollLeft;
        finishSync();
      }
      measure();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(target);
    if (target.firstElementChild) observer.observe(target.firstElementChild);
    target.addEventListener("scroll", syncFromBoard, { passive: true });
    control.addEventListener("scroll", syncFromControl, { passive: true });
    measure();

    return () => {
      observer.disconnect();
      target.removeEventListener("scroll", syncFromBoard);
      control.removeEventListener("scroll", syncFromControl);
    };
  }, [targetRef]);

  const move = (direction) => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    targetRef.current?.scrollBy({
      left: direction * STAGE_SCROLL_DISTANCE,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (!state.hasOverflow) return null;

  return (
    <nav className="admissions-board-scroll-controls" aria-label="Scroll admissions workflow stages">
      <button type="button" aria-label="View earlier admissions stages" disabled={state.atStart} onClick={() => move(-1)}>
        <span aria-hidden="true">←</span>
      </button>
      <div className="admissions-board-top-scroll" ref={controlRef} tabIndex="0" aria-label="Horizontal admissions stage scrollbar">
        <div aria-hidden="true" style={{ width: `${state.contentWidth}px` }} />
      </div>
      <button type="button" aria-label="View later admissions stages" disabled={state.atEnd} onClick={() => move(1)}>
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
}
```

- [ ] **Step 2: Integrate the control above the existing scroll region**

Modify `components/staff/AdmissionsBoard.jsx` to import `useRef` and `AdmissionsBoardScrollControls`, create `const boardScrollRef = useRef(null)`, render the control after the toolbar/loading decision and before the board, and attach `ref={boardScrollRef}` to `.admissions-board-scroll`.

- [ ] **Step 3: Run the focused test and verify it passes**

Run: `node --test test/admissions/board-horizontal-navigation.test.mjs`

Expected: 1 test passed, 0 failed.

- [ ] **Step 4: Commit the behavior**

```bash
git add components/staff/AdmissionsBoard.jsx components/staff/AdmissionsBoardScrollControls.jsx
git commit -m "feat(admissions): add top board scroll navigation"
```

---

### Task 3: Style desktop, mobile, focus, and reduced-motion states

**Files:**
- Modify: `app/globals.css` near the existing admissions board styles.
- Test: `test/admissions/board-horizontal-navigation.test.mjs`

**Interfaces:**
- Consumes: existing Faith Haven House CSS tokens and the control component classes.
- Produces: a compact top navigation that is visually tied to the board without covering the RAP header.

- [ ] **Step 1: Add control styles**

```css
.admissions-board-scroll-controls {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.75rem;
  padding: 0.45rem;
  border: 1px solid rgba(94, 120, 144, 0.45);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 14px rgba(23, 50, 71, 0.07);
}

.admissions-board-scroll-controls button {
  min-width: 44px;
  min-height: 44px;
  border: 1px solid rgba(94, 120, 144, 0.55);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--color-slate-dark);
  cursor: pointer;
}

.admissions-board-scroll-controls button:disabled {
  cursor: default;
  opacity: 0.38;
}

.admissions-board-scroll-controls button:focus-visible,
.admissions-board-top-scroll:focus-visible {
  outline: 3px solid rgba(92, 158, 173, 0.35);
  outline-offset: 2px;
}

.admissions-board-top-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  min-height: 18px;
  scrollbar-color: var(--color-teal) rgba(41, 76, 96, 0.1);
}

.admissions-board-top-scroll > div {
  height: 1px;
}

@media (max-width: 800px) {
  .admissions-board-scroll-controls {
    grid-template-columns: 44px minmax(0, 1fr) 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admissions-board-scroll,
  .admissions-board-top-scroll {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 2: Run the focused regression test**

Run: `node --test test/admissions/board-horizontal-navigation.test.mjs`

Expected: 1 test passed, 0 failed.

- [ ] **Step 3: Commit the styling**

```bash
git add app/globals.css test/admissions/board-horizontal-navigation.test.mjs
git commit -m "style(admissions): surface horizontal navigation above board"
```

---

### Task 4: Verify behavior and publish staging only

**Files:**
- Verify: all files changed by Tasks 1–3.
- Do not modify: Supabase migrations, API routes, workflow persistence, or production data.

**Interfaces:**
- Consumes: the completed feature branch.
- Produces: a Vercel preview URL for user approval.

- [ ] **Step 1: Run repository verification**

Run: `git diff --check && npm test && npm run build`

Expected: no whitespace errors, all tests passed, and production build exit code 0.

- [ ] **Step 2: Verify locally at representative viewport widths**

Check 1440px, 1024px, 768px, and 390px widths. At each width confirm:

- The top navigation appears only when the board overflows.
- Dragging the top scrollbar moves the board and bottom scrollbar.
- Dragging/swiping the board moves the top scrollbar.
- Previous/next buttons move about one column and disable at the ends.
- Keyboard focus is visible and arrow-key scrolling works on the focused top scrollbar.
- Applicant-card menus, links, checkboxes, and drag-and-drop still work.
- No applicant information is added, removed, or changed by navigating horizontally.

- [ ] **Step 3: Push only the feature branch**

```bash
git push -u origin feature/admissions-board-top-scroll
```

Expected: Vercel creates a Preview deployment; production remains unchanged.

- [ ] **Step 4: Verify the staging deployment**

Open `/staff/admissions` on the Vercel preview, sign in, repeat the desktop and mobile checks, and scan the preview deployment for runtime errors.

- [ ] **Step 5: Present staging for approval**

Share the Preview URL, verification results, branch name, and commit hash. Do not merge to `main` or promote the deployment until the user explicitly approves it.

