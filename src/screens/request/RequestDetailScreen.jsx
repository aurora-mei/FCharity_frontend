import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchRequestById } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import { Carousel, Typography, Alert, Tag, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import RequestActiveCarousel from "../../components/RequestActiveCarousel/RequestActiveCarousel";

const { Title, Text, Paragraph } = Typography;

const RequestDetailScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.request.loading);
  const requestData = useSelector((state) => state.request.currentRequest);
  const error = useSelector((state) => state.request.error);

  useEffect(() => {
    dispatch(fetchRequestById(id));
  }, [dispatch, id]);

  if (loading) return <LoadingModal />;

  if (error) {
    return (
      <div className="request-detail-page">
        <Alert message="Error" description={error.message} type="error" showIcon />
      </div>
    );
  }

  if (!requestData || !requestData.request) {
    return (
      <div className="request-detail-page">
        <Alert message="Error" description="Request not found" type="error" showIcon />
      </div>
    );
  }

  // Lấy data
  const { request, requestTags } = requestData;
  const { user } = request || {};

  const attachments = (requestData.attachments || []).filter(
    (url) => url && typeof url === "string"
  );

  // Mũi tên tuỳ chỉnh cho carousel (nếu cần)
  const PrevArrow = ({ onClick }) => (
    <LeftOutlined className="slick-arrow slick-prev" onClick={onClick} />
  );
  const NextArrow = ({ onClick }) => (
    <RightOutlined className="slick-arrow slick-next" onClick={onClick} />
  );

  const carouselSettings = {
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  return (
    <div className="request-detail-page">
      {/* Tiêu đề */}
      <Title level={1} className="request-title">{request.title}</Title>  
      {/* 📌 Hiển thị tất cả attachments ở đầu trang */}
      {attachments.length > 0 && (
        <Carousel {...carouselSettings} className="attachments-carousel">
          {attachments.map((url, index) => (
            <div key={index} className="attachment-slide">
              {url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                <img src={url} alt={`Attachment ${index}`} className="carousel-image" />
              ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                <video controls className="carousel-video">
                  <source src={url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>
          ))}
        </Carousel>
      )}

      {/* Thông tin người tổ chức + badge */}
      <div className="organizer-section">
        {user && (
          <div className="organizer-info">
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt="avatar"
                className="organizer-avatar"
              />
            )}
            <Text className="organizer-text">
              {user.fullName} is organizing this fundraiser
              {request.userOnBehalf && (
                <> on behalf of {request.userOnBehalf.fullName}</>
              )}
            </Text>
          </div>
        )}
        <Tag color="green">Donation Proceed</Tag>
      </div>

      {/* Nội dung mô tả chính */}
      <div className="request-main-content">
        <Paragraph>{request.content}</Paragraph>
        <Paragraph>
          <strong>Phone:</strong> {request.phone} <br />
          <strong>Email:</strong> {request.email} <br />
          <strong>Location:</strong> {request.location}
        </Paragraph>
        {requestTags?.length > 0 && (
          <Paragraph className="request-tags">
            {requestTags.map((taggable) => (
              <Tag key={taggable.tag.id} color="blue">
                {taggable.tag.tagName}
              </Tag>
            ))}
          </Paragraph>
        )}
      </div>

      {/* Nút Donate */}
      <div className="donate-button-container">
        <Button type="primary" size="large" className="continue-button">
          Donate Now
        </Button>
      </div>

      {/* Active Requests Carousel - Loại bỏ request hiện tại */}
      {/* { <div className="active-requests-section">
        <RequestActiveCarousel />
      </div> } */}
    </div>
  );
};

export default RequestDetailScreen;
