import { LikeOutlined, DislikeOutlined, MessageOutlined, GiftOutlined, ShareAltOutlined } from "@ant-design/icons";
import { Space, Button } from "antd";

export default function CommentActions() {
  return (
    <Space size="middle">
      {/* Like Button */}
      <Button type="text" icon={<LikeOutlined />} className="text-gray-400 hover:text-blue-500">
        67
      </Button>

      {/* Dislike Button */}
      <Button type="text" icon={<DislikeOutlined />} className="text-gray-400 hover:text-red-500" />

      {/* Reply Button */}
      <Button type="text" icon={<MessageOutlined />} className="text-gray-400 hover:text-gray-600">
        Reply
      </Button>

      {/* Award Button */}
      <Button type="text" icon={<GiftOutlined />} className="text-gray-400 hover:text-yellow-500">
        Award
      </Button>

      {/* Share Button */}
      <Button type="text" icon={<ShareAltOutlined />} className="text-gray-400 hover:text-gray-600">
        Share
      </Button>
    </Space>
  );
}
