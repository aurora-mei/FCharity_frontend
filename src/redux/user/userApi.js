import { API,APIPrivate } from "../../config/API/api";
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
const getTransactionHistoryOfUser = async (userId) => {
  try {
    const response = await APIPrivate.get(`users/${userId}/transaction-history`);
    return response.data;
  } catch (err) {
    console.error("Error fetching transaction history:", err);
    throw err;
  }
}
const getCurrentWallet = async () => {
  try {
    const response = await APIPrivate.get("users/current-wallet");
    return response.data;
  } catch (err) {
    console.error("Error fetching transaction history:", err);
    throw err;
  }
}

const getAllUsers = () => api.get("/users");

const userApi = { getCurrentUser, getAllUsers, getTransactionHistoryOfUser,getCurrentWallet };
export default userApi;
