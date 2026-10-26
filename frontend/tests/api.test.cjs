const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/api.js"), "utf8");

function createClient(fetchImpl) {
    const context = { fetch: fetchImpl, console };
    vm.runInNewContext(`${source}\nglobalThis.CrimeVaultAPI = CrimeVaultAPI;`, context, { filename: "api.js" });
    return context.CrimeVaultAPI;
}

function response({ status = 200, body = "{}", contentType = "application/json" } = {}) {
    return {
        status,
        ok: status >= 200 && status < 300,
        headers: { get: name => name.toLowerCase() === "content-type" ? contentType : null },
        text: async () => body
    };
}

test("GET uses the API base URL and parses JSON", async () => {
    let requested;
    const api = createClient(async (url, options) => { requested = { url, options }; return response({ body: '[{"id":1}]' }); });
    assert.equal(JSON.stringify(await api.get("/evidence")), '[{"id":1}]');
    assert.equal(requested.url, "http://localhost:8080/api/evidence");
    assert.equal(requested.options.method, "GET");
});

test("POST and PUT serialize JSON payloads and methods", async () => {
    const calls = [];
    const api = createClient(async (url, options) => { calls.push({ url, options }); return response({ body: '{"saved":true}' }); });
    await api.post("/evidence", { caseId: 4 });
    await api.put("/evidence/9", { caseId: 5 });
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[1].options.method, "PUT");
    assert.deepEqual(JSON.parse(calls[0].options.body), { caseId: 4 });
    assert.equal(calls[1].url, "http://localhost:8080/api/evidence/9");
});

test("DELETE accepts a successful 204 response", async () => {
    let method;
    const api = createClient(async (_url, options) => { method = options.method; return response({ status: 204, body: "" }); });
    assert.equal(await api.delete("/evidence/9"), null);
    assert.equal(method, "DELETE");
});

test("HTTP errors preserve status and backend message", async () => {
    const api = createClient(async () => response({ status: 409, body: '{"message":"Foreign key conflict"}' }));
    await assert.rejects(api.post("/evidence", {}), error => error.status === 409 && error.message === "Foreign key conflict");
});

test("network errors provide a backend-unavailable message", async () => {
    const api = createClient(async () => { throw new Error("offline"); });
    await assert.rejects(api.get("/events"), /Cannot connect to the CrimeVault backend/);
});

test("malformed JSON is reported with the response status", async () => {
    const api = createClient(async () => response({ status: 200, body: "{bad" }));
    await assert.rejects(api.get("/evidence"), error => error.status === 200 && /malformed JSON/.test(error.message));
});
