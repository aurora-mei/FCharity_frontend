import { Flex } from "antd";
import "./LoginForm.pcss";
import { Button, Form, Input, Select, Divider } from "antd";
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import { Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import LoadingModal from "../LoadingModal/LoadingModal";
import { useNavigate } from "react-router-dom";
import useLoading from "../../hooks/useLoading";
import { useSelector, useDispatch } from "react-redux";
import { logIn, getCurrentUser } from "../../redux/auth/authSlice";
const { Title, Text } = Typography;

const LoginForm = () => {
  const loadingUI = useLoading();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const loginRequest = async (values) => {
    await dispatch(logIn(values)).unwrap();
    await dispatch(getCurrentUser()).unwrap();
    navigate("/", { replace: true });
  };
  if (loadingUI || loading) return <LoadingModal />;
  return (
    <div className="container-login">
      <div className="login-box">
        <Flex justify="center" align="center">
          <a href="/">
            {" "}
            <img src={logo} alt="FCharity logo" width="110" height="50" />
          </a>
        </Flex>
        <Title level={2} style={{ lineHeight: "1" }} className="title">
          Welcome
        </Title>
        <p className="subtitle">Log in to FCharity to continue.</p>
        <Button icon={<GoogleOutlined />} className="login-button" block>
          Continue with Google
        </Button>
        <Divider>or</Divider>
        <Form layout="vertical" onFinish={loginRequest}>
          {/* Email Input */}
          <Form.Item
            className="login-input"
            name="email"
            style={{ textAlign: "left" }}
            rules={[
              { required: true, message: "Email Address is required" }, // Bắt buộc nhập
              { type: "email", message: "Invalid email format" }, // Kiểm tra định dạng email
            ]}
          >
            <Input
              placeholder="Email Address"
              className="email-input"
              type="email"
            />
          </Form.Item>

          {/* Password Input */}
          <Form.Item
            className="login-input"
            name="password"
            style={{ textAlign: "left" }}
            rules={[
              { required: true, message: "Password is required" }, // Bắt buộc nhập
            ]}
          >
            <Input.Password placeholder="Password" className="password-input" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button htmlType="submit" block className="continue-button">
              Continue
            </Button>
          </Form.Item>
        </Form>

        <p className="sub-ending">
          First time with FCharity?{" "}
          <a href="/auth/signup" className="sub-title">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};
export default LoginForm;
