# CrimeVault API Test Checklist

## A. Health endpoint

- [x] Server starts successfully.
- [x] `GET /api/health` returns `status: UP`.
- [ ] Verify response in browser or API client.
- [ ] Verify behavior when the server is stopped.

## B. Cases API

- [ ] GET all cases.
- [ ] GET one case by ID.
- [ ] POST a valid case.
- [ ] Reject invalid case input.
- [ ] PUT an existing case.
- [ ] Return 404 for a nonexistent case.
- [ ] Verify data is persisted in Oracle.

## C. Other modules

- [ ] Investigators API.
- [ ] People API.
- [ ] Evidence API.
- [ ] Custody records API.
- [ ] Case timeline API.
- [ ] Additional approved modules.

## D. Integration

- [ ] Confirm endpoint paths and JSON fields with the frontend teammate.
- [ ] Confirm database mappings with the Oracle teammate.
- [ ] Test successful requests and error responses.
- [ ] Test at least one complete frontend-to-API-to-Oracle workflow.
- [ ] Record test results and screenshots.

**Note:** Only the two initial server/health checks are currently verified. All remaining checks must be completed and evidenced before being marked done.
