import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Form, Input, Modal, Select, Upload, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRequest, updateRequest } from "../../redux/request/requestSlice";
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import PropTypes from "prop-types";
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { UploadOutlined } from '@ant-design/icons';
import "./RequestCard.pcss"; // Import the CSS file

const { Title, Text } = Typography;
const { Option } = Select;

const RequestCard = ({ requestData, showActions = true }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRequestData, setCurrentRequestData] = useState(null);
       const [attachments, setAttachments] = useState({});
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false); 

    const categories = useSelector((state) => state.category.categories || []);
    const tags = useSelector((state) => state.tag.tags || []);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTags());
    }, [dispatch]);

    if (!requestData || !requestData.request?.id) {
        console.warn("Invalid requestData:", requestData);
        return null;
    }

    // Xử lý xóa
    const handleDelete = async (id) => {
        try {
            console.log("Deleting request with ID:", id);
            await dispatch(deleteRequest(id)).unwrap();
            message.success("Request deleted successfully");
            window.location.reload(); // Tải lại trang (tuỳ cách bạn muốn xử lý)
        } catch (error) {
            console.error("Error deleting request:", error);
            message.error("Failed to delete request: " + (error.message || "Unknown error"));
        }
    };

    // Mở modal Edit
    const handleEdit = (data) => {
        setCurrentRequestData(data);
        setIsModalVisible(true);

        const initialValues = {
            title: data.request.title,
            content: data.request.content,
            phone: data.request.phone,
            email: data.request.email,
            location: data.request.location,
            categoryId: data.request.category.id,
            requestTags: data.requestTags?.map((taggable) => taggable.tag.id) || [],
            attachment: data.attachments || [],
        };

        console.log("Initial form values:", initialValues);
        form.setFieldsValue(initialValues);
    };

    // Đóng modal
    const handleCancel = () => {
        setIsModalVisible(false);
        setCurrentRequestData(null);
    };

    // Cập nhật request
    const handleUpdate = async (values) => {
      const updatedRequest = {
          id: currentRequestData.request.id,
          userId: currentRequestData.request.userId,
          title: values.title,
          content: values.content,
          phone: values.phone,
          email: values.email,
          location: values.location,
          imageUrls: attachments.images,
            videoUrls: attachments.videos,
          isEmergency: currentRequestData.request.isEmergency,
          categoryId: values.categoryId,
          tagIds: values.requestTags,
          status: currentRequestData.request.status,
      };
  
      try {
          console.log("Updating request:", updatedRequest);
          await dispatch(updateRequest({ id: currentRequestData.request.id, requestData: updatedRequest })).unwrap();
          message.success("Request updated successfully");
          setIsModalVisible(false);
          setCurrentRequestData(null);
      } catch (error) {
          console.error("Error updating request:", error);
          message.error("Failed to update request: " + (error.message || "Unknown error"));
      }
  };
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
            videos: uploadedFiles,
            images: prev.images || []
        }));
        console.log("attachment", attachments);
        setUploading(false);
    };

    return (
        <div>
            {/* Full Card */}
            <div className="w-80 bg-white h-30 rounded-2xl overflow-hidden cursor-pointer" style={{boxShadow:"rgba(0, 0, 0, 0.2) 0px 4px 8px 0px",borderRadius:"1rem"}} >
                {/* Ảnh đầu tiên hoặc placeholder */}
                <div className="bg-green-200 h-32 flex items-center justify-center" onClick={() => navigate(`/requests/${requestData.request.id}`)}>
                    {requestData.attachments && requestData.attachments.length > 0 ? (
                        <img
                            src={requestData.attachments[0]}
                            alt="Request"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src="https://via.placeholder.com/50"
                            alt="Placeholder"
                            className="opacity-50"
                        />
                    )}
                </div>

                <div style={{padding:"2rem"}}>
                  {/* Nội dung */}
                <div className="p-4" >
                    <div className="category-badge">
                        {requestData.request.category.categoryName}
                    </div>
                    <h2 className="text-lg font-bold">{requestData.request.title}</h2>
                    <p className="text-gray-600 text-sm">{requestData.request.content}</p>
                    <p className="text-gray-600 text-sm">Phone: {requestData.request.phone}</p>
                    <p className="text-gray-600 text-sm">Email: {requestData.request.email}</p>

                    <div className="tags">
                        {requestData.requestTags.map((tag) => (
                            <span key={tag.id} className="tag">
                                #{tag.tag.tagName}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Chỉ hiển thị Edit/Delete nếu showActions = true */}
                {showActions && (
                    <div className="request-card-actions flex justify-between p-4">
                        <Button
                            type="primary"
                            className="edit-button"
                            onClick={() => handleEdit(requestData)}
                        >
                            Edit
                        </Button>
                        <Button
                            type="danger"
                            className="delete-button"
                            onClick={() => handleDelete(requestData.request.id)}
                        >
                            Delete
                        </Button>
                    </div>
                )}
                </div>

            </div>

            {/* Modal Edit */}
            <Modal
                title="Edit Request"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
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
        </div>
    );
};

RequestCard.propTypes = {
    requestData: PropTypes.shape({
        request: PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            phone: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            location: PropTypes.string.isRequired,
            category: PropTypes.shape({
                id: PropTypes.string.isRequired,
                categoryName: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        requestTags: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                tag: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    tagName: PropTypes.string.isRequired,
                }).isRequired,
            })
        ),
        attachments: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,

    // Thêm prop này để ẩn/hiện nút Edit, Delete
    showActions: PropTypes.bool,
};

export default RequestCard;