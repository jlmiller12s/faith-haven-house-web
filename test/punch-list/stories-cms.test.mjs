import test from "node:test";
import assert from "node:assert/strict";
import { CONTENT_FIELDS, validateContentValue } from "../../lib/cms/contentRegistry.mjs";
import { readFile } from "node:fs/promises";

test("CMS provides twelve success-story slots with photo fields", () => {
  const storyNames = CONTENT_FIELDS.filter((field) => /^stories\.\d+\.name$/.test(field.key));
  const storyImages = CONTENT_FIELDS.filter((field) => /^stories\.\d+\.image$/.test(field.key));
  assert.equal(storyNames.length, 12);
  assert.equal(storyImages.length, 12);
});

test("unfilled optional story fields are valid and remain unpublished", () => {
  assert.equal(validateContentValue("stories.12.name", "").valid, true);
  assert.equal(validateContentValue("stories.12.image", "").valid, true);
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

test("the stories archive uses a compact accessible three-column layout", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../../app/stories/page.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /<Stories standalone \/>/);
  assert.match(styles, /\.stories-grid--compact\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(styles, /\.story-card--compact \.story-media\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*10;/s);
  assert.match(source, /aria-expanded=\{isExpanded\}/);
  assert.match(source, /aria-controls=\{storyBodyId\}/);
  assert.match(source, /Read full story/);
});

test("the homepage uses the approved compact success-story layout", async () => {
  const page = await readFile(new URL("../../app/page.jsx", import.meta.url), "utf8");
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");

  assert.match(page, /<Stories compact \/>/);
  assert.match(source, /const useCompactLayout = standalone \|\| compact;/);
});

test("Devon's portrait keeps his face inside the story-card crop", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /s\.name === "Devon" \? "story-media-img--devon"/);
  assert.match(styles, /\.story-media img\.story-media-img--devon\s*\{[^}]*object-position:\s*50%\s+12%;/s);
});

test("brief graduate milestones form the final equal-height row", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /\.\.\.STORIES\.filter\(\(story\) => story\.quote\.length > 280\)/);
  assert.match(source, /\.\.\.STORIES\.filter\(\(story\) => story\.quote\.length <= 280\)/);
  assert.match(source, /ORDERED_STORIES\.map/);
  assert.match(styles, /\.stories-grid--compact\s*\{[^}]*align-items:\s*stretch;/s);
  assert.match(styles, /\.story-card--compact \.story-content\s*\{[^}]*flex:\s*1;/s);
  assert.match(styles, /\.story-toggle\s*\{[^}]*margin-top:\s*auto;/s);
});
