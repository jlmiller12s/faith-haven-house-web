import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL(
  "../../supabase/migrations/20260708020000_create_prescreen_admissions.sql",
  import.meta.url
);

test("migration creates the missing admission tables and atomic RPC", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  for (const table of [
    "applicants",
    "admissions_cases",
    "prescreen_submissions",
    "tasks",
    "activity_events",
  ]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table}`, "i"));
  }
  assert.match(sql, /create or replace function public\.create_prescreen_admission/i);
  const prescreenTable = sql.match(
    /create table if not exists public\.prescreen_submissions \(([\s\S]*?)\n\);/i
  )?.[1];
  const prescreenInsert = sql.match(
    /insert into public\.prescreen_submissions \(([\s\S]*?)\n  \) values/i
  )?.[1];
  assert.match(prescreenTable ?? "", /admissions_case_id uuid[^,]*references public\.admissions_cases\(id\)/i);
  assert.match(prescreenInsert ?? "", /admissions_case_id/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /grant execute on function public\.create_prescreen_admission\(jsonb\) to service_role/i);
  assert.doesNotMatch(sql, /app-|case-|staff-3|ps-|t-/i);
});

test("migration protects applicant data with row-level security", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /alter table public\.applicants enable row level security/i);
  assert.match(sql, /to authenticated/i);
  assert.match(sql, /public\.get_auth_role\(\)/i);
  assert.match(sql, /revoke execute on function public\.create_prescreen_admission\(jsonb\) from public, anon, authenticated/i);
});
