import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const donationSources = [
  "../../components/Header.jsx",
  "../../components/Hero.jsx",
  "../../components/DonateBanner.jsx",
  "../../components/faq/FaqPage.jsx",
  "../../components/roadmap/RoadmapPage.jsx",
  "../../components/memorial/memorialData.js",
];

const newDonationUrl =
  "https://www.zeffy.com/en-US/donation-form/donate-to-make-a-difference-16969";

test("every donation surface uses the approved one-time Zeffy form", async () => {
  const sources = await Promise.all(
    donationSources.map(async (path) => ({
      path,
      content: await readFile(new URL(path, import.meta.url), "utf8"),
    }))
  );

  for (const source of sources) {
    assert.match(source.content, new RegExp(newDonationUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), source.path);
    assert.doesNotMatch(source.content, /donate-to-make-a-difference-13369/, source.path);
  }
});
