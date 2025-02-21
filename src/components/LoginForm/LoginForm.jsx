import { Flex } from 'antd';
import { Button, Form, Input, Divider } from 'antd';
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import { Typography } from 'antd';
import LoadingModal from "../LoadingModal";
import { useNavigate } from 'react-router-dom';
import useLoading from "../../hooks/useLoading";
import { useSelector, useDispatch } from 'react-redux';
import { logIn, getCurrentUser, googleLogIn } from '../../redux/auth/authSlice';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const { Title, Text } = Typography;

const clientId = "311913084609-l3u4pfcs7a8l3vuu7p27c63o3t09f6bn.apps.googleusercontent.com";

const LoginForm = () => {
    const loadingUI = useLoading();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);

    const loginRequest = async (values) => {
        try {
            await dispatch(logIn(values)).unwrap();
            await dispatch(getCurrentUser()).unwrap();
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message);
        }
    };

    const handleGoogleSuccess = async (response) => {
        console.log("Google login success:", response);

        try {
            await dispatch(googleLogIn(response.credential)).unwrap();
            await dispatch(getCurrentUser()).unwrap();
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Google login error:", error);
            alert(error.message);
        }
    };

    const handleGoogleFailure = (error) => {
        console.log("Google login failed:", error);
        alert("Google login failed!");
    };

    if (loadingUI || loading) return <LoadingModal />;

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="container-login">
                <div className="login-box">
                    <Flex justify='center' align='center'>
                        <a href="/"> <img
                            src={logo}
                            alt="FCharity logo"
                            width="110"
                            height="50"
                        /></a>
                    </Flex>
                    <Title level={2} style={{ lineHeight: '1' }} className="title">
                        Welcome
                    </Title>
                    <p className="subtitle">Log in to FCharity to continue.</p>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                    />
                    <Divider>or</Divider>
                    <Form layout="vertical" onFinish={loginRequest}>
                        {/* Email Input */}
                        <Form.Item className='login-input'
                            name="email"
                            style={{ textAlign: "left" }}
                            rules={[
                                { required: true, message: "Email Address is required" }, // Bắt buộc nhập
                                { type: "email", message: "Invalid email format" } // Kiểm tra định dạng email
                            ]}
                        >
                            <Input
                                placeholder="Email Address"
                                className="email-input"
                                type="email"
                            />
                        </Form.Item>

                        {/* Password Input */}
                        <Form.Item className='login-input'
                            name="password"
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
                        <div className='sub-title-div'>
                            <a href="/auth/otp-reset-password" className="sub-title-a">Forgot your password?</a>
                        </div>

                        {/* Submit Button */}
                        <Form.Item>
                            <Button htmlType="submit" block className="continue-button">
                                Sign in
                            </Button>
                        </Form.Item>
                    </Form>

                    <p className='sub-ending'>
                        First time with FCharity? <a href="/auth/signup" className="sub-title">Sign up</a>
                    </p>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginForm;