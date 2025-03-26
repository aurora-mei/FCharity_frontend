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
    const loading = useSelector((state) => state.post.loading);

    const [selectedPost, setSelectedPost] = useState(null); // Trạng thái lưu bài viết được chọn
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
                {selectedPost ? (
                    <PostDetailCard post={selectedPost} onClose={() => setSelectedPost(null)} />
                ) : (
                    <PostList posts={posts} onSelectPost={setSelectedPost} />
                )}
            </Content>
            <RightSidebar />
        </Layout>
    );
};

export default ForumPage;
