import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("desktop dropdowns support click-to-open and expose expanded state", async () => {
  const source = await readFile(new URL("../../components/Header.jsx", import.meta.url), "utf8");

  assert.match(source, /onClick=\{\(\) => toggleDropdown\(item\.label\)\}/);
  assert.match(source, /aria-expanded=\{openDropdown === item\.label\}/);
  assert.match(source, /aria-controls=\{`nav-submenu-/);
});

test("dropdown hover grace period is long enough to cross the menu gap", async () => {
  const source = await readFile(new URL("../../components/Header.jsx", import.meta.url), "utf8");
  assert.match(source, /}, 900\)/);
});
