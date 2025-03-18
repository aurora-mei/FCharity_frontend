import React from "react";
import { Layout, List, Typography } from "antd";

const { Sider } = Layout;
const { Title } = Typography;

const LeftSidebar = () => (
    <Sider width={250} style={{ background: "#fff", padding: "20px", marginRight: "20px" }}>
        <List
            dataSource={["Popular", "Explore", "All"]}
            renderItem={(item) => <List.Item style={{ padding: "10px", cursor: "pointer" }}>{item}</List.Item>}
        />
        <Title level={4} style={{ marginTop: "20px" }}>Communities</Title>
        <List
            dataSource={["Wildfire", "Flood", "Earthquake", "Hurricane", "Tornado", "Drought", "Pandemic", "Medical Emergency", "Refugee Crisis", "Food Shortage"]}
            renderItem={(item) => <List.Item style={{ padding: "10px", cursor: "pointer" }}>{item}</List.Item>}
        />
    </Sider>
);

export default LeftSidebar;
