let reportModalInstance = null;
let currentTab = "my_reports";
let currentPage = 1;
let editingReportId = null;

function initReportModal() {
    const reportModal = document.getElementById("reportModal");
    if (!reportModal) return;

    reportModalInstance = bootstrap.Modal.getOrCreateInstance(reportModal);
}

function setupTabButtons() {
    const btnMyReports = document.getElementById("btnMyReports");
    const btnFeed = document.getElementById("btnFeed");

    if (btnMyReports) {
        btnMyReports.onclick = function () {
            loadDashboardData("my_reports", 1);
        };
    }

    if (btnFeed) {
        btnFeed.onclick = function () {
            loadDashboardData("feed", 1);
        };
    }
}

function setupAddButton() {
    const btnAddReport = document.getElementById("btnAddReport");

    if (!btnAddReport) return;

    btnAddReport.onclick = function () {
        editingReportId = null;

        const form = document.getElementById("reportForm");
        const modalTitle = document.getElementById("reportModalTitle");

        if (form) form.reset();

        if (modalTitle) {
            modalTitle.innerHTML = `
                <i class="bi bi-pencil-square me-2"></i>
                Buat Laporan Baru
            `;
        }

        initReportModal();

        if (reportModalInstance) {
            reportModalInstance.show();
        }
    };
}

function setupReportForm() {
    const btnDraft = document.getElementById("btnDraft");
    const btnSubmit = document.getElementById("btnSubmit");

    if (btnDraft) {
        btnDraft.onclick = async function () {
            await submitReport("DRAFT");
        };
    }

    if (btnSubmit) {
        btnSubmit.onclick = async function () {
            await submitReport("REPORTED");
        };
    }
}

async function loadDashboardData(tab = "my_reports", page = 1) {
    if (!localStorage.getItem("access_token")) return;

    currentTab = tab;
    currentPage = page;

    try {
        const response = await requestAPI(`/api/report/?tab=${tab}&page=${page}`, "GET");

        if (response.status !== 200) {
            console.log("Gagal load dashboard:", response.status);
            renderList([]);
            renderSidebarStats([]);
            return;
        }

        const data = await response.json();
        const reports = data.results || [];

        renderList(reports);
        renderPagination(data);

        if (tab === "my_reports") {
            renderSidebarStats(reports);
        }

    } catch (error) {
        console.error("Gagal memuat dashboard:", error);
        renderList([]);
        renderSidebarStats([]);
    }
}

function renderSidebarStats(reports) {
    const statDraft = document.getElementById("statDraft");
    const statReported = document.getElementById("statReported");
    const statVerified = document.getElementById("statVerified");
    const statProcess = document.getElementById("statProcess");
    const statDone = document.getElementById("statDone");

    if (statDraft) {
        statDraft.textContent = reports.filter(r => r.status === "DRAFT").length;
    }

    if (statReported) {
        statReported.textContent = reports.filter(r => r.status === "REPORTED").length;
    }

    if (statVerified) {
        statVerified.textContent = reports.filter(r => r.status === "VERIFIED").length;
    }

    if (statProcess) {
        statProcess.textContent = reports.filter(r => r.status === "IN_PROGRESS").length;
    }

    if (statDone) {
        statDone.textContent = reports.filter(r => r.status === "RESOLVED").length;
    }
}

function renderList(reports) {
    const container = document.getElementById("listContainer");

    if (!container) return;

    container.innerHTML = "";

    if (reports.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-4">
                Tidak ada laporan
            </div>
        `;
        return;
    }

    reports.forEach(function (report) {
        const ownerName = currentTab === "feed"
            ? "Warga Anonim"
            : report.is_owner ? "Anda" : "Warga Anonim";

        const progress = getProgressPercent(report.status);
        const progressClass = getProgressClass(report.status);

        const editButton = report.status === "DRAFT" && report.is_owner
            ? `<button type="button" class="btn btn-outline-primary btn-sm" onclick="editDraft(${report.id})">
                    <i class="bi bi-pencil-square me-1"></i>
                    Edit Draft
               </button>`
            : "";

        container.innerHTML += `
            <div class="card mb-3 shadow-sm rounded-4 border">
                <div class="card-body p-4">

                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="fw-bold mb-2">${report.title}</h5>

                            <p class="text-muted mb-2">
                                <i class="bi bi-person-circle me-1"></i>
                                Oleh: <strong>${ownerName}</strong>
                                <span class="mx-1">•</span>
                                <i class="bi bi-clock me-1"></i>
                                ${formatDateTime(report.updated_at || report.created_at)}
                            </p>
                        </div>

                        <span class="badge ${getStatusBadgeClass(report.status)}">
                            ${report.status}
                        </span>
                    </div>

                    <div class="mb-3">
                        <span class="badge bg-info text-dark me-1">
                            <i class="bi bi-tag me-1"></i>
                            ${report.category}
                        </span>

                        <span class="badge bg-light text-dark border">
                            <i class="bi bi-geo-alt me-1"></i>
                            ${report.location}
                        </span>
                    </div>

                    <p class="mb-3">${report.description}</p>

                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <small class="text-muted">Progress Status</small>
                        <small class="fw-bold">${progress}%</small>
                    </div>

                    <div class="progress mb-3" style="height: 8px;">
                        <div class="progress-bar ${progressClass}" style="width: ${progress}%"></div>
                    </div>

                    <div class="text-end">
                        ${editButton}
                    </div>

                </div>
            </div>
        `;
    });
}

function renderPagination(data) {
    const paginationContainer = document.getElementById("paginationContainer");

    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    const hasPrevious = data.previous !== null;
    const hasNext = data.next !== null;

    if (!hasPrevious && !hasNext) return;

    paginationContainer.innerHTML = `
        <div class="d-flex justify-content-center gap-2 mt-3">
            <button type="button" class="btn btn-outline-primary btn-sm"
                ${!hasPrevious ? "disabled" : ""}
                onclick="loadDashboardData('${currentTab}', ${currentPage - 1})">
                Previous
            </button>

            <span class="btn btn-light btn-sm disabled">
                Page ${currentPage}
            </span>

            <button type="button" class="btn btn-outline-primary btn-sm"
                ${!hasNext ? "disabled" : ""}
                onclick="loadDashboardData('${currentTab}', ${currentPage + 1})">
                Next
            </button>
        </div>
    `;
}

async function editDraft(id) {
    try {
        const response = await requestAPI(`/api/report/${id}/`, "GET");

        if (response.status !== 200) return;

        const report = await response.json();

        document.getElementById("title").value = report.title || "";
        document.getElementById("category").value = report.category || "";
        document.getElementById("location").value = report.location || "";
        document.getElementById("description").value = report.description || "";

        editingReportId = id;

        const modalTitle = document.getElementById("reportModalTitle");

        if (modalTitle) {
            modalTitle.innerHTML = `
                <i class="bi bi-pencil-square me-2"></i>
                Edit Draft Laporan
            `;
        }

        initReportModal();

        if (reportModalInstance) {
            reportModalInstance.show();
        }

    } catch (error) {
        console.error("Gagal membuka draft:", error);
    }
}

async function submitReport(status) {
    const payload = getReportFormData();
    payload.status = status;

    if (!payload.title || !payload.category || !payload.location || !payload.description) {
        alert("Semua field laporan wajib diisi.");
        return;
    }

    const endpoint = editingReportId === null
        ? "/api/report/"
        : `/api/report/${editingReportId}/`;

    const method = editingReportId === null
        ? "POST"
        : "PUT";

    try {
        const response = await requestAPI(endpoint, method, payload);

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        console.log("STATUS SIMPAN:", response.status);
        console.log("DATA SIMPAN:", data);

        if (response.status === 200 || response.status === 201) {
            const form = document.getElementById("reportForm");

            if (form) form.reset();

            editingReportId = null;

            if (reportModalInstance) {
                reportModalInstance.hide();
            }

            await loadDashboardData("my_reports", 1);

            alert("Laporan berhasil disimpan.");
            return;
        }

        alert("Gagal menyimpan laporan:\n" + JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Gagal submit laporan:", error);
        alert("Gagal terhubung ke server.");
    }
}

function getReportFormData() {
    return {
        title: document.getElementById("title").value.trim(),
        category: document.getElementById("category").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim()
    };
}

function getProgressPercent(status) {
    if (status === "DRAFT") return 20;
    if (status === "REPORTED") return 40;
    if (status === "VERIFIED") return 60;
    if (status === "IN_PROGRESS") return 80;
    if (status === "RESOLVED") return 100;

    return 10;
}

function getProgressClass(status) {
    if (status === "DRAFT") return "bg-secondary";
    if (status === "REPORTED") return "bg-primary";
    if (status === "VERIFIED") return "bg-info";
    if (status === "IN_PROGRESS") return "bg-warning";
    if (status === "RESOLVED") return "bg-success";

    return "bg-secondary";
}

function getStatusBadgeClass(status) {
    if (status === "DRAFT") return "bg-secondary";
    if (status === "REPORTED") return "bg-primary";
    if (status === "VERIFIED") return "bg-info text-dark";
    if (status === "IN_PROGRESS") return "bg-warning text-dark";
    if (status === "RESOLVED") return "bg-success";

    return "bg-secondary";
}

function formatDateTime(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }) + ", " + date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });
}