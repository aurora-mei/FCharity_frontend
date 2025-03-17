import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Card, Carousel, Input, Button, Tag, Dropdown, Menu } from "antd";
import { LikeOutlined, MessageOutlined, ShareAltOutlined, SendOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Paragraph } = Typography;

// Danh sách màu tag bạn cung cấp
const tagColors = {
    "Homeless Support": { color: "#0079d3", background: "#e6f4ff", border: "#91caff" },
    "Community Crisis": { color: "#237804", background: "#f6ffed", border: "#b7eb8f" },
    "Refugee Crisis": { color: "#ad6800", background: "#fffbe6", border: "#ffe58f" },
    "Water Crisis": { color: "#a8071a", background: "#fff1f0", border: "#ffa39e" },
    "Drought": { color: "#595959", background: "#f5f5f5", border: "#d9d9d9" },
    "Food Shortage": { color: "#fa541c", background: "#fff2e8", border: "#ffbb96" },
    "Medical Emergency": { color: "#13c2c2", background: "#e6fffb", border: "#87e8de" },
    "Accident Relief": { color: "#eb2f96", background: "#fff0f6", border: "#ffadd2" },
    "Wildfire": { color: "#fa8c16", background: "#fff7e6", border: "#ffd591" },
    "Infrastructure Damage": { color: "#722ed1", background: "#f9f0ff", border: "#d3adf7" },
    "Education Support": { color: "#1890ff", background: "#e6f7ff", border: "#91d5ff" },
    "Earthquake": { color: "#cf1322", background: "#fff1f0", border: "#ffa39e" },
    "Pandemic": { color: "#52c41a", background: "#f6ffed", border: "#b7eb8f" },
    "Animal Rescue": { color: "#ff4d4f", background: "#fff1f0", border: "#ffa39e" },
    "Hurricane": { color: "#722ed1", background: "#f9f0ff", border: "#d3adf7" },
    "Environmental Disaster": { color: "#13c2c2", background: "#e6fffb", border: "#87e8de" },
    "Tornado": { color: "#eb2f96", background: "#fff0f6", border: "#ffadd2" },
    "Flood": { color: "#1890ff", background: "#e6f7ff", border: "#91d5ff" },
    default: { color: "#595959", background: "#f5f5f5", border: "#d9d9d9" },
};

const Post = ({ currentPost }) => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Dữ liệu nhận được:", currentPost);
    }, [currentPost]);

    if (!currentPost || !currentPost.post) {
        return <Card bordered={false}>Loading...</Card>;
    }

    // Lấy dữ liệu bài post
    const { title, createdAt, vote, content, tags } = currentPost.post;
    // Giả sử thông tin người đăng nằm trong currentPost.post.user
    const { user } = currentPost.post;
    const attachments = currentPost?.attachments || [];
    const initialComments = currentPost?.comments || [];

    // State quản lý comment
    const [newComment, setNewComment] = useState("");
    const [commentList, setCommentList] = useState(initialComments);

    const handleCommentSubmit = () => {
        if (newComment.trim() === "") return;
        const newCommentData = {
            id: Date.now(),
            author: "Current User",
            avatar: "https://via.placeholder.com/40",
            content: newComment.trim(),
            likes: 0,
            createdAt: new Date().toISOString(),
        };
        setCommentList([newCommentData, ...commentList]);
        setNewComment("");
    };

    // Xử lý like cho bình luận
    const handleLike = (id) => {
        setCommentList(
            commentList.map((comment) =>
                comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
            )
        );
    };

    // Xử lý reply cho bình luận (demo: console log)
    const handleReply = (id) => {
        console.log("Reply to comment id:", id);
    };

    // Xử lý xóa bình luận
    const handleDelete = (id) => {
        setCommentList(commentList.filter((comment) => comment.id !== id));
    };

    // Menu dropdown cho các hành động: Delete, Update, Report
    const menu = (comment) => (
        <Menu>
            <Menu.Item onClick={() => handleDelete(comment.id)}>Delete</Menu.Item>
            <Menu.Item onClick={() => console.log("Update comment id:", comment.id)}>
                Update
            </Menu.Item>
            <Menu.Item onClick={() => console.log("Report comment id:", comment.id)}>
                Report
            </Menu.Item>
        </Menu>
    );

    // Tách ảnh & video từ attachments
    const imageUrls =
        attachments.filter((url) => url.match(/\.(jpeg|jpg|png|gif)$/i)) || [];
    const videoUrls =
        attachments.filter((url) => url.match(/\.(mp4|webm|ogg)$/i)) || [];

    // Cài đặt Carousel
    const carouselSettings = {
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    // Xử lý kiểu dữ liệu của tags: nếu là chuỗi, chuyển thành mảng; nếu là mảng, dùng luôn
    let tagList = [];
    if (typeof tags === "string") {
        tagList = tags.split(",").map((tag) => tag.trim());
    } else if (Array.isArray(tags)) {
        tagList = tags;
    }
    console.log("Tags sau khi xử lý:", tagList);

    return (
        <Card bordered={false} style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}>
            {/* Header: Avatar, tên người đăng và ngày giờ */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <Avatar
                    src={user && user.avatar ? user.avatar : "https://via.placeholder.com/40"}
                    size={40}
                />
                <div style={{ marginLeft: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {user && user.fullName ? user.fullName : "Unknown User"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {moment(createdAt).format("DD/MM/YYYY HH:mm")}
                    </div>
                </div>
            </div>

            {/* Tiêu đề bài post */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h2>

            {/* Hiển thị Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {tagList.map((tag, index) => {
                    const styleTag = tagColors[tag] || tagColors.default;
                    return (
                        <Tag
                            key={index}
                            style={{
                                color: styleTag.color,
                                backgroundColor: styleTag.background,
                                border: `1px solid ${styleTag.border}`,
                                fontWeight: "bold",
                            }}
                        >
                            {tag}
                        </Tag>
                    );
                })}
            </div>

            {/* Nội dung bài post */}
            <Paragraph>{content}</Paragraph>

            {/* Ảnh / Video nếu có */}
            {attachments.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <Carousel {...carouselSettings}>
                        {imageUrls.map((url, index) => (
                            <div key={`img-${index}`} style={{ padding: "0 10px" }}>
                                <img src={url} alt={`img-${index}`} style={{ width: "100%", borderRadius: 8 }} />
                            </div>
                        ))}
                        {videoUrls.map((url, index) => (
                            <div key={`vid-${index}`} style={{ padding: "0 10px" }}>
                                <video src={url} controls style={{ width: "100%", borderRadius: 8 }} />
                            </div>
                        ))}
                    </Carousel>
                </div>
            )}

            {/* Like - Comment - Share */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    color: "#6b7280",
                    fontSize: 14,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <LikeOutlined style={{ cursor: "pointer" }} />
                    <span>{vote}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MessageOutlined style={{ cursor: "pointer" }} />
                    <span>{commentList.length}</span>
                    <ShareAltOutlined style={{ cursor: "pointer" }} />
                    <span>Share</span>
                </div>
            </div>

            {/* Form nhập comment */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <Avatar src="https://via.placeholder.com/40" />
                <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleCommentSubmit}
                    style={{
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                    }}
                />
            </div>

            {/* Danh sách bình luận */}
            <List
                itemLayout="vertical"
                dataSource={commentList}
                locale={{ emptyText: "No comments yet" }}
                renderItem={(comment) => (
                    <List.Item style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <List.Item.Meta
                            avatar={<Avatar src={comment.avatar} />}
                            title={
                                <div>
                                    <span style={{ fontWeight: "bold" }}>{comment.author}</span>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                                        {moment(comment.createdAt).format("DD/MM/YYYY HH:mm")}
                                    </div>
                                </div>
                            }
                            description={<Paragraph style={{ marginBottom: 8 }}>{comment.content}</Paragraph>}
                        />
                        {/* Các hành động Like, Reply, More */}
                        <div style={{ display: "flex", gap: 12, fontSize: 14, color: "#6b7280" }}>
              <span onClick={() => handleLike(comment.id)} style={{ cursor: "pointer" }}>
                <LikeOutlined /> {comment.likes}
              </span>
                            <span onClick={() => handleReply(comment.id)} style={{ cursor: "pointer" }}>
                Reply
              </span>
                            <Dropdown overlay={menu(comment)} trigger={["click"]}>
                                <MoreOutlined style={{ cursor: "pointer" }} />
                            </Dropdown>
                        </div>
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default Post;
