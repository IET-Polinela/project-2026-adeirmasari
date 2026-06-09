const routes = {
    "#login": `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4 card shadow-sm border-0 p-4 rounded-4">
                <h4 class="text-center fw-bold mb-4">
                    Login Warga
                </h4>

                <form id="loginForm">
                    <input type="text" id="loginUsername"
                        class="form-control mb-3"
                        placeholder="Username" required>

                    <input type="password" id="loginPassword"
                        class="form-control mb-3"
                        placeholder="Password" required>

                    <button type="submit"
                        class="btn btn-primary w-100 fw-bold">
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    `,

    "#dashboard": `
        <div class="row g-4">

            <aside class="col-lg-3">

                <div class="card shadow-sm rounded-4 border-0 mb-4">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-1">
                            <i class="bi bi-person-circle text-primary me-2"></i>
                            Citizen Portal
                        </h5>

                        <small class="text-muted d-block mb-3">
                            Login sebagai <b id="sidebarUsername">Citizen</b>
                        </small>

                        <div class="alert alert-success py-2 mb-0">
                            <i class="bi bi-shield-check me-2"></i>
                            JWT Authenticated
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm rounded-4 border-0">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-3">
                            <i class="bi bi-bar-chart-fill text-primary me-2"></i>
                            Rekap Status
                        </h5>

                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                <span>
                                    <i class="bi bi-file-earmark-text text-secondary me-2"></i>
                                    Draft
                                </span>
                                <span id="statDraft" class="badge bg-secondary rounded-3">0</span>
                            </li>

                            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                <span>
                                    <i class="bi bi-send-fill text-primary me-2"></i>
                                    Dilaporkan
                                </span>
                                <span id="statReported" class="badge bg-primary rounded-3">0</span>
                            </li>

                            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                <span>
                                    <i class="bi bi-patch-check text-info me-2"></i>
                                    Terverifikasi
                                </span>
                                <span id="statVerified" class="badge bg-info text-dark rounded-3">0</span>
                            </li>

                            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                <span>
                                    <i class="bi bi-hourglass-split text-warning me-2"></i>
                                    Diproses
                                </span>
                                <span id="statProcess" class="badge bg-warning text-dark rounded-3">0</span>
                            </li>

                            <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                <span>
                                    <i class="bi bi-check-circle text-success me-2"></i>
                                    Selesai
                                </span>
                                <span id="statDone" class="badge bg-success rounded-3">0</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </aside>

            <section class="col-lg-9">

                <div class="card bg-primary text-white shadow-sm rounded-4 border-0 mb-4">
                    <div class="card-body p-4 d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="fw-bold mb-2">
                                <i class="bi bi-buildings-fill me-2"></i>
                                Dashboard Laporan Citizen
                            </h2>

                            <p class="mb-0">
                                Kelola laporan pribadi dan pantau Feed Kota secara real-time melalui Fetch API.
                            </p>
                        </div>

                        <button id="btnAddReport"
                            class="btn btn-light fw-bold px-4">
                            <i class="bi bi-plus-circle me-2"></i>
                            Tambah Laporan Baru
                        </button>
                    </div>
                </div>

                <div class="card shadow-sm rounded-4 border-0">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h4 class="fw-bold mb-1">
                                    <i class="bi bi-list-ul text-primary me-2"></i>
                                    Daftar Laporan
                                </h4>

                                <small class="text-muted">
                                    Data diambil langsung dari API Django REST Framework.
                                </small>
                            </div>

                            <div class="btn-group">
                                <button id="btnMyReports" class="btn btn-primary">
                                    <i class="bi bi-person-lines-fill me-1"></i>
                                    Laporan Saya
                                </button>

                                <button id="btnFeed" class="btn btn-outline-primary">
                                    <i class="bi bi-globe2 me-1"></i>
                                    Feed Kota
                                </button>
                            </div>
                        </div>

                        <div id="listContainer"></div>
                        <div id="paginationContainer"></div>
                    </div>
                </div>

            </section>
        </div>
    `
};

function isLoggedIn() {
    return !!localStorage.getItem("access_token");
}

function getStoredUsername() {
    return localStorage.getItem("username") || "Citizen";
}

function updateNavbar(hash) {
    const navMenu = document.getElementById("nav-menu");

    if (!navMenu) return;

    if (hash !== "#dashboard" || !isLoggedIn()) {
        navMenu.innerHTML = "";
        return;
    }

    navMenu.innerHTML = `
        <div class="d-flex align-items-center gap-3 text-white">
            <span class="d-none d-md-inline">
                <i class="bi bi-speedometer2 me-1"></i>
                Dashboard
            </span>

            <span class="fw-bold">
                <i class="bi bi-person-circle me-1"></i>
                ${getStoredUsername()}
            </span>

            <button type="button"
                class="btn btn-outline-light btn-sm"
                onclick="logoutUser()">
                <i class="bi bi-box-arrow-right me-1"></i>
                Logout
            </button>
        </div>
    `;
}

function updateActiveTabButton(tab) {
    const btnMyReports = document.getElementById("btnMyReports");
    const btnFeed = document.getElementById("btnFeed");

    if (!btnMyReports || !btnFeed) return;

    if (tab === "feed") {
        btnMyReports.className = "btn btn-outline-primary";
        btnFeed.className = "btn btn-primary";
    } else {
        btnMyReports.className = "btn btn-primary";
        btnFeed.className = "btn btn-outline-primary";
    }
}

function handleRouting() {
    let hash = window.location.hash || "#login";

    if (hash === "#dashboard" && !isLoggedIn()) {
        hash = "#login";
        window.location.hash = "#login";
    }

    if (hash === "#login" && isLoggedIn()) {
        hash = "#dashboard";
        window.location.hash = "#dashboard";
    }

    const app = document.getElementById("app-content");

    if (!app) return;

    updateNavbar(hash);

    app.innerHTML = routes[hash] || routes["#login"];

    if (hash === "#login") {
        setupLoginForm();
        return;
    }

    if (hash === "#dashboard") {
        const sidebarUsername = document.getElementById("sidebarUsername");
        if (sidebarUsername) {
            sidebarUsername.textContent = getStoredUsername();
        }

        initReportModal();
        setupReportForm();
        setupTabButtons();
        setupAddButton();

        loadDashboardData("my_reports", 1);
    }
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);