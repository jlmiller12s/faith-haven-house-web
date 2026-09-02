import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const boardPath = new URL("../../components/staff/AdmissionsBoard.jsx", import.meta.url);
const controlsPath = new URL("../../components/staff/AdmissionsBoardScrollControls.jsx", import.meta.url);
const stylesPath = new URL("../../app/globals.css", import.meta.url);

test("the admissions board exposes accessible horizontal navigation above the rail", async () => {
  const [board, controls, styles] = await Promise.all([
    readFile(boardPath, "utf8"),
    readFile(controlsPath, "utf8"),
    readFile(stylesPath, "utf8"),
  ]);

  assert.match(board, /<AdmissionsBoardScrollControls targetRef={boardScrollRef} \/>/);
  assert.match(board, /className="admissions-board-scroll"[^>]*ref={boardScrollRef}/);
  assert.match(controls, /aria-label="Scroll admissions workflow stages"/);
  assert.match(controls, /aria-label="View earlier admissions stages"/);
  assert.match(controls, /aria-label="View later admissions stages"/);
  assert.match(controls, /ResizeObserver/);
  assert.match(styles, /\.admissions-board-scroll-controls/);
  assert.match(styles, /min-(?:width|height):\s*44px/);
});
