import { useRef, useState } from "react";
import { Card, Typography, Space, Button, Tag, Avatar, Carousel, Modal, Menu, Dropdown, Input, Radio, message } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  UpOutlined, 
  DownOutlined, 
  MessageOutlined, 
  ShareAltOutlined, 
  UserOutlined, 
  LeftOutlined, 
  RightOutlined,
  EllipsisOutlined
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { votePostThunk } from "../../redux/post/postSlice";

const { Title, Text } = Typography;

const PostCard = ({ postResponse }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const carouselRef = useRef(null);
  
  const [userVote, setUserVote] = useState(postResponse?.post.userVote || 0);
  const [voteCount, setVoteCount] = useState(postResponse?.post.votes || 0);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  
  const taggables = postResponse?.taggables || [];

  const formatTimeAgo = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - createdDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} tuần trước`;
    
    return createdDate.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleVote = async (isUpvote, e) => {
    e.stopPropagation();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?.id) {
      message.error("Vui lòng đăng nhập để thực hiện vote");
      return;
    }

    const currentVote = userVote;
    let newVote;

    if (isUpvote) {
      newVote = currentVote === 1 ? 0 : 1;
    } else {
      newVote = currentVote === -1 ? 0 : -1;
    }

    const voteDelta = newVote - currentVote;
    const updatedVoteCount = voteCount + voteDelta;

    setUserVote(newVote);
    setVoteCount(updatedVoteCount);

    try {
      await dispatch(votePostThunk({ 
        postId: postResponse.post.id, 
        userId: currentUser.id, 
        vote: newVote 
      })).unwrap();
    } catch (error) {
      setUserVote(currentVote);
      setVoteCount(voteCount);
      message.error("Lỗi khi gửi vote");
    }
  };

  const handleTitleClick = (e) => {
    e.stopPropagation();
    navigate(`/posts/${postResponse.post.id}`);
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
    navigate(`/posts/${postResponse.post.id}`);
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate(`/posts/${postResponse.post.id}#comment-section`);
  };

  const menu = (
    <Menu>
      <Menu.Item key="delete" onClick={(e) => e.domEvent.stopPropagation()}>
        Delete
      </Menu.Item>
      <Menu.Item key="update" onClick={(e) => e.domEvent.stopPropagation()}>
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
    console.log({
      reason: reportReason,
      details: reportDetails,
      postId: postResponse.post.id
    });
    setReportVisible(false);
  };

  return (
    <Card
      hoverable
      style={{
        width: "100%",
        marginBottom: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        overflow: "hidden",
        padding: "15px",
      }}
    >
      {/* Header with user info and tags */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <Space>
          <Avatar src={postResponse.post.user.avatar} icon={<UserOutlined />} />
          <Text type="secondary">
            {postResponse.post.user.fullName} {formatTimeAgo(postResponse.post.createdAt)}
          </Text>
        </Space>
        
        <Space>
          {taggables.map((tag) => (
            <Tag
              key={tag.id}
              style={{
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                padding: "5px 10px",
                fontWeight: "bold",
                borderRadius: "10px",
              }}
            >
              {tag.tag.tagName}
            </Tag>
          ))}
          
          <Dropdown overlay={menu} trigger={['click']}>
            <span
              onClick={(e) => e.stopPropagation()}
              style={{
                cursor: 'pointer',
                fontSize: '15px',
                padding: '0 8px',
                userSelect: 'none',
              }}
            >
              •••
            </span>
          </Dropdown>
        </Space>
      </div>

      {/* Media content */}
      {postResponse.attachments?.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "10px", position: "relative" }}>
          {postResponse.attachments.length === 1 ? (
            postResponse.attachments[0].includes(".mp4") || postResponse.attachments[0].includes(".webm") ? (
              <video 
                width="100%" 
                controls
                onClick={(e) => e.stopPropagation()}
              >
                <source src={postResponse.attachments[0]} type="video/mp4" />
              </video>
            ) : (
              <img
                alt="post"
                src={postResponse.attachments[0]}
                style={{ width: "100%", maxHeight: "350px", objectFit: "cover", cursor: "pointer" }}
                onClick={handleTitleClick}
              />
            )
          ) : (
            <>
              <Carousel ref={carouselRef} dots={false}>
                {postResponse.attachments.map((attachment, index) => (
                  <div key={index}>
                    {attachment.includes(".mp4") || attachment.includes(".webm") ? (
                      <video width="100%" controls onClick={(e) => e.stopPropagation()}>
                        <source src={attachment} type="video/mp4" />
                      </video>
                    ) : (
                      <img
                        alt="post"
                        src={attachment}
                        style={{ width: "100%", maxHeight: "350px", objectFit: "cover", cursor: "pointer" }}
                        onClick={handleTitleClick}
                      />
                    )}
                  </div>
                ))}
              </Carousel>
              
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

      {/* Post content */}
      <Title 
        level={4} 
        style={{ marginBottom: "5px", cursor: "pointer" }}
        onClick={handleTitleClick}
      >
        {postResponse.post.title}
      </Title>
      
      <div 
        style={{ 
          fontSize: "14px", 
          minHeight: "100px", 
          marginBottom: "5px",
          cursor: "pointer" 
        }}
        onClick={handleContentClick}
      >
        {postResponse.post.content.length > 200 ? 
          `${postResponse.post.content.slice(0, 200)}...` : 
          postResponse.post.content}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
        <Space>
          <Button 
            shape="circle" 
            icon={<UpOutlined style={{ color: userVote === 1 ? "#ff4500" : "#65676b" }} />} 
            onClick={(e) => handleVote(true, e)}
          />
          <Text strong>{voteCount}</Text>
          <Button 
            shape="circle" 
            icon={<DownOutlined style={{ color: userVote === -1 ? "#7193ff" : "#65676b" }} />} 
            onClick={(e) => handleVote(false, e)}
          />
          <Button 
            shape="circle" 
            icon={<MessageOutlined />} 
            onClick={handleCommentClick} 
          />
          <Button shape="circle" icon={<ShareAltOutlined />} />
        </Space>
      </div>

      {/* Report modal */}
      <Modal
        title="Report Post"
        visible={reportVisible}
        onOk={handleReportSubmit}
        onCancel={() => setReportVisible(false)}
      >
        <Radio.Group onChange={(e) => setReportReason(e.target.value)} value={reportReason}>
          <Space direction="vertical">
            <Radio value="spam">Spam</Radio>
            <Radio value="inappropriate">Inappropriate Content</Radio>
            <Radio value="harassment">Harassment</Radio>
            <Radio value="other">Other</Radio>
          </Space>
        </Radio.Group>
        
        {reportReason === "other" && (
          <Input.TextArea
            placeholder="Please provide details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            style={{ marginTop: 16 }}
          />
        )}
      </Modal>
    </Card>
  );
};

export default PostCard;