import React, { useState } from "react";
import { Form, Input, Button, Typography, Flex, Statistic } from "antd";
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
const { Title, Text } = Typography;
const { Countdown } = Statistic;

const OTPForm = ({ deadline, onFinishForm, onFinishCountDown, onResendOTPCode, error, email }) => {
    const [form] = Form.useForm();
    const [showResendLink, setShowResendLink] = useState(false);
    const handleCountdownFinish = () => {
        setShowResendLink(true);
        if (onFinishCountDown) onFinishCountDown();
    };
    return (
        <Form layout="vertical" className="otp-box" form={form} onFinish={onFinishForm}>
            <Flex justify="center" align="center">
                <a href="/">
                    <img src={logo} alt="FCharity logo" width="110" height="50" />
                </a>
            </Flex>
            <Title level={3} className="otp-title">Verify this email</Title>
            <Text className="otp-description">
                Your safety is our top priority. Please enter the code we sent to {email}
            </Text>
            <Form.Item
                name="verificationCode"
                rules={[
                    { required: true, message: "Please input your OTP!" },
                    { pattern: /^[0-9]{6}$/, message: "Please input a valid OTP!" },
                ]}
            >
                <Input.OTP length={6} />
            </Form.Item>
            {error && <Text type="danger" className="otp-error">{error}</Text>}
            <Flex align="center" gap={4} className="otp-expiry">
                <Text>This code will expire in</Text>
                <Countdown value={deadline} onFinish={handleCountdownFinish} format="mm:ss" className="small-countdown" />
                <Text>.</Text>
            </Flex>
            {showResendLink && (
                <div className="otp-links">
                    <a onClick={onResendOTPCode}>Click here to resend code</a>
                </div>
            )}

            <Form.Item>
                <Button htmlType="submit" className="otp-button">
                    Verify
                </Button>
            </Form.Item>
        </Form>
    );
};

export default OTPForm;
