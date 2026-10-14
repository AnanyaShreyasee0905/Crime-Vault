\# CrimeVault — Bug Log



\*\*Project:\*\* CrimeVault — Crime Case \& Evidence Management System

\*\*Last updated:\*\* 15 October 2026

\*\*Purpose:\*\* Record reproducible API, frontend integration and database verification issues.



\## Status definitions



\- \*\*Open:\*\* An issue has been observed and remains unresolved.

\- \*\*In Progress:\*\* Investigation or a fix is underway.

\- \*\*Fixed:\*\* A change intended to resolve the issue has been made.

\- \*\*Retested — Passed:\*\* The relevant test was rerun and passed.

\- \*\*Blocked:\*\* Verification cannot proceed because a dependency or approval is missing.

\- \*\*Needs Investigation:\*\* An unexpected result occurred, but the cause is unknown.



\## BUG-001 — Investigator POST returns HTTP 405



\- \*\*Date discovered:\*\* 15 October 2026

\- \*\*Module:\*\* Investigators

\- \*\*Endpoint:\*\* `POST /api/investigators`

\- \*\*Severity:\*\* High for Investigator creation; no overall project severity assigned yet

\- \*\*Steps to reproduce:\*\*

&#x20; 1. Start the currently running CrimeVault backend.

&#x20; 2. Send a POST request to `http://localhost:8080/api/investigators`.

&#x20; 3. Use the previously tested request body: `{"badgeNumber":"TEST-BADGE-9999"}`.

&#x20; 4. Record the HTTP status and response headers.

\- \*\*Expected result:\*\* The endpoint should follow the agreed API contract. Its final request validation and successful response behaviour must be confirmed before assigning a definitive expected status.

\- \*\*Actual result:\*\* HTTP `405 Method Not Allowed`; the runtime advertised `GET` as an allowed method.

\- \*\*Reproducible:\*\* Observed in the previous test; requires a fresh retest to confirm.

\- \*\*Status:\*\* Needs Investigation

\- \*\*Retest result:\*\* Pending

\- \*\*Owner:\*\* Backend/database lead to investigate the runtime routing discrepancy.



\## BUG-002 — Investigator PUT returns HTTP 405



\- \*\*Date discovered:\*\* 15 October 2026

\- \*\*Module:\*\* Investigators

\- \*\*Endpoint:\*\* `PUT /api/investigators/1`

\- \*\*Severity:\*\* High for Investigator updates; no overall project severity assigned yet

\- \*\*Steps to reproduce:\*\*

&#x20; 1. Start the currently running CrimeVault backend.

&#x20; 2. Send a PUT request to `http://localhost:8080/api/investigators/1`.

&#x20; 3. Use the previously tested request body: `{}`.

&#x20; 4. Record the HTTP status and response headers.

\- \*\*Expected result:\*\* The endpoint should follow the agreed API contract. The final validation response for an empty update body must be confirmed.

\- \*\*Actual result:\*\* HTTP `405 Method Not Allowed`; the runtime advertised `GET` as an allowed method.

\- \*\*Reproducible:\*\* Observed in the previous test; requires a fresh retest to confirm.

\- \*\*Status:\*\* Needs Investigation

\- \*\*Retest result:\*\* Pending

\- \*\*Owner:\*\* Backend/database lead to investigate the runtime routing discrepancy.



\## BUG-003 — Oracle persistence has not been verified



\- \*\*Date discovered:\*\* 15 October 2026

\- \*\*Module:\*\* Backend/database integration

\- \*\*Endpoint:\*\* Cases and Investigators write operations; exact database-backed readiness is pending confirmation

\- \*\*Severity:\*\* Release-blocking verification gap; not yet a confirmed implementation defect

\- \*\*Steps to reproduce:\*\* Not applicable as a failure reproduction. This is a missing verification item.

\- \*\*Expected result:\*\* For endpoints confirmed as database-backed and ready for testing, create or update a fictional test record, verify the corresponding Oracle row, restart the backend, and confirm the record remains available.

\- \*\*Actual result:\*\* Successful GET responses have been observed, but independent Oracle persistence and persistence-after-restart have not been established.

\- \*\*Reproducible:\*\* Not applicable; verification is outstanding.

\- \*\*Status:\*\* Blocked pending backend-owner confirmation that the relevant endpoints are database-backed and ready.

\- \*\*Retest result:\*\* Pending

\- \*\*Owner:\*\* Backend/database lead for implementation readiness; testing lead for independent verification.



\## Additional observations



\- A successful GET response does not establish that the returned data came from Oracle.

\- The Investigator POST/PUT runtime discrepancy remains unexplained. Do not assume a cause without further evidence.

\- Other frontend modules currently have documented demo-backed workflows. These should be tracked as integration work unless a specific incorrect behaviour is reproduced.

\- Do not mark any issue Fixed or Retested — Passed without running the relevant verification again.



\## Future bug entry template



\### BUG-XXX — Short descriptive title



\- \*\*Date discovered:\*\*

\- \*\*Module:\*\*

\- \*\*Endpoint or page:\*\*

\- \*\*Severity:\*\*

\- \*\*Steps to reproduce:\*\*

\- \*\*Expected result:\*\*

\- \*\*Actual result:\*\*

\- \*\*HTTP status / sanitized error:\*\*

\- \*\*Reproducible:\*\*

\- \*\*Status:\*\*

\- \*\*Retest result:\*\*

\- \*\*Owner:\*\*
