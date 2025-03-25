import React, { useEffect, useState } from "react";
import { Layout, Card, Avatar, Button, Spin, Typography, Tabs, Space } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import ChangeProfileModal from "../../components/ChangeProfileForm/ChangeProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";

const { Content, Header } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MyProfileScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user from localStorage and backend
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (err) {
        console.error("Error parsing currentUser:", err);
      }
    }
    if (!storedUser) {
      dispatch(getCurrentUser())
        .unwrap()
        .then((data) => {
          setCurrentUser(data);
          localStorage.setItem("currentUser", JSON.stringify(data));
        })
        .catch((err) => {
          console.error("Failed to get current user:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  if (loading || !currentUser) {
    return (
      <Spin
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      />
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          padding: "0 24px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          My Profile
        </Title>
      </Header>
      <Content style={{ margin: "24px", padding: 24 }}>
        <Card
          style={{ maxWidth: 800, margin: "0 auto" }}
          bodyStyle={{ display: "flex", gap: "2rem" }}
          bordered={false}
          actions={[
            <Space key="actions">
              <Button
                type="primary"
                className="continue-button"
                onClick={() => setModalVisible(true)}
              >
                <EditOutlined /> Edit Profile
              </Button>
              
              {currentUser.password !== null && (
                <Button
                  className="continue-button"
                  onClick={() => setPwdModalVisible(true)}
                >
                  Change Password
                </Button>
              )}
            </Space>
            ,
          ]}
        >
          {/* Avatar and Basic Info */}
          <div style={{ minWidth: 200, textAlign: "center" }}>
            <Avatar
              size={120}
              src={currentUser.avatar}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <Title level={4} style={{ marginBottom: 0 }}>
              {currentUser.fullName}
            </Title>
          </div>
          {/* Tabs for additional details */}
          <div style={{ flex: 1 }}>
            <Tabs defaultActiveKey="details">
              <TabPane tab="Personal details" key="details">
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <div>
                    <Text strong>Email:</Text> {currentUser.email}
                  </div>
                  <div>
                    <Text strong>Phone:</Text> {currentUser.phoneNumber || "N/A"}
                  </div>
                  <div>
                    <Text strong>Address:</Text> {currentUser.address || "N/A"}
                  </div>
                </Space>
              </TabPane>
              <TabPane tab="Settings" key="settings">
                <Text>Here goes user settings ...</Text>
              </TabPane>
            </Tabs>
          </div>
        </Card>
      </Content>

      {/* Change Profile Modal */}
      <ChangeProfileModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={pwdModalVisible}
        onCancel={() => setPwdModalVisible(false)}
      />
    </Layout>
  );
};

export default MyProfileScreen;
