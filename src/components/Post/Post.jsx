import React, { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Typography,
  Space,
  Card,
  Input,
  Button,
  Carousel,
  Tag,
  message
} from "antd";
import {
  MessageOutlined,
  UpOutlined,
  DownOutlined,
  ShareAltOutlined,
  UserOutlined,
  SendOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  fetchCommentsByPost,
  voteComment,
  createReply
} from "../../redux/post/commentSlice";
import { votePostThunk } from "../../redux/post/postSlice";

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

const countCommentsWithReplies = (comments) => {
  let count = 0;
  const dfs = (list) => {
    for (const c of list) {
      if (c.comment) count++;
      if (c.replies?.length) dfs(c.replies);
    }
  };
  dfs(comments);
  return count;
};

const CommentItem = React.memo(({
  comment,
  level,
  handleVote,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleCreateReply,
  currentVotes
}) => {
  const [isCollapsed] = useState(false);
  const commentDetail = comment.comment;
  const replies = comment.replies;

  return commentDetail && (
    <div style={{ marginLeft: level > 0 ? 44 : 0, position: 'relative', marginBottom: 8 }}>
      {level > 0 && (
        <div style={{ position: 'absolute', left: -24, top: 0, bottom: 0, width: 2, backgroundColor: '#e4e6eb' }} />
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <Avatar size={32} src={commentDetail.user?.avatar} />
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: '#f0f2f5', borderRadius: 18, padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong style={{ fontSize: 13 }}>{commentDetail.user?.fullName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatTimeAgo(commentDetail.createdAt)}</Text>
            </div>
            <Paragraph style={{ margin: '4px 0 0', fontSize: 15, lineHeight: 1.4 }}>{commentDetail.content}</Paragraph>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px', paddingLeft: 8 }}>
            <Button type="text" size="small" icon={<UpOutlined style={{ color: currentVotes[commentDetail.commentId] === true ? '#ff4500' : '#65676b' }} />} onClick={() => handleVote(commentDetail.commentId, true)} />
            <Text style={{ fontSize: 13, fontWeight: 600 }}>{commentDetail.vote + (currentVotes[commentDetail.commentId] === true ? 1 : currentVotes[commentDetail.commentId] === false ? -1 : 0)}</Text>
            <Button type="text" size="small" icon={<DownOutlined style={{ color: currentVotes[commentDetail.commentId] === false ? '#7193ff' : '#65676b' }} />} onClick={() => handleVote(commentDetail.commentId, false)} />
            <Button type="text" size="small" style={{ fontSize: 13, fontWeight: 600 }} onClick={() => setReplyingTo(prev => prev === commentDetail.commentId ? null : commentDetail.commentId)}>Reply</Button>
          </div>
          {replyingTo === commentDetail.commentId && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Avatar size={32} src={commentDetail.user?.avatar} />
              <Input.TextArea
                rows={1}
                autoSize={{ minRows: 1, maxRows: 4 }}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Viết phản hồi..."
              />
              <Button type="primary" shape="circle" size="small" icon={<SendOutlined />} onClick={() => handleCreateReply(commentDetail.commentId)} />
            </div>
          )}
        </div>
      </div>
      {!isCollapsed && replies?.map(reply => (
        <CommentItem
          key={reply.comment?.commentId || reply.commentId}
          comment={{ comment: reply.comment || reply, replies: reply.replies || [] }}
          level={level + 1}
          handleVote={handleVote}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          handleCreateReply={handleCreateReply}
          currentVotes={currentVotes}
        />
      ))}
    </div>
  );
});

const Post = ({ currentPost }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [postVote, setPostVote] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [currentVotes, setCurrentVotes] = useState({});
  const comments = useSelector((state) => state.comment.comments) || [];
  console.log("DEBUG comments:", comments);
  console.log("Tổng comment + reply:", countCommentsWithReplies(comments));
  const carouselRef = useRef(null);
  const commentEndRef = useRef(null);

  useEffect(() => {
    if (comments.length === 0 && currentPost?.post?.id) {
      dispatch(fetchCommentsByPost({ postId: currentPost.post.id }));
    }
  }, [currentPost?.post?.id, dispatch]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handlePostVote = async (isUpvote) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?.id) return message.error("Vui lòng đăng nhập để vote bài viết");

    const currentVote = postVote;
    let newVoteValue = isUpvote ? (currentVote === 1 ? 0 : 1) : (currentVote === -1 ? 0 : -1);

    try {
      setPostVote(newVoteValue);
      await dispatch(votePostThunk({ postId: currentPost.post.id, userId: currentUser.id, vote: newVoteValue })).unwrap();
    } catch (err) {
      setPostVote(currentVote);
      message.error(err.message || "Vote bài viết thất bại");
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return message.error("Vui lòng nhập nội dung bình luận");

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      await dispatch(createComment({ postId: currentPost.post.id, userId: currentUser.id, content: newComment.trim() }));
      await dispatch(fetchCommentsByPost({ postId: currentPost.post.id }));
      setNewComment("");
      message.success("Bình luận thành công!");
    } catch (error) {
      message.error("Gửi bình luận thất bại!");
    }
  };

  const handleCreateReply = async (parentCommentId) => {
    if (!replyContent.trim()) return message.error("Vui lòng nhập nội dung phản hồi");
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      await dispatch(createReply({ commentId: parentCommentId, replyData: { postId: currentPost.post.id, userId: currentUser.id, content: replyContent } }));
      await dispatch(fetchCommentsByPost({ postId: currentPost.post.id }));
      setReplyContent("");
      setReplyingTo(null);
      message.success("Phản hồi thành công!");
    } catch (error) {
      message.error("Gửi phản hồi thất bại!");
    }
  };

  const handleVote = async (commentId, isUpvote) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?.id) return message.error("Vui lòng đăng nhập để vote");

    const currentVote = currentVotes[commentId];
    let newVoteValue = isUpvote ? (currentVote === 1 ? 0 : 1) : (currentVote === -1 ? 0 : -1);

    try {
      setCurrentVotes((prev) => ({ ...prev, [commentId]: newVoteValue }));
      await dispatch(voteComment({ commentId, userId: currentUser.id, vote: newVoteValue })).unwrap();
    } catch (error) {
      setCurrentVotes((prev) => ({ ...prev, [commentId]: currentVote }));
      message.error(typeof error.message === "string" ? error.message : "Vote thất bại");
    }
  };

  if (!currentPost?.post) return <Card variant="outlined">Đang tải bài viết...</Card>;

  const { title, createdAt, vote, content, user = {} } = currentPost.post;
  const { attachments = [], taggables = [] } = currentPost;

  return (
    <Card variant="outlined" style={{ maxWidth: 800, margin: "auto", marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <Avatar src={user?.avatar} size={40} icon={!user?.avatar && <UserOutlined />} />
        <div style={{ marginLeft: 8, flex: 1 }}>
          <Space>
            <Text strong>{user?.fullName || "Người dùng ẩn danh"}</Text>
            <Text type="secondary">• {formatTimeAgo(createdAt)}</Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            {taggables.map((tag) => (
              <Tag key={tag.id} color="#1890ff" style={{ color: "white", borderRadius: 12 }}>{tag.tag.tagName}</Tag>
            ))}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{title}</h2>
      <Paragraph style={{ fontSize: 16 }}>{content}</Paragraph>

      {attachments.length > 0 && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Carousel ref={carouselRef} dots={false}>
            {attachments.map((att, idx) => (
              <div key={idx}>
                {att.match(/\.(mp4|webm)$/i) ? (
                  <video controls style={{ width: "100%", maxHeight: 500, borderRadius: 8 }}>
                    <source src={att} type="video/mp4" />
                  </video>
                ) : (
                  <img src={att} alt="post-media" style={{ width: "100%", maxHeight: 500, borderRadius: 8 }} />
                )}
              </div>
            ))}
          </Carousel>
          {attachments.length > 1 && (
            <>
              <Button shape="circle" icon={<LeftOutlined />} onClick={() => carouselRef.current.prev()} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", background: "rgba(0, 0, 0, 0.5)", color: "white" }} />
              <Button shape="circle" icon={<RightOutlined />} onClick={() => carouselRef.current.next()} style={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", background: "rgba(0, 0, 0, 0.5)", color: "white" }} />
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", margin: "16px 0" }}>
        <Space size="middle">
          <Button shape="circle" icon={<UpOutlined style={{ color: postVote === 1 ? '#ff4500' : '#65676b' }} />} onClick={() => handlePostVote(true)} />
          <Text strong>{vote || 0}</Text>
          <Button shape="circle" icon={<DownOutlined style={{ color: postVote === -1 ? '#7193ff' : '#65676b' }} />} onClick={() => handlePostVote(false)} />
        </Space>
        <Space size="middle">
          <Button
            shape="round"
            icon={<MessageOutlined />}
            onClick={() => navigate(`/posts/${currentPost.post.id}#comments`)}
          >
            {countCommentsWithReplies(comments)}
          </Button>
          <Button shape="round" icon={<ShareAltOutlined />} />
        </Space>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center", background: "#fafafa", borderRadius: 24, padding: "8px 16px" }}>
        <Input
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onPressEnter={handleCreateComment}
          allowClear
          variant="borderless"
          style={{ flex: 1, background: "transparent" }}
        />
        <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleCreateComment} disabled={!newComment.trim()} />
      </div>

      <div style={{ marginTop: 24 }}>
        {Array.isArray(comments) && comments.map(item => (
          <CommentItem
            key={item.comment.commentId}
            comment={{ comment: item.comment, replies: item.replies || [] }}
            level={0}
            handleVote={handleVote}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleCreateReply={handleCreateReply}
            currentVotes={currentVotes}
          />
        ))}
        <div ref={commentEndRef} />
      </div>
    </Card>
  );
};

export default Post;
