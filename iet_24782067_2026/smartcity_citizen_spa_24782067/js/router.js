const routes = {

    '#login': `
        <div class="row justify-content-center mt-5">
            <div class="col-md-4 card shadow-sm border-0 p-4">

                <h4 class="text-center fw-bold mb-4">
                    Login Warga
                </h4>

                <form id="loginForm">

                    <input
                        type="text"
                        id="loginUsername"
                        class="form-control mb-3"
                        placeholder="Username"
                        required>

                    <input
                        type="password"
                        id="loginPassword"
                        class="form-control mb-3"
                        placeholder="Password"
                        required>

                    <button
                        type="submit"
                        class="btn btn-primary w-100 fw-bold">
                        Masuk
                    </button>

                </form>

            </div>
        </div>
    `,

    '#dashboard': `
        <div class="row g-4">

            <!-- Sidebar Kiri -->
            <aside class="col-12 col-lg-3">
                <div class="card border-0 shadow-sm p-3 sticky-top" style="top:20px;">
                    <button
                        id="btnNewReport"
                        class="btn btn-primary btn-lg w-100 fw-bold mb-3">
                        <i class="bi bi-plus-circle-fill me-2"></i>
                        Laporan Baru
                    </button>
                </div>
            </aside>

            <!-- Konten Tengah -->
            <section class="col-12 col-lg-6">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">

                        <!-- TAB -->
                        <div class="btn-group w-100 mb-4">
                            <button id="btnMyReports" class="btn btn-outline-primary">
                                Laporan Saya
                            </button>
                            <button id="btnFeed" class="btn btn-outline-primary">
                                Feed Kota
                            </button>
                        </div>

                        <!-- LIST -->
                        <div id="listContainer" class="row g-3"></div>

                        <!-- PAGINATION -->
                        <div id="paginationContainer" class="mt-4 text-center"></div>

                    </div>
                </div>
            </section>

            <!-- Sidebar Kanan -->
            <aside class="col-12 col-lg-3 d-none d-lg-block">
                <div class="card border-0 shadow-sm p-3 sticky-top" style="top:20px;">
                    <h6 class="fw-bold">
                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                        Pengumuman
                    </h6>
                    <p class="small text-muted">Smart City Portal</p>
                </div>
            </aside>

        </div>
    `
};

// ==========================
// ROUTER HANDLER
// ==========================

function handleRouting() {

    const hash = window.location.hash || '#login';

    document.getElementById('app-content').innerHTML =
        routes[hash] || routes['#login'];

    // LOGIN
    if (hash === '#login' && typeof setupLoginForm === 'function') {
        setupLoginForm();
    }

    // DASHBOARD
    if (hash === '#dashboard' && typeof loadDashboardData === 'function') {

        // Load awal
        loadDashboardData('my_reports', 1);

        // Binding tombol tab (AMAN tanpa setTimeout)
        const btnMyReports = document.getElementById('btnMyReports');
        const btnFeed = document.getElementById('btnFeed');

        if (btnMyReports) {
            btnMyReports.onclick = () => {
                loadDashboardData('my_reports', 1);
            };
        }

        if (btnFeed) {
            btnFeed.onclick = () => {
                loadDashboardData('feed', 1);
            };
        }
    }
}

// ==========================
// EVENT LISTENER
// ==========================

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);