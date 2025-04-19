import { Cloudinary } from "@cloudinary/url-gen/index";
import { API, APIPrivate } from "../../config/API/api";
import axios from "axios";
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const PRESET_NAME = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
const cloudinary = new Cloudinary({
  cloud: {
    cloudName: CLOUD_NAME,
  },
});
const uploadFile = async ({ file, folderName = "default-folder" }) => {
  console.log("Uploading file:", file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESET_NAME);
  formData.append("folder", folderName); // 🌟 Thêm folder tùy chỉnh

  const isVideo = file.type.startsWith("video/");
  const uploadUrl = isVideo
    ? `${CLOUDINARY_URL.replace("/image/", "/video/")}`
    : CLOUDINARY_URL;
  console.log("up url", uploadUrl);
  try {
    const res = await axios.post(uploadUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Upload successful:", res.data);
    return res.data.secure_url; // Trả về URL file đã upload
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};

//GENERATE QR

const getPaymentLink = async (data) => {
  try {
    const response = await APIPrivate.post("payment/create", data);
    console.log("QR Code response:", response);
    return response.data;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};
const helperApi = { uploadFile, getPaymentLink };
export default helperApi;
