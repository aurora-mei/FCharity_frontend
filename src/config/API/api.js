import axios from "axios";

export const API = axios.create({
    baseURL: `http://localhost:8080/`,
});

export const APIPrivate = axios.create({
    baseURL: `http://localhost:8080/`,
    withCredentials: true,
});

// ✅ Get state dynamically inside interceptor
APIPrivate.interceptors.request.use(
    async (config) => {

        const token = localStorage.getItem("token");
        console.log("Token before request: ", token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

APIPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response.status === 403) {
            const refreshToken = localStorage.getItem("refreshToken");
            const response = await API.post("auth/refresh", { refreshToken });
            console.log("Refresh token response: ", response);
            if (response.status === 200) {
                localStorage.setItem("token", response.data.token);
                error.config.headers["Authorization"] = `Bearer ${response.data.token}`;
                return APIPrivate.request(error.config);
            }
        }
        return Promise.reject(error);
    }
);




