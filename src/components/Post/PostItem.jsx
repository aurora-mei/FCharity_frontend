import React, { useState, useEffect } from "react";
import {
    List,
    Avatar,
    Typography,
    Button,
    Space,
    Tag,
    message,
    Dropdown,
    Menu,
    Modal
} from "antd";
import {
    UpOutlined,
    DownOutlined,
    MessageOutlined,
    ShareAltOutlined,
    UserOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { votePostThunk } from "../../redux/post/postSlice";

const { Title, Text } = Typography;

const PostItem = ({ postResponse }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const attachments = postResponse?.attachments || [];
    const attachmentCount = attachments.length;
    const taggables = postResponse?.taggables || [];
    const [thumbnail, setThumbnail] = useState("https://via.placeholder.com/100");

    const [userVote, setUserVote] = useState(postResponse?.post.userVote || 0);
    const [voteCount, setVoteCount] = useState(postResponse?.post.votes || 0);

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isOwner = currentUser?.id === postResponse?.post?.user?.id;

    useEffect(() => {
        if (attachments !== null) {
            const imageAttachment = attachments.find(att => att.match(/\.(jpg|jpeg|png|gif)$/));
            const videoAttachment = attachments.find(att => att.match(/\.(mp4|webm)$/));
            if (imageAttachment) {
                setThumbnail(imageAttachment);
            } else if (videoAttachment) {
                generateVideoThumbnail(videoAttachment);
            }
        }
    }, [attachments]);

    const generateVideoThumbnail = (videoUrl) => {
        const video = document.createElement("video");
        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";

        video.onloadeddata = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 160;
            canvas.height = 90;
            const ctx = canvas.getContext("2d");

            video.currentTime = 2;

            video.onseeked = () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setThumbnail(canvas.toDataURL("image/png"));
            };
        };
    };

    const formatTimeAgo = (createdAt) => {
        const createdDate = new Date(createdAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now - createdDate) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ngày trước`;
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
        
        return createdDate.toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      };

    const handleVote = async (isUpvote) => {
        if (!currentUser?.id) {
            message.error("Vui lòng đăng nhập để thực hiện vote");
            return;
        }

        const currentVote = userVote;
        let newVote;

        if (isUpvote) {
            newVote = currentVote === 1 ? 0 : 1;
        } else {
            newVote = currentVote === -1 ? 0 : -1;
        }

        const voteDelta = newVote - currentVote;
        const updatedVoteCount = voteCount + voteDelta;

        setUserVote(newVote);
        setVoteCount(updatedVoteCount);

        try {
            await dispatch(votePostThunk({
                postId: postResponse.post.id,
                userId: currentUser.id,
                vote: newVote
            })).unwrap();
        } catch (error) {
            setUserVote(currentVote);
            setVoteCount(voteCount);
            message.error("Lỗi khi gửi vote");
        }
    };

    const handleEdit = () => {
        message.info("Edit post: " + postResponse.post.id);
        // Navigate or show modal edit
    };

    const handleDelete = () => {
        Modal.confirm({
            title: "Xác nhận xóa bài viết?",
            content: "Bạn chắc chắn muốn xóa bài viết này?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
                message.success("Đã xóa bài viết " + postResponse.post.id);
                // Call API delete post
            },
        });
    };

    const handleReport = () => {
        message.info("Report post: " + postResponse.post.id);
        // Navigate or open report modal
    };

    const menu = (
        <Menu
            onClick={({ key }) => {
                if (key === "edit") handleEdit();
                if (key === "delete") handleDelete();
                if (key === "report") handleReport();
            }}
        >
            {isOwner && <Menu.Item key="edit">Chỉnh sửa</Menu.Item>}
            {isOwner && <Menu.Item key="delete">Xóa</Menu.Item>}
            <Menu.Item key="report">Báo cáo</Menu.Item>
        </Menu>
    );

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
            <div style={{ position: "relative" }}>
                <Avatar shape="square" size={80} src={thumbnail} icon={<UserOutlined />} />
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

            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <Text strong>{postResponse.post.user.fullName || "Unknown User"}</Text>
                        <Text style={{marginLeft:'15px'}} type="secondary">{formatTimeAgo(postResponse.post.createdAt)}</Text>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {taggables.map((tag) => (
                            <Tag
                                key={tag.id}
                                style={{
                                    backgroundColor: "#1890ff",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    fontWeight: "bold",
                                    borderRadius: "15px",
                                    marginLeft: 4,
                                }}
                            >
                                {tag.tag.tagName}
                            </Tag>
                        ))}
                        <Dropdown overlay={menu} trigger={["click"]}>
                            <span
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "15px",
                                    marginLeft: 8,
                                    userSelect: "none"
                                }}
                            >
                                •••
                            </span>
                        </Dropdown>
                    </div>
                </div>

                <Title level={5} style={{ marginTop: "5px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {postResponse.post.title}
                </Title>

                <Space size={4}>
                    <Button
                        shape="circle"
                        size="small"
                        icon={<UpOutlined style={{
                            fontSize: 14,
                            color: userVote === 1 ? "#ff4500" : "#65676b"
                        }} />}
                        style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVote(true);
                        }}
                    />
                    <Text strong style={{ fontSize: 14 }}>{voteCount}</Text>
                    <Button
                        shape="circle"
                        size="small"
                        icon={<DownOutlined style={{
                            fontSize: 14,
                            color: userVote === -1 ? "#7193ff" : "#65676b"
                        }} />}
                        style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVote(false);
                        }}
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
