import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Layout, List, Typography, Avatar, Space, Tag } from "antd";
import {
  MessageOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const RightSidebar = () => {
  const navigate = useNavigate();
  const recentPosts = useSelector((state) => state.post?.recentPosts || []);

  return (
    <Layout.Sider
      width={260}
      style={{
        background: "#fff",
        padding: "16px",
        marginLeft: "20px"
      }}
    >
      <Title level={4} style={{ marginBottom: 16 }}>
        Recent Posts
      </Title>

      <List
        dataSource={recentPosts}
        renderItem={(postResponse) => {
          const { post, attachments = [], taggables = [], vote } = postResponse;

      

          return (
            <RecentPostItem
              key={post.id}
              post={post}
              attachments={attachments}
              taggables={taggables}
              commentCount={postResponse.commentCount}
              navigate={navigate}
            />
          );
        }}
      />
    </Layout.Sider>
  );
};

// ✅ Component con để dùng useState & useEffect
const RecentPostItem = ({ post, attachments, taggables, commentCount, navigate }) => {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const imageAttachment = attachments.find((att) =>
      att.match(/\.(jpg|jpeg|png|gif)$/i)
    );
    const videoAttachment = attachments.find((att) =>
      att.match(/\.(mp4|webm)$/i)
    );

    if (imageAttachment) {
      setThumbnail(imageAttachment);
    } else if (videoAttachment) {
      const video = document.createElement("video");
      video.src = videoAttachment;
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
    }
  }, [attachments]);

  return (
    <List.Item
      key={post.id}
      onClick={() => navigate(`/posts/${post.id}`)}
      style={{
        padding: 12,
        alignItems: "flex-start",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ flex: 1 }}>
        {taggables.map((tag) => (
          <Tag
            key={tag.id}
            color="white"
            style={{
              border: "1px solid #ccc",
              marginBottom: 4,
              color: "#555",
            }}
          >
            r/{tag.tag.tagName}
          </Tag>
        ))}

        <Title level={5} style={{ margin: "4px 0" }}>
          {post.title}
        </Title>

        <Space size="small">
          <Text strong style={{ fontSize: 13 }}>
            {post.vote || 0} upvote
          </Text>
          <MessageOutlined style={{ color: "#999" }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {commentCount || 0}
          </Text>
        </Space>
      </div>

      {thumbnail && (
        <Avatar
          shape="square"
          size={64}
          src={thumbnail}
          icon={<PictureOutlined />}
        />
      )}
    </List.Item>
  );
};

export default RightSidebar;
