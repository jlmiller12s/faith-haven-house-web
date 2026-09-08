import test from "node:test";
import assert from "node:assert/strict";
import { deleteVolunteerApplication } from "./volunteerDeletion.mjs";

const id = "b7c31be5-cbac-4e7a-9452-22b76b3d95da";
const staff = { isActive: true, role: "super_admin", mfaRequired: true, assuranceLevel: "aal2" };
test("deletion rejects unauthorized and incomplete MFA sessions before opening the admin client", async () => {
  for (const profile of [null, { ...staff, isActive: false }, { ...staff, role: "case_manager" }, { ...staff, assuranceLevel: "aal1" }]) {
    const result = await deleteVolunteerApplication({ id, staff: profile, createAdminClient() { assert.fail("Unauthorized database access"); } });
    assert.equal(result.ok, false);
  }
});
test("deletion rejects malformed IDs before opening the admin client", async () => {
  const result = await deleteVolunteerApplication({ id: "invalid", staff, createAdminClient() { assert.fail("Invalid database access"); } });
  assert.equal(result.ok, false);
});
test("leadership deletes only the selected application and confirms database success", async () => {
  for (const role of ["super_admin", "executive_director"]) {
    const result = await deleteVolunteerApplication({ id, staff: { ...staff, role }, createAdminClient() {
      return { from(table) { assert.equal(table, "volunteer_applications"); return { delete() { return { eq(column, value) {
        assert.equal(column, "id"); assert.equal(value, id);
        return { async select(columns) { assert.equal(columns, "id"); return { data: [{ id }], error: null }; } };
      } }; } }; } };
    } });
    assert.equal(result.ok, true);
  }
});
test("database errors and missing records never report deletion success", async () => {
  for (const response of [{ data: null, error: { message: "private details" } }, { data: [], error: null }]) {
    const result = await deleteVolunteerApplication({ id, staff, createAdminClient() {
      return { from() { return { delete() { return { eq() { return { async select() { return response; } }; } }; } }; } };
    } });
    assert.equal(result.ok, false);
    assert.ok(!result.error.includes("private details"));
  }
});
