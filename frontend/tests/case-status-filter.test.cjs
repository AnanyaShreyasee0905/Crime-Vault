const assert = require("node:assert/strict");
const test = require("node:test");
const { filterByStatus, populate } = require("../js/case-status-filter.js");

class MockOption {
    constructor(text, value) {
        this.text = text;
        this.value = value;
    }
}

function mockSelect(value = "") {
    return {
        value,
        options: [],
        replaceChildren(...options) {
            this.options = options;
        }
    };
}

test("case status options reflect API statuses and each status filters exactly", () => {
    const cases = ["Open", "Pending", "Under Review", "Closed", "pending"].map((status, index) => ({
        caseId: index + 1,
        status
    }));
    const select = mockSelect("Pending");

    populate(select, cases, MockOption);

    assert.deepEqual(select.options.map(option => option.value), [
        "", "Open", "Pending", "Under Review", "Closed", "pending"
    ]);
    assert.equal(select.value, "Pending");

    for (const record of cases) {
        const matching = filterByStatus(cases, record.status);
        assert.deepEqual(matching.map(item => item.caseId), [record.caseId]);
    }
});

test("case status filter falls back to All statuses if the selected status disappears", () => {
    const select = mockSelect("Under Review");
    populate(select, [{ caseId: 1, status: "Open" }], MockOption);
    assert.equal(select.value, "");
});
