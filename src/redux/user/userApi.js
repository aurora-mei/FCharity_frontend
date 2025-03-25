import { APIPrivate } from '../../config/API/api';

const getCurrentUser = async () => {
  try {
    const response = await APIPrivate.get('users/my-profile');
    return response.data;
  } catch (err) {
    console.error("Error fetching current user:", err);
    throw err.response.data;
  }
};

const updateProfile = async (profileData) => {
  try {
    const response = await APIPrivate.put('users/update-profile', profileData);
    console.log("Profile updated:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err.response.data;
  }
};

const userApi = { getCurrentUser, updateProfile };
export default userApi;
