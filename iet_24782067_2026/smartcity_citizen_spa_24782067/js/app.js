let currentTab = 'my_reports';
let currentPage = 1;

let allReports = [];
let totalPages = 1;

let editingReportId = null;

async function loadDashboardData(
    tab = currentTab,
    page = currentPage
) {
    console.log("Load Dashboard:", tab, page);
}

function renderList() {
    console.log("Render List");
}

function renderPagination() {
    console.log("Render Pagination");
}

async function loadSummaryStats() {
    console.log("Load Summary");
}