# CrimeVault API contract

Reviewed against backend controllers, models, stores, and the exception handler on 2026-10-26. This describes checked-in code; it does not assert that a live Oracle database is reachable or every operation has been integration-tested.

## Conventions

- API base: **http://localhost:8080/api**. The frontend uses JSON and calls Spring Boot; it does not connect directly to Oracle.
- Collection reads return JSON arrays. Detail reads and successful creates/updates return an object. DELETE success returns an empty 204 response.
- LocalDate fields use ISO dates (YYYY-MM-DD); LocalDateTime fields use ISO date-times (YYYY-MM-DDTHH:mm:ss).
- Resources with surrogate IDs receive them on create; Case-person links use (caseId, personId) as their key. Omit generated IDs from create bodies. On update, omit the body ID or make it match the URL ID.
- String categories are not checked against an API enum. Database constraints may impose additional rules; this document does not define allowed category values.

## Routes

| Resource | Routes present in the controllers | Methods |
|---|---|---|
| Health | GET /health | GET |
| Cases | GET /cases, GET /cases/{id}, POST /cases, PUT /cases/{id} | GET, POST, PUT |
| Investigators | GET /investigators, GET /investigators/{id}, POST /investigators, PUT /investigators/{id} | GET, POST, PUT |
| People | GET /people, GET /people/{id}, POST /people, PUT /people/{id} | GET, POST, PUT |
| Case assignments | GET /assignments, GET /assignments/{id}, POST /assignments, PUT /assignments/{id} | GET, POST, PUT |
| Case-person links | GET /case-people, GET /case-people/case/{caseId}, POST /case-people | GET, POST |
| Evidence | GET /evidence, GET /evidence/{id}, GET /evidence/case/{caseId}, POST /evidence, PUT /evidence/{id}, DELETE /evidence/{id} | GET, POST, PUT, DELETE |
| Custody records | GET /custody-records, GET /custody-records/{id}, GET /custody-records/evidence/{evidenceId}, POST /custody-records | GET, POST |
| Interviews | GET /interviews, GET /interviews/{id}, GET /interviews/case/{caseId}, POST /interviews, PUT /interviews/{id}, DELETE /interviews/{id} | GET, POST, PUT, DELETE |
| Investigation events | GET /investigation-events, GET /investigation-events/{id}, GET /investigation-events/case/{caseId}, POST /investigation-events, PUT /investigation-events/{id}, DELETE /investigation-events/{id} | GET, POST, PUT, DELETE |
| Forensic examinations | GET /forensic-examinations, GET /forensic-examinations/{id}, GET /forensic-examinations/evidence/{evidenceId}, GET /forensic-examinations/case/{caseId}, POST /forensic-examinations, PUT /forensic-examinations/{id}, DELETE /forensic-examinations/{id} | GET, POST, PUT, DELETE |
| Forensic reports | GET /forensic-reports, GET /forensic-reports/{id}, GET /forensic-reports/examination/{examinationId}, GET /forensic-reports/case/{caseId}, POST /forensic-reports, PUT /forensic-reports/{id}, DELETE /forensic-reports/{id} | GET, POST, PUT, DELETE |

There is no Cases DELETE route. Investigator, People, Assignment, Case-person, and Custody controllers also have no DELETE route. Custody history is append-only through this API.

## Request bodies

Names are Java model properties. Fields marked required are checked by a controller or bean validation. Other fields are optional at this layer; Oracle constraints may add requirements.

| Resource | Required fields | Other model fields |
|---|---|---|
| Case | caseNumber, title, caseType, priority, status, dateReported | description, location, dateOpened, dateClosed, outcome |
| Investigator | name | badgeNumber, department, rank, contact, email |
| Person | name | dateOfBirth, gender, contact, address |
| Case assignment | caseId, investigatorId; assignmentDate defaults to today on POST and is required on PUT | assignmentRole, assignmentStatus |
| Case-person link | caseId, personId, role | dateAdded, remarks |
| Evidence | caseId, evidenceType | description, collectionLocation, collectionDateTime, status, currentLocation |
| Custody record | evidenceId, toInvestigatorId, transferDateTime | fromInvestigatorId, transferReason, location, remarks |
| Interview | caseId, personId, investigatorId, interviewDateTime | location, summary |
| Investigation event | caseId, investigatorId, eventDateTime, eventType | description |
| Forensic examination | evidenceId, examinerId, examinationType | startDate, endDate, status, findings |
| Forensic report | examinationId, reportDate | conclusion |

Additional checks in code:

- Case strings have maximum lengths: caseNumber 30, title 150, caseType 50, priority 20, status 30. dateOpened cannot precede dateReported. Duplicate case numbers are checked case-insensitively.
- Evidence requires positive caseId and nonblank evidenceType (maximum 50 characters). Model validation also bounds description (1000), collectionLocation (200), status (30), and currentLocation (200).
- Custody requires positive evidenceId and toInvestigatorId and transferDateTime. Optional fromInvestigatorId must be positive when supplied. A supplied custodyId is rejected on create.
- Interview requires positive caseId, personId, investigatorId, and interviewDateTime.
- Investigation event requires positive caseId and investigatorId, eventDateTime, and nonblank eventType (maximum 50 characters).
- Forensic examination requires positive evidenceId and examinerId and nonblank examinationType (maximum 100 characters).
- Forensic report requires positive examinationId and reportDate.
- Other bounded model strings are checked by bean validation. Categorical strings are not validated against an API enum.

## Responses and errors

| Operation | Success | Other statuses implemented |
|---|---:|---|
| GET collection or relationship filter | 200 | 400 for invalid positive-ID path values where checked; 500/503 for database failures |
| GET detail | 200 | 400 for invalid positive IDs; 404 when absent |
| POST | 201 | 400 validation; 409 explicit duplicate or database integrity conflict; 500/503 database failures |
| PUT | 200 | 400 validation/ID mismatch; 404 when absent; 409 database integrity conflict; 500/503 database failures |
| DELETE where mapped | 204 | 400 invalid ID; 404 when absent; 409 when a database integrity constraint prevents deletion |

Error formats vary by path. Shared validation, malformed-JSON, and database-advice responses use fields status, error, message, and path. Explicit controller errors commonly use only message; some 404 responses have no body. The API helper accepts either form.

The shared exception handler maps data-integrity violations to 409, database resource failures to 503 with a generic message, and other Spring DataAccessException failures to 500 with a generic message. Case-number duplicates and duplicate investigator badge numbers are explicitly mapped to 409. These are code paths, not evidence that a specific Oracle constraint has been encountered.

GET /health returns a static application status object with status UP. It does not test Oracle connectivity.

## Persistence limits

Controllers delegate to JDBC stores issuing parameterized SQL against the named Oracle relations. Custody transfer code is transactional and inserts a custody row before updating Evidence.currentLocation. The annotation alone does not verify rollback against a running Oracle database.

Case-person POST uses a database MERGE keyed by (caseId, personId): it inserts a new link or updates that pair, while the controller responds 201 in either case. The Forensic Report controller/store has no explicit duplicate-examination check. The frontend excludes examinations with reports on create and retains the selection on edit. Whether a duplicate link is rejected depends on the configured database constraint; if Oracle reports an integrity violation, the shared handler returns 409. This document does not assert that the live schema has that constraint or that live persistence was tested.
