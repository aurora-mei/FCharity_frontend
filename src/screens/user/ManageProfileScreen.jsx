import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Menu, Button, theme } from "antd";
import { UserOutlined, HistoryOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import MyProfileScreen from "./MyProfileScreen";  // Component hiển thị thông tin người dùng
import MyRequestScreen from "../request/MyRequestScreen";  // Component hiển thị danh sách yêu cầu

const { Header, Sider, Content } = Layout;

const ManageProfileScreen = () => {
  const navigate = useNavigate();
  const { keyTab } = useParams(); // Giá trị truyền qua URL: "profile" hoặc "myrequests"
  
  // Nếu không có keyTab, mặc định hiển thị MyProfileScreen
  const initialTab = keyTab || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Danh sách menu với key, icon, label và component tương ứng
  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      component: MyProfileScreen,
    },
    {
      key: "myrequests",
      icon: <HistoryOutlined />,
      label: "My Requests",
      component: MyRequestScreen,
    },
  ];

  // Khi keyTab thay đổi trong URL, cập nhật activeTab
  useEffect(() => {
    if (keyTab && (keyTab === "profile" || keyTab === "myrequests")) {
      setActiveTab(keyTab);
    }
  }, [keyTab]);

  // Tìm component tương ứng với activeTab
  const ActiveComponent = menuItems.find((item) => item.key === activeTab)?.component;

  return (
    <Layout style={{ padding: "1rem 6rem", borderRadius: 10, minHeight: "100vh" }}>
      {/* Sidebar Menu */}
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ height: "100vh" }}
      >
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: collapsed ? 16 : 20,
          }}
        >
          {collapsed ? "FCharity" : "FCharity User Dashboard⭐"}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={({ key }) => {
            setActiveTab(key);
            navigate(`/user/manage-profile/${key}`);
          }}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </Sider>

      {/* Main Content */}
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            borderRadius: "0 10px 10px 0",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
        </Header>
        <Content
          style={{
            margin: "1rem 0 0 1rem",
            overflow: "initial",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {ActiveComponent && <ActiveComponent />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManageProfileScreen;
