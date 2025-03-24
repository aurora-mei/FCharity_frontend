import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    UserOutlined, VideoCameraOutlined, UploadOutlined,
    BarChartOutlined, CloudOutlined, AppstoreOutlined,
    TeamOutlined, ShopOutlined, MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import MyRequestScreen from '../request/MyRequestScreen';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

// Component giả lập nội dung
const Profile = () => <div>Profile Content</div>;
const Uploads = () => <div>Uploads Content</div>;
const Analytics = () => <div>Analytics Content</div>;
const Cloud = () => <div>Cloud Content</div>;
const Apps = () => <div>Apps Content</div>;
const Teams = () => <div>Teams Content</div>;
const Shop = () => <div>Shop Content</div>;

// Danh sách menu
const items = [
    { key: '1', icon: <UserOutlined />, label: 'Profile', component: Profile },
    { key: '2', icon: <VideoCameraOutlined />, label: 'My Requests', component: MyRequestScreen },
    { key: '3', icon: <UploadOutlined />, label: 'Uploads', component: Uploads },
    { key: '4', icon: <BarChartOutlined />, label: 'Analytics', component: Analytics },
    { key: '5', icon: <CloudOutlined />, label: 'Cloud', component: Cloud },
    { key: '6', icon: <AppstoreOutlined />, label: 'Apps', component: Apps },
    { key: '7', icon: <TeamOutlined />, label: 'Teams', component: Teams },
    { key: '8', icon: <ShopOutlined />, label: 'Shop', component: Shop }
];

const ManageProfileScreen = () => {
    const navigate = useNavigate();
    const { keyTab } = useParams();  // Lấy giá trị từ URL
    const mapTab = {
        profile: "1",
        myrequests: "2",
        uploads: "3",
        analytics: "4"
    };

    // State điều khiển tab hiện tại
    const [activeTab, setActiveTab] = useState(mapTab[keyTab] || '1'); // Mặc định là "My Requests"
    const [collapsed, setCollapsed] = useState(false);

    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    // Chỉ chạy 1 lần khi vào trang, đặt giá trị từ keyTab (nếu có)
    useEffect(() => {
        if (mapTab[keyTab]) {
            setActiveTab(mapTab[keyTab]);
        }
    }, [keyTab]);  // Không thêm `mapTab` vì nó không thay đổi

    // Tìm component tương ứng với tab hiện tại
    const ActiveComponent = items.find(item => item.key === activeTab)?.component || null;

    return (
        <Layout style={{ padding: "1rem 6rem", borderRadius: 10 }}>
            {/* Sidebar */}
            <Sider theme="light" trigger={null} collapsible collapsed={collapsed} style={{ height: '100vh' }}>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[activeTab]}
                    onClick={({ key }) => {
                        const tabName = Object.keys(mapTab).find(k => mapTab[k] === key);
                        if (tabName) {
                            navigate(`/user/manage-profile/${tabName}`);
                        }
                        setActiveTab(key); // Đổi activeTab theo key
                    }}
                     // Click menu thì đổi tab
                    items={items}
                />
            </Sider>

            {/* Main Content */}
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                        borderRadius: "0 10px 10px 0"
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
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
                    {ActiveComponent && <ActiveComponent />}
                </Content>
            </Layout>
        </Layout>
    );
};

export default ManageProfileScreen;
