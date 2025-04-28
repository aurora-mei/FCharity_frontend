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
  message,
  Dropdown,
  Menu,
  Modal,
  Radio
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
  EllipsisOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  fetchCommentsByPost,
  voteComment,
  createReply,
  fetchAllCommentsByPostThunk
} from "../../redux/post/commentSlice";
import { votePostThunk } from "../../redux/post/postSlice";
import { deletePosts } from '../../redux/post/postSlice';
import { reportPostThunk } from "../../redux/post/postSlice";
import { hidePostThunk } from "../../redux/post/postSlice";
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
  level = 0,
  handleVote,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleCreateReply,
  currentVotes
}) => {
  const [isCollapsed] = useState(false);
  // Handle both nested and flat comment structures
  const commentDetail = comment.comment || comment;
  const replies = comment.replies || [];

  return (
    <div style={{ 
      marginLeft: level > 0 ? `${level * 24}px` : 0,
      position: 'relative',
      marginBottom: 8,
      transition: 'margin-left 0.2s ease'
    }}>
      {/* Vertical line for nested comments */}
      {level > 0 && (
        <div style={{ 
          position: 'absolute',
          left: 12,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: '#e4e6eb'
        }} />
      )}
      
      <div style={{ display: 'flex', gap: 8 }}>
        <Avatar size={32} src={commentDetail.user?.avatar} />
        <div style={{ flex: 1 }}>
          {/* Comment content */}
          <div style={{ backgroundColor: '#f0f2f5', borderRadius: 18, padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong style={{ fontSize: 13 }}>{commentDetail.user?.fullName}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{formatTimeAgo(commentDetail.createdAt)}</Text>
            </div>
            <Paragraph style={{ margin: '4px 0 0', fontSize: 15, lineHeight: 1.4 }}>
              {commentDetail.content}
            </Paragraph>
          </div>
          
          {/* Comment actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px', paddingLeft: 8 }}>
            <Button 
              type="text" 
              size="small" 
              icon={<UpOutlined style={{ color: currentVotes[commentDetail.commentId] === true ? '#ff4500' : '#65676b' }} />} 
              onClick={() => handleVote(commentDetail.commentId, true)} 
            />
            <Text style={{ fontSize: 13, fontWeight: 600 }}>
              {commentDetail.vote + (currentVotes[commentDetail.commentId] === true ? 1 : currentVotes[commentDetail.commentId] === false ? -1 : 0)}
            </Text>
            <Button 
              type="text" 
              size="small" 
              icon={<DownOutlined style={{ color: currentVotes[commentDetail.commentId] === false ? '#7193ff' : '#65676b' }} />} 
              onClick={() => handleVote(commentDetail.commentId, false)} 
            />
            {/* Chỉ hiển thị nút Reply cho comment level 0 và level 1 */}
            {level === 0 && (
              <Button 
                type="text" 
                size="small" 
                style={{ fontSize: 13, fontWeight: 600 }} 
                onClick={() => setReplyingTo(prev => prev === commentDetail.commentId ? null : commentDetail.commentId)}
              >
                Reply
              </Button>
            )}
          </div>

          {/* Reply form */}
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
              <Button 
                type="primary" 
                shape="circle" 
                size="small" 
                icon={<SendOutlined />} 
                onClick={() => handleCreateReply(commentDetail.commentId)} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Chỉ render replies nếu level < 1 (tối đa 2 lớp comment) */}
      {!isCollapsed && level < 1 && replies.map(reply => (
        <CommentItem
          key={reply.comment?.commentId || reply.commentId}
          comment={{ 
            comment: reply.comment || reply, 
            replies: reply.replies || [] 
          }}
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
  if (!currentPost || !currentPost.post) {
    return <Card variant="outlined">Đang tải bài viết...</Card>;
  }
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [editVisible, setEditVisible] = useState(false);
  const [editContent, setEditContent] = useState(
    currentPost?.post?.content || ""
  );  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const isOwner = currentUser?.id && currentPost?.post?.user?.id === currentUser.id;
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [postVote, setPostVote] = useState(0);
  const [currentVotes, setCurrentVotes] = useState({});
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [newComment, setNewComment] = useState("");
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState(''); // Thêm state này
  const comments = useSelector((state) => state.comment.comments) || [];
  const allComments = useSelector((state) => state.comment.allComments) || [];
  const carouselRef = useRef(null);
  const commentEndRef = useRef(null);
  const [hideConfirmVisible, setHideConfirmVisible] = useState(false);
  const [hideLoading, setHideLoading] = useState(false);

  useEffect(() => {
    if (currentPost?.post?.id) {
      dispatch(fetchCommentsByPost({ postId: currentPost.post.id }));
      dispatch(fetchAllCommentsByPostThunk(currentPost.post.id))
    }
  }, [currentPost?.post?.id, dispatch]);

  const handleHidePost = async () => {
        setHideLoading(true);
        try {
          await dispatch(hidePostThunk({ 
            postId: currentPost.post.id,  // Changed from postResponse.post.id
            userId: currentUser.id 
          })).unwrap();
          
          message.success('Bài viết đã được ẩn');
          setHideConfirmVisible(false);
        } catch (error) {
          message.error(error.message || 'Lỗi khi ẩn bài');
        } finally {
          setHideLoading(false);
        }
      };
const handleDeletePost = async (e) => {
  e?.stopPropagation();
  try {
    await dispatch(deletePosts(currentPost?.post?.id)).unwrap();
    message.success("Xóa bài viết thành công");
    // Chuyển hướng sau 1 giây để đảm bảo state cập nhật
    setTimeout(() => navigate("/forum"), 1000);
  } catch (error) {
    message.error(error.message || "Xóa bài viết thất bại");
  }
};

  const handleUpdatePost = async () => {
    try {
      await dispatch(updatePosts({
        id: currentPost?.post?.id,
        PostData: { content: editContent }
      })).unwrap();
      message.success("Cập nhật bài viết thành công");
      setEditVisible(false);
    } catch (error) {
      message.error("Cập nhật thất bại: " + error.message);
    }
  };
  const handleReportSubmit = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        
        if (!currentUser?.id) {
          return message.error("Vui lòng đăng nhập");
        }
  
        if (!selectedReason) {
          return message.error("Vui lòng chọn lý do báo cáo");
        }
  
        const finalReason = selectedReason === 'other' 
          ? customReason 
          : selectedReason;
  
        if (selectedReason === 'other' && !customReason.trim()) {
          return message.error("Vui lòng nhập lý do cụ thể");
        }
  
        await dispatch(reportPostThunk({
          postId: currentPost.post.id,  // Changed from postResponse.post.id
          reporterId: currentUser.id,
          reason: finalReason
        }));
  
        message.success("Báo cáo thành công!");
        setReportVisible(false);
        setSelectedReason('');
        setCustomReason('');
  
      } catch (error) {
        message.error(error.message || "Lỗi hệ thống");
      }
    };
  // SAU ĐÓ MỚI KHAI BÁO MENU
  const menu = (
    <Menu>
          {isOwner ? (
            <>
        {currentPost?.post?.status !== "HIDDEN" && (  // Changed from postResponse
                <Menu.Item 
                  key="hide" 
                  onClick={(e) => {
                    e.domEvent.stopPropagation();
                    e.domEvent.preventDefault(); // Thêm dòng này
                    setHideConfirmVisible(true);
                  }}
                >
                  Hide
                </Menu.Item>
              )}
          <Menu.Item 
            key="delete" 
            onClick={(e) => {
              e.domEvent.stopPropagation();
              handleDeletePost(e.domEvent);
            }}
          >
            Delete
          </Menu.Item>
          <Menu.Item 
            key="update" 
            onClick={(e) => {
              e.domEvent.stopPropagation();
              setEditVisible(true);
            }}
          >
            Edit
          </Menu.Item>
        </>
      ) : (
        <Menu.Item 
          key="report"
          onClick={(e) => {
            e.domEvent.stopPropagation();
            setReportVisible(true);
          }}
        >
          Report
        </Menu.Item>
      )}
    </Menu>
  );

  const handlePostVote = async (isUpvote) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?.id) return message.error("Vui lòng đăng nhập để vote bài viết");

    const currentVote = postVote;
    let newVoteValue = isUpvote ? (currentVote === 1 ? 0 : 1) : (currentVote === -1 ? 0 : -1);

    try {
      setPostVote(newVoteValue);
      await dispatch(votePostThunk({ 
        postId: currentPost.post.id, 
        userId: currentUser.id, 
        vote: newVoteValue 
      })).unwrap();
    } catch (err) {
      setPostVote(currentVote);
      message.error(err.message || "Vote bài viết thất bại");
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) return message.error("Vui lòng nhập nội dung bình luận");

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      await dispatch(createComment({ 
        postId: currentPost.post.id, 
        userId: currentUser.id, 
        content: newComment.trim() 
      }));
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
      await dispatch(createReply({ 
        commentId: parentCommentId, 
        replyData: { 
          postId: currentPost.post.id, 
          userId: currentUser.id, 
          content: replyContent 
        } 
      }));
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
    if (!currentUser?.id) {
      message.error("Vui lòng đăng nhập trước khi vote");
      return;
    }
  
    const currentVote = currentVotes[commentId];
    let newVoteValue = 0;
  
    if (currentVote === 1) {
      newVoteValue = isUpvote ? 0 : -1;
    } else if (currentVote === -1) {
      newVoteValue = isUpvote ? 1 : 0;
    } else {
      newVoteValue = isUpvote ? 1 : -1;
    }
  
    // ✅ Bảo vệ dữ liệu gửi đi
    if (![1, 0, -1].includes(newVoteValue)) {
      console.warn("Vote không hợp lệ", { commentId, vote: newVoteValue });
      return;
    }
  
    try {
      setCurrentVotes(prev => ({
        ...prev,
        [commentId]: newVoteValue
      }));
  
      await dispatch(voteComment({ 
        commentId,
        userId: currentUser.id,
        vote: newVoteValue
      })).unwrap();
  
    } catch (error) {
      setCurrentVotes(prev => ({
        ...prev,
        [commentId]: currentVote
      }));
  
      const safeMessage = typeof error.message === 'string' ? error.message : "Vote thất bại";
      if (safeMessage.includes("User not found") || safeMessage.includes("Comment not found")) {
        message.error("Thông tin không hợp lệ. Vui lòng thử lại.");
      } else {
        message.error(safeMessage);
      }
    }
  };
  if (!currentPost?.post) return <Card variant="outlined">Đang tải bài viết...</Card>;

  const { title, createdAt, vote, content, user = {} } = currentPost.post;
  const { attachments = [], taggables = [] } = currentPost;

  return (
    <Card variant="outlined" style={{ width: "96.7%", margin: "1rem"}}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <Avatar src={user?.avatar} size={40} icon={!user?.avatar && <UserOutlined />} />
        <div style={{ marginLeft: 8, flex: 1 }}>
          <Space>
            <Text strong>{user?.fullName || "Người dùng ẩn danh"}</Text>
            <Text type="secondary">• {formatTimeAgo(createdAt)}</Text>
          </Space>
          <div style={{ marginTop: 4 }}>
            {taggables.map((tag) => (
              <Tag key={tag.id} color="#1890ff" style={{ color: "white", borderRadius: 12 }}>
                {tag.tag.tagName}
              </Tag>
            ))}
            
            <Dropdown overlay={menu} trigger={['click']}>
              <span
                onClick={(e) => e.stopPropagation()}
                style={{
                  cursor: 'pointer',
                  marginLeft: 8,
                  fontSize: '15px',
                  padding: '0 8px',
                  userSelect: 'none',
                }}
              >
                <EllipsisOutlined />
              </span>
            </Dropdown>
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
                  <video controls style={{ width: "100%", maxHeight: 400, borderRadius: 8 }}>
                    <source src={att} type="video/mp4" />
                  </video>
                ) : (
                  <img src={att} alt="post-media" style={{ width: "100%", maxHeight: 400, borderRadius: 8 }} />
                )}
              </div>
            ))}
          </Carousel>
          {attachments.length > 1 && (
            <>
              <Button shape="circle" icon={<LeftOutlined />} onClick={() => carouselRef.current.prev()} 
                style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", 
                background: "rgba(0, 0, 0, 0.5)", color: "white" }} />
              <Button shape="circle" icon={<RightOutlined />} onClick={() => carouselRef.current.next()} 
                style={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", 
                background: "rgba(0, 0, 0, 0.5)", color: "white" }} />
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", 
        padding: "12px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", margin: "16px 0" }}>
        <Space size="middle">
          <Button shape="circle" icon={<UpOutlined style={{ color: postVote === 1 ? '#ff4500' : '#65676b' }} />} 
            onClick={() => handlePostVote(true)} />
          <Text strong>{vote || 0}</Text>
          <Button shape="circle" icon={<DownOutlined style={{ color: postVote === -1 ? '#7193ff' : '#65676b' }} />} 
            onClick={() => handlePostVote(false)} />
        </Space>
        <Space size="middle">
          <Button
            shape="round"
            icon={<MessageOutlined />}
            onClick={() => navigate(`/posts/${currentPost.post.id}#comments`)}
          >
            {allComments.length}
          </Button>
          <Button shape="round" icon={<ShareAltOutlined />} />
        </Space>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "16px 0", alignItems: "center", 
        background: "#fafafa", borderRadius: 24, padding: "8px 16px" }}>
        <Input
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onPressEnter={handleCreateComment}
          allowClear
          variant="borderless"
          style={{ flex: 1, background: "transparent" }}
        />
        <Button type="primary" shape="circle" icon={<SendOutlined />} 
          onClick={handleCreateComment} disabled={!newComment.trim()} />
      </div>

      <div style={{ marginTop: 24 }}>
  {Array.isArray(comments) && comments.map(item => (
    <CommentItem
      key={item.comment?.commentId || item.commentId}
      comment={{ 
        comment: item.comment || item, 
        replies: item.replies || [] 
      }}
      level={0} // Top-level comments start at 0
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

      {/* Report Modal */}
      <Modal
        title="Report bài viết"
        visible={reportVisible}
        onOk={handleReportSubmit}
        onCancel={() => setReportVisible(false)}
        okText="Send"
        cancelText="Cancel"
      >
        <Radio.Group 
  onChange={(e) => setSelectedReason(e.target.value)} 
  value={selectedReason}
>
  <Radio value="spam">Nội dung spam</Radio>
  <Radio value="inappropriate">Nội dung không phù hợp</Radio>
  <Radio value="harassment">Quấy rối</Radio>
  <Radio value="other">Lý do khác</Radio>
</Radio.Group>
        
        {/* Thêm textarea cho lý do tùy chỉnh */}
  {selectedReason === 'other' && (
    <Input.TextArea
      rows={4}
      placeholder="Vui lòng nhập lý do cụ thể..."
      value={customReason}
      onChange={(e) => setCustomReason(e.target.value)}
      style={{ marginTop: 16 }}
    />
        )}
      </Modal>
      <Modal
  title="Edit bài viết"
  visible={editVisible}
  onOk={handleUpdatePost}
  onCancel={() => setEditVisible(false)}
  okText="Save"
  cancelText="Cancel"
>
  <Input.TextArea
    value={editContent}
    onChange={(e) => setEditContent(e.target.value)}
    rows={4}
  />
</Modal>
{/* Hidden Confirmation Modal */}
            <Modal
  className="no-navigate"
  title="Xác nhận ẩn bài viết"
  visible={hideConfirmVisible}
  onOk={(e) => {
    e.stopPropagation();
    handleHidePost();
  }}
  onCancel={(e) => {
    e.stopPropagation();
    setHideConfirmVisible(false);
  }}
              okText="Hide"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              confirmLoading={hideLoading}
            >
              <p>Bạn có chắc chắn muốn ẩn bài viết này?</p>
              <p>Bài viết ẩn sẽ không hiển thị với người dùng khác.</p>
            </Modal>
    </Card>
  );
};

export default Post;