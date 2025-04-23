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
        <Layout style={{ 
            minHeight: "100vh", 
            display: "flex", 
            flexDirection: "row", 
            gap: "20px", 
            padding: "20px" 
        }}>
            {/* Left Sidebar with fixed width */}
            <LeftSidebar style={{ 
                flex: "0 0 260px", 
                height: "calc(100vh - 40px)" // Adjust for vertical padding
            }} />
            
            {/* Main Content Area */}
            <Content style={{ 
                flex: 1, 
                background: "#fff", 
                padding: "20px",
                borderRadius: "8px",
                overflow: "auto" 
            }}>
                <ForumHeader 
                    sortBy={sortBy} 
                    setSortBy={setSortBy} 
                    viewMode={viewMode} 
                    setViewMode={setViewMode} 
                />
                <PostList posts={posts} viewMode={viewMode} />
            </Content>
            
            {/* Right Sidebar with fixed width */}
            <RightSidebar style={{ 
                flex: "0 0 260px", 
                height: "calc(100vh - 40px)" // Adjust for vertical padding
            }} />
        </Layout>
    );
};

export default ForumPage;