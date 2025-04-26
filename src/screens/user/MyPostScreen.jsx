import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  Card,
  Typography,
  Button,
  Input,
  Select,
  Space,
  Tag,
  DatePicker,
  List,
  Empty,
  Image,
  Badge,
  Modal,
  Form,
  Upload,
  message
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchMyPosts, 
  deletePosts, 
  updatePosts,
  hidePostThunk,
  unhidePostThunk
} from "../../redux/post/postSlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import LoadingModal from "../../components/LoadingModal";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useNavigate } from "react-router-dom";
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('vi');
dayjs.extend(relativeTime);

const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const statusConfig = {
  APPROVED: { label: 'Approved', color: '#52c41a' },
  PENDING: { label: 'Pending', color: '#faad14' },
  REJECTED: { label: 'Rejected', color: '#f5222d' },
  BANNED: { label: 'Banned', color: '#f5222d' },
  HIDDEN: { label: 'Hidden', color: '#8c8c8c' }
};

const CompactFilterSection = ({
  searchText,
  setSearchText,
  selectedTags,
  setSelectedTags,
  dateRange,
  setDateRange,
  selectedStatus,
  setSelectedStatus,
  tags,
  statusConfig,
}) => {
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <div style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Input
            placeholder="Tìm kiếm bài viết"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{
              flex: 1,
              borderRadius: 20,
            }}
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterVisible(!filterVisible)}
            style={{
              borderRadius: 20,
              backgroundColor: filterVisible ? '#e6f7ff' : undefined,
              borderColor: filterVisible ? '#1890ff' : undefined,
              color: filterVisible ? '#1890ff' : undefined
            }}
          />
        </div>

        {filterVisible && (
          <Card
            size="small"
            style={{ marginTop: 8, borderRadius: 8 }}
            bodyStyle={{ padding: 12 }}
          >
            <Form layout="vertical" size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item label="Trạng thái" style={{ marginBottom: 8 }}>
                  <Select
                    placeholder="Chọn trạng thái"
                    allowClear
                    style={{ width: '100%' }}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={Object.entries(statusConfig).map(([key, { label }]) => ({
                      value: key,
                      label,
                    }))}
                  />
                </Form.Item>

                <Form.Item label="Tags" style={{ marginBottom: 8 }}>
                  <Select
                    mode="multiple"
                    placeholder="Lọc theo tags"
                    style={{ width: "100%" }}
                    value={selectedTags}
                    onChange={setSelectedTags}
                    options={tags.map(tag => ({
                      value: tag.id,
                      label: tag.tagName,
                    }))}
                    maxTagCount="responsive"
                  />
                </Form.Item>

                <Form.Item label="Khoảng thời gian" style={{ marginBottom: 0 }}>
                  <RangePicker
                    style={{ width: "100%" }}
                    value={dateRange}
                    onChange={setDateRange}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Space>
            </Form>
          </Card>
        )}
      </Space>
    </div>
  );
};

const MyPostScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentEditingPost, setCurrentEditingPost] = useState(null);
  const [editAttachments, setEditAttachments] = useState({ images: [], videos: [] });
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState(null);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const loading = useSelector((state) => state.post.loading);
  const posts = useSelector((state) => state.post.myPosts) || [];
  const tags = useSelector((state) => state.tag.tags) || [];
  const error = useSelector((state) => state.post.error);

  const isImageFile = (url) => typeof url === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isVideoFile = (url) => typeof url === 'string' && /\.(mp4|webm|mov)$/i.test(url);

  const formatTimeAgo = (createdAt) => {
    const createdDate = dayjs(createdAt);
    return createdDate.isValid() ? createdDate.fromNow() : "Không rõ thời gian";
  };

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchMyPosts(currentUser.id));
      dispatch(fetchTags());
    }
  }, [dispatch, currentUser?.id]);

  const filteredPosts = useMemo(() => {
    return posts.filter(postData => {
      if (!postData || !postData.post) return false;
      const post = postData.post;

      const matchesSearch = searchText === "" ||
        post.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchText.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tagId =>
          postData.taggables?.some(t => t.tag?.id === tagId || t.id === tagId)
        );

      let matchesDate = true;
      if (dateRange) {
        const postDate = dayjs(post.createdAt);
        matchesDate = postDate.isAfter(dateRange[0].startOf('day')) &&
                     postDate.isBefore(dateRange[1].endOf('day'));
      }

      const matchesStatus = !selectedStatus || post.postStatus === selectedStatus;

      return matchesSearch && matchesTags && matchesDate && matchesStatus;
    }).sort((a, b) => dayjs(b.post.createdAt).valueOf() - dayjs(a.post.createdAt).valueOf());
  }, [posts, searchText, selectedTags, dateRange, selectedStatus]);

  const groupedPosts = useMemo(() => {
    const groups = {};
    filteredPosts.forEach(postData => {
      if (!postData || !postData.post) return;
      const date = dayjs(postData.post.createdAt).format('DD/MM/YYYY');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(postData);
    });
    return Object.entries(groups);
  }, [filteredPosts]);

  const handleHidePost = async (postId) => {
    try {
      await dispatch(hidePostThunk({ postId, userId: currentUser.id })).unwrap();
      message.success('Bài viết đã được ẩn');
      dispatch(fetchMyPosts(currentUser.id));
    } catch (error) {
      message.error(error.message || 'Lỗi khi ẩn bài viết');
    }
  };

  const handleUnhidePost = async (postId) => {
    try {
      await dispatch(unhidePostThunk({ 
        postId, 
        userId: currentUser.id,
        status: 'APPROVED' // Truyền thêm status
      })).unwrap();
      
      message.success('Bài viết đã được hiển thị và chuyển về trạng thái đã duyệt');
      dispatch(fetchMyPosts(currentUser.id));
    } catch (error) {
      message.error(error.message || 'Lỗi khi hiện bài viết');
    }
  };

  const handleEditPost = (postData) => {
    if (!postData) return;
    
    setCurrentEditingPost(postData);
    const images = postData.attachments?.filter(url => isImageFile(url)) || [];
    const videos = postData.attachments?.filter(url => isVideoFile(url)) || [];
    
    setEditAttachments({ images, videos });
    
    form.setFieldsValue({
      title: postData.post.title,
      content: postData.post.content,
      tagIds: postData.taggables?.map(t => t.tag?.id || t.id) || []
    });
    
    setEditVisible(true);
  };

  const handleDeletePost = (postId) => {
    setCurrentEditingPost(postId);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deletePosts(currentEditingPost)).unwrap();
      message.success('Bài viết đã được xóa');
      dispatch(fetchMyPosts(currentUser.id));
    } catch (error) {
      message.error(error.message || 'Lỗi khi xóa bài viết');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmVisible(false);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);
      
      const updatedPost = {
        ...currentEditingPost.post,
        title: values.title,
        content: values.content,
        tagIds: values.tagIds
      };
      
      await dispatch(updatePosts({
        postId: currentEditingPost.post.id,
        postData: updatedPost
      })).unwrap();
      
      message.success('Bài viết đã được cập nhật');
      dispatch(fetchMyPosts(currentUser.id));
      setEditVisible(false);
    } catch (error) {
      message.error(error.message || 'Lỗi khi cập nhật bài viết');
    } finally {
      setUploading(false);
    }
  };

  const renderAttachment = (attachments) => {
    if (!attachments || attachments.length === 0) return null;

    const firstAttachment = attachments[0];
    if (!firstAttachment) return null;

    const isImage = isImageFile(firstAttachment);
    const isVideo = isVideoFile(firstAttachment);

    return (
      <Badge
        count={attachments.length > 1 ? attachments.length : 0}
        overflowCount={9}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      >
        <div style={{
          marginTop: 12,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e4e6eb',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f2f5'
        }}>
          {isImage ? (
            <Image
              src={firstAttachment}
              alt="post attachment"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              preview={false}
            />
          ) : isVideo ? (
            <video
              src={firstAttachment}
              style={{
                maxWidth: '100%',
                maxHeight: '100%'
              }}
              controls={false}
              muted
              playsInline
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '10px'
            }}>
              <FileOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />
              <Text type="secondary" style={{ marginTop: 8, wordBreak: 'break-all' }}>
                {firstAttachment.split('/').pop()}
              </Text>
            </div>
          )}
        </div>
      </Badge>
    );
  };

  const renderPostItem = (postData) => {
    if (!postData?.post) return null;
    const post = postData.post;
    const user = post.user || {};
    const status = statusConfig[post.postStatus] || { label: 'Unknown', color: '#d9d9d9' };
    
    const isClickable = !['REJECTED', 'PENDING'].includes(post.postStatus);

    return (
      <Card
        key={post.id}
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          opacity: isClickable ? 1 : 0.6,
          cursor: isClickable ? 'pointer' : 'not-allowed'
        }}
        onClick={() => {
          if (!isClickable) {
            message.error(
              post.postStatus === 'REJECTED' 
                ? 'Bài viết đã bị từ chối và không thể xem' 
                : 'Bài viết đang chờ duyệt'
            );
            return;
          }
          navigate(`/posts/${post.id}`);
        }}
      >
        <div style={{ 
          padding: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0"
        }}>
          <Space>
            <Avatar src={user.avatar} icon={<UserOutlined />} size={40} />
            <div>
              <Text strong>{user.fullName || "Người dùng ẩn danh"}</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatTimeAgo(post.createdAt)}
                </Text>
                <Tag color={status.color}>{status.label}</Tag>
              </div>
            </div>
          </Space>

          <Space>
            {post.postStatus === 'APPROVED' && (
              <Button
                type="text"
                shape="circle"
                icon={<EyeInvisibleOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleHidePost(post.id);
                }}
                title="Ẩn bài viết"
              />
            )}
{post.postStatus === 'HIDDEN' && (
  <Button
    type="text"
    shape="circle"
    icon={<EyeOutlined />}
    onClick={(e) => {
      e.stopPropagation();
      handleUnhidePost(post.id);
    }}
    title="Hiện bài viết (sẽ chuyển về trạng thái đã duyệt)"
  />
)}
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditPost(postData);
              }}
              title="Chỉnh sửa"
            />
            <Button
              type="text"
              shape="circle"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePost(post.id);
              }}
              title="Xóa"
            />
          </Space>
        </div>

        <div style={{ padding: "12px 16px" }}>
          {post.title && (
            <Title level={5} style={{ marginBottom: 8 }}>{post.title}</Title>
          )}
          <Paragraph
            style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}
            ellipsis={{ rows: 3, expandable: false }}
          >
            {post.content}
          </Paragraph>
          
          {postData.attachments?.length > 0 && renderAttachment(postData.attachments)}

          {postData.taggables?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Space wrap>
                {postData.taggables.map((taggable) => (
                  <Tag key={taggable.tag?.id} color="blue">
                    {taggable.tag?.tagName}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (loading && posts.length === 0) return <LoadingModal />;
  if (error) return <Text type="danger">Lỗi khi tải bài viết: {error.message || 'Unknown error'}</Text>;

  return (
    <div style={{ maxWidth: '100%', padding: "16px" }}>
      <Title level={4} style={{ marginBottom: 16 }}>Bài viết của tôi</Title>

      <CompactFilterSection
        searchText={searchText}
        setSearchText={setSearchText}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        tags={tags}
        statusConfig={statusConfig}
      />

      {groupedPosts.length > 0 ? (
        groupedPosts.map(([date, postsInDate]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 16, color: '#65676B' }}>{date}</Title>
            <List
              dataSource={postsInDate}
              renderItem={renderPostItem}
            />
          </div>
        ))
      ) : (
        <Empty
          description={
            <Text type="secondary">
              {searchText || selectedTags.length > 0 || dateRange || selectedStatus
                ? "Không tìm thấy bài viết nào phù hợp"
                : "Bạn chưa có bài viết nào"}
            </Text>
          }
          style={{ margin: "48px 16px" }}
        >
          {!searchText && selectedTags.length === 0 && !dateRange && !selectedStatus && (
            <Button type="primary" onClick={() => navigate('/create-post')}>Tạo bài viết mới</Button>
          )}
        </Empty>
      )}

      <Modal
        title="Chỉnh sửa bài viết"
        open={editVisible}
        onOk={handleUpdatePost}
        onCancel={() => setEditVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={600}
        confirmLoading={uploading || loading}
        destroyOnClose
        maskClosable={false}
      >
        <Form form={form} layout="vertical" name="editPostForm">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }, { max: 150, message: 'Tiêu đề tối đa 150 ký tự!' }]}
          >
            <Input placeholder="Nhập tiêu đề bài viết" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }, { max: 5000, message: 'Nội dung tối đa 5000 ký tự!' }]}
          >
            <Input.TextArea rows={5} placeholder="Chia sẻ suy nghĩ của bạn..." showCount />
          </Form.Item>

          <Form.Item
            name="tagIds"
            label="Tags (chọn ít nhất 1)"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 tag", type: 'array' }]}
          >
            <Select
              mode="multiple"
              placeholder="Gắn thẻ chủ đề liên quan"
              allowClear
              style={{ width: '100%' }}
              options={tags.map(tag => ({ value: tag.id, label: tag.tagName }))}
              maxTagCount="responsive"
            />
          </Form.Item>

          <Form.Item label="Ảnh & Video đính kèm">
            <Upload.Dragger
              name="attachments"
              multiple
              listType="picture-card"
              fileList={[
                ...editAttachments.images.map(url => ({
                  uid: url,
                  name: url.split('/').pop(),
                  status: 'done',
                  url: url,
                  type: 'image/png'
                })),
                ...editAttachments.videos.map(url => ({
                  uid: url,
                  name: url.split('/').pop(),
                  status: 'done',
                  url: url,
                  type: 'video/mp4'
                }))
              ]}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');
                if (!isImage && !isVideo) {
                  message.error('Chỉ có thể tải lên file ảnh hoặc video!');
                  return Upload.LIST_IGNORE;
                }
                const isLt5M = file.size / 1024 / 1024 < 5;
                const isLt50M = file.size / 1024 / 1024 < 50;

                if (isImage && !isLt5M) {
                  message.error('Ảnh phải nhỏ hơn 5MB!');
                  return Upload.LIST_IGNORE;
                }
                if (isVideo && !isLt50M) {
                  message.error('Video phải nhỏ hơn 50MB!');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={({ fileList, file }) => {
                if (file.status === 'removed') {
                  // Removal is handled by onRemove prop directly
                } else if (file.originFileObj) {
                  const isImage = file.type.startsWith('image/');
                  const isVideo = file.type.startsWith('video/');
                  if (isImage) {
                    // handleEditImageChange({ fileList: [file] });
                  } else if (isVideo) {
                    // handleEditVideoChange({ fileList: [file] });
                  }
                }
              }}
              onRemove={(file) => {
                const isImage = file.type?.startsWith('image/') || isImageFile(file.url || file.uid);
                const isVideo = file.type?.startsWith('video/') || isVideoFile(file.url || file.uid);
                if(isImage) {
                  // handleRemoveEditFile(file, "images");
                } else if (isVideo) {
                  // handleRemoveEditFile(file, "videos");
                }
              }}
              accept="image/*,video/*"
              disabled={uploading}
              className="edit-post-uploader"
            >
              {(editAttachments.images.length + editAttachments.videos.length) < 10 ? (
                <>
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Nhấn hoặc kéo file vào đây</p>
                </>
              ) : null}
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa bài viết"
        open={deleteConfirmVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
        okText="Xóa vĩnh viễn"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteLoading}
        centered
      >
        <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
        <p><strong style={{ color: 'red' }}>Hành động này không thể hoàn tác.</strong></p>
      </Modal>
    </div>
  );
};

export default MyPostScreen;