import test from "node:test";
import assert from "node:assert/strict";
import { saveVolunteerApplication } from "./volunteer.mjs";

const application = { firstname: " Jane ", lastname: "Doe", email: "jane@example.org", phone: "555-0100", positions: ["Mentor"], skills: "Teaching", availability: "Weekends" };

test("valid applications are persisted before success, with normalized fields", async () => {
  let saved;
  const result = await saveVolunteerApplication(application, { from(table) {
    assert.equal(table, "volunteer_applications");
    return { async insert(row) { saved = row; return { error: null }; } };
  } });
  assert.equal(result.status, 201);
  assert.equal(saved.firstname, "Jane");
  assert.deepEqual(saved.positions, ["Mentor"]);
  assert.equal(saved.availability, "Weekends");
});

test("invalid applications never reach persistence", async () => {
  for (const input of [null, {}, { ...application, email: "invalid" }, { ...application, firstname: " " }, { ...application, positions: ["Invalid"] }, { ...application, skills: "x".repeat(5001) }]) {
    const result = await saveVolunteerApplication(input, { from() { assert.fail("Invalid input reached database"); } });
    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
  }
});

test("database failure never reports success or exposes applicant information", async () => {
  await assert.rejects(saveVolunteerApplication(application, { from() { return { async insert() { return { error: { message: "private database details" } }; } }; } }), { message: "Volunteer application could not be saved" });
});
