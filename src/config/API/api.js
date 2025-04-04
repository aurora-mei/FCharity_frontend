import { ConsoleSqlOutlined } from "@ant-design/icons";
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
    async (error) => {
        console.log("Error response: ", error.response);
        if ((
            error.response.status === 403 
            || (error.response.status === 400 &&  error.response.data.message.includes("Token expired"))
        )
            && error.config && !error.config.url.includes("cloudinary") ) {
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
