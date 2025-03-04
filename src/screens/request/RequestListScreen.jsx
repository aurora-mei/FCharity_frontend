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

    useEffect(() => {
        dispatch(fetchRequests());
    }, [dispatch]);

    if (loading) return <LoadingModal />;

    return (
        <div className="request-list">
            <Title level={2}>Requests</Title>
            <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={requests}
                renderItem={(request) => {
                    // console.log("Request:", request);
                    return (
                        <List.Item key={request.request.id}>
                            <RequestCard requestData={request} />
                        </List.Item>
                    )
                }}
            />
        </div>
    );
};

export default RequestListScreen;