# CrimeVault verification checklist

All boxes start unchecked. Mark an item complete only after recording the date, environment, steps, and observed result. Source inspection, mocked tests, and live Oracle evidence are distinct.

## 1. Automated checks (no live Oracle writes)

From the project root, run the frontend tests:

    node --test frontend/tests/api.test.cjs frontend/tests/case-status-filter.test.cjs

From backend/, run the backend tests:

    mvn -o -B test

Frontend tests exercise the API helper and case-status filter. Controller tests use mocked stores and DAO tests use test doubles. The Maven suite also contains an application-context test that may initialize the configured datasource; it is not a persistence test. The automated suites do not prove schema compatibility, persisted writes, or browser-to-Oracle behavior.

- [ ] Record actual frontend test output.
- [ ] Record actual Maven test output.
- [ ] Record failures or environment blockers; do not copy historical results as fresh results.

## 2. Read-only browser and API checks

Start the backend and frontend using README.md. Do not submit a valid create or update form during this section.

- [ ] GET /api/health returns the application response. This does not check database connectivity.
- [ ] Open the frontend and navigate Cases, Investigators, People, Assignments, Case–People, Evidence, Custody, Interviews, Investigation Events, Forensic Examinations, and Forensic Reports.
- [ ] Observe loading, populated-list, and empty-result states where available. Record failed requests as errors, not empty lists.
- [ ] Open available detail views and check that fields match the selected record.
- [ ] Check case search, priority, and status filters. Confirm status options reflect values returned by the API and filtering matches the selected value exactly.
- [ ] Check Evidence and Assignment status filters against values returned by the API.
- [ ] Check case-related filters and selectors for case, person, investigator, evidence, examination, and report relationships.
- [ ] In New Forensic Report, confirm examinations that already have reports are excluded. In Edit, confirm the current examination remains selected. Do not save.
- [ ] Open a form and observe required-field validation without submitting valid values. Browser-only validation does not prove backend validation.
- [ ] Observe dashboard counts and recent activity; distinguish API-backed values from explicitly labelled demo content.
- [ ] Check backend-unavailable feedback only in an isolated local run where the backend is already unavailable. Do not stop a shared backend to perform this check.
- [ ] Capture genuine screenshots and record the environment/data shown.

No manual browser check is marked passed here.

## 3. Live read-only Oracle checks

Only run after the backend is configured for the intended database. Keep credentials out of screenshots, shell history, and documentation.

- [ ] Confirm a database-backed list request succeeds.
- [ ] Read selected records and relationships by ID or filter; record actual HTTP status and returned fields.
- [ ] If safely available, query Oracle metadata read-only to compare the 11 relations and required columns with JDBC mappings.
- [ ] Label these separately from automated/mock tests and write tests.

A successful /api/health response alone does not confirm Oracle connectivity.

## 4. Isolated Oracle write and constraint tests

Use a dedicated, confirmed isolated schema and uniquely identifiable temporary records. Do not write to the shared project database without its owner's explicit approval. Case-person and Custody have no DELETE route; their test writes are durable. Run them only in a disposable isolated environment with an approved teardown plan. Record each request and read-back; never clean up by a broad query or marker alone.

- [ ] Create a temporary record for each supported POST operation; read it back through the API and Oracle.
- [ ] Update that same temporary record where PUT is supported; verify changed fields by reading it back.
- [ ] Delete only supported resources and the exact generated test ID after checking for dependents; confirm the not-found response.
- [ ] Test missing/invalid fields, duplicate keys, and invalid foreign keys. Use response and Oracle read-back to establish whether validation or a database constraint handled each request.
- [ ] Verify custody history insertion and Evidence.currentLocation update together. In the isolated schema, induce a controlled failure between writes and verify rollback. A compensating transfer is not rollback evidence.
- [ ] Verify report/examination duplicate behavior against the actual isolated schema constraints.
- [ ] Record cleanup queries/results and confirm no temporary rows remain.

These write tests are pending until an isolated Oracle environment is confirmed and the tests are approved. This checklist does not assert that they passed.

## 5. Results record

For each completed check, record:

- Date and source revision.
- Environment: automated/mock, browser with local API, read-only Oracle, or isolated Oracle write test.
- Exact command or route and observed output/status.
- Whether database writes occurred and how temporary data was verified or cleaned up.
- Screenshot path, if applicable.

Do not mark a feature verified based only on source inspection or a successful build.
