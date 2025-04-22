import { API_URL } from "../../constants/env-config";
import { APIPrivate } from "./api";

const endpoint = "api/notifications";

export const notificationApi = {
  getNotifications: async (params) => {
    const response = await APIPrivate.get(`${API_URL}${endpoint}`, { params });
    return response?.data;
  },

  markAsRead: async (notificationId) => {
    const response = await APIPrivate.put(
      `${API_URL}${endpoint}/mark-read/${notificationId}`
    );
    return response?.data;
  },

  markAllAsRead: async (userId) => {
    const response = await APIPrivate.put(
      `${API_URL}${endpoint}/mark-all`,
      undefined,
      {
        params: { userId },
      }
    );
    return response?.data;
  },
};
