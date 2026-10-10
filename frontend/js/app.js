
"use strict";

// ============================================================
// CRIMEVAULT — FRONTEND DEMO APPLICATION
// All records are stored in browser memory.
// No database/API connection is implemented yet.
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

const viewTitles = {
    dashboard: "Dashboard",
    cases: "Cases",
    investigators: "Investigators",
    assignments: "Case Assignments",
    people: "People",
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

// ============================================================
// DEMO DATA — CASES
// ============================================================

const demoCases = [
    {
        caseNumber: "CV-1001",
        title: "Demo investigation Alpha",
        caseType: "Theft",
        priority: "High",
        status: "Open",
        location: "Demo location A",
        dateReported: "2026-10-01",
        dateOpened: "2026-10-01",
        description: "Fictional sample case."
    },
    {
        caseNumber: "CV-1002",
        title: "Demo investigation Bravo",
        caseType: "Fraud",
        priority: "Medium",
        status: "In Progress",
        location: "Demo location B",
        dateReported: "2026-10-02",
        dateOpened: "2026-10-02",
        description: "Fictional sample case."
    },
    {
        caseNumber: "CV-1003",
        title: "Demo investigation Charlie",
        caseType: "Burglary",
        priority: "Low",
        status: "Closed",
        location: "Demo location C",
        dateReported: "2026-10-03",
        dateOpened: "2026-10-03",
        description: "Fictional sample case."
    }
];

// ============================================================
// DEMO DATA — INVESTIGATORS
// ============================================================

const demoInvestigators = [
    {
        investigatorId: "INV-1001",
        name: "Demo Investigator Alpha",
        badgeNumber: "BADGE-1001",
        department: "Major Crimes",
        rank: "Inspector",
        contact: "0000000001",
        email: "alpha.demo@example.com"
    },
    {
        investigatorId: "INV-1002",
        name: "Demo Investigator Bravo",
        badgeNumber: "BADGE-1002",
        department: "Cybercrime",
        rank: "Sub-Inspector",
        contact: "9494949494",
        email: "bravo.demo@example.com"
    },
    {
        investigatorId: "INV-1003",
        name: "Demo Investigator Charlie",
        badgeNumber: "BADGE-1003",
        department: "Forensics",
        rank: "Inspector",
        contact: "0000000003",
        email: "charlie.demo@example.com"
    },
    {
        investigatorId: "INV-1004",
        name: "Demo Investigator Bravo",
        badgeNumber: "BADGE-1007",
        department: "Cybercrime",
        rank: "Sub-Inspector",
        contact: "88788787",
        email: "bravo.demo@example.com"
    }
];

// ============================================================
// DEMO DATA — CASE ASSIGNMENTS
//
// Each assignment is a separate relationship between a case
// and an investigator. Inactive records are retained.
// ============================================================

const demoCaseAssignments = [
    {
        assignmentId: "ASN-1001",
        caseNumber: "CV-1001",
        investigatorId: "INV-1001",
        assignmentDate: "2026-10-01",
        assignmentRole: "Lead Investigator",
        assignmentStatus: "Active",
        inactiveDate: ""
    },
    {
        assignmentId: "ASN-1002",
        caseNumber: "CV-1002",
        investigatorId: "INV-1002",
        assignmentDate: "2026-10-02",
        assignmentRole: "Supporting Investigator",
        assignmentStatus: "Active",
        inactiveDate: ""
    }
];

// ============================================================
// SHARED HELPERS
// ============================================================

let editingCaseNumber = null;
let selectedCaseNumber = null;
let editingInvestigatorId = null;
let selectedInvestigatorId = null;

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

    if (field) {
        field.value = value ?? "";
    }
}

function getCaseByNumber(caseNumber) {
    return demoCases.find(item => item.caseNumber === caseNumber);
}

function getInvestigatorById(investigatorId) {
    return demoInvestigators.find(
        item => item.investigatorId === investigatorId
    );
}

function getActiveAssignments(investigatorId) {
    return demoCaseAssignments.filter(assignment =>
        assignment.investigatorId === investigatorId
        && assignment.assignmentStatus === "Active"
    );
}

function getAssignedCaseText(investigatorId) {
    const assignments = getActiveAssignments(investigatorId);

    if (assignments.length === 0) {
        return "Unassigned";
    }

    return assignments.map(assignment => {
        const caseRecord = getCaseByNumber(assignment.caseNumber);

        return caseRecord
            ? `${assignment.caseNumber}`
            : assignment.caseNumber;
    }).join(", ");
}

function getInvestigatorDisplayName(investigatorId) {
    const investigator = getInvestigatorById(investigatorId);

    return investigator
        ? investigator.name
        : "Unknown investigator";
}

function getAssignmentStatusClass(status) {
    return status === "Active" ? "open" : "closed";
}

// ============================================================
// NAVIGATION
// ============================================================

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

    dashboardSections.forEach(section => {
        if (section) {
            section.hidden =
                showCases || showInvestigators || showAssignments;
        }
    });

    if (casesView) {
        casesView.hidden = !showCases;
    }

    if (investigatorsView) {
        investigatorsView.hidden = !showInvestigators;
    }

    if (assignmentsView) {
        assignmentsView.hidden = !showAssignments;
    }

    if (
        viewName !== "dashboard"
        && !showCases
        && !showInvestigators
        && !showAssignments
    ) {
        console.log(
            `${viewName} module is planned but not implemented yet.`
        );
    }

    if (showCases) renderCases();
    if (showInvestigators) renderInvestigators();

    if (showAssignments) {
        populateAssignmentOptions();
        renderAssignments();
    }
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
// CASES — TABLE, SEARCH AND FILTERS
// ============================================================

function renderCases() {
    if (!caseTableBody) return;

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = statusFilter ? statusFilter.value : "";
    const selectedPriority = priorityFilter ? priorityFilter.value : "";

    const filteredCases = demoCases.filter(item => {
        const searchableText = [
            item.caseNumber,
            item.title,
            item.caseType,
            item.location
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm)
            && (!selectedStatus || item.status === selectedStatus)
            && (!selectedPriority || item.priority === selectedPriority);
    });

    caseTableBody.innerHTML = filteredCases.map(item => `
        <tr
            class="clickable-case-row"
            data-case-number="${escapeHTML(item.caseNumber)}"
            tabindex="0"
            role="button"
            aria-label="View case ${escapeHTML(item.caseNumber)}"
        >
            <td>${escapeHTML(item.caseNumber)}</td>
            <td>${escapeHTML(item.title)}</td>
            <td>${escapeHTML(item.caseType)}</td>
            <td>${escapeHTML(item.location)}</td>
            <td>
                <span class="priority ${item.priority.toLowerCase()}">
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
            `${filteredCases.length} of ${demoCases.length} cases`;
    }

    if (emptyCases) {
        emptyCases.hidden = filteredCases.length !== 0;
    }
}

if (caseTableBody) {
    caseTableBody.addEventListener("click", event => {
        const row = event.target.closest("tr[data-case-number]");
        if (!row) return;

        const record = getCaseByNumber(row.dataset.caseNumber);

        if (record) openCaseDetails(record);
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

// ============================================================
// CASES — DETAILS POPUP
// ============================================================

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
        "detail-case-description":
            record.description || "No description provided."
    };

    Object.entries(details).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) element.textContent = value;
    });

    caseDetailsPanel.hidden = false;
}

const closeDetailsButton =
    document.getElementById("close-case-details");

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
        const record = getCaseByNumber(selectedCaseNumber);

        if (record) openCaseForm(record);
    });
}

setupCaseEditButton();

// ============================================================
// CASES — CREATE AND EDIT FORM
// ============================================================

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
    caseFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeCaseForm() {
    if (!caseForm || !caseFormPanel) return;

    caseFormPanel.hidden = true;
    caseForm.reset();
    editingCaseNumber = null;

    const heading = caseFormPanel.querySelector("h2");
    const submitButton = caseForm.querySelector('[type="submit"]');

    if (heading) heading.textContent = "Register a Case";
    if (submitButton) submitButton.textContent = "Register Case";
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
    caseForm.addEventListener("submit", event => {
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

        const duplicate = demoCases.some(item =>
            item.caseNumber.toLowerCase() === record.caseNumber.toLowerCase()
            && item.caseNumber !== editingCaseNumber
        );

        if (duplicate) {
            alert("That case number already exists.");
            return;
        }

        if (record.dateOpened && record.dateOpened < record.dateReported) {
            alert("Date opened cannot be earlier than date reported.");
            return;
        }

        if (editingCaseNumber !== null) {
            const index = demoCases.findIndex(
                item => item.caseNumber === editingCaseNumber
            );

            if (index < 0) {
                alert("Case not found.");
                return;
            }

            demoCases[index] = record;
            selectedCaseNumber = record.caseNumber;

            closeCaseForm();

            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "";
            if (priorityFilter) priorityFilter.value = "";

            renderCases();
            renderAssignments();
            openCaseDetails(record);

            alert("Demo case updated. Not saved to the database.");
        } else {
            demoCases.unshift(record);

            closeCaseForm();

            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "";
            if (priorityFilter) priorityFilter.value = "";

            renderCases();
            populateAssignmentOptions();
            renderAssignments();

            alert("Demo case added. Not saved to the database.");
        }
    });
}

// ============================================================
// INVESTIGATORS — FILTER OPTIONS
// ============================================================

function populateInvestigatorFilters() {
    if (investigatorDepartmentFilter) {
        const currentDepartment = investigatorDepartmentFilter.value;

        const departments = [
            ...new Set(demoInvestigators.map(item => item.department))
        ].sort();

        investigatorDepartmentFilter.innerHTML =
            '<option value="">All Departments</option>'
            + departments.map(department => `
                <option value="${escapeHTML(department)}">
                    ${escapeHTML(department)}
                </option>
            `).join("");

        if (departments.includes(currentDepartment)) {
            investigatorDepartmentFilter.value = currentDepartment;
        }
    }

    if (investigatorRankFilter) {
        const currentRank = investigatorRankFilter.value;

        const ranks = [
            ...new Set(demoInvestigators.map(item => item.rank))
        ].sort();

        investigatorRankFilter.innerHTML =
            '<option value="">All Ranks</option>'
            + ranks.map(rank => `
                <option value="${escapeHTML(rank)}">
                    ${escapeHTML(rank)}
                </option>
            `).join("");

        if (ranks.includes(currentRank)) {
            investigatorRankFilter.value = currentRank;
        }
    }
}

// ============================================================
// INVESTIGATORS — TABLE, SEARCH AND FILTERS
// ============================================================

function renderInvestigators() {
    if (!investigatorTableBody) return;

    populateInvestigatorFilters();

    const query = investigatorSearch
        ? investigatorSearch.value.trim().toLowerCase()
        : "";

    const selectedDepartment = investigatorDepartmentFilter
        ? investigatorDepartmentFilter.value
        : "";

    const selectedRank = investigatorRankFilter
        ? investigatorRankFilter.value
        : "";

    const filtered = demoInvestigators.filter(item => {
        const searchableText = [
            item.investigatorId,
            item.name,
            item.badgeNumber,
            item.department,
            item.rank,
            item.contact,
            item.email,
            getAssignedCaseText(item.investigatorId)
        ].join(" ").toLowerCase();

        return searchableText.includes(query)
            && (!selectedDepartment || item.department === selectedDepartment)
            && (!selectedRank || item.rank === selectedRank);
    });

    investigatorTableBody.innerHTML = filtered.map(item => `
        <tr
            class="clickable-case-row"
            data-investigator-id="${escapeHTML(item.investigatorId)}"
            tabindex="0"
            role="button"
            aria-label="View investigator ${escapeHTML(item.name)}"
        >
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
            `${filtered.length} of ${demoInvestigators.length} investigators`;
    }

    if (emptyInvestigators) {
        emptyInvestigators.hidden = filtered.length !== 0;
    }
}

if (investigatorSearch) {
    investigatorSearch.addEventListener("input", renderInvestigators);
}

if (investigatorDepartmentFilter) {
    investigatorDepartmentFilter.addEventListener(
        "change",
        renderInvestigators
    );
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

// ============================================================
// INVESTIGATORS — DETAILS POPUP
// ============================================================

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
        assignmentElement.textContent =
            getAssignedCaseText(record.investigatorId);
    }

    investigatorDetailsPanel.hidden = false;
}

const closeInvestigatorDetailsButton =
    document.getElementById("close-investigator-details");

if (closeInvestigatorDetailsButton) {
    closeInvestigatorDetailsButton.addEventListener("click", () => {
        if (investigatorDetailsPanel) {
            investigatorDetailsPanel.hidden = true;
        }
    });
}

function setupInvestigatorEditButton() {
    if (!investigatorDetailsPanel) return;

    const heading =
        investigatorDetailsPanel.querySelector(".panel-heading");

    if (
        !heading
        || document.getElementById("edit-investigator-button")
    ) {
        return;
    }

    const button = document.createElement("button");

    button.id = "edit-investigator-button";
    button.type = "button";
    button.className = "primary-button";
    button.textContent = "Edit Investigator";

    if (
        closeInvestigatorDetailsButton
        && heading.contains(closeInvestigatorDetailsButton)
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

// ============================================================
// INVESTIGATORS — CREATE AND EDIT
// ============================================================

function openInvestigatorForm(record = null) {
    if (!investigatorForm || !investigatorFormPanel) return;

    investigatorForm.reset();
    editingInvestigatorId = record ? record.investigatorId : null;

    const heading =
        document.getElementById("investigator-form-heading");

    const submitButton =
        document.getElementById("save-investigator-button");

    if (record) {
        Object.entries(record).forEach(([name, value]) => {
            setFieldValue(investigatorForm, name, value);
        });

        if (heading) heading.textContent = "Edit Investigator";
        if (submitButton) submitButton.textContent = "Save Changes";

        if (investigatorDetailsPanel) {
            investigatorDetailsPanel.hidden = true;
        }
    } else {
        if (heading) heading.textContent = "Register Investigator";

        if (submitButton) {
            submitButton.textContent = "Register Investigator";
        }
    }

    investigatorFormPanel.hidden = false;
}

function closeInvestigatorForm() {
    if (!investigatorForm || !investigatorFormPanel) return;

    investigatorFormPanel.hidden = true;
    investigatorForm.reset();
    editingInvestigatorId = null;

    const heading =
        document.getElementById("investigator-form-heading");

    const submitButton =
        document.getElementById("save-investigator-button");

    if (heading) heading.textContent = "Register Investigator";

    if (submitButton) {
        submitButton.textContent = "Register Investigator";
    }
}

const openInvestigatorFormButton =
    document.getElementById("open-investigator-form");

const closeInvestigatorFormButton =
    document.getElementById("close-investigator-form");

const cancelInvestigatorFormButton =
    document.getElementById("cancel-investigator-form");

if (openInvestigatorFormButton) {
    openInvestigatorFormButton.addEventListener("click", () => {
        openInvestigatorForm();
    });
}

if (closeInvestigatorFormButton) {
    closeInvestigatorFormButton.addEventListener(
        "click",
        closeInvestigatorForm
    );
}

if (cancelInvestigatorFormButton) {
    cancelInvestigatorFormButton.addEventListener(
        "click",
        closeInvestigatorForm
    );
}

if (investigatorForm) {
    investigatorForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!investigatorForm.reportValidity()) return;

        const data = new FormData(investigatorForm);

        const record = {
            investigatorId:
                String(data.get("investigatorId") || "").trim(),
            name: String(data.get("name") || "").trim(),
            badgeNumber:
                String(data.get("badgeNumber") || "").trim(),
            department:
                String(data.get("department") || "").trim(),
            rank: String(data.get("rank") || "").trim(),
            contact: String(data.get("contact") || "").trim(),
            email: String(data.get("email") || "").trim()
        };

        const duplicateId = demoInvestigators.some(item =>
            item.investigatorId.toLowerCase()
                === record.investigatorId.toLowerCase()
            && item.investigatorId !== editingInvestigatorId
        );

        if (duplicateId) {
            alert("That Investigator ID already exists.");
            return;
        }

        const duplicateBadge = demoInvestigators.some(item =>
            item.badgeNumber.toLowerCase()
                === record.badgeNumber.toLowerCase()
            && item.investigatorId !== editingInvestigatorId
        );

        if (duplicateBadge) {
            alert("That Badge Number is already registered.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(record.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (editingInvestigatorId !== null) {
            const index = demoInvestigators.findIndex(
                item => item.investigatorId === editingInvestigatorId
            );

            if (index < 0) {
                alert("Investigator not found.");
                return;
            }

            demoInvestigators[index] = record;
            selectedInvestigatorId = record.investigatorId;

            closeInvestigatorForm();

            if (investigatorSearch) investigatorSearch.value = "";

            renderInvestigators();
            openInvestigatorDetails(record);

            alert("Demo investigator updated. Not saved to the database.");
        } else {
            demoInvestigators.unshift(record);

            closeInvestigatorForm();

            if (investigatorSearch) investigatorSearch.value = "";

            populateAssignmentOptions();
            renderInvestigators();

            alert("Demo investigator registered. Not saved to the database.");
        }
    });
}

// ============================================================
// ASSIGNMENTS — POPULATE DROPDOWNS
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
            + demoCases.map(item => `
                <option value="${escapeHTML(item.caseNumber)}">
                    ${escapeHTML(item.caseNumber)} — ${escapeHTML(item.title)}
                </option>
            `).join("");

        if (demoCases.some(item => item.caseNumber === previousValue)) {
            caseSelect.value = previousValue;
        }
    }

    if (investigatorSelect) {
        const previousValue = investigatorSelect.value;

        investigatorSelect.innerHTML =
            '<option value="">Select an investigator</option>'
            + demoInvestigators.map(item => `
                <option value="${escapeHTML(item.investigatorId)}">
                    ${escapeHTML(item.investigatorId)} — ${escapeHTML(item.name)}
                </option>
            `).join("");

        if (
            demoInvestigators.some(
                item => item.investigatorId === previousValue
            )
        ) {
            investigatorSelect.value = previousValue;
        }
    }
}

// ============================================================
// ASSIGNMENTS — TABLE AND HISTORY
// ============================================================

function renderAssignments() {
    if (!assignmentTableBody) return;

    const query = assignmentSearch
        ? assignmentSearch.value.trim().toLowerCase()
        : "";

    const selectedStatus = assignmentStatusFilter
        ? assignmentStatusFilter.value
        : "";

    const filtered = demoCaseAssignments.filter(assignment => {
        const caseRecord = getCaseByNumber(assignment.caseNumber);
        const investigator = getInvestigatorById(assignment.investigatorId);

        const searchableText = [
            assignment.assignmentId,
            assignment.caseNumber,
            caseRecord?.title || "",
            investigator?.name || "",
            investigator?.badgeNumber || "",
            assignment.assignmentRole,
            assignment.assignmentDate,
            assignment.assignmentStatus
        ].join(" ").toLowerCase();

        return searchableText.includes(query)
            && (!selectedStatus
                || assignment.assignmentStatus === selectedStatus);
    });

    assignmentTableBody.innerHTML = filtered.map(assignment => {
        const caseRecord = getCaseByNumber(assignment.caseNumber);
        const investigator =
            getInvestigatorById(assignment.investigatorId);

        const statusClass =
            getAssignmentStatusClass(assignment.assignmentStatus);

        const actionButton = assignment.assignmentStatus === "Active"
            ? `
                <button
                    type="button"
                    class="secondary-button"
                    data-deactivate-assignment="${escapeHTML(assignment.assignmentId)}"
                >
                    Deactivate
                </button>
            `
            : `
                <span class="muted-text">Inactive</span>
            `;

        return `
            <tr>
                <td>${escapeHTML(assignment.caseNumber)}</td>
                <td>${escapeHTML(caseRecord?.title || "Case unavailable")}</td>
                <td>${escapeHTML(investigator?.name || "Investigator unavailable")}</td>
                <td>${escapeHTML(investigator?.badgeNumber || "—")}</td>
                <td>${escapeHTML(assignment.assignmentRole)}</td>
                <td>${escapeHTML(assignment.assignmentDate)}</td>
                <td>
                    <span class="status ${statusClass}">
                        ${escapeHTML(assignment.assignmentStatus)}
                    </span>
                </td>
                <td>${actionButton}</td>
            </tr>
        `;
    }).join("");

    if (assignmentCount) {
        assignmentCount.textContent =
            `${filtered.length} of ${demoCaseAssignments.length} assignments`;
    }

    if (emptyAssignments) {
        emptyAssignments.hidden = filtered.length !== 0;
    }

    // History always shows all records, including inactive assignments.
    if (assignmentHistoryBody) {
        assignmentHistoryBody.innerHTML = demoCaseAssignments.map(assignment => {
            const investigator =
                getInvestigatorById(assignment.investigatorId);

            return `
                <tr>
                    <td>${escapeHTML(assignment.caseNumber)}</td>
                    <td>${escapeHTML(investigator?.name || "Investigator unavailable")}</td>
                    <td>${escapeHTML(assignment.assignmentRole)}</td>
                    <td>${escapeHTML(assignment.assignmentDate)}</td>
                    <td>
                        <span class="status ${
                            getAssignmentStatusClass(assignment.assignmentStatus)
                        }">
                            ${escapeHTML(assignment.assignmentStatus)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    if (emptyAssignmentHistory) {
        emptyAssignmentHistory.hidden =
            demoCaseAssignments.length !== 0;
    }
}

// ============================================================
// ASSIGNMENTS — CREATE FORM
// ============================================================

function openAssignmentForm() {
    if (!assignmentForm || !assignmentFormPanel) return;

    assignmentForm.reset();
    populateAssignmentOptions();

    const dateField =
        assignmentForm.elements.namedItem("assignmentDate");

    if (dateField) {
        dateField.value = new Date().toISOString().slice(0, 10);
    }

    assignmentFormPanel.hidden = false;
}

function closeAssignmentForm() {
    if (!assignmentForm || !assignmentFormPanel) return;

    assignmentFormPanel.hidden = true;
    assignmentForm.reset();
}

const openAssignmentFormButton =
    document.getElementById("open-assignment-form");

const closeAssignmentFormButton =
    document.getElementById("close-assignment-form");

const cancelAssignmentFormButton =
    document.getElementById("cancel-assignment-form");

if (openAssignmentFormButton) {
    openAssignmentFormButton.addEventListener(
        "click",
        openAssignmentForm
    );
}

if (closeAssignmentFormButton) {
    closeAssignmentFormButton.addEventListener(
        "click",
        closeAssignmentForm
    );
}

if (cancelAssignmentFormButton) {
    cancelAssignmentFormButton.addEventListener(
        "click",
        closeAssignmentForm
    );
}

// ============================================================
// ASSIGNMENTS — VALIDATION AND SAVE
// ============================================================

if (assignmentForm) {
    assignmentForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!assignmentForm.reportValidity()) return;

        const data = new FormData(assignmentForm);

        const caseNumber =
            String(data.get("caseNumber") || "").trim();

        const investigatorId =
            String(data.get("investigatorId") || "").trim();

        const assignmentRole =
            String(data.get("assignmentRole") || "").trim();

        const assignmentDate =
            String(data.get("assignmentDate") || "").trim();

        if (!getCaseByNumber(caseNumber)) {
            alert("Please select a valid case.");
            return;
        }

        if (!getInvestigatorById(investigatorId)) {
            alert("Please select a valid investigator.");
            return;
        }

        // Prevent duplicate active case/investigator pairs.
        const duplicateActive = demoCaseAssignments.some(assignment =>
            assignment.caseNumber === caseNumber
            && assignment.investigatorId === investigatorId
            && assignment.assignmentStatus === "Active"
        );

        if (duplicateActive) {
            alert(
                "This investigator is already actively assigned to this case."
            );
            return;
        }

        const duplicateIdNumber = demoCaseAssignments.length + 1001;

        const newAssignment = {
            assignmentId: `ASN-${duplicateIdNumber}`,
            caseNumber,
            investigatorId,
            assignmentDate,
            assignmentRole,
            assignmentStatus: "Active",
            inactiveDate: ""
        };

        demoCaseAssignments.push(newAssignment);

        closeAssignmentForm();

        if (assignmentSearch) assignmentSearch.value = "";
        if (assignmentStatusFilter) assignmentStatusFilter.value = "";

        renderAssignments();
        renderInvestigators();

        alert(
            "Investigator assigned successfully in demo mode. This assignment has not been saved to the database."
        );
    });
}

// ============================================================
// ASSIGNMENTS — DEACTIVATE WITHOUT DELETING HISTORY
// ============================================================

if (assignmentTableBody) {
    assignmentTableBody.addEventListener("click", event => {
        const button = event.target.closest(
            "button[data-deactivate-assignment]"
        );

        if (!button) return;

        const assignmentId = button.dataset.deactivateAssignment;

        const assignment = demoCaseAssignments.find(
            item => item.assignmentId === assignmentId
        );

        if (!assignment || assignment.assignmentStatus !== "Active") {
            return;
        }

        const confirmed = confirm(
            `Deactivate assignment ${assignment.assignmentId} for ${assignment.caseNumber}? The history record will be retained.`
        );

        if (!confirmed) return;

        assignment.assignmentStatus = "Inactive";
        assignment.inactiveDate = new Date().toISOString().slice(0, 10);

        renderAssignments();
        renderInvestigators();

        alert(
            "Assignment deactivated. Its history has been retained in demo memory."
        );
    });
}

if (assignmentSearch) {
    assignmentSearch.addEventListener("input", renderAssignments);
}

if (assignmentStatusFilter) {
    assignmentStatusFilter.addEventListener("change", renderAssignments);
}

// ============================================================
// INITIAL PAGE
// ============================================================

populateInvestigatorFilters();
populateAssignmentOptions();
activateView("dashboard");
