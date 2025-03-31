import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import "antd/dist/reset.css";
import { useDispatch, useSelector } from 'react-redux';
import { createPosts } from '../../redux/post/postSlice.js';
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { fetchTags } from '../../redux/tag/tagSlice';
import { useNavigate } from "react-router-dom";
import LoadingModal from "../LoadingModal/index.jsx";
import useLoading from "../../hooks/useLoading";

const { Option } = Select;

const PostForm = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loadingUI = useLoading();
    const loading = useSelector((state) => state.request.loading);
    const tags = useSelector((state) => state.tag.tags || []);
    const token = useSelector((state) => state.auth.token);
    const storedUser = localStorage.getItem("currentUser");
    const [attachments, setAttachments] = useState({}); // Lưu danh sách file đã upload
    const [uploading, setUploading] = useState(false); // Trạng thái loading khi upload
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedVideos, setUploadedVideos] = useState([]);

    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }

    useEffect(() => {
        if (!tags.length) {
            dispatch(fetchTags());
        }
    }, [dispatch, tags]);

    useEffect(() => {
        if (!token) {
            message.error("You need to log in first!");
            navigate("/login");
        }
    }, [token]);

    const onFinish = async (values) => {
        console.log("Form Values:", values);
        console.log("Attachments:", attachments);

        const postData = {
            ...values,
            userId: currentUser.id,
            tagIds: values.tagIds,
            imageUrls: attachments.images,
            videoUrls: attachments.videos// Gửi danh sách file đã upload
        };

        console.log("Final Post Data:", postData);
        await dispatch(createPosts(postData)).unwrap();
        navigate('/forum', { replace: true });
    };
    const handleImageChange = async ({ fileList }) => {
        if (fileList.length === 0) return; // Nếu danh sách trống, không làm gì

        setUploading(true);
        const latestFile = fileList[fileList.length - 1];

        try {
            const response = await dispatch(uploadFileHelper({ file: latestFile.originFileObj, folderName: "images" })).unwrap();
            console.log("response", response);
            latestFile.url = response;
            setUploadedImages((prevImages) => {
                const uploadedImages = [...prevImages, response];
                setAttachments((prev) => ({
                    ...prev,
                    images: uploadedImages,
                    videos: prev.videos || []
                }));
                return uploadedImages;
            });
            console.log("attachments", attachments);
            message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error(`Upload failed for ${latestFile.name}`);
        }


        console.log("attachment", attachments);
        setUploading(false);
    };

    const handleVideoChange = async ({ fileList }) => {
        if (fileList.length === 0) return;

        setUploading(true);
        const latestFile = fileList[fileList.length - 1];

        try {
            const response = await dispatch(uploadFileHelper({ file: latestFile.originFileObj, folderName: "videos" })).unwrap();
            console.log("response", response);
            latestFile.url = response;
            setUploadedVideos((prevVideos) => {
                const updatedVideos = [...prevVideos, response];

                // Cập nhật state attachments sau khi uploadedVideos cập nhật
                setAttachments((prev) => ({
                    ...prev,
                    videos: updatedVideos,
                    images: prev.images || []
                }));

                return updatedVideos; // Trả về danh sách mới
            });

            message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
            console.error("Error uploading video:", error);
            message.error(`Upload failed for ${latestFile.name}`);
        }

        setUploading(false);
    };
    const handleRemoveFile = async ({ file, type }) => {
        try {
            console.log("Deleting file:", file, type);
            if (type === "images") {
                setUploadedImages((prevImages) => {
                    const updatedImages = prevImages.filter((image) => image !== file.url);
                    console.log("updatedImages", updatedImages);
                    setAttachments((prev) => ({
                        ...prev,
                        images: updatedImages,
                    }));
                    return updatedImages;
                });
            } else {
                setUploadedVideos((prevVideos) => {
                    const updatedVideos = prevVideos.filter((video) => video !== file.url);
                    setAttachments((prev) => ({
                        ...prev,
                        videos: updatedVideos,
                    }));
                    return updatedVideos;
                });
            }
            console.log("attachments", attachments);
            message.success(`Deleted ${file.name}`);
        } catch (error) {
            console.error("Error deleting file:", error);
            message.error(`Delete failed for ${file.name}`);
        }
    };



    if (loadingUI || loading) return <LoadingModal />;


    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter the post title!' }]}> 
                <Input placeholder="Enter post title" />
            </Form.Item>

            <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Please enter the post content!' }]}> 
                <Input.TextArea rows={4} placeholder="Enter post content" />
            </Form.Item>
            <Form.Item
                className="select-multiple"
                label="Tags"
                name="tagIds"
                rules={[{ required: true, message: "At least one tag is required" }]}
            >
                <Select
                    mode="multiple"
                    placeholder="Select tags"
                    allowClear
                    onChange={(selectedTags) => {
                        if (selectedTags.length > 5) {
                            message.warning("You can select up to 5 tags only.");
                            form.setFieldsValue({ tagIds: selectedTags.slice(0, 5) });
                        }
                    }}
                >
                    {Array.isArray(tags) && tags.map(tag => (
                        <Option key={tag.id} value={tag.id}>
                            {tag.tagName}
                        </Option>
                    ))}
                </Select>
            </Form.Item>


            <Form.Item label="Images" name="images">
                <Upload
                    multiple
                    listType="picture"
                    beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                    beforeRemove={() => false}
                    accept="image/*"
                    onChange={handleImageChange} // Xử lý khi chọn file
                    onRemove={(file) => handleRemoveFile({ file, type: "images" })}
                >
                    <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                </Upload>
            </Form.Item>
            <Form.Item label="Videos" name="videos">
                <Upload
                    multiple
                    listType="picture"
                    beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                    beforeRemove={() => false}
                    accept="video/*"
                    onChange={handleVideoChange} // Xử lý khi chọn file
                    onRemove={(file) => handleRemoveFile({ file, type: "videos" })}
                >
                    <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                </Upload>
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                    htmlType="submit"
                    type="default"
                    style={{
                        border: "1px solid #213547",
                        backgroundColor: "transparent",
                        color: "#213547",
                    }}
                >
                    Submit
                </Button>
            </div>

        </Form>
    );
};

export default PostForm;
