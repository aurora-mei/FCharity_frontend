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
    const [attachments, setAttachments] = useState({ images: [], videos: [] });
    const [uploading, setUploading] = useState(false);
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
            videoUrls: attachments.videos
        };

        console.log("Final Post Data:", postData);

        try {
            await dispatch(createPosts(postData)).unwrap();
            message.success("Post created successfully!");
            navigate('/forum', { replace: true });
        } catch (error) {
            console.error("Error creating post:", error);
            message.error("Failed to create post. Please try again.");
        }
    };

    const handleFileChange = async ({ fileList }, type) => {
        setUploading(true);
        let uploadedFiles = [];

        for (const file of fileList) {
            try {
                const response = await dispatch(uploadFileHelper(file.originFileObj, type)).unwrap();
                uploadedFiles.push(response);
                message.success(`Uploaded ${file.name}`);
            } catch (error) {
                console.error(`Error uploading ${type}:`, error);
                message.error(`Upload failed for ${file.name}`);
            }
        }

        setAttachments(prev => {
            const newAttachments = { ...prev, [type]: uploadedFiles };
            console.log("Updated attachments:", newAttachments);
            return newAttachments;
        });

        setUploading(false);
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

            <Form.Item label="Tags" name="tagIds" rules={[{ required: true, message: "At least one tag is required" }]}> 
                <Select mode="multiple" placeholder="Select tags" allowClear>
                    {tags.map(tag => (
                        <Option key={tag.id} value={tag.id}>{tag.tagName}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Images" name="images">
                <Upload multiple listType="picture" beforeUpload={() => false} accept="image/*" onChange={(info) => handleFileChange(info, 'images')}>
                    <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                </Upload>
            </Form.Item>

            <Form.Item label="Videos" name="videos">
                <Upload multiple listType="picture" beforeUpload={() => false} accept="video/*" onChange={(info) => handleFileChange(info, 'videos')}>
                    <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                </Upload>
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <Button htmlType="submit" type="default" style={{ border: "1px solid #213547", backgroundColor: "transparent", color: "#213547" }}>Submit</Button>
            </div>
        </Form>
    );
};

export default PostForm;
