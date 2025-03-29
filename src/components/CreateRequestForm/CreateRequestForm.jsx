import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Select, Upload, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import "antd/dist/reset.css";
import { useDispatch, useSelector } from 'react-redux';
import { createRequest } from '../../redux/request/requestSlice';
import { fetchCategories } from '../../redux/category/categorySlice';
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { fetchTags } from '../../redux/tag/tagSlice';
import { useNavigate } from "react-router-dom";
import LoadingModal from "../LoadingModal/index.jsx";
import useLoading from "../../hooks/useLoading";

const { Title } = Typography;
const { Option } = Select;

const CreateRequestForm = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loadingUI = useLoading();
    const loading = useSelector((state) => state.request.loading);
    const categories = useSelector((state) => state.category.categories || []);
    const tags = useSelector((state) => state.tag.tags || []);
    const token = useSelector((state) => state.auth.token);
    const storedUser = localStorage.getItem("currentUser");
    const [attachments, setAttachments] = useState({}); // Lưu danh sách file đã upload
    const [uploading, setUploading] = useState(false); // Trạng thái loading khi upload
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    let currentUser = {};
    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
        currentUser = {};
    }

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTags());
        loadProvinces();
    }, [dispatch]);

    useEffect(() => {
        console.log("Categories:", categories);
        console.log("Tags:", tags);
        console.log("token: ", token);
        console.log("currentUser:", currentUser);
    }, [categories, tags]);

    const loadProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            setProvinces(data);
        } catch (error) {
            console.error("Failed to load provinces:", error);
        }
    };

    const handleProvinceChange = async (value) => {
        setSelectedProvince(value);
        const selectedProvinceName = provinces.find(province => province.code === value)?.name;

        form.setFieldsValue({
            provinceName: selectedProvinceName,
            district: null,  // Reset district khi chọn tỉnh mới
            districtName: "",
            commune: null,  // Reset commune khi chọn tỉnh mới
            communeName: ""
        });

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${value}?depth=2`);
            const data = await response.json();
            setDistricts(data.districts);
            setCommunes([]);
        } catch (error) {
            console.error("Failed to load districts:", error);
        }
    };

    const handleDistrictChange = async (value) => {
        setSelectedDistrict(value);
        const selectedDistrictName = districts.find(district => district.code === value)?.name;

        form.setFieldsValue({
            districtName: selectedDistrictName,
            commune: null,  // Reset commune khi chọn quận/huyện mới
            communeName: ""
        });

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${value}?depth=2`);
            const data = await response.json();
            setCommunes(data.wards);
        } catch (error) {
            console.error("Failed to load communes:", error);
        }
    };

    const handleCommuneChange = (value) => {
        const selectedCommuneName = communes.find(commune => commune.code === value)?.name;
        form.setFieldsValue({ communeName: selectedCommuneName });
    };

    const onFinish = async (values) => {
        console.log("Form Values:", values);

        const formData = form.getFieldsValue(); // Lấy toàn bộ dữ liệu từ form
        const fullAddress = `${values.location}, ${formData.communeName}, ${formData.districtName}, ${formData.provinceName}`;

        const requestData = {
            ...values,
            userId: currentUser.id,
            tagIds: values.tagIds,
            imageUrls: attachments.images,
            videoUrls: attachments.videos,
            fullAddress
        };

        console.log("Final Request Data:", requestData);
        await dispatch(createRequest(requestData)).unwrap();
        navigate('/user/manage-profile/myrequests', { replace: true });
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
    const handleRemoveFile = async ({file, type}) => {
        try {
            console.log("Deleting file:", file,type);
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
        <div className="upper-container-request">
            <div className="container-request">
                <div className="create-request-form">
                    <div className="request-header">
                        <Title level={3} style={{ lineHeight: '1' }} className="title">
                            Create a Request
                        </Title>
                        <p className="subtitle">
                            Fill in the details to create a new request.
                        </p>
                    </div>
                    <Form form={form} layout="vertical" onFinish={onFinish} >
                        <Form.Item label="Title" name="title" rules={[{ required: true, message: "Title is required" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Content" name="content" rules={[{ required: true, message: "Content is required" }]}>
                            <Input.TextArea />
                        </Form.Item>

                        <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone is required" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Province" name="province" rules={[{ required: true, message: "Province is required" }]}>
                            <Select placeholder="Select Province" onChange={handleProvinceChange}>
                                {provinces.map(province => (
                                    <Option key={province.code} value={province.code}>
                                        {province.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="District" name="district" rules={[{ required: true, message: "District is required" }]}>
                            <Select placeholder="Select District" onChange={handleDistrictChange} disabled={!selectedProvince}>
                                {districts.map(district => (
                                    <Option key={district.code} value={district.code}>
                                        {district.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Commune" name="commune" rules={[{ required: true, message: "Commune is required" }]}>
                            <Select placeholder="Select Commune" onChange={handleCommuneChange} disabled={!selectedDistrict}>
                                {communes.map(commune => (
                                    <Option key={commune.code} value={commune.code}>
                                        {commune.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Address" name="location" rules={[{ required: true, message: "Location is required" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="provinceName" hidden initialValue="">
                            <Input />
                        </Form.Item>
                        <Form.Item name="districtName" hidden initialValue="">
                            <Input />
                        </Form.Item>
                        <Form.Item name="communeName" hidden initialValue="">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Images" name="images" rules={[{ required: true, message: "At least one image is required" }]}>
                            <Upload
                                multiple
                                listType="picture"
                                beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                                beforeRemove={() => false}
                                accept="image/*"
                                onChange={handleImageChange} // Xử lý khi chọn file
                                onRemove={(file)=>handleRemoveFile({file, type: "images"})}
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
                                onRemove={(file)=>handleRemoveFile({file, type: "videos"})}
                            >
                                <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item label="Category" name="categoryId" className="select-single" rules={[{ required: true, message: "Category is required" }]}>
                            <Select placeholder="Select a category">
                                {categories.map(category => (
                                    <Option key={category.id} value={category.id}>
                                        {category.categoryName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item className="select-multiple" label="Tags" name="tagIds" rules={[{ required: true, message: "At least one tag is required" }]}>
                            <Select mode="multiple" placeholder="Select tags" allowClear>
                                {Array.isArray(tags) && tags.map(tag => (
                                    <Option key={tag.id} value={tag.id}>
                                        {tag.tagName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="isEmergency" valuePropName="checked">
                            <Checkbox>Is Emergency</Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                className="continue-button"
                                disabled={uploading} // Vô hiệu hóa khi đang upload
                            >
                                {uploading ? "Uploading..." : "Create Request"}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default CreateRequestForm;