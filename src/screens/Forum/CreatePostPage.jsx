import React from "react";
import { useDispatch } from "react-redux";
import { createPost } from "../../redux/slices/postSlice";
import { Layout, message } from "antd";
import PostForm from "../../components/Post/PostForm";
import Sidebar from "../../components/Sidebar/Sidebar";

const { Content } = Layout;

const CreatePostPage = () => {
    const dispatch = useDispatch();

    const handleSubmit = async (values) => {
        try {
            await dispatch(createPost({
                title: values.title,
                content: values.content,
                userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
            })).unwrap();
            message.success("Tạo bài viết thành công!");
        } catch (error) {
            message.error("Lỗi tạo bài viết!");
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
            <Sidebar />
            <Content style={{ background: "#fff", flex: 1, padding: "20px" }}>
                <PostForm onSubmit={handleSubmit} />
            </Content>
            <Sidebar />
        </Layout>
    );
};

export default CreatePostPage;
