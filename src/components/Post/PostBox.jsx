import React from "react";
import { Card, Button, Typography, Tag } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const PostBox = ({ postData }) => {
  const { post, taggables, attachments } = postData;
  const {id,content,createdAt,title,vote,postStatus} = post;

  // Render post status badge
  const statusColor = {
    all: "blue",
    pending: "orange",
    approved: "green",
    rejected: "red",
  };

  return (
    <Card
      title={<Title level={4}>{title}</Title>}
      bordered={false}
      style={{ width: 300 }}
      extra={
        <Tag color={statusColor[status] || "default"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      }
    >
      <Text>{content.length > 100 ? content.slice(0, 100) + "..." : content}</Text>
      <div style={{ marginTop: "10px" }}>
        <span>Created on: {new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <div style={{ marginTop: "10px" }}>
        {taggables && taggables.length > 0 && (
          <div>
            {taggables.map((taggable) => (
              <Tag key={taggable.tag.id} color="blue">
                {taggable.tag.name}
              </Tag>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: "10px" }}>
        <Link to={`/posts/${id}`}>
          <Button type="primary">View Details</Button>
        </Link>
      </div>
    </Card>
  );
};

export default PostBox;
