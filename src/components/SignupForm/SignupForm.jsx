import React from "react";
import { Form, Input, Button, Checkbox, Typography, Flex } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import LoadingModal from "../LoadingModal"; // Import LoadingScreen
import useLoading from "../../hooks/useLoading"; // Import useLoading hook
import PasswordRequirement from "../PasswordRequirement/PasswordRequirement";
import { useSelector, useDispatch } from 'react-redux'
import { signUp } from '../../redux/auth/authSlice';
import { useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

const SignupForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loadingUI = useLoading(); // Gọi hook kiểm soát trạng thái loading
    const loading = useSelector((state) => state.auth.loading);
    const onFinish = async (values) => {
        try {
            console.log("Form Values:", values);
            await dispatch(signUp(values)).unwrap(); // unwrap() để xử lý Promise từ createAsyncThunk
            navigate('/auth/otp-verification', { replace: true });
        } catch (error) {
            console.error("Sigup error:", error);
            alert(error.message);
        }
    };

    if (loadingUI || loading) return <LoadingModal />;
    return (
        <div className="upper-container">
            <div className="container-signup">
                <div className="signup-form">
                    <div className="signup-header">
                        <Flex justify='center' align='center'>
                            <a href="/"> <img
                                src={logo}
                                alt="FCharity logo"
                                width="110"
                                height="50"
                            /></a>
                        </Flex>
                        <Title level={3} style={{ lineHeight: '1' }} className="title">
                            Create an account
                        </Title>
                        <p className="subtitle">
                            Already have an account? <a href="/auth/login" className="sub-title">Sign in</a>
                        </p>
                    </div>
                    <Form layout="vertical" onFinish={onFinish}>
                        <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Full Name is required" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                    rules={[
        { required: true, message: "Password is required" },
        { min: 8, message: "Password must be at least 8 characters" },
        {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            message: "Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)"
        }
    ]}
>
    <Input.Password
        iconRender={(visible) =>
            visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
        }
    />
</Form.Item>

                        <PasswordRequirement />
                        <Form.Item>
                            <Checkbox>Receive tips and updates about fundraisers</Checkbox>
                        </Form.Item>

                        <Form.Item >
                            <Button htmlType="submit" block className="continue-button">
                                Sign up
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
