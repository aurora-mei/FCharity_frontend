import React, { useState } from 'react';
import {
    AppstoreOutlined,
    BarChartOutlined,
    CloudOutlined,
    ShopOutlined,
    TeamOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
    MenuFoldOutlined, 
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import MyRequestScreen from '../request/MyRequestScreen';

const { Header, Sider, Content } = Layout;

const siderStyle = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    borderRadius: "10px 0 10px 10px"
};

// Danh sách menu
const items = [
    { key: '1', icon: <UserOutlined />, label: 'Profile' },
    { key: '2', icon: <VideoCameraOutlined />, label: 'My Requests' },
    { key: '3', icon: <UploadOutlined />, label: 'Uploads' },
    { key: '4', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '5', icon: <CloudOutlined />, label: 'Cloud' },
    { key: '6', icon: <AppstoreOutlined />, label: 'Apps' },
    { key: '7', icon: <TeamOutlined />, label: 'Teams' },
    { key: '8', icon: <ShopOutlined />, label: 'Shop' }
];

const ManageProfileScreen = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('2'); // Mặc định mở "My Requests"
    
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    return (
        <Layout style={{ padding: "1rem 6rem", borderRadius: 10 }}>
            {/* Sidebar */}
            <Sider theme="light" trigger={null} collapsible collapsed={collapsed} style={siderStyle}>
                <div className="demo-logo-vertical" />
                <Menu 
                    theme="light" 
                    mode="inline" 
                    defaultSelectedKeys={['2']} // Mặc định chọn "My Requests"
                    onClick={({ key }) => setActiveTab(key)} 
                    items={items} 
                />
            </Sider>

            {/* Main Content */}
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        borderRadius: "0 10px 10px 0 "
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>

                <Content
                    style={{
                        margin: '1rem 0 0 1rem',
                        overflow: 'initial',
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {activeTab === '2' && <MyRequestScreen />}
                </Content>
            </Layout>
        </Layout>
    );
};

export default ManageProfileScreen;
