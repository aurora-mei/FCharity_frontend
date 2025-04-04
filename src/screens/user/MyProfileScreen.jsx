import React, { useEffect, useRef, useState } from "react";
import { Layout, Card, Avatar, Button, Spin, Typography, Tabs, Space, message } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { getCurrentUser, updateProfile } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import ChangeProfileModal from "../../components/ChangeProfileForm/ChangeProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import { uploadFileHelper } from "../../redux/helper/helperSlice";

const { Content, Header } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MyProfileScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Lấy user từ localStorage hoặc backend
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

  const handleAvatarButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Sửa phần xử lý upload avatar sử dụng helper đúng cách
  const handleAvatarFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploading(true);

    try {
        // Gọi `uploadFileHelper` giống như `handleImageChange`
        const response = await dispatch(uploadFileHelper({ file, folderName: "images" })).unwrap();
        const newAvatarUrl = response.url || response; // Kiểm tra nếu API trả về object có `url`

        console.log("Sending update profile request with:", { ...currentUser, avatar: newAvatarUrl });

        // Gửi request cập nhật avatar
        await dispatch(updateProfile({ ...currentUser, avatar: newAvatarUrl })).unwrap();

        message.success("Avatar updated successfully!");

        // ✅ Cập nhật localStorage
        const updatedUser = { ...currentUser, avatar: newAvatarUrl };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));

        // 🔄 **Cập nhật state để re-render**
        setCurrentUser(updatedUser);
        
    } catch (error) {
        console.error("Error updating avatar:", error);
        message.error("Failed to update avatar");
    } finally {
        setUploading(false);
    }
};


  // Hàm kiểm tra xem user có mật khẩu hay không: trả về true nếu mật khẩu hợp lệ (khác null, undefined hoặc chuỗi rỗng)
  const userHasPassword = currentUser && currentUser.password && currentUser.password.trim() !== "";

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
                onClick={() => setProfileModalVisible(true)}
              >
                <EditOutlined /> Edit Profile
              </Button>,
              <Button
                className="continue-button"
                onClick={() => setPwdModalVisible(true)}
              >
                {userHasPassword ? "Change Password" : "Set Password"}
              </Button>
            </Space>,
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
            <Button type="link" onClick={handleAvatarButtonClick} loading={uploading}>
              {uploading ? "Uploading..." : "Change Avatar"}
            </Button>
            {/* Hidden file input for avatar upload */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleAvatarFileChange}
            />
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
        visible={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        visible={pwdModalVisible}
        onCancel={() => setPwdModalVisible(false)}
        userHasPassword={userHasPassword}
      />
    </Layout>
  );
};

export default MyProfileScreen;
