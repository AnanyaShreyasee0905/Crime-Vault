\# CrimeVault — Endpoint Inventory



\*\*Purpose:\*\* Document existing API routes, frontend dependencies, and testing status.



\*\*Important:\*\* Routes found in source code are not automatically verified as working or connected to Oracle.



\## 1. Cases API



| Method | Endpoint | Purpose | Current status |

|---|---|---|---|

| GET | `/api/cases` | Retrieve all cases | Route found; testing pending |

| GET | `/api/cases/{id}` | Retrieve one case | Route found; testing pending |

| POST | `/api/cases` | Create a case | Route found; testing and persistence verification pending |

| PUT | `/api/cases/{id}` | Update a case | Route found; testing and persistence verification pending |

| DELETE | `/api/cases/{id}` | Delete a case | Route found; testing and persistence verification pending |



\## 2. Investigators API



| Method | Endpoint | Purpose | Current status |

|---|---|---|---|

| GET | `/api/investigators` | Retrieve all investigators | Route found; testing pending |

| GET | `/api/investigators/{id}` | Retrieve one investigator | Route found; testing pending |

| POST | `/api/investigators` | Register an investigator | Route found; testing and persistence verification pending |

| PUT | `/api/investigators/{id}` | Update an investigator | Route found; testing and persistence verification pending |



\## 3. Other Modules



| Method | Endpoint | Current status |

|---|---|---|

| GET | `/api/health` | Previously reported; current controller mapping needs confirmation |

| GET | `/api/people` | Not found in the controller folder scanned; confirmation required |

| GET | `/api/evidence` | Not found in the controller folder scanned; confirmation required |

| POST | `/api/custody-records` | Not found in the controller folder scanned; confirmation required |

| GET | `/api/cases/{id}/events` | Not found in the controller folder scanned; confirmation required |



Note: The scan covered only `backend/src/main/java/com/crimevault/controller`. Routes may be declared elsewhere.



\## 4. Verification Checklist



\- \[ ] Confirm the API contract with the backend owner.

\- \[ ] Record exact request and response JSON.

\- \[ ] Confirm required fields and validation rules.

\- \[ ] Test successful GET requests.

\- \[ ] Test successful POST requests.

\- \[ ] Test successful PUT requests.

\- \[ ] Test error cases and unknown IDs.

\- \[ ] Test DELETE behaviour if supported and approved.

\- \[ ] Verify frontend requests and responses.

\- \[ ] Verify records in Oracle.

\- \[ ] Verify persistence after restarting the backend.



\## 5. Questions Pending Confirmation



1\. Which endpoints are currently connected to Oracle?

2\. Which endpoints still use in-memory storage, if any?

3\. What are the exact request and response formats?

4\. What are the expected HTTP status codes and error formats?

5\. What validation and relational constraints apply?

6\. Which endpoints are ready for testing?

7\. How can database persistence be independently verified?



\## 6. Current Conclusion



The source scan found five Cases routes and four Investigators routes. Runtime behaviour, API contract correctness, and Oracle persistence have not yet been fully verified.





\## 7. Controller-Level Findings



\### Cases Controller



\- Base route: `/api/cases`

\- Operations found: GET all, GET by ID, POST, PUT by ID, DELETE by ID.

\- Required fields checked: caseNumber, title, caseType, priority, status, dateReported.

\- Case number duplication is handled with HTTP 409 Conflict.

\- Invalid input can return HTTP 400 Bad Request.

\- Missing cases can return HTTP 404 Not Found.

\- Successful creation returns HTTP 201 Created.

\- Successful update returns HTTP 200 OK.

\- Successful deletion returns HTTP 204 No Content.

\- Some database constraint violations return HTTP 409 Conflict.



\### Investigators Controller



\- Base route: `/api/investigators`

\- Operations found: GET all, GET by ID, POST, PUT by ID.

\- Required field checked: name.

\- New investigator IDs must not be supplied in the POST request.

\- Duplicate badge numbers are handled with HTTP 409 Conflict.

\- Invalid input can return HTTP 400 Bad Request.

\- Missing investigators can return HTTP 404 Not Found.

\- Successful creation returns HTTP 201 Created.

\- Successful update returns HTTP 200 OK.

\- No DELETE mapping was found in this controller.



\### Pending Verification



\- Inspect CaseStore and InvestigatorStore to identify the persistence mechanism.

\- Confirm model field names and data types.

\- Confirm the actual Oracle schema and column mappings.

\- Test request and response bodies through HTTP.

\- Verify Oracle persistence independently.



\### Runtime Discrepancy — Investigators API



\- `GET /api/investigators` returned investigator records during testing.

\- `POST /api/investigators` returned HTTP 405 Method Not Allowed.

\- `PUT /api/investigators/1` returned HTTP 405 Method Not Allowed.

\- Runtime OPTIONS response advertised GET, HEAD, and OPTIONS.

\- POST and PUT mappings were present in the inspected controller source and compiled class.

\- The discrepancy between source code and runtime behaviour remains unresolved.

\- Do not mark Investigator POST or PUT as operational until the running application is investigated and retested.



\## 8. Storage-Layer Findings



\### CasesStore / CaseStore



\- Uses Spring JdbcTemplate for database operations.

\- Queries the `"CASE"` table.

\- Reads case fields including CASE\_ID, CASE\_NUMBER, TITLE, DESCRIPTION, CASE\_TYPE, PRIORITY, STATUS, LOCATION, DATE\_REPORTED, DATE\_OPENED, DATE\_CLOSED, and OUTCOME.

\- Supports database-backed list, single-record retrieval, insertion, update, duplicate case-number checks, and deletion.

\- Requests a generated CASE\_ID after insertion.

\- Runtime database connection and Oracle persistence are not yet independently verified.



\### InvestigatorStore



\- Uses Spring JdbcTemplate for database operations.

\- Queries the INVESTIGATOR table.

\- Reads INVESTIGATOR\_ID, NAME, BADGE\_NUMBER, DEPARTMENT, RANK, CONTACT, and EMAIL.

\- Supports database-backed list, single-record retrieval, insertion, update, and duplicate badge-number checks.

\- Requests a generated INVESTIGATOR\_ID after insertion.

\- No delete operation was found in this storage class.

\- Runtime database connection and Oracle persistence are not yet independently verified.



\### Next Verification Steps



\- Confirm the backend datasource configuration points to the intended Oracle database.

\- Confirm the required tables and columns match the approved schema.

\- Test the endpoints over HTTP.

\- Verify created and updated records directly in Oracle.

\- Verify persistence after restarting the backend.





\## 9. Backend Owner Confirmation — 15 October 2026



\### Database Integration

\- Oracle Database 26ai Free is running in Docker.

\- The FREEPDB1 service is reported as ready.

\- The Spring Boot backend starts on port 8080.

\- GET /api/health and GET /api/cases have responded successfully.

\- Cases Oracle authentication and database-backed CRUD remain unverified.

\- Investigator storage is reported by the backend owner as in-memory in the latest shared status.

\- Do not claim Oracle persistence until independently verified.



\### Confirmed Cases Routes

\- GET /api/cases

\- GET /api/cases/{id}

\- POST /api/cases

\- PUT /api/cases/{id}

\- DELETE /api/cases/{id}



The source controller contains all five mappings. GET routes have been tested. Write operations are not approved for testing yet.



\### Investigator Routes

\- GET /api/investigators

\- GET /api/investigators/{id}



These routes were confirmed in the backend owner's latest status. The inspected source also contains POST and PUT mappings, but the running application returned HTTP 405 for both. Runtime route availability needs investigation.



\### Testing Restrictions

\- Continue read-only GET testing.

\- Do not test POST, PUT, or DELETE until the backend owner confirms readiness.

\- Do not change backend controllers, DAO classes, or the database schema.

\- Verify Oracle persistence independently once database-backed CRUD is ready.



\### Open Items

\- Confirm which Cases storage implementation is currently active.

\- Resolve the discrepancy between Investigator source mappings and runtime responses.

\- Confirm the Investigator table definition, identifier type, and ID-generation behaviour.

\- Inventory actual routes for People, Evidence, Custody Records, and other modules.

\- Confirm request/response contracts before write testing.





\## 10. Complete Controller Scan



Controller files found under:

backend/src/main/java/com/crimevault/



1\. HealthController.java

2\. controller/CaseController.java

3\. controller/InvestigatorController.java



\### HealthController

\- GET /api/health

\- Source mapping found.

\- Runtime health response previously reported as UP.



\### CaseController

\- GET /api/cases

\- GET /api/cases/{id}

\- POST /api/cases

\- PUT /api/cases/{id}

\- DELETE /api/cases/{id}



\### InvestigatorController

\- GET /api/investigators

\- GET /api/investigators/{id}

\- POST /api/investigators

\- PUT /api/investigators/{id}



\### Missing from Controller Scan

No separate controller files were found for:

\- People

\- Evidence

\- Custody Records

\- Case Events



Confirm with the backend owner whether these routes are pending or implemented elsewhere.



\### Open Runtime Issue

The InvestigatorController source and compiled class contain POST and PUT mappings, but the running application returns HTTP 405 with Allow: GET for both operations.



This discrepancy requires investigation before write testing resumes.



\### Database Verification

Oracle connection and persistence remain unverified. Successful GET responses alone do not prove that records are being read from Oracle.



