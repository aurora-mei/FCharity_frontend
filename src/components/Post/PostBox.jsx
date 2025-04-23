import React from "react";
import { Card, Button, Typography, Tag } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const PostBox = ({ postData }) => {
  const { id, title, content, status, tags, createdAt } = postData;

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
        {tags && tags.length > 0 && (
          <div>
            {tags.map((tag) => (
              <Tag key={tag.id} color="blue">
                {tag.name}
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
