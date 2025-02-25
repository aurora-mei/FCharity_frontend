import React, { useEffect } from "react";
import { Form, Input, Button, Checkbox, Typography, Select, Flex } from "antd";
import "antd/dist/reset.css";
import "./CreateRequestForm.pcss";
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import { useDispatch, useSelector } from 'react-redux';
import { createRequest } from '../../redux/request/requestSlice';
import { fetchCategories } from '../../redux/category/categorySlice';
import { fetchTags } from '../../redux/tag/tagSlice';
import { useNavigate } from "react-router-dom";
import LoadingModal from "../LoadingModal/index.jsx";
import useLoading from "../../hooks/useLoading";

const { Title, Text } = Typography;
const { Option } = Select;

const CreateRequestForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loadingUI = useLoading();
    const loading = useSelector((state) => state.request.loading);
    const categories = useSelector((state) => state.category.categories);
    const tags = useSelector((state) => state.tag.tags);
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");
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
    }, [dispatch]);

    const onFinish = async (values) => {
        const requestData = {
            ...values,
            userId: currentUser.userId, // Assign the current user's userId
        };
        console.log("Form Values:", requestData);
        await dispatch(createRequest(requestData)).unwrap();
        navigate('/requests', { replace: true });
    };

    if (loadingUI || loading) return <LoadingModal />;

    return (
        <div className="upper-container">
            <div className="container-request">
                <div className="request-form">
                    <div className="request-header">
                        <Flex justify='center' align='center'>
                            <a href="/"> <img
                                src={logo}
                                alt="FCharity logo"
                                width="110"
                                height="50"
                            /></a>
                        </Flex>
                        <Title level={3} style={{ lineHeight: '1' }} className="title">
                            Create a Request
                        </Title>
                        <p className="subtitle">
                            Fill in the details to create a new request.
                        </p>
                    </div>
                    <Form layout="vertical" onFinish={onFinish}>
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

                        <Form.Item label="Attachment" name="attachment">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Category" name="categoryId" rules={[{ required: true, message: "Category is required" }]}>
                            <Select placeholder="Select a category">
                                {Array.isArray(categories) && categories.map(category => (
                                    <Option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Tag" name="tagId" rules={[{ required: true, message: "Tag is required" }]}>
                            <Select placeholder="Select a tag">
                                {Array.isArray(tags) && tags.map(tag => (
                                    <Option key={tag.tagId} value={tag.tagId}>
                                        {tag.tagName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="isEmergency" valuePropName="checked">
                            <Checkbox>Is Emergency</Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Button htmlType="submit" block className="continue-button">
                                Create Request
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default CreateRequestForm;