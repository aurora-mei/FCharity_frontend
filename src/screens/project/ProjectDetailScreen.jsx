import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Input,
  Col,
  Modal,
  Form,
  Flex,
  Typography,
  Carousel,
  Button,
  Badge,
  Divider,
  Table,
  InputNumber,
  message,
  Breadcrumb,
  Skeleton,
  Card,
  Progress,
  Avatar,
  Space,
  Tag,
} from "antd";
import {
  UserOutlined,
  LeftCircleOutlined,
  HomeOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import ProjectStatisticCard from "../../containers/ProjectStatisticCard/ProjectStatisticCard";
import { getOrganizationById } from "../../redux/organization/organizationSlice";
import { getPaymentLinkThunk } from "../../redux/helper/helperSlice";
import { fetchProjectRequests, fetchActiveProjectMembers} from "../../redux/project/projectSlice";
import { Link } from "react-router-dom";
import DonateProjectModal from "../../components/DonateProjectModal/DonateProjectModal";
import {
  ShareAltOutlined,
  DollarOutlined,
  RiseOutlined,
  StarOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  fetchProjectById,
  createDonationThunk,
  fetchDonationsOfProject,
} from "../../redux/project/projectSlice";
import styled from "styled-components";
import LoadingModal from "../../components/LoadingModal";

import moment from "moment-timezone";
const { Title, Paragraph, Text } = Typography;

const StyledScreen = styled.div`
  .request-detail-page {
    padding: 1rem 1rem;
  }
  .request-detail {
    background-color: #fff;
    border-radius: 1rem;
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
    margin-bottom: 24px;
  }
  .request-title {
    text-align: left;
    margin-bottom: 1rem !important;
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
    display: flex;
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
    content: "";
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
    display: flex;
    gap: 8px;
    margin: 0 !important;
    .ant-typography {
      margin: 0 !important;
    }
  }

  /* Nút Donate */
  .donate-button-container {
    text-align: center;
    margin-bottom: 20px;
  }
  .category-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #d8bfd8;
    color: #800080;
    padding: 3px 10px;
    border-radius: 15px;
    font-size: 0.7rem;
    font-weight: bold;
  }
  .bottom-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem !important;
    .ant-btn:hover {
      background-color: #f0f0f0 !important;
      color: black !important;
      border-color: black !important;
    }
  }
`;

const StyledWrapper = styled.div`
  //   margin-top:2rem;
  padding: 1rem;
  width: 100%;

  .donation-card {
    width: 100%;
    background: #fff !important;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    transition: all 0.3s ease; /* Smooth transition for hover effect */
    .ant-card-body {
      background: #fff !important;
    }
    &:hover {
      cursor: pointer;
      transform: translateY(-0.3rem); /* Move the card up by 10px */
      box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px; /* Enhance shadow on hover */
    }
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
    transition: all 0.3s ease; /* Smooth transition for hover effect */

    &:hover {
      cursor: pointer;
      transform: translateY(-0.3rem); /* Move the card up by 10px */
      box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px; /* Enhance shadow on hover */
    }
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
    gap: 1rem;
    font-size: 0.9rem !important;
    .ant-btn:hover {
      background-color: #f0f0f0 !important;
      color: black !important;
      border-color: black !important;
    }
  }
  .custom-table .ant-table {
    font-size: 0.8rem;
  }

  .custom-table .ant-table-thead > tr > th {
    font-size: 1rem; /* Đặt kích thước chữ cho tiêu đề */
  }

  .custom-table .ant-table-tbody > tr > td {
    font-size: 0.7rem; /* Đặt kích thước chữ cho các ô dữ liệu */
  }
`;
const StyledSection = {
  Container: styled.div`
    background-color: #fff;
    color: #333;
  `,

  ProfileSection: styled.div`
    display: flex;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 16px;
  `,
  Avatar: styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 16px;
  `,
  Info: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    div {
      p {
        margin: 0;
        color: #666;
        margin-bottom: 0.5rem;
        &:first-child {
          font-weight: 600;
          color: #000;
        }
      }
    }
  `,
  ContactButton: styled(Button)`
    border-radius: 0.5rem;
    padding: 1rem 0.5rem !important;
    font-size: 1rem !important;
  `,
  Meta: styled.p`
    color: #666;
    margin: 16px 0;

    a {
      color: #1677ff;
    }
  `,
  ReportLink: styled.a`
    display: flex;
    align-items: center;
    color: #666;

    &:hover {
      color: #000;
    }
  `,
};
const StyledOverlappingAvatars = styled.div`
  position: relative;
  margin: 1rem 0;
  height: 50px;
  width: 50px;
  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #000;
    object-fit: cover;
    position: absolute;
    cursor: pointer;
  }
`;

const columns = [
  {
    title: "Date",
    dataIndex: "donationTime",
    key: "donationTime",
    render: (text) => (
      <Text style={{ fontSize: "0.7rem" }}>
        {moment(text).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY hh:mm A")}
      </Text>
    ),
    sorter: (a, b) => new Date(a.donationTime) - new Date(b.donationTime), // Sort by date
    defaultSortOrder: "descend",
  },
  {
    title: "Donator",
    dataIndex: "user",
    key: "fullName",
    render: (user) => {
      return <p>{user.fullName}</p>; // Hiển thị fullName của user
    },
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (text) => (
      <Text style={{ fontSize: "0.7rem" }} type="success">
        {text?.toLocaleString() || 0} VND
      </Text> // Hiển thị số tiền theo định dạng VND
    ),
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
    render: (text) => (
      <Text style={{ fontSize: "0.7rem" }}>{text || "No message"}</Text> // Hiển thị thông điệp quyên góp hoặc "No message" nếu không có
    ),
  },
];

const ProjectDetailScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [form] = Form.useForm();  // Khởi tạo form instance
    const checkoutURL = useSelector((state) => state.helper.checkoutURL);
    const currentProject = useSelector((state) => state.project.currentProject);
    const donations = useSelector((state) => state.project.donations);
    const projectRequests = useSelector((state) => state.project.projectRequests);
    const projectMembers = useSelector((state) => state.project.projectMembers);

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );
  const loading = useSelector((state) => state.project.loading);
  const [expanded, setExpanded] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }
    useEffect(() => {
        dispatch(fetchProjectById(projectId));
        dispatch(fetchDonationsOfProject(projectId));

    }, [dispatch, projectId, donations.length]);
    const { project, projectTags } = currentProject;

    useEffect(() => {
        if (checkoutURL) {
            window.location.href = checkoutURL;
        }
        if (currentProject.project) {
            dispatch(getOrganizationById(currentProject.project.organizationId));
            dispatch(fetchProjectRequests(project.id));
            dispatch(fetchActiveProjectMembers(project.id));
        }
    }, [dispatch, currentProject.project, donations,checkoutURL,projectId]);

  // Lọc ảnh/video (nếu backend trả về attachments)
  const imageUrls =
    currentProject.attachments?.filter((url) =>
      url.imageUrl.match(/\.(jpeg|jpg|png|gif)$/i)
    ) || [];
  const videoUrls =
    currentProject.attachments?.filter((url) =>
      url.imageUrl.match(/\.(mp4|webm|ogg)$/i)
    ) || [];
    const carouselSettings = {
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };
    if ( !currentProject.project) {
        return <LoadingModal/>
    }
    const items = [
        {
            href: '/',
            title: (
                <HomeOutlined style={{ fontWeight: "bold", fontSize: "1.3rem", color: "green" }} /> // Increase icon size
            ),
        },
        {
            title: (
                <p style={{ fontSize: "1rem", color: "green" }}>Project {project.projectName}</p> // Increase text size
            ),
        },
    ];
    const handleDonate = async (values) => {
        console.log(values);
        console.log("currentUser", currentUser.id);
        dispatch(
            getPaymentLinkThunk({
                itemContent: `${currentUser.email}'s deposit`,
                userId: currentUser.id,
                objectId: project.id,
                amount: values.amount,
                paymentContent: values.message,
                objectType: "PROJECT",
                returnUrl:`projects/${project.id}`,
            })
        );
        setIsOpenModal(false);
        form.resetFields();
    }

  return (
    // <div>   </div>
    <StyledScreen>
      <Row gutter={8} justify="center" style={{ margin: "0 auto" }}>
        <Col span={13}>
          <Breadcrumb items={items} style={{ marginLeft: "1rem" }} />
          {/* <LeftCircleOutlined  onClick={()=>navigate(-1)} style={{ fontWeight: "bold", fontSize: "1.5rem" }}/> */}
          <Flex gap={0} vertical className="request-detail-page">
            <Flex vertical gap={0} className="request-detail">
              <Title level={3} className="request-title">
                {project.projectName}
              </Title>

              {(imageUrls.length > 0 || videoUrls.length > 0) && (
                <div
                  className="request-carousel"
                  style={{ position: "relative" }}
                >
                  <Carousel
                    arrows
                    {...carouselSettings}
                    style={{ position: "relative", borderRadius: 10 }}
                  >
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
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserOutlined style={{ fontSize: 24 }} />
                <div>
                  <strong>{project.leader.fullName}</strong> lead this project{" "}
                  <br />
                  <Tag color="green" style={{ fontSize: 12 }}>
                    {project.projectStatus}
                  </Tag>
                </div>
              </div>

              <Divider />
              {/* <div style={{ fontSize: 10, marginTop: 5 }}>
                                <strong>Phone:</strong> {project.phoneNumber} <br />
                                <strong>Email:</strong> {project.email} <br />
                                <strong>Location:</strong> {project.location}
                            </div> */}
              {projectTags?.length > 0 && (
                <Paragraph className="request-tags">
                  {projectTags.map((taggable) => (
                    <Badge
                      key={taggable.tag.id}
                      count={
                        <span
                          style={{
                            backgroundColor: "#DFF6E1",
                            color: "#177A56",
                            padding: "5px 10px",
                            fontSize: "0.9rem",
                            borderColor: "#2C9D63 !important",
                            fontWeight: "bold",
                            borderRadius: 20,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          #{taggable.tag.tagName}
                        </span>
                      }
                    />
                  ))}
                </Paragraph>
              )}

              <Divider />
              {expanded ? (
                <Paragraph>
                  Help Maninder Kaur & Son Williamjeet Singh (6 years) after
                  Gurvinder’s Tragic Passing. Dear friends, family, and
                  kind-hearted supporters, With a shattered heart, I share the
                  unbearable news of my beloved husband, Gurvinder Singh
                  lovingly called "Sodhi", who tragically passed away in a road
                  train accident near Wongan Hills on March 30, 2025 leaving
                  behind our son Williamjeet Singh, me and his elder parents. He
                  was only 34 years old—taken from us far too soon. Gurvinder
                  was the most kind, soft-spoken, and respectful soul—always
                  smiling and spreading positivity. He was not just my husband
                  but my best friend and the most loving father to our
                  6-year-old son, Williamjeet Singh and he was the only child of
                  his parents. Our world has been turned upside down in an
                  instant, and I am struggling to come to terms with this
                  heartbreaking loss. As I now face life without him, I humbly
                  ask for your support to help me provide stability for our son.
                  This fundraiser will help cover funeral expenses, immediate
                  living costs, and ensure Williamjeet’s future is secure during
                  this difficult transition. Your kindness, prayers, and
                  generosity mean the world to us. No donation is too small, and
                  if you’re unable to contribute, please share this fundraiser
                  with others. Thank you for your love and support in this
                  devastating time. With gratitude, Maninder Kaur & Williamjeet
                  Singh
                  {`${project.projectDescription} `}{" "}
                </Paragraph>
              ) : (
                <Paragraph>{`${project.projectDescription.substring(
                  0,
                  800
                )}...`}</Paragraph>
              )}
              <a
                style={{ fontSize: "0.9rem", color: "gray" }}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Read Less" : "Read More"}
              </a>

              <div
                style={{ display: "flex", gap: 10, marginTop: 20 }}
                className="bottom-actions"
              >
                <Button
                  type="default"
                  block
                  style={{ flex: 1 }}
                  onClick={() => {
                    if (!currentUser) {
                      navigate("/auth/login");
                      return;
                    }
                    setIsOpenModal(true);
                  }}
                >
                  <b>Donate</b>
                </Button>
                <Button type="default" block style={{ flex: 1 }}>
                  <b>Share</b>
                </Button>
              </div>
              <Divider />
              <StyledSection.Container>
                <Title level={5} style={{ margin: 0 }}>
                  Organization
                </Title>
                <StyledSection.ProfileSection>
                  <StyledSection.Avatar
                    src="https://storage.googleapis.com/a1aa/image/z6OcGa7T3LpfeWigBmZXBhb2bZBIrDWrIHhlo_5ZXoo.jpg"
                    alt="Profile"
                  />
                  <StyledSection.Info>
                    {currentOrganization &&
                      currentOrganization.organizationName && (
                        <div>
                          <p>{currentOrganization.organizationName}</p>
                          <p>Organization</p>
                          <p>{currentOrganization.address}</p>
                        </div>
                      )}
                    <StyledSection.ContactButton>
                      Contact
                    </StyledSection.ContactButton>
                  </StyledSection.Info>
                </StyledSection.ProfileSection>

                <Divider />
                <strong>Members</strong>
                <Flex>
                  <Avatar.Group>
                    {projectMembers.map((member) => (
                      <Avatar
                        key={member.id}
                        src={
                          member.user.avatar || "https://via.placeholder.com/50"
                        }
                        size={40}
                        icon={<UserOutlined />}
                      />
                    ))}
                  </Avatar.Group>
                  {/* <StyledOverlappingAvatars>
                                        {projectMembers.map((member, index) => (
                                            <img
                                                key={member.id}
                                                src={member.user.avatar || "https://via.placeholder.com/50"}
                                                alt={`Avatar ${member.user.fullName}`}
                                                title={`${member.user.fullName}`}
                                                style={{ left: `${index * 24}px`, zIndex: projectMembers.length - index }}
                                            />
                                        ))}
                                    </StyledOverlappingAvatars> */}
                </Flex>
                <Divider />

                <StyledSection.Meta>
                  Created {moment().diff(moment(project.createdAt), "days")} d
                  ago · <a href="#">{project.categoryName}</a>
                </StyledSection.Meta>

                <Divider />

                <StyledSection.ReportLink href="#">
                  <FlagOutlined style={{ marginRight: 8 }} />
                  Report fundraiser
                </StyledSection.ReportLink>
              </StyledSection.Container>
            </Flex>
          </Flex>
        </Col>
        <Col span={8} style={{ marginTop: "2rem" }}>
          <ProjectStatisticCard
            project={project}
            projectMembers={projectMembers}
            projectRequests={projectRequests}
            donations={donations}
            isOpenModal={isOpenModal}
            setIsOpenModal={setIsOpenModal}
          />

          <StyledWrapper>
            <Card className="donation-card">
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 16 }}
              >
                <Title level={5} style={{ margin: 0 }}>
                  Donation Records
                </Title>
                <Link
                  to={`/projects/${projectId}/details`}
                  style={{ marginLeft: 10 }}
                >
                  See all
                </Link>
              </Flex>
              {/* <Table columns={columns} datasource={donations} rowKey="id"
                                size="small"
                                scroll={{ y: 300 }}
                                pagination={false} loading={loading}
                                style={{ fontSize: "0.4rem" }}
                            /> */}
                            {donations.length > 0 ? (
                                <Table
                                    columns={columns}
                                    size="small"
                                    scroll={{ y: 300 }}
                                    dataSource={donations.filter((x) => x.donationStatus === "COMPLETED")}
                                    rowKey="id"
                                    className="custom-table"
                                />
                            ) : (
                                <div>No donations available</div>
                            )}

                        </Card>
                    </StyledWrapper>
                    <StyledWrapper>
                        <Card className="donation-card">
                            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                                <Title level={5} style={{ margin: 0 }}>Expense Records</Title>
                                <Link to={`/projects/${projectId}/details`} style={{ marginLeft: 10 }}>See all</Link>
                            </Flex>
                            {donations.length > 0 ? (
                                <Table
                                    columns={columns}
                                    size="small"
                                    scroll={{ y: 300 }}
                                    dataSource={donations.filter((x) => x.donationStatus === "COMPLETED")}
                                    rowKey="id"
                                    className="custom-table"
                                />
                            ) : (
                                <div>No donations available</div>
                            )}

                        </Card>
                    </StyledWrapper>
                </Col>
            </Row>
            <DonateProjectModal form={form} isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} project={project} handleDonate={handleDonate} />
        </StyledScreen>
    );
}
export default ProjectDetailScreen;
