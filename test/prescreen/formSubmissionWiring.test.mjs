import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const formSource = await readFile(
  new URL("../../components/prescreen/PreScreenForm.jsx", import.meta.url),
  "utf8"
);

test("the final admissions action invokes the submit handler directly", () => {
  assert.match(
    formSource,
    /<button\s+type="button"\s+className="btn-submit-form"\s+onClick=\{handleSubmit\}/
  );
});

test("submission failures remain visible on the final step", () => {
  assert.match(formSource, /className="submission-error"/);
  assert.match(formSource, /role="alert"/);
});
