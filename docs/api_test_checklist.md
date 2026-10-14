# CrimeVault - API Testing Checklist

**Purpose:** Record API test cases, actual results, failures, and Oracle persistence verification.

**Test date:** 15 October 2026
**Backend base URL:** `http://localhost:8080`
**Environment:** Local development environment; Oracle connectivity and persistence are not verified.

**Rule:** Do not mark a test as passed until the actual response has been checked. Where the HTTP status was not explicitly captured, that limitation is stated.

---

## 1. Pre-testing Checks

- [x] Confirm the backend is running.
- [ ] Confirm each endpoint is ready for testing with the backend owner.
- [x] Review the current controller and model behavior.
- [x] Confirm the local backend URL.
- [x] Record the test date and environment.
- [x] Use fictional development test data.

**Environment notes:**

- Java 21 is installed.
- The Maven Wrapper is located in the `backend` directory.
- The Maven test command completed with `BUILD SUCCESS`.
- Surefire reported one test run, zero failures, zero errors and zero skipped tests.
- Oracle connectivity has not been verified.
- The running server returned `405 Method Not Allowed` for Investigator POST/PUT and Cases DELETE.

---

## 2. Cases API Tests

### GET `/api/cases`

- [x] Retrieve the list of cases.
- [x] Record the returned fields and sample response.
- [ ] Verify returned records directly against Oracle.
- [ ] Confirm the endpoint behavior when the database contains no records.

**Recorded result:** The endpoint returned two case records. The response included case IDs, case numbers, titles, descriptions, case types, priorities, statuses, locations, dates and outcomes.

**Status:** Passed for basic API retrieval; database source unverified.

### GET `/api/cases/{id}`

- [x] Retrieve a known existing case.
- [x] Try an unknown case ID.
- [x] Try invalid ID `0`.
- [x] Record the responses.

**Recorded results:**

- `GET /api/cases/1` returned the case with ID `1`.
- `GET /api/cases/99999` returned HTTP `404`.
- `GET /api/cases/0` returned HTTP `400`.

**Status:** Passed for the tested API behaviors.

### POST `/api/cases`

- [x] Create a case with valid fictional data.
- [x] Check the returned record and generated ID.
- [x] Test an empty request body.
- [x] Test missing required fields.
- [x] Test a duplicate case number.
- [x] Test invalid date ordering.
- [ ] Test every field-length boundary.
- [ ] Verify creation directly in Oracle.

**Recorded results:**

- Empty JSON body `{}` returned HTTP `400`.
- A duplicate case number returned HTTP `409`.
- A request missing the required title returned HTTP `400`.
- A request with `dateOpened` earlier than `dateReported` was confirmed by the user to return the expected error.
- A valid fictional test case was returned with generated ID `3` and case number `CV-TEST-20261015-01`. The HTTP status was not explicitly captured in the supplied output.
- `GET /api/cases/3` returned the newly created case.

**Status:** Passed for the tested API-level scenarios; Oracle persistence unverified.

### PUT `/api/cases/{id}`

- [x] Update an existing case.
- [x] Confirm the intended fields changed.
- [x] Verify other fields remained intact.
- [x] Try updating an unknown ID.
- [ ] Test all invalid field values.
- [ ] Verify the update directly in Oracle.

**Recorded results:**

- Updating case ID `3` returned the updated record. The HTTP status was not explicitly captured.
- A subsequent GET showed the updated title and priority while preserving the case number, case type, location and reported date.
- Updating nonexistent case ID `99999` returned HTTP `404`.

**Status:** Passed for the tested API-level scenarios; Oracle persistence unverified.

### DELETE `/api/cases/{id}`

- [x] Attempt deletion using fictional test case ID `3`.
- [x] Check whether the record remained available.
- [ ] Retest after backend-owner investigation.
- [ ] Verify the deletion and related-record constraints if DELETE is supported by the agreed contract.

**Recorded result:**

- `DELETE /api/cases/3` returned HTTP `405 Method Not Allowed`.
- `GET /api/cases/3` still returned the case.

**Status:** Failed - see BUG-004 in `docs/bug_log.md`.

---

## 3. Investigators API Tests

### GET `/api/investigators`

- [x] Retrieve the investigators list.
- [x] Check the returned fields.
- [ ] Verify records directly against Oracle.

**Recorded result:** Two investigator records were returned. The response included investigator ID, name, badge number, department, rank, contact and email.

**Status:** Passed for basic API retrieval; database source unverified.

### GET `/api/investigators/{id}`

- [x] Retrieve a known investigator.
- [x] Try invalid ID `0`.
- [x] Try unknown ID `99999`.
- [x] Record both error responses.

**Recorded results:**

- `GET /api/investigators/1` returned investigator ID `1`.
- `GET /api/investigators/0` returned HTTP `400`.
- `GET /api/investigators/99999` returned HTTP `404`.

**Status:** Passed for the tested API behaviors.

### POST `/api/investigators`

- [x] Attempt creation with investigator JSON data.
- [x] Record the HTTP response.
- [ ] Retest after the backend owner investigates the runtime routing issue.
- [ ] Verify creation and generated ID when the endpoint becomes available.

**Recorded result:**

- A valid investigator creation request returned HTTP `405 Method Not Allowed`.
- `OPTIONS /api/investigators` returned HTTP `200` and advertised `GET, HEAD, OPTIONS`.

**Status:** Failed - see BUG-001 in `docs/bug_log.md`.

### PUT `/api/investigators/{id}`

- [x] Attempt updating investigator ID `1`.
- [x] Record the HTTP response.
- [ ] Retest after the backend owner investigates the runtime routing issue.
- [ ] Verify field preservation after a successful update.

**Recorded result:**

- A PUT request to `/api/investigators/1` with a valid update body returned HTTP `405 Method Not Allowed`.
- `OPTIONS /api/investigators` returned HTTP `200` and advertised `GET, HEAD, OPTIONS`.

**Status:** Failed - see BUG-002 in `docs/bug_log.md`.

---

## 4. Frontend Integration Tests

- [ ] Confirm the frontend sends requests to the intended API URL.
- [ ] Inspect requests and responses in the browser Network tab.
- [ ] Confirm successful API responses update the UI.
- [ ] Confirm API errors are handled correctly.
- [ ] Confirm demo data is not mistaken for backend data.
- [ ] Refresh the page and check the data source.
- [ ] Repeat tests for each module when its API is ready.

**Current status:** The compatibility report has been created, but complete frontend-to-API workflows have not been verified.

---

## 5. Oracle Persistence Tests

Perform these tests only after the backend owner confirms that the endpoint is connected to Oracle and ready for database verification.

- [ ] Confirm the actual Oracle connection and schema.
- [ ] Create a fictional test record through a database-backed API.
- [ ] Verify the record directly in Oracle.
- [ ] Update the record and verify the database change.
- [ ] Restart the backend.
- [ ] Retrieve the record again and verify that the change persists.
- [ ] Check that invalid requests do not create unintended records.
- [ ] Record the evidence and test environment.

**Current status:** Blocked pending confirmation of Oracle connectivity and database-backed endpoint readiness.

**Important:** Successful API requests do not prove that records are stored in Oracle.

---

## 6. Test Result Log

| Test ID | Endpoint | Scenario | Expected result | Actual result | Result | Oracle verified? | Notes |
|---|---|---|---|---|---|---|---|
| CASE-001 | `GET /api/health` | Health check | Backend UP | UP returned | Passed | No | Backend responds |
| CASE-002 | `GET /api/cases` | Retrieve all cases | Case list | Two cases returned | Passed | No | Data source unverified |
| CASE-003 | `GET /api/cases/1` | Existing ID | HTTP 200 | Case returned | Passed | No | HTTP status not explicitly captured |
| CASE-004 | `GET /api/cases/99999` | Unknown ID | HTTP 404 | 404 | Passed | No | |
| CASE-005 | `GET /api/cases/0` | Invalid ID | HTTP 400 | 400 | Passed | No | |
| CASE-006 | `POST /api/cases` | Empty body | HTTP 400 | 400 | Passed | No | |
| CASE-007 | `POST /api/cases` | Duplicate case number | HTTP 409 | 409 | Passed | No | |
| CASE-008 | `POST /api/cases` | Valid fictional record | HTTP 201 | Case ID 3 returned | Passed - response observed | No | HTTP status not explicitly captured |
| CASE-009 | `GET /api/cases/3` | Retrieve created case | Matching record | Matching record returned | Passed | No | |
| CASE-010 | `PUT /api/cases/3` | Valid update | HTTP 200 | Updated record returned | Passed - response observed | No | HTTP status not explicitly captured |
| CASE-011 | `GET /api/cases/3` | Field preservation | Unchanged fields retained | Expected fields remained intact | Passed | No | |
| CASE-012 | `PUT /api/cases/99999` | Update unknown ID | HTTP 404 | 404 | Passed | No | |
| CASE-013 | `POST /api/cases` | Missing title | HTTP 400 | 400 | Passed | No | |
| CASE-014 | `POST /api/cases` | Invalid date ordering | HTTP 400 expected | User confirmed expected error | Passed - user-confirmed | No | Original response not retained in this log |
| CASE-015 | `DELETE /api/cases/3` | Delete fictional test case | HTTP 204; subsequent GET 404 | HTTP 405; case remained | Failed | No | BUG-004 |
| INV-001 | `GET /api/investigators` | Retrieve all | Investigator list | Two records returned | Passed | No | Data source unverified |
| INV-002 | `GET /api/investigators/1` | Existing ID | HTTP 200 | Investigator returned | Passed | No | HTTP status not explicitly captured |
| INV-003 | `GET /api/investigators/0` | Invalid ID | HTTP 400 | 400 | Passed | No | |
| INV-004 | `GET /api/investigators/99999` | Unknown ID | HTTP 404 | 404 | Passed | No | |
| INV-005 | `POST /api/investigators` | Valid creation body | HTTP 201 expected | HTTP 405 | Failed | No | BUG-001 |
| INV-006 | `PUT /api/investigators/1` | Valid update body | HTTP 200 expected | HTTP 405 | Failed | No | BUG-002 |

---

## 7. Automated Tests

**Command used:**

`.\backend\mvnw.cmd -f backend\pom.xml test`

**Recorded output:**

- Build result: `BUILD SUCCESS`
- Test set: `com.crimevault.BackendApplicationTests`
- Tests run: 1
- Failures: 0
- Errors: 0
- Skipped: 0

**Interpretation:** The one reported automated test passed. This does not establish that every endpoint or Oracle persistence has been tested.

---

## 8. Final Verification Rules

- A route existing in source code does not prove it works.
- A successful HTTP response does not prove Oracle persistence.
- Data visible in the frontend may be demo data.
- Record actual results rather than assuming expected results occurred.
- Record any unobserved HTTP status as not explicitly captured.
- Report reproducible bugs with steps and evidence.
- Do not change backend implementation or schema without coordinating with the backend owner.
- Retest issues after the backend owner confirms a fix.
- Do not declare the application fully verified until the required API, frontend integration and Oracle persistence tests have been completed.


