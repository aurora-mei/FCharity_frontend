import React, { useEffect } from "react";
import { List, Avatar, Typography } from "antd";
import dayjs from "dayjs"; // Thư viện để format thời gian
import { useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

const PostItem = ({ postResponse }) => {
    const navigate = useNavigate();
    useEffect(() => {
        console.log(postResponse);
    }, [postResponse]);

    return (
        <List.Item
            onClick={()=> navigate(`/posts/${postResponse.post.id}`)}
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
            <Avatar 
    shape="square" 
    size={80} 
    src={(postResponse?.attachments?.length > 0) 
        ? postResponse.attachments[0] 
        : "https://via.placeholder.com/100"} 
/>


            {/* Nội dung bài post */}
            <div style={{ flex: 1, overflow: "hidden" }}>
                {/* Hiển thị người tạo bài post */}
                <Text strong>{postResponse.post.user.fullName || "Unknown User"}</Text>

                <Text type="secondary" style={{ marginLeft: 10 }}>
    {postResponse.post.createdAt 
        ? dayjs(postResponse.post.createdAt).format("YYYY-MM-DD HH:mm") 
        : "Unknown Date"}
</Text>


                {/* Hiển thị tags */}
                <Text type="secondary" style={{ display: "block", marginTop: 5 }}>
                    {postResponse.taggables && postResponse.taggables.length > 0
                        ?  postResponse.taggables.map((tag) => (
                            <span key={tag.id} className="tag">
                              #{tag.tag.tagName} <span> </span>
                            </span>
                          ))
                        : "No tags"}
                </Text>

                {/* Tiêu đề bài post */}
                <Title level={5} style={{ margin: "5px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {postResponse.post.title}
                </Title>

                {/* Số lượng votes */}
                <Text type="secondary">{postResponse.post.vote} votes</Text>
            </div>
        </List.Item>
    );
};

export default PostItem;
