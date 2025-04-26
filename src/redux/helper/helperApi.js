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
  formData.append("resource_type", resourceType);

  const isVideo = file.type.startsWith("video/");
  let uploadUrl = isVideo
    ? `${CLOUDINARY_URL.replace("/image/", "/video/")}`
    : CLOUDINARY_URL;
    if (resourceType === "video") {
      uploadUrl = CLOUDINARY_URL.replace("/image/", "/video/");
    } else if (resourceType === "raw") {
      uploadUrl = CLOUDINARY_URL.replace("/image/", "/raw/");
    }
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
const uploadFileMedia = async ({
  file,
  folderName = "default-folder",
  resourceType,
}) => {
  console.log("Uploading file:", file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESET_NAME);
  formData.append("folder", folderName); // 🌟 Thêm folder tùy chỉnh
  formData.append("resource_type", resourceType);
 let uploadUrl = CLOUDINARY_URL;
  if (resourceType === "video") {
    uploadUrl = CLOUDINARY_URL.replace("/image/", "/video/");
  } else if (resourceType === "raw") {
    uploadUrl = CLOUDINARY_URL.replace("/image/", "/raw/");
  }

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

//get list bank
const getListBank = async () => {
  try {
    const response = await axios.get("https://api.vietqr.io/v2/banks");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching list of banks:", error);
    throw error;
  }
};
const helperApi = { uploadFile, getPaymentLink, uploadFileMedia, getListBank };
export default helperApi;
