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

  // Lọc ảnh/video (nếu backend trả về attachments)
  const imageUrls = requestData.attachments?.filter((url) =>
    url.match(/\.(jpeg|jpg|png|gif)$/i)
  ) || [];
  const videoUrls = requestData.attachments?.filter((url) =>
    url.match(/\.(mp4|webm|ogg)$/i)
  ) || [];

  const carouselSettings = {
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="request-detail-page">
      <div className="request-detail">
        {/* Tiêu đề */}
        <Title level={1} className="request-title">{request.title}</Title>

        {/* Carousel ảnh/video ngay dưới tiêu đề */}
        {(imageUrls.length > 0 || videoUrls.length > 0) && (
          <div className="request-carousel">
            <Carousel arrows  {...carouselSettings}>
              {imageUrls.map((url, index) => (
                <div key={`img-${index}`} className="media-slide">
                  <img src={url} alt={`request-img-${index}`} />
                </div>
              ))}
              {videoUrls.map((url, index) => (
                <div key={`vid-${index}`} className="media-slide">
                  <video src={url} controls />
                </div>
              ))}
            </Carousel>
          </div>
        )}

        {/* Thông tin người tổ chức + badge */}
        <div className="organizer-section">
          {user && (
            <div className="organizer-info">
              {/* Avatar user nếu có */}
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

          {/* Thông tin phone/email/location */}
          <Paragraph>
            <strong>Phone:</strong> {request.phone} <br />
            <strong>Email:</strong> {request.email} <br />
            <strong>Location:</strong> {request.location}
          </Paragraph>

          {/* Tags */}
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
      </div>
      <RequestActiveCarousel />
    </div>
  );
};

export default RequestDetailScreen;