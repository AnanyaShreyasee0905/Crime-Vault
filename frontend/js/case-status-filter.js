(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.CrimeVaultCaseStatusFilter = api;
    }
})(globalThis, () => {
    function distinctStatuses(cases) {
        return [...new Set(cases
            .map(record => record.status)
            .filter(status => status != null && String(status).trim() !== ""))];
    }

    function populate(select, cases, OptionConstructor) {
        const selected = select.value;
        const statuses = distinctStatuses(cases);
        select.replaceChildren(
            new OptionConstructor("All statuses", ""),
            ...statuses.map(status => new OptionConstructor(String(status), String(status)))
        );
        select.value = statuses.some(status => String(status) === selected) ? selected : "";
        return select.value;
    }

    function filterByStatus(cases, selectedStatus) {
        return cases.filter(record => !selectedStatus || record.status === selectedStatus);
    }

    return { distinctStatuses, populate, filterByStatus };
});
