import React, { useState } from "react";
import { Button, Typography, Form, Select, message, Flex, Badge, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteRequest, updateRequest } from "../../redux/request/requestSlice";
import MoreOptions from "../MoreOptions/MoreOptions";
import PropTypes from "prop-types";

import "./RequestCard.pcss"; // Import the CSS file
import UpdateRequestModal from "../UpdateRequestModal/UpdateRequestModal";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const RequestCard = ({ requestData, showActions = true }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRequestData, setCurrentRequestData] = useState(null);
    const [attachments, setAttachments] = useState({ images: [], videos: [] });
    const [form] = Form.useForm();
    const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }
    if (!requestData || !requestData.helpRequest?.id) {
        console.warn("Invalid requestData:", requestData);
        return null;
    }

    // Xử lý xóa
    const handleDelete = async (id) => {
        if (requestData.helpRequest.status !== "pending") {
            message.warning("Only Pending requests can be deleted.");
            return;
        }
        try {
            console.log("Deleting request with ID:", id);
            await dispatch(deleteRequest(id)).unwrap();
            message.success("Request deleted successfully");
            window.location.reload();
        } catch (error) {
            console.error("Error deleting request:", error);
            message.error("Failed to delete request: " + (error.message || "Unknown error"));
        }
    };
    

    // Mở modal Edit
    const handleEdit = (data) => {
        if (data.helpRequest.status !== "pending") {
            message.warning("Only Pending requests can be edited.");
            return;
        }
        setCurrentRequestData(data);
        setIsModalVisible(true);

        // Cập nhật các trường province/district/commune từ API (giả sử API trả về các mã này)
        const initialValues = {
            title: data.helpRequest.title,
            content: data.helpRequest.content,
            phone: data.helpRequest.phone,
            email: data.helpRequest.email,
            location: data.helpRequest.location,
            province: data.helpRequest.provinceCode, // Mã tỉnh
            district: data.helpRequest.districtCode, // Mã quận/huyện
            commune: data.helpRequest.communeCode,   // Mã xã/phường
            categoryId: data.helpRequest.category.id,
            requestTags: data.requestTags?.map((taggable) => taggable.tag.id) || [],
            attachment: data.attachments || [],
        };
        const imageUrls = data.attachments?.filter((url) =>
            url.match(/\.(jpeg|jpg|png|gif)$/i)
        ) || [];
        const videoUrls = data.attachments?.filter((url) =>
            url.match(/\.(mp4|webm|ogg)$/i)
        ) || [];
        setAttachments({
            images: imageUrls,
            videos: videoUrls
        });
        console.log("Initial form values:", initialValues);
        form.setFieldsValue(initialValues);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // Cập nhật request (bao gồm các trường province, district, commune)
    const handleUpdate = async (values) => {
        const updatedRequest = {
            id: currentRequestData.helpRequest.id,
            userId: currentRequestData.helpRequest.userId,
            title: values.title,
            content: values.content,
            phone: values.phone,
            email: values.email,
            location: values.location,
            province: values.province, // Mã tỉnh cập nhật
            district: values.district, // Mã quận/huyện cập nhật
            commune: values.commune,   // Mã xã/phường cập nhật
            imageUrls: attachments.images,
            videoUrls: attachments.videos,
            isEmergency: currentRequestData.helpRequest.isEmergency,
            categoryId: values.categoryId,
            tagIds: values.requestTags,
            status: currentRequestData.helpRequest.status,
        };

        try {
            console.log("Updating request:", updatedRequest);
            await dispatch(updateRequest({ id: currentRequestData.helpRequest.id, requestData: updatedRequest })).unwrap();
            message.success("Request updated successfully");
            setIsModalVisible(false);
            setCurrentRequestData(null);
        } catch (error) {
            console.error("Error updating request:", error);
            message.error("Failed to update request: " + (error.message || "Unknown error"));
        }
    };

    return (
        <div>
            {/* Full Card */}
            <Flex vertical gap={5} style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 8px 0px", borderRadius: "1rem" }}>
                <div style={{ position: "relative" }}>
                    {requestData.attachments && requestData.attachments.length > 0 ? (
                        <img
                            src={requestData.attachments[0]}
                            alt="Request"
                            style={{ height: "11rem", width: "100%", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                        />
                    ) : (
                        <img
                            src="https://via.placeholder.com/50"
                            alt="Placeholder"
                            style={{ height: "11rem", width: "100%", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                        />
                    )}
                    <div className="category-badge">
                        {requestData.helpRequest.category.categoryName}
                    </div>
                    {currentUser.id === requestData.helpRequest.user.id && (
                        <div className="menu-badge">
                            <MoreOptions onEdit={() => handleEdit(requestData)} onDelete={() => handleDelete(requestData.helpRequest.id)} />
                        </div>)}
                </div>
                {/* Nội dung */}
                {/* onClick={() => navigate(`/requests/${requestData.request.id}`)} */}
                <div style={{ padding: "1rem" }} >
                    <a style={{ fontWeight: "bold", color: "black" }} href={`/requests/${requestData.helpRequest.id}`} >{requestData.helpRequest.title}</a>
                    <p style={{ height: "3rem" }}><Paragraph ellipsis={{ tooltip: requestData.helpRequest.content, rows: 2, expandable: false }}>{requestData.helpRequest.content}</Paragraph ></p>
                    <p className="text-gray-600 text-sm">Contact: {requestData.helpRequest.email}</p>

                    <div className="tags">
                        {requestData.requestTags.map((tag) => (
                            <span key={tag.id}>
                                <div className="donation-badge">
                                    {tag.tag.tagName}
                                </div>
                            </span>
                        ))}
                    </div>
                </div>
            </Flex>
            <UpdateRequestModal
                form={form}
                isOpen={isModalVisible}
                attachments={attachments}
                setAttachments={setAttachments}
                handleUpdate={handleUpdate}
                handleCancel={handleCancel}
            />
        </div>
    );
};

RequestCard.propTypes = {
    requestData: PropTypes.shape({
        helpRequest: PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            phone: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            location: PropTypes.string.isRequired,
            provinceCode: PropTypes.string,  // Mã tỉnh (nếu có)
            districtCode: PropTypes.string,  // Mã quận/huyện (nếu có)
            communeCode: PropTypes.string,   // Mã xã/phường (nếu có)
            category: PropTypes.shape({
                id: PropTypes.string.isRequired,
                categoryName: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        requestTags: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                tag: PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    tagName: PropTypes.string.isRequired,
                }).isRequired,
            })
        ),
        attachments: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    showActions: PropTypes.bool,
};

export default RequestCard;
