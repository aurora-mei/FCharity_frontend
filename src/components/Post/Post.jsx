import React, { useEffect, useState } from "react";
import { List, Avatar, Typography, Card, Carousel, Input, Button, Tag, Dropdown, Menu } from "antd";
import { LikeOutlined, MessageOutlined, ShareAltOutlined, SendOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Paragraph } = Typography;

const tagStyle = {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #065f46",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "2px 8px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "0.6rem"
};

const Post = ({ currentPost }) => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Dữ liệu nhận được:", currentPost);
    }, [currentPost]);

    if (!currentPost || !currentPost.post) {
        return <Card bordered={false}>Loading...</Card>;
    }

    const { title, createdAt, vote, content } = currentPost.post;
    const { user } = currentPost.post;
    const attachments = currentPost?.attachments || [];
    const initialComments = currentPost?.comments || [];

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

    const tagListData = currentPost?.taggables?.map(taggable => taggable.tag?.tagName) || [];

    // Tách ảnh & video từ attachments
    const imageUrls = attachments.filter(url => url.match(/\.(jpeg|jpg|png|gif)$/i)) || [];
    const videoUrls = attachments.filter(url => url.match(/\.(mp4|webm|ogg)$/i)) || [];

    const carouselSettings = {
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <Card bordered={false} style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}>
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

            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {tagListData.map((tag, index) => (
                    <Tag key={index} style={tagStyle}>#{tag}</Tag>
                ))}
            </div>

            <Paragraph>{content}</Paragraph>

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
                    style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
                />
            </div>

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
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default Post;
