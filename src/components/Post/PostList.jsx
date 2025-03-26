import React, { useEffect } from "react";
import { List } from "antd";
import PostItem from "./PostItem";

const PostList = ({ posts, viewMode }) => {
    useEffect(() => {
        console.log(posts);
    }, [posts]);

    return (
        <List
            dataSource={posts || []}
            renderItem={(post) => <PostItem postResponse={post} viewMode={viewMode} />}
            grid={viewMode === "card" ? { gutter: 16, column: 2 } : null}
        />
    );
};

export default PostList;
