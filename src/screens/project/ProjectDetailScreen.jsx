import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {Row,Col, Flex, Typography, Carousel, Button, Badge, message, Breadcrumb, Skeleton, Card, Progress, Avatar, Space } from "antd";
import { UserOutlined, CheckCircleOutlined, HomeOutlined } from "@ant-design/icons";
import {
    ShareAltOutlined,
    DollarOutlined,
    RiseOutlined,
    StarOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { fetchProjectById } from "../../redux/project/projectSlice";
import styled from "styled-components";
import LoadingModal from "../../components/LoadingModal";
const { Title, Paragraph, Text } = Typography;

const StyledScreen = styled.div`
.request-detail-page {
  padding:1rem 1rem;
}
.request-detail{
  background-color: #fff;
  border-radius: 1rem;
  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
  margin-bottom: 24px;
}
.request-title {
  text-align: left;
  margin-bottom: 0;

}

/* Carousel nằm ngay dưới title */
.request-carousel {
  width: 100%;
  margin-bottom: 1rem;
}

.media-slide img,
.media-slide video {
  border-radius: 0.8rem;
  width: 100%;
  height: 22rem;
  object-fit: cover;
  object-position: center;
  display:flex;
}

/* Mũi tên slick */
.slick-arrow {
  font-size: 24px;
  color: #333 !important;
  z-index: 2;
  position: absolute; 
  top: 50%;
  transform: translateY(-50%);
  display: block !important; /* Ép hiển thị mũi tên */
}

/* Đẩy mũi tên ra ngoài ảnh */
.slick-prev {
  left: -40px; /* Thay đổi tuỳ ý, ví dụ -40px, -50px */
}

.slick-next {
  right: -40px; /* Thay đổi tuỳ ý, ví dụ -40px, -50px */
}

/* Xoá icon mặc định của slick */
.slick-prev::before,
.slick-next::before {
  content: '';
}

/* Thông tin tổ chức + donation tag */
.organizer-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.organizer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.organizer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.organizer-text {
  font-size: 16px;
}

/* Nội dung chính */
.request-main-content {
  margin-bottom: 24px;
  line-height: 1.6;
  font-size: 16px;
}

.request-tags {
  margin-top: 12px;
  display:flex;
  gap: 8px;
}

/* Nút Donate */
.donate-button-container {
  text-align: center;
  margin-bottom: 20px;
}
.category-badge{
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #D8BFD8; 
  color: #800080; 
  padding: 3px 10px;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: bold;
}
`;

const StyledWrapper = styled.div`
  min-height: 100vh;
 
  display: flex;
  justify-content: center;
  align-items: center;

  .donation-card {
    width: 320px;
     background: #f5f5f5;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .progress-container {
    text-align: center;
  }

  .full-width-button {
    width: 100%;
    font-weight: 600;
  }

  .donation-item {
    display: flex;
    align-items: center;
  }

  .donation-info {
    margin-left: 8px;
  }

  .bottom-actions {
    display: flex;
    justify-content: space-between;
  }
`;
const items =
    [
        {
            href: '/',
            title: <HomeOutlined />,
        },
        {
            title: 'Project Detail',
        },
    ];
const ProjectDetailScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const currentProject = useSelector((state) => state.project.currentProject);
    const loading = useSelector((state) => state.project.loading);
    const [expanded, setExpanded] = useState(false);
    useEffect(() => {
        dispatch(fetchProjectById(projectId));
    }, [dispatch, projectId]);
    const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }
    // Lọc ảnh/video (nếu backend trả về attachments)
    const imageUrls = currentProject.attachments?.filter((url) =>
        url.imageUrl.match(/\.(jpeg|jpg|png|gif)$/i)
    ) || [];
    const videoUrls = currentProject.attachments?.filter((url) =>
        url.imageUrl.match(/\.(mp4|webm|ogg)$/i)
    ) || [];
    console.log("imageUrls", imageUrls);
    console.log("videoUrls", videoUrls);
    const carouselSettings = {
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };
    if (loading || !currentProject.project) {
        return <LoadingModal />;
    }
    const { project, projectTags } = currentProject;


    return (
        // <div>   </div>
        <StyledScreen>
            <Row gutter={16} style={{ padding: "0 6rem 2rem 6rem", margin: "0" }}>
                <Col span={18} >
                        <Flex gap={10} vertical className="request-detail-page" >
                            <Breadcrumb
                                items={items} />
                            <Flex vertical gap={10} className="request-detail">
                                <Title level={3} className="request-title">{project.projectName}</Title>

                                {(imageUrls.length > 0 || videoUrls.length > 0) && (
                                    <div className="request-carousel" style={{ position: 'relative' }}>
                                        <Carousel arrows  {...carouselSettings} style={{ position: 'relative', borderRadius: 10 }}>
                                            {imageUrls.map((url, index) => (
                                                <div key={`img-${index}`} className="media-slide">
                                                    <img src={url.imageUrl} alt={`request-img-${index}`} />
                                                </div>
                                            ))}
                                            {videoUrls.map((url, index) => (
                                                <div key={`vid-${index}`} className="media-slide">
                                                    <video src={url.imageUrl} controls />
                                                </div>
                                            ))}
                                        </Carousel>
                                        <span className="category-badge">
                                            {project.category.categoryName}
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <UserOutlined style={{ fontSize: 24 }} />
                                    <div>
                                        <strong>{project.leader.fullName}</strong> <br />
                                        <div style={{ fontSize: 10, marginTop: 5 }}>
                                            <strong>Phone:</strong> {project.phoneNumber} <br />
                                            <strong>Email:</strong> {project.email} <br />
                                            <strong>Location:</strong> {project.location}
                                        </div>

                                    </div>
                                </div>

                                <hr />
                                {projectTags?.length > 0 && (
                                    <Paragraph className="request-tags">
                                        {projectTags.map((taggable) => (
                                            <Badge key={taggable.tag.id}
                                                count={
                                                    <span style={{ backgroundColor: "#DFF6E1", color: "#177A56", padding: "5px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5 }}>
                                                        <CheckCircleOutlined /> {taggable.tag.tagName}
                                                    </span>
                                                }
                                            />
                                        ))}
                                    </Paragraph>
                                )}


                                {expanded ? <Paragraph>{`${project.projectDescription}`} </Paragraph> : <Paragraph>{`${project.projectDescription.substring(0, 800)}...`}</Paragraph>}
                                <a style={{ fontSize: "0.9rem", color: "gray" }} onClick={() => setExpanded(!expanded)}>
                                    {expanded ? "Read Less" : "Read More"}
                                </a>

                                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                                    <Button type="default" block style={{ flex: 1 }}
                                        onClick={() => {
                                            if (!currentUser) {
                                                navigate("/auth/login");
                                                return;
                                            }
                                            navigate(`/donate/${projectId}`);
                                        }}>
                                        Donate
                                    </Button>
                                    <Button type="default" block style={{ flex: 1 }}>
                                        Share
                                    </Button>
                                </div>

                            </Flex>

                        </Flex>
                </Col>
                <Col span={6} >
                    <StyledWrapper>
                        <Card className="donation-card">
                            <div className="flex-between">
                                <div>
                                    <Title level={4}>$125,526 AUD raised</Title>
                                    <Text type="secondary">$200K goal · 2.1K donations</Text>
                                </div>
                                <div className="progress-container">
                                    <Progress
                                        type="circle"
                                        percent={63}
                                        width={64}
                                        strokeColor="#52c41a"
                                        format={percent => `${percent}%`}
                                    />
                                </div>
                            </div>

                            <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
                                <Button
                                    className="full-width-button"
                                    type="primary"
                                    icon={<ShareAltOutlined />}
                                    style={{ backgroundColor: '#fadb14', borderColor: '#fadb14' }}
                                >
                                    Share
                                </Button>
                                <Button
                                    className="full-width-button"
                                    type="primary"
                                    icon={<DollarOutlined />}
                                    style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                                >
                                    Donate now
                                </Button>
                            </Space>

                            <div className="donation-item" style={{ marginBottom: 16 }}>
                                <Avatar icon={<RiseOutlined />} style={{ backgroundColor: '#efdbff' }} />
                                <Text style={{ marginLeft: 8, color: '#722ed1', fontWeight: 500 }}>696 people just donated</Text>
                            </div>

                            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                                <div className="donation-item">
                                    <Avatar icon={<UserOutlined />} />
                                    <div className="donation-info">
                                        <Text strong>Anonymous</Text>
                                        <br />
                                        <Text type="secondary">$25 · <a href="#">Recent donation</a></Text>
                                    </div>
                                </div>

                                <div className="donation-item">
                                    <Avatar icon={<UserOutlined />} />
                                    <div className="donation-info">
                                        <Text strong>Amritpal Kankar</Text>
                                        <br />
                                        <Text type="secondary">$2,000 · <a href="#">Top donation</a></Text>
                                    </div>
                                </div>

                                <div className="donation-item">
                                    <Avatar icon={<UserOutlined />} />
                                    <div className="donation-info">
                                        <Text strong>Sewak Aulakh</Text>
                                        <br />
                                        <Text type="secondary">$50 · <a href="#">First donation</a></Text>
                                    </div>
                                </div>
                            </Space>

                            <div className="bottom-actions">
                                <Button icon={<UnorderedListOutlined />}>See all</Button>
                                <Button icon={<StarOutlined />}>See top</Button>
                            </div>
                        </Card>
                    </StyledWrapper>
                </Col>
            </Row>

        </StyledScreen>
    );
}
export default ProjectDetailScreen;