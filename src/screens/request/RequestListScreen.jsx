import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequests } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import { List, Typography } from "antd";

const { Title } = Typography;

const RequestListScreen = () => {
    const dispatch = useDispatch();
    const requests = useSelector((state) => state.request.requests);
    const loading = useSelector((state) => state.request.loading);

    useEffect(() => {
        dispatch(fetchRequests());
        console.log("RequestListScreen: ", requests);
    }, [dispatch]);
    if (loading) return <LoadingModal />;
    return (
        <div className="request-list">
            <Title level={2}>Requests</Title>
            <List
                itemLayout="horizontal"
                dataSource={requests}
                renderItem={(request) => (
                    <List.Item>
                        <List.Item.Meta
                            title={request.title}
                            description={request.content}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default RequestListScreen;