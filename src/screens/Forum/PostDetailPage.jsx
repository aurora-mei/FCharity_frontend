import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPostsById } from "../../redux/post/postSlice";
import { Layout, Typography, Card, Spin, List, Button, Input, Avatar } from "antd";
import { LikeOutlined, MessageOutlined, ShareAltOutlined } from "@ant-design/icons";
import LeftSidebar from "../../components/Sidebar/LeftSidebar";
import RightSidebar from "../../components/Sidebar/RightSidebar";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const PostDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const currentPost = useSelector((state) => state.post.currentPost);
    const loading = useSelector((state) => state.post.loading);
    const [comment, setComment] = useState("");

    useEffect(() => {
        dispatch(fetchPostsById(id));
    }, [dispatch, id]);

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
            <LeftSidebar />
            <Content style={{ background: "#fff", flex: 1, padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Card style={{ width: "80%" }}>
                    <Text type="secondary">r/{currentPost?.subreddit}</Text>
                    <Title level={2}>{currentPost?.title}</Title>
                    <Avatar
                        shape="square"
                        size={400}
                        src={currentPost?.image}
                        style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }}
                    />
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <Button icon={<LikeOutlined />} type="text">{currentPost?.upvotes}</Button>
                        <Button icon={<MessageOutlined />} type="text">Comments</Button>
                        <Button icon={<ShareAltOutlined />} type="text">Share</Button>
                    </div>
                </Card>

                {/* Comments Section */}
                <div style={{ width: "80%", marginTop: "20px", textAlign: "left" }}>
                    <Title level={4}>Comments</Title>
                    <List
                        dataSource={currentPost?.comments || []}
                        renderItem={(comment) => (
                            <List.Item>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Avatar src={comment.avatar} />
                                    <div style={{ marginLeft: "10px", textAlign: "left" }}>
                                        <Text strong>{comment.user}</Text>
                                        <Text style={{ display: "block" }}>{comment.text}</Text>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />

                    {/* Add a comment */}
                    <TextArea
                        rows={3}
                        placeholder="Write a comment..."
                        style={{ marginTop: "20px" }}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                        type="primary"
                        style={{ marginTop: "10px" }}
                        onClick={() => {
                            alert(`Comment submitted: ${comment}`);
                            setComment(""); // Clear input
                        }}
                        disabled={!comment.trim()}
                    >
                        Submit
                    </Button>
                </div>
            </Content>
            <RightSidebar />
        </Layout>
    );
};

export default PostDetailPage;
