import { API, APIPrivate } from "../../config/API/api";
import api from "../../services/api";
const getCurrentUser = async () => {
  try {
    console.log("Gửi request lấy current user...");
    const response = await API.get(`users/my-profile`);
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

const updateProfile = async (profileData) => {
  try {
    console.log("Gửi request cập nhật profile:", profileData);
    const response = await APIPrivate.put("users/update-profile", profileData);
    console.log("Response update profile:", response?.data);
    return response?.data;
  } catch (err) {
    console.error("Error updating profile:", err);
    if (err.response) {
      throw err.response.data;
    } else {
      throw new Error("Lỗi kết nối đến server.");
    }
  }
};

const userApi = { getCurrentUser, getAllUsers, updateProfile };
export default userApi;