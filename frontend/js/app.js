
"use strict";


// ============================================================
// CRIMEVAULT FRONTEND
// Existing modules use the Spring API where implemented; new relation
// workflows are integrated by workflows.js.
// ============================================================


// -------------------- NAVIGATION --------------------

const navigationLinks = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("page-title");

const dashboardSections = [
    document.querySelector(".welcome-panel"),
    document.querySelector(".stats-grid"),
    document.querySelector(".content-grid")
];

const casesView = document.getElementById("cases-view");
const investigatorsView = document.getElementById("investigators-view");
const assignmentsView = document.getElementById("assignments-view");
const peopleView = document.getElementById("people-view");
const casePeopleView = document.getElementById("case-people-view");

const evidenceView = document.getElementById("evidence-view");

const viewTitles = {
    dashboard: "Dashboard",
    cases: "Cases",
    investigators: "Investigators",
    assignments: "Case Assignments",
    people: "People",
    "case-people": "Case–Person Links",
    evidence: "Evidence & Custody",
    forensics: "Interviews & Forensics",
    timeline: "Investigation Timeline"
};


// -------------------- CASES ELEMENTS --------------------

const caseTableBody = document.getElementById("cases-table-body");
const caseCount = document.getElementById("case-count");
const emptyCases = document.getElementById("empty-cases");
const searchInput = document.getElementById("case-search");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");
const caseForm = document.getElementById("case-form");
const caseFormPanel = document.getElementById("case-form-panel");
const caseDetailsPanel = document.getElementById("case-details-panel");


// -------------------- INVESTIGATOR ELEMENTS --------------------

const investigatorTableBody =
    document.getElementById("investigators-table-body");
const investigatorCount =
    document.getElementById("investigator-count");
const emptyInvestigators =
    document.getElementById("empty-investigators");
const investigatorSearch =
    document.getElementById("investigator-search");
const investigatorDepartmentFilter =
    document.getElementById("investigator-department-filter");
const investigatorRankFilter =
    document.getElementById("investigator-rank-filter");
const investigatorForm =
    document.getElementById("investigator-form");
const investigatorFormPanel =
    document.getElementById("investigator-form-panel");
const investigatorDetailsPanel =
    document.getElementById("investigator-details-panel");


// -------------------- ASSIGNMENT ELEMENTS --------------------

const assignmentTableBody =
    document.getElementById("assignments-table-body");
const assignmentCount =
    document.getElementById("assignment-count");
const emptyAssignments =
    document.getElementById("empty-assignments");
const assignmentSearch =
    document.getElementById("assignment-search");
const assignmentStatusFilter =
    document.getElementById("assignment-status-filter");
const assignmentHistoryBody =
    document.getElementById("assignment-history-body");
const emptyAssignmentHistory =
    document.getElementById("empty-assignment-history");
const assignmentForm =
    document.getElementById("assignment-form");
const assignmentFormPanel =
    document.getElementById("assignment-form-panel");


// -------------------- PEOPLE ELEMENTS --------------------

const peopleTableBody = document.getElementById("people-table-body");
const personCount = document.getElementById("person-count");
const emptyPeople = document.getElementById("empty-people");
const personSearch = document.getElementById("person-search");
const personForm = document.getElementById("person-form");
const personFormPanel = document.getElementById("person-form-panel");
const personDetailsPanel = document.getElementById("person-details-panel");


/* -------------------- EVIDENCE & CUSTODY ELEMENTS -------------------- */

const evidenceTableBody = document.getElementById("evidence-table-body");
const evidenceCount = document.getElementById("evidence-count");
const emptyEvidence = document.getElementById("empty-evidence");
const evidenceSearch = document.getElementById("evidence-search");
const evidenceStatusFilter = document.getElementById("evidence-status-filter");

const evidenceForm = document.getElementById("evidence-form");
const evidenceFormPanel = document.getElementById("evidence-form-panel");
const evidenceDetailsPanel = document.getElementById("evidence-details-panel");
const evidenceDetailsContent = document.getElementById("evidence-details-content");

const custodyForm = document.getElementById("custody-form");
const custodyFormPanel = document.getElementById("custody-form-panel");
const custodyTableBody = document.getElementById("custody-table-body");
const custodyCount = document.getElementById("custody-count");
const emptyCustody = document.getElementById("empty-custody");

const openEvidenceFormButton = document.getElementById("open-evidence-form");
const closeEvidenceFormButton = document.getElementById("close-evidence-form");
const cancelEvidenceFormButton = document.getElementById("cancel-evidence-form");

const closeEvidenceDetailsButton = document.getElementById("close-evidence-details");
const openCustodyFormButton = document.getElementById("open-custody-form");

const closeCustodyFormButton = document.getElementById("close-custody-form");
const cancelCustodyFormButton = document.getElementById("cancel-custody-form");


// ============================================================
// DEMO CASE DATA
// ============================================================

// Cases received from the backend API.
let apiCases = [];
let casesSource = "loading"; // "loading", "api", or "error"
let casesLoading = false;
let apiPeople = [];
let apiInvestigators = [];
let apiAssignments = [];
let apiCasePeople = [];
const moduleLoadState = {
    people: "loading",
    investigators: "loading",
    assignments: "loading",
    casePeople: "loading"
};
const moduleSaving = {
    people: false,
    investigators: false,
    assignments: false,
    casePeople: false
};

function apiModuleMessage(moduleName) {
    const state = moduleLoadState[moduleName];
    if (state === "loading") return "Loading records from the backend…";
    if (state === "error") return "Records could not be loaded from the backend. No database records are shown. Check the backend connection and reload.";
    return "No records match your search or filters.";
}

function apiId(value) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Normalize cases received from the backend API.
function normalizeApiCase(record) {
    const displayValue = value => {
        if (!value) return "";

        return String(value)
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    return {
        ...record,
        caseId: record.caseId,
        caseNumber: record.caseNumber || "",
        title: record.title || "",
        description: record.description || "",
        caseType: displayValue(record.caseType),
        priority: displayValue(record.priority),
        status: record.status ?? "",
        location: record.location || "",
        dateReported: record.dateReported || "",
        dateOpened: record.dateOpened || "",
        dateClosed: record.dateClosed || "",
        outcome: record.outcome || ""
    };
}

async function loadApiCases() {
    if (casesLoading) return;

    casesLoading = true;

    try {
        const response = await CrimeVaultAPI.get("/cases");

        if (!Array.isArray(response)) {
            throw new Error("The cases API did not return an array.");
        }

        apiCases = response.map(normalizeApiCase);
        casesSource = "api";

        console.info("CrimeVault: Cases loaded from backend.", apiCases.length, "records.");

        renderCases();
        populateAssignmentOptions();
        populateCasePersonOptions();
        renderAssignments();
        renderCasePeople();
        renderInvestigators();
        renderPeople();
        updateDashboardFromApi();
    } catch (error) {
        console.error("Failed to load cases from backend:", error);

        casesSource = "error";
        renderCases();
        populateAssignmentOptions();
        populateCasePersonOptions();
        renderAssignments();
        renderCasePeople();
        renderInvestigators();
        renderPeople();
        updateDashboardFromApi();
    } finally {
        casesLoading = false;
    }
}



// ============================================================
// DEMO INVESTIGATOR DATA
// ============================================================



// ============================================================
// DEMO ASSIGNMENTS
// ============================================================



// ============================================================
// DEMO PEOPLE DATA
// ============================================================



// ============================================================
// DEMO CASE-PERSON RELATIONSHIPS
// Kept separate from person records, like a relationship table.
// ============================================================



// ============================================================
// SHARED HELPERS
// ============================================================

let editingCaseNumber = null;
let editingAssignmentId = null;
let selectedCaseNumber = null;
let editingInvestigatorId = null;
let selectedInvestigatorId = null;
let editingPersonId = null;
let selectedPersonId = null;
let editingEvidenceId = null;
let selectedEvidenceId = null;


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function setFieldValue(form, fieldName, value) {
    const field = form?.elements.namedItem(fieldName);
    if (field) field.value = value ?? "";
}



function getInvestigatorById(investigatorId) {
    return apiInvestigators.find(
        item => String(item.investigatorId) === String(investigatorId)
    );
}

function getPersonById(personId) {
    return apiPeople.find(item => String(item.personId) === String(personId));
}

function getActiveAssignments(investigatorId) {
    if (moduleLoadState.assignments !== "api") return [];
    return apiAssignments.filter(assignment =>
        String(assignment.investigatorId) === String(investigatorId)
        && assignment.assignmentStatus?.toLowerCase() === "active"
    );
}

function getAssignedCaseText(investigatorId) {
    if (moduleLoadState.assignments === "error") return "Assignments unavailable";
    if (moduleLoadState.assignments === "loading") return "Assignments loading";
    const assignments = getActiveAssignments(investigatorId);

    if (assignments.length === 0) return "Unassigned";

    return assignments.map(item =>
        apiCases.find(record => Number(record.caseId) === Number(item.caseId))?.caseNumber
            || `Case ${item.caseId}`
    ).join(", ");
}

function getPersonCaseNumbers(personId) {
    return apiCasePeople
        .filter(item => Number(item.personId) === Number(personId))
        .map(item => apiCases.find(record => Number(record.caseId) === Number(item.caseId))?.caseNumber
            || `Case ${item.caseId}`);
}

function getPersonCaseText(personId) {
    const cases = getPersonCaseNumbers(personId);
    return cases.length ? cases.join(", ") : "No cases linked";
}

function getInvestigatorDisplayName(investigatorId) {
    return getInvestigatorById(investigatorId)?.name
        || "Investigator unavailable";
}

function getAssignmentStatusClass(status) {
    return status?.toLowerCase() === "active" ? "open" : "closed";
}


/* ============================================================
   NAVIGATION
   ============================================================ */


function activateView(viewName) {
    navigationLinks.forEach(link => {
        const active = link.dataset.view === viewName;

        link.classList.toggle("active", active);

        if (active) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    if (pageTitle) {
        pageTitle.textContent = viewTitles[viewName] || "Dashboard";
    }

    const showCases = viewName === "cases";
    const showInvestigators = viewName === "investigators";
    const showAssignments = viewName === "assignments";
    const showPeople = viewName === "people";
    const showCasePeople = viewName === "case-people";
    const showEvidence = viewName === "evidence";
    const showForensics = viewName === "forensics";
    const showTimeline = viewName === "timeline";
    const forensicsView = document.getElementById("forensics-view");
    const timelineView = document.getElementById("timeline-view");

    dashboardSections.forEach(section => {
        if (section) {
            section.hidden = (
                showCases ||
                showInvestigators ||
                showAssignments ||
                showPeople ||
                showCasePeople ||
                showEvidence ||
                showForensics ||
                showTimeline
            );
        }
    });

    if (casesView) casesView.hidden = !showCases;
    if (investigatorsView) investigatorsView.hidden = !showInvestigators;
    if (assignmentsView) assignmentsView.hidden = !showAssignments;
    if (peopleView) peopleView.hidden = !showPeople;
    if (casePeopleView) casePeopleView.hidden = !showCasePeople;
    if (evidenceView) evidenceView.hidden = !showEvidence;
    if (forensicsView) forensicsView.hidden = !showForensics;
    if (timelineView) timelineView.hidden = !showTimeline;

    if (showCases) {
        renderCases();
    }

    if (showInvestigators) {
        renderInvestigators();
    }

    if (showAssignments) {
        populateAssignmentOptions();
        renderAssignments();
    }

    if (showPeople) {
        renderPeople();
    }

    if (showCasePeople) {
        populateCasePersonOptions();
        renderCasePeople();
    }

    if (showEvidence) {
        populateEvidenceOptions();
        populateCustodyInvestigatorOptions();
        renderEvidence();
        renderCustodyHistory();
    }

    document.dispatchEvent(new CustomEvent("crimevault:view", { detail: viewName }));
}


navigationLinks.forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const viewName = link.dataset.view;
        activateView(viewName);
        history.replaceState(null, "", `#${viewName}`);
    });
});

const viewCasesButton = document.getElementById("view-cases-btn");

if (viewCasesButton) {
    viewCasesButton.addEventListener("click", () => {
        activateView("cases");
        history.replaceState(null, "", "#cases");
    });
}


// ============================================================
// CASES — TABLE AND FILTERS
// ============================================================


function renderCases() {
    if (!caseTableBody) return;

    // Use API records only when API mode is enabled.
    const casesToDisplay = casesSource === "api" ? apiCases : [];

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = statusFilter
        ? CrimeVaultCaseStatusFilter.populate(statusFilter, casesToDisplay, Option)
        : "";
    const selectedPriority = priorityFilter ? priorityFilter.value : "";

    const statusFilteredCases = CrimeVaultCaseStatusFilter.filterByStatus(
        casesToDisplay,
        selectedStatus
    );
    const filteredCases = statusFilteredCases.filter(item => {
        const searchableText = [
            item.caseNumber,
            item.title,
            item.caseType,
            item.location
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm)
            && (!selectedPriority || item.priority === selectedPriority);
    });

    caseTableBody.innerHTML = filteredCases.map(item => `
        <tr class="clickable-case-row"
            data-case-number="${escapeHTML(item.caseNumber)}"
            tabindex="0" role="button"
            aria-label="View case ${escapeHTML(item.caseNumber)}">
            <td>${escapeHTML(item.caseNumber)}</td>
            <td>${escapeHTML(item.title)}</td>
            <td>${escapeHTML(item.caseType)}</td>
            <td>${escapeHTML(item.location)}</td>
            <td>
                <span class="priority ${escapeHTML(item.priority.toLowerCase())}">
                    ${escapeHTML(item.priority)}
                </span>
            </td>
            <td>
                <span class="status ${
                    item.status === "Open" ? "open" :
                    item.status === "Closed" ? "closed" : "progress"
                }">
                    ${escapeHTML(item.status)}
                </span>
            </td>
            <td>${escapeHTML(item.dateReported)}</td>
        </tr>
    `).join("");

    if (caseCount) {
        caseCount.textContent =
            `${filteredCases.length} of ${casesToDisplay.length} cases`;
    }

    if (emptyCases) {
        emptyCases.textContent = casesSource === "error"
            ? "Cases could not be loaded from the backend. No database records are shown. Check the backend connection and reload."
            : casesSource === "loading"
                ? "Loading cases from the backend…"
                : "No cases match your search or filters.";
        emptyCases.hidden = filteredCases.length !== 0;
    }
}


if (caseTableBody) {
    caseTableBody.addEventListener("click", event => {
        const row = event.target.closest("tr[data-case-number]");
        if (!row) return;

        const caseNumber = row.dataset.caseNumber;

        // Find the record in the active data source.
        const record = apiCases.find(item => item.caseNumber === caseNumber);

        if (record) {
            openCaseDetails(record);
        } else {
            console.warn(
                "CrimeVault: Case record not found:",
                caseNumber
            );
        }
    });

    caseTableBody.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;

        const row = event.target.closest("tr[data-case-number]");
        if (!row) return;

        event.preventDefault();
        row.click();
    });
}

if (searchInput) searchInput.addEventListener("input", renderCases);
if (statusFilter) statusFilter.addEventListener("change", renderCases);
if (priorityFilter) priorityFilter.addEventListener("change", renderCases);




// -------------------- CASE DETAILS --------------------

function openCaseDetails(record) {
    if (!caseDetailsPanel || !record) return;

    selectedCaseNumber = record.caseNumber;

    const details = {
        "case-details-number": record.caseNumber,
        "detail-case-title": record.title,
        "detail-case-type": record.caseType,
        "detail-case-priority": record.priority,
        "detail-case-status": record.status,
        "detail-case-location": record.location,
        "detail-case-date-reported": record.dateReported,
        "detail-case-date-opened": record.dateOpened || "Not specified",
        "detail-case-description": record.description || "No description provided."
    };

    Object.entries(details).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    caseDetailsPanel.hidden = false;
}

const closeDetailsButton = document.getElementById("close-case-details");

if (closeDetailsButton) {
    closeDetailsButton.addEventListener("click", () => {
        if (caseDetailsPanel) caseDetailsPanel.hidden = true;
    });
}


function setupCaseEditButton() {
    if (!caseDetailsPanel) return;

    const heading = caseDetailsPanel.querySelector(".panel-heading");
    if (!heading || document.getElementById("edit-case-button")) return;

    const button = document.createElement("button");
    button.id = "edit-case-button";
    button.type = "button";
    button.className = "primary-button";
    button.textContent = "Edit Case";

    if (closeDetailsButton && heading.contains(closeDetailsButton)) {
        heading.insertBefore(button, closeDetailsButton);
    } else {
        heading.appendChild(button);
    }

    button.addEventListener("click", () => {
        const record = apiCases.find(item => item.caseNumber === selectedCaseNumber);

        if (record) {
            openCaseForm(record);
        } else {
            console.warn(
                "CrimeVault: Cannot find case to edit:",
                selectedCaseNumber
            );
            alert("The selected case could not be found.");
        }
    });
}


setupCaseEditButton();


// -------------------- CASE CREATE / EDIT --------------------

function openCaseForm(record = null) {
    if (!caseForm || !caseFormPanel) return;

    caseForm.reset();
    editingCaseNumber = record ? record.caseNumber : null;

    const heading = caseFormPanel.querySelector("h2");
    const submitButton = caseForm.querySelector('[type="submit"]');

    if (record) {
        Object.entries(record).forEach(([name, value]) => {
            setFieldValue(caseForm, name, value);
        });

        if (heading) heading.textContent = "Edit Case";
        if (submitButton) submitButton.textContent = "Save Changes";
        if (caseDetailsPanel) caseDetailsPanel.hidden = true;
    } else {
        if (heading) heading.textContent = "Register a Case";
        if (submitButton) submitButton.textContent = "Register Case";
    }

    caseFormPanel.hidden = false;
    caseFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeCaseForm() {
    if (!caseForm || !caseFormPanel) return;

    caseFormPanel.hidden = true;
    caseForm.reset();
    editingCaseNumber = null;
}

const openCaseFormButton = document.getElementById("open-case-form");
const closeCaseFormButton = document.getElementById("close-case-form");
const cancelCaseFormButton = document.getElementById("cancel-case-form");

if (openCaseFormButton) {
    openCaseFormButton.addEventListener("click", () => openCaseForm());
}
if (closeCaseFormButton) {
    closeCaseFormButton.addEventListener("click", closeCaseForm);
}
if (cancelCaseFormButton) {
    cancelCaseFormButton.addEventListener("click", closeCaseForm);
}


if (caseForm) {
    caseForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (!caseForm.reportValidity()) return;

        const data = new FormData(caseForm);

        const record = {
            caseNumber: String(data.get("caseNumber") || "").trim(),
            title: String(data.get("title") || "").trim(),
            caseType: data.get("caseType"),
            priority: data.get("priority"),
            status: data.get("status"),
            location: String(data.get("location") || "").trim(),
            dateReported: data.get("dateReported"),
            dateOpened: data.get("dateOpened"),
            description: String(data.get("description") || "").trim()
        };

        if (record.dateOpened && record.dateOpened < record.dateReported) {
            alert("Date opened cannot be earlier than date reported.");
            return;
        }

        if (casesSource !== "api") {
            alert("Cases are unavailable because the backend data could not be loaded. This record was not saved.");
            return;
        }

        // API-backed case workflow
        if (casesSource === "api") {
            const editingApiCase = editingCaseNumber !== null
                ? apiCases.find(
                    item => item.caseNumber === editingCaseNumber
                )
                : null;

            const duplicate = apiCases.some(item =>
                item.caseNumber.toLowerCase() === record.caseNumber.toLowerCase()
                && item.caseNumber !== editingCaseNumber
            );

            if (duplicate) {
                alert("That case number already exists.");
                return;
            }

            if (editingCaseNumber !== null && !editingApiCase) {
                alert("The case to edit could not be found in the backend records.");
                return;
            }

            try {
                if (editingApiCase) {
                    await CrimeVaultAPI.put(
                        `/cases/${encodeURIComponent(editingApiCase.caseId)}`,
                        record
                    );
                } else {
                    await CrimeVaultAPI.post("/cases", record);
                }

                await loadApiCases();

                closeCaseForm();

                if (searchInput) searchInput.value = "";
                if (statusFilter) statusFilter.value = "";
                if (priorityFilter) priorityFilter.value = "";

                renderCases();

                const savedCase = apiCases.find(
                    item => item.caseNumber === record.caseNumber
                );

                if (savedCase) {
                    selectedCaseNumber = savedCase.caseNumber;
                    openCaseDetails(savedCase);
                }

                alert(
                    editingApiCase
                        ? "Case updated successfully on the backend."
                        : "Case created successfully on the backend."
                );
            } catch (error) {
                console.error("Failed to save API case:", error);
                alert(
                    "Could not save the case to the backend. " +
                    "Check the browser console and confirm the API is running."
                );
            }

            return;
        }

    });
}


/* ============================================================
   INVESTIGATORS — FILTERS AND TABLE
   ============================================================ */

function populateInvestigatorFilters() {
    if (investigatorDepartmentFilter) {
        const current = investigatorDepartmentFilter.value;
        const departments = [
            ...new Set(apiInvestigators.map(item => item.department).filter(Boolean))
        ].sort();

        investigatorDepartmentFilter.innerHTML =
            '<option value="">All Departments</option>'
            + departments.map(value =>
                `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`
            ).join("");

        if (departments.includes(current)) {
            investigatorDepartmentFilter.value = current;
        }
    }

    if (investigatorRankFilter) {
        const current = investigatorRankFilter.value;
        const ranks = [
            ...new Set(apiInvestigators.map(item => item.rank).filter(Boolean))
        ].sort();

        investigatorRankFilter.innerHTML =
            '<option value="">All Ranks</option>'
            + ranks.map(value =>
                `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`
            ).join("");

        if (ranks.includes(current)) investigatorRankFilter.value = current;
    }
}

function renderInvestigators() {
    if (!investigatorTableBody) return;

    populateInvestigatorFilters();

    const query = investigatorSearch
        ? investigatorSearch.value.trim().toLowerCase()
        : "";

    const department = investigatorDepartmentFilter
        ? investigatorDepartmentFilter.value
        : "";

    const rank = investigatorRankFilter
        ? investigatorRankFilter.value
        : "";

    const filtered = apiInvestigators.filter(item => {
        const searchable = [
            item.investigatorId,
            item.name,
            item.badgeNumber,
            item.department,
            item.rank,
            item.contact,
            item.email,
            getAssignedCaseText(item.investigatorId)
        ].join(" ").toLowerCase();

        return searchable.includes(query)
            && (!department || item.department === department)
            && (!rank || item.rank === rank);
    });

    investigatorTableBody.innerHTML = filtered.map(item => `
        <tr class="clickable-case-row"
            data-investigator-id="${escapeHTML(item.investigatorId)}"
            tabindex="0" role="button"
            aria-label="View investigator ${escapeHTML(item.name)}">
            <td>${escapeHTML(item.investigatorId)}</td>
            <td>${escapeHTML(item.name)}</td>
            <td>${escapeHTML(item.badgeNumber)}</td>
            <td>${escapeHTML(item.department)}</td>
            <td>${escapeHTML(item.rank)}</td>
            <td>${escapeHTML(item.contact)}</td>
            <td>${escapeHTML(item.email)}</td>
            <td>${escapeHTML(getAssignedCaseText(item.investigatorId))}</td>
        </tr>
    `).join("");

    if (investigatorCount) {
        investigatorCount.textContent =
        `${filtered.length} of ${apiInvestigators.length} investigators`;
    }

    if (emptyInvestigators) {
        emptyInvestigators.textContent = apiModuleMessage("investigators");
        emptyInvestigators.hidden = filtered.length !== 0;
    }
}

if (investigatorSearch) {
    investigatorSearch.addEventListener("input", renderInvestigators);
}
if (investigatorDepartmentFilter) {
    investigatorDepartmentFilter.addEventListener("change", renderInvestigators);
}
if (investigatorRankFilter) {
    investigatorRankFilter.addEventListener("change", renderInvestigators);
}

if (investigatorTableBody) {
    investigatorTableBody.addEventListener("click", event => {
        const row = event.target.closest("tr[data-investigator-id]");
        if (!row) return;

        const record = getInvestigatorById(row.dataset.investigatorId);
        if (record) openInvestigatorDetails(record);
    });

    investigatorTableBody.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;

        const row = event.target.closest("tr[data-investigator-id]");
        if (!row) return;

        event.preventDefault();
        row.click();
    });
}


// -------------------- INVESTIGATOR DETAILS --------------------

function openInvestigatorDetails(record) {
    if (!investigatorDetailsPanel || !record) return;

    selectedInvestigatorId = record.investigatorId;

    const details = {
        "investigator-details-id": record.investigatorId,
        "detail-investigator-name": record.name,
        "detail-investigator-badge": record.badgeNumber,
        "detail-investigator-department": record.department,
        "detail-investigator-rank": record.rank,
        "detail-investigator-contact": record.contact,
        "detail-investigator-email": record.email
    };

    Object.entries(details).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    let assignmentElement =
        document.getElementById("detail-investigator-assignments");

    if (!assignmentElement) {
        const grid =
            investigatorDetailsPanel.querySelector(".case-details-grid");

        if (grid) {
            const wrapper = document.createElement("div");
            const label = document.createElement("span");
            const value = document.createElement("p");

            label.className = "detail-label";
            label.textContent = "Assigned Case(s)";
            value.id = "detail-investigator-assignments";

            wrapper.append(label, value);
            grid.appendChild(wrapper);
            assignmentElement = value;
        }
    }

    if (assignmentElement) {
        assignmentElement.textContent = getAssignedCaseText(record.investigatorId);
    }

    investigatorDetailsPanel.hidden = false;
}

const closeInvestigatorDetailsButton =
    document.getElementById("close-investigator-details");

if (closeInvestigatorDetailsButton) {
    closeInvestigatorDetailsButton.addEventListener("click", () => {
        if (investigatorDetailsPanel) investigatorDetailsPanel.hidden = true;
    });
}

function setupInvestigatorEditButton() {
    if (!investigatorDetailsPanel) return;

    const heading = investigatorDetailsPanel.querySelector(".panel-heading");

    if (!heading || document.getElementById("edit-investigator-button")) return;

    const button = document.createElement("button");
    button.id = "edit-investigator-button";
    button.type = "button";
    button.className = "primary-button";
    button.textContent = "Edit Investigator";

    if (
        closeInvestigatorDetailsButton &&
        heading.contains(closeInvestigatorDetailsButton)
    ) {
        heading.insertBefore(button, closeInvestigatorDetailsButton);
    } else {
        heading.appendChild(button);
    }

    button.addEventListener("click", () => {
        const record = getInvestigatorById(selectedInvestigatorId);
        if (record) openInvestigatorForm(record);
    });
}

setupInvestigatorEditButton();


// -------------------- INVESTIGATOR CREATE / EDIT --------------------

function openInvestigatorForm(record = null) {
    if (!investigatorForm || !investigatorFormPanel) return;

    investigatorForm.reset();
    editingInvestigatorId = record ? record.investigatorId : null;

    const heading = document.getElementById("investigator-form-heading");
    const submitButton = document.getElementById("save-investigator-button");

    if (record) {
        Object.entries(record).forEach(([name, value]) => {
            setFieldValue(investigatorForm, name, value);
        });

        if (heading) heading.textContent = "Edit Investigator";
        if (submitButton) submitButton.textContent = "Save Changes";
        if (investigatorDetailsPanel) investigatorDetailsPanel.hidden = true;
    } else {
        if (heading) heading.textContent = "Register Investigator";
        if (submitButton) submitButton.textContent = "Register Investigator";
    }

    investigatorFormPanel.hidden = false;
}

function closeInvestigatorForm() {
    if (!investigatorForm || !investigatorFormPanel) return;

    investigatorFormPanel.hidden = true;
    investigatorForm.reset();
    editingInvestigatorId = null;
}

const openInvestigatorFormButton =
    document.getElementById("open-investigator-form");
const closeInvestigatorFormButton =
    document.getElementById("close-investigator-form");
const cancelInvestigatorFormButton =
    document.getElementById("cancel-investigator-form");

if (openInvestigatorFormButton) {
    openInvestigatorFormButton.addEventListener("click", () => openInvestigatorForm());
}
if (closeInvestigatorFormButton) {
    closeInvestigatorFormButton.addEventListener("click", closeInvestigatorForm);
}
if (cancelInvestigatorFormButton) {
    cancelInvestigatorFormButton.addEventListener("click", closeInvestigatorForm);
}

if (investigatorForm) {
    investigatorForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!investigatorForm.reportValidity()) return;

        const data = new FormData(investigatorForm);

        const record = {
            investigatorId: String(data.get("investigatorId") || "").trim(),
            name: String(data.get("name") || "").trim(),
            badgeNumber: String(data.get("badgeNumber") || "").trim(),
            department: String(data.get("department") || "").trim(),
            rank: String(data.get("rank") || "").trim(),
            contact: String(data.get("contact") || "").trim(),
            email: String(data.get("email") || "").trim()
        };

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        const payload = {
            name: record.name,
            badgeNumber: record.badgeNumber,
            department: record.department,
            rank: record.rank,
            contact: record.contact,
            email: record.email
        };
        void saveInvestigator(payload, editingInvestigatorId);
    });
}


// ============================================================
// ASSIGNMENTS — DROPDOWNS
// ============================================================

function populateAssignmentOptions() {
    if (!assignmentForm) return;

    const caseSelect = assignmentForm.elements.namedItem("caseNumber");
    const investigatorSelect =
        assignmentForm.elements.namedItem("investigatorId");

    if (caseSelect) {
        const previousValue = caseSelect.value;

        caseSelect.innerHTML =
            '<option value="">Select a case</option>'
            + apiCases.map(item => `
                <option value="${escapeHTML(item.caseId)}">
                    ${escapeHTML(item.caseNumber)} — ${escapeHTML(item.title)}
                </option>
            `).join("");

        if (apiCases.some(item => String(item.caseId) === previousValue)) {
            caseSelect.value = previousValue;
        }
    }

    if (investigatorSelect) {
        const previousValue = investigatorSelect.value;

        investigatorSelect.innerHTML =
            '<option value="">Select an investigator</option>'
            + apiInvestigators.map(item => `
                <option value="${escapeHTML(item.investigatorId)}">
                    ${escapeHTML(item.investigatorId)} — ${escapeHTML(item.name)}
                </option>
            `).join("");

        if (apiInvestigators.some(item =>
            String(item.investigatorId) === previousValue
        )) {
            investigatorSelect.value = previousValue;
        }
    }
}


// ============================================================
// ASSIGNMENTS — REGISTER AND HISTORY
// ============================================================

function renderAssignments() {
    if (!assignmentTableBody) return;

    const query = assignmentSearch
        ? assignmentSearch.value.trim().toLowerCase()
        : "";

    let selectedStatus = assignmentStatusFilter
        ? assignmentStatusFilter.value
        : "";

    if (assignmentStatusFilter) {
        const statuses = [...new Set(apiAssignments
            .map(assignment => assignment.assignmentStatus)
            .filter(status => status != null && String(status).trim()))];
        assignmentStatusFilter.replaceChildren(
            new Option("All Assignment Statuses", ""),
            ...statuses.map(status => new Option(String(status), String(status)))
        );
        assignmentStatusFilter.value = statuses.some(status =>
            String(status) === selectedStatus
        ) ? selectedStatus : "";
        selectedStatus = assignmentStatusFilter.value;
    }

    const filtered = apiAssignments.filter(assignment => {
        const caseRecord = apiCases.find(item => Number(item.caseId) === Number(assignment.caseId));
        const investigator = getInvestigatorById(assignment.investigatorId);

        const searchable = [
            assignment.assignmentId,
            caseRecord?.caseNumber || assignment.caseId,
            caseRecord?.title || "",
            investigator?.name || "",
            investigator?.badgeNumber || "",
            assignment.assignmentRole,
            assignment.assignmentDate,
            assignment.assignmentStatus
        ].join(" ").toLowerCase();

        return searchable.includes(query)
            && (!selectedStatus || assignment.assignmentStatus?.toLowerCase() === selectedStatus.toLowerCase());
    });

    assignmentTableBody.innerHTML = filtered.map(assignment => {
        const caseRecord = apiCases.find(item => Number(item.caseId) === Number(assignment.caseId));
        const investigator = getInvestigatorById(assignment.investigatorId);

        const action = `<button type="button" class="secondary-button"
                 data-edit-assignment="${escapeHTML(assignment.assignmentId)}">Edit</button>
                 ${assignment.assignmentStatus?.toLowerCase() === "active"
                    ? `<button type="button" class="secondary-button" data-deactivate-assignment="${escapeHTML(assignment.assignmentId)}">Deactivate</button>`
                    : `<span class="muted-text">${escapeHTML(assignment.assignmentStatus || "—")}</span>`}`;

        return `
            <tr>
                <td>${escapeHTML(caseRecord?.caseNumber || `Case ${assignment.caseId}`)}</td>
                <td>${escapeHTML(caseRecord?.title || "Case unavailable")}</td>
                <td>${escapeHTML(investigator?.name || "Investigator unavailable")}</td>
                <td>${escapeHTML(investigator?.badgeNumber || "—")}</td>
                <td>${escapeHTML(assignment.assignmentRole)}</td>
                <td>${escapeHTML(assignment.assignmentDate)}</td>
                <td>
                    <span class="status ${getAssignmentStatusClass(assignment.assignmentStatus)}">
                        ${escapeHTML(assignment.assignmentStatus)}
                    </span>
                </td>
                <td>${action}</td>
            </tr>
        `;
    }).join("");

    if (assignmentCount) {
        assignmentCount.textContent =
            `${filtered.length} of ${apiAssignments.length} assignments`;
    }

    if (emptyAssignments) {
        emptyAssignments.textContent = apiModuleMessage("assignments");
        emptyAssignments.hidden = filtered.length !== 0;
    }

    if (assignmentHistoryBody) {
        assignmentHistoryBody.innerHTML = apiAssignments.map(assignment => `
            <tr>
                <td>${escapeHTML(apiCases.find(item => Number(item.caseId) === Number(assignment.caseId))?.caseNumber || `Case ${assignment.caseId}`)}</td>
                <td>${escapeHTML(getInvestigatorDisplayName(assignment.investigatorId))}</td>
                <td>${escapeHTML(assignment.assignmentRole)}</td>
                <td>${escapeHTML(assignment.assignmentDate)}</td>
                <td>
                    <span class="status ${getAssignmentStatusClass(assignment.assignmentStatus)}">
                        ${escapeHTML(assignment.assignmentStatus)}
                    </span>
                </td>
            </tr>
        `).join("");
    }

    if (emptyAssignmentHistory) {
        emptyAssignmentHistory.textContent = apiModuleMessage("assignments");
        emptyAssignmentHistory.hidden = apiAssignments.length !== 0;
    }
}


// -------------------- ASSIGNMENT FORM --------------------

function openAssignmentForm(record = null) {
    if (!assignmentForm || !assignmentFormPanel) return;

    assignmentForm.reset();
    populateAssignmentOptions();
    editingAssignmentId = record ? record.assignmentId : null;

    const statusSelect = assignmentForm.elements.namedItem("assignmentStatus");
    statusSelect?.querySelector('option[data-existing-status="true"]')?.remove();
    if (record?.assignmentStatus && statusSelect && ![...statusSelect.options].some(option => option.value === String(record.assignmentStatus))) {
        const existingStatus = new Option(String(record.assignmentStatus), String(record.assignmentStatus));
        existingStatus.dataset.existingStatus = "true";
        statusSelect.add(existingStatus);
    }

    const heading = document.getElementById("assignment-form-heading");
    const submit = assignmentForm.querySelector('[type="submit"]');
    if (record) {
        setFieldValue(assignmentForm, "caseNumber", record.caseId);
        setFieldValue(assignmentForm, "investigatorId", record.investigatorId);
        setFieldValue(assignmentForm, "assignmentRole", record.assignmentRole);
        setFieldValue(assignmentForm, "assignmentDate", record.assignmentDate);
        setFieldValue(assignmentForm, "assignmentStatus", record.assignmentStatus);
        if (heading) heading.textContent = "Edit Assignment";
        if (submit) submit.textContent = "Save Changes";
    } else {
        if (heading) heading.textContent = "Assign Investigator";
        if (submit) submit.textContent = "Save Assignment";
    }

    const dateField = assignmentForm.elements.namedItem("assignmentDate");

    if (dateField && !record) {
        dateField.value = new Date().toISOString().slice(0, 10);
    }

    assignmentFormPanel.hidden = false;
}

function closeAssignmentForm() {
    if (!assignmentForm || !assignmentFormPanel) return;

    assignmentFormPanel.hidden = true;
    assignmentForm.reset();
    editingAssignmentId = null;
    const heading = document.getElementById("assignment-form-heading");
    const submit = assignmentForm.querySelector('[type="submit"]');
    if (heading) heading.textContent = "Assign Investigator";
    if (submit) submit.textContent = "Save Assignment";
}

const openAssignmentFormButton =
    document.getElementById("open-assignment-form");
const closeAssignmentFormButton =
    document.getElementById("close-assignment-form");
const cancelAssignmentFormButton =
    document.getElementById("cancel-assignment-form");

if (openAssignmentFormButton) {
    openAssignmentFormButton.addEventListener("click", openAssignmentForm);
}
if (closeAssignmentFormButton) {
    closeAssignmentFormButton.addEventListener("click", closeAssignmentForm);
}
if (cancelAssignmentFormButton) {
    cancelAssignmentFormButton.addEventListener("click", closeAssignmentForm);
}

if (assignmentForm) {
    assignmentForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!assignmentForm.reportValidity()) return;
        if (["assignments", "investigators"].some(name => moduleLoadState[name] !== "api")
            || casesSource !== "api") {
            alert("Assignments, investigators, and cases must load successfully before saving an assignment.");
            return;
        }

        const data = new FormData(assignmentForm);

        const caseId = apiId(data.get("caseNumber"));
        const investigatorId = apiId(data.get("investigatorId"));
        const assignmentRole = String(data.get("assignmentRole") || "").trim();
        const assignmentDate = String(data.get("assignmentDate") || "").trim();
        const assignmentStatus = String(data.get("assignmentStatus") || "Active").trim();

        if (!caseId || !apiCases.some(item => Number(item.caseId) === caseId)) {
            alert("Please select a valid case.");
            return;
        }

        if (!investigatorId || !getInvestigatorById(investigatorId)) {
            alert("Please select a valid investigator.");
            return;
        }

        const duplicateActive = assignmentStatus.toLowerCase() === "active" && apiAssignments.some(assignment =>
            Number(assignment.caseId) === caseId
            && Number(assignment.investigatorId) === investigatorId
            && String(assignment.assignmentId) !== String(editingAssignmentId)
            && assignment.assignmentStatus?.toLowerCase() === "active"
        );

        if (duplicateActive) {
            alert("This investigator is already actively assigned to this case.");
            return;
        }

        const assignment = {
            caseId,
            investigatorId,
            assignmentDate,
            assignmentRole,
            assignmentStatus
        };
        void saveAssignment(assignment, editingAssignmentId);
    });
}

if (assignmentTableBody) {
    assignmentTableBody.addEventListener("click", event => {
        const button = event.target.closest(
            "button[data-deactivate-assignment]"
        );

        if (!button) return;

        const assignment = apiAssignments.find(
            item => String(item.assignmentId) === button.dataset.deactivateAssignment
        );

        if (!assignment || assignment.assignmentStatus?.toLowerCase() !== "active") return;

        if (!confirm(
            `Deactivate assignment for case ${assignment.caseId}? Its history will be retained.`
        )) {
            return;
        }

        void saveAssignment({
            caseId: assignment.caseId,
            investigatorId: assignment.investigatorId,
            assignmentDate: assignment.assignmentDate,
            assignmentRole: assignment.assignmentRole,
            assignmentStatus: "Inactive"
        }, assignment.assignmentId);
    });

    assignmentTableBody.addEventListener("click", event => {
        const button = event.target.closest("button[data-edit-assignment]");
        if (!button) return;
        const assignment = apiAssignments.find(item => String(item.assignmentId) === button.dataset.editAssignment);
        if (assignment) openAssignmentForm(assignment);
    });
}

if (assignmentSearch) {
    assignmentSearch.addEventListener("input", renderAssignments);
}
if (assignmentStatusFilter) {
    assignmentStatusFilter.addEventListener("change", renderAssignments);
}

/* ============================================================
   PEOPLE — TABLE AND FILTERS
   ============================================================ */

function renderPeople() {
    if (!peopleTableBody) return;

    const query = personSearch
        ? personSearch.value.trim().toLowerCase()
        : "";

    const filtered = apiPeople.filter(person => {
        const searchable = [
            person.personId,
            person.name,
            person.dateOfBirth,
            person.gender,
            person.contact,
            person.address,
            getPersonCaseText(person.personId)
        ].join(" ").toLowerCase();

        return searchable.includes(query);
    });

    peopleTableBody.innerHTML = filtered.map(person => `
        <tr class="clickable-case-row"
            data-person-id="${escapeHTML(person.personId)}"
            tabindex="0" role="button"
            aria-label="View person ${escapeHTML(person.name)}">
            <td>${escapeHTML(person.personId)}</td>
            <td>${escapeHTML(person.name)}</td>
            <td>${escapeHTML(person.dateOfBirth || "Not provided")}</td>
            <td>${escapeHTML(person.contact || "Not provided")}</td>
            <td>${escapeHTML(person.gender || "Not provided")}</td>
            <td>${escapeHTML(getPersonCaseText(person.personId))}</td>
        </tr>
    `).join("");

    if (personCount) {
        personCount.textContent =
            `${filtered.length} of ${apiPeople.length} people`;
    }

    if (emptyPeople) {
        emptyPeople.textContent = apiModuleMessage("people");
        emptyPeople.hidden = filtered.length !== 0;
    }
}

if (personSearch) {
    personSearch.addEventListener("input", renderPeople);
}

if (peopleTableBody) {
    peopleTableBody.addEventListener("click", event => {
        const row = event.target.closest("tr[data-person-id]");
        if (!row) return;

        const person = getPersonById(row.dataset.personId);
        if (person) openPersonDetails(person);
    });

    peopleTableBody.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;

        const row = event.target.closest("tr[data-person-id]");
        if (!row) return;

        event.preventDefault();
        row.click();
    });
}


// ============================================================
// PEOPLE — DETAILS POPUP
// ============================================================

function openPersonDetails(person) {
    if (!personDetailsPanel || !person) return;

    selectedPersonId = person.personId;

    const details = {
        "detail-person-id": person.personId,
        "detail-person-name": person.name,
        "detail-person-dob": person.dateOfBirth || "Not provided",
        "detail-person-contact": person.contact || "Not provided",
        "detail-person-gender": person.gender || "Not provided",
        "detail-person-address": person.address || "Not provided",
        "detail-person-cases": getPersonCaseText(person.personId)
    };

    Object.entries(details).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    personDetailsPanel.hidden = false;
}

const closePersonDetailsButton =
    document.getElementById("close-person-details");

if (closePersonDetailsButton) {
    closePersonDetailsButton.addEventListener("click", () => {
        if (personDetailsPanel) personDetailsPanel.hidden = true;
    });
}

function setupPersonEditButton() {
    if (!personDetailsPanel) return;

    const heading = personDetailsPanel.querySelector(".panel-heading");

    if (!heading || document.getElementById("edit-person-button")) return;

    const button = document.createElement("button");
    button.id = "edit-person-button";
    button.type = "button";
    button.className = "primary-button";
    button.textContent = "Edit Person";

    if (
        closePersonDetailsButton &&
        heading.contains(closePersonDetailsButton)
    ) {
        heading.insertBefore(button, closePersonDetailsButton);
    } else {
        heading.appendChild(button);
    }

    button.addEventListener("click", () => {
        const person = getPersonById(selectedPersonId);
        if (person) openPersonForm(person);
    });
}

setupPersonEditButton();


// ============================================================
// PEOPLE — CREATE AND EDIT FORM
// ============================================================

function openPersonForm(person = null) {
    if (!personForm || !personFormPanel) return;

    personForm.reset();
    editingPersonId = person ? person.personId : null;

    const heading = document.getElementById("person-form-heading");
    const submitButton = document.getElementById("save-person-button");

    if (person) {
        Object.entries(person).forEach(([name, value]) => {
            setFieldValue(personForm, name, value);
        });

        if (heading) heading.textContent = "Edit Person";
        if (submitButton) submitButton.textContent = "Save Changes";

        if (personDetailsPanel) personDetailsPanel.hidden = true;
    } else {
        if (heading) heading.textContent = "Register Person";
        if (submitButton) submitButton.textContent = "Register Person";
    }

    personFormPanel.hidden = false;
}

function closePersonForm() {
    if (!personForm || !personFormPanel) return;

    personFormPanel.hidden = true;
    personForm.reset();
    editingPersonId = null;

    const heading = document.getElementById("person-form-heading");
    const submitButton = document.getElementById("save-person-button");

    if (heading) heading.textContent = "Register Person";
    if (submitButton) submitButton.textContent = "Register Person";
}

const openPersonFormButton = document.getElementById("open-person-form");
const closePersonFormButton = document.getElementById("close-person-form");
const cancelPersonFormButton = document.getElementById("cancel-person-form");

if (openPersonFormButton) {
    openPersonFormButton.addEventListener("click", () => openPersonForm());
}
if (closePersonFormButton) {
    closePersonFormButton.addEventListener("click", closePersonForm);
}
if (cancelPersonFormButton) {
    cancelPersonFormButton.addEventListener("click", closePersonForm);
}

if (personForm) {
    personForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!personForm.reportValidity()) return;

        const data = new FormData(personForm);

        const record = {
            name: String(data.get("name") || "").trim(),
            dateOfBirth: String(data.get("dateOfBirth") || "").trim() || null,
            gender: String(data.get("gender") || "").trim(),
            contact: String(data.get("contact") || "").trim(),
            address: String(data.get("address") || "").trim()
        };
        void savePerson(record, editingPersonId);
    });
}


// ============================================================
// CASE-PERSON ASSOCIATIONS — API-BACKED MODULE
// ============================================================

const casePersonForm = document.getElementById("case-person-form");
const casePersonFormPanel = document.getElementById("case-person-form-panel");
const casePersonTableBody = document.getElementById("case-person-table-body");
const casePersonCount = document.getElementById("case-person-count");
const emptyCasePeople = document.getElementById("empty-case-people");
const casePersonSearch = document.getElementById("case-person-search");
const casePersonRoleFilter = document.getElementById("case-person-role-filter");

function populateCasePersonOptions() {
    if (!casePersonForm) return;

    const caseSelect = casePersonForm.elements.namedItem("caseNumber");
    const personSelect = casePersonForm.elements.namedItem("personId");

    if (caseSelect) {
        const previousValue = caseSelect.value;

        caseSelect.innerHTML =
            '<option value="">Select a case</option>'
            + apiCases.map(item => `
                <option value="${escapeHTML(item.caseId)}">
                    ${escapeHTML(item.caseNumber)} — ${escapeHTML(item.title)}
                </option>
            `).join("");

        if (apiCases.some(item => String(item.caseId) === previousValue)) {
            caseSelect.value = previousValue;
        }
    }

    if (personSelect) {
        const previousValue = personSelect.value;

        personSelect.innerHTML =
            '<option value="">Select a person</option>'
            + apiPeople.map(item => `
                <option value="${escapeHTML(item.personId)}">
                    ${escapeHTML(item.personId)} — ${escapeHTML(item.name)}
                </option>
            `).join("");

        if (apiPeople.some(item => String(item.personId) === previousValue)) {
            personSelect.value = previousValue;
        }
    }
}



function renderCasePeople() {
    if (!casePersonTableBody) return;

    const query = casePersonSearch
        ? casePersonSearch.value.trim().toLowerCase()
        : "";

    const selectedRelationship = casePersonRoleFilter
        ? casePersonRoleFilter.value
        : "";

    const filtered = apiCasePeople.filter(link => {
        const caseRecord = apiCases.find(item => Number(item.caseId) === Number(link.caseId));
        const person = getPersonById(link.personId);

        const searchable = [
            caseRecord?.caseNumber || link.caseId,
            caseRecord?.title || "",
            link.personId,
            person?.name || "",
            link.role
        ].join(" ").toLowerCase();

        return searchable.includes(query)
            && (!selectedRelationship || link.role === selectedRelationship);
    });

    casePersonTableBody.innerHTML = filtered.map(link => {
        const caseRecord = apiCases.find(item => Number(item.caseId) === Number(link.caseId));
        const person = getPersonById(link.personId);

        return `
            <tr>
                <td>${escapeHTML(caseRecord?.caseNumber || `Case ${link.caseId}`)}</td>
                <td>${escapeHTML(caseRecord?.title || "Case unavailable")}</td>
                <td>${escapeHTML(link.personId)}</td>
                <td>${escapeHTML(person?.name || "Person unavailable")}</td>
                <td>${escapeHTML(link.role)}</td>
            </tr>
        `;
    }).join("");

    if (casePersonCount) {
        casePersonCount.textContent =
            `${filtered.length} of ${apiCasePeople.length} associations`;
    }

    if (emptyCasePeople) {
        emptyCasePeople.textContent = apiModuleMessage("casePeople");
        emptyCasePeople.hidden = filtered.length !== 0;
    }
}

function openCasePersonForm() {
    if (!casePersonForm || !casePersonFormPanel) return;

    casePersonForm.reset();
    populateCasePersonOptions();
    casePersonFormPanel.hidden = false;
}

function closeCasePersonForm() {
    if (!casePersonForm || !casePersonFormPanel) return;

    casePersonFormPanel.hidden = true;
    casePersonForm.reset();
}

const openCasePersonFormButton =
    document.getElementById("open-case-person-form");
const closeCasePersonFormButton =
    document.getElementById("close-case-person-form");
const cancelCasePersonFormButton =
    document.getElementById("cancel-case-person-form");

if (openCasePersonFormButton) {
    openCasePersonFormButton.addEventListener("click", openCasePersonForm);
}
if (closeCasePersonFormButton) {
    closeCasePersonFormButton.addEventListener("click", closeCasePersonForm);
}
if (cancelCasePersonFormButton) {
    cancelCasePersonFormButton.addEventListener("click", closeCasePersonForm);
}

if (casePersonForm) {
    casePersonForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!casePersonForm.reportValidity()) return;
        if (moduleLoadState.casePeople !== "api" || moduleLoadState.people !== "api"
            || casesSource !== "api") {
            alert("Cases, people, and existing relationships must load successfully before saving this link.");
            return;
        }

        const data = new FormData(casePersonForm);

        const caseId = apiId(data.get("caseNumber"));
        const personId = apiId(data.get("personId"));
        const role = String(data.get("role") || "").trim();

        if (!caseId || !apiCases.some(item => Number(item.caseId) === caseId)) {
            alert("Please select a valid case.");
            return;
        }

        if (!getPersonById(personId)) {
            alert("Please select a valid person.");
            return;
        }

        const duplicate = apiCasePeople.some(link =>
            Number(link.caseId) === caseId &&
            Number(link.personId) === personId
        );

        if (duplicate) {
            alert("This person is already linked to this case.");
            return;
        }

        void saveCasePerson({ caseId, personId, role });
    });
}

if (casePersonSearch) {
    casePersonSearch.addEventListener("input", renderCasePeople);
}
if (casePersonRoleFilter) {
    casePersonRoleFilter.addEventListener("change", renderCasePeople);
}



// ============================================================
// INITIALIZATION
// ============================================================

async function loadApiPeople() {
    try {
        const rows = await CrimeVaultAPI.get("/people");
        if (!Array.isArray(rows)) throw new Error("People API response must be an array.");
        apiPeople = rows;
        moduleLoadState.people = "api";
    } catch (error) {
        console.error("Failed to load people:", error);
        apiPeople = [];
        moduleLoadState.people = "error";
    }
    renderPeople();
    populateCasePersonOptions();
    renderCasePeople();
    return moduleLoadState.people === "api";
}

async function loadApiInvestigators() {
    try {
        const rows = await CrimeVaultAPI.get("/investigators");
        if (!Array.isArray(rows)) throw new Error("Investigators API response must be an array.");
        apiInvestigators = rows;
        moduleLoadState.investigators = "api";
    } catch (error) {
        console.error("Failed to load investigators:", error);
        apiInvestigators = [];
        moduleLoadState.investigators = "error";
    }
    renderInvestigators();
    populateAssignmentOptions();
    populateCustodyInvestigatorOptions();
    renderAssignments();
    updateDashboardFromApi();
    return moduleLoadState.investigators === "api";
}

async function loadApiAssignments() {
    try {
        const rows = await CrimeVaultAPI.get("/assignments");
        if (!Array.isArray(rows)) throw new Error("Assignments API response must be an array.");
        apiAssignments = rows;
        moduleLoadState.assignments = "api";
    } catch (error) {
        console.error("Failed to load assignments:", error);
        apiAssignments = [];
        moduleLoadState.assignments = "error";
    }
    renderAssignments();
    renderInvestigators();
    return moduleLoadState.assignments === "api";
}

async function saveAssignment(payload, assignmentId) {
    if (moduleSaving.assignments) return;
    moduleSaving.assignments = true;
    const button = assignmentForm?.querySelector('[type="submit"]');
    if (button) button.disabled = true;
    try {
        const saved = assignmentId === null
            ? await CrimeVaultAPI.post("/assignments", payload)
            : await CrimeVaultAPI.put(`/assignments/${encodeURIComponent(assignmentId)}`, payload);
        if (!saved || !apiId(saved.assignmentId)) throw new Error("The server did not return a saved assignment ID.");
        await loadApiAssignments();
        closeAssignmentForm();
        if (assignmentSearch) assignmentSearch.value = "";
        if (assignmentStatusFilter) assignmentStatusFilter.value = "";
        renderAssignments();
        alert(moduleLoadState.assignments === "api"
            ? `Assignment ${assignmentId === null ? "created" : "updated"} successfully.`
            : "The server confirmed the save, but the assignment list could not be refreshed.");
    } catch (error) {
        console.error("Failed to save assignment:", error);
        alert(`Assignment was not saved: ${error.message}`);
    } finally {
        moduleSaving.assignments = false;
        if (button) button.disabled = false;
    }
}

async function loadApiCasePeople() {
    try {
        const rows = await CrimeVaultAPI.get("/case-people");
        if (!Array.isArray(rows)) throw new Error("Case-person API response must be an array.");
        apiCasePeople = rows;
        moduleLoadState.casePeople = "api";
    } catch (error) {
        console.error("Failed to load case-person relationships:", error);
        apiCasePeople = [];
        moduleLoadState.casePeople = "error";
    }
    renderCasePeople();
    renderPeople();
    return moduleLoadState.casePeople === "api";
}

function updateDashboardFromApi() {
    const setMetric = (valueId, value, label) => {
        const valueNode = document.getElementById(valueId);
        const descriptionNode = valueNode?.parentElement?.querySelector("p");
        if (valueNode) valueNode.textContent = value;
        if (descriptionNode) descriptionNode.textContent = label;
    };
    setMetric("total-cases",
        casesSource === "api" ? String(apiCases.length) : "Unavailable",
        casesSource === "api" ? "Backend records" : "Backend unavailable");
    setMetric("total-investigators",
        moduleLoadState.investigators === "api" ? String(apiInvestigators.length) : "Unavailable",
        moduleLoadState.investigators === "api" ? "Backend records" : "Backend unavailable");
    const source = document.getElementById("dashboard-source");
    if (source) {
        const casesLabel = casesSource === "api" ? "Cases connected" : "Cases unavailable";
        const investigatorsLabel = moduleLoadState.investigators === "api"
            ? "Investigators connected" : "Investigators unavailable";
        source.textContent = `${casesLabel} · ${investigatorsLabel}`;
    }

    const recent = document.getElementById("recent-cases");
    if (!recent) return;
    recent.replaceChildren();
    if (casesSource !== "api") {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "Recent cases are unavailable because the backend could not be reached.";
        row.appendChild(cell);
        recent.appendChild(row);
        return;
    }
    apiCases.slice(-3).reverse().forEach(record => {
        const row = document.createElement("tr");
        [record.caseNumber, record.title, record.caseType, record.priority, record.status]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value ?? "";
                row.appendChild(cell);
            });
        recent.appendChild(row);
    });
    if (apiCases.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "No case records are available.";
        row.appendChild(cell);
        recent.appendChild(row);
    }
    document.dispatchEvent(new Event("crimevault:dashboard-refresh"));
}

async function savePerson(payload, personId) {
    if (moduleSaving.people) return;
    moduleSaving.people = true;
    const button = document.getElementById("save-person-button");
    if (button) button.disabled = true;
    try {
        const saved = personId === null
            ? await CrimeVaultAPI.post("/people", payload)
            : await CrimeVaultAPI.put(`/people/${encodeURIComponent(personId)}`, payload);
        if (!saved || !apiId(saved.personId)) throw new Error("The server did not return a saved person ID.");
        await loadApiPeople();
        closePersonForm();
        renderPeople();
        if (personId !== null) {
            selectedPersonId = saved.personId;
            const fresh = getPersonById(saved.personId);
            if (fresh) openPersonDetails(fresh);
        }
        alert(moduleLoadState.people === "api"
            ? `Person ${personId === null ? "registered" : "updated"} successfully.`
            : "The server confirmed the save, but the people list could not be refreshed.");
    } catch (error) {
        console.error("Failed to save person:", error);
        alert(`Person was not saved: ${error.message}`);
    } finally {
        moduleSaving.people = false;
        if (button) button.disabled = false;
    }
}

async function saveInvestigator(payload, investigatorId) {
    if (moduleSaving.investigators) return;
    moduleSaving.investigators = true;
    const button = document.getElementById("save-investigator-button");
    if (button) button.disabled = true;
    try {
        const saved = investigatorId === null
            ? await CrimeVaultAPI.post("/investigators", payload)
            : await CrimeVaultAPI.put(`/investigators/${encodeURIComponent(investigatorId)}`, payload);
        if (!saved || !apiId(saved.investigatorId)) throw new Error("The server did not return a saved investigator ID.");
        await loadApiInvestigators();
        closeInvestigatorForm();
        if (investigatorId !== null) {
            selectedInvestigatorId = saved.investigatorId;
            const fresh = getInvestigatorById(saved.investigatorId);
            if (fresh) openInvestigatorDetails(fresh);
        }
        alert(moduleLoadState.investigators === "api"
            ? `Investigator ${investigatorId === null ? "registered" : "updated"} successfully.`
            : "The server confirmed the save, but the investigator list could not be refreshed.");
    } catch (error) {
        console.error("Failed to save investigator:", error);
        alert(`Investigator was not saved: ${error.message}`);
    } finally {
        moduleSaving.investigators = false;
        if (button) button.disabled = false;
    }
}

async function saveCasePerson(payload) {
    if (moduleSaving.casePeople) return;
    moduleSaving.casePeople = true;
    const button = casePersonForm?.querySelector('[type="submit"]');
    if (button) button.disabled = true;
    try {
        await CrimeVaultAPI.post("/case-people", payload);
        await loadApiCasePeople();
        closeCasePersonForm();
        alert(moduleLoadState.casePeople === "api"
            ? "Case-person relationship saved successfully."
            : "The server confirmed the relationship save, but the list could not be refreshed.");
    } catch (error) {
        console.error("Failed to save case-person relationship:", error);
        alert(`Relationship was not saved: ${error.message}`);
    } finally {
        moduleSaving.casePeople = false;
        if (button) button.disabled = false;
    }
}


populateInvestigatorFilters();
populateAssignmentOptions();
populateCasePersonOptions();

// Render honest loading states until the API responds.
renderCases();
renderInvestigators();
renderAssignments();
renderPeople();
renderCasePeople();
updateDashboardFromApi();

// Load only the resources supported by existing backend routes.
void Promise.all([
    loadApiCases(),
    loadApiPeople(),
    loadApiInvestigators(),
    loadApiAssignments(),
    loadApiCasePeople()
]);


activateView("dashboard");
