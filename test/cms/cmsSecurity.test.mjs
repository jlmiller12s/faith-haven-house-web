import test from "node:test";
import assert from "node:assert/strict";

import { canManageWebsiteContent, safeMediaFilename } from "../../lib/cms/security.mjs";

test("only leadership roles can manage public website content", () => {
  assert.equal(canManageWebsiteContent("super_admin"), true);
  assert.equal(canManageWebsiteContent("executive_director"), true);
  assert.equal(canManageWebsiteContent("admissions_coordinator"), false);
  assert.equal(canManageWebsiteContent("read_only_auditor"), false);
  assert.equal(canManageWebsiteContent(undefined), false);
});

test("media filenames are normalized and cannot include path traversal", () => {
  const filename = safeMediaFilename("../../My Founder Photo (Final).JPG", "image/jpeg");
  assert.match(filename, /^[a-z0-9-]+\.jpg$/);
  assert.equal(filename.includes(".."), false);
  assert.equal(filename.includes("/"), false);
});
