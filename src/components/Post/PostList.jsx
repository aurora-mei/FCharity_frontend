import React, { useEffect } from "react";
import { List } from "antd";
import PostItem from "./PostItem";

const PostList = ({ posts }) => {
    useEffect(()=>{
        console.log(posts);
    })
    return (
    
        <List
            dataSource={posts}
            renderItem={(post) => <PostItem postResponse={post} />}
        />
    );
};

export default PostList;
