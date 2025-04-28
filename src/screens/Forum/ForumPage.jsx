import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../redux/post/postSlice";
import { Layout } from "antd";
import PostList from "../../components/Post/PostList";
import ForumHeader from "../../components/ForumSidebar/ForumHeader";
import LeftSidebar from "../../components/ForumSidebar/LeftSidebar";
import RightSidebar from "../../components/ForumSidebar/RightSidebar";
import {useSearchParams} from "react-router-dom"
const { Content } = Layout;

const ForumPage = () => {
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.post.posts);
    const [searchParams] = useSearchParams();
    const tag = searchParams.get("tag");

    const [viewMode, setViewMode] = useState("compact");
    const [sortBy, setSortBy] = useState("New"); // Mặc định sắp xếp mới nhất trước

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);

    // Lọc bài viết theo tag
    const filteredPosts = React.useMemo(() => {
        return tag
            ? posts.filter(p => 
                p.taggables?.some(t => t.tag.tagName.toLowerCase() === tag.toLowerCase())
              )
            : posts;
    }, [posts, tag]);

    // Sắp xếp bài viết
    const sortedAndFilteredPosts = React.useMemo(() => {
        const postsToSort = [...filteredPosts];
        
        switch(sortBy) {
            case "New":
                return postsToSort.sort((a, b) => 
                    new Date(b.post.createdAt) - new Date(a.post.createdAt)
                );
            case "Oldest":
                return postsToSort.sort((a, b) => 
                    new Date(a.post.createdAt) - new Date(b.post.createdAt)
                );
            case "Best":
                return postsToSort.sort((a, b) => 
                    (b.post.vote || 0) - (a.post.vote || 0)
                );
            default:
                return postsToSort;
        }
    }, [filteredPosts, sortBy]);

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", flexDirection: "row", gap: "20px", padding: "20px" }}>
            <LeftSidebar style={{ flex: "0 0 260px", height: "calc(100vh - 40px)" }} />
            
            <Content style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", overflow: "auto" }}>
                <ForumHeader 
                    sortBy={sortBy} 
                    setSortBy={setSortBy} 
                    viewMode={viewMode} 
                    setViewMode={setViewMode}
                />
                <PostList posts={sortedAndFilteredPosts} viewMode={viewMode} />
            </Content>

            <RightSidebar style={{ flex: "0 0 260px", height: "calc(100vh - 40px)" }} />
        </Layout>
    );
};

export default ForumPage;