import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../redux/post/postSlice";
import { Layout, Spin, Button } from "antd";
import PostList from "../../components/Post/PostList";
import ForumHeader from "../../components/Sidebar/ForumHeader";
import LeftSidebar from "../../components/Sidebar/LeftSidebar";
import RightSidebar from "../../components/Sidebar/RightSidebar";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

const ForumPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Sử dụng useNavigate() để điều hướng
    const posts= useSelector((state) => state.post.posts);
    const loading= useSelector((state) => state.post.loading);
    useEffect(() => {
        dispatch(fetchPosts());
                console.log(posts);
    }, [dispatch]);

        const [viewMode, setViewMode] = useState("compact");
        const [sortBy, setSortBy] = useState("Best");
    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
        <LeftSidebar />
        <Content style={{ background: "#fff", flex: 1, margin: "0 20px" }}>
            <ForumHeader sortBy={sortBy} setSortBy={setSortBy} viewMode={viewMode} setViewMode={setViewMode} />
        </Content>
        <RightSidebar />
    </Layout>
    );
};

export default ForumPage;
