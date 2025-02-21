import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import { Form, Input, Button, Flex } from 'antd';
import { Typography } from 'antd';

const { Title, Text } = Typography;
const EmailForm = ({ onFinishForm }) => {
    return (
        <Form layout="vertical" className="otp-box" onFinish={onFinishForm}>
            <Flex justify="center" align="center">
                <a href="/">
                    <img src={logo} alt="FCharity logo" width="110" height="50" />
                </a>
            </Flex>
            <Title level={3} className="otp-title">Reset password</Title>
            <Form.Item
                label="Email Address"
                name="email"
                rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item >
                <Button htmlType="submit" className="otp-button">
                    Send OTP
                </Button>
            </Form.Item>
        </Form>
    )
}
export default EmailForm