import { Layout, Row, Col, Typography, Space } from "antd";

const { Footer } = Layout;
const { Text, Title } = Typography;

const AppFooter = () => {

    return (
        <Footer style={{ backgroundColor: "white", color: "black", border: '1px solid black', padding: '3rem 10rem' }}>
            <Row gutter={[16]} justify="center">
                <Col xs={24} sm={12} md={8}>
                    <Title level={4} style={{ color: "black" }}>FCharity</Title>
                    <Text style={{ color: "#181818" }}>
                        Address: 123 ABC Street, XYZ District, Ho Chi Minh City
                    </Text>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Title level={4} style={{ color: "black" }}>Contact</Title>
                    <Space direction="vertical">
                        <Text style={{ color: "#181818" }}>Email: contact@abc.com</Text>
                        <Text style={{ color: "#181818" }}>Phone: 0123 456 789</Text>
                    </Space>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Title level={4} style={{ color: "black" }}>Social Media</Title>
                    <Space direction="vertical">
                        <Text style={{ color: "#181818" }}>Facebook: fb.com/abc</Text>
                        <Text style={{ color: "#181818" }}>Twitter: twitter.com/abc</Text>
                    </Space>
                </Col>
            </Row>
            <Row justify="center" style={{ marginTop: 60 }}>
                <Text style={{ color: "#181818" }}>© 2025 ABC Ltd. All rights reserved.</Text>
            </Row>
        </Footer>

    );
};

export default AppFooter;
