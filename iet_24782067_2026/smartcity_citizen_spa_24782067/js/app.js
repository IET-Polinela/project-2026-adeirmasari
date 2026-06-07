let currentTab = 'my_reports';
let currentPage = 1;

let allReports = [];
let totalPages = 1;

// ==========================
// LOAD DATA DARI API
// ==========================
async function loadDashboardData(
    tab = currentTab,
    page = currentPage
) {
    currentTab = tab;
    currentPage = page;

    const response = await requestAPI(
        `/api/report/?tab=${tab}&page=${page}`,
        'GET'
    );

    if (response.status === 200) {
        const data = await response.json();

        // Ekstraksi data pagination
        allReports = data.results || [];
        totalPages = Math.ceil((data.count || 0) / 10);
        if (totalPages < 1) totalPages = 1;

        // Update UI
        renderList();
        renderPagination();

// LANGKAH 4: Rekap Sidebar
        loadSummaryStats();
    }
}

// ==========================
// REKAP STATUS LAPORAN (LANGKAH 4)
// ==========================
async function loadSummaryStats() {

    // Cegah error kalau bukan di dashboard
    const statDraft = document.getElementById('statDraft');
    const statProcess = document.getElementById('statProcess');
    const statDone = document.getElementById('statDone');

    if (!statDraft || !statProcess || !statDone) return;

    const response = await requestAPI(
        `/api/report/?tab=my_reports&page_size=1000`,
        'GET'
    );

    if (response.status === 200) {
        const data = await response.json();
        const reports = data.results || [];

        // HITUNG STATUS
        const draftCount = reports.filter(
            r => r.status === 'REPORTED'
        ).length;

        const processCount = reports.filter(
            r => r.status === 'VERIFIED' || r.status === 'IN_PROGRESS'
        ).length;

        const doneCount = reports.filter(
            r => r.status === 'RESOLVED'
        ).length;

        // UPDATE SIDEBAR
        statDraft.textContent = draftCount;
        statProcess.textContent = processCount;
        statDone.textContent = doneCount;
    }
}

// ==========================
// RENDER CARD LAPORAN
// ==========================
function renderList() {
    const listContainer = document.getElementById('listContainer');
    if (!listContainer) return;

    if (allReports.length === 0) {
        listContainer.innerHTML = `
            <div class="alert alert-secondary text-center">
                Belum ada laporan
            </div>
        `;
        return;
    }

    let html = '';

    allReports.forEach(report => {
        let progress = 10;

        if (report.status === 'REPORTED') progress = 25;
        if (report.status === 'VERIFIED') progress = 50;
        if (report.status === 'IN_PROGRESS') progress = 75;
        if (report.status === 'RESOLVED') progress = 100;

        html += `
        <div class="card shadow-sm border-0 mb-3">
            <div class="card-body">
                <h5 class="fw-bold">${report.title}</h5>
                <p class="text-muted">${report.category}</p>
                <p>${report.description}</p>
                <small class="text-muted">${report.location}</small>

                <div class="progress mt-3">
                    <div class="progress-bar" role="progressbar"
                        style="width:${progress}%">
                        ${report.status}
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    listContainer.innerHTML = html;
}

// ==========================
// PAGINATION
// ==========================
function renderPagination() {
    const paginationContainer =
        document.getElementById('paginationContainer');
    if (!paginationContainer) return;

    let html = '';

    for (let i = 1; i <= totalPages; i++) {
        html += `
        <button
            class="btn btn-outline-primary btn-sm m-1"
            onclick="loadDashboardData('${currentTab}', ${i})">
            ${i}
        </button>
        `;
    }

    paginationContainer.innerHTML = html;
}