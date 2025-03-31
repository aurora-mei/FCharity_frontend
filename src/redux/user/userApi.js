import { API } from "../../config/API/api";
import api from "../../services/api";
const getCurrentUser = async () => {
  try {
    console.log("Gửi request lấy current user...");
    const response = await API.get(`users/current-user`);
    console.log("response get current user: ", response?.data);
    return response?.data;
  } catch (err) {
    console.error("Error fetching current user:", err);

    // Kiểm tra err.response trước khi truy cập data
    if (err.response) {
      throw err.response.data;
    } else {
      throw new Error("Server không phản hồi hoặc bị lỗi.");
    }
  }
};

const getAllUsers = () => api.get("/users");

const userApi = { getCurrentUser, getAllUsers };
export default userApi;
