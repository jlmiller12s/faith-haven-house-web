import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { getContentDefaults, mergeContentRows } from "../../lib/cms/contentRegistry.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Toni Lynch's approved three-paragraph bio is published verbatim", async () => {
  const team = await read("../../components/team/TeamPage.jsx");

  assert.match(team, /Toni grew up in St\. Louis County, where her family regularly served at local food banks and supported unhoused neighbors — values she carried into adulthood\. After living in several states, she returned to St\. Charles County in 2004 and has remained an active part of the community\./);
  assert.match(team, /With a background in executive administrative support and international adoption, Toni has always been drawn to work that supports people and families\. As a Girl Scout and Boy Scout leader, she involved her children in serving at homeless shelters, continuing the legacy of compassion she learned as a child on a regular basis\./);
  assert.match(team, /Toni has volunteered with her church’s food pantry and has been committed to Faith Haven House since its before the grand opening\. She has a deep heart for the unhoused both locally and globally, guided by a belief shared by cofounder Dareth Jeffers: “With God we can do anything\.”/);
  assert.doesNotMatch(team, /Bio forthcoming\./);
});

test("all twelve graduate records are present without publication dates", () => {
  const content = getContentDefaults();
  const names = Array.from({ length: 12 }, (_, index) => content[`stories.${index + 1}.name`]);
  const dates = Array.from({ length: 12 }, (_, index) => content[`stories.${index + 1}.date`]);

  assert.deepEqual(names, [
    "Eric",
    "Devon",
    "Jack",
    "Ziggy",
    "Bob",
    "Chris",
    "Johnny",
    "Dan",
    "Josh",
    "Jerome",
    "Eric Goddard",
    "Shane",
  ]);
  assert.deepEqual(dates, Array(12).fill(""));
});

test("all approved graduate narratives remain byte-for-byte unchanged", () => {
  const content = getContentDefaults();
  const expectedHashes = [
    "1db0a406e0f87f786ff2480d358ded0874fcf6dcf71558a0d6bbb680cb369bff",
    "859d3e42c37670a7b359f18e9bc1c46f29f66d93bc02c60a88fdf91af7b7fe5d",
    "219b2ea072efea368384c81cd64e5276a086926e317b0b9f75d737abeb076d5c",
    "18307b1fc1c81cd7a03181f3b6c19a8daebe50c7e92aa608540a440317bfde56",
    "1395286f3b544f5918d68f8537ef232c86d9691362b4f656ec5d75257af689d5",
    "329473cbfa3490eb91f5887db8bfcfe988865841f743e443ef496c5532a7e4f4",
    "ff1d7da12cee47d63a8aaaf48774d03c47e0fad92c342869c7ecd93e35376320",
    "65a30c4b0746ef7d5387140b2a1137edb861a8aadd21fb0089fee960e2cacebc",
    "f9666938ba783353faf8afe6782bde22d00fd40a222e74f2b72abb6e5aab8553",
    "c3f25928eff6f927162d8ed8e889ce39d04e1c8b2892f1bc39fbbdd66904884e",
    "46e56bff0897f923331623e82dd851186b73d62e0ee56f3b72f574c3cdd6d1d6",
    "f9666938ba783353faf8afe6782bde22d00fd40a222e74f2b72abb6e5aab8553",
  ];
  const actualHashes = Array.from({ length: 12 }, (_, index) =>
    createHash("sha256")
      .update(content[`stories.${index + 1}.quote`])
      .digest("hex")
  );

  assert.deepEqual(actualHashes, expectedHashes);
});

test("Eric and Devon use Toni's latest wording exactly", () => {
  const content = getContentDefaults();

  assert.equal(
    content["stories.1.quote"],
    "In just 36 days, Eric completely turned his life around — a powerful reminder of what determination, partnership, and faith can accomplish.\n\nEric secured a full‑time job while continuing to drive for DoorDash to supplement his income. His hard work paid off, and he has now moved into permanent housing through the First Step Back Home program. We are incredibly grateful for this partnership and honored to walk alongside organizations that help our residents reclaim their independence."
  );
  assert.equal(
    content["stories.2.quote"],
    "Graduate alert!! our first graduate\n\nDevon’s story is such a clear picture of what can happen when someone is given stability, encouragement, and a safe place to breathe again.\n\nIn just one month, Devon made huge progress. He came to us after living in a tent for quite some time — carrying the weight, exhaustion, and isolation that come with long-term homelessness. But little by little, things began to shift.\n\nBy the time he graduated, he was smiling, laughing, working in a field he enjoys, and living in a stable place. That transformation is exactly why we do what we do.\n\nI truly believe the men who come to us often just need that extra little lift — and Devon is proof of what that lift can spark.\n\nWith God, we can do more — and Eric’s story is proof of that."
  );
});

test("older CMS rows cannot replace Toni's newly approved story copy", () => {
  const stale = mergeContentRows([
    {
      content_key: "stories.1.quote",
      value: "Old Eric story",
      updated_at: "2026-08-03T23:00:00.000Z",
    },
  ]);
  const laterEdit = mergeContentRows([
    {
      content_key: "stories.1.quote",
      value: "A future approved edit",
      updated_at: "2026-08-04T01:00:00.000Z",
    },
  ]);

  assert.match(stale["stories.1.quote"], /^In just 36 days,/);
  assert.equal(laterEdit["stories.1.quote"], "A future approved edit");
});

test("program descriptions match Toni's corrections and the Roadmap link works", async () => {
  const [pyramid, process, resources, oneAway, registry] = await Promise.all([
    read("../../components/Pyramid.jsx"),
    read("../../components/ProcessTimeline.jsx"),
    read("../../components/Resources.jsx"),
    read("../../components/OneAway.jsx"),
    read("../../lib/cms/contentRegistry.mjs"),
  ]);
  const combined = [pyramid, process, resources, oneAway, registry].join("\n");

  assert.match(pyramid, /Access to Nutritious Meals/);
  assert.match(process, /Residents have food available to prepare their own meals, and occasionally we will have a Meal Train, but daily hot meal service is not part of our program\./);
  assert.match(resources, /The Meal Train is used when volunteers choose to provide a meal, but residents are not served a hot meal every night\./);
  assert.match(resources, /linkUrl: "\/roadmap"/);
  assert.doesNotMatch(combined, /daily meal delivery|nightly hot meal delivery|nightly hot meals|life skills coaching classes|via program partnerships/i);
});

test("homepage story cards preserve paragraph breaks and hide empty date rows", async () => {
  const stories = await read("../../components/Stories.jsx");
  const styles = await read("../../app/globals.css");

  assert.match(stories, /Array\.from\(\{ length: 12 \}/);
  assert.match(stories, /\{s\.meta && <span>\{s\.meta\}<\/span>\}/);
  assert.match(styles, /\.story-body\s*\{[^}]*white-space:\s*pre-line;/s);
});

test("homepage vertical rhythm is tightened", async () => {
  const styles = await read("../../app/globals.css");
  const compactSections = [
    "narrative-container",
    "process-section",
    "stats-section",
    "pyramid-section",
    "volunteer-section",
    "stories-section",
    "oneaway-section",
  ];

  for (const className of compactSections) {
    const match = styles.match(new RegExp(`\\.${className}\\s*\\{[^}]*padding:\\s*([0-9.]+)rem 0;`, "s"));
    assert.ok(match, `Expected a vertical padding rule for .${className}`);
    assert.ok(Number(match[1]) <= 5, `Expected .${className} to use no more than 5rem vertical padding`);
  }
  assert.match(styles, /\.section-header\s*\{\s*margin-bottom:\s*2\.5rem;/);
});
