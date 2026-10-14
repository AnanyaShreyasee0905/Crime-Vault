

\# CrimeVault — API Testing Checklist



\*\*Purpose:\*\* Record API test cases, actual results, failures, and Oracle persistence verification.



\*\*Rule:\*\* Do not mark a test as passed until the actual response has been checked.



\## 1. Pre-testing Checks



\- \[ ] Confirm the backend is running.

\- \[ ] Confirm the endpoint is ready for testing with the backend owner.

\- \[ ] Confirm the expected request and response formats.

\- \[ ] Confirm the correct backend URL.

\- \[ ] Record the test date and environment.

\- \[ ] Use only approved test data.



\## 2. Cases API Tests



\### GET /api/cases

\- \[ ] Retrieve the list of cases.

\- \[ ] Record the HTTP status and response body.

\- \[ ] Check the response fields and data types.

\- \[ ] Compare the response with the expected contract.



\### GET /api/cases/{id}

\- \[ ] Retrieve a known existing case.

\- \[ ] Try an unknown case ID.

\- \[ ] Record the response for both requests.



\### POST /api/cases

\- \[ ] Create a case with valid data.

\- \[ ] Check the response and generated ID.

\- \[ ] Test missing required fields.

\- \[ ] Test invalid field values.

\- \[ ] Check applicable uniqueness and relationship constraints.



\### PUT /api/cases/{id}

\- \[ ] Update an existing case.

\- \[ ] Confirm the intended fields changed.

\- \[ ] Try updating an unknown ID.

\- \[ ] Test invalid field values.



\### DELETE /api/cases/{id}

\- \[ ] Confirm deletion behaviour with the backend owner.

\- \[ ] Test only with approved test data.

\- \[ ] Try deleting an unknown ID.

\- \[ ] Check the effect on related records and constraints.



\## 3. Investigators API Tests



\### GET /api/investigators

\- \[ ] Retrieve the investigators list.

\- \[ ] Record the HTTP status and response body.

\- \[ ] Check the response fields and data types.



\### GET /api/investigators/{id}

\- \[ ] Retrieve a known investigator.

\- \[ ] Try an unknown investigator ID.

\- \[ ] Record both responses.



\### POST /api/investigators

\- \[ ] Create an investigator with valid data.

\- \[ ] Check the response and generated ID.

\- \[ ] Test missing required fields.

\- \[ ] Test invalid field values.

\- \[ ] Test duplicate badge numbers if uniqueness is required.



\### PUT /api/investigators/{id}

\- \[ ] Update an existing investigator.

\- \[ ] Confirm the intended fields changed.

\- \[ ] Try updating an unknown ID.

\- \[ ] Test invalid field values and duplicate badge numbers if applicable.



\## 4. Frontend Integration Tests



\- \[ ] Confirm the frontend sends requests to the intended API URL.

\- \[ ] Inspect requests and responses in the browser Network tab.

\- \[ ] Confirm successful responses update the UI.

\- \[ ] Confirm API errors are handled correctly.

\- \[ ] Confirm demo data is not mistaken for backend data.

\- \[ ] Refresh the page and check the data source.



\## 5. Oracle Persistence Tests



Perform these tests only after the backend owner confirms that the endpoint is connected to Oracle.



\- \[ ] Create a test record through the API.

\- \[ ] Verify that the record exists in Oracle.

\- \[ ] Update the record and verify the database change.

\- \[ ] Restart the backend.

\- \[ ] Retrieve the record again and verify that the change persists.

\- \[ ] Check that invalid requests do not create unintended records.



\## 6. Test Result Log



For each test, record:



| Field | Details |

|---|---|

| Test ID | |

| Date | |

| Endpoint | |

| Test input | |

| Expected result | |

| Actual result | |

| HTTP status | |

| Result | Not started / Passed / Failed / Blocked |

| Oracle verified? | Yes / No / Not applicable |

| Notes or bug ID | |



\## 7. Final Rules



\- A route existing in source code does not prove it works.

\- A successful HTTP response does not prove Oracle persistence.

\- Data visible in the frontend may be demo data.

\- Record actual results rather than assuming expected results occurred.

\- Report reproducible bugs with steps and evidence.



