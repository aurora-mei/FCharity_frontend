import React, { useEffect, useState } from "react";
import { Empty, List, Typography, Tabs, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyPosts } from "../../redux/post/postSlice";
import PostBox from "../../components/Post/PostBox";
import LoadingModal from "../../components/LoadingModal";

const { TabPane } = Tabs;
const { Title } = Typography;

const MyPostScreen = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [postCounts, setPostCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const loading = useSelector((state) => state.post.loading);
  const postsByUserId = useSelector((state) => state.post.myPosts) || [];
  const error = useSelector((state) => state.post.error);

  useEffect(() => {
    dispatch(fetchMyPosts(currentUser.id));
  }, [dispatch]);

  useEffect(() => {
    console.log("bbb",postsByUserId)
  const newCounts = {
    all: postsByUserId.length,
    pending: postsByUserId.filter(post => post.status?.toLowerCase() === "pending").length,
    approved: postsByUserId.filter(post => post.status?.toLowerCase() === "approved").length,
    rejected: postsByUserId.filter(post => post.status?.toLowerCase() === "rejected").length,
  };

  // So sánh trước khi setState để tránh re-render vô hạn
  if (JSON.stringify(newCounts) !== JSON.stringify(postCounts)) {
    setPostCounts(newCounts);
  }

  const newFiltered = activeTab === "all"
    ? postsByUserId
    : postsByUserId.filter(post => post.status?.toLowerCase() === activeTab);

  if (JSON.stringify(newFiltered) !== JSON.stringify(filteredPosts)) {
    setFilteredPosts(newFiltered);
  }
}, [postsByUserId, activeTab]);


  if (loading) return <LoadingModal />;
  if (error) {
    return <p style={{ color: "red" }}>Failed to load your posts: {error.message || error}</p>;
  }

  return (
    <div style={{ padding: "0 2rem" }}>
      <Title level={3}>My Posts</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane key="all" tab={<Badge count={postCounts.all}>All</Badge>} />
        <TabPane key="pending" tab={<Badge count={postCounts.pending}>Pending</Badge>} />
        <TabPane key="approved" tab={<Badge count={postCounts.approved}>Approved</Badge>} />
        <TabPane key="rejected" tab={<Badge count={postCounts.rejected}>Rejected</Badge>} />
      </Tabs>

      {filteredPosts.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={filteredPosts}
          renderItem={(post) => (
            <List.Item key={post.post.id}>
              <PostBox postData={post} />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={
            <span>
              You have no posts. <a href="/posts/create-post">Create one now</a>
            </span>
          }
        />
      )}
    </div>
  );
};

export default MyPostScreen;
