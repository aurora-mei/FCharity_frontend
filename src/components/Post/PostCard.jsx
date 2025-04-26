import React, { useRef, useState, useEffect } from "react";
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Tag, 
  Avatar, 
  Carousel, 
  Modal, 
  Menu, 
  Dropdown, 
  Radio,
  Input,
  Form,
  Select,
  Upload,
  message
} from "antd";
import { 
  UpOutlined, 
  DownOutlined, 
  MessageOutlined, 
  ShareAltOutlined, 
  UserOutlined, 
  LeftOutlined, 
  RightOutlined,
  EllipsisOutlined,
  UploadOutlined,
  PictureOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { votePostThunk, deletePosts, updatePosts } from "../../redux/post/postSlice";
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { reportPostThunk } from "../../redux/post/postSlice";
import { hidePostThunk } from "../../redux/post/postSlice";
const { Title, Text } = Typography;
const { Option } = Select;

const PostCard = ({ postResponse }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const carouselRef = useRef(null);
  const [form] = Form.useForm();
  
  // State for voting
  const [userVote, setUserVote] = useState(postResponse?.post.userVote || 0);
  
  // State for reporting
  const [reportVisible, setReportVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  
  // State for editing
  const [editVisible, setEditVisible] = useState(false);
  const [editAttachments, setEditAttachments] = useState({
    images: postResponse?.attachments?.filter(att => att.match(/\.(jpg|jpeg|png|gif)$/)) || [],
    videos: postResponse?.attachments?.filter(att => att.match(/\.(mp4|webm)$/)) || []
  });
  const [uploading, setUploading] = useState(false);
  
  // State for deletion
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // State for hiding
  const [hideConfirmVisible, setHideConfirmVisible] = useState(false);
  const [hideLoading, setHideLoading] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isOwner = currentUser?.id === postResponse?.post?.user?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const taggables = postResponse?.taggables || [];
  const attachments = postResponse?.attachments || [];
  const currentVote = postResponse?.post.vote || 0;
  const commentCount = postResponse?.post.commentCount || 0;

  // Handle hidden post
  if (postResponse?.post?.status === "HIDDEN" && !isOwner && !isAdmin) {
    return null;
  }

  if (postResponse?.post?.status === "HIDDEN" && (isOwner || isAdmin)) {
    return (
      <Card style={{ marginBottom: 16, background: '#fffbe6', borderColor: '#ffe58f' }}>
        <Text type="secondary">
          🚨 Bài viết này đang được ẩn {!isOwner && "(Chỉ admin có thể xem)"}
        </Text>
      </Card>
    );
  }

  const formatTimeAgo = (createdAt) => {
    if (!createdAt) return "Vừa xong";
    
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return "Vừa xong";
    
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
    if (e) e.stopPropagation();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser?.id) {
      message.error("Vui lòng đăng nhập để thực hiện vote");
      return;
    }

    const newVote = isUpvote 
      ? (userVote === 1 ? 0 : 1) 
      : (userVote === -1 ? 0 : -1);

    setUserVote(newVote);

    try {
      await dispatch(
        votePostThunk({
          postId: postResponse.post.id,
          userId: currentUser.id,
          vote: newVote,
        })
      ).unwrap();
    } catch (error) {
      setUserVote(userVote);
      message.error("Lỗi khi gửi vote");
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
        postId: postResponse.post.id,
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

const handleHidePost = async () => {
      setHideLoading(true);
      try {
        await dispatch(hidePostThunk({ 
          postId: postResponse.post.id, 
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

  const handleEditImageChange = async ({ fileList }) => {
    if (fileList.length === 0) return;
    setUploading(true);
    const latestFile = fileList[fileList.length - 1];

    try {
      const response = await dispatch(uploadFileHelper({ 
        file: latestFile.originFileObj, 
        folderName: "images" 
      })).unwrap();
      
      setEditAttachments(prev => ({
        ...prev,
        images: [...prev.images, response]
      }));
      message.success(`Đã tải lên ${latestFile.name}`);
    } catch (error) {
      message.error(`Tải lên thất bại: ${latestFile.name}`);
    }
    setUploading(false);
  };

  const handleEditVideoChange = async ({ fileList }) => {
    if (fileList.length === 0) return;
    setUploading(true);
    const latestFile = fileList[fileList.length - 1];

    try {
      const response = await dispatch(uploadFileHelper({ 
        file: latestFile.originFileObj, 
        folderName: "videos" 
      })).unwrap();
      
      setEditAttachments(prev => ({
        ...prev,
        videos: [...prev.videos, response]
      }));
      message.success(`Đã tải lên ${latestFile.name}`);
    } catch (error) {
      message.error(`Tải lên thất bại: ${latestFile.name}`);
    }
    setUploading(false);
  };

  const handleRemoveEditFile = (file, type) => {
    setEditAttachments(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== file.url)
    }));
    message.success(`Đã xóa ${file.name}`);
  };

  const handleUpdatePost = async () => {
    try {
      const values = await form.validateFields();
      
      const postData = {
        ...values,
        imageUrls: editAttachments.images,
        videoUrls: editAttachments.videos,
        status: "PENDING"
      };

      await dispatch(updatePosts({
        id: postResponse.post.id,
        PostData: postData
      })).unwrap();

      message.success("Bài viết đã được cập nhật và đang chờ duyệt lại");
      setEditVisible(false);
    } catch (error) {
      message.error(`Cập nhật thất bại: ${error.message}`);
    }
  };

  const handleDeletePost = async (e) => {
    e?.stopPropagation();
    
    Modal.confirm({
      title: 'Xác nhận xóa bài viết',
      content: 'Bạn có chắc chắn muốn xóa bài viết này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await dispatch(deletePosts(postResponse?.post?.id)).unwrap();
          message.success("Xóa bài viết thành công");
          navigate("/forum");
        } catch (error) {
          message.error(error.message || "Xóa bài viết thất bại");
        }
      }
    });
  };

  const menu = (
    <Menu>
      {isOwner ? (
        <>
          {postResponse?.post?.status !== "HIDDEN" && (
            <Menu.Item 
              key="hide" 
              onClick={(e) => {
                e.domEvent.stopPropagation();
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

  useEffect(() => {
    if (editVisible) {
      form.setFieldsValue({
        title: postResponse?.post.title,
        content: postResponse?.post.content,
        tagIds: taggables.map(tag => tag.tag.id)
      });
    }
  }, [editVisible, form, postResponse, taggables]);

  return (
    <Card
      style={{
        width: "100%",
        marginBottom: "1rem",
        borderRadius: "8px",
      }}
    >
      {/* Header with user info and tags */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <Space>
          <Avatar src={postResponse.post.user.avatar} icon={<UserOutlined />} />
          <Text type="secondary">
            {postResponse.post.user.fullName} • {formatTimeAgo(postResponse.post.createdAt)}
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
              <EllipsisOutlined />
            </span>
          </Dropdown>
        </Space>
      </div>

      {/* Media content */}
      {attachments?.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "10px", position: "relative" }}>
          {attachments.length === 1 ? (
            attachments[0].includes(".mp4") || attachments[0].includes(".webm") ? (
              <video 
                width="100%" 
                controls
                onClick={(e) => e.stopPropagation()}
              >
                <source src={attachments[0]} type="video/mp4" />
              </video>
            ) : (
              <img
                alt="post"
                src={attachments[0]}
                style={{ width: "100%", maxHeight: "350px", objectFit: "cover", cursor: "pointer" }}
                onClick={handleTitleClick}
              />
            )
          ) : (
            <>
              <Carousel ref={carouselRef} dots={false}>
                {attachments.map((attachment, index) => (
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
              
              {attachments.length > 1 && (
                <div style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <PictureOutlined />
                  {attachments.length}
                </div>
              )}
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

      {/* Interaction */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          borderTop: "1px solid #f0f0f0",
          borderBottom: "1px solid #f0f0f0",
          margin: "16px 0",
        }}
      >
        <Space size="middle">
          <Button
            shape="circle"
            icon={<UpOutlined style={{ color: userVote === 1 ? "#ff4500" : "#65676b" }} />}
            onClick={(e) => handleVote(true, e)}
          />
          <Text strong>{currentVote}</Text>
          <Button
            shape="circle"
            icon={<DownOutlined style={{ color: userVote === -1 ? "#7193ff" : "#65676b" }} />}
            onClick={(e) => handleVote(false, e)}
          />
        </Space>
        <Space size="middle">
          <Button
            shape="round"
            icon={<MessageOutlined />}
            onClick={handleCommentClick}
          >
            {commentCount}
          </Button>
          <Button shape="round" icon={<ShareAltOutlined />} />
        </Space>
      </div>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa bài viết"
        visible={editVisible}
        onOk={handleUpdatePost}
        onCancel={() => setEditVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="title" 
            label="Tiêu đề" 
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề bài viết" />
          </Form.Item>

          <Form.Item 
            name="content" 
            label="Nội dung" 
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <Input.TextArea rows={6} placeholder="Nhập nội dung bài viết" />
          </Form.Item>

          <Form.Item
            name="tagIds"
            label="Tags"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 tag" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn tags"
              allowClear
              style={{ width: '100%' }}
            >
              {taggables.map(tag => (
                <Option key={tag.tag.id} value={tag.tag.id}>
                  {tag.tag.tagName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Hình ảnh">
            <Upload
              multiple
              listType="picture-card"
              fileList={editAttachments.images.map(url => ({
                uid: url,
                name: url.split('/').pop(),
                status: 'done',
                url: url
              }))}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Chỉ có thể tải lên file ảnh!');
                  return Upload.LIST_IGNORE;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error('Ảnh phải nhỏ hơn 5MB!');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={handleEditImageChange}
              onRemove={(file) => handleRemoveEditFile(file, "images")}
              accept="image/*"
            >
              {editAttachments.images.length < 10 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="Video">
            <Upload
              multiple
              listType="picture-card"
              fileList={editAttachments.videos.map(url => ({
                uid: url,
                name: url.split('/').pop(),
                status: 'done',
                url: url
              }))}
              beforeUpload={(file) => {
                const isVideo = file.type.startsWith('video/');
                if (!isVideo) {
                  message.error('Chỉ có thể tải lên file video!');
                  return Upload.LIST_IGNORE;
                }
                const isLt50M = file.size / 1024 / 1024 < 50;
                if (!isLt50M) {
                  message.error('Video phải nhỏ hơn 50MB!');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={handleEditVideoChange}
              onRemove={(file) => handleRemoveEditFile(file, "videos")}
              accept="video/*"
            >
              {editAttachments.videos.length < 3 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa bài viết"
        visible={deleteConfirmVisible}
        onOk={handleDeletePost}
        onCancel={() => setDeleteConfirmVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteLoading}
      >
        <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Report Modal */}
      <Modal
        title="Báo cáo bài viết"
        visible={reportVisible}
        onOk={handleReportSubmit}
        onCancel={() => {
          setReportVisible(false);
          setSelectedReason('');
          setCustomReason('');
        }}
        okText="Send"
        cancelText="Cancel"
      >
        <Radio.Group 
          onChange={(e) => setSelectedReason(e.target.value)} 
          value={selectedReason}
        >
          <Space direction="vertical">
            <Radio value="spam">Nội dung spam</Radio>
            <Radio value="inappropriate">Nội dung không phù hợp</Radio>
            <Radio value="harassment">Quấy rối hoặc bắt nạt</Radio>
            <Radio value="other">Lý do khác</Radio>
          </Space>
        </Radio.Group>

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

      {/* Hidden Confirmation Modal */}
      <Modal
        title="Xác nhận ẩn bài viết"
        visible={hideConfirmVisible}
        onOk={handleHidePost}
        onCancel={() => setHideConfirmVisible(false)}
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

export default PostCard;