import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../redux/post/postSlice";
import { Layout } from "antd";
import PostList from "../../components/Post/PostList";
import ForumHeader from "../../components/ForumSidebar/ForumHeader";
import LeftSidebar from "../../components/ForumSidebar/LeftSidebar";
import RightSidebar from "../../components/ForumSidebar/RightSidebar";

const { Content } = Layout;

const ForumPage = () => {
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.post.posts);
    
    const [viewMode, setViewMode] = useState("compact");
    const [sortBy, setSortBy] = useState("Best");

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
            <LeftSidebar />
            <Content style={{ background: "#fff", flex: 1, margin: "0 20px" }}>
                <ForumHeader sortBy={sortBy} setSortBy={setSortBy} viewMode={viewMode} setViewMode={setViewMode} />
                <PostList posts={posts} viewMode={viewMode} />
            </Content>
            <RightSidebar />
        </Layout>
    );
};

export default ForumPage;
