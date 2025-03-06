import { Cloudinary } from "@cloudinary/url-gen/index";
import axios from "axios";
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const PRESET_NAME = import.meta.env.VITE_PRESET_NAME;
const cloudinary = new Cloudinary({
    cloud: {
        cloudName: CLOUD_NAME,
    },
});
export async function uploadFile(file, folderName = "default-folder") {
    console.log("Uploading file:", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", PRESET_NAME);
    formData.append("folder", folderName); // 🌟 Thêm folder tùy chỉnh

    const isVideo = file.type.startsWith("video/");
    const uploadUrl = isVideo
        ? `${CLOUDINARY_URL.replace("/image/", "/video/")}`
        : CLOUDINARY_URL;

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
}

