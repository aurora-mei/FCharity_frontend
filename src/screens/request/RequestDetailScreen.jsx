import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchRequestById } from "../../redux/request/requestSlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import LoadingModal from "../../components/LoadingModal";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const RequestDetailScreen = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const loading = useSelector((state) => state.request.loading);
    const request = useSelector((state) => state.request.currentRequest);
    const tags = useSelector((state) => state.tag.tags);

    useEffect(() => {
        dispatch(fetchRequestById(id));
        dispatch(fetchTags());
    }, [dispatch, id]);

    if (loading) return <LoadingModal />;

    const tagNames = request.tagIds.map((tagId) => {
        const tag = tags.find(tag => tag.id === tagId);
        return tag ? tag.name : tagId;
    });

    return (
        <div className="request-detail">
            <Title level={2}>{request.title}</Title>
            <Paragraph>{request.content}</Paragraph>
            <Paragraph><strong>Phone:</strong> {request.phone}</Paragraph>
            <Paragraph><strong>Email:</strong> {request.email}</Paragraph>
            <Paragraph><strong>Location:</strong> {request.location}</Paragraph>
            <Paragraph><strong>Category:</strong> {request.categoryId}</Paragraph>
            <Paragraph><strong>Tags:</strong> {tagNames.join(", ")}</Paragraph>
            <Paragraph><strong>Status:</strong> {request.status}</Paragraph>
        </div>
    );
};

export default RequestDetailScreen;