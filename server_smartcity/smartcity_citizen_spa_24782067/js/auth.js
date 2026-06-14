function setupLoginForm() {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("loginUsername");
        const passwordInput = document.getElementById("loginPassword");

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            alert("Username dan password wajib diisi.");
            return;
        }

        try {
            const response = await requestAPI("token/", "POST", {
                username: username,
                password: password
            });

            let data = null;

            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }

            if (response.ok && data && data.access) {
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh);

                window.location.hash = "#dashboard";
                return;
            }

            alert("Username atau password salah.");

        } catch (error) {
            console.error(error);
            alert("Gagal terhubung ke server.");
        }
    });
}

function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    window.location.hash = "#login";
}