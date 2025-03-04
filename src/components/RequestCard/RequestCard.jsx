import React, { useEffect } from "react";
import { Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteRequest } from "../../redux/request/requestSlice";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

const RequestCard = ({ requestData }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(() => {
        console.log('request', requestData);
    })
    const handleDelete = async () => {
        await dispatch(deleteRequest(requestData.request.id)).unwrap();
    };

    return (
        <Card className="request-card">
            {/* {requestData.request.id} */}
            <div className="request-card-header">
                <Title level={4} className="request-card-title">
                    {requestData.request.title}
                </Title>
                <Button type="link" onClick={() => navigate(`/requests/${requestData.request.id}`)}>View Details</Button>
            </div>
            <Text>{requestData.request.content}</Text>
            <div className="request-card-actions">
                <Button type="primary" onClick={() => {
                    console.log('request id', requestData.request.id);
                    navigate(`/requests/edit/${requestData.request.id}`);
                }}>Edit</Button>
                <Button type="danger" onClick={handleDelete}>Delete</Button>
            </div>
        </Card>
    );
};

// RequestCard.propTypes = {
//     request: PropTypes.shape({
//         id: PropTypes.number.isRequired,
//         title: PropTypes.string.isRequired,
//         content: PropTypes.string.isRequired,
//     }).isRequired,
// };

export default RequestCard;