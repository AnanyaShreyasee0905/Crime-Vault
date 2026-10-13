# CrimeVault API Contract

**Project:** CrimeVault — Crime Case & Evidence Management System  
**Backend:** Java + Spring Boot  
**Database:** Oracle  
**Status:** Draft — pending schema and team approval

## 1. API conventions

- Base URL: `http://localhost:8080/api`
- Data format: JSON (`application/json`)
- IDs, field names and data types must match the approved Oracle schema and agreed API contract.
- The frontend must communicate with the backend API, not directly with Oracle.
- Database credentials must not be committed to GitHub.

## 2. Planned endpoints

| Method | Endpoint | Purpose | Status |
|---|---|---|---|
| GET | `/api/health` | Check backend availability | Implemented; verify response |
| GET | `/api/cases` | List cases | Planned |
| GET | `/api/cases/{id}` | Retrieve one case | Planned |
| POST | `/api/cases` | Create a case | Planned |
| PUT | `/api/cases/{id}` | Update a case | Planned |
| GET | `/api/investigators` | List investigators | Planned |
| GET | `/api/people` | List people | Planned |
| GET | `/api/evidence` | List evidence | Planned |
| POST | `/api/custody-records` | Record a custody transfer | Planned |
| GET | `/api/cases/{id}/events` | Retrieve case timeline events | Planned |

These routes are proposals, not a final approved contract. Additional endpoints will be defined for case assignments, case-person relationships, interviews and forensic records according to the approved scope.

## 3. Request and response rules

- Use JSON for request bodies and JSON for successful responses.
- Use appropriate HTTP status codes, including `200`, `201`, `400`, `404` and `500` where applicable.
- Validate requests on the server.
- Return consistent error responses.
- Do not invent database field names or types before the approved schema is received.

## 4. Draft error response

The following is a proposed error format, subject to team agreement:

{
  "status": 400,
  "error": "Bad Request",
  "message": "Request validation failed",
  "path": "/api/cases"
}

## 5. Pending confirmation

- Exact Oracle table and column names
- Primary and foreign key mappings
- Field types, lengths, nullability and allowed values
- Final request and response JSON fields
- Filtering, searching, sorting and pagination requirements
- Database connection configuration
- Final endpoint list and error format

## 6. Integration acceptance criteria

An endpoint is complete only when it:
1. Matches the approved API contract.
2. Uses the confirmed Oracle schema.
3. Validates inputs and handles errors.
4. Passes valid and invalid request tests.
5. Works with the frontend where applicable.
6. Has its test results documented.
