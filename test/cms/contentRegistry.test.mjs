import test from "node:test";
import assert from "node:assert/strict";

import {
  CONTENT_FIELDS,
  getContentDefaults,
  mergeContentRows,
  validateContentValue,
} from "../../lib/cms/contentRegistry.mjs";

test("content registry uses unique keys and supported field types", () => {
  const keys = CONTENT_FIELDS.map((field) => field.key);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(CONTENT_FIELDS.every((field) => ["text", "textarea", "image"].includes(field.type)));
});

test("content defaults contain every registered field", () => {
  const defaults = getContentDefaults();
  for (const field of CONTENT_FIELDS) {
    assert.equal(defaults[field.key], field.defaultValue);
  }
});

test("database rows override defaults without accepting unknown keys", () => {
  const content = mergeContentRows([
    { content_key: "home.hero.title", value: "A new headline" },
    { content_key: "unknown.key", value: "not allowed" },
  ]);

  assert.equal(content["home.hero.title"], "A new headline");
  assert.equal(content["unknown.key"], undefined);
  assert.ok(content["home.hero.tagline"]);
});

test("validation rejects the wrong field type and oversized content", () => {
  assert.deepEqual(validateContentValue("missing.key", "value"), {
    valid: false,
    error: "Unknown content field.",
  });
  assert.equal(validateContentValue("home.hero.title", "").valid, false);
  assert.equal(validateContentValue("home.hero.title", "x".repeat(501)).valid, false);
  assert.equal(validateContentValue("home.hero.title", "A clear headline").valid, true);
  assert.equal(validateContentValue("about.founder.image", "javascript:alert(1)").valid, false);
  assert.equal(validateContentValue("about.founder.image", "/assets/dareth.jpg").valid, true);
  assert.equal(
    validateContentValue(
      "about.founder.image",
      "https://project.supabase.co/storage/v1/object/public/site-media/photo.jpg"
    ).valid,
    true
  );
});
