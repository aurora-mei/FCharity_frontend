import React,{useState, useEffect} from 'react';
import { Form, Input, Button, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import "antd/dist/reset.css";
import { useDispatch, useSelector } from 'react-redux';
import { createRequest } from '../../redux/request/requestSlice';
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { fetchTags } from '../../redux/tag/tagSlice';
import { useNavigate } from "react-router-dom";
import LoadingModal from "../LoadingModal/index.jsx";
import useLoading from "../../hooks/useLoading";
import { createPosts } from '../../redux/post/postSlice.js';


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

    let currentUser = {};
    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
        currentUser = {};
    }

    useEffect(() => {
        dispatch(fetchTags());
    }, [dispatch]);

    useEffect(() => {
        console.log("Tags:", tags);
        console.log("token: ", token);
        console.log("currentUser:", currentUser);
    }, [tags]);

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
        setUploading(true);
        let uploadedFiles = [];

        for (const file of fileList) {
            try {
                const response = await dispatch(uploadFileHelper(file.originFileObj, "images")).unwrap();
                uploadedFiles.push(response);
                message.success(`Uploaded ${file.name}`);
            } catch (error) {
                console.error("Error uploading image:", error);
                message.error(`Upload failed for ${file.name}`);
            }
        }

        setAttachments((prev) => ({
            ...prev,
            images: uploadedFiles,
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
                uploadedFiles.push(response);
                message.success(`Uploaded ${file.name}`);
            } catch (error) {
                console.error("Error uploading video:", error);
                message.error(`Upload failed for ${file.name}`);
            }
        }

        setAttachments((prev) => ({
            ...prev,
            videos: uploadedFiles,
            images: prev.images || []
        }));
        console.log("attachment", attachments);
        setUploading(false);
    };



    if (loadingUI || loading) return <LoadingModal />;
   

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter the post title!' }]}
            >
                <Input placeholder="Enter post title" />
            </Form.Item>

            <Form.Item
                name="content"
                label="Content"
                rules={[{ required: true, message: 'Please enter the post content!' }]}
            >
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
                                            accept="image/*"
                                            onChange={handleImageChange} // Xử lý khi chọn file
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
                                            onChange={handleVideoChange} // Xử lý khi chọn file
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