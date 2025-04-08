import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  List, 
  Avatar, 
  Typography, 
  Space, 
  Card, 
  Input, 
  Button, 
  Carousel, 
  Tag,
  message,
  Popover
} from "antd";
import { 
  MessageOutlined, 
  UpOutlined, 
  DownOutlined, 
  ShareAltOutlined, 
  UserOutlined, 
  SendOutlined, 
  LeftOutlined, 
  RightOutlined,
  SmileOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  createComment, 
  fetchCommentsByPost, 
  voteComment, 
  createReply 
} from "../../redux/post/commentSlice";
import Picker from '@emoji-mart/react';

const { Paragraph, Text } = Typography;

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

  return createdDate.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Post = ({ currentPost }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentVotes, setCurrentVotes] = useState({});
  const comments = useSelector((state) => state.comment.comments) || [];
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const carouselRef = useRef(null);
  const commentEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCommentsByPost({ postId: currentPost?.post?.id }));
  }, [currentPost?.post?.id, dispatch]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      message.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      const commentData = {
        postId: currentPost.post.id,
        userId: currentUser.id,
        content: newComment.trim(),
      };
      
      await dispatch(createComment(commentData));
      await dispatch(fetchCommentsByPost({ postId: currentPost.post.id }));
      setNewComment("");
      message.success("Bình luận thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      message.error("Gửi bình luận thất bại!");
    }
  };

  const handleVote = async (commentId, voteValue) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      await dispatch(voteComment({ 
        commentId,
        userId: currentUser.id,
        vote: voteValue 
      }));
      
      setCurrentVotes(prev => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + voteValue
      }));
    } catch (error) {
      message.error("Vote thất bại");
    }
  };

  const handleCreateReply = async (parentCommentId) => {
    if (!replyContent.trim()) {
      message.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      await dispatch(createReply({
        commentId: parentCommentId,
        replyData: {
            postId: currentPost?.post?.id ,
            userId: currentUser.id,
            content: replyContent
        }
    }));
      setReplyContent("");
      setReplyingTo(null);
      message.success("Phản hồi thành công!");
    } catch (error) {
      message.error("Gửi phản hồi thất bại!");
    }
  };

  const renderComment = (comment, level = 0) => (
    <List.Item
      key={comment.commentId}
      style={{ 
        padding: "12px 0",
        marginLeft: `${level * 32}px`,
        borderLeft: level > 0 ? "2px solid #f0f0f0" : "none",
        transition: "all 0.3s"
      }}
    >
      <List.Item.Meta
        avatar={<Avatar src={comment.user?.avatar} />}
        title={
          <Space>
            <Text strong>{comment.user?.fullName || "Ẩn danh"}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTimeAgo(comment.createdAt)}
            </Text>
          </Space>
        }
        description={
          <>
            <Paragraph style={{ margin: 0 }}>{comment.content}</Paragraph>
            
            <Space style={{ marginTop: 8 }}>
              <Button 
                size="small"
                onClick={() => handleVote(comment.commentId, 1)}
                type={currentVotes[comment.commentId] > 0 ? "primary" : "text"}
              >
                ▲ {comment.vote + (currentVotes[comment.commentId] || 0)}
              </Button>
              
              <Button 
                size="small"
                onClick={() => handleVote(comment.commentId, -1)}
                type={currentVotes[comment.commentId] < 0 ? "danger" : "text"}
              >
                ▼
              </Button>
              
              <Button 
                size="small" 
                onClick={() => setReplyingTo(comment.commentId)}
              >
                Phản hồi
              </Button>
            </Space>

            {replyingTo === comment.commentId && (
              <div style={{ marginTop: 12 }}>
                <Space>
                  <Popover
                    content={
                      <Picker
                        onEmojiSelect={(e) => setReplyContent(prev => prev + e.native)}
                        theme="light"
                      />
                    }
                  >
                  </Popover>
                  
                  <Input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Viết phản hồi..."
                    style={{ width: 300 }}
                    onPressEnter={() => handleCreateReply(comment.commentId)}
                  />
                  
                  <Button 
                    type="primary"
                    onClick={() => handleCreateReply(comment.commentId)}
                  >
                    Gửi
                  </Button>
                </Space>
              </div>
            )}
          </>
        }
      />
      
      {comment.replies?.map(reply => renderComment(reply, level + 1))}
    </List.Item>
  );

  if (!currentPost || !currentPost.post) {
    return <Card bordered={false}>Đang tải bài viết...</Card>;
  }

  const { title, createdAt, vote, content, user = {} } = currentPost.post;
  const { attachments = [], taggables = [] } = currentPost;

  return (
    <Card bordered={false} style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <Avatar 
          src={user?.avatar} 
          size={40} 
          icon={!user?.avatar && <UserOutlined />}
        />
        <div style={{ marginLeft: 8, flex: 1 }}>
          <Space>
            <Text strong>{user?.fullName || "Người dùng ẩn danh"}</Text>
            <Text type="secondary">• {formatTimeAgo(createdAt)}</Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            {taggables.map((tag) => (
              <Tag
                key={tag.id}
                color="#1890ff"
                style={{ 
                  color: "white",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: 12
                }}
              >
                {tag.tag.tagName}
              </Tag>
            ))}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{title}</h2>
      <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>{content}</Paragraph>

      {attachments.length > 0 && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Carousel ref={carouselRef} dots={false}>
            {attachments.map((attachment, index) => (
              <div key={index}>
                {attachment.match(/\.(mp4|webm)$/i) ? (
                  <video 
                    controls 
                    style={{ 
                      width: "100%", 
                      maxHeight: 500, 
                      borderRadius: 8,
                      objectFit: "cover"
                    }}
                  >
                    <source src={attachment} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    alt="post-media"
                    src={attachment}
                    style={{ 
                      width: "100%",
                      maxHeight: 500,
                      borderRadius: 8,
                      objectFit: "cover"
                    }}
                  />
                )}
              </div>
            ))}
          </Carousel>

          {attachments.length > 1 && (
            <>
              <Button
                shape="circle"
                icon={<LeftOutlined />}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  border: "none",
                  opacity: 0.8,
                  transition: "opacity 0.3s",
                  left: 16
                }}
                onClick={() => carouselRef.current.prev()}
              />
              <Button
                shape="circle"
                icon={<RightOutlined />}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  border: "none",
                  opacity: 0.8,
                  transition: "opacity 0.3s",
                  right: 16
                }}
                onClick={() => carouselRef.current.next()}
              />
            </>
          )}
        </div>
      )}

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "12px 0",
        borderTop: "1px solid #f0f0f0",
        borderBottom: "1px solid #f0f0f0",
        margin: "16px 0"
      }}>
        <Space size="middle">
          <Button 
            shape="round" 
            icon={<UpOutlined />} 
            style={{ padding: "0 16px" }}
          />
          <Text strong style={{ fontSize: 16 }}>{vote || 0}</Text>
          <Button 
            shape="round" 
            icon={<DownOutlined />} 
            style={{ padding: "0 16px" }}
          />
        </Space>

        <Space size="middle">
          <Button
            shape="round"
            icon={<MessageOutlined />}
            onClick={() => navigate(`/posts/${currentPost.post.id}#comments`)}
            style={{ padding: "0 16px" }}
          >
            {comments.length}
          </Button>
          <Button 
            shape="round" 
            icon={<ShareAltOutlined />} 
            style={{ padding: "0 16px" }}
          />
        </Space>
      </div>

      <div style={{ 
        display: "flex", 
        gap: 12, 
        margin: "16px 0",
        alignItems: "center",
        background: "#fafafa",
        borderRadius: 24,
        padding: "8px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <Popover
          content={
            <Picker
              onEmojiSelect={(e) => setNewComment(prev => prev + e.native)}
              theme="light"
            />
          }
     
        >
        </Popover>
        
        <Input
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onPressEnter={handleCreateComment}
          allowClear
          bordered={false}
          style={{ 
            flex: 1, 
            borderRadius: 20,
            background: "transparent",
            padding: "8px 12px",
          }}
        />
        
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={handleCreateComment}
          disabled={!newComment.trim()}
          style={{ 
            background: !newComment.trim() ? "#f0f0f0" : "#1890ff",
            border: "none",
            boxShadow: "none"
          }}
        />
      </div>

      <List
        dataSource={comments}
        renderItem={(comment) => renderComment(comment)}
      />
      
      <div ref={commentEndRef} />
      {loading && <Text style={{ textAlign: "center" }}>Đang tải thêm bình luận...</Text>}
    </Card>
  );
};

export default Post;