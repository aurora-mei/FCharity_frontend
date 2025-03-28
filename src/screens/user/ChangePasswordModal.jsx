import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { changePassword, logOut } from "../../redux/auth/authSlice"; // import logOut action if available
import { useNavigate } from "react-router-dom";

const ChangePasswordModal = ({ visible, onCancel, userHasPassword }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!storedUser || !storedUser.email) {
        message.error("User email not found, please login again.");
        return;
      }

      const payload = {
        email: storedUser.email,
        oldPassword: userHasPassword ? values.oldPassword : null, // Set to null if no existing password
        newPassword: values.newPassword,
      };

      await dispatch(changePassword(payload)).unwrap();
      message.success("✅ Password changed successfully! Please login again.");

      // Log out the user and redirect to login page
      dispatch(logOut());
      navigate("/auth/login", { replace: true });
      
      // Optionally, you can also call onCancel() if you want to close the modal before redirecting.
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.message || "❌ Change password failed!");
    } finally {
      setLoading(false);
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
      <Form form={form} onFinish={onFinish} layout="vertical">
        {userHasPassword && (
          <Form.Item
            label="Old Password"
            name="oldPassword"
            rules={[{ required: true, message: "Please enter your old password" }]}
          >
            <Input.Password placeholder="Enter old password" />
          </Form.Item>
        )}

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: "Please enter your new password" }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("The two passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm new password" />
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
