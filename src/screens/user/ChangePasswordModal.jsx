import React, { useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, logOut } from "../../redux/auth/authSlice"; 
import { useNavigate } from "react-router-dom";

const ChangePasswordModal = ({ visible, onCancel, userHasPassword }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const navigate = useNavigate();

  // Giả sử bạn lấy user từ localStorage
  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const onFinish = async (values) => {
    try {
      // Tạo payload gồm email, newPassword và oldPassword (nếu có)
      const payload = {
        email: currentUser.email,
        newPassword: values.newPassword,
        oldPassword: userHasPassword ? values.oldPassword : "",
      };

      await dispatch(changePassword(payload)).unwrap();
      message.success(
        userHasPassword ? "Password changed successfully!" : "Password set successfully!"
      );
      // Bạn có thể xóa các token khác nếu cần, ví dụ: localStorage.removeItem("token");
      message.info("Please log in again with your new password.");
      dispatch(logOut());
      navigate("/auth/login");
    } catch (error) {
      console.error("Error changing password:", error);
      message.error(error.message || "Failed to change password");
    }
  };

  return (
    <Modal
      title={userHasPassword ? "Change Password" : "Set Password"}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {userHasPassword && (
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[{ required: true, message: "Please input your old password" }]}
          >
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please input your new password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmNewPassword"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("The two passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button className="continue-button" type="primary" htmlType="submit" block loading={loading}>
            {userHasPassword ? "Change Password" : "Set Password"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
