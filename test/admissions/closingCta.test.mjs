import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const admissionsPage = readFileSync(
  new URL("../../components/admissions/AdmissionsPage.jsx", import.meta.url),
  "utf8",
);

test("uses a visible light outline style for the admissions closing contact CTA on the dark background", () => {
  const closingCta = admissionsPage.match(
    /<section className="admissions-closing-cta"[\s\S]*?<\/section>/,
  )?.[0];

  assert.ok(closingCta, "expected to find the admissions closing CTA section");
  assert.match(
    closingCta,
    /href="\/contact"\s+className="btn btn-outline-light"/,
    "the closing contact CTA should be visible before hover on the dark CTA background",
  );
});
