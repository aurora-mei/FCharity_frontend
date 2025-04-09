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

const RESOURCE_TYPES = {
  "image/": "image",
  "video/": "video",
  "application/pdf": "raw",
  "application/msword": "raw",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "raw",
  "application/vnd.ms-excel": "raw",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "raw",
  "application/vnd.ms-powerpoint": "raw",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "raw",
  "text/": "raw",
};

export async function uploadFile({
  file,
  folderName = "default-folder",
  onProgress = null,
}) {
  console.log("Uploading file:", file);

  const fileType = Object.keys(RESOURCE_TYPES).find((type) =>
    file.type.startsWith(type.replace("*", ""))
  );

  const resourceType = fileType ? RESOURCE_TYPES[fileType] : "auto";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", PRESET_NAME);
  formData.append("folder", folderName); // 🌟 Thêm folder tùy chỉnh
  formData.append("resource_type", resourceType);

  let uploadUrl = CLOUDINARY_URL;

  if (resourceType === "video") {
    uploadUrl = CLOUDINARY_URL.replace("/image/", "/video/");
  } else if (resourceType === "raw") {
    uploadUrl = CLOUDINARY_URL.replace("/image/", "/raw");
  }

  const isVideo = file.type.startsWith("video/");

  //   const uploadUrl = isVideo
  //     ? `${CLOUDINARY_URL.replace("/image/", "/video/")}`
  //     : CLOUDINARY_URL;

  try {
    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };

    if (onProgress) {
      config.onUploadProgress = (processEvent) => {
        const percentCompleted = Math.round(
          (processEvent.loaded * 100) / processEvent.total
        );
        onProgress(percentCompleted);
      };
         const res = await axios.post(uploadUrl, formData, config);

    console.log("Upload successful:", res.data);
    return res.data.secure_url;
  } catch (error) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Upload failed");
  }

//GENERATE QR

const getPaymentLink = async (data) => {
    try {
        const response = await APIPrivate.post( "payment/create",data);
        console.log("QR Code response:", response);
        return response.data;
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw error;
    }
}
const helperApi = { uploadFile, getPaymentLink};
export default helperApi;
