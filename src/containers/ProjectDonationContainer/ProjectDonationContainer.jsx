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
  Empty,
} from "antd";
import {
  UserOutlined,
  LeftCircleOutlined,
  HomeOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { getOrganizationById } from "../../redux/organization/organizationSlice";
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
import ProjectDonationBoard from "../../containers/ProjectDonationBoard/ProjectDonationBoard";
import moment from "moment-timezone";
import ProjectStatisticCard from "../../containers/ProjectStatisticCard/ProjectStatisticCard";
import ProjectFinancePlanContainer from "../../containers/ProjectFinancePlanContainer/ProjectFinancePlanContainer";
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
    padding: 0 ;
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

const ProjectDonationContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [form] = Form.useForm(); // Khởi tạo form instance

  const currentProject = useSelector((state) => state.project.currentProject);
  const donations = useSelector((state) => state.project.donations);

  const loading = useSelector((state) => state.project.loading);

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
  useEffect(() => {
    if (currentProject.project) {
      dispatch(getOrganizationById(currentProject.project.organizationId));
    }
  }, [dispatch, currentProject.project, donations]);

  // Lọc ảnh/video (nếu backend trả về attachments)
  const imageUrls =
    currentProject.attachments?.filter((url) =>
      url.imageUrl.match(/\.(jpeg|jpg|png|gif)$/i)
    ) || [];
  const videoUrls =
    currentProject.attachments?.filter((url) =>
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
  return (
    // <div>   </div>
    <>
      {donations && donations.length > 0 ? (
          <ProjectDonationBoard donations={donations} />
        ) : (
          <Empty title="No donations available"></Empty>
        )}
    </>
  );
};
export default ProjectDonationContainer;
