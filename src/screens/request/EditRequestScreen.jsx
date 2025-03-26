import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, Typography, Select } from "antd";
import { fetchRequestById, updateRequest } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import useLoading from "../../hooks/useLoading";

const { Title } = Typography;
const { Option } = Select;

const EditRequestScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loadingUI = useLoading();
    const loading = useSelector((state) => state.request.loading);
    const request = useSelector((state) => state.request.currentRequest);
    const categories = useSelector((state) => state.category.categories || []);
    const tags = useSelector((state) => state.tag.tags || []);

    useEffect(() => {
        dispatch(fetchRequestById(id));
    }, [dispatch, id]);

    const onFinish = async (values) => {
        const requestData = {
            ...values,
            id: request.id,
        };
        await dispatch(updateRequest({ id: request.id, requestData })).unwrap();
        navigate('/requests', { replace: true });
    };

    if (loadingUI || loading) return <LoadingModal />;

    return (
        <div className="upper-container-request">
            <div className="container-request">
                <div className="request-form">
                    <div className="request-header">
                        <Title level={3} style={{ lineHeight: '1' }} className="title">
                            Edit Request
                        </Title>
                        <p className="subtitle">
                            Update the details of your request.
                        </p>
                    </div>
                    <Form layout="vertical" onFinish={onFinish} initialValues={request}>
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
                                    <Option key={category.id} value={category.id}>
                                        {category.categoryName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Tag" name="tagId" rules={[{ required: true, message: "Tag is required" }]}>
                            <Select placeholder="Select a tag">
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
                            <Button htmlType="submit" block className="continue-button">
                                Update Request
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default EditRequestScreen;