import React, { useState, useEffect } from "react";
import {
  List,
  Avatar,
  Typography,
  Button,
  Space,
  Tag,
  message,
  Dropdown,
  Menu,
  Modal,
  Radio,
  Input,
  Form,
  Select,
  Upload
} from "antd";
import {
  UpOutlined,
  DownOutlined,
  MessageOutlined,
  ShareAltOutlined,
  UserOutlined,
  PictureOutlined,
  UploadOutlined,
  EllipsisOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { votePostThunk, deletePosts, updatePosts } from "../../redux/post/postSlice";
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { reportPostThunk } from "../../redux/post/postSlice";
import { hidePostThunk } from "../../redux/post/postSlice";
const { Title, Text } = Typography;
const { Option } = Select;

const PostItem = ({ postResponse }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const attachments = postResponse?.attachments || [];
  const attachmentCount = attachments.length;
  const taggables = postResponse?.taggables || [];
  const [thumbnail, setThumbnail] = useState("https://via.placeholder.com/100");
  const [userVote, setUserVote] = useState(postResponse?.post.userVote || 0);
  const voteCount = postResponse?.post.vote || 0;
  const [reportVisible, setReportVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editAttachments, setEditAttachments] = useState({
    images: attachments.filter(att => att.match(/\.(jpg|jpeg|png|gif)$/)),
    videos: attachments.filter(att => att.match(/\.(mp4|webm)$/))
  });
  const [hideConfirmVisible, setHideConfirmVisible] = useState(false);
  const [hideLoading, setHideLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isOwner = currentUser?.id === postResponse?.post?.user?.id;
  const isAdmin = currentUser?.role === "ADMIN";

  if (postResponse?.post?.status === "HIDDEN" && !isOwner && !isAdmin) {
    return null;
  }
  
  if (postResponse?.post?.status === "HIDDEN" && (isOwner || isAdmin)) {
    return (
      <div className="hidden-post-notice" style={{ 
        padding: '16px', 
        background: '#fffbe6', 
        border: '1px solid #ffe58f',
        marginBottom: '16px'
      }}>
        <Text type="secondary">
          🚨 Bài viết này đang được ẩn {!isOwner && "(Chỉ admin có thể xem)"}
        </Text>
      </div>
    );
  }
  useEffect(() => {
    if (attachments !== null) {
      const imageAttachment = attachments.find(att => att.match(/\.(jpg|jpeg|png|gif)$/));
      const videoAttachment = attachments.find(att => att.match(/\.(mp4|webm)$/));
      if (imageAttachment) {
        setThumbnail(imageAttachment);
      } else if (videoAttachment) {
        generateVideoThumbnail(videoAttachment);
      }
    }
  }, [attachments]);

  useEffect(() => {
    if (editVisible) {
      form.setFieldsValue({
        title: postResponse?.post.title,
        content: postResponse?.post.content,
        tagIds: taggables.map(tag => tag.tag.id)
      });
    }
  }, [editVisible, form, postResponse, taggables]);

  const generateVideoThumbnail = (videoUrl) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext("2d");

      video.currentTime = 2;

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnail(canvas.toDataURL("image/png"));
      };
    };
  };

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
      message.success(`Uploaded ${latestFile.name}`);
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error(`Upload failed for ${latestFile.name}`);
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
      message.success(`Uploaded ${latestFile.name}`);
    } catch (error) {
      console.error("Error uploading video:", error);
      message.error(`Upload failed for ${latestFile.name}`);
    }
    setUploading(false);
  };

  const handleRemoveEditFile = async (file, type) => {
    try {
      setEditAttachments(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item !== file.url)
      }));
      message.success(`Deleted ${file.name}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error(`Delete failed for ${file.name}`);
    }
  };

  const handleUpdatePost = async () => {
    try {
        const values = await form.validateFields();
        
        const postData = {
            ...values,
            imageUrls: editAttachments.images,
            videoUrls: editAttachments.videos,
            status: "PENDING" // Đảm bảo gửi trạng thái
        };

        await dispatch(updatePosts({
            id: postResponse.post.id,
            PostData: postData
        })).unwrap();

        message.success("Bài viết đã được cập nhật và đang chờ duyệt lại");
        setEditVisible(false);
        
    } catch (error) {
        message.error(`Cập nhật thất bại: ${error.message}`);
        console.error("Update error details:", {
            error,
            postData: {
                id: postResponse.post.id,
                ...values
            }
        });
    }
};
const handleDeletePost = (e) => {
  e.stopPropagation();
  Modal.confirm({
    title: 'Xác nhận xóa',
    content: 'Bạn chắc chắn muốn xóa?',
    onOk: async () => {
      await dispatch(deletePosts());
      navigate("/forum"); // Chủ động điều hướng
    }
  });
};

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deletePosts(postResponse.post.id)).unwrap();
      message.success('Bài viết đã được xóa thành công');
      setDeleteConfirmVisible(false);
      // Optionally trigger a refresh of the post list
    } catch (error) {
      message.error(error.message || 'Xóa bài viết thất bại');
    } finally {
      setDeleteLoading(false);
    }
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
              e.domEvent.preventDefault(); // Thêm dòng này
              setDeleteConfirmVisible(true);
            }}
          >
            Delete
          </Menu.Item>
            <Menu.Item 
              key="update" 
              onClick={(e) => {
                e.domEvent.stopPropagation();                setEditVisible(true);
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
  return (
    <List.Item
  onClick={(e) => {
    const modalWrap = document.querySelector('.ant-modal-wrap');
    if (!e.defaultPrevented && 
        (!modalWrap || !modalWrap.contains(e.target))) {
      navigate(`/posts/${postResponse.post.id}`);
    }
  }}
      style={{
        cursor: "pointer",
        padding: "15px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        transition: "background 0.2s",
        position: "relative"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ position: "relative" }}>
        <Avatar shape="square" size={80} src={thumbnail} icon={<UserOutlined />} />
        {attachmentCount > 1 && (
          <div style={{
            position: "absolute",
            bottom: 4,
            left: 4,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "#fff",
            fontSize: "12px",
            padding: "2px 6px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <PictureOutlined />
            {attachmentCount}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Text strong>{postResponse.post.user.fullName || "Unknown User"}</Text>
            <Text style={{marginLeft:'15px'}} type="secondary">{formatTimeAgo(postResponse.post.createdAt)}</Text>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            {taggables.map((tag) => (
              <Tag
                key={tag.id}
                style={{
                  backgroundColor: "#1890ff",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  fontWeight: "bold",
                  borderRadius: "15px",
                  marginLeft: 4,
                }}
              >
                {tag.tag.tagName}
              </Tag>
            ))}
            <Dropdown overlay={menu} trigger={['click']}>
            <span
              className="no-navigate"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}

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
          </div>
        </div>

        <Title level={5} style={{ marginTop: "5px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {postResponse.post.title}
        </Title>

        <Space size={4}>
          <Button
            shape="circle"
            size="small"
            icon={<UpOutlined style={{
              fontSize: 14,
              color: userVote === 1 ? "#ff4500" : "#65676b"
            }} />}
            style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
            onClick={(e) => {
              e.stopPropagation();
              handleVote(true);
            }}
          />
          <Text strong style={{ fontSize: 14 }}>{voteCount}</Text>
          <Button
            shape="circle"
            size="small"
            icon={<DownOutlined style={{
              fontSize: 14,
              color: userVote === -1 ? "#7193ff" : "#65676b"
            }} />}
            style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
            onClick={(e) => {
              e.stopPropagation();
              handleVote(false);
            }}
          />
          <Button
            shape="circle"
            size="small"
            icon={<MessageOutlined style={{ fontSize: 14 }} />}
            style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
          />
          <Button
            shape="circle"
            size="small"
            icon={<ShareAltOutlined style={{ fontSize: 14 }} />}
            style={{ height: 24, width: 30, padding: "2px 6px", borderRadius: 6 }}
          />
        </Space>
      </div>

      {/* Edit Modal */}
      <Modal
className="no-navigate"

  title="Chỉnh sửa bài viết"
  visible={editVisible}
  onOk={(e) => {
    e.stopPropagation();
    handleUpdatePost();
  }}
  onCancel={(e) => {
    e.stopPropagation();
    setEditVisible(false);
  }}
  okText="Save"
  cancelText="Cancel"
  width={800}
  onClick={(e) => e.stopPropagation()}
>
  <div onClick={(e) => e.stopPropagation()}>
    <Form form={form} layout="vertical" onClick={(e) => e.stopPropagation()}>
      <Form.Item 
        name="title" 
        label="Tiêu đề" 
        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
      >
        <Input 
          placeholder="Nhập tiêu đề bài viết" 
          onClick={(e) => e.stopPropagation()}
        />
      </Form.Item>

      <Form.Item 
        name="content" 
        label="Nội dung" 
        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
      >
        <Input.TextArea 
          rows={6} 
          placeholder="Nhập nội dung bài viết" 
          onClick={(e) => e.stopPropagation()}
        />
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
          onClick={(e) => e.stopPropagation()}
        >
          {taggables.map(tag => (
            <Option 
              key={tag.tag.id} 
              value={tag.tag.id}
              onClick={(e) => e.stopPropagation()}
            >
              {tag.tag.tagName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Hình ảnh">
  <Upload
    multiple
    listType="picture"
    fileList={editAttachments.images.map(url => ({
      uid: url,
      name: url.split('/').pop(),
      status: 'done',
      url: url
    }))}
    beforeUpload={() => false}
    onChange={handleEditImageChange}
    onRemove={(file) => handleRemoveEditFile(file, "images")}
    accept="image/*"
  >
    <Button 
      icon={<UploadOutlined />} 
      loading={uploading}
      style={{ 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center' 
      }}
    >
      Click to Upload
    </Button>
  </Upload>
</Form.Item>

<Form.Item label="Video">
  <Upload
    multiple
    listType="picture"
    fileList={editAttachments.videos.map(url => ({
      uid: url,
      name: url.split('/').pop(),
      status: 'done',
      url: url
    }))}
    beforeUpload={() => false}
    onChange={handleEditVideoChange}
    onRemove={(file) => handleRemoveEditFile(file, "videos")}
    accept="video/*"
  >
    <Button 
      icon={<UploadOutlined />} 
      loading={uploading}
      style={{ 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center' 
      }}
    >
      Click to Upload
    </Button>
  </Upload>
</Form.Item>
    </Form>
  </div>
</Modal>

      {/* Delete Confirmation Modal */}
      <Modal
  className="no-navigate"
  title="Xác nhận delete bài viết"
  visible={deleteConfirmVisible}
  onOk={(e) => {
    e.stopPropagation();
    confirmDelete();
  }}
  onCancel={(e) => {
    e.stopPropagation();
    setDeleteConfirmVisible(false);
  }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteLoading}
      >
        <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
      {/* Report Modal */}
            {/* Trong phần Report Modal */}
<Modal
  className="no-navigate"
  title="Báo cáo bài viết"
  visible={reportVisible}
  onOk={(e) => {
    e.stopPropagation();
    handleReportSubmit();
  }}
  onCancel={(e) => {
    e.stopPropagation();
    setReportVisible(false);
    setSelectedReason('');
    setCustomReason('');
  }}
  okText="Send"
  cancelText="Cancel"
  onClick={(e) => e.stopPropagation()}
>
  <div onClick={(e) => e.stopPropagation()}>
    <Radio.Group 
      onChange={(e) => {
        e.stopPropagation();
        setSelectedReason(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Space direction="vertical">
        {[
          { value: "spam", label: "Nội dung spam" },
          { value: "inappropriate", label: "Nội dung không phù hợp" },
          { value: "harassment", label: "Quấy rối hoặc bắt nạt" },
          { value: "other", label: "Lý do khác" }
        ].map((reason) => (
          <Radio 
            key={reason.value} 
            value={reason.value}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReason(reason.value);
            }}
          >
            {reason.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>

    {selectedReason === 'other' && (
      <Input.TextArea
        rows={4}
        placeholder="Vui lòng nhập lý do cụ thể..."
        value={customReason}
        onChange={(e) => {
          e.stopPropagation();
          setCustomReason(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: 16 }}
      />
    )}
  </div>
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
    </List.Item>
  );
};

export default PostItem;