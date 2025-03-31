import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPostsById } from "../../redux/post/postSlice";
import { Layout, Typography, Breadcrumb, Flex } from "antd";
import LeftSidebar from "../../components/ForumSidebar/LeftSidebar";
import RightSidebar from "../../components/ForumSidebar/RightSidebar";
import LoadingModal from "../../components/LoadingModal";
import useLoading from "../../hooks/useLoading";
import Post from "../../components/Post/Post";
import { HomeOutlined } from "@ant-design/icons";

const { Content } = Layout;

const breadcrumbItems = [
  { href: "/forum", title: <HomeOutlined /> },
  { title: "Post Detail" },
];

const PostDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const currentPost = useSelector((state) => state.post.currentPost);
  const loading = useSelector((state) => state.post.loading);
  const loadingUI = useLoading();

  useEffect(() => {
    if (id) {
      dispatch(fetchPostsById(id));
    }
  }, [dispatch, id]);

  return (
    <Layout style={{ minHeight: "100vh", display: "flex", padding: "20px" }}>
      <LeftSidebar /> {/* ✅ Sidebar bên trái */}
      <Flex
        vertical
        gap={10}
        style={{
          background: "#fff",
          flex: 1,
          padding: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Breadcrumb items={breadcrumbItems} />
        <Content>
          {loadingUI || loading ? <LoadingModal /> : <Post currentPost={currentPost} />}
        </Content>
      </Flex>
      <RightSidebar />
    </Layout>
  );
};

export default PostDetailPage;
