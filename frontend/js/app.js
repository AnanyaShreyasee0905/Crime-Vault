
const navigationLinks = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("page-title");

const dashboardSections = [
    document.querySelector(".welcome-panel"),
    document.querySelector(".stats-grid"),
    document.querySelector(".content-grid")
];

const casesView = document.getElementById("cases-view");
const caseTableBody = document.getElementById("cases-table-body");
const caseCount = document.getElementById("case-count");
const emptyCases = document.getElementById("empty-cases");

const searchInput = document.getElementById("case-search");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");

const caseForm = document.getElementById("case-form");
const caseFormPanel = document.getElementById("case-form-panel");
const caseDetailsPanel = document.getElementById("case-details-panel");

const viewTitles = {
    dashboard: "Dashboard",
    cases: "Cases",
    investigators: "Investigators",
    people: "People",
    evidence: "Evidence & Custody",
    forensics: "Interviews & Forensics",
    timeline: "Investigation Timeline"
};

// Fictional records for frontend development only.
// These are NOT stored in Oracle or a backend API.
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

// Tracks which existing case is being edited.
// null means the form is creating a new case.
let editingCaseNumber = null;

// Tracks the case currently displayed in the details popup.
let selectedCaseNumber = null;

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// -------------------- NAVIGATION --------------------

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

    pageTitle.textContent = viewTitles[viewName] || "Dashboard";

    const showCases = viewName === "cases";

    dashboardSections.forEach(section => {
        if (section) {
            section.hidden = showCases;
        }
    });

    if (casesView) {
        casesView.hidden = !showCases;
    }

    if (!showCases && viewName !== "dashboard") {
        console.log(
            `${viewName} module is planned but not implemented yet.`
        );
    }

    if (showCases) {
        renderCases();
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

// -------------------- CASE TABLE --------------------

function renderCases() {
    if (!caseTableBody) return;

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

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

    caseCount.textContent =
        `${filteredCases.length} of ${demoCases.length} cases`;

    emptyCases.hidden = filteredCases.length !== 0;
}

// Register these handlers ONCE, not inside renderCases().
if (caseTableBody) {
    caseTableBody.addEventListener("click", event => {
        const row = event.target.closest("tr[data-case-number]");

        if (!row) return;

        const caseRecord = demoCases.find(
            item => item.caseNumber === row.dataset.caseNumber
        );

        if (caseRecord) {
            openCaseDetails(caseRecord);
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

if (searchInput) {
    searchInput.addEventListener("input", renderCases);
}

if (statusFilter) {
    statusFilter.addEventListener("change", renderCases);
}

if (priorityFilter) {
    priorityFilter.addEventListener("change", renderCases);
}

// -------------------- CASE DETAILS --------------------

function openCaseDetails(caseRecord) {
    if (!caseDetailsPanel || !caseRecord) return;

    selectedCaseNumber = caseRecord.caseNumber;

    const details = {
        "case-details-number": caseRecord.caseNumber,
        "detail-case-title": caseRecord.title,
        "detail-case-type": caseRecord.caseType,
        "detail-case-priority": caseRecord.priority,
        "detail-case-status": caseRecord.status,
        "detail-case-location": caseRecord.location,
        "detail-case-date-reported": caseRecord.dateReported,
        "detail-case-date-opened":
            caseRecord.dateOpened || "Not specified",
        "detail-case-description":
            caseRecord.description || "No description provided."
    };

    Object.entries(details).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });

    caseDetailsPanel.hidden = false;
}

// Keep the existing close button working.
const closeDetailsButton =
    document.getElementById("close-case-details");

if (closeDetailsButton) {
    closeDetailsButton.addEventListener("click", () => {
        caseDetailsPanel.hidden = true;
    });
}

// Add an Edit button to the existing popup without changing index.html.
function setupEditButton() {
    if (!caseDetailsPanel) return;

    const heading = caseDetailsPanel.querySelector(".panel-heading");

    if (!heading) {
        console.warn(
            "Edit Case button was not added: popup heading not found."
        );
        return;
    }

    // Prevent duplicate buttons if this setup runs again.
    if (document.getElementById("edit-case-button")) return;

    const editButton = document.createElement("button");

    editButton.id = "edit-case-button";
    editButton.type = "button";
    editButton.className = "primary-button";
    editButton.textContent = "Edit Case";
    editButton.setAttribute("aria-label", "Edit this case");

    // Insert the Edit button before the existing Close button.
    if (closeDetailsButton && heading.contains(closeDetailsButton)) {
        heading.insertBefore(editButton, closeDetailsButton);
    } else {
        heading.appendChild(editButton);
    }

    editButton.addEventListener("click", () => {
        const caseRecord = demoCases.find(
            item => item.caseNumber === selectedCaseNumber
        );

        if (!caseRecord) {
            alert("Could not find the selected case.");
            return;
        }

        openCaseForm(caseRecord);
    });
}

setupEditButton();

// -------------------- CREATE / EDIT CASE FORM --------------------

function setFormValue(fieldName, value) {
    const field = caseForm.elements.namedItem(fieldName);

    if (field) {
        field.value = value ?? "";
    }
}

function openCaseForm(caseRecord = null) {
    if (!caseForm || !caseFormPanel) return;

    caseForm.reset();

    editingCaseNumber = caseRecord
        ? caseRecord.caseNumber
        : null;

    const heading = caseFormPanel.querySelector("h2");
    const submitButton = caseForm.querySelector('[type="submit"]');

    if (caseRecord) {
        setFormValue("caseNumber", caseRecord.caseNumber);
        setFormValue("title", caseRecord.title);
        setFormValue("caseType", caseRecord.caseType);
        setFormValue("priority", caseRecord.priority);
        setFormValue("status", caseRecord.status);
        setFormValue("location", caseRecord.location);
        setFormValue("dateReported", caseRecord.dateReported);
        setFormValue("dateOpened", caseRecord.dateOpened);
        setFormValue("description", caseRecord.description);

        if (heading) {
            heading.textContent = "Edit Case";
        }

        if (submitButton) {
            submitButton.textContent = "Save Changes";
        }

        if (caseDetailsPanel) {
            caseDetailsPanel.hidden = true;
        }
    } else {
        if (heading) {
            heading.textContent = "Create New Case";
        }

        if (submitButton) {
            submitButton.textContent = "Add Case";
        }
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

    if (heading) {
        heading.textContent = "Create New Case";
    }

    if (submitButton) {
        submitButton.textContent = "Add Case";
    }
}

const openCaseFormButton = document.getElementById("open-case-form");
const closeCaseFormButton = document.getElementById("close-case-form");
const cancelCaseFormButton = document.getElementById("cancel-case-form");

if (openCaseFormButton) {
    openCaseFormButton.addEventListener("click", () => {
        openCaseForm();
    });
}

if (closeCaseFormButton) {
    closeCaseFormButton.addEventListener("click", closeCaseForm);
}

if (cancelCaseFormButton) {
    cancelCaseFormButton.addEventListener("click", closeCaseForm);
}

// -------------------- SAVE NEW OR EDITED CASE --------------------

if (caseForm) {
    caseForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!caseForm.reportValidity()) return;

        const formData = new FormData(caseForm);

        const updatedCase = {
            caseNumber: String(formData.get("caseNumber") || "").trim(),
            title: String(formData.get("title") || "").trim(),
            caseType: formData.get("caseType"),
            priority: formData.get("priority"),
            status: formData.get("status"),
            location: String(formData.get("location") || "").trim(),
            dateReported: formData.get("dateReported"),
            dateOpened: formData.get("dateOpened"),
            description: String(formData.get("description") || "").trim()
        };

        // Reject duplicate case numbers, except the case currently
        // being edited. Comparison is case-insensitive.
        const duplicateExists = demoCases.some(item => {
            const isCurrentRecord =
                editingCaseNumber !== null
                && item.caseNumber === editingCaseNumber;

            return !isCurrentRecord
                && item.caseNumber.toLowerCase()
                    === updatedCase.caseNumber.toLowerCase();
        });

        if (duplicateExists) {
            alert(
                "That case number already exists. Please use a unique number."
            );
            return;
        }

        if (
            updatedCase.dateOpened
            && updatedCase.dateOpened < updatedCase.dateReported
        ) {
            alert(
                "Date opened cannot be earlier than date reported."
            );
            return;
        }

        if (editingCaseNumber !== null) {
            // EDIT MODE: update the existing object rather than adding
            // another record to the array.
            const index = demoCases.findIndex(
                item => item.caseNumber === editingCaseNumber
            );

            if (index === -1) {
                alert("The case could not be found. Please try again.");
                return;
            }

            demoCases[index] = updatedCase;
            selectedCaseNumber = updatedCase.caseNumber;

            closeCaseForm();

            searchInput.value = "";
            statusFilter.value = "";
            priorityFilter.value = "";

            renderCases();
            openCaseDetails(updatedCase);

            alert(
                "Demo case updated successfully. Changes have not been saved to the database."
            );
        } else {
            // CREATE MODE: add a new fictional demo record.
            demoCases.unshift(updatedCase);

            closeCaseForm();

            searchInput.value = "";
            statusFilter.value = "";
            priorityFilter.value = "";

            renderCases();

            alert(
                "Demo case added successfully. It has not been saved to the database."
            );
        }
    });
}

// -------------------- INITIAL PAGE --------------------

activateView("dashboard");
