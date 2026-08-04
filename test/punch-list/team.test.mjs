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

test("Mike Keller's approved three-paragraph biography is published verbatim", async () => {
  const source = await readFile(new URL("../../components/team/TeamPage.jsx", import.meta.url), "utf8");
  const approvedBio = [
    "Mike Keller retired and moved to Missouri with his wife, Susan, in 2019 to be closer to their three children, who now live in St. Charles County and Chicago. He earned a degree in Business Administration from the University of Nebraska at Kearney and built a career spanning public accounting, banking, manufacturing accounting, and project management.",
    "Alongside his professional work, God called Mike to a lifetime of service. Over many summers, he partnered with nonprofit ministries in eight states and three Central American countries, helping lead construction and evangelism projects. He also invested 20 years serving with UrbanPromise in Wilmington, Delaware, equipping and encouraging young people and their communities.",
    "Mike is an active member of Element Church in Wentzville, where he serves as a small group leader, facilities volunteer, and community service volunteer. At Faith Haven House, he brings decades of financial expertise, practical leadership, and a servant’s heart to help advance the ministry’s mission.",
  ];

  for (const paragraph of approvedBio) {
    assert.equal(source.includes(paragraph), true);
  }
});

test("team modal preserves the full portrait instead of cropping it", async () => {
  const css = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.team-modal-img\s*\{[^}]*object-fit:\s*contain/s);
});
