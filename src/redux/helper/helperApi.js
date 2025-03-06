import { Cloudinary } from "@cloudinary/url-gen/index";
import axios from "axios";
const CLOUD_NAME = process.env.REACT_APP_CLOUD_NAME;
const CLOUDINARY_URL = process.env.REACT_APP_CLOUDINARY_URL;
const cloudinary = new Cloudinary({
    cloud: {
        cloudName: CLOUD_NAME,
    },
});
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "preset1");

    const res = await axios.post(CLOUDINARY_URL, {
        body: formData,
    });
    return await res.json();
}
