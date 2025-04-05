import React, { useEffect, useRef, useState } from "react";
import { Layout, Card, Avatar, Button, Spin, Typography, Tabs, Space, message,Flex  } from "antd";
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
      // Sử dụng uploadFileHelper với đối tượng chứa file và folderName
      const result = await dispatch(
        uploadFileHelper({ file, folderName: "images" })
      ).unwrap();

      // Nếu helper trả về URL trực tiếp
      const newAvatarUrl = result;

      console.log("Sending update profile request with:", { ...currentUser, avatar: newAvatarUrl });

      await dispatch(updateProfile({ ...currentUser, avatar: newAvatarUrl })).unwrap();

      message.success("Avatar updated successfully!");

      // Cập nhật localStorage với avatar mới
      const updatedUser = { ...currentUser, avatar: newAvatarUrl };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Refresh UI (có thể thay bằng setCurrentUser(updatedUser) nếu muốn tránh reload toàn trang)
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
    <>
     <Content style={{ }}>
        <Card
          style={{ maxWidth: "100%", margin: "0 auto",padding:"1rem" }}
          bodyStyle={{ display: "flex", gap: "2rem" }}
          bordered={false}
          actions={[
              <Flex key="action" vertical gap={10} justify="flex-start" align="flex-start" style={{ width: "100%", padding:"1rem", borderRadius:"1rem" }} >
                <Title level={5} style={{ marginBottom: 0 }}>Privacy</Title>
                <hr style={{ width: "100%", margin: "0.5rem 0" }} />
                <Flex vertical gap={10} style={{ width: "100%" }} >
                  <Flex justify="space-between">
                    <Text strong>Edit Profile</Text>
                    <Button
                      type="primary"
                      className="continue-button"
                      onClick={() => setProfileModalVisible(true)}
                    >
                      <EditOutlined /> Edit Profile
                    </Button>
                  </Flex>
                  <Flex justify="space-between">
                  <Text strong>Modify password</Text>
                    <Button
                      className="continue-button"
                      onClick={() => setPwdModalVisible(true)}
                    >
                      {userHasPassword ? "Change Password" : "Set Password"}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
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
    </>
  );
};

export default MyProfileScreen;
