import React, { useState, useEffect, useRef } from "react";
import { List, Avatar, Typography, Button, Space,Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { UpOutlined, DownOutlined, MessageOutlined, ShareAltOutlined, UserOutlined, PictureOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PostItem = ({ postResponse }) => {
    const navigate = useNavigate();
    const attachments = postResponse?.attachments || [];
    const attachmentCount = attachments.length;
    const taggables = postResponse?.taggables || [];
    // State để lưu thumbnail
    const [thumbnail, setThumbnail] = useState("https://via.placeholder.com/100");
    const videoRef = useRef(null);
    
    useEffect(() => {
        console.log(postResponse?.taggables);
        if (attachments !==null) {
            console.log("att",attachments)
            const imageAttachment = attachments.find(att => att.match(/\.(jpg|jpeg|png|gif)$/));
            const videoAttachment = attachments.find(att => att.match(/\.(mp4|webm)$/));

            if (imageAttachment) {
                setThumbnail(imageAttachment); // Ưu tiên ảnh
            } else if (videoAttachment) {
                generateVideoThumbnail(videoAttachment);
            }
        }
    }, [attachments]);
    const formatTime = (createdAt) => {
        const now = new Date();
        const createdTime = new Date(createdAt);
        const diffInSeconds = Math.floor((now - createdTime) / 1000);
    
        if (diffInSeconds < 60) {
            return `${diffInSeconds} giây trước`;
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        }
    
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        }
    
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} ngày trước`;
        }
    
        return createdTime.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
    };
    
    // Tạo thumbnail từ video
    const generateVideoThumbnail = (videoUrl) => {
        const video = document.createElement("video");
        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";

        video.onloadeddata = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 160;  // Kích thước nhỏ để load nhanh
            canvas.height = 90;
            const ctx = canvas.getContext("2d");

            video.currentTime = 2; // Lấy frame tại giây thứ 2

            video.onseeked = () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setThumbnail(canvas.toDataURL("image/png")); // Chuyển frame thành URL ảnh
            };
        };
    };

    return (
        <List.Item
            onClick={() => navigate(`/posts/${postResponse.post.id}`)}
            style={{
                cursor: "pointer",
                padding: "15px",
                borderBottom: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                transition: "background 0.2s",
                position: "relative"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
            {/* **Thumbnail với số lượng attachment** */}
            <div style={{ position: "relative" }}>
                <Avatar
                    shape="square"
                    size={80}
                    src={thumbnail}
                    icon={<UserOutlined />}
                />
                
                {attachmentCount > 1 && (
                    <div style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "2px 6px",
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <PictureOutlined />
                        {attachmentCount}
                    </div>
                )}
            </div>

            {/* **Thông tin Post** */}
            <div style={{ flex: 1 }}>
                <Text strong>{postResponse.post.user.fullName || "Unknown User"}</Text>
                <Text type="secondary" style={{ marginLeft: 10 }}>
    {formatTime(postResponse.post.createdAt)}
</Text>

                {taggables.map((tag) => (
                    <Tag key={tag.id} style={{ marginRight: 10 }}>{tag.tag.tagName}</Tag>
                ))}

                <Title level={5} style={{ marginTop: "5px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {postResponse.post.title}
                </Title>

                {/* **Các nút tương tác** */}
                <Space size={4}>
    <Button 
        shape="circle" 
        size="small" 
        icon={<UpOutlined style={{ fontSize: 14 }} />} 
        style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
    />
    <Text strong style={{ fontSize: 14 }}>{postResponse.post.votes || 0}</Text>
    <Button 
        shape="circle" 
        size="small" 
        icon={<DownOutlined style={{ fontSize: 14 }} />} 
        style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
    />
    <Button 
        shape="circle" 
        size="small" 
        icon={<MessageOutlined style={{ fontSize: 14 }} />} 
        style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
    />
    <Button 
        shape="circle" 
        size="small" 
        icon={<ShareAltOutlined style={{ fontSize: 14 }} />} 
        style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
    />
</Space>



            </div>
        </List.Item>
    );
};

export default PostItem;