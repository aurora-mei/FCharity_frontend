import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopVotedPosts } from '../../redux/post/postSlice';
import { Flex, Row, Col, Spin, Alert } from 'antd';
import PostForumBoard from '../../components/Post/PostForumBoard';
import './ForumBoard.pcss'; // Import file CSS nếu có
import { RightOutlined } from '@ant-design/icons';

const ForumBoard = () => {
    const dispatch = useDispatch();
    const { 
        topVoted,
        loading, 
        error 
    } = useSelector(state => state.post || {});

    useEffect(() => {
        dispatch(fetchTopVotedPosts(3)); // Lấy 3 bài viết được vote nhiều nhất
    }, [dispatch]);

    if (loading) return <Spin size="large" />;
    if (error) return <Alert message={error} type="error" />;

    console.log('Top Voted:', topVoted); // Log data to check

    return (
        <Flex vertical gap="20px" className="forum-board">
            <h2 style={{ fontSize: "1.4rem", marginBottom: 0 }}>Charity Forum</h2>

            {topVoted && topVoted.length > 0 && (
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <div className="forum-intro">
                            <div className="text-overlay-forum">
                                <div>Unite, share, and make a difference</div>
                            </div>
                        </div>
                    </Col>
                    <Col span={16}>
  <div className="forum-content-container">
    <img src="./src/assets/communicate.jpg" alt="" className="img-forum" />
    <div className="post-card-row">
      {topVoted.slice(0, 3).map(post => (
        <div key={post.post.id} className="post-card-wrapper">
          <PostForumBoard postResponse={post} size="small" />
        </div>
      ))}
    </div>
  </div>
</Col>

                </Row>
            )}
        </Flex>
    );
};

export default ForumBoard;
