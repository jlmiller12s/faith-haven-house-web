import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the staff header contains its navigation on narrow screens", async () => {
  const provider = await readFile(new URL("../../app/staff/StaffClientProvider.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(provider, /className="staff-portal-header"/);
  assert.match(provider, /className="staff-portal-nav"/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.staff-portal-nav[\s\S]*overflow-x:\s*auto/);
  assert.match(provider, /className="staff-portal-brand-copy"/);
  assert.match(css, /@media \(max-width: 520px\)[\s\S]*\.staff-portal-brand-copy[\s\S]*display:\s*none/);
});
