import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchRequestById } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import { Card, Descriptions, Typography, Alert } from "antd";

const { Title } = Typography;

const RequestDetailScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.request.loading);
    const requestData = useSelector((state) => state.request.currentRequest);
    const error = useSelector((state) => state.request.error);

    useEffect(() => {
        console.log("id", id);
        dispatch(fetchRequestById(id));
    }, [dispatch, id]);

    if (loading) return <LoadingModal />;

    if (error) {
        return (
            <div className="request-detail">
                <Alert message="Error" description={error.message} type="error" showIcon />
            </div>
        );
    }

    if (!requestData || !requestData.request) {
        return (
            <div className="request-detail">
                <Alert message="Error" description="Request not found" type="error" showIcon />
            </div>
        );
    }

    return (
        <div className="request-detail">
            <Card>
                <Title level={2} className="request-title">{requestData.request.title}</Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Content" labelStyle={{ fontWeight: 'bold' }}>{requestData.request.content}</Descriptions.Item>
                    <Descriptions.Item label="Phone" labelStyle={{ fontWeight: 'bold' }}>{requestData.request.phone}</Descriptions.Item>
                    <Descriptions.Item label="Email" labelStyle={{ fontWeight: 'bold' }}>{requestData.request.email}</Descriptions.Item>
                    <Descriptions.Item label="Location" labelStyle={{ fontWeight: 'bold' }}>{requestData.request.location}</Descriptions.Item>
                    <Descriptions.Item label="Category" labelStyle={{ fontWeight: 'bold' }}>{requestData.request.category.categoryName}</Descriptions.Item>
                    <Descriptions.Item label="Tags" labelStyle={{ fontWeight: 'bold' }}>{requestData.requestTags.map((taggable) => taggable.tag.tagName).join(", ")}</Descriptions.Item>
                    <Descriptions.Item label="Status" labelStyle={{ fontWeight: 'bold' }}>{requestData.request.status}</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default RequestDetailScreen;