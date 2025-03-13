import React from "react";
import { List, Avatar, Typography } from "antd";
import { useEffect } from "react";
const { Title, Text } = Typography;

const PostItem = ({ postResponse, onClick }) => {
    useEffect(()=>{
           console.log(postResponse);
       })
    return (
        <List.Item onClick={() => onClick(postResponse.post.id)} style={{ cursor: "pointer", padding: "15px", borderBottom: "1px solid #ddd" }}>
            <Avatar shape="square" size={80} src="https://via.placeholder.com/100" />
            <div style={{ flex: 1 }}>
                <Text type="secondary">{postResponse.post.postStatus}</Text>
                <Title level={5} style={{ margin: 0 }}>{postResponse.post.title}</Title>
                <Text type="secondary">{postResponse.post.vote} upvotes</Text>
            </div>
        </List.Item>
    );
};

export default PostItem;
