import React from "react";
import { List, Avatar, Typography } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Post = ({ id, image, title, subreddit, upvotes, comments, viewMode }) => {
    const navigate = useNavigate();
    
    return (
        <List.Item
            style={{ display: "flex", flexDirection: viewMode === "card" ? "column" : "row", alignItems: "center", padding: "15px", borderBottom: "1px solid #ddd", gap: "15px", cursor: "pointer" }}
            onClick={() => navigate(`/post/${id}`)}
        >
            <Avatar shape="square" size={80} src={image} />
            <div style={{ flex: 1 }}>
                <Text type="secondary">r/{subreddit}</Text>
                <Title level={5} style={{ margin: 0 }}>{title}</Title>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                    <div style={{ display: "flex", alignItems: "center", background: "#f0f2f5", padding: "5px 10px", borderRadius: "20px", gap: "5px" }}>
                        <UpOutlined style={{ fontSize: "16px" }} />
                        <Text>{upvotes}</Text>
                        <DownOutlined style={{ fontSize: "16px" }} />
                    </div>
                    <Text type="secondary">{comments} comments</Text>
                </div>
            </div>
        </List.Item>
    );
};

export default Post;
