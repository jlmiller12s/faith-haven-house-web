import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Dareth's memorial page includes the board-approved calling story", async () => {
  const data = await readFile(
    new URL("../../components/memorial/memorialData.js", import.meta.url),
    "utf8"
  );
  const page = await readFile(
    new URL("../../components/memorial/MemorialPage.jsx", import.meta.url),
    "utf8"
  );

  assert.match(data, /Called Out Upon the Waters/);
  assert.match(data, /A Calling Confirmed/);
  assert.match(data, /Sea of Galilee/);
  assert.match(data, /Open a transitional home for men/);
  assert.match(page, /legacy\.confirmationHeading/);
  assert.match(data, /Darreth Jeffers/);
  assert.match(data, /St\. Louis or that matter/);
  assert.match(data, /You've never failed, and You won't start now/);
  assert.match(data, /boldPhrases/);
  assert.match(data, /God was calling her to open Faith Haven House/);
  assert.match(page, /<strong key=/);
});
