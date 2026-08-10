// Browser-level QA for the protected RAP portal.
const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright-core");

const baseUrl = process.env.RAP_TEST_BASE_URL || "http://127.0.0.1:3006";
const expectedStages = [
  "Pre-screen",
  "Background check",
  "Interview & intake",
  "Committee review",
  "Welcome Day",
  "Admitted",
  "Closed",
];
const demoCaseId = "31a60a30-cea9-4fc8-b7d1-a5c0f8d6230e";
const demoStaffId = "e967f687-d8d8-4d8f-9d26-91c88238115f";
const demoDatabase = {
  documentTypes: [],
  staff: [{ id: demoStaffId, first_name: "Jamie", last_name: "Coordinator", role: "admissions_coordinator" }],
  applicants: [{ id: "applicant-1", legal_first_name: "Test", legal_last_name: "Applicant", phone: "636-555-0100", email: "test@example.org", referral_source: "Community partner" }],
  cases: [{ id: demoCaseId, caseNumber: "FHH-ADM-2026-000001", status: "pre_screen_received", applicantId: "applicant-1", assignedCoordinatorId: demoStaffId, createdAt: "2026-08-10T12:00:00.000Z" }],
  prescreens: [{ id: "prescreen-1", admissions_case_id: demoCaseId, applicant_id: "applicant-1", reviewed_at: null }],
  screenings: [],
  documents: [],
  interviews: [],
  clinical: [],
  decisions: [],
  welcome: [],
  tasks: [{ id: "task-1", admissions_case_id: demoCaseId, title: "Review pre-screen answers", description: "Confirm the applicant is ready for staff follow-up.", status: "todo", priority: "high" }],
  notes: [],
  events: [],
  audit: [],
  electronicForms: [],
};

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.RAP_BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  await page.route("**/_vercel/insights/script.js", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  const consoleErrors = [];
  const pageErrors = [];
  const httpErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.stack || error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript((database) => {
    localStorage.setItem("rap-portal-tour-complete:local-demo-admin", "1");
    window.global = window;
    window.mockDatabase = structuredClone(database);
  }, demoDatabase);

  const openPage = async (target, url) => {
    await target.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await target.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  };

  process.stdout.write("Checking admissions board…\n");
  await openPage(page, `${baseUrl}/staff/admissions`);
  process.stdout.write(`Resolved URL: ${page.url()}\n`);
  process.stdout.write(`Headings: ${JSON.stringify(await page.locator("h1, h2").allTextContents())}\n`);
  await page.getByRole("heading", { name: "Admissions board" }).waitFor();
  assert.equal(await page.locator(".admissions-stage").count(), 7);
  assert.deepEqual(await page.locator(".admissions-stage h2").allTextContents(), expectedStages);
  assert.equal(await page.getByLabel("Search applicants").isVisible(), true);
  assert.equal(await page.getByLabel("Assignment").isVisible(), true);
  await page.getByRole("heading", { name: "Test Applicant" }).waitFor();
  await page.locator(".admissions-case-checks select").nth(0).selectOption("yes");
  await page.getByText("Pre-screen updated for Test Applicant.").waitFor();
  await page.locator(".admissions-case-checks select").nth(1).selectOption("yes");
  await page.getByText("Background check updated for Test Applicant.").waitFor();
  await page.locator(".admissions-stage-select select").selectOption("background_check");
  await page.getByText("Test Applicant moved to Background check.").waitFor();
  await page.screenshot({ path: path.join(os.tmpdir(), "rap-admissions-board.png"), fullPage: true });

  process.stdout.write("Checking task actions…\n");
  await openPage(page, `${baseUrl}/staff/admissions/${demoCaseId}`);
  process.stdout.write(`Case headings: ${JSON.stringify(await page.locator("h1, h2").allTextContents())}\n`);
  process.stdout.write(`Case buttons: ${JSON.stringify(await page.getByRole("button").allTextContents())}\n`);
  process.stdout.write(`Case console errors: ${JSON.stringify(consoleErrors)}\n`);
  process.stdout.write(`Case page errors: ${JSON.stringify(pageErrors)}\n`);
  await page.getByRole("button", { name: "CRM Tasks" }).click();
  const taskCheckbox = page.getByLabel("Complete task: Review pre-screen answers");
  await taskCheckbox.check();
  await page.getByText("Task marked complete.").waitFor();
  await page.locator('input[placeholder="Task action summary..."]').fill("Call applicant");
  await page.locator('textarea[placeholder="Add details..."]').fill("Confirm a safe callback time.");
  await page.getByRole("button", { name: "Add Task to File" }).click();
  await page.getByText("Task added to the applicant file.").waitFor();

  process.stdout.write("Checking document library…\n");
  await openPage(page, `${baseUrl}/staff/intake-documents`);
  await page.getByRole("heading", { name: "Intake & Admissions Documents" }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Complete online" }).count(), 8);
  assert.equal(await page.getByRole("link", { name: "Download Word form" }).count(), 8);

  process.stdout.write("Checking electronic form…\n");
  await openPage(page, `${baseUrl}/staff/intake-documents/FHH-8.2`);
  await page.getByRole("heading", { name: "Background Check Acknowledgment" }).waitFor();
  assert.equal(await page.getByLabel("Applicant file").isVisible(), true);
  assert.equal(await page.getByText("Purpose", { exact: true }).isVisible(), true);
  await page.getByLabel("Applicant file").selectOption(demoCaseId);
  await page.getByRole("button", { name: "Save draft" }).waitFor();
  await page.getByRole("button", { name: "Complete form" }).click();
  await page.getByText(/Complete the .* required fields highlighted below/).waitFor();
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.getByText("Draft saved. You can return and finish it later.").waitFor();
  await page.screenshot({ path: path.join(os.tmpdir(), "rap-electronic-form.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.setDefaultTimeout(15000);
  await mobile.route("**/_vercel/insights/script.js", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await mobile.addInitScript((database) => {
    localStorage.setItem("rap-portal-tour-complete:local-demo-admin", "1");
    window.global = window;
    window.mockDatabase = structuredClone(database);
  }, demoDatabase);
  mobile.on("response", (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });
  process.stdout.write("Checking mobile layout…\n");
  await openPage(mobile, `${baseUrl}/staff/admissions`);
  await mobile.getByRole("heading", { name: "Admissions board" }).waitFor();
  assert.equal(await mobile.locator(".admissions-board-scroll").isVisible(), true);
  await mobile.screenshot({ path: path.join(os.tmpdir(), "rap-admissions-mobile.png"), fullPage: true });

  if (consoleErrors.length || httpErrors.length || pageErrors.length) {
    process.stdout.write(`Console errors: ${JSON.stringify(consoleErrors)}\n`);
    process.stdout.write(`HTTP errors: ${JSON.stringify(httpErrors)}\n`);
    process.stdout.write(`Page errors: ${JSON.stringify(pageErrors)}\n`);
  }
  assert.deepEqual(httpErrors, []);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(pageErrors, []);
  await browser.close();
  process.stdout.write("RAP portal browser smoke test passed.\n");
})().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exit(1);
});
