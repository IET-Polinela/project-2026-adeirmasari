const BASE_URL = "http://103.151.63.87:8003/api/";

let isRedirectingToLogin = false;

function getAccessToken() {
    return localStorage.getItem("access_token");
}

function clearLoginData() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
}

function redirectToLogin() {
    if (isRedirectingToLogin) return;

    isRedirectingToLogin = true;
    clearLoginData();

    window.location.hash = "#login";
}

async function requestAPI(endpoint, method = "GET", bodyData = null) {
    const headers = {
        "Content-Type": "application/json"
    };

    const token = getAccessToken();

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers
    };

    if (bodyData !== null) {
        config.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
            redirectToLogin();
        }

        return response;

    } catch (error) {
        console.error("Gagal terhubung ke API:", error);
        throw error;
    }
}

function getAPI(endpoint) {
    return requestAPI(endpoint, "GET");
}

function postAPI(endpoint, bodyData) {
    return requestAPI(endpoint, "POST", bodyData);
}

function putAPI(endpoint, bodyData) {
    return requestAPI(endpoint, "PUT", bodyData);
}

function patchAPI(endpoint, bodyData) {
    return requestAPI(endpoint, "PATCH", bodyData);
}

function deleteAPI(endpoint) {
    return requestAPI(endpoint, "DELETE");
}