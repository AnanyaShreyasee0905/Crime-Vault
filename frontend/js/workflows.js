"use strict";

/* API-backed workflows for evidence, custody, interviews, events and forensics. */
(() => {
    const records = {
        evidence: [], custody: [], interviews: [], events: [],
        examinations: [], reports: []
    };
    const state = Object.fromEntries(Object.keys(records).map(key => [key, "loading"]));
    const reportSelectorLoads = { reports: false, examinations: false };
    const defs = {
        interviews: {
            title: "Interviews", api: "/interviews", id: "interviewId",
            fields: [
                ["caseId", "Case", "select", "cases"],
                ["personId", "Person", "select", "people"],
                ["investigatorId", "Investigator", "select", "investigators"],
                ["interviewDateTime", "Interview date and time", "datetime-local", true],
                ["location", "Location", "text", false],
                ["summary", "Summary", "textarea", false]
            ], columns: ["interviewId", "caseId", "personId", "investigatorId", "interviewDateTime", "location"]
        },
        events: {
            title: "Investigation Events", api: "/investigation-events", id: "eventId",
            fields: [
                ["caseId", "Case", "select", "cases"],
                ["investigatorId", "Investigator", "select", "investigators"],
                ["eventDateTime", "Event date and time", "datetime-local", true],
                ["eventType", "Event type", "text", true],
                ["description", "Description", "textarea", false]
            ], columns: ["eventId", "caseId", "investigatorId", "eventDateTime", "eventType", "description"]
        },
        examinations: {
            title: "Forensic Examinations", api: "/forensic-examinations", id: "examinationId",
            fields: [
                ["evidenceId", "Evidence", "select", "evidence"],
                ["examinerId", "Examiner", "select", "investigators"],
                ["examinationType", "Examination type", "text", true],
                ["startDate", "Start date", "date", false],
                ["endDate", "End date", "date", false],
                ["status", "Status", "text", false],
                ["findings", "Findings", "textarea", false]
            ], columns: ["examinationId", "evidenceId", "examinerId", "examinationType", "startDate", "endDate", "status"]
        },
        reports: {
            title: "Forensic Reports", api: "/forensic-reports", id: "reportId",
            fields: [
                ["examinationId", "Examination", "select", "examinations"],
                ["reportDate", "Report date", "date", true],
                ["conclusion", "Conclusion", "textarea", false]
            ], columns: ["reportId", "examinationId", "reportDate", "conclusion"]
        }
    };
    let activeModule = "interviews";
    let editing = null;
    let evidenceEditingId = null;
    let selectedEvidence = null;

    const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
    const byId = (name, id) => (records[name] || []).find(row => String(row[defs[name]?.id || "evidenceId"]) === String(id));
    const optionSets = () => ({
        cases: apiCases.map(x => [x.caseId, `${x.caseNumber} — ${x.title}`]),
        people: apiPeople.map(x => [x.personId, `${x.personId} — ${x.name}`]),
        investigators: apiInvestigators.map(x => [x.investigatorId, `${x.investigatorId} — ${x.name}`]),
        evidence: records.evidence.map(x => [x.evidenceId, `Evidence ${x.evidenceId} — ${x.evidenceType}`]),
        examinations: records.examinations.map(x => [x.examinationId, `Examination ${x.examinationId} — ${x.examinationType}`])
    });
    const showMessage = (node, message, kind = "") => {
        if (!node) return;
        node.textContent = message;
        node.dataset.kind = kind;
    };
    const fieldValue = (field, row) => {
        const [name, label, type, required] = field;
        let val = row?.[name] ?? "";
        if (type === "datetime-local" && val) val = String(val).slice(0, 16);
        const req = required === true || ["cases", "people", "investigators", "evidence", "examinations"].includes(required);
        const common = `name="${esc(name)}" ${req ? "required" : ""}`;
        if (["cases", "people", "investigators", "evidence", "examinations"].includes(required)) {
            let opts = optionSets()[required];
            if (activeModule === "reports" && name === "examinationId") {
                opts = opts.filter(([id]) => String(id) === String(val) ||
                    !records.reports.some(report => String(report.examinationId) === String(id)));
            }
            return `<label>${esc(label)}${req ? " *" : ""}<select ${common}><option value="">Select ${esc(label.toLowerCase())}</option>${opts.map(([id, text]) => `<option value="${esc(id)}" ${String(id) === String(val) ? "selected" : ""}>${esc(text)}</option>`).join("")}</select></label>`;
        }
        if (type === "textarea") return `<label class="full-width">${esc(label)}${req ? " *" : ""}<textarea ${common} rows="3">${esc(val)}</textarea></label>`;
        return `<label>${esc(label)}${req ? " *" : ""}<input type="${type}" ${common} value="${esc(val)}"></label>`;
    };
    function caseLabel(id) {
        const item = apiCases.find(x => String(x.caseId) === String(id));
        return item ? `${item.caseNumber} — ${item.title}` : `Case ${id ?? "—"}`;
    }
    function personLabel(id) { return apiPeople.find(x => String(x.personId) === String(id))?.name || `Person ${id ?? "—"}`; }
    function investigatorLabel(id) { return apiInvestigators.find(x => String(x.investigatorId) === String(id))?.name || `Investigator ${id ?? "—"}`; }
    function evidenceLabel(id) { const e = byId("evidence", id); return e ? `Evidence ${id} — ${e.evidenceType}` : `Evidence ${id ?? "—"}`; }
    function examLabel(id) { const e = byId("examinations", id); return e ? `Examination ${id} — ${e.examinationType}` : `Examination ${id ?? "—"}`; }
    function display(name, key, value) {
        if (key === "caseId") return caseLabel(value);
        if (key === "personId") return personLabel(value);
        if (["investigatorId", "examinerId", "fromInvestigatorId", "toInvestigatorId"].includes(key)) return investigatorLabel(value);
        if (key === "evidenceId") return evidenceLabel(value);
        if (key === "examinationId") return examLabel(value);
        return value ?? "—";
    }

    async function load(name) {
        const refreshesReportSelector = name === "reports" || name === "examinations";
        if (refreshesReportSelector) {
            reportSelectorLoads[name] = true;
            const formPanel = document.getElementById("module-form-panel");
            if (activeModule === "reports" && formPanel && !formPanel.hidden) {
                closeModuleForm();
                showMessage(document.getElementById("module-status"), "Report and examination data is refreshing. Please wait, then reopen the form.", "error");
            }
        }
        try {
            const rows = await CrimeVaultAPI.get(name === "evidence" ? "/evidence" : name === "custody" ? "/custody-records" : defs[name].api);
            if (!Array.isArray(rows)) throw new Error("The backend returned an unexpected response.");
            records[name] = rows;
            state[name] = "api";
            if (name === "evidence" && selectedEvidence) {
                selectedEvidence = rows.find(x => String(x.evidenceId) === String(selectedEvidence.evidenceId)) || selectedEvidence;
            }
        } catch (error) {
            records[name] = [];
            state[name] = "error";
            console.error(`Could not load ${name}:`, error);
        }
        if (refreshesReportSelector) reportSelectorLoads[name] = false;
        if (name === "evidence") renderEvidence();
        if (name === "custody") renderCustody();
        renderModule();
        renderTimeline();
        updateDashboard();
    }

    function renderEvidence() {
        const body = document.getElementById("evidence-table-body");
        if (!body) return;
        const query = document.getElementById("evidence-search")?.value.trim().toLowerCase() || "";
        const statusFilter = document.getElementById("evidence-status-filter");
        let status = statusFilter?.value || "";
        if (statusFilter) {
            const statuses = [...new Set(records.evidence.map(row => row.status).filter(value => value != null && String(value).trim()))];
            statusFilter.replaceChildren(new Option("All Statuses", ""), ...statuses.map(value => new Option(String(value), String(value))));
            statusFilter.value = statuses.some(value => String(value) === status) ? status : "";
            status = statusFilter.value;
        }
        const rows = records.evidence.filter(x => (!status || x.status === status) &&
            [x.evidenceId, caseLabel(x.caseId), x.evidenceType, x.collectionLocation, x.currentLocation, x.description, x.status].join(" ").toLowerCase().includes(query));
        body.innerHTML = rows.map(x => `<tr><td>${esc(x.evidenceId)}</td><td>${esc(caseLabel(x.caseId))}</td><td>${esc(x.evidenceType)}</td><td>${esc(x.collectionLocation || "—")}</td><td>${esc(x.collectionDateTime || "—")}</td><td>${esc(x.status || "—")}</td><td>${esc(x.currentLocation || "—")}</td><td><button class="secondary-button" data-evidence-detail="${esc(x.evidenceId)}">View</button> <button class="secondary-button" data-evidence-edit="${esc(x.evidenceId)}">Edit</button></td></tr>`).join("");
        const count = document.getElementById("evidence-count"); if (count) count.textContent = `${rows.length} evidence records`;
        const empty = document.getElementById("empty-evidence"); if (empty) { empty.hidden = rows.length > 0; empty.textContent = state.evidence === "error" ? "Evidence could not be loaded from the backend." : "No evidence records match your search."; }
        const caseSelect = document.querySelector('#evidence-form [name="caseId"]');
        if (caseSelect) { const prior = caseSelect.value; caseSelect.innerHTML = `<option value="">Select a case</option>${apiCases.map(c => `<option value="${esc(c.caseId)}">${esc(c.caseNumber)} — ${esc(c.title)}</option>`).join("")}`; caseSelect.value = prior; }
    }

    function renderCustody() {
        const body = document.getElementById("custody-table-body"); if (!body) return;
        const filter = document.getElementById("custody-evidence-filter");
        if (filter) {
            const prior = filter.value;
            filter.innerHTML = `<option value="">All evidence</option>${records.evidence.map(x => `<option value="${esc(x.evidenceId)}">${esc(x.evidenceId)} — ${esc(x.evidenceType)}</option>`).join("")}`;
            filter.value = prior;
        }
        const rows = records.custody.filter(x => !filter?.value || String(x.evidenceId) === filter.value).slice().sort((a, b) => String(b.transferDateTime).localeCompare(String(a.transferDateTime)));
        body.innerHTML = rows.map(x => `<tr><td>${esc(x.evidenceId)}</td><td>${esc(x.fromInvestigatorId ? investigatorLabel(x.fromInvestigatorId) : "—")}</td><td>${esc(investigatorLabel(x.toInvestigatorId))}</td><td>${esc(x.transferDateTime || "—")}</td><td>${esc(x.transferReason || "—")}</td><td>${esc(x.location || "—")}</td><td><button class="secondary-button" data-custody-detail="${esc(x.custodyId)}">View</button></td></tr>`).join("");
        const count = document.getElementById("custody-count"); if (count) count.textContent = `${rows.length} transfer records`;
        const empty = document.getElementById("empty-custody"); if (empty) { empty.hidden = rows.length > 0; empty.textContent = state.custody === "error" ? "Custody history could not be loaded from the backend." : "No custody transfers have been recorded."; }
        ["fromInvestigatorId", "toInvestigatorId"].forEach(name => {
            const select = document.querySelector(`#custody-form [name="${name}"]`); if (!select) return;
            const prior = select.value; select.innerHTML = `<option value="">Select investigator</option>${apiInvestigators.map(x => `<option value="${esc(x.investigatorId)}">${esc(x.investigatorId)} — ${esc(x.name)}</option>`).join("")}`; select.value = prior;
        });
    }

    function populateEvidenceOptions() { renderEvidence(); }
    function populateCustodyInvestigatorOptions() { renderCustody(); }
    function renderEvidenceCompat() { renderEvidence(); }
    function renderCustodyHistory() { renderCustody(); }
    function getEvidenceById(id) { return records.evidence.find(x => String(x.evidenceId) === String(id)); }
    function setFormValue(form, key, value) { const node = form?.elements.namedItem(key); if (node) node.value = value ?? ""; }
    function setNow(node) { if (!node) return; const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); node.value = now.toISOString().slice(0, 16); }
    function openEvidenceForm(row = null) {
        const form = document.getElementById("evidence-form"); if (!form) return;
        form.reset(); renderEvidence();
        evidenceEditingId = row ? row.evidenceId : null;
        const statusSelect = form.elements.namedItem("status");
        statusSelect?.querySelector('option[data-existing-status="true"]')?.remove();
        if (row?.status && statusSelect && ![...statusSelect.options].some(option => option.value === String(row.status))) {
            const existingStatus = new Option(String(row.status), String(row.status));
            existingStatus.dataset.existingStatus = "true";
            statusSelect.add(existingStatus);
        }
        for (const key of ["caseId", "evidenceType", "collectionLocation", "collectionDateTime", "status", "currentLocation", "description"]) setFormValue(form, key, row?.[key]);
        const id = form.elements.namedItem("evidenceId"); if (id) id.value = row?.evidenceId ?? "Database generated";
        document.getElementById("evidence-form-heading").textContent = row ? `Edit Evidence ${row.evidenceId}` : "Register Evidence";
        document.getElementById("evidence-form-panel").hidden = false;
    }
    function closeEvidenceForm() { const panel = document.getElementById("evidence-form-panel"); if (panel) panel.hidden = true; evidenceEditingId = null; }
    async function renderEvidenceDetail(row) {
        try { row = await CrimeVaultAPI.get(`/evidence/${encodeURIComponent(row.evidenceId)}`); }
        catch (error) { showMessage(document.getElementById("evidence-message"), `Could not load evidence details: ${error.message}`, "error"); return; }
        selectedEvidence = row;
        const detail = document.getElementById("evidence-details-content");
        if (detail) detail.innerHTML = [["Evidence ID", row.evidenceId], ["Case", caseLabel(row.caseId)], ["Type", row.evidenceType], ["Collection", row.collectionLocation], ["Collected at", row.collectionDateTime], ["Status", row.status], ["Current location", row.currentLocation], ["Description", row.description]].map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v || "—")}</p>`).join("");
        document.getElementById("evidence-details-panel").hidden = false;
    }

    function moduleRoot() { return document.getElementById("forensics-root"); }
    function buildModuleShell() {
        const root = moduleRoot(); if (!root || root.dataset.ready) return;
        root.dataset.ready = "true";
        root.innerHTML = `<div class="cases-toolbar"><div><p class="eyebrow">INTERVIEWS & FORENSIC WORK</p><h2>Case Records</h2><p class="muted-text">Manage interviews, investigation events, forensic examinations and reports using persisted records.</p></div></div><div class="module-tabs" role="tablist">${Object.entries(defs).map(([id, d]) => `<button type="button" class="secondary-button" data-module-tab="${id}" role="tab">${esc(d.title)}</button>`).join("")}</div><div class="case-filters"><input id="module-search" type="search" placeholder="Search records…" aria-label="Search records"><select id="module-case-filter" aria-label="Filter by case"><option value="">All cases</option></select><button type="button" id="module-add" class="primary-button">+ New record</button></div><p id="module-status" class="form-note" role="status"></p><div class="panel cases-table-panel"><div class="table-wrapper"><table><thead id="module-head"></thead><tbody id="module-body"></tbody></table></div><p id="module-empty" class="empty-state" hidden></p></div><section id="module-form-panel" class="panel case-form-panel" hidden><div class="panel-heading"><h2 id="module-form-title">New record</h2><button type="button" id="module-close" class="secondary-button">Close</button></div><form id="module-form"><div id="module-fields" class="form-grid"></div><p id="module-form-message" class="form-note" role="status"></p><div class="form-actions"><button type="button" id="module-cancel" class="secondary-button">Cancel</button><button type="submit" class="primary-button">Save record</button></div></form></section><section id="module-detail" class="panel case-form-panel" hidden><div class="panel-heading"><h2 id="module-detail-title">Record details</h2><button type="button" id="module-detail-close" class="secondary-button">Close</button></div><div id="module-detail-content"></div></section>`;
        root.querySelectorAll("[data-module-tab]").forEach(button => button.addEventListener("click", () => {
            activeModule = button.dataset.moduleTab;
            closeModuleForm();
            document.getElementById("module-detail").hidden = true;
            renderModule();
        }));
        document.getElementById("module-add").addEventListener("click", () => openModuleForm());
        document.getElementById("module-close").addEventListener("click", closeModuleForm);
        document.getElementById("module-cancel").addEventListener("click", closeModuleForm);
        document.getElementById("module-detail-close").addEventListener("click", () => { document.getElementById("module-detail").hidden = true; });
        document.getElementById("module-search").addEventListener("input", renderModule);
        document.getElementById("module-case-filter").addEventListener("change", renderModule);
        document.getElementById("module-body").addEventListener("click", event => {
            const button = event.target.closest("[data-row-action]"); if (!button) return;
            const row = byId(activeModule, button.dataset.id); if (!row) return;
            if (button.dataset.rowAction === "edit") openModuleForm(row); else showModuleDetail(row);
        });
        document.getElementById("module-form").addEventListener("submit", saveModule);
    }
    function renderModule() {
        buildModuleShell(); const root = moduleRoot(); if (!root) return;
        const def = defs[activeModule]; if (!def) return;
        root.querySelectorAll("[data-module-tab]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.moduleTab === activeModule)));
        const filter = document.getElementById("module-case-filter");
        const previous = filter.value; filter.innerHTML = `<option value="">All cases</option>${apiCases.map(c => `<option value="${esc(c.caseId)}">${esc(c.caseNumber)} — ${esc(c.title)}</option>`).join("")}`; filter.value = previous;
        document.getElementById("module-head").innerHTML = `<tr>${def.columns.map(key => `<th>${esc(key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()))}</th>`).join("")}<th>Actions</th></tr>`;
        const query = document.getElementById("module-search").value.trim().toLowerCase();
        const caseId = filter.value;
        const rows = records[activeModule].filter(row => (!caseId || String(caseForRow(activeModule, row)) === caseId) && def.columns.map(k => display(activeModule, k, row[k])).join(" ").toLowerCase().includes(query));
        document.getElementById("module-body").innerHTML = rows.map(row => `<tr>${def.columns.map(key => `<td>${esc(display(activeModule, key, row[key]))}</td>`).join("")}<td><button class="secondary-button" data-row-action="detail" data-id="${esc(row[def.id])}">View</button> <button class="secondary-button" data-row-action="edit" data-id="${esc(row[def.id])}">Edit</button></td></tr>`).join("");
        const empty = document.getElementById("module-empty"); empty.hidden = rows.length > 0; empty.textContent = state[activeModule] === "error" ? `${def.title} could not be loaded from the backend.` : `No ${def.title.toLowerCase()} match the current filters.`;
        showMessage(document.getElementById("module-status"), state[activeModule] === "error" ? "Backend data unavailable. Saving is disabled until the related records can be loaded." : "Records are loaded from the backend.", state[activeModule] === "error" ? "error" : "success");
    }
    function evidenceCase(id) { return byId("evidence", id)?.caseId; }
    function caseForRow(name, row) {
        if (row.caseId != null) return row.caseId;
        if (name === "examinations") return evidenceCase(row.evidenceId);
        if (name === "reports") {
            const exam = byId("examinations", row.examinationId);
            return exam ? evidenceCase(exam.evidenceId) : null;
        }
        return null;
    }
    function reportFormReadinessMessage() {
        if (state.reports === "api" && state.examinations === "api" &&
            !reportSelectorLoads.reports && !reportSelectorLoads.examinations) return null;
        const waiting = state.reports === "loading" || state.examinations === "loading" ||
            reportSelectorLoads.reports || reportSelectorLoads.examinations;
        return waiting
            ? "Report and examination data is still loading. Please wait and try again."
            : "Report or examination data is unavailable from the backend. Please check the connection and try again.";
    }
    function openModuleForm(row = null) {
        if (activeModule === "reports") {
            const readinessMessage = reportFormReadinessMessage();
            if (readinessMessage) {
                showMessage(document.getElementById("module-status"), readinessMessage, "error");
                return;
            }
        }
        const def = defs[activeModule]; editing = row ? { name: activeModule, id: row[def.id] } : null;
        document.getElementById("module-form-title").textContent = `${row ? "Edit" : "New"} ${def.title.replace(/s$/, "")}`;
        document.getElementById("module-fields").innerHTML = def.fields.map(field => fieldValue(field, row)).join("");
        showMessage(document.getElementById("module-form-message"), "");
        const formPanel = document.getElementById("module-form-panel");
        formPanel.hidden = false;
        if (["interviews", "events", "examinations", "reports"].includes(activeModule)) {
            formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
    function closeModuleForm() { document.getElementById("module-form-panel").hidden = true; editing = null; }
    async function showModuleDetail(row) {
        const def = defs[activeModule];
        try { row = await CrimeVaultAPI.get(`${def.api}/${encodeURIComponent(row[def.id])}`); }
        catch (error) { const panel = document.getElementById("module-detail"); panel.hidden = false; document.getElementById("module-detail-content").textContent = `Could not load record details: ${error.message}`; return; }
        document.getElementById("module-detail-title").textContent = `${def.title.replace(/s$/, "")} ${row[def.id]}`;
        document.getElementById("module-detail-content").innerHTML = def.fields.map(([key, label]) => `<p><strong>${esc(label)}:</strong> ${esc(display(activeModule, key, row[key]) || "—")}</p>`).join("");
        const detailPanel = document.getElementById("module-detail");
        detailPanel.hidden = false;
        if (["interviews", "events", "examinations", "reports"].includes(activeModule)) {
            detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
    async function saveModule(event) {
        event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
        if (activeModule === "reports") {
            const readinessMessage = reportFormReadinessMessage();
            if (readinessMessage) {
                showMessage(document.getElementById("module-form-message"), readinessMessage, "error");
                return;
            }
        }
        if (state[activeModule] !== "api") { showMessage(document.getElementById("module-form-message"), "Records must load successfully before saving.", "error"); return; }
        const payload = Object.fromEntries(new FormData(form).entries());
        for (const [key, , type] of defs[activeModule].fields) {
            if (["select"].includes(type)) payload[key] = Number(payload[key]);
            if (["caseId", "personId", "investigatorId", "evidenceId", "examinerId", "examinationId"].includes(key)) payload[key] = Number(payload[key]);
        }
        const def = defs[activeModule]; const id = editing?.id; const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
        try {
            await (id == null ? CrimeVaultAPI.post(def.api, payload) : CrimeVaultAPI.put(`${def.api}/${encodeURIComponent(id)}`, payload));
            await load(activeModule); closeModuleForm();
            showMessage(document.getElementById("module-status"), state[activeModule] === "api"
                ? `${def.title.replace(/s$/, "")} saved and list refreshed.`
                : "The backend acknowledged the save, but the list refresh failed. Persistence still needs verification.", state[activeModule] === "api" ? "success" : "error");
        } catch (error) { showMessage(document.getElementById("module-form-message"), `Could not save: ${error.message}`, "error"); }
        finally { submit.disabled = false; }
    }

    function renderTimeline() {
        const root = document.getElementById("timeline-root"); if (!root) return;
        if (!root.dataset.ready) {
            root.dataset.ready = "true";
            root.innerHTML = `<div class="cases-toolbar"><div><p class="eyebrow">CASE ACTIVITY</p><h2>Investigation Timeline</h2><p class="muted-text">Events shown here are retrieved from the persisted investigation event records.</p></div><button type="button" id="timeline-add" class="primary-button">+ Record Event</button></div><div class="case-filters"><select id="timeline-case-filter"><option value="">All cases</option></select><input type="search" id="timeline-search" placeholder="Filter events…" aria-label="Filter events"></div><p id="timeline-status" class="form-note" role="status"></p><div class="panel cases-table-panel"><div class="table-wrapper"><table><thead><tr><th>Date</th><th>Case</th><th>Investigator</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead><tbody id="timeline-body"></tbody></table></div><p id="timeline-empty" class="empty-state" hidden></p></div>`;
            document.getElementById("timeline-case-filter").addEventListener("change", renderTimeline);
            document.getElementById("timeline-search").addEventListener("input", renderTimeline);
            document.getElementById("timeline-add").addEventListener("click", () => { activeModule = "events"; renderModule(); openModuleForm(); activateView("forensics"); });
            document.getElementById("timeline-body").addEventListener("click", event => {
                const button = event.target.closest("[data-event-action]"); if (!button) return;
                activeModule = "events"; const row = byId("events", button.dataset.id); if (!row) return;
                activateView("forensics"); renderModule(); button.dataset.eventAction === "edit" ? openModuleForm(row) : showModuleDetail(row);
            });
        }
        const filter = document.getElementById("timeline-case-filter"); const prior = filter.value;
        filter.innerHTML = `<option value="">All cases</option>${apiCases.map(c => `<option value="${esc(c.caseId)}">${esc(c.caseNumber)} — ${esc(c.title)}</option>`).join("")}`; filter.value = prior;
        const term = document.getElementById("timeline-search").value.trim().toLowerCase();
        const rows = records.events.filter(x => (!filter.value || String(x.caseId) === filter.value) && [caseLabel(x.caseId), investigatorLabel(x.investigatorId), x.eventType, x.description, x.eventDateTime].join(" ").toLowerCase().includes(term)).slice().sort((a, b) => String(b.eventDateTime).localeCompare(String(a.eventDateTime)));
        document.getElementById("timeline-body").innerHTML = rows.map(x => `<tr><td>${esc(x.eventDateTime)}</td><td>${esc(caseLabel(x.caseId))}</td><td>${esc(investigatorLabel(x.investigatorId))}</td><td>${esc(x.eventType)}</td><td>${esc(x.description || "—")}</td><td><button class="secondary-button" data-event-action="detail" data-id="${esc(x.eventId)}">View</button> <button class="secondary-button" data-event-action="edit" data-id="${esc(x.eventId)}">Edit</button></td></tr>`).join("");
        const empty = document.getElementById("timeline-empty"); empty.hidden = rows.length > 0; empty.textContent = state.events === "error" ? "Investigation events could not be retrieved." : "No events match the selected case or search.";
        showMessage(document.getElementById("timeline-status"), state.events === "api" ? `${records.events.length} persisted events loaded.` : "Events unavailable from backend.", state.events === "api" ? "success" : "error");
    }

    function updateDashboard() {
        const metric = (id, name) => {
            const node = document.getElementById(id); if (!node) return;
            node.textContent = state[name] === "api" ? String(records[name].length) : "Unavailable";
            const p = node.parentElement?.querySelector("p"); if (p) p.textContent = state[name] === "api" ? "Backend records" : "Backend unavailable";
        };
        metric("total-evidence", "evidence"); metric("total-interviews", "interviews");
        const activity = document.getElementById("recent-activity"); if (!activity) return;
        if (state.events !== "api") { activity.innerHTML = `<p class="empty-state">Recent investigation activity is unavailable because events could not be loaded.</p>`; return; }
        const recent = records.events.slice().sort((a, b) => String(b.eventDateTime).localeCompare(String(a.eventDateTime))).slice(0, 4);
        activity.innerHTML = recent.length ? recent.map(e => `<div class="activity-item"><span class="activity-marker"></span><div><strong>${esc(e.eventType)}</strong><p>${esc(caseLabel(e.caseId))} · ${esc(e.description || "No description")}</p><small>${esc(e.eventDateTime || "")}</small></div></div>`).join("") : `<p class="empty-state">No persisted investigation events are available.</p>`;
    }

    // Functions referenced by the existing navigation and Evidence screen.
    Object.assign(window, { populateEvidenceOptions, populateCustodyInvestigatorOptions, renderEvidence: renderEvidenceCompat, renderCustodyHistory, getEvidenceById, openEvidenceForm, closeEvidenceForm });
    document.addEventListener("crimevault:dashboard-refresh", updateDashboard);
    document.addEventListener("crimevault:view", event => {
        if (event.detail === "forensics") renderModule();
        if (event.detail === "timeline") renderTimeline();
    });
    document.getElementById("open-evidence-form")?.addEventListener("click", () => openEvidenceForm());
    document.getElementById("close-evidence-form")?.addEventListener("click", closeEvidenceForm);
    document.getElementById("cancel-evidence-form")?.addEventListener("click", closeEvidenceForm);
    document.getElementById("close-evidence-details")?.addEventListener("click", () => { document.getElementById("evidence-details-panel").hidden = true; });
    document.getElementById("evidence-search")?.addEventListener("input", renderEvidence);
    document.getElementById("evidence-status-filter")?.addEventListener("change", renderEvidence);
    document.getElementById("custody-evidence-filter")?.addEventListener("change", renderCustody);
    document.getElementById("evidence-table-body")?.addEventListener("click", event => {
        const detail = event.target.closest("[data-evidence-detail]"); const edit = event.target.closest("[data-evidence-edit]");
        const id = detail?.dataset.evidenceDetail || edit?.dataset.evidenceEdit; if (!id) return;
        const row = getEvidenceById(id); if (row) edit ? openEvidenceForm(row) : renderEvidenceDetail(row);
    });
    document.getElementById("custody-table-body")?.addEventListener("click", async event => {
        const button = event.target.closest("[data-custody-detail]"); if (!button) return;
        let row = records.custody.find(x => String(x.custodyId) === button.dataset.custodyDetail); if (!row) return;
        try { row = await CrimeVaultAPI.get(`/custody-records/${encodeURIComponent(row.custodyId)}`); }
        catch (error) { document.getElementById("custody-details-content").textContent = `Could not load custody details: ${error.message}`; document.getElementById("custody-details-panel").hidden = false; return; }
        const content = document.getElementById("custody-details-content");
        content.innerHTML = [["Custody ID", row.custodyId], ["Evidence", evidenceLabel(row.evidenceId)], ["From investigator", row.fromInvestigatorId ? investigatorLabel(row.fromInvestigatorId) : "—"], ["To investigator", investigatorLabel(row.toInvestigatorId)], ["Transfer date and time", row.transferDateTime], ["Reason", row.transferReason], ["Location", row.location], ["Remarks", row.remarks]].map(([k, v]) => `<p><strong>${esc(k)}:</strong> ${esc(v || "—")}</p>`).join("");
        document.getElementById("custody-details-panel").hidden = false;
    });
    document.getElementById("close-custody-details")?.addEventListener("click", () => { document.getElementById("custody-details-panel").hidden = true; });
    document.getElementById("evidence-form")?.addEventListener("submit", async event => {
        event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
        if (state.evidence !== "api" || casesSource !== "api") { showMessage(document.getElementById("evidence-message"), "Cases and evidence must load from the backend before saving.", "error"); return; }
        const data = Object.fromEntries(new FormData(form).entries()); delete data.evidenceId;
        data.caseId = Number(data.caseId);
        const id = evidenceEditingId; const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
        try {
            await (id == null ? CrimeVaultAPI.post("/evidence", data) : CrimeVaultAPI.put(`/evidence/${encodeURIComponent(id)}`, data));
            await load("evidence"); closeEvidenceForm(); showMessage(document.getElementById("evidence-feedback"), state.evidence === "api"
                ? "Evidence saved and the register refreshed."
                : "The backend acknowledged the save, but the register refresh failed. Persistence still needs verification.", state.evidence === "api" ? "success" : "error");
        } catch (error) { showMessage(document.getElementById("evidence-message"), `Evidence was not saved: ${error.message}`, "error"); }
        finally { submit.disabled = false; }
    });
    document.getElementById("open-custody-form")?.addEventListener("click", () => {
        if (!selectedEvidence) { showMessage(document.getElementById("custody-message"), "Open an evidence record first.", "error"); return; }
        const form = document.getElementById("custody-form"); form.reset();
        setFormValue(form, "evidenceId", selectedEvidence.evidenceId); setFormValue(form, "location", selectedEvidence.currentLocation); setNow(form.elements.namedItem("transferDateTime"));
        renderCustody(); document.getElementById("evidence-details-panel").hidden = true; document.getElementById("custody-form-panel").hidden = false;
    });
    ["close-custody-form", "cancel-custody-form"].forEach(id => document.getElementById(id)?.addEventListener("click", () => { document.getElementById("custody-form-panel").hidden = true; document.getElementById("custody-form").reset(); }));
    document.getElementById("custody-form")?.addEventListener("submit", async event => {
        event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
        if (state.custody !== "api" || state.evidence !== "api" || state.investigators !== "api") { showMessage(document.getElementById("custody-message"), "Evidence, custody history, and investigators must load before recording a transfer.", "error"); return; }
        const data = Object.fromEntries(new FormData(form).entries());
        for (const key of ["evidenceId", "fromInvestigatorId", "toInvestigatorId"]) data[key] = Number(data[key]);
        if (data.fromInvestigatorId === data.toInvestigatorId) { showMessage(document.getElementById("custody-message"), "Choose different sending and receiving investigators.", "error"); return; }
        const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
        try { await CrimeVaultAPI.post("/custody-records", data); await Promise.all([load("custody"), load("evidence")]); document.getElementById("custody-form-panel").hidden = true; const refreshed = state.custody === "api" && state.evidence === "api"; showMessage(document.getElementById("custody-feedback"), refreshed
            ? "Transfer recorded; custody history and evidence location refreshed."
            : "The backend acknowledged the transfer, but a refresh failed. Persistence still needs verification.", refreshed ? "success" : "error"); }
        catch (error) { showMessage(document.getElementById("custody-message"), `Transfer was not recorded: ${error.message}`, "error"); }
        finally { submit.disabled = false; }
    });
    document.addEventListener("crimevault:dashboard-refresh", () => { renderEvidence(); renderCustody(); renderModule(); renderTimeline(); });

    // Primary relation lookups power select lists and prevent invalid local IDs.
    const lookups = ["cases", "people", "investigators"].map(name => {
        const path = { cases: "/cases", people: "/people", investigators: "/investigators" }[name];
        return CrimeVaultAPI.get(path).then(rows => {
            if (!Array.isArray(rows)) throw new Error(`${name} API did not return a list`);
            if (name === "cases") { apiCases = rows; casesSource = "api"; }
            if (name === "people") apiPeople = rows;
            if (name === "investigators") apiInvestigators = rows;
            state[name] = "api";
        }).catch(error => { state[name] = "error"; console.error(`Could not refresh ${name} lookups:`, error); });
    });
    Promise.all([...lookups, ...Object.keys(records).map(load)]).then(() => { renderEvidence(); renderCustody(); renderModule(); renderTimeline(); updateDashboard(); });
})();
