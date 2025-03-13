import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List, Typography } from "antd";
import LoadingModal from "../../components/LoadingModal";
import RequestCard from "../../components/RequestCard/RequestCard";
import { fetchRequestsByUserIdThunk } from "../../redux/request/requestSlice";

const { Title } = Typography;

const MyRequestScreen = () => {
  const dispatch = useDispatch();

  // Lấy thông tin user từ state auth (giả sử có trường user)
  const user = useSelector((state) => state.auth.user);
  
  // Lấy danh sách request theo userId từ state request (đã được cập nhật qua fetchRequestsByUserIdThunk)
  const requestsByUserId = useSelector((state) => state.request.requestsByUserId);
  const loading = useSelector((state) => state.request.loading);
  const error = useSelector((state) => state.request.error);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchRequestsByUserIdThunk(user.id));
    }
  }, [dispatch, user]);

  if (loading) return <LoadingModal />;
  if (error) return <p style={{ color: "red" }}>Failed to load your requests: {error.message || error}</p>;

  return (
    <div className="my-request-screen">
      <Title level={2}>My Requests</Title>
      {Array.isArray(requestsByUserId) && requestsByUserId.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={requestsByUserId}
          renderItem={(request) => (
            <List.Item key={request.request.id}>
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

export default MyRequestScreen;
