import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Card, Carousel, Input, Button, Tag, Dropdown, Menu } from "antd";
import { LikeOutlined, MessageOutlined, ShareAltOutlined, SendOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Paragraph } = Typography;


const Post = ({ currentPost }) => {
    const navigate = useNavigate();

    // State cho việc chỉnh sửa comment
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

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

    // Bắt đầu chỉnh sửa bình luận
    const handleEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    // Lưu nội dung chỉnh sửa
    const handleSaveEdit = (id) => {
        setCommentList(
            commentList.map((comment) =>
                comment.id === id ? { ...comment, content: editingContent } : comment
            )
        );
        setEditingCommentId(null);
        setEditingContent("");
    };

    // Menu dropdown cho các hành động: Delete, Update, Report
    const menu = (comment) => (
        <Menu>
            <Menu.Item onClick={() => handleDelete(comment.id)}>Delete</Menu.Item>
            <Menu.Item onClick={() => handleEdit(comment)}>Update</Menu.Item>
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
                {tagList.map((tag, index) => (
                            <span key={tag.id}>
                                <div className="donation-badge">
                                    {tag.tag.tagName}
                                </div>
                            </span>
                ))}
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
                            description={
                                editingCommentId === comment.id ? (
                                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                        <Input
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => handleSaveEdit(comment.id)}
                                            style={{
                                                backgroundColor: "#1890ff", // Màu nền xanh giống nút Send
                                                borderColor: "#1890ff",
                                            }}
                                        >
                                            Save
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditingContent("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Paragraph style={{ marginBottom: 8 }}>{comment.content}</Paragraph>
                                )
                            }
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
