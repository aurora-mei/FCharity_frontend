import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../redux/post/postSlice";
import { Layout } from "antd";
import PostList from "../../components/Post/PostList";
import ForumHeader from "../../components/ForumSidebar/ForumHeader";
import LeftSidebar from "../../components/ForumSidebar/LeftSidebar";
import RightSidebar from "../../components/ForumSidebar/RightSidebar";
import { useSearchParams } from "react-router-dom"; // 👈 THÊM DÒNG NÀY

const { Content } = Layout;

const ForumPage = () => {
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.post.posts);
    const [searchParams] = useSearchParams();
    const tag = searchParams.get("tag");

    const [viewMode, setViewMode] = useState("compact");
    const [sortBy, setSortBy] = useState("Best");

    useEffect(() => {
        dispatch(fetchPosts());
    }, [dispatch]);

    // Hàm xử lý sắp xếp
    const handleSortChange = (sortOption) => {
        let sortedPosts = [...posts];
        
        switch(sortOption) {
            case "New":
                sortedPosts.sort((a, b) => new Date(b.post.createdAt) - new Date(a.post.createdAt));
                break;
            case "Oldest":
                sortedPosts.sort((a, b) => new Date(a.post.createdAt) - new Date(b.post.createdAt));
                break;
            case "Best":
                sortedPosts.sort((a, b) => b.post.vote - a.post.vote);
                break;
            default:
                break;
        }
        
        return sortedPosts;
    };

    // Lọc và sắp xếp bài viết
    const filteredPosts = tag
        ? posts.filter(p => 
            p.taggables?.some(t => t.tag.tagName.toLowerCase() === tag.toLowerCase())
          )
        : posts;

    const sortedAndFilteredPosts = handleSortChange(sortBy).filter(post => 
        filteredPosts.some(p => p.post.id === post.post.id)
    );

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", flexDirection: "row", gap: "20px", padding: "20px" }}>
            <LeftSidebar style={{ flex: "0 0 260px", height: "calc(100vh - 40px)" }} />
            
            <Content style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", overflow: "auto" }}>
                <ForumHeader 
                    sortBy={sortBy} 
                    setSortBy={setSortBy} 
                    viewMode={viewMode} 
                    setViewMode={setViewMode}
                    onSortChange={setSortBy} // Truyền hàm xử lý sort
                />
                <PostList posts={sortedAndFilteredPosts} viewMode={viewMode} />
            </Content>

            <RightSidebar style={{ flex: "0 0 260px", height: "calc(100vh - 40px)" }} />
        </Layout>
    );
};

export default ForumPage;
