/* Test-only in-memory API. It never loads Spring Boot or opens a database connection. */
const http = require("node:http");
const { URL } = require("node:url");

const tables = {
    cases: [{ caseId: 10, caseNumber: "MOCK-CV-10", title: "Mock Fixture Case", caseType: "Review", priority: "Medium", status: "Open", location: "Mock location", dateReported: "2026-10-24", dateOpened: "2026-10-24", description: "Synthetic test fixture; not a project record." }],
    investigators: [{ investigatorId: 20, name: "Mock Investigator", badgeNumber: "MOCK-20", department: "Test Unit", rank: "Investigator", contact: "0000000000", email: "mock@example.invalid" }],
    people: [{ personId: 30, name: "Mock Person", role: "Witness", contact: "0000000000", email: "person@example.invalid" }],
    assignments: [],
    "case-people": [],
    evidence: [{ evidenceId: 40, caseId: 10, evidenceType: "Digital", description: "Synthetic evidence fixture.", collectionLocation: "Mock location", collectionDateTime: "2026-10-24T09:00:00", status: "Collected", currentLocation: "Mock storage" }],
    "custody-records": [{ custodyId: 50, evidenceId: 40, fromInvestigatorId: 20, toInvestigatorId: 20, transferDateTime: "2026-10-24T10:00:00", transferReason: "Mock fixture only", location: "Mock storage", remarks: "Synthetic test fixture." }],
    interviews: [{ interviewId: 60, caseId: 10, personId: 30, investigatorId: 20, interviewDateTime: "2026-10-24T11:00:00", location: "Mock room", summary: "Synthetic interview fixture." }],
    "investigation-events": [{ eventId: 70, caseId: 10, investigatorId: 20, eventDateTime: "2026-10-24T12:00:00", eventType: "Mock update", description: "Synthetic timeline fixture." }],
    "forensic-examinations": [{ examinationId: 80, evidenceId: 40, examinerId: 20, examinationType: "Mock examination", startDate: "2026-10-24", endDate: null, status: "In progress", findings: "Synthetic examination fixture." }],
    "forensic-reports": [{ reportId: 90, examinationId: 80, reportDate: "2026-10-24", conclusion: "Synthetic report fixture." }]
};
const idFields = {
    investigators: "investigatorId", people: "personId", assignments: "assignmentId",
    evidence: "evidenceId", "custody-records": "custodyId", interviews: "interviewId",
    "investigation-events": "eventId", "forensic-examinations": "examinationId", "forensic-reports": "reportId"
};
const idSeeds = Object.fromEntries(Object.entries(idFields).map(([table, field]) => [table, Math.max(100, ...tables[table].map(row => Number(row[field]) || 0))]));
let failNext = null;

function send(res, status, body) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(body == null ? "" : JSON.stringify(body));
}
function cors(req, res) {
    const origin = req.headers.origin;
    if (["http://127.0.0.1:5500", "http://localhost:5500"].includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,Accept");
    }
}
async function bodyOf(req) {
    let text = "";
    for await (const chunk of req) text += chunk;
    return text ? JSON.parse(text) : {};
}
function tableFor(path) { return path.split("/").filter(Boolean)[1]; }

const server = http.createServer(async (req, res) => {
    cors(req, res);
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
    const url = new URL(req.url, "http://localhost:8080");
    if (url.pathname === "/__mock/state") { send(res, 200, { mode: "in-memory", oracle: false, fixtureOnly: true, failNext }); return; }
    if (url.pathname === "/__mock/fail-next") {
        failNext = { method: (url.searchParams.get("method") || "GET").toUpperCase(), path: url.searchParams.get("path") || "/api/evidence", status: Number(url.searchParams.get("status") || 503) };
        send(res, 200, { scheduled: failNext }); return;
    }
    if (failNext && req.method === failNext.method && url.pathname === failNext.path) {
        const failure = failNext; failNext = null;
        send(res, failure.status, { message: "Controlled mock failure; no database was contacted." }); return;
    }
    if (!url.pathname.startsWith("/api/")) { send(res, 404, { message: "Unknown mock route" }); return; }
    const parts = url.pathname.split("/").filter(Boolean);
    const table = parts[1];
    const rows = tables[table];
    if (!rows) { send(res, 404, { message: `No mock resource for ${table}` }); return; }
    const idField = idFields[table];
    try {
        if (req.method === "GET") {
            if (parts.length === 2) { send(res, 200, rows); return; }
            if (parts[2] === "case" && parts[3]) {
                const caseId = parts[3];
                send(res, 200, rows.filter(row => String(row.caseId ?? evidenceCase(row.evidenceId) ?? reportCase(row.examinationId)) === caseId)); return;
            }
            if (parts[2] === "evidence" && parts[3] && table === "custody-records") {
                send(res, 200, rows.filter(row => String(row.evidenceId) === parts[3])); return;
            }
            if (parts[2] === "examination" && parts[3] && table === "forensic-reports") {
                send(res, 200, rows.filter(row => String(row.examinationId) === parts[3])); return;
            }
            if (parts[2] === "evidence" && parts[3] && table === "forensic-examinations") {
                send(res, 200, rows.filter(row => String(row.evidenceId) === parts[3])); return;
            }
            const found = rows.find(row => String(row[idField]) === parts[2]);
            send(res, found ? 200 : 404, found || { message: "Mock record not found" }); return;
        }
        if (req.method === "POST") {
            if (table === "cases") { send(res, 405, { message: "Cases POST unsupported in mock" }); return; }
            const record = await bodyOf(req);
            if (table === "custody-records") {
                const evidence = tables.evidence.find(row => String(row.evidenceId) === String(record.evidenceId));
                if (!evidence) { send(res, 409, { message: "Evidence foreign key was not found" }); return; }
                const saved = { ...record, custodyId: ++idSeeds[table] };
                rows.push(saved);
                if (record.location) evidence.currentLocation = record.location;
                send(res, 201, saved); return;
            }
            if (table === "case-people") {
                if (rows.some(row => String(row.caseId) === String(record.caseId) && String(row.personId) === String(record.personId))) { send(res, 409, { message: "Duplicate case-person link" }); return; }
                rows.push(record); send(res, 201, record); return;
            }
            const saved = { ...record, [idField]: ++idSeeds[table] };
            rows.push(saved); send(res, 201, saved); return;
        }
        if (req.method === "PUT") {
            if (parts.length !== 3 || !idField) { send(res, 405, { message: "PUT unsupported for this mock route" }); return; }
            const idx = rows.findIndex(row => String(row[idField]) === parts[2]);
            if (idx < 0) { send(res, 404, { message: "Mock record not found" }); return; }
            const record = await bodyOf(req); rows[idx] = { ...rows[idx], ...record, [idField]: Number(parts[2]) };
            send(res, 200, rows[idx]); return;
        }
        // The mock intentionally exposes no DELETE operation, including Cases and Custody.
        send(res, 405, { message: "DELETE is unsupported by this mock environment" });
    } catch (error) { send(res, 400, { message: `Mock request error: ${error.message}` }); }
});
function evidenceCase(evidenceId) { return tables.evidence.find(row => String(row.evidenceId) === String(evidenceId))?.caseId; }
function reportCase(examinationId) {
    const exam = tables["forensic-examinations"].find(row => String(row.examinationId) === String(examinationId));
    return exam ? evidenceCase(exam.evidenceId) : undefined;
}
server.listen(8080, "::", () => console.log("Mock API listening on http://localhost:8080 (in-memory; Oracle disabled)"));
