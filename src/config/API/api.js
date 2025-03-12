import axios from "axios";

export const API = axios.create({
  baseURL: `http://localhost:8080/`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const APIPrivate = axios.create({
  baseURL: `http://localhost:8080/`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ Get state dynamically inside interceptor
APIPrivate.interceptors.request.use(
  async (config) => {
    // const storeModule = await import("../../redux/store"); // ✅ Dùng dynamic import
    // const store = storeModule.default;
    // const token = store.getState().auth.token;

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token found in localStorage");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

APIPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);
