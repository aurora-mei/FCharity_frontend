import React, { useEffect } from "react";
import { List, Avatar, Typography, Tag, Dropdown, Menu } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

const tagStyle = {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #065f46",      // Viền xanh đậm
    backgroundColor: "#d1fae5",         // Nền xanh nhạt
    color: "#065f46",                   // Chữ xanh đậm
    padding: "2px 8px",
    borderRadius: "999px",              // Bo tròn
    fontWeight: 600,
    fontSize: "0.6rem"
};

const PostItem = ({ postResponse }) => {
    const navigate = useNavigate();
    useEffect(() => {
        console.log(postResponse);
    }, [postResponse]);

    const menu = (
        <Menu>
            <Menu.Item key="1">Delete</Menu.Item>
            <Menu.Item key="2">Update</Menu.Item>
            <Menu.Item key="3">Report</Menu.Item>
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
            <div style={{ position: "relative" }}>
                <Avatar 
                    shape="square" 
                    size={80} 
                    src={(postResponse?.attachments?.length > 0) 
                        ? postResponse.attachments[0] 
                        : "https://via.placeholder.com/100"} 
                />
                {postResponse?.attachments?.length > 1 && (
                    <div style={{
                        position: "absolute",
                        bottom: 5,
                        left: 5,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: "12px",
                        padding: "2px 5px",
                        borderRadius: "4px"
                    }}>
                        {postResponse.attachments.length}
                    </div>
                )}
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
                <Text strong>{postResponse.post.user.fullName || "Unknown User"}</Text>
                <Text type="secondary" style={{ marginLeft: 10 }}>
                    {postResponse.post.createdAt 
                        ? dayjs(postResponse.post.createdAt).format("YYYY-MM-DD HH:mm") 
                        : "Unknown Date"}
                </Text>

                <div style={{ marginTop: 5 }}>
                    {postResponse.taggables && postResponse.taggables.length > 0
                        ? postResponse.taggables.map((tag) => (
                            <Tag key={tag.id} style={tagStyle}>#{tag.tag.tagName}</Tag>
                          ))
                        : <Text type="secondary">No tags</Text>}
                </div>

                <Title level={5} style={{ margin: "5px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {postResponse.post.title}
                </Title>

                <Text type="secondary">{postResponse.post.vote} votes</Text>
            </div>
            
            <Dropdown menu={menu} trigger={["click"]}>
                <Text style={{ cursor: "pointer", fontSize: "18px" }}>⋮</Text>
            </Dropdown>
        </List.Item>
    );
};

export default PostItem;