import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { UploadOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
const { Option } = Select;

const UpdateRequestModal = ({ form, isOpen, attachments, setAttachments, handleUpdate, handleCancel }) => {
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.category.categories || []);
    const tags = useSelector((state) => state.tag.tags || []);
    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchCategories());
        }
        if (tags.length === 0) {
            dispatch(fetchTags());
        }
        console.log("attachements", attachments);
    }, [dispatch]);


    const handleImageChange = async ({ fileList }) => {
        setUploading(true);
        let uploadedFiles = [];

        for (const file of fileList) {
            try {
                const response = await dispatch(uploadFileHelper(file.originFileObj, "images")).unwrap();
                console.log("response", response);
                uploadedFiles.push(response);
                message.success(`Uploaded ${file.name}`);
            } catch (error) {
                console.error("Error uploading image:", error);
                message.error(`Upload failed for ${file.name}`);
            }
        }

        setAttachments((prev) => ({
            ...prev,
            images: [...prev.images, ...uploadedFiles],
            videos: prev.videos || []
        }));
        console.log("attachment", attachments);
        setUploading(false);
    };

    const handleVideoChange = async ({ fileList }) => {
        setUploading(true);
        let uploadedFiles = [];

        for (const file of fileList) {
            try {
                const response = await dispatch(uploadFileHelper(file.originFileObj, "videos")).unwrap();
                console.log("response", response);
                uploadedFiles.push(response);
                message.success(`Uploaded ${file.name}`);
            } catch (error) {
                console.error("Error uploading video:", error);
                message.error(`Upload failed for ${file.name}`);
            }
        }

        setAttachments((prev) => ({
            ...prev,
            videos: [...prev.videos, ...uploadedFiles],
            images: prev.images || []
        }));
        console.log("attachment", attachments);
        setUploading(false);
    };
    return (
        <Modal open={isOpen} footer={null} title="Update Request" onCancel={handleCancel}>
            <Form form={form} layout="vertical" onFinish={handleUpdate} >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: "Title is required" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: "Content is required" }]}
                >
                    <Input.TextArea />
                </Form.Item>

                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{ required: true, message: "Phone is required" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, type: "email", message: "Please enter a valid email" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Location"
                    name="location"
                    rules={[{ required: true, message: "Location is required" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item label="Images" name="images">
                    <Upload
                        multiple
                        listType="picture"
                        beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                        accept="image/*"
                        onChange={handleImageChange}
                        defaultFileList={
                            Array.isArray(attachments.images)
                                ? attachments.images
                                    .map((image, index) => ({
                                        uid: index.toString(),
                                        name: `Image ${index + 1}`,
                                        url: image, // URL ảnh từ attachments cũ
                                    }))
                                : []
                        }
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                    </Upload>
                </Form.Item>
                <Form.Item label="Videos" name="videos">
                    <Upload
                        multiple
                        listType="picture"
                        beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                        accept="video/*"
                        onChange={handleVideoChange}
                        defaultFileList={
                            Array.isArray(attachments.videos)
                                ? attachments.videos
                                    .map((video, index) => ({
                                        uid: index.toString(),
                                        name: `Video ${index + 1}`,
                                        url: video, // URL ảnh từ attachments cũ
                                    }))
                                : []
                        }
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                    </Upload>
                </Form.Item>


                <Form.Item
                    label="Category"
                    name="categoryId"
                    rules={[{ required: true, message: "Category is required" }]}
                >
                    <Select placeholder="Select a category">
                        {Array.isArray(categories) &&
                            categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.categoryName}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Tags"
                    name="requestTags"
                    rules={[{ required: true, message: "At least one tag is required" }]}
                >
                    <Select mode="multiple" placeholder="Select tags" allowClear>
                        {Array.isArray(tags) &&
                            tags.map((tag) => (
                                <Option key={tag.id} value={tag.id}>
                                    {tag.tagName}
                                </Option>
                            ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block className="request-btn">
                        Update Request
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateRequestModal;