import React, { useRef } from "react";
import { Card, Typography, Space, Button, Tag, Avatar, Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import { UpOutlined, DownOutlined, MessageOutlined, ShareAltOutlined, UserOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Radio, Input, Modal } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;

const PostCard = ({ postResponse }) => {
    const navigate = useNavigate();
    const carouselRef = useRef(null); // Dùng ref để điều khiển Carousel
    const taggables = postResponse?.taggables || [];
    const [reportVisible, setReportVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');  
    // Menu dropdown
    const menu = (
        <Menu>
            <Menu.Item 
                key="delete" 
                onClick={(e) => e.domEvent.stopPropagation()}
            >
                Delete
            </Menu.Item>
            <Menu.Item 
                key="update" 
                onClick={(e) => e.domEvent.stopPropagation()}
            >
                Update
            </Menu.Item>
            <Menu.Item 
                key="report"
                onClick={(e) => {
                    e.domEvent.stopPropagation();
                    setReportVisible(true);
                }}
            >
                Report
            </Menu.Item>
        </Menu>
    );

    const handleReportSubmit = () => {
        // Xử lý report ở đây
        console.log({
            reason: reportReason,
            details: reportDetails,
            postId: postResponse.post.id
        });
        setReportVisible(false);
    };
    const handleCommentClick = (e) => {
        e.stopPropagation();
        navigate(`/posts/${postResponse.post.id}#comment-section`);
    };

    return (
        <Card
            hoverable
            onClick={() => navigate(`/posts/${postResponse.post.id}`)}
            style={{
                width: "100%",
                marginBottom: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                overflow: "hidden",
                padding: "15px",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}></div>
            {/* Thông tin người đăng và tag */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <Space>
                    <Avatar src={postResponse.post.user.avatar} icon={<UserOutlined />} />
                    <Text type="secondary">
                        {postResponse.post.user.fullName} • {new Date(postResponse.post.createdAt).toLocaleString("vi-VN")}
                    </Text>
                </Space>
                <Space>
    {taggables.map((tag) => (
        <Tag
            key={tag.id}
            style={{
                backgroundColor: "#1890ff", // Màu xanh của Ant Design
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontWeight: "bold",
                borderRadius: "5px",
            }}
        >
            {tag.tag.tagName}
        </Tag>
    ))}
</Space>
<Space>
        {taggables.map(/* ... */)}
        <Dropdown overlay={menu} trigger={['click']}>
            <Button 
                shape="circle" 
                icon={<EllipsisOutlined />} 
                onClick={(e) => e.stopPropagation()}
            />
        </Dropdown>
    </Space>
</div>

            {/* Nếu có ảnh/video */}
            {postResponse.attachments?.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: "10px", position: "relative" }}>
                    {postResponse.attachments.length === 1 ? (
                        postResponse.attachments[0].includes(".mp4") || postResponse.attachments[0].includes(".webm") ? (
                            <video width="100%" controls>
                                <source src={postResponse.attachments[0]} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                alt="post"
                                src={postResponse.attachments[0]}
                                style={{ width: "100%", maxHeight: "350px", objectFit: "cover" }}
                            />
                        )
                    ) : (
                        <>
                            <Carousel ref={carouselRef} dots={false}>
                                {postResponse.attachments.map((attachment, index) => (
                                    <div key={index}>
                                        {attachment.includes(".mp4") || attachment.includes(".webm") ? (
                                            <video width="100%" controls>
                                                <source src={attachment} type="video/mp4" />
                                            </video>
                                        ) : (
                                            <img
                                                alt="post"
                                                src={attachment}
                                                style={{ width: "100%", maxHeight: "350px", objectFit: "cover" }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </Carousel>
                            {/* Nút điều hướng */}
                            <Button
                                shape="circle"
                                icon={<LeftOutlined />}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: 10,
                                    transform: "translateY(-50%)",
                                    background: "rgba(0, 0, 0, 0.5)",
                                    color: "#fff",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    carouselRef.current.prev();
                                }}
                            />
                            <Button
                                shape="circle"
                                icon={<RightOutlined />}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: 10,
                                    transform: "translateY(-50%)",
                                    background: "rgba(0, 0, 0, 0.5)",
                                    color: "#fff",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    carouselRef.current.next();
                                }}
                            />
                        </>
                    )}
                </div>
            )}

            {/* Nội dung bài viết */}
            <Title level={4} style={{ marginBottom: "5px" }}>{postResponse.post.title}</Title>
            <div style={{ fontSize: "14px", minHeight: "100px", marginBottom: "5px" }}>
                {postResponse.post.content.length > 200 ? `${postResponse.post.content.slice(0, 200)}...` : postResponse.post.content}
            </div>

            {/* Nút chức năng */}
            <div style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
                <Space>
                    <Button shape="circle" icon={<UpOutlined />} />
                    <Text strong>{postResponse.post.votes || 0}</Text>
                    <Button shape="circle" icon={<DownOutlined />} />
                    <Button shape="circle" icon={<MessageOutlined />} onClick={handleCommentClick} />
                    <Button shape="circle" icon={<ShareAltOutlined />} />
                </Space>
            </div>
        </Card>
    );
};

export default PostCard;