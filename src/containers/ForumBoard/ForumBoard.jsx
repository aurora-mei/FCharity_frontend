import { Flex, Row, Col } from "antd";
import "./ForumBoard.pcss";
import { RightOutlined } from '@ant-design/icons';
import PostCard from "../../components/PostCard/PostCard";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLatestPosts } from '../../redux/post/postSlice';

const ForumBoard = () => {
    const dispatch = useDispatch();
    const { recentPosts, loading, error } = useSelector(state => state.post);

    useEffect(() => {
        dispatch(fetchLatestPosts(3)); // Fetch 3 bài post mới nhất
    }, [dispatch]);

    return (
        <Flex vertical gap="20px">
            <b style={{ fontSize: "1.4rem" }}>Charity Forum</b>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <div className="forum-intro">
                        <div className="text-overlay-forum">
                            <h3>Community Forum</h3>
                            <p>Join discussions, ask questions, and share your experiences with the community.</p>
                            <a href="/forum">View all posts <RightOutlined /></a>
                        </div>
                    </div>
                </Col>
                <Col span={16}>
                    <Flex vertical gap='20px'>
                        {loading && <div>Loading posts...</div>}
                        {error && <div>Error: {error}</div>}
                        
                        {/* Hiển thị các bài post mới nhất */}
                        {recentPosts?.map(post => (
                            <PostCard key={post.post.id} postResponse={post} />
                        ))}
                        
                        {/* Nút xem thêm */}
                        <div style={{ textAlign: 'right' }}>
                            <a href="/forum" style={{ color: '#1890ff' }}>
                                View more posts <RightOutlined />
                            </a>
                        </div>
                    </Flex>
                </Col>
            </Row>
        </Flex>
    );
};

export default ForumBoard;