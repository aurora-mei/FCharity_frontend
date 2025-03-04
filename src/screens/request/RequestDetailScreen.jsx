import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchRequestById } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const RequestDetailScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.request.loading);
    const requestData = useSelector((state) => state.request.currentRequest);

    useEffect(() => {
        dispatch(fetchRequestById(id));
    }, [dispatch, id]);

    if (loading) return <LoadingModal />;

    return (
        <div className="request-detail">
            <Title level={2}>{request.title}</Title>
            <Paragraph>{request.content}</Paragraph>
            <Paragraph><strong>Phone:</strong> {requestData.request.phone}</Paragraph>
            <Paragraph><strong>Email:</strong> {requestData.request.email}</Paragraph>
            <Paragraph><strong>Location:</strong> {requestData.request.location}</Paragraph>
            <Paragraph><strong>Category:</strong> {requestData.request.categoryId}</Paragraph>
            <Paragraph><strong>Tags:</strong> {requestData.requestTags.map((tag) => tag.tagName)}</Paragraph>
            <Paragraph><strong>Status:</strong> {requestData.request.status}</Paragraph>
        </div>
    );
};

export default RequestDetailScreen;