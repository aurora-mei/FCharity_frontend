import React from "react";
import { List } from "antd";
import PostItem from "./PostItem";

const PostList = ({ posts, onPostClick }) => {
    return (
        <List
            dataSource={posts}
            renderItem={(post) => <PostItem post={post} onClick={onPostClick} />}
        />
    );
};

export default PostList;
