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
} from "antd";
import {
  UserOutlined,
  LeftCircleOutlined,
  HomeOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { getOrganizationById } from "../../redux/organization/organizationSlice";
import { getPaymentLinkThunk } from "../../redux/helper/helperSlice";
import { Link } from "react-router-dom";
import ProjectSpendingDetailContainer from "../../containers/ProjectSpendingDetailContainer/ProjectSpendingDetailContainer";
import DonateProjectModal from "../../components/DonateProjectModal/DonateProjectModal";
import {
  ShareAltOutlined,
  DollarOutlined,
  RiseOutlined,
  StarOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { fetchProjectById, fetchDonationsOfProject, fetchProjectRequests, fetchActiveProjectMembers,fetchSpendingDetailsByProject } from "../../redux/project/projectSlice";
import styled from "styled-components";
import LoadingModal from "../../components/LoadingModal";
import ProjectDonationBoard from "../../containers/ProjectDonationBoard/ProjectDonationBoard";
import moment from "moment-timezone";
import ProjectStatisticCard from "../../containers/ProjectStatisticCard/ProjectStatisticCard";
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
  .details-containter {
    padding: 0 5rem;
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
      margin-top:1rem;
      margin-bottom: 16px;
    `,
  Avatar: styled.img`
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 16px;
    `,
  Info: styled.div`
    display:flex;
    flex-direction:column;
       gap:1rem;
     div{
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
      padding:1rem 0.5rem !important;
      font-size:1rem !important;
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
    `
};

const ProjectMoreDetailScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [form] = Form.useForm();  // Khởi tạo form instance

  const currentProject = useSelector((state) => state.project.currentProject);
  const donations = useSelector((state) => state.project.donations);
  const checkoutURL = useSelector((state) => state.helper.checkoutURL);
  const projectRequests = useSelector((state) => state.project.projectRequests);
  const projectMembers = useSelector((state) => state.project.projectMembers);
  const loading = useSelector((state) => state.project.loading);
   const spendingDetails = useSelector((state) => state.project.spendingDetails);
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
    dispatch(fetchSpendingDetailsByProject(projectId))
    
  }, [dispatch, projectId, donations.length]);
  useEffect(() => {
    if (checkoutURL) {
      window.location.href = checkoutURL;
    }
    if (currentProject.project) {
      dispatch(getOrganizationById(currentProject.project.organizationId));
      dispatch(fetchProjectRequests(project.id));
      dispatch(fetchActiveProjectMembers(project.id));
    }
    console.log("currentProject", currentProject);
  }, [dispatch, currentProject.project, donations, checkoutURL]);

  // Lọc ảnh/video (nếu backend trả về attachments)
  const imageUrls = currentProject.attachments?.filter((url) =>
    url.imageUrl.match(/\.(jpeg|jpg|png|gif)$/i)
  ) || [];
  const videoUrls = currentProject.attachments?.filter((url) =>
    url.imageUrl.match(/\.(mp4|webm|ogg)$/i)
  ) || [];
  const carouselSettings = {
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  if (!currentProject.project) {
    return <LoadingModal />;
  }
  const { project, projectTags } = currentProject;

  const items = [
    {
      href: '/',
      title: (
        <HomeOutlined style={{ fontWeight: "bold", fontSize: "1.3rem" }} /> // Increase icon size
      ),
    },
    {
      title: (
        <a style={{ fontSize: "1rem" }} onClick={() => { navigate(-1) }}>Project {project.projectName}</a> // Increase text size
      ),
    },
    {
      title: (
        <p style={{ fontSize: "1rem" }}>Details</p> // Increase text size
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
        returnUrl: `projects/${project.id}/details`,
      })
    );
    setIsOpenModal(false);
    form.resetFields();
  }

  return (
    // <div>   </div>
    <StyledScreen>
      <Row gutter={8} justify="center" style={{ margin: "0 auto" }}>
        <Col span={13} >
          <Breadcrumb items={items} style={{ marginLeft: "1rem" }} />
          {/* <LeftCircleOutlined  onClick={()=>navigate(-1)} style={{ fontWeight: "bold", fontSize: "1.5rem" }}/> */}
          <Flex gap={0} vertical className="request-detail-page" >
            <Flex vertical gap={0} className="request-detail">
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
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <Flex gap={10}>
                  <Avatar src={project.leader.avatar} style={{ fontSize: 24 }} />
                  <Flex vertical gap={10}>
                    <span> <strong>{project.leader.fullName}</strong> lead this project</span>
                    <Flex vertical gap={5} >
                      <span> <i>Planned start at: </i> {moment(project.plannedStartTime).format("DD/MM/YYYY hh:mm A")} </span>
                      <span> <i>Planned end at: </i> {moment(project.plannedEndTime).format("DD/MM/YYYY hh:mm A")}</span>
                      <span> <i>Location: </i> {project.location}</span>
                    </Flex>
                  </Flex>
                </Flex>

              </div>
            </Flex>

          </Flex>
        </Col>
        <Col span={8} style={{ marginTop: "2rem" }}>
          <ProjectStatisticCard project={project} projectMembers={projectMembers} projectRequests={projectRequests} donations={donations} isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} />
        </Col>
      </Row>
      <Flex vertical gap={40} className="details-containter" style={{ margin: "1rem auto", width: "100%" }}>
        <ProjectDonationBoard donations={donations.filter((x) => x.donationStatus === "COMPLETED")} />
        <ProjectSpendingDetailContainer
                                       isLeader={false}
                                       spendingDetails={spendingDetails}
                                   />
      </Flex>
      <DonateProjectModal form={form} isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} project={project} handleDonate={handleDonate} />
    </StyledScreen>
  );
}
export default ProjectMoreDetailScreen;
