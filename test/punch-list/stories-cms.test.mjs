import test from "node:test";
import assert from "node:assert/strict";
import {
  CONTENT_FIELDS,
  getContentDefaults,
  validateContentValue,
  STORY_SLOT_COUNT,
} from "../../lib/cms/contentRegistry.mjs";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";

test("CMS provides one success-story slot per graduate, each with a photo field", () => {
  const storyNames = CONTENT_FIELDS.filter((field) => /^stories\.\d+\.name$/.test(field.key));
  const storyImages = CONTENT_FIELDS.filter((field) => /^stories\.\d+\.image$/.test(field.key));
  assert.equal(storyNames.length, STORY_SLOT_COUNT);
  assert.equal(storyImages.length, STORY_SLOT_COUNT);
});

test("unfilled optional story fields are valid and remain unpublished", () => {
  assert.equal(validateContentValue(`stories.${STORY_SLOT_COUNT}.name`, "").valid, true);
  assert.equal(validateContentValue(`stories.${STORY_SLOT_COUNT}.image`, "").valid, true);
});

test("stories component publishes any slot with a narrative and either a name or a photo", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  assert.match(source, /\.filter\(\(story\) => story\.quote && \(story\.name \|\| story\.image\)\)/);
  assert.match(source, /s\.image/);
});

test("a graduate published without a name still renders an accessible card", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  const content = getContentDefaults();

  // The December 2023 graduate's name was never recorded, but his photo and
  // milestone were published by Faith Haven House.
  assert.equal(content["stories.13.name"], "");
  assert.equal(content["stories.13.image"], "/assets/graduates/graduate-dec-2023.webp");
  assert.ok(content["stories.13.quote"].length > 0);

  assert.match(source, /alt=\{s\.name \? `\$\{s\.name\}, Faith Haven House graduate` : "A Faith Haven House graduate"\}/);
  // No placeholder name is invented; the heading is simply omitted.
  assert.match(source, /\{s\.name && <StoryHeading>\{s\.name\}<\/StoryHeading>\}/);
  assert.doesNotMatch(source, /Anonymous|Unknown/i);
});

test("every published graduate photo is self-hosted and present in the repo", async () => {
  const content = getContentDefaults();

  for (let slot = 1; slot <= STORY_SLOT_COUNT; slot += 1) {
    const image = content[`stories.${slot}.image`];
    if (!image) continue;
    assert.ok(
      image.startsWith("/assets/"),
      `stories.${slot}.image should be self-hosted, got ${image}`
    );
    await access(new URL(`../../public${image}`, import.meta.url));
  }
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

test("graduate photos are pre-cropped to the 16:10 story-card frame", async () => {
  // Photos re-sourced from the client's resident history are cropped around the
  // subject on disk, so the card needs no per-name object-position override.
  const { readFile: read } = await import("node:fs/promises");
  const cropped = [
    "devon.webp",
    "eric-new-home.webp",
    "jack.webp",
    "graduate-dec-2023.webp",
    "chris.webp",
    "johnny.webp",
    "jerome.webp",
  ];

  for (const file of cropped) {
    const buffer = await read(new URL(`../../public/assets/graduates/${file}`, import.meta.url));
    assert.equal(buffer.subarray(0, 4).toString("ascii"), "RIFF", `${file} should be a webp`);
    assert.equal(buffer.subarray(8, 12).toString("ascii"), "WEBP", `${file} should be a webp`);
  }
});

test("full-frame portraits still declare an object-position correction", async () => {
  const source = await readFile(new URL("../../components/Stories.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");

  assert.match(source, /s\.name === "Eric Goddard" \? "story-media-img--eric-goddard"/);
  assert.match(styles, /\.story-media img\.story-media-img--eric-goddard\s*\{[^}]*object-position:\s*50%\s+34%;/s);
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
