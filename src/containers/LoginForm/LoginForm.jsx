import { Flex } from 'antd';
import './LoginForm.pcss';
import { Button, Form, Input, Select, Space } from 'antd';
const { Option } = Select;
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};
const LoginForm = () => {
    const [form] = Form.useForm();
    return (
        <Flex className="login-form" justify="center" align="center">
            <Form
                form={form}
                name="control-hooks"
                style={{
                    maxWidth: 600, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: 20, borderRadius: 10, border: '1px solid #eee', backgroundColor: 'white'
                }}
            >
                <Form.Item
                    name="note"
                    label="Note"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="gender"
                    label="Gender"
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >

                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" >
                            Reset
                        </Button>
                        <Button type="link" htmlType="button" >
                            Fill form
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Flex>
    )
}
export default LoginForm;