import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("partner squares are buttons with expandable detail state", async () => {
  const source = await readFile(new URL("../../components/Partners.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /togglePartner\(p\.name\)/);
  assert.match(source, /partner-card-details/);
  assert.match(styles, /\.partner-card-details\[hidden\]\s*\{\s*display:\s*none;/);
  assert.doesNotMatch(styles, /\.partner-card-button\s*\{[^}]*align-self:\s*start;/s);
});

test("About Faith Haven House is the first FAQ category", async () => {
  const source = await readFile(new URL("../../components/faq/FaqPage.jsx", import.meta.url), "utf8");
  const about = source.indexOf('"About Faith Haven House"');
  const program = source.indexOf('"Program & Residency"');
  assert.ok(about >= 0 && about < program);
});

test("donation FAQ renders numbered instructions", async () => {
  const page = await readFile(new URL("../../components/faq/FaqPage.jsx", import.meta.url), "utf8");
  const data = await readFile(new URL("../../components/faq/faqData.js", import.meta.url), "utf8");
  assert.match(page, /faq-answer-steps/);
  assert.match(data, /steps:\s*\[/);
});
