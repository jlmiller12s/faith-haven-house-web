import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const migrationsDir = path.resolve("supabase/migrations");

test("database migrations seed the intake document catalog used by the portal", async () => {
  const migrationFiles = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql"));
  const sql = (
    await Promise.all(
      migrationFiles.map((file) => readFile(path.join(migrationsDir, file), "utf8")),
    )
  ).join("\n");

  for (const documentNumber of [
    "FHH-INT-001",
    "FHH-INT-002",
    "FHH-INT-003",
    "FHH-INT-004",
    "FHH-ADM-001",
    "FHH-ADM-002",
    "FHH-ADM-003",
    "FHH-ADM-004",
  ]) {
    assert.match(sql, new RegExp(`INSERT[\\s\\S]*${documentNumber}`, "i"));
  }
});

test("each case can have only one status row per document type", async () => {
  const migrationFiles = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql"));
  const sql = (
    await Promise.all(
      migrationFiles.map((file) => readFile(path.join(migrationsDir, file), "utf8")),
    )
  ).join("\n");

  assert.match(
    sql,
    /UNIQUE\s*\(\s*admissions_case_id\s*,\s*document_type_id\s*\)/i,
  );
});

