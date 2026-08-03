import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("homepage reports the corrected 122-day housing figure", async () => {
  const [hero, stats] = await Promise.all([
    read("../../components/Hero.jsx"),
    read("../../components/Stats.jsx"),
  ]);

  assert.match(hero, />122 Days</);
  assert.doesNotMatch(hero, />36 Days</);
  assert.match(stats, /target:\s*122/);
  assert.match(stats, /display:\s*"122"/);
});

test("both Roadmap support buttons open the published Zeffy campaign", async () => {
  const roadmap = await read("../../components/roadmap/RoadmapPage.jsx");
  const donationUrl = /https:\/\/www\.zeffy\.com\/en-US\/donation-form\/donate-to-make-a-difference-16969/;

  assert.match(roadmap, donationUrl);
  assert.equal(roadmap.match(/href=\{DONATE_URL\}/g)?.length, 2);
  assert.doesNotMatch(roadmap, /href="\/donate"/);
});

test("FAQ accurately presents the approved one-time Zeffy form", async () => {
  const faq = await read("../../components/faq/faqData.js");

  assert.match(faq, /secure one-time donation online/);
  assert.match(faq, /One-time online giving/);
  assert.doesNotMatch(faq, /currently configured for monthly giving/);
});
