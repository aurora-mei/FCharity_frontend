import { API } from '../../config/API/api';
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

const userApi = { getCurrentUser };
export default userApi;