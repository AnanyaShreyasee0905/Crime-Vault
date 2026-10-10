
const navigationLinks = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("page-title");
const viewCasesButton = document.getElementById("view-cases-btn");

const viewTitles = {
    dashboard: "Dashboard",
    cases: "Cases",
    investigators: "Investigators",
    people: "People",
    evidence: "Evidence & Custody",
    forensics: "Interviews & Forensics",
    timeline: "Investigation Timeline"
};

function activateView(viewName) {
    navigationLinks.forEach((link) => {
        const isActive = link.dataset.view === viewName;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    pageTitle.textContent = viewTitles[viewName] || "Dashboard";

    // Other views will be implemented in the next steps.
    if (viewName !== "dashboard") {
        console.log(`${viewName} view selected. Page implementation pending.`);
    }
}

navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const viewName = link.dataset.view;
        activateView(viewName);

        history.replaceState(null, "", `#${viewName}`);
    });
});

viewCasesButton.addEventListener("click", () => {
    activateView("cases");
    history.replaceState(null, "", "#cases");
});
