import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequests } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import { List, Typography } from "antd";
import RequestCard from "../../components/RequestCard/RequestCard";

const { Title } = Typography;

const RequestListScreen = () => {
    const dispatch = useDispatch();
    const requests = useSelector((state) => state.request.requests);
    const loading = useSelector((state) => state.request.loading);
    const error = useSelector((state) => state.request.error);

    useEffect(() => {
        dispatch(fetchRequests()).then((res) => {
            console.log("Fetched requests:", res.payload);
        });
    }, [dispatch]);

    if (loading) return <LoadingModal />;
    if (error) return <p style={{ color: 'red' }}>Failed to load requests: {error}</p>;

    return (
        <div className="request-list">
            <Title level={2}>Requests</Title>
            {Array.isArray(requests) && requests.length > 0 ? (
                <List
                    grid={{ gutter: 16, column: 4 }}
                    dataSource={requests}
                    renderItem={(request) => (
                        <List.Item key={request.id}>
                            <RequestCard requestData={request} />
                        </List.Item>
                    )}
                />
            ) : (
                <p>No requests found.</p>
            )}
        </div>
    );
};

export default RequestListScreen;
