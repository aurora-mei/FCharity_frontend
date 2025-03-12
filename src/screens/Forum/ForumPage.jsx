import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../redux/slices/postSlice";
import { Layout, Spin } from "antd";
import PostList from "../../components/Post/PostList";
import Sidebar from "../../components/Sidebar/Sidebar";

const { Content } = Layout;

const ForumPage = () => {
    const dispatch = useDispatch();
    const { posts, loading } = useSelector((state) => state.post);

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
            <Sidebar />
            <Content style={{ background: "#fff", flex: 1, margin: "0 20px" }}>
                {loading ? <Spin size="large" /> : <PostList posts={posts} />}
            </Content>
            <Sidebar />
        </Layout>
    );
};

export default ForumPage;
