import React from "react";
import { List, Layout, Flex } from "antd";
import PostItem from "./PostItem";
import PostCard from "./PostCard";

const { Content } = Layout;

const PostList = ({ posts, viewMode }) => {
    return (
        <Content style={{ flex: 1, display: "flex", justifyContent: "center", background: "#fff" }}>
            <Flex vertical gap={10} style={{ flex: 1, maxWidth: "800px" }}>
                <List
                    dataSource={posts || []}
                    renderItem={(post) => (
                        <div style={{ marginBottom: "10px" }}>
                            {viewMode === "compact" ? (
                                <PostItem postResponse={post} />
                            ) : (
                                <PostCard postResponse={post} />
                            )}
                        </div>
                    )}
                />
            </Flex>
        </Content>
    );
};

export default PostList;
