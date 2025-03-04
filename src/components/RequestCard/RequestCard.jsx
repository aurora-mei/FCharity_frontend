import React from "react";
import { Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteRequest } from "../../redux/request/requestSlice";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const RequestCard = ({ request }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
            <Text>{request.content}</Text>
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
    }).isRequired,
};

export default RequestCard;