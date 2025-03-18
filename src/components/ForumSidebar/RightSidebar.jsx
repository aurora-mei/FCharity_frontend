import React from "react";
import { Layout, List, Typography, Avatar } from "antd";

const { Title, Text } = Typography;
const posts = [
    {
        title: "Introduction to React",
        content: "React is a JavaScript library for building user interfaces...",
        vote: 120
    },
    {
        title: "Understanding Redux",
        content: "Redux helps manage state in React applications...",
        vote: 95
    },
    {
        title: "React vs Vue: Which One to Choose?",
        content: "Both React and Vue are popular front-end frameworks...",
        vote: 75
    },
    {
        title: "Mastering JavaScript ES6+ Features",
        content: "Modern JavaScript introduces many powerful features like arrow functions, async/await...",
        vote: 150
    }
];


const RightSidebar = () => {
    return (
        <Layout.Sider width={250} style={{ background: "#fff", padding: "20px", marginLeft: "20px" }}>
            <Title level={4}>Recent Posts</Title>
            <List
                dataSource={posts.slice(0, 5)} // Giới hạn số bài viết hiển thị
                renderItem={(post) => (
                    <List.Item style={{ display: "flex", alignItems: "center", padding: "10px", borderBottom: "1px solid #ddd", gap: "10px" }}>
                        <Avatar shape="square" size={50} src="https://th.bing.com/th/id/R.4d94d2f1b457eb7bb934f1004ac17f4f?rik=Nz294H30KQQAsg&riu=http%3a%2f%2fhk.hdwall365.com%2fwallpapers%2f1901%2fDog-and-kitten_1366x768_wallpaper.jpg&ehk=GWHFnKXLryTRUNYh%2fVNRzwYkkty65GvPW5yT2iLYsJk%3d&risl=&pid=ImgRaw&r=0" />
                        <div style={{ flex: 1 }}>
                            <Text type="secondary">r/{post.subreddit}</Text>
                            <Title level={5} style={{ margin: 0, fontSize: "14px" }}>{post.title}</Title>
                            <Text type="secondary" style={{ fontSize: "12px" }}>{post.vote} vote </Text>
                        </div>
                    </List.Item>
                )}
            />
        </Layout.Sider>
    );
};

export default RightSidebar;
