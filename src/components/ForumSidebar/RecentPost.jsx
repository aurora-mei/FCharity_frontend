import React from "react";
import { List, Avatar, Typography } from "antd";

const { Title, Text } = Typography;

const RecentPost = ({ image, title, upvotes}) => (
    <List.Item style={{ display: "flex", alignItems: "center", padding: "10px", borderBottom: "1px solid #ddd", gap: "10px" }}>
        <Avatar shape="square" size={50} src={image} />
        <div style={{ flex: 1 }}>
            <Text type="secondary">r/{subreddit}</Text>
            <Title level={5} style={{ margin: 0, fontSize: "14px" }}>{title}</Title>
            <Text type="secondary" style={{ fontSize: "12px" }}>{upvotes} upvotes · {comments} comments</Text>
        </div>
    </List.Item>
);

export default RecentPost;
