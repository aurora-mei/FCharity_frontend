import React, { useState } from "react";
import { Input, Button, Typography, Flex, Form, Statistic } from "antd";
import "./OtpVerification.pcss";
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import store from "../../redux/store";
import { verifyEmail, sendOTPCode } from "../../redux/auth/authSlice";
import LoadingModal from "../LoadingModal/LoadingModal";
const { Title, Text } = Typography;
const { Countdown } = Statistic;
const deadline = Date.now() + 1000 * 60;
const OtpVerification = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState(useSelector((state) => state.auth.newUser.email) ?? "");
    const [sendOtp, setSendOtp] = useState(false);
    const [error, setError] = useState("");
    const loading = useSelector((state) => state.auth.loading);
    const sendOTPRequest = async (values) => {
        await dispatch(sendOTPCode(values)).unwrap();
        setEmail(values.email);
    }
    const verifyRequest = async (values) => {
        try {
            console.log("Form Values:", values);
            values.email = email;
            await dispatch(verifyEmail(values)).unwrap();
            const verified = store.getState().auth.verified;
            console.log("Verified:", verified);
            if (verified) navigate('/auth/login', { replace: true });
        } catch (error) {
            setError(error.message);
        };
    }
    const onFinishCountDown = () => {
        setError("OTP expired. Please request a new one.")
    }
    const resendOtpRequest = async () => {
        try {
            await dispatch(sendOTPCode(email)).unwrap();
            window.location.reload();
        } catch (error) {
            console.error("Resend failed:", error);
        }
    }
    if (loading) return <LoadingModal />;
    return (
        <div className="otp-container">
            {!email && <Form layout="vertical" className="otp-box" onFinish={sendOTPRequest}>
                <Form.Item
                    label="Email Address"
                    name="email"
                    rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
                    initialValue="huyenhyomin@gmail.com"
                >
                    <Input />
                    <Form.Item >
                        <Button htmlType="submit" className="otp-button">
                            Send OTP
                        </Button>
                    </Form.Item>
                </Form.Item>
            </Form>
            }
            {email && <Form layout="vertical" className="otp-box" onFinish={verifyRequest}>
                <Flex justify='center' align='center'>
                    <a href="/"> <img
                        src={logo}
                        alt="FCharity logo"
                        width="110"
                        height="50"
                    /></a>
                </Flex>
                <Title level={3} className="otp-title">Verify this email</Title>
                <Text className="otp-description">
                    Your safety is our top priority. Please enter the code we sent to {email}
                </Text>
                <Form.Item
                    name="verificationCode"
                    rules={[{ required: true, message: 'Please input your OTP!' },
                    { pattern: /^[0-9]{6}$/, message: 'Please input a valid OTP!' }
                    ]}
                >
                    <Input.OTP length={6} />
                </Form.Item>
                {error && <Text type="danger" className="otp-error">{error}</Text>}
                <Flex align="center" gap={4} className="otp-expiry">
                    <Text>This code will expire in</Text>
                    <Countdown
                        value={deadline}
                        onFinish={onFinishCountDown}
                        format="mm:ss"
                        className="small-countdown"
                    />
                    <Text>.</Text>
                </Flex>

                <div className="otp-links">
                    <a onClick={resendOtpRequest}>Click here to resend code</a>
                </div>
                <Form.Item >
                    <Button htmlType="submit" className="otp-button">
                        Verify
                    </Button>
                </Form.Item>
            </Form>}
        </div>
    );
};

export default OtpVerification;
