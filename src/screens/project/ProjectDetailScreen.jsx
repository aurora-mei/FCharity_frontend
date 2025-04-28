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
  ShareAltOutlined, // Added ShareAltOutlined
  DollarOutlined,   // Added DollarOutlined
} from "@ant-design/icons";
import ProjectStatisticCard from "../../containers/ProjectStatisticCard/ProjectStatisticCard";
import { getOrganizationById } from "../../redux/organization/organizationSlice";
import { getPaymentLinkThunk } from "../../redux/helper/helperSlice";
import { fetchProjectRequests, fetchActiveProjectMembers } from "../../redux/project/projectSlice";
import { Link } from "react-router-dom";
import DonateProjectModal from "../../components/DonateProjectModal/DonateProjectModal";
// Removed unused icons like RiseOutlined, StarOutlined, UnorderedListOutlined
import {
  fetchProjectById,
  createDonationThunk,
  fetchDonationsOfProject,
} from "../../redux/project/projectSlice";
import styled from "styled-components";
import LoadingModal from "../../components/LoadingModal";

import moment from "moment-timezone"; // Ensure moment-timezone is installed and imported
import { fetchRequestById } from "../../redux/request/requestSlice";
const { Title, Paragraph, Text } = Typography;

// --- Styled Components remain the same ---
const StyledScreen = styled.div`
  .request-detail-page {
    padding: 1rem 1rem;
  }
  .request-detail {
    background-color: #fff;
    border-radius: 1rem;
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
    margin-bottom: 24px;
    padding: 1rem; /* Added padding here */
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
    height: 27rem;
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
      padding: 1rem !important; // Ensure padding inside card body
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
    padding-top: 1rem; // Add padding if needed after removing Divider
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
// --- StyledOverlappingAvatars remains the same ---
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

// --- columns definition remains the same ---
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
      return <p>{user?.fullName || "Anonymous"}</p>;
    },
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (text) => (
      <Text style={{ fontSize: "0.7rem" }} type="success">
        {text?.toLocaleString() || 0} VND
      </Text>
    ),
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
    render: (text) => (
      <Text style={{ fontSize: "0.7rem" }}>{text || "No message"}</Text>
    ),
  },
];


const ProjectDetailScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [form] = Form.useForm();
  const checkoutURL = useSelector((state) => state.helper.checkoutURL);
  const currentProject = useSelector((state) => state.project.currentProject);
  const donations = useSelector((state) => state.project.donations);
  const projectRequests = useSelector((state) => state.project.projectRequests);
  const projectMembers = useSelector((state) => state.project.projectMembers);
  const currentRequest = useSelector((state) => state.request.currentRequest);
  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );
  const loading = useSelector((state) => state.project.loading);
  const [expanded, setExpanded] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [countdownDisplay, setCountdownDisplay] = useState(""); // State for countdown display


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

  }, [dispatch, projectId]);

  const project = currentProject?.project;
  const projectTags = currentProject?.projectTags;

  useEffect(() => {
    if (checkoutURL) {
      window.location.href = checkoutURL;
    }
    if (project) {
      dispatch(getOrganizationById(project.organizationId));
      dispatch(fetchProjectRequests(project.id));
      dispatch(fetchActiveProjectMembers(project.id));
    }
  }, [dispatch, project, checkoutURL]);

  useEffect(() => {
    if (project && project.requestId) {
      dispatch(fetchRequestById(project.requestId));
    }
  }, [dispatch, project]);

  // Countdown Timer Logic (Remains the same)
  useEffect(() => {
    if (!project || !project.plannedStartTime || !project.plannedEndTime) {
      setCountdownDisplay("Loading project times...");
      return;
    }

    const plannedStartTime = moment(project.plannedStartTime);
    const plannedEndTime = moment(project.plannedEndTime);
    let intervalId = null;

    const calculateAndSetDisplay = () => {
        const now = moment();

        if (now.isBefore(plannedStartTime)) {
            const duration = moment.duration(plannedStartTime.diff(now));
            if (duration.asMilliseconds() <= 0) {
                setCountdownDisplay("Starting soon...");
            } else {
                const days = Math.floor(duration.asDays());
                const hours = duration.hours();
                const minutes = duration.minutes();
                const seconds = duration.seconds();
                setCountdownDisplay(
                    <Text strong style={{ color: 'orange', fontSize: '1rem' }}> {/* Adjusted font size */}
                        Starts in: {`${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`}
                    </Text>
                );
            }
        } else if (now.isBefore(plannedEndTime)) {
            const duration = moment.duration(plannedEndTime.diff(now));
             if (duration.asMilliseconds() <= 0) {
                setCountdownDisplay("Ending soon...");
             } else {
                const days = Math.floor(duration.asDays());
                const hours = duration.hours();
                const minutes = duration.minutes();
                const seconds = duration.seconds();
                setCountdownDisplay(
                    <Text strong style={{ color: 'red', fontSize: '1rem' }}> {/* Adjusted font size */}
                       Ends in: {`${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`}
                    </Text>
                );
             }
        } else {
            setCountdownDisplay(<Text strong style={{ color: 'grey', fontSize: '1rem' }}>Project has started.</Text>); // Changed color
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
    };

    calculateAndSetDisplay();

    if (moment().isBefore(plannedEndTime) && !intervalId) {
         intervalId = setInterval(calculateAndSetDisplay, 1000);
    }

    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
}, [project]);

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
    infinite: imageUrls.length > 1 || videoUrls.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  if (!project) {
    return <LoadingModal />
  }
  const items = [
    {
      href: '/',
      title: (
        <HomeOutlined style={{ fontWeight: "bold", fontSize: "1.3rem"}} />
      ),
    },
    {
      title: (
        <p style={{ fontSize: "1rem"}}>Project {project.projectName}</p>
      ),
    },
  ];
  const handleDonate = async (values) => {
    if (!currentUser || !currentUser.id) {
        message.error("User not logged in. Please log in to donate.");
        navigate('/auth/login');
        return;
    }
    dispatch(
      getPaymentLinkThunk({
        itemContent: `${currentUser.email}'s deposit for ${project.projectName}`,
        userId: currentUser.id,
        objectId: project.id,
        amount: values.amount,
        paymentContent: values.message??"Donation for project",
        objectType: "PROJECT",
        returnUrl: window.location.href, 
      })
    );
    setIsOpenModal(false);
    form.resetFields();
  }

  const completedDonations = donations?.filter((x) => x.donationStatus === "COMPLETED") || [];


  return (
    <StyledScreen>
      <Row gutter={16} justify="center" style={{ margin: "0 auto", padding: "0 1rem" }}> {/* Added padding to Row */}
        {/* Left Column */}
        <Col xs={24} md={14} lg={13}> {/* Responsive column */}
          <Breadcrumb items={items} style={{ marginLeft: "1rem", marginBottom: '1rem' }} /> {/* Added margin bottom */}
          <Flex gap={0} vertical className="request-detail-page">
            <Flex vertical gap={0} className="request-detail"> {/* request-detail already has padding */}
            <Tag color="blue" style={{ fontSize: 12, width: "fit-content", marginBottom: '0.5rem' }}> {/* Added margin bottom */}
                  <b>{project.projectStatus}</b>
                </Tag>
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

              {/* ----- Leader Info Section ----- */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: '1rem' }}> {/* Added margin bottom */}
                <Flex gap={10}>
                  <Avatar src={project.leader?.avatar} icon={<UserOutlined />} size={48} /> {/* Increased size */}
                  <Flex vertical gap={5}> {/* Reduced gap */}
                    <span> <strong>{project.leader?.fullName || 'N/A'}</strong> lead this project</span>
                    <Flex vertical gap={3} style={{ fontSize: '0.9rem', color: '#555' }}> {/* Smaller text, grey color */}
                      <span> <i>Planned start: </i> { moment(project.plannedStartTime).format("DD/MM/YY hh:mm A")} </span>
                      <span> <i>Planned end: </i> {moment(project.plannedEndTime).format("DD/MM/YY hh:mm A")}</span>
                      {/* ----- Countdown REMOVED from here ----- */}
                      <span> <i>Location: </i> {project.location || 'Not specified'}</span>
                    </Flex>
                  </Flex>
                </Flex>
              </div>
              {/* ----- End Leader Info Section ----- */}


              <Divider />
              <Title level={5} style={{ marginBottom: "1rem" }}>
                  For Request
                </Title>
              {currentRequest && currentRequest.helpRequest ? (
                <Card style={{ marginBottom: '1rem' }}> {/* Added margin bottom */}
                  <Flex gap={10}>
                  <img src={  currentRequest?.attachments &&  currentRequest?.attachments.length > 0 ?
                 currentRequest?.attachments?.find((url) =>
                    url.match(/\.(jpeg|jpg|png|gif)$/i)
                  ) : "https://via.placeholder.com/80"}
                  alt="request" style={{ width: "5rem", height: "5rem", borderRadius: 10, objectFit: 'cover' }} />
                    <Flex vertical>
                    <Text type="primary"><Link to={`/requests/${project.requestId}`}>{currentRequest.helpRequest.title}</Link></Text>
                    <span><strong>Created at: </strong>{moment(currentRequest.helpRequest.creationDate).format("DD/MM/YYYY hh:mm A")}</span>
                    <span><strong>By requester: </strong>{currentRequest.helpRequest.user?.fullName || 'N/A'}</span>
                    </Flex>
                  </Flex>
                </Card>
              ) : (
                 <Text type="secondary" style={{ display: 'block', marginBottom: '1rem' }}>No associated help request found or still loading.</Text>
              )}

              {/* <Divider /> No need for two dividers here */}

              {projectTags?.length > 0 && (
                <Paragraph className="request-tags" style={{ marginBottom: '1rem' }}> {/* Added margin bottom */}
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
              {/* Project Description */}
              {project.projectDescription && (
                  <div style={{ marginBottom: '1rem' }}> {/* Added margin bottom */}
                    <Paragraph style={{marginTop:"0.5rem"}}> {/* Reduced margin top */}
                      {expanded
                        ? project.projectDescription
                        : `${project.projectDescription.substring(0, 800)}${project.projectDescription.length > 800 ? "..." : ""}`
                      }
                    </Paragraph>
                    {project.projectDescription.length > 800 && (
                      <a
                        style={{ fontSize: "0.9rem", color: "gray", cursor: 'pointer' }}
                        onClick={() => setExpanded(!expanded)}
                      >
                        {expanded ? "Read Less" : "Read More"}
                      </a>
                    )}
                 </div>
              )}


              {/* Bottom Action Buttons moved below description */}
              <div
                style={{ display: "flex", gap: 10, marginTop: 'auto' }} // Pushes buttons down if content is short
                className="bottom-actions"
              >
                {project.projectStatus === "DONATING" && (
                  <Button
                    type="primary"
                    block
                    icon={<DollarOutlined />}
                    style={{ flex: 1 }}
                    onClick={() => {
                      if (!currentUser || !currentUser.id) {
                        message.info("Please log in to donate.");
                        navigate("/auth/login");
                        return;
                      }
                      setIsOpenModal(true);
                    }}
                  >
                    <b>Donate Now</b>
                  </Button>
                )}
                <Button type="default" block style={{ flex: 1 }} icon={<ShareAltOutlined />}>
                  <b>Share</b>
                </Button>
              </div>

             <Divider /> {/* Divider before Org/Member section */}

             {/* Organization and Member Section */}
              <StyledSection.Container>
                <Title level={5} style={{ margin: '0 0 1rem 0' }}> {/* Added bottom margin */}
                  Organization
                </Title>
                <StyledSection.ProfileSection style={{ marginTop: 0 }}> {/* Removed top margin */}
                  <StyledSection.Avatar
                    src={currentOrganization?.logoUrl || "https://via.placeholder.com/40"}
                    alt="Organization Logo"
                  />
                  <StyledSection.Info>
                    {currentOrganization ? (
                        <div>
                          <p>{currentOrganization.organizationName}</p>
                          <p>Organization</p>
                          <p>{currentOrganization.address || 'Address not provided'}</p>
                        </div>
                      ) : (
                         <Skeleton active paragraph={{rows: 1}} title={false} /> // Placeholder
                      )}
                    <StyledSection.ContactButton disabled={!currentOrganization}>
                      Contact
                    </StyledSection.ContactButton>
                  </StyledSection.Info>
                </StyledSection.ProfileSection>

                <Divider />
                <strong>Members</strong>
                <Flex style={{marginTop: '0.5rem', marginBottom: '1rem'}}> {/* Added margins */}
                  {projectMembers && projectMembers.length > 0 ? (
                      <Avatar.Group maxCount={5} maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                          {projectMembers.map((member) => (
                              <Avatar
                                  key={member.id}
                                  src={member.user?.avatar || undefined}
                                  icon={!member.user?.avatar ? <UserOutlined /> : null}
                                  size={40}
                                  title={member.user?.fullName || 'Member'}
                              />
                          ))}
                      </Avatar.Group>
                  ) : (
                      <Text type="secondary">No members assigned yet.</Text>
                  )}
                </Flex>
                <Divider />

                <StyledSection.Meta>
                  Created {moment(project.createdAt).fromNow()}
                   · <Link to="#">{project.categoryName || 'Uncategorized'}</Link>
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

        {/* Right Column */}
        <Col xs={24} md={10} lg={8} style={{ marginTop: "4.5rem" }}> {/* Adjusted top margin, responsive */}

            {/* ----- Countdown Display MOVED HERE ----- */}
            {project && (
                <Card style={{ marginBottom: '1rem', textAlign: 'center', border: '1px solid #eee', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px 0px' }}>
                    {/* Use Card for better visual grouping */}
                     {countdownDisplay}
                </Card>
            )}
            {/* ----- End Countdown Display ----- */}


            <ProjectStatisticCard
                project={project}
                projectMembers={projectMembers || []}
                projectRequests={projectRequests || []}
                donations={completedDonations}
                isOpenModal={isOpenModal}
                setIsOpenModal={setIsOpenModal}
                // No need to pass countdownDisplay here anymore
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
        </Col>
      </Row>
      <DonateProjectModal form={form} isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} project={project} handleDonate={handleDonate} />
    </StyledScreen>
  );
}
export default ProjectDetailScreen;