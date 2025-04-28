import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  Card,
  Typography,
  Button,
  Divider,
  Input,
  Select,
  Space,
  Tag,
  DatePicker,
  List,
  Dropdown,
  Menu,
  Empty,
  Image,
  Badge
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  EllipsisOutlined,
  EyeOutlined,
  CalendarOutlined,
  TagOutlined,
  UserOutlined,
  PictureOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPosts } from "../../redux/post/postSlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import LoadingModal from "../../components/LoadingModal";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useNavigate } from "react-router-dom";

dayjs.locale('vi');

const { Text, Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const MyPostScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [dateFilterType, setDateFilterType] = useState("all");
  
  const currentUser = useSelector((state) => state.auth.currentUser);
  const loading = useSelector((state) => state.post.loading);
  const posts = useSelector((state) => state.post.myPosts) || [];
  const tags = useSelector((state) => state.tag.tags) || [];
  const error = useSelector((state) => state.post.error);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchMyPosts(currentUser.id));
      dispatch(fetchTags());
    }
  }, [dispatch, currentUser?.id]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchText === "" || 
        post.post.title?.toLowerCase().includes(searchText.toLowerCase()) || 
        post.post.content?.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => 
          post.taggables?.some(t => t.tag?.id === tag || t.id === tag)
        );
      
      let matchesDate = true;
      if (dateRange) {
        const postDate = dayjs(post.post.creationDate);
        matchesDate = postDate.isAfter(dateRange[0].startOf('day')) && 
                     postDate.isBefore(dateRange[1].endOf('day'));
      } else if (dateFilterType !== "all") {
        const now = dayjs();
        const postDate = dayjs(post.post.creationDate);
        
        switch (dateFilterType) {
          case "today":
            matchesDate = postDate.isSame(now, 'day');
            break;
          case "week":
            matchesDate = postDate.isSame(now, 'week');
            break;
          case "month":
            matchesDate = postDate.isSame(now, 'month');
            break;
          case "year":
            matchesDate = postDate.isSame(now, 'year');
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesTags && matchesDate;
    });
  }, [posts, searchText, selectedTags, dateRange, dateFilterType]);

  const groupedPosts = useMemo(() => {
    const grouped = {};
    filteredPosts.forEach(post => {
      const date = dayjs(post.post.creationDate).format('D [Tháng] M, YYYY');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(post);
    });
    return grouped;
  }, [filteredPosts]);

  const renderAttachment = (attachments) => {
    if (!attachments || attachments.length === 0) return null;

    const firstAttachment = attachments[0];
    const isImage = firstAttachment.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isVideo = firstAttachment.match(/\.(mp4|webm|mov)$/i);

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
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <VideoCameraOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />
            </div>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PictureOutlined style={{ fontSize: 48, color: '#8c8c8c' }} />
            </div>
          )}
        </div>
      </Badge>
    );
  };

  const handleDateFilterChange = (value) => {
    setDateFilterType(value);
    if (value !== "custom") setDateRange(null);
  };

  if (loading) return <LoadingModal />;
  if (error) return <Text type="danger">Error loading posts: {error.message}</Text>;

  return (
    <div style={{ maxWidth: '100%', padding: "16px" }}>
      <Title level={3} style={{ marginBottom: 24, padding: '0 16px' }}>Nhật ký hoạt động</Title>
      
      <div style={{ 
        padding: '0 16px 16px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 1
      }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              placeholder="Tìm kiếm trong nhật ký hoạt động"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ 
                flex: 1,
                borderRadius: 20,
                backgroundColor: '#f0f2f5',
                border: 'none'
              }}
            />
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setFilterVisible(!filterVisible)}
              style={{
                borderRadius: 20,
                backgroundColor: filterVisible ? '#e7f3ff' : '#f0f2f5',
                border: 'none',
                color: filterVisible ? '#1877f2' : 'inherit'
              }}
            />
          </div>
          
          {filterVisible && (
            <Card 
              style={{ 
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              bodyStyle={{ padding: 16 }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Select
                    defaultValue="all"
                    style={{ width: "100%" }}
                    onChange={handleDateFilterChange}
                    options={[
                      { value: 'all', label: 'Tất cả' },
                      { value: 'today', label: 'Hôm nay' },
                      { value: 'week', label: 'Tuần này' },
                      { value: 'month', label: 'Tháng này' },
                      { value: 'year', label: 'Năm nay' },
                      { value: 'custom', label: 'Tùy chọn' },
                    ]}
                  />
                </div>

                {dateFilterType === "custom" && (
                  <div style={{ marginTop: 8 }}>
                    <RangePicker 
                      style={{ width: "100%" }}
                      onChange={setDateRange}
                      format="DD/MM/YYYY"
                    />
                  </div>
                )}
                
                <Divider style={{ margin: "12px 0" }}/>
                
                <div>
                  <Select
                    mode="multiple"
                    placeholder="Chọn tags"
                    style={{ width: "100%" }}
                    onChange={setSelectedTags}
                    options={tags.map(tag => ({
                      value: tag.id,
                      label: tag.tagName,
                    }))}
                  />
                </div>

                <Button 
                  type="primary" 
                  block
                  style={{ marginTop: 16 }}
                  onClick={() => setFilterVisible(false)}
                >
                  Áp dụng
                </Button>
              </Space>
            </Card>
          )}
        </Space>
      </div>

      {Object.entries(groupedPosts).map(([date, posts]) => (
        <div key={date} style={{ marginBottom: 24, padding: '0 16px' }}>
          <Title level={4} style={{ marginBottom: 16 }}>{date}</Title>
          
          <List
            itemLayout="vertical"
            dataSource={posts}
            renderItem={(postData) => {
              const post = postData.post;
              const user = post.user || currentUser;
              
              return (
                <Card 
                  key={post.id}
                  style={{ 
                    marginBottom: 16, 
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                  bodyStyle={{ padding: 0 }}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  hoverable
                >
                  <div style={{ 
                    padding: 12, 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <Space>
                      <Avatar src={user?.avatar} icon={<UserOutlined />} />
                      <div>
                        <Text strong>{user.fullName}</Text>
                        <div style={{ fontSize: 12, color: "#65676b" }}>
                          {dayjs(post.creationDate).format('HH:mm')}
                          {post.status !== 'approved' && (
                            <span style={{ marginLeft: 8, color: "#faad14" }}>
                              ({post.status})
                            </span>
                          )}
                        </div>
                      </div>
                    </Space>
                    <Dropdown 
                      overlay={
                        <Menu>
                          <Menu.Item key="edit">Chỉnh sửa</Menu.Item>
                          <Menu.Item key="delete">Xóa</Menu.Item>
                        </Menu>
                      } 
                      trigger={['click']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button 
                        type="text" 
                        icon={<EllipsisOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>

                  <div style={{ padding: "0 12px 12px 12px" }}>
                    {post.title && (
                      <Title level={5} style={{ marginBottom: 8 }}>
                        {post.title}
                      </Title>
                    )}
                    
                    <Paragraph style={{ fontSize: 15, whiteSpace: "pre-line", marginBottom: 0 }}>
                      {post.content}
                    </Paragraph>
                    
                    {renderAttachment(postData.attachments)}
                    
                    {postData.taggables?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Space size={[0, 4]} wrap>
                          {postData.taggables.map(tag => (
                            <Tag key={tag.tag?.id || tag.id}>
                              {tag.tag?.tagName || tag.tagName}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </div>

                  <div 
                    style={{ 
                      padding: "8px 12px",
                      borderTop: "1px solid #f0f0f0",
                      display: "flex",
                      justifyContent: "flex-end"
                    }}
                  >
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/posts/${post.id}`);
                      }}
                    />
                  </div>
                </Card>
              );
            }}
          />
        </div>
      ))}

      {filteredPosts.length === 0 && (
        <Empty
          style={{ margin: "48px 16px" }}
        />
      )}
    </div>
  );
};

export default MyPostScreen;