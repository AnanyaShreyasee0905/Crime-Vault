
"use strict";


// ============================================================
// CRIMEVAULT FRONTEND
// Demo-only data. No Java API or Oracle connection yet.
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
const personRoleFilter = document.getElementById("person-role-filter");
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
// Cases received from the backend API.
// Keep demoCases separate for the other modules.
let apiCases = [];
let casesSource = "demo"; // "demo" or "api"
let casesLoading = false;

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
        status: displayValue(record.status),
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

        console.log("CrimeVault: Cases loaded from backend.", apiCases);

        renderCases();
    } catch (error) {
        console.error("Failed to load cases from backend:", error);

        // Keep the existing demo table working if the API is unavailable.
        casesSource = "demo";
        renderCases();
    } finally {
        casesLoading = false;
    }
}



// ============================================================
// DEMO INVESTIGATOR DATA
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
// DEMO ASSIGNMENTS
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
// DEMO PEOPLE DATA
// ============================================================

const demoPeople = [
    {
        personId: "PER-1001",
        name: "Demo Witness Alpha",
        role: "Witness",
        contact: "9000000001",
        email: "witness.demo@example.com"
    },
    {
        personId: "PER-1002",
        name: "Demo Person Bravo",
        role: "Victim",
        contact: "9000000002",
        email: "victim.demo@example.com"
    },
    {
        personId: "PER-1003",
        name: "Demo Person Charlie",
        role: "Suspect",
        contact: "9000000003",
        email: "suspect.demo@example.com"
    }
];


/* =========================================================
   EVIDENCE & CUSTODY DEMO DATA
   Demo-only records for frontend testing
   ========================================================= */

const demoEvidence = [
    {
        evidenceId: "EV-1001",
        caseNumber: "CV-1001",
        evidenceType: "Mobile Phone",
        collectionLocation: "Scene A",
        collectionDateTime: "2026-10-08T10:30",
        status: "Collected",
        currentLocation: "Evidence Room A",
        description: "Mobile phone recovered during the investigation."
    },
    {
        evidenceId: "EV-1002",
        caseNumber: "CV-1002",
        evidenceType: "Document",
        collectionLocation: "Office 204",
        collectionDateTime: "2026-10-09T14:15",
        status: "In Storage",
        currentLocation: "Evidence Locker B",
        description: "Documents collected for examination."
    },
    {
        evidenceId: "EV-1003",
        caseNumber: "CV-1003",
        evidenceType: "Fingerprint Sample",
        collectionLocation: "Entry Door",
        collectionDateTime: "2026-10-10T09:00",
        status: "Under Examination",
        currentLocation: "Forensic Lab",
        description: "Fingerprint sample awaiting forensic examination."
    }
];

const demoCustodyRecords = [];



// ============================================================
// DEMO CASE-PERSON RELATIONSHIPS
// Kept separate from person records, like a relationship table.
// ============================================================

const demoCasePeople = [
    {
        caseNumber: "CV-1001",
        personId: "PER-1001",
        relationship: "Witness"
    },
    {
        caseNumber: "CV-1001",
        personId: "PER-1002",
        relationship: "Victim"
    },
    {
        caseNumber: "CV-1002",
        personId: "PER-1003",
        relationship: "Suspect"
    }
];


// ============================================================
// SHARED HELPERS
// ============================================================

let editingCaseNumber = null;
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

function getCaseByNumber(caseNumber) {
    return demoCases.find(item => item.caseNumber === caseNumber);
}

function getEvidenceById(evidenceId) {
    return demoEvidence.find(
        item => item.evidenceId === evidenceId
    );
}


/* =========================================================
   EVIDENCE REGISTER — RENDER DEMO DATA
   ========================================================= */

function populateEvidenceOptions() {
    if (!evidenceForm) return;

    const caseSelect = evidenceForm.elements.namedItem("caseNumber");
    if (!caseSelect) return;

    const previousValue = caseSelect.value;

    caseSelect.innerHTML = `
        <option value="">Select a case</option>
        ${demoCases.map(item => `
            <option value="${escapeHTML(item.caseNumber)}">
                ${escapeHTML(item.caseNumber)} — ${escapeHTML(item.title)}
            </option>
        `).join("")}
    `;

    if (demoCases.some(item => item.caseNumber === previousValue)) {
        caseSelect.value = previousValue;
    }
}

    function renderEvidence() {
        if (!evidenceTableBody) return;

        const searchTerm = evidenceSearch
            ? evidenceSearch.value.trim().toLowerCase()
            : "";

        const selectedStatus = evidenceStatusFilter
            ? evidenceStatusFilter.value
            : "";

        const filteredEvidence = demoEvidence.filter(item => {
            const searchableText = [
                item.evidenceId,
                item.caseNumber,
                item.evidenceType,
                item.collectionLocation,
                item.currentLocation,
                item.description,
                item.status
            ].join(" ").toLowerCase();

            return searchableText.includes(searchTerm) &&
                (!selectedStatus || item.status === selectedStatus);
        });

        evidenceTableBody.innerHTML = filteredEvidence.map(item => `
            <tr>
                <td>${escapeHTML(item.evidenceId)}</td>
                <td>${escapeHTML(item.caseNumber)}</td>
                <td>${escapeHTML(item.evidenceType)}</td>
                <td>${escapeHTML(item.collectionLocation || "—")}</td>
                <td>${escapeHTML(item.collectionDateTime || "—")}</td>
                <td>${escapeHTML(item.status || "—")}</td>
                <td>${escapeHTML(item.currentLocation || "—")}</td>
                <td>
                    <button
                        type="button"
                        class="secondary-button"
                        data-view-evidence="${escapeHTML(item.evidenceId)}">
                        View
                    </button>
                </td>
            </tr>
        `).join("");

        if (evidenceCount) {
            evidenceCount.textContent = String(filteredEvidence.length);
        }

        if (emptyEvidence) {
            emptyEvidence.hidden = filteredEvidence.length > 0;
        }
    }


function renderCustodyHistory(evidenceId = "") {
    if (!custodyTableBody) return;

    const records = demoCustodyRecords
        .filter(record => !evidenceId || record.evidenceId === evidenceId)
        .slice()
        .sort((a, b) =>
            new Date(b.transferDateTime) - new Date(a.transferDateTime)
        );

    custodyTableBody.innerHTML = records.map(record => {
        const fromInvestigator = demoInvestigators.find(
            item => item.investigatorId === record.fromInvestigatorId
        );

        const toInvestigator = demoInvestigators.find(
            item => item.investigatorId === record.toInvestigatorId
        );

        return `
            <tr>
                <td>${escapeHTML(record.evidenceId)}</td>
                <td>${escapeHTML(fromInvestigator?.name || record.fromInvestigatorId || "—")}</td>
                <td>${escapeHTML(toInvestigator?.name || record.toInvestigatorId || "—")}</td>
                <td>${escapeHTML(record.transferDateTime || "—")}</td>
                <td>${escapeHTML(record.transferReason || "—")}</td>
                <td>${escapeHTML(record.location || "—")}</td>
            </tr>
        `;
    }).join("");


    
if (openCustodyFormButton) {
    openCustodyFormButton.addEventListener("click", () => {
        const item = getEvidenceById(selectedEvidenceId);

        if (!item) {
            alert("Please open an evidence record using View first.");
            return;
        }

        if (!custodyForm || !custodyFormPanel) {
            alert("Custody form or popup panel was not found.");
            return;
        }

        custodyForm.reset();

        setFieldValue(custodyForm, "evidenceId", item.evidenceId);
        setFieldValue(custodyForm, "location", item.currentLocation || "");

        const dateField =
            custodyForm.elements.namedItem("transferDateTime");

        if (dateField) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dateField.value = now.toISOString().slice(0, 16);
        }

        if (typeof populateCustodyInvestigatorOptions === "function") {
            populateCustodyInvestigatorOptions();
        }

        if (evidenceDetailsPanel) {
            evidenceDetailsPanel.hidden = true;
        }

        custodyFormPanel.hidden = false;
        custodyFormPanel.style.display = "block";
    });
}


    if (custodyCount) {
        custodyCount.textContent = String(records.length);
    }

    if (emptyCustody) {
        emptyCustody.hidden = records.length > 0;
    }
}


/* =========================================================
   CUSTODY TRANSFER — BUTTONS AND SAVE HANDLER
   Add this block only once.
   ========================================================= */

// Close button
if (closeCustodyFormButton) {
    closeCustodyFormButton.addEventListener("click", () => {
        custodyFormPanel.hidden = true;
        custodyFormPanel.style.display = "none";
    });
}

// Cancel button
if (cancelCustodyFormButton) {
    cancelCustodyFormButton.addEventListener("click", () => {
        custodyFormPanel.hidden = true;
        custodyFormPanel.style.display = "none";

        if (custodyForm) {
            custodyForm.reset();
        }
    });
}

// Save transfer
if (custodyForm) {
    custodyForm.addEventListener("submit", event => {
        event.preventDefault();

        const readValue = name =>
            custodyForm.elements.namedItem(name)?.value.trim() || "";

        const evidenceId = readValue("evidenceId");
        const fromInvestigatorId = readValue("fromInvestigatorId");
        const toInvestigatorId = readValue("toInvestigatorId");
        const transferDateTime = readValue("transferDateTime");
        const location = readValue("location");
        const transferReason = readValue("transferReason");
        const remarks = readValue("remarks");

        const evidence = getEvidenceById(evidenceId);

        if (!evidence) {
            alert("Evidence record not found.");
            return;
        }

        if (
            !fromInvestigatorId ||
            !toInvestigatorId ||
            !transferDateTime ||
            !location ||
            !transferReason
        ) {
            alert("Please complete all required fields.");
            return;
        }

        if (fromInvestigatorId === toInvestigatorId) {
            alert("Select two different investigators.");
            return;
        }

        const validInvestigator = id =>
            demoInvestigators.some(
                investigator => investigator.investigatorId === id
            );

        if (
            !validInvestigator(fromInvestigatorId) ||
            !validInvestigator(toInvestigatorId)
        ) {
            alert("Please select valid investigators.");
            return;
        }

        if (Number.isNaN(Date.parse(transferDateTime))) {
            alert("Please enter a valid transfer date and time.");
            return;
        }

        demoCustodyRecords.push({
            transferId: `CTR-${Date.now()}`,
            evidenceId,
            fromInvestigatorId,
            toInvestigatorId,
            transferDateTime,
            location,
            transferReason,
            remarks
        });

        evidence.currentLocation = location;

        custodyFormPanel.hidden = true;
        custodyFormPanel.style.display = "none";
        custodyForm.reset();

        renderEvidence();
        renderCustodyHistory();

        alert("Custody transfer recorded successfully.");
    });
}



/* Handle clicks on Evidence Register View buttons */
if (evidenceTableBody) {
    evidenceTableBody.addEventListener("click", (event) => {
        const viewButton = event.target.closest("[data-view-evidence]");
        if (!viewButton) return;

        const evidenceId = viewButton.dataset.viewEvidence;
        const item = getEvidenceById(evidenceId);

        if (!item) {
            alert("Evidence record not found.");
            return;
        }

        selectedEvidenceId = item.evidenceId;

        if (evidenceDetailsContent) {
            evidenceDetailsContent.innerHTML = `
                <p><strong>Evidence ID:</strong> ${escapeHTML(item.evidenceId)}</p>
                <p><strong>Case Number:</strong> ${escapeHTML(item.caseNumber)}</p>
                <p><strong>Evidence Type:</strong> ${escapeHTML(item.evidenceType)}</p>
                <p><strong>Collection Location:</strong> ${escapeHTML(item.collectionLocation || "—")}</p>
                <p><strong>Collection Date:</strong> ${escapeHTML(item.collectionDateTime || "—")}</p>
                <p><strong>Status:</strong> ${escapeHTML(item.status || "—")}</p>
                <p><strong>Current Location:</strong> ${escapeHTML(item.currentLocation || "—")}</p>
                <p><strong>Description:</strong> ${escapeHTML(item.description || "—")}</p>
            `;
        }

        if (evidenceDetailsPanel) {
    evidenceDetailsPanel.hidden = false;
    evidenceDetailsPanel.style.display = "block";
}


/* Close the Evidence Details popup */
const evidenceCloseButton =
    document.getElementById("close-evidence-details");

if (evidenceCloseButton) {
    evidenceCloseButton.addEventListener("click", () => {
        if (evidenceDetailsPanel) {
            evidenceDetailsPanel.hidden = true;
            evidenceDetailsPanel.style.display = "none";
        }
    });
}


/* Save newly registered evidence */
if (evidenceForm) {
    evidenceForm.addEventListener("submit", event => {
        event.preventDefault();

        const readValue = name =>
            evidenceForm.elements.namedItem(name)?.value.trim() || "";

        const evidenceId = readValue("evidenceId");
        const caseNumber = readValue("caseNumber");
        const evidenceType = readValue("evidenceType");
        const collectionLocation = readValue("collectionLocation");
        const collectionDateTime = readValue("collectionDateTime");
        const status = readValue("status");
        const currentLocation = readValue("currentLocation");
        const description = readValue("description");

        if (
            !evidenceId || !caseNumber || !evidenceType ||
            !collectionLocation || !collectionDateTime ||
            !status || !currentLocation
        ) {
            alert("Please complete all required fields.");
            return;
        }

        if (!demoCases.some(item => item.caseNumber === caseNumber)) {
            alert("Please select a valid case.");
            return;
        }

        if (demoEvidence.some(
            item => item.evidenceId.toLowerCase() === evidenceId.toLowerCase()
        )) {
            alert("That Evidence ID already exists.");
            return;
        }

        if (Number.isNaN(Date.parse(collectionDateTime))) {
            alert("Enter a valid collection date and time.");
            return;
        }

        demoEvidence.push({
            evidenceId,
            caseNumber,
            evidenceType,
            collectionLocation,
            collectionDateTime,
            status,
            currentLocation,
            description
        });

        evidenceForm.reset();

        if (evidenceFormPanel) {
            evidenceFormPanel.hidden = true;
            evidenceFormPanel.style.display = "none";
        }

        if (evidenceSearch) evidenceSearch.value = "";
        if (evidenceStatusFilter) evidenceStatusFilter.value = "";

        renderEvidence();
        alert("Evidence registered successfully!");
    });
}


    });
}


    if (evidenceSearch) {
        evidenceSearch.addEventListener("input", renderEvidence);
    }

if (evidenceStatusFilter) {
    evidenceStatusFilter.addEventListener("change", renderEvidence);
}


/* =========================================================
   EVIDENCE REGISTER — OPEN AND CLOSE FORM
   ========================================================= */

function openEvidenceForm() {
    if (!evidenceForm || !evidenceFormPanel) return;

    evidenceForm.reset();
    populateEvidenceOptions();

    const idInput = evidenceForm.elements.namedItem("evidenceId");
    if (idInput) idInput.readOnly = false;

    editingEvidenceId = null;
    evidenceFormPanel.hidden = false;
    evidenceFormPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeEvidenceForm() {
    if (evidenceFormPanel) {
        evidenceFormPanel.hidden = true;
    }

    if (evidenceForm) evidenceForm.reset();

    editingEvidenceId = null;
}

if (openEvidenceFormButton) {
    openEvidenceFormButton.addEventListener("click", openEvidenceForm);
}

if (closeEvidenceFormButton) {
    closeEvidenceFormButton.addEventListener("click", closeEvidenceForm);
}

if (cancelEvidenceFormButton) {
    cancelEvidenceFormButton.addEventListener("click", closeEvidenceForm);
}


function getInvestigatorById(investigatorId) {
    return demoInvestigators.find(
        item => item.investigatorId === investigatorId
    );
}

function getPersonById(personId) {
    return demoPeople.find(item => item.personId === personId);
}

function getActiveAssignments(investigatorId) {
    return demoCaseAssignments.filter(assignment =>
        assignment.investigatorId === investigatorId
        && assignment.assignmentStatus === "Active"
    );
}

function getAssignedCaseText(investigatorId) {
    const assignments = getActiveAssignments(investigatorId);

    if (assignments.length === 0) return "Unassigned";

    return assignments.map(item => item.caseNumber).join(", ");
}

function getPersonCaseNumbers(personId) {
    return demoCasePeople
        .filter(item => item.personId === personId)
        .map(item => item.caseNumber);
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
    return status === "Active" ? "open" : "closed";
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

    dashboardSections.forEach(section => {
        if (section) {
            section.hidden = (
                showCases ||
                showInvestigators ||
                showAssignments ||
                showPeople ||
                showCasePeople ||
                showEvidence
            );
        }
    });

    if (casesView) casesView.hidden = !showCases;
    if (investigatorsView) investigatorsView.hidden = !showInvestigators;
    if (assignmentsView) assignmentsView.hidden = !showAssignments;
    if (peopleView) peopleView.hidden = !showPeople;
    if (casePeopleView) casePeopleView.hidden = !showCasePeople;
    if (evidenceView) evidenceView.hidden = !showEvidence;

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
    // Other modules continue using demoCases independently.
    const casesToDisplay =
        casesSource === "api" ? apiCases : demoCases;

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedStatus = statusFilter ? statusFilter.value : "";
    const selectedPriority = priorityFilter ? priorityFilter.value : "";

    const filteredCases = casesToDisplay.filter(item => {
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
        emptyCases.hidden = filteredCases.length !== 0;
    }
}


if (caseTableBody) {
    caseTableBody.addEventListener("click", event => {
        const row = event.target.closest("tr[data-case-number]");
        if (!row) return;

        const caseNumber = row.dataset.caseNumber;

        // Find the record in the active data source.
        const casesToSearch =
            casesSource === "api" ? apiCases : demoCases;

        const record = casesToSearch.find(
            item => item.caseNumber === caseNumber
        );

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
        const casesToSearch =
            casesSource === "api" ? apiCases : demoCases;

        const record = casesToSearch.find(
            item => item.caseNumber === selectedCaseNumber
        );

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

        // Existing demo workflow — preserve other modules' demo data.
        const duplicate = demoCases.some(item =>
            item.caseNumber.toLowerCase() === record.caseNumber.toLowerCase()
            && item.caseNumber !== editingCaseNumber
        );

        if (duplicate) {
            alert("That case number already exists.");
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
            renderPeople();
            renderCasePeople();
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
            populateCasePersonOptions();
            renderAssignments();
            renderPeople();
            renderCasePeople();

            alert("Demo case added. Not saved to the database.");
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
            ...new Set(demoInvestigators.map(item => item.department))
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
            ...new Set(demoInvestigators.map(item => item.rank))
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

    const filtered = demoInvestigators.filter(item => {
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
            `${filtered.length} of ${demoInvestigators.length} investigators`;
    }

    if (emptyInvestigators) emptyInvestigators.hidden = filtered.length !== 0;
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

        if (demoInvestigators.some(item =>
            item.investigatorId.toLowerCase() === record.investigatorId.toLowerCase()
            && item.investigatorId !== editingInvestigatorId
        )) {
            alert("That Investigator ID already exists.");
            return;
        }

        if (demoInvestigators.some(item =>
            item.badgeNumber.toLowerCase() === record.badgeNumber.toLowerCase()
            && item.investigatorId !== editingInvestigatorId
        )) {
            alert("That Badge Number is already registered.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
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

        if (demoInvestigators.some(item =>
            item.investigatorId === previousValue
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

    const selectedStatus = assignmentStatusFilter
        ? assignmentStatusFilter.value
        : "";

    const filtered = demoCaseAssignments.filter(assignment => {
        const caseRecord = getCaseByNumber(assignment.caseNumber);
        const investigator = getInvestigatorById(assignment.investigatorId);

        const searchable = [
            assignment.assignmentId,
            assignment.caseNumber,
            caseRecord?.title || "",
            investigator?.name || "",
            investigator?.badgeNumber || "",
            assignment.assignmentRole,
            assignment.assignmentDate,
            assignment.assignmentStatus
        ].join(" ").toLowerCase();

        return searchable.includes(query)
            && (!selectedStatus || assignment.assignmentStatus === selectedStatus);
    });

    assignmentTableBody.innerHTML = filtered.map(assignment => {
        const caseRecord = getCaseByNumber(assignment.caseNumber);
        const investigator = getInvestigatorById(assignment.investigatorId);

        const action = assignment.assignmentStatus === "Active"
            ? `<button type="button" class="secondary-button"
                 data-deactivate-assignment="${escapeHTML(assignment.assignmentId)}">
                 Deactivate
               </button>`
            : `<span class="muted-text">Inactive</span>`;

        return `
            <tr>
                <td>${escapeHTML(assignment.caseNumber)}</td>
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
            `${filtered.length} of ${demoCaseAssignments.length} assignments`;
    }

    if (emptyAssignments) emptyAssignments.hidden = filtered.length !== 0;

    if (assignmentHistoryBody) {
        assignmentHistoryBody.innerHTML = demoCaseAssignments.map(assignment => `
            <tr>
                <td>${escapeHTML(assignment.caseNumber)}</td>
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
        emptyAssignmentHistory.hidden = demoCaseAssignments.length !== 0;
    }
}


// -------------------- ASSIGNMENT FORM --------------------

function openAssignmentForm() {
    if (!assignmentForm || !assignmentFormPanel) return;

    assignmentForm.reset();
    populateAssignmentOptions();

    const dateField = assignmentForm.elements.namedItem("assignmentDate");

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

        const data = new FormData(assignmentForm);

        const caseNumber = String(data.get("caseNumber") || "").trim();
        const investigatorId = String(data.get("investigatorId") || "").trim();
        const assignmentRole = String(data.get("assignmentRole") || "").trim();
        const assignmentDate = String(data.get("assignmentDate") || "").trim();

        if (!getCaseByNumber(caseNumber)) {
            alert("Please select a valid case.");
            return;
        }

        if (!getInvestigatorById(investigatorId)) {
            alert("Please select a valid investigator.");
            return;
        }

        const duplicateActive = demoCaseAssignments.some(assignment =>
            assignment.caseNumber === caseNumber
            && assignment.investigatorId === investigatorId
            && assignment.assignmentStatus === "Active"
        );

        if (duplicateActive) {
            alert("This investigator is already actively assigned to this case.");
            return;
        }

        const newAssignment = {
            assignmentId: `ASN-${Date.now()}`,
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

        alert("Assignment added in demo mode. Not saved to the database.");
    });
}

if (assignmentTableBody) {
    assignmentTableBody.addEventListener("click", event => {
        const button = event.target.closest(
            "button[data-deactivate-assignment]"
        );

        if (!button) return;

        const assignment = demoCaseAssignments.find(
            item => item.assignmentId === button.dataset.deactivateAssignment
        );

        if (!assignment || assignment.assignmentStatus !== "Active") return;

        if (!confirm(
            `Deactivate assignment for ${assignment.caseNumber}? Its history will be retained.`
        )) {
            return;
        }

        assignment.assignmentStatus = "Inactive";
        assignment.inactiveDate = new Date().toISOString().slice(0, 10);

        renderAssignments();
        renderInvestigators();

        alert("Assignment deactivated. History retained in demo memory.");
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

    const selectedRole = personRoleFilter
        ? personRoleFilter.value
        : "";

    const filtered = demoPeople.filter(person => {
        const searchable = [
            person.personId,
            person.name,
            person.role,
            person.contact,
            person.email,
            getPersonCaseText(person.personId)
        ].join(" ").toLowerCase();

        return searchable.includes(query)
            && (!selectedRole || person.role === selectedRole);
    });

    peopleTableBody.innerHTML = filtered.map(person => `
        <tr class="clickable-case-row"
            data-person-id="${escapeHTML(person.personId)}"
            tabindex="0" role="button"
            aria-label="View person ${escapeHTML(person.name)}">
            <td>${escapeHTML(person.personId)}</td>
            <td>${escapeHTML(person.name)}</td>
            <td>${escapeHTML(person.role)}</td>
            <td>${escapeHTML(person.contact || "Not provided")}</td>
            <td>${escapeHTML(person.email || "Not provided")}</td>
            <td>${escapeHTML(getPersonCaseText(person.personId))}</td>
        </tr>
    `).join("");

    if (personCount) {
        personCount.textContent =
            `${filtered.length} of ${demoPeople.length} people`;
    }

    if (emptyPeople) {
        emptyPeople.hidden = filtered.length !== 0;
    }
}

if (personSearch) {
    personSearch.addEventListener("input", renderPeople);
}
if (personRoleFilter) {
    personRoleFilter.addEventListener("change", renderPeople);
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
        "detail-person-role": person.role,
        "detail-person-contact": person.contact || "Not provided",
        "detail-person-email": person.email || "Not provided",
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
            personId: String(data.get("personId") || "").trim(),
            name: String(data.get("name") || "").trim(),
            role: String(data.get("role") || "").trim(),
            contact: String(data.get("contact") || "").trim(),
            email: String(data.get("email") || "").trim()
        };

        const duplicate = demoPeople.some(item =>
            item.personId.toLowerCase() === record.personId.toLowerCase()
            && item.personId !== editingPersonId
        );

        if (duplicate) {
            alert("That Person ID already exists.");
            return;
        }

        if (
            record.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)
        ) {
            alert("Please enter a valid email address.");
            return;
        }

        if (editingPersonId !== null) {
            const index = demoPeople.findIndex(
                item => item.personId === editingPersonId
            );

            if (index < 0) {
                alert("Person not found.");
                return;
            }

            demoPeople[index] = record;
            selectedPersonId = record.personId;

            closePersonForm();

            if (personSearch) personSearch.value = "";
            if (personRoleFilter) personRoleFilter.value = "";

            renderPeople();
            renderCasePeople();
            openPersonDetails(record);

            alert("Demo person updated. Not saved to the database.");
        } else {
            demoPeople.unshift(record);

            closePersonForm();

            if (personSearch) personSearch.value = "";
            if (personRoleFilter) personRoleFilter.value = "";

            populateCasePersonOptions();
            renderPeople();
            renderCasePeople();

            alert("Demo person registered. Not saved to the database.");
        }
    });
}


// ============================================================
// CASE-PERSON ASSOCIATIONS — DEMO MODULE
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
            + demoCases.map(item => `
                <option value="${escapeHTML(item.caseNumber)}">
                    ${escapeHTML(item.caseNumber)} — ${escapeHTML(item.title)}
                </option>
            `).join("");

        if (demoCases.some(item => item.caseNumber === previousValue)) {
            caseSelect.value = previousValue;
        }
    }

    if (personSelect) {
        const previousValue = personSelect.value;

        personSelect.innerHTML =
            '<option value="">Select a person</option>'
            + demoPeople.map(item => `
                <option value="${escapeHTML(item.personId)}">
                    ${escapeHTML(item.personId)} — ${escapeHTML(item.name)}
                </option>
            `).join("");

        if (demoPeople.some(item => item.personId === previousValue)) {
            personSelect.value = previousValue;
        }
    }
}



function populateCustodyInvestigatorOptions() {
    const fromSelect = custodyForm?.elements.namedItem("fromInvestigatorId");
    const toSelect = custodyForm?.elements.namedItem("toInvestigatorId");

    [fromSelect, toSelect].forEach((select) => {
        if (!select) return;

        const previousValue = select.value;

        select.innerHTML = `
            <option value="">Select investigator</option>
            ${demoInvestigators.map((investigator) => `
                <option value="${escapeHTML(investigator.investigatorId)}">
                    ${escapeHTML(investigator.investigatorId)} — ${escapeHTML(investigator.name)}
                </option>
            `).join("")}
        `;

        if (demoInvestigators.some(
            investigator => investigator.investigatorId === previousValue
        )) {
            select.value = previousValue;
        }
    });
}


function renderCasePeople() {
    if (!casePersonTableBody) return;

    const query = casePersonSearch
        ? casePersonSearch.value.trim().toLowerCase()
        : "";

    const selectedRelationship = casePersonRoleFilter
        ? casePersonRoleFilter.value
        : "";

    const filtered = demoCasePeople.filter(link => {
        const caseRecord = getCaseByNumber(link.caseNumber);
        const person = getPersonById(link.personId);

        const searchable = [
            link.caseNumber,
            caseRecord?.title || "",
            link.personId,
            person?.name || "",
            link.relationship
        ].join(" ").toLowerCase();

        return searchable.includes(query)
            && (!selectedRelationship ||
                link.relationship === selectedRelationship);
    });

    casePersonTableBody.innerHTML = filtered.map(link => {
        const caseRecord = getCaseByNumber(link.caseNumber);
        const person = getPersonById(link.personId);

        return `
            <tr>
                <td>${escapeHTML(link.caseNumber)}</td>
                <td>${escapeHTML(caseRecord?.title || "Case unavailable")}</td>
                <td>${escapeHTML(link.personId)}</td>
                <td>${escapeHTML(person?.name || "Person unavailable")}</td>
                <td>${escapeHTML(link.relationship)}</td>
                <td>
                    <button
                        type="button"
                        class="secondary-button"
                        data-unlink-case-person
                        data-case-number="${escapeHTML(link.caseNumber)}"
                        data-person-id="${escapeHTML(link.personId)}">
                        Unlink
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    if (casePersonCount) {
        casePersonCount.textContent =
            `${filtered.length} of ${demoCasePeople.length} associations`;
    }

    if (emptyCasePeople) {
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

        const data = new FormData(casePersonForm);

        const caseNumber = String(data.get("caseNumber") || "").trim();
        const personId = String(data.get("personId") || "").trim();
        const relationship = String(data.get("relationship") || "").trim();

        if (!getCaseByNumber(caseNumber)) {
            alert("Please select a valid case.");
            return;
        }

        if (!getPersonById(personId)) {
            alert("Please select a valid person.");
            return;
        }

        const duplicate = demoCasePeople.some(link =>
            link.caseNumber === caseNumber &&
            link.personId === personId
        );

        if (duplicate) {
            alert("This person is already linked to this case.");
            return;
        }

        demoCasePeople.push({
            caseNumber,
            personId,
            relationship
        });

        closeCasePersonForm();

        if (casePersonSearch) casePersonSearch.value = "";
        if (casePersonRoleFilter) casePersonRoleFilter.value = "";

        renderCasePeople();
        renderPeople();

        if (
            selectedPersonId === personId &&
            personDetailsPanel &&
            !personDetailsPanel.hidden
        ) {
            const person = getPersonById(personId);
            if (person) openPersonDetails(person);
        }

        alert("Person linked to case in demo mode. Not saved to the database.");
    });
}

if (casePersonSearch) {
    casePersonSearch.addEventListener("input", renderCasePeople);
}
if (casePersonRoleFilter) {
    casePersonRoleFilter.addEventListener("change", renderCasePeople);
}

if (casePersonTableBody) {
    casePersonTableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-unlink-case-person]");
        if (!button) return;

        const caseNumber = button.dataset.caseNumber;
        const personId = button.dataset.personId;

        const index = demoCasePeople.findIndex(link =>
            link.caseNumber === caseNumber &&
            link.personId === personId
        );

        if (index === -1) {
            alert("Association not found.");
            return;
        }

        const person = getPersonById(personId);

        if (!confirm(
            `Unlink ${person?.name || personId} from ${caseNumber}? ` +
            "The person record will not be deleted."
        )) {
            return;
        }

        demoCasePeople.splice(index, 1);

        renderCasePeople();
        renderPeople();

        if (
            selectedPersonId === personId &&
            personDetailsPanel &&
            !personDetailsPanel.hidden &&
            person
        ) {
            openPersonDetails(person);
        }

        alert("Association removed in demo mode. The person record remains.");
    });
}


// ============================================================
// INITIALIZATION
// ============================================================


populateInvestigatorFilters();
populateAssignmentOptions();
populateCasePersonOptions();

// Render existing demo data immediately.
renderCases();
renderInvestigators();
renderAssignments();
renderPeople();
renderCasePeople();

// Then load cases from the Java backend.
loadApiCases();


activateView("dashboard");
