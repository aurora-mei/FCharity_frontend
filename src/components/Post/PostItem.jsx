import React from "react";
import { List, Avatar, Typography } from "antd";

const { Title, Text } = Typography;

const PostItem = ({ post, onClick }) => {
    return (
        <List.Item onClick={() => onClick(post.id)} style={{ cursor: "pointer", padding: "15px", borderBottom: "1px solid #ddd" }}>
            <Avatar shape="square" size={80} src="https://via.placeholder.com/100" />
            <div style={{ flex: 1 }}>
                <Text type="secondary">{post.postStatus}</Text>
                <Title level={5} style={{ margin: 0 }}>{post.post.title}</Title>
                <Text type="secondary">{post.post.vote} upvotes</Text>
            </div>
        </List.Item>
    );
};

export default PostItem;
