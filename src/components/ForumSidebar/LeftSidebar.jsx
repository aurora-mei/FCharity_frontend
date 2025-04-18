import React from "react";
import { Layout, List, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;
const { Title } = Typography;

const LeftSidebar = () => {
  const navigate = useNavigate();
  
  const tags = [
    "Hurricane",
"Environmental Disaster",
"Food Shortage",
"Wildfire",
"Homeless Support",
"Animal Rescue",
"Community Crisis",
"Infrastructure Damage",
"Earthquake",
"Accident Relief",
"Flood",
"Medical Emergency",
"Refugee Crisis",
"Drought",
"Education Support",
"Water Crisis",
"Pandemic",
"Tornado",
  ];

  const handleTagClick = (tag) => {
    // Chuyển đến route mới với query param tag
    navigate(`/posts?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <Sider width={260} style={{ background: "#fff", padding: "16px", marginRight: "20px" }}>
      <Title level={4} style={{ marginTop: "20px" }}>r/tags</Title>
      <List
        dataSource={tags}
        renderItem={(item) => (
          <List.Item 
            style={{ padding: "10px", cursor: "pointer" }}
            onClick={() => handleTagClick(item)}
          >
            {item}
          </List.Item>
        )}
      />
    </Sider>
  );
};

export default LeftSidebar;