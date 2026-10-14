\# CrimeVault — Frontend/API Compatibility Report



\*\*Project:\*\* CrimeVault — Crime Case \& Evidence Management System

\*\*Date:\*\* 15 October 2026

\*\*Status:\*\* Initial source review; end-to-end verification pending



\## 1. Purpose



Document the current relationship between the frontend, the centralized API client, and the Spring Boot backend. This report distinguishes source-level integration from verified runtime behaviour and Oracle persistence.



\## 2. API Client



\*\*File:\*\* `frontend/js/api.js`



\- Base URL: `http://localhost:8080/api`

\- Supports GET, POST, PUT, and DELETE requests.

\- Sends JSON request bodies when provided.

\- Requests JSON responses and handles HTTP errors.

\- Handles HTTP 204 responses without attempting to parse a response body.

\- Converts unsuccessful HTTP responses into JavaScript errors containing the status and response details.



The client is implemented in source. Compatibility with every backend endpoint has not been verified.



\## 3. Module Compatibility



| Frontend module | Current data/integration finding | Status |

|---|---|---|

| Cases | Calls GET `/api/cases`, POST `/api/cases`, and PUT `/api/cases/{caseId}` | Partially API-integrated |

| Investigators | Uses `demoInvestigators` in the inspected source; no API call found | Demo-backed |

| People | Uses `demoPeople` in the inspected source; no API call found | Demo-backed |

| Evidence | Uses `demoEvidence` in the inspected source; no API call found | Demo-backed |

| Custody | Uses demo investigator/evidence data in the inspected source | Demo-backed |

| Assignments | Uses demo case/investigator data in the inspected source | Demo-backed |

| Case–Person relationships | Uses demo case/person data in the inspected source | Demo-backed |

| Dashboard | HTML initially contains numeric summary values; dynamic replacement has not been confirmed | Verification pending |



These findings are based on searches of `frontend/js/\*.js` and the relevant portions of `frontend/index.html`. They do not establish that no integration exists elsewhere in the project.



\## 4. Cases API Calls Found



| Operation | Frontend call | Verification |

|---|---|---|

| List cases | `CrimeVaultAPI.get("/cases")` | Previously returned case records |

| Create case | `CrimeVaultAPI.post("/cases", record)` | Runtime write operation not verified successfully |

| Update case | `CrimeVaultAPI.put("/cases/{caseId}", record)` | Runtime write operation not verified successfully |



The Cases frontend maintains a separate `apiCases` array and a `casesSource` state. Demo cases are preserved for other workflows. This separation should be retained during integration.



\## 5. Backend Model Fields



\### CaseRecord



\- `caseId`: `Long`

\- `caseNumber`: `String`

\- `title`: `String`

\- `description`: `String`

\- `caseType`: `String`

\- `priority`: `String`

\- `status`: `String`

\- `location`: `String`

\- `dateReported`: `LocalDate`

\- `dateOpened`: `LocalDate`

\- `dateClosed`: `LocalDate`

\- `outcome`: `String`



\### Investigator



\- `investigatorId`: `Long`

\- `name`: `String`

\- `badgeNumber`: `String`

\- `department`: `String`

\- `rank`: `String`

\- `contact`: `String`

\- `email`: `String`



These are the inspected Java model fields and types. The approved Oracle schema and final API contract must be used to confirm database compatibility.



\## 6. Known Runtime Issue



The inspected Investigator controller source and compiled class contain POST and PUT mappings. However, the running application returned HTTP 405 Method Not Allowed for both operations, with the runtime advertising GET as an allowed method.



The cause remains unresolved. Do not claim Investigator write operations are operational until the runtime discrepancy is investigated and retested.



\## 7. Oracle Integration Status



\- Successful GET responses have been observed for Cases and Investigators.

\- Oracle persistence has not been independently verified.

\- The frontend must not treat successful HTTP retrieval as proof that data comes from Oracle.

\- Create, update, direct database verification, and persistence-after-restart tests remain pending approval and verification.



\## 8. Required Follow-up



1\. Compare frontend request fields with the approved API contract.

2\. Verify the complete Cases form submission and response-handling workflow.

3\. Investigate the Investigator POST/PUT runtime discrepancy with the backend owner.

4\. Confirm whether the dashboard summary values are dynamic or static.

5\. Integrate other modules only after their endpoint contracts and schema relationships are confirmed.

6\. Verify Oracle persistence when the backend owner confirms database-backed endpoints are ready.

7\. Update this report with actual test results and any confirmed field-name or type mismatches.



\## 9. Conclusion



The frontend currently has a centralized API client and partial Cases API integration. Other inspected modules retain demo-backed workflows. Full frontend/backend compatibility, final Oracle schema alignment, and end-to-end persistence remain unverified.
