import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Avatar, Tooltip } from 'antd';
import { 
  LikeOutlined, 
  DislikeOutlined, 
  MessageOutlined,
  PictureOutlined 
} from '@ant-design/icons';
import { votePostThunk } from '../../redux/post/postSlice';

const PostForumBoard = ({ postResponse }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [thumbnail, setThumbnail] = useState(null);
  const [attachmentCount, setAttachmentCount] = useState(0);
  const [userVote, setUserVote] = useState(postResponse?.post.userVote || 0);
  const voteCount = postResponse?.post.vote || 0;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const processAttachments = () => {
      const attachments = postResponse?.attachments || [];
      setAttachmentCount(attachments.length);
      
      const image = attachments.find(att => att.match(/\.(jpg|jpeg|png|gif)$/i));
      const video = attachments.find(att => att.match(/\.(mp4|webm)$/i));

      if (image) {
        setThumbnail(image);
      } else if (video) {
        generateVideoThumbnail(video);
      } else {
        setThumbnail(null);
      }
    };

    postResponse && processAttachments();
  }, [postResponse]);

  const generateVideoThumbnail = (videoUrl) => {
    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');

        video.currentTime = 2;
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnail(canvas.toDataURL('image/png'));
        };
      };
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      setThumbnail(null);
    }
  };

  const handleVote = async (isUpvote) => {
    if (!currentUser?.id) {
      message.error("Vui lòng đăng nhập để thực hiện vote");
      return;
    }

    const newVote = isUpvote 
      ? (userVote === 1 ? 0 : 1) 
      : (userVote === -1 ? 0 : -1);

    setUserVote(newVote);

    try {
      await dispatch(votePostThunk({
        postId: postResponse.post.id,
        userId: currentUser.id,
        vote: newVote
      })).unwrap();
    } catch (error) {
      setUserVote(userVote); // Rollback if error
      message.error("Lỗi khi gửi vote");
    }
  };

  if (!postResponse) return null;

  const { post } = postResponse;
  const user = post?.user;

  return (
    <Card
      hoverable
      style={{ 
        height: '100%',
        cursor: 'pointer',
        borderRadius: 8,
        overflow: 'hidden'
      }}
      cover={
        <div style={{ position: 'relative', height: 180, backgroundColor: '#f0f2f5' }}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Post thumbnail"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#bfbfbf',
              fontSize: 24
            }}>
              <PictureOutlined />
            </div>
          )}
        </div>
      }
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      {/* User info */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 12 
      }}>
        <Avatar src={user?.avatar}>{!user?.avatar && user?.fullName?.[0]}</Avatar>
        <div style={{ fontWeight: 500 }}>{user?.fullName || 'Ẩn danh'}</div>
      </div>

      {/* Post Title */}
      <div style={{ 
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: 12,
        lineHeight: 1.4,
        minHeight: 44,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {post?.title}
      </div>

      {/* Post Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Tooltip title="Upvote">
            <span onClick={(e) => {
              e.stopPropagation();
              handleVote(true);
            }}>
              <LikeOutlined style={{ 
                color: userVote === 1 ? '#52c41a' : '#8c8c8c',
                fontSize: 16
              }} />
            </span>
          </Tooltip>
          <span style={{ 
            minWidth: 20, 
            textAlign: 'center',
            fontWeight: 500,
            color: userVote !== 0 ? (userVote === 1 ? '#52c41a' : '#ff4d4f') : 'inherit'
          }}>
            {voteCount}
          </span>
          <Tooltip title="Downvote">
            <span onClick={(e) => {
              e.stopPropagation();
              handleVote(false);
            }}>
              <DislikeOutlined style={{ 
                color: userVote === -1 ? '#ff4d4f' : '#8c8c8c',
                fontSize: 16
              }} />
            </span>
          </Tooltip>
        </div>

        <Tooltip title="Comments">
          <span onClick={(e) => {
            e.stopPropagation();
            navigate(`/posts/${post.id}#comments`);
          }}>
            <MessageOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          </span>
        </Tooltip>
      </div>
    </Card>
  );
};

export default PostForumBoard;