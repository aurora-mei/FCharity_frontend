import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPostById } from "../../redux/slices/postSlice";
import { Layout, Typography, Card, Spin } from "antd";
import Sidebar from "../../components/Sidebar/Sidebar";

const { Content } = Layout;
const { Title, Text } = Typography;

const PostDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { postDetail, loading } = useSelector((state) => state.post);

    useEffect(() => {
        dispatch(fetchPostById(id));
    }, [dispatch, id]);

    return (
        <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
            <Sidebar />
            <Content style={{ background: "#fff", flex: 1, padding: "20px" }}>
                {loading ? <Spin size="large" /> : (
                    <Card>
                        <Title level={2}>{postDetail?.post.title}</Title>
                        <Text>{postDetail?.post.content}</Text>
                    </Card>
                )}
            </Content>
            <Sidebar />
        </Layout>
    );
};

export default PostDetailPage;
