import test from "node:test";
import assert from "node:assert/strict";
import { CONTENT_FIELDS, validateContentValue } from "../../lib/cms/contentRegistry.mjs";
import { readFile } from "node:fs/promises";

test("CMS provides ten success-story slots with photo fields", () => {
  const storyNames = CONTENT_FIELDS.filter((field) => /^stories\.\d+\.name$/.test(field.key));
  const storyImages = CONTENT_FIELDS.filter((field) => /^stories\.\d+\.image$/.test(field.key));
  assert.equal(storyNames.length, 10);
  assert.equal(storyImages.length, 10);
});

test("unfilled optional story fields are valid and remain unpublished", () => {
  assert.equal(validateContentValue("stories.10.name", "").valid, true);
  assert.equal(validateContentValue("stories.10.image", "").valid, true);
});

test("stories component publishes only slots with a name and narrative", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  assert.match(source, /\.filter\(\(story\) => story\.name && story\.quote\)/);
  assert.match(source, /s\.image/);
});

test("success-story cards lead with a large image above the story text", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
  const image = source.indexOf('className="story-media"');
  const text = source.indexOf('className="story-body"');

  assert.ok(image >= 0 && image < text);
  assert.match(styles, /\.story-media\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1;/s);
  assert.match(styles, /\.story-media img\s*\{[^}]*object-fit:\s*cover;/s);
});
