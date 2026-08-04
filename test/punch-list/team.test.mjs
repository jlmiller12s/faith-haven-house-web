import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("team page defaults to grid view", async () => {
  const source = await readFile(new URL("../../components/team/TeamPage.jsx", import.meta.url), "utf8");
  assert.match(source, /useState\("grid"\)/);
});

test("team order begins with Dareth, then Book, and includes HJ Hohensee", async () => {
  const source = await readFile(new URL("../../components/team/TeamPage.jsx", import.meta.url), "utf8");
  const orderStart = source.indexOf("const TEAM_ORDER");
  const order = source.slice(orderStart, source.indexOf("];", orderStart));
  const dareth = order.indexOf('"dareth-jeffers"');
  const book = order.indexOf('"marshall-robinson"');
  const hj = order.indexOf('"hj-hohensee"');

  assert.ok(dareth >= 0);
  assert.ok(book > dareth);
  assert.ok(hj > book);
});

test("team page publishes HJ Hohensee's approved profile", async () => {
  const source = await readFile(new URL("../../components/team/TeamPage.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /Lorem ipsum/i);
  assert.doesNotMatch(source, /Bio and photo forthcoming/);
  assert.match(source, /Vice President, Board of Directors/);
  assert.match(source, /\/assets\/hj-hohensee\.webp/);
  assert.match(source, /experienced homelessness for nearly two years/);
});

test("team modal preserves the full portrait instead of cropping it", async () => {
  const css = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.team-modal-img\s*\{[^}]*object-fit:\s*contain/s);
});
