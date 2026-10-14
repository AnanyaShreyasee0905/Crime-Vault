# CrimeVault - Bug Log

**Project:** CrimeVault - Crime Case & Evidence Management System
**Last updated:** 15 October 2026
**Purpose:** Record reproducible API, frontend integration and database verification issues.

## Status definitions

- **Open:** An issue has been observed and remains unresolved.
- **In Progress:** Investigation or a fix is underway.
- **Fixed:** A change intended to resolve the issue has been made.
- **Retested - Passed:** The relevant test was rerun and passed.
- **Blocked:** Verification cannot proceed because a dependency or approval is missing.
- **Needs Investigation:** An unexpected result occurred, but the cause is unknown.

---

## BUG-001 - Investigator POST returns HTTP 405

- **Date discovered:** 15 October 2026
- **Module:** Investigators
- **Endpoint:** `POST /api/investigators`
- **Severity:** High for Investigator creation; overall project severity not assigned.
- **Steps to reproduce:**
  1. Start the currently running CrimeVault backend.
  2. Send a POST request to `http://localhost:8080/api/investigators`.
  3. Use a valid investigator JSON body, including name, badge number, department, rank, contact and email.
  4. Record the HTTP status and response headers.
- **Expected result:** Successful valid creation should return HTTP `201 Created`, according to the current controller behavior.
- **Actual result:** HTTP `405 Method Not Allowed`.
- **Additional evidence:** `OPTIONS /api/investigators` returned HTTP `200` with `Allow: GET, HEAD, OPTIONS`.
- **Reproducible:** Yes - reproduced again during current testing.
- **Status:** Open - backend investigation required.
- **Retest result:** Failed - POST still returns HTTP `405`.
- **Owner:** Backend/database lead.
- **Notes:** The inspected controller source contains a POST mapping, but the running server rejects POST. The cause has not been established.

---

## BUG-002 - Investigator PUT returns HTTP 405

- **Date discovered:** 15 October 2026
- **Module:** Investigators
- **Endpoint:** `PUT /api/investigators/1`
- **Severity:** High for Investigator updates; overall project severity not assigned.
- **Steps to reproduce:**
  1. Start the currently running CrimeVault backend.
  2. Send a PUT request to `http://localhost:8080/api/investigators/1`.
  3. Use a valid investigator JSON body with `investigatorId` matching the path ID.
  4. Record the HTTP status and response headers.
- **Expected result:** A valid update should return HTTP `200 OK`, according to the current controller behavior.
- **Actual result:** HTTP `405 Method Not Allowed`.
- **Additional evidence:** `OPTIONS /api/investigators` returned HTTP `200` with `Allow: GET, HEAD, OPTIONS`.
- **Reproducible:** Yes - reproduced again during current testing.
- **Status:** Open - backend investigation required.
- **Retest result:** Failed - PUT still returns HTTP `405`.
- **Owner:** Backend/database lead.
- **Notes:** The inspected controller source contains a PUT mapping, but the running server rejects PUT. The cause has not been established.

---

## BUG-003 - Oracle persistence has not been verified

- **Date discovered:** 15 October 2026
- **Module:** Backend/database integration
- **Endpoints:** Cases and Investigators write operations; database-backed readiness requires confirmation.
- **Severity:** Release-blocking verification gap; not yet a confirmed implementation defect.
- **Steps to reproduce:** Not applicable as a failure reproduction. This is an outstanding verification item.
- **Expected result:** For endpoints confirmed as database-backed and ready for testing:
  1. Create or update a fictional test record.
  2. Verify the corresponding row directly in Oracle.
  3. Restart the backend.
  4. Retrieve the record again and confirm that the change persists.
- **Actual result:** Successful API responses and retrievals have been observed, but independent Oracle persistence and persistence-after-restart have not been established.
- **Reproducible:** Not applicable; verification is outstanding.
- **Status:** Blocked pending backend-owner confirmation that the relevant endpoints are database-backed and ready.
- **Retest result:** Pending.
- **Owner:** Backend/database lead for implementation readiness; testing lead for independent verification.

---

## BUG-004 - Cases DELETE returns HTTP 405

- **Date discovered:** 15 October 2026
- **Module:** Cases
- **Endpoint:** `DELETE /api/cases/3`
- **Test data:** Fictional test case `CV-TEST-20261015-01`.
- **Severity:** High for case deletion; overall project severity not assigned.
- **Steps to reproduce:**
  1. Create the fictional test case through `POST /api/cases`.
  2. Send a DELETE request to `http://localhost:8080/api/cases/3`.
  3. Record the HTTP response.
  4. Send `GET /api/cases/3` to check whether the record remains.
- **Expected result:** If deletion is supported by the agreed API contract and no constraints prevent it, the endpoint should return HTTP `204 No Content`, and the subsequent GET should return HTTP `404 Not Found`.
- **Actual result:** DELETE returned HTTP `405 Method Not Allowed`. The subsequent GET still returned case ID `3`.
- **Additional evidence:** `OPTIONS /api/cases` returned HTTP `200` with `Allow: GET, HEAD, POST, OPTIONS`. However, `PUT /api/cases/3` succeeded in a separate test, so this header alone does not establish the behavior of every route.
- **Reproducible:** Yes - observed during current testing.
- **Status:** Open - backend investigation required.
- **Retest result:** Failed - DELETE returned HTTP `405`; record remained available through GET.
- **Owner:** Backend/database lead.
- **Notes:** Confirm whether DELETE is included in the agreed API contract and investigate the runtime method mapping. No backend changes have been made by the testing lead.

---

## Additional observations

- A successful GET response does not establish that the returned data came from Oracle.
- The Investigator POST/PUT runtime discrepancy remains unexplained.
- The Cases DELETE method is not working in the tested runtime.
- Other frontend modules have demo-backed workflows. Track them as integration work unless a specific incorrect behavior is reproduced.
- Do not mark an issue Fixed or Retested - Passed without running the relevant verification again.
- Do not include database passwords or private credentials in this file.

---

## Future bug entry template

### BUG-XXX - Short descriptive title

- **Date discovered:**
- **Module:**
- **Endpoint or page:**
- **Severity:**
- **Steps to reproduce:**
- **Expected result:**
- **Actual result:**
- **HTTP status / sanitized error:**
- **Reproducible:**
- **Status:**
- **Retest result:**
- **Owner:**
