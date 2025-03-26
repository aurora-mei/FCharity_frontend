import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { changePassword } from "../../redux/auth/authSlice";

const ChangePasswordModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
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
        email: storedUser.email, // Gửi email
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };
  
      await dispatch(changePassword(payload)).unwrap();
      message.success("✅ Password changed successfully!");
      onCancel();
    } catch (error) {
      message.error(error.response?.data?.message || "❌ Change password failed!");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Modal
      title="Change Password"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={[{ required: true, message: "Please enter your old password" }]}
        >
          <Input.Password placeholder="Enter old password" />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("oldPassword") !== value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("New password must be different from old password")
                );
              },
            }),
          ]}
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
          <Button
            className="continue-button"
            type="primary"
            htmlType="submit"
            block
            loading={loading}
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
