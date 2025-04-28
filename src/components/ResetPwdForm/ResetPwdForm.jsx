import { Form, Input, Button, Flex } from 'antd';
import { useState } from 'react';
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import { Typography } from 'antd';

const { Title, Text } = Typography;
const ResetPwdForm = ({ onFinishForm }) => {

    const [form] = Form.useForm();
    const [error, setError] = useState("");
    return (
        < Form form={form} layout="vertical" className="otp-box" onFinish={onFinishForm} >
            <Flex justify="center" align="center">
                <a href="/">
                    <img src={logo} alt="FCharity logo" width="110" height="50" />
                </a>
            </Flex>
            <Title level={3} className="otp-title">Reset password</Title>
            <Form.Item className='login-input'
                name="password"
                label='Password'
                style={{ textAlign: "left" }}
                rules={[
                    { required: true, message: "Password is required" }// Bắt buộc nhập
                ]}
            >
                <Input.Password
                    placeholder="Password"
                    className="password-input"
                />
            </Form.Item>
            <Form.Item className='login-input'
                name="confirmPassword"
                label='Confirm Password'
                style={{ textAlign: "left" }}
                rules={[
                    { required: true, message: "Confirm password is required" }// Bắt buộc nhập
                ]}
            >
                <Input.Password
                    placeholder="Confirm Password"
                    className="password-input"
                    onChange={(e) => {
                        const confirmPwd = e.target.value;
                        const pwd = form.getFieldValue('password');
                        if (pwd !== confirmPwd) {
                            setError("Password and Confirm Password do not match");
                        } else {
                            setError("");
                        }
                    }}
                />
            </Form.Item>
            {error && <Text type="danger">{error}</Text>}
            <Form.Item >
                <Button htmlType="submit" className="otp-button">
                    Reset password
                </Button>
            </Form.Item>
        </Form >
    )
};
export default ResetPwdForm;


