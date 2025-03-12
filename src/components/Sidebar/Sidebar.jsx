import React from "react";
import { Layout, List, Typography } from "antd";

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = () => {
    return (
        <Sider width={250} style={{ background: "#fff", padding: "20px" }}>
            <List dataSource={["Popular", "Explore", "All"]} renderItem={(item) => <List.Item>{item}</List.Item>} />
            <Title level={4} style={{ marginTop: "20px" }}>Communities</Title>
            <List
                dataSource={["Wildfire", "Flood", "Earthquake", "Hurricane", "Tornado", "Drought", "Pandemic"]}
                renderItem={(item) => <List.Item>{item}</List.Item>}
            />
        </Sider>
    );
};

export default Sidebar;
