import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contactSources = [
  "../../app/contact/page.jsx",
  "../../app/api/prescreen/route.js",
  "../../components/Footer.jsx",
  "../../components/prescreen/PreScreenForm.jsx",
  "../../components/terms/termsData.js",
  "../../lib/prescreen/email.mjs",
];

test("every public contact surface uses the approved phone number", async () => {
  const sources = await Promise.all(
    contactSources.map((path) => readFile(new URL(path, import.meta.url), "utf8"))
  );
  const combined = sources.join("\n");

  const retiredFormattedNumber = ["636", "577", "5876"].join("-");
  const retiredDialNumber = ["636", "577", "5876"].join("");

  assert.equal(combined.includes(retiredFormattedNumber), false);
  assert.equal(combined.includes(retiredDialNumber), false);
  assert.match(combined, /636-697-3872/);
  assert.match(combined, /tel:6366973872/);
});
