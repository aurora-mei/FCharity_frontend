import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchRequestById } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import { Carousel, Typography, Alert, Tag, Button, Breadcrumb, Flex } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import RequestActiveCarousel from "../../components/RequestActiveCarousel/RequestActiveCarousel";
import { Badge, Card } from "antd";
import { CheckCircleOutlined, UserOutlined, HomeOutlined } from "@ant-design/icons";
const { Title, Text, Paragraph } = Typography;
const items =
  [
    {
      href: '/requests/myrequests',
      title: <HomeOutlined />,
    },
    {
      title: 'Request Detail',
    },
  ];
const RequestDetailScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.request.loading);
  const requestData = useSelector((state) => state.request.currentRequest);
  const error = useSelector((state) => state.request.error);
  const [expanded, setExpanded] = useState(false);
  const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }
    
  useEffect(() => {
    dispatch(fetchRequestById(id));
  }, [dispatch, id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <LoadingModal />;

  if (error) {
    return (
      <div className="request-detail-page">
        <Alert message="Error" description={error.message} type="error" showIcon />
      </div>
    );
  }

  if (!requestData || !requestData.helpRequest) {
    return (
      <div className="request-detail-page">
        <Alert message="Error" description="Request not found" type="error" showIcon />
      </div>
    );
  }

  // Lấy data
  const { helpRequest, requestTags } = requestData;
  const { user } = helpRequest || {};

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
    <Flex vertical gap={10} style={{ padding: "0 6rem 2rem 6rem", margin: "0" }} >
      <Flex gap={10} vertical className="request-detail-page" >
        <Breadcrumb
          items={items} />
        <Flex vertical gap={10} className="request-detail">
          {/* Tiêu đề */}
          <Title level={3} className="request-title">{helpRequest.title}</Title>

          {/* Carousel ảnh/video ngay dưới tiêu đề */}
          {(imageUrls.length > 0 || videoUrls.length > 0) && (
            <div className="request-carousel" style={{ position: 'relative' }}>
              <Carousel arrows  {...carouselSettings} style={{ position: 'relative', borderRadius: 10 }}>
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
              <span className="category-badge">
                {helpRequest.category.categoryName}
              </span>
            </div>
          )}

          {/* Tổ chức gây quỹ */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <UserOutlined style={{ fontSize: 24 }} />
            <div>
              <strong>{helpRequest.user.fullName}</strong> <br />
              <div style={{ fontSize: 10, marginTop: 5 }}>
                <strong>Phone:</strong> {helpRequest.phone} <br />
                <strong>Email:</strong> {helpRequest.email} <br />
                <strong>Location:</strong> {helpRequest.location}
              </div>

              {/* <p style={{ margin: 0, color: "#666" }}>Churchtown Primary School and David Clayton are organizing this fundraiser.</p> */}
            </div>
          </div>

          <hr />
          {requestTags?.length > 0 && (
            <Paragraph className="request-tags">
              {requestTags.map((taggable) => (
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
          {/* Badge bảo vệ quyên góp */}


          {/* Nội dung gây quỹ */}
          {/* <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "Read more" }}>{request.content}</Paragraph> */}
          {expanded ? <Paragraph>{`${helpRequest.content}`} </Paragraph> : <Paragraph>{`${helpRequest.content.substring(0, 800)}...`}</Paragraph>}
          <a style={{ fontSize: "0.9rem", color: "gray" }} onClick={() => setExpanded(!expanded)}>
            {expanded ? "Read Less" : "Read More"}
          </a>
          {/* <Paragraph
            ellipsis={{ rows: 2, expandable: true, symbol: "Read more" }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nam sagittis quam a ligula pharetra, sit amet dictum ex tristique.
          </Paragraph> */}
          {/* <p style={{ color: "#444" }}>
            Churchtown Primary School, a vibrant and beloved community school in Southport, is raising funds for a new playground to honour the memory of two children, Alice and Bebe, who tragically lost their lives in the Southport stabbings in July 2024.
          </p>

          <p style={{ color: "#444" }}>
            This new playground, which has been proposed by Alice’s parents as a way of honouring her memory, will serve as a joyful, healing space for all our pupils...
          </p>

          <a href="#">Read more</a> */}

          {/* Nút Donate & Share */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {currentUser.id !== requestData.helpRequest.user.id && (
            <Button type="default" block style={{ flex: 1 }}>
              Register
            </Button>
          )}
            <Button type="default" block style={{ flex: 1 }}>
              Share
            </Button>
          </div>

        </Flex>

      </Flex>
      <RequestActiveCarousel search={false} map={false} />
    </Flex>
  );
};

export default RequestDetailScreen;