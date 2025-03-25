import { API, APIPrivate } from '../../config/API/api';

const signup = async (signupRequestModel) => {
    try {
        const response = await API.post(`auth/signup`, signupRequestModel);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
const verify = async (verifyRequestModel) => {
    try {
        const response = await API.post(`auth/verify`, verifyRequestModel);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
const sendOTP = async (sendOTPModel) => {
    try {
        const response = await API.post(`auth/resendOTP`, sendOTPModel);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
const login = async (loginRequestModel) => {
    try {
        const response = await API.post(`auth/login`, loginRequestModel);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
const getCurrentUser = async () => {
    try {
        console.log("Gửi request lấy current user...");
        const response = await APIPrivate.get(`users/my-profile`);
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

const googleLogin = async (token) => {
    try {
        const response = await API.post(`auth/google-login`, { token });
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};

const sendResetPasswordOTP = async (sendOTPModel) => {
    try {
        const response = await API.post(`auth/reset-password-otp`, sendOTPModel);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
const verifyResetPasswordOTP = async (verifyRequestModel) => {
    try {
        const response = await API.post(`auth/verify-reset-password-otp`, verifyRequestModel);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};

const resetPassword = async (resetRequestModel) => {
    try {
        const response = await API.post(`auth/reset-password`, resetRequestModel);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};

const changePassword = async (changePasswordData) => {
    try {
      const response = await APIPrivate.post('users/change-password', changePasswordData);
      return response.data;
    } catch (err) {
      console.error("Error changing password:", err);
      throw err.response ? err.response.data : err;
    }
  };

const authApi = { signup, verify, sendOTP, login, getCurrentUser, googleLogin, sendResetPasswordOTP, verifyResetPasswordOTP, resetPassword, changePassword };
export default authApi;
