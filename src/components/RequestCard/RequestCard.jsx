import React, { useEffect, useState } from "react";
import { Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRequest } from "../../redux/request/requestSlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import PropTypes from "prop-types";
import "./RequestCard.pcss";

const { Title, Paragraph } = Typography;

const RequestCard = ({ request }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const tags = useSelector((state) => state.tag.tags);
    const [tagNames, setTagNames] = useState([]);

    useEffect(() => {
        dispatch(fetchTags());
    }, [dispatch]);

    useEffect(() => {
        if (tags.length > 0) {
            const names = request.tagIds.map(tagId => {
                const tag = tags.find(tag => tag.id === tagId);
                return tag ? tag.tagName : tagId;
            });
            setTagNames(names);
        }
    }, [tags, request.tagIds]);

    const handleDelete = async () => {
        await dispatch(deleteRequest(request.id)).unwrap();
    };

    return (
        <Card className="request-card">
            <div className="request-card-header">
                <Title level={4} className="request-card-title">
                    {request.title}
                </Title>
                <Button type="link" onClick={() => navigate(`/requests/${request.id}`)}>View Details</Button>
            </div>
            <Paragraph>{request.content}</Paragraph>
            <Paragraph><strong>Phone:</strong> {request.phone}</Paragraph>
            <Paragraph><strong>Email:</strong> {request.email}</Paragraph>
            <Paragraph><strong>Location:</strong> {request.location}</Paragraph>
            <Paragraph><strong>Category:</strong> {request.categoryId}</Paragraph>
            <Paragraph><strong>Tags:</strong> {tagNames.join(", ")}</Paragraph>
            <div className="request-card-actions">
                <Button type="primary" onClick={() => {
                    console.log('request id', request.id);
                    navigate(`/requests/edit/${request.id}`);
                }}>Edit</Button>
                <Button type="danger" onClick={handleDelete}>Delete</Button>
            </div>
        </Card>
    );
};

RequestCard.propTypes = {
    request: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        phone: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        categoryId: PropTypes.number.isRequired,
        tagIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    }).isRequired,
};

export default RequestCard;