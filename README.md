# CrimeVault

CrimeVault is an academic crime investigation and case management prototype. The current checked-in implementation is a Java 17 / Spring Boot API with JDBC access to Oracle and a static HTML, CSS, and JavaScript frontend.


## Current implementation status

The source includes Oracle-backed APIs and connected frontend workflows for all 11 approved relations: Case, Investigator, Person, Case Assignment, Case Person, Evidence, Custody Record, Interview, Investigation Event, Forensic Examination, and Forensic Report. Case deletion is unsupported, and custody history is append-only. Route support and verification results should be described separately; source implementation alone does not prove live persistence.

## Prerequisites

- JDK 17 or later compatible with the configured Spring Boot build.
- Oracle Database and the approved CrimeVault schema.
- `CRIMEVAULT_DB_USER` and `CRIMEVAULT_DB_PASSWORD` set in the shell running the backend.
- A static file server for `frontend/` (the existing CORS configuration allows `localhost:5500` and `127.0.0.1:5500`).

Credentials must remain in environment variables and must not be committed.


## Run the backend

In PowerShell, start Spring Boot from `backend/`. Enter the existing database credential only in the secure prompt; do not put a password in a command or file.

```powershell
Set-Location backend
$credential = Get-Credential -UserName 'CRIMEVAULT' -Message 'Enter the existing Oracle credential'
$password = $credential.GetNetworkCredential().Password
try {
    $env:CRIMEVAULT_DB_USER = $credential.UserName
    $env:CRIMEVAULT_DB_PASSWORD = $password
    mvn -o spring-boot:run
}
finally {
    Remove-Item Env:CRIMEVAULT_DB_USER -ErrorAction SilentlyContinue
    Remove-Item Env:CRIMEVAULT_DB_PASSWORD -ErrorAction SilentlyContinue
    $password = $null
    $credential = $null
}
```

The configured Oracle service is `localhost:1521/FREEPDB1`. Do not start a second backend if port 8080 is already in use.

## Run the frontend

Serve `frontend/` on loopback port 5500 (for example, `python -m http.server 5500 --bind 127.0.0.1`) and open `http://localhost:5500`. The API helper targets `http://localhost:8080/api`. The dashboard and module screens load persisted backend data and show loading or error states when data is unavailable.

## API routes currently present

| Relation/module | Collection route | Supported operations |
|---|---|---|
| Cases | `/api/cases` | GET, POST, PUT; DELETE unsupported |
| Investigators | `/api/investigators` | GET, POST, PUT |
| People | `/api/people` | GET, POST, PUT |
| Case Assignments | `/api/assignments` | GET, POST, PUT |
| Case Persons | `/api/case-people` | GET, POST |
| Evidence | `/api/evidence` | GET, POST, PUT, DELETE |
| Custody Records | `/api/custody-records` | GET, POST; append-only history |
| Interviews | `/api/interviews` | GET, POST, PUT, DELETE |
| Investigation Events | `/api/investigation-events` | GET, POST, PUT, DELETE |
| Forensic Examinations | `/api/forensic-examinations` | GET, POST, PUT, DELETE |
| Forensic Reports | `/api/forensic-reports` | GET, POST, PUT, DELETE |

Routes also provide supported detail and relationship-filter reads. Route presence alone does not establish that every operation was verified against Oracle.

## Tests

From `backend/`, run the backend unit and controller tests:

```powershell
mvn -o -B test
```

From the project root, run the frontend API and case-status filter tests:

```powershell
node --test frontend/tests/api.test.cjs frontend/tests/case-status-filter.test.cjs
```

These automated tests do not substitute for live Oracle persistence or end-to-end browser verification.
