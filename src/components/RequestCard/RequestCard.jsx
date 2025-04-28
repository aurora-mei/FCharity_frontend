import React, { useState } from "react";
// Modal, Button, etc., imports remain the same
import {
  Button,
  Typography,
  Form,
  Select,
  message,
  Flex,
  Badge,
  Input,
  Tag,
  Tooltip,
  Modal,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteRequest, updateRequest } from "../../redux/request/requestSlice";
import MoreOptions from "../MoreOptions/MoreOptions";
import PropTypes from "prop-types";

import "./RequestCard.pcss"; // Import the CSS file
import UpdateRequestModal from "../UpdateRequestModal/UpdateRequestModal";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const RequestCard = ({ requestData, showActions = true }) => {
  // State and hooks (remain the same)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [currentRequestData, setCurrentRequestData] = useState(null);
  const [attachments, setAttachments] = useState({ images: [], videos: [] });
  const [form] = Form.useForm();
  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Error parsing currentUser:", error);
    currentUser = {};
  }

  // Destructuring (remains the same)
  const {
    helpRequest,
    requestTags = [],
    attachments: requestAttachments = [],
  } = requestData || {};
  const {
    id,
    title = "No Title",
    content = "No Content",
    phone = "N/A",
    email = "No Email",
    location = "N/A",
    provinceCode = null,
    districtCode = null,
    communeCode = null,
    category = { id: null, categoryName: "N/A" },
    user = { id: null },
    status = "unknown",
    reason = null,
    isEmergency = false,
    userId = null,
  } = helpRequest || {};

  // Essential Data Check (remains the same)
  if (!id) {
    console.warn("Invalid requestData: Missing ID.", requestData);
    return null;
  }

  // Flags (remains the same)
  const isRejected = status?.toLowerCase() === "rejected";
  const isPendingOrApproved =
    status?.toLowerCase() === "pending" || status?.toLowerCase() === "approved";
  const isOwner = currentUser?.id === user?.id;

  // CRUD Handlers (remain the same)
  const handleDelete = async () => {
    if (!isPendingOrApproved) {
      message.warning("Only Pending/Approved requests can be deleted.");
      return;
    }
    try {
      await dispatch(deleteRequest(id)).unwrap();
      message.success("Request deleted");
      window.location.reload();
    } catch (error) {
      console.error("Err delete:", error);
      message.error("Failed to delete: " + (error?.message || "Err"));
    }
  };
  const handleEdit = () => {
    if (!isPendingOrApproved) {
      message.warning("Only Pending/Approved requests can be edited.");
      return;
    }
    setCurrentRequestData(requestData);
    setIsEditModalVisible(true);
    const initialValues = {
      title,
      content,
      phone,
      email,
      location,
      province: provinceCode,
      district: districtCode,
      commune: communeCode,
      categoryId: category?.id,
      requestTags: requestTags?.map((t) => t?.tag?.id).filter(Boolean) || [],
    };
    const imgUrls =
      requestAttachments?.filter(
        (url) => typeof url === "string" && url.match(/\.(jpeg|jpg|png|gif)$/i)
      ) || [];
    const vidUrls =
      requestAttachments?.filter(
        (url) => typeof url === "string" && url.match(/\.(mp4|webm|ogg)$/i)
      ) || [];
    setAttachments({ images: imgUrls, videos: vidUrls });
    form.setFieldsValue(initialValues);
  };
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setCurrentRequestData(null);
    form.resetFields();
    setAttachments({ images: [], videos: [] });
  };
  const handleUpdate = async (values) => {
    if (!currentRequestData?.helpRequest?.id) {
      message.error("Cannot update: Data missing.");
      return;
    }
    const currentId = currentRequestData.helpRequest.id;
    const payload = {
      userId: currentRequestData.helpRequest.userId,
      title: values.title,
      content: values.content,
      phone: values.phone,
      email: values.email,
      location: values.location,
      province: values.province,
      district: values.district,
      commune: values.commune,
      imageUrls: attachments.images,
      videoUrls: attachments.videos,
      isEmergency: currentRequestData.helpRequest.isEmergency,
      categoryId: values.categoryId,
      tagIds: values.requestTags,
      status: currentRequestData.helpRequest.status,
    };
    try {
      await dispatch(
        updateRequest({ id: currentId, requestData: payload })
      ).unwrap();
      message.success("Request updated");
      handleCancelEdit();
      window.location.reload();
    } catch (error) {
      console.error("Err update:", error);
      message.error("Failed to update: " + (error?.message || "Err"));
    }
  };

  // Reason Modal Handlers (remain the same)
  const showReasonModal = (e) => {
    e.stopPropagation(); // Prevent card click event if button is clicked
    setIsReasonModalVisible(true);
  };
  const handleReasonModalClose = () => {
    setIsReasonModalVisible(false);
  };

  return (
    <div>
      {/* Full Card */}
      <Flex vertical gap={5} className="request-card">
        {/* Image and Badges Section */}
        <div style={{ position: "relative" }}>
          {" "}
          {/* Parent MUST have position: relative */}
          {/* Image */}
          {requestAttachments &&
          requestAttachments.length > 0 &&
          typeof requestAttachments[0] === "string" ? (
            <img
              src={requestAttachments[0]}
              alt={title}
              style={{
                height: "11rem",
                width: "100%",
                objectFit: "cover",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
                display: "block",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x176?text=Img+Error";
              }}
            />
          ) : (
            <img
              src="https://via.placeholder.com/300x176?text=No+Image"
              alt="Placeholder"
              style={{
                height: "11rem",
                width: "100%",
                objectFit: "cover",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
                display: "block",
              }}
            />
          )}
          {/* Category Badge */}
          <div className="category-badge">
            {category?.categoryName || "N/A"}
          </div>
          {/* More Options Menu */}
          {isOwner && showActions && (
            <div className="menu-badge">
              <MoreOptions onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          )}
          {/* --- Conditionally add Reason Button CENTERED OVER the image --- */}
          {isRejected && reason && (
            <Button
              className="category-badge" // Add a class for styling if needed
              type="primary" // Make it a solid button
              danger // Make it red
              size="small"
              onClick={showReasonModal} // Open modal on click
              style={{
                position: "absolute", // Position absolutely within the relative parent
                top: "50%", // Move top edge to center
                left: "50%", // Move left edge to center
                transform: "translate(-50%, -50%)", // Shift button back by half its size
                zIndex: 10, // Ensure it's above the image/badges
                // Optional: Add slight transparency if desired
                // opacity: 0.9,
              }}
            >
              View Reject Reason
            </Button>
          )}
          {/* --- End Reason Button --- */}
        </div>

        {/* Content Section */}
        <div style={{ padding: "1rem" }}>
          {/* Title */}
          <Link
            style={{
              fontWeight: "bold",
              color: "black",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: "4px",
            }}
            to={`/requests/${id}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/requests/${id}`);
            }}
            title={title}
          >
            {" "}
            {title}{" "}
          </Link>
          {/* Content */}
          <Paragraph
            style={{ height: "3em", lineHeight: "1.5em", marginBottom: "8px" }}
            ellipsis={{
              tooltip: content || "No content details",
              rows: 2,
              expandable: false,
            }}
          >
            {" "}
            {content || "No content provided."}{" "}
          </Paragraph>
          {/* Contact */}
          <p className="text-gray-600 text-sm" style={{ marginBottom: "8px" }}>
            {" "}
            Contact: {email}{" "}
          </p>
          {/* Tags */}
          <div
            className="tags"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {requestTags.map(
              (taggable) =>
                taggable?.tag?.id && (
                  <Tag key={taggable.tag.id} color="blue">
                    {" "}
                    {taggable.tag.tagName}{" "}
                  </Tag>
                )
            )}
            {/* Button is NO LONGER here */}
          </div>
        </div>
      </Flex>

      {/* Edit Modal (remains the same) */}
      {isOwner && isEditModalVisible && (
        <UpdateRequestModal
          form={form}
          isOpen={isEditModalVisible}
          attachments={attachments}
          setAttachments={setAttachments}
          handleUpdate={handleUpdate}
          handleCancel={handleCancelEdit}
        />
      )}

      {/* Reason Modal (remains the same) */}
      <Modal
        title="Rejection Reason"
        open={isReasonModalVisible}
        onOk={handleReasonModalClose}
        onCancel={handleReasonModalClose}
        footer={[
          <Button key="ok" type="primary" onClick={handleReasonModalClose}>
            {" "}
            OK{" "}
          </Button>,
        ]}
      >
        <Paragraph>{reason}</Paragraph>
      </Modal>
    </div>
  );
};

// --- PropTypes (remain the same) ---
RequestCard.propTypes = {
  /* ... */
};
RequestCard.defaultProps = { showActions: true };

export default RequestCard;
