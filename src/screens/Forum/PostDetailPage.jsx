import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPostsById } from "../../redux/post/postSlice";
import { Layout, Typography, Card, Spin } from "antd";
import LeftSidebar from "../../components/Sidebar/LeftSidebar";
import RightSidebar from "../../components/Sidebar/RightSidebar";
const { Content } = Layout;
const { Title, Text } = Typography;
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import {Avatar ,Badge} from "antd";
import { LikeOutlined,MessageOutlined ,ShareAltOutlined  } from "@ant-design/icons";
const PostDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const  currentPost = useSelector((state) => state.post.currentPost);
    const loading = useSelector((state) => state.post.loading);

    useEffect(() => {
        dispatch(fetchPostsById(id));
    }, [dispatch, id]);

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
        <LeftSidebar /> {/* ✅ Sidebar bên trái */}
        <Content style={{ background: "#fff", flex: 1, padding: "20px", display: "flex", justifyContent: "center" }}>
            {loading ? <Spin size="large" /> : (
                <Card style={{ maxWidth: "100vh", width: "100%" }} bordered={false}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                        <Avatar size={40} src="https://storage.googleapis.com/a1aa/image/SLsiBjM7A_DiXERy7RrXPTFtwY4VT43xrUyrYl05oF8.jpg" />
                        <div style={{ marginLeft: "8px" }}>
                            <div style={{ fontSize: "14px", fontWeight: "600" }}>r/EnglishLearning</div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>5 days ago</div>
                        </div>
                    </div>
                    <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>quick vocab quiz - C2</h2>
                    <Badge count="Vocabulary / Semantics" color="red" style={{ marginBottom: "16px" }} />
                    <Card style={{ backgroundColor: "#e5e7eb", padding: "16px", borderRadius: "8px" }}>
                        image
                    </Card>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", color: "#6b7280", fontSize: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <LikeOutlined />
                            <span>19</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <MessageOutlined />
                            <span>22</span>
                            <ShareAltOutlined />
                            <span>Share</span>
                        </div>
                    </div>
                </Card>
            )}
        </Content>
        <RightSidebar /> {/* ✅ Sidebar bên phải */}
    </Layout>
    
    );
};

export default PostDetailPage;
