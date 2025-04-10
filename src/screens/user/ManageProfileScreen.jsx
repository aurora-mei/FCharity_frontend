import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Layout, Menu, Button, theme } from "antd";
import {
  UserOutlined,
  HistoryOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WalletOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const ManageProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
    },
    {
      key: "mywallet",
      icon: <WalletOutlined />,
      label: "My Wallet",
    },
    {
      key: "myrequests",
      icon: <HistoryOutlined />,
      label: "My Requests",
    },
    {
      key: "invitations",
      icon: <HistoryOutlined />,
      label: "Invitations",
    },
  ];

  // Lấy tab hiện tại từ URL
  const currentKey = location.pathname.split("/").pop();

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
          selectedKeys={[currentKey]}
          onClick={({ key }) => {
            navigate(`/user/manage-profile/${key}`);
          }}
          items={menuItems}
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
            overflow: "initial",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManageProfileScreen;
