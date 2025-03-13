import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List, Typography } from "antd";
import LoadingModal from "../../components/LoadingModal";
import RequestCard from "../../components/RequestCard/RequestCard";
import { fetchRequestsByUserIdThunk } from "../../redux/request/requestSlice";

const { Title } = Typography;

const MyRequestScreen = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.request.loading);
  const requestsByUserId = useSelector((state) => state.request.requestsByUserId) || [];
  const error = useSelector((state) => state.request.error);

  // Lấy user từ localStorage
  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};
  
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Error parsing currentUser from localStorage:", error);
  }

  useEffect(() => {
    if (currentUser?.id) {
      console.log("Fetching requests for user ID:", currentUser.id);
      if (Array.isArray(requestsByUserId) && requestsByUserId.length === 0) {
        dispatch(fetchRequestsByUserIdThunk(currentUser.id));
      }
    } else {
      console.error("User ID is undefined:", currentUser);
    }
  }, [dispatch, currentUser, requestsByUserId]);

  if (loading) return <LoadingModal />;
  if (error) return <p style={{ color: "red" }}>Failed to load your requests: {error.message || error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={2}>My Requests</Title>
      {requestsByUserId.length > 0 ? (
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
