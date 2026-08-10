import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("case details tolerate an applicant without a recorded housing urgency", async () => {
  const page = await readFile(
    new URL("../../app/staff/admissions/[caseId]/page.jsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /\(applicant\.housing_urgency \|\| "Not recorded"\)\.toUpperCase\(\)/);
});

