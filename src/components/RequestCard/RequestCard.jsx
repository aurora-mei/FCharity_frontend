import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Form, Input, Modal, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRequest, updateRequest } from "../../redux/request/requestSlice";
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import PropTypes from "prop-types";

const { Title, Text } = Typography;
const { Option } = Select;

const RequestCard = ({ requestData }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const categories = useSelector((state) => state.category.categories || []);
    const tags = useSelector((state) => state.tag.tags || []);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchTags());
    }, [dispatch]);

    if (!requestData || !requestData.request.id) {
        console.warn("Invalid requestData:", requestData);
        return null;
    }

    const handleDelete = async () => {
        try {
            console.log("Deleting request with ID:", requestData.request.id);
            await dispatch(deleteRequest(requestData.request.id)).unwrap();
            message.success("Request deleted successfully");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting request:", error);
            message.error("Failed to delete request: " + (error.message || "Unknown error"));
        }
    };

    const handleEdit = () => {
        setIsModalVisible(true);
        form.setFieldsValue({
            title: requestData.request.title,
            content: requestData.request.content,
            phone: requestData.request.phone,
            email: requestData.request.email,
            location: requestData.request.location,
            categoryId: requestData.request.categoryId,
            tagIds: requestData.request.tagIds,
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleUpdate = async (values) => {
        const updatedRequest = {
            ...requestData.request,
            ...values,
        };
        try {
            console.log("Updating request:", updatedRequest);
            await dispatch(updateRequest({ id: requestData.request.id, requestData: updatedRequest })).unwrap();
            message.success("Request updated successfully");
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error updating request:", error);
            message.error("Failed to update request: " + (error.message || "Unknown error"));
        }
    };

    return (
        <Card className="request-card">
            <div className="request-card-header">
                <Title level={4} className="request-card-title">
                    {requestData.request.title}
                </Title>
                <Button type="link" onClick={() => navigate(`/requests/${requestData.request.id}`)}>View Details</Button>
            </div>
            <Text>{requestData.request.content}</Text>
            <div className="request-card-actions">
                <Button type="primary" className="edit-button" onClick={handleEdit}>Edit</Button>
                <Button type="danger" className="delete-button" onClick={handleDelete}>Delete</Button>
            </div>

            <Modal
                title="Edit Request"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
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
                    <Form.Item label="Location" name="location" rules={[{ required: true, message: "Location is required" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Category" name="categoryId" rules={[{ required: true, message: "Category is required" }]}>
                        <Select placeholder="Select a category">
                            {Array.isArray(categories) && categories.map(category => (
                                <Option key={category.id} value={category.id}>
                                    {category.categoryName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Tags" name="tagIds" rules={[{ required: true, message: "At least one tag is required" }]}>
                        <Select
                            mode="multiple"
                            placeholder="Select tags"
                            allowClear
                        >
                            {Array.isArray(tags) && tags.map(tag => (
                                <Option key={tag.id} value={tag.id}>
                                    {tag.tagName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Update Request
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
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
            categoryId: PropTypes.string.isRequired,
            tagIds: PropTypes.arrayOf(PropTypes.string).isRequired,
        }).isRequired,
    }).isRequired,
};

export default RequestCard;