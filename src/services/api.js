import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
 (response) => response,
     async (error) => {
         console.log("Error response: ", error.response);
         if ((
           (error.response.status === 400 &&  error.response.data.message.includes("Token expired"))
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

export default api;
