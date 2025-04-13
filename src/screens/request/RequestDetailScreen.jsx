import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { fetchRequestById } from "../../redux/request/requestSlice";
import LoadingModal from "../../components/LoadingModal";
import { Carousel, Typography, Alert, Tag, Button, Breadcrumb, Flex, message, Badge, Card } from "antd"; // Badge and Card moved here
import { LeftOutlined, RightOutlined, CheckCircleOutlined, UserOutlined, HomeOutlined } from "@ant-design/icons";
import RequestActiveCarousel from "../../components/RequestActiveCarousel/RequestActiveCarousel";
// Removed duplicate Badge, Card import
import { fetchMyOrganization, fetchOrganizationMembers } from "../../redux/organization/organizationSlice";
// Removed duplicate useNavigate import

const { Title, Text, Paragraph } = Typography;
const items =
  [
    {
      href: '/requests/myrequests', // Consider making this dynamic or relative if needed
      title: <HomeOutlined />,
    },
    {
      title: 'Request Detail',
    },
  ];

const RequestDetailScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myOrganization = useSelector((state) => state.organization.myOrganization);
  const loading = useSelector((state) => state.request.loading);
  const requestData = useSelector((state) => state.request.currentRequest);
  const orgMembers = useSelector((state) => state.organization.myOrganizationMembers);
  const error = useSelector((state) => state.request.error);
  const [expanded, setExpanded] = useState(false);

  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Error parsing currentUser from localStorage:", error);
  }

  // Fetch request details
  useEffect(() => {
    if (id) { // Ensure id is present before fetching
      dispatch(fetchRequestById(id));
      window.scrollTo(0, 0); // Scroll to top when request loads
    }
  }, [dispatch, id]);

  // Fetch user's organization
  useEffect(() => {
    // console.log("currentUser for org fetch", currentUser) // Keep for debugging if needed
    if (currentUser?.id) { // Use optional chaining and check if id exists
      dispatch(fetchMyOrganization(currentUser.id));
    }
  }, [dispatch, currentUser?.id]); // Depend on currentUser.id

  // Fetch organization members
  useEffect(() => {
    if (myOrganization?.organizationId) { // Use optional chaining and check if organizationId exists
      dispatch(fetchOrganizationMembers(myOrganization.organizationId));
    }
  }, [dispatch, myOrganization?.organizationId]); // Depend on organizationId

  // --- Share Button Handler ---
  const handleShareClick = () => {
    // Get the current page URL
    const currentUrl = window.location.href;
    // Construct the Facebook Sharer URL
    // We encode the current URL to make sure it's passed correctly as a parameter
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;

    // Open the Facebook Sharer dialog in a new tab/window
    // 'noopener noreferrer' is important for security when opening external links
    window.open(facebookShareUrl, '_blank', 'noopener,noreferrer');
  };
  // --- End Share Button Handler ---

  if (loading) return <LoadingModal />;

  // Simplified error handling
  if (error) {
    return (
      <div className="request-detail-page" style={{ padding: "2rem" }}>
        <Alert message="Error" description={error.message || "Failed to load request."} type="error" showIcon />
      </div>
    );
  }

  // Improved check for request data
  if (!requestData?.helpRequest) {
    // Don't show loading here, show not found or different error
    return (
      <div className="request-detail-page" style={{ padding: "2rem" }}>
        <Alert message="Not Found" description="The requested resource could not be found." type="warning" showIcon />
        <Button onClick={() => navigate('/requests/myrequests')} style={{ marginTop: '1rem' }}>Go Back</Button>
      </div>
    );
  }


  // Lấy data (safer access with optional chaining)
  const { helpRequest, requestTags, attachments } = requestData;
  const { user, category, title, content, phone, email, location } = helpRequest;

  // Filter media URLs (safer with optional chaining)
  const imageUrls = attachments?.filter((att) =>
    att.filePath?.match(/\.(jpeg|jpg|png|gif|webp)$/i) // Check filePath exists
  ).map(att => att.filePath) || []; // Map to get the actual URL string
  const videoUrls = attachments?.filter((att) =>
    att.filePath?.match(/\.(mp4|webm|ogg)$/i) // Check filePath exists
  ).map(att => att.filePath) || []; // Map to get the actual URL string


  const carouselSettings = {
    dots: true, // Added dots for better navigation
    arrows: true,
    prevArrow: <LeftOutlined />,
    nextArrow: <RightOutlined />,
    infinite: imageUrls.length + videoUrls.length > 1, // Only infinite if more than one item
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true, // Adjust height based on content
  };

  return (
    <Flex vertical gap={20} style={{ padding: "1rem 2rem 2rem 2rem", maxWidth: '1200px', margin: '0 auto' }} > {/* Adjusted padding and max-width */}
      <Breadcrumb items={items} />
      <Flex vertical gap={20} className="request-detail"> {/* Increased gap */}
        {/* Title */}
        <Title level={2} style={{ marginBottom: '0.5rem' }}>{title}</Title> {/* Adjusted level and margin */}

        {/* Media Carousel */}
        {(imageUrls.length > 0 || videoUrls.length > 0) && (
          <div className="request-carousel" style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f0f0f0' }}> {/* Added border */}
            <Carousel {...carouselSettings}>
              {imageUrls.map((url, index) => (
                <div key={`img-${index}`} className="media-slide" style={{ background: '#f7f7f7' }}> {/* Added background */}
                  {/* Ensure consistent image display */}
                  <img
                    src={url}
                    alt={`request-media-${index}`}
                    style={{ width: '100%', height: '400px', objectFit: 'contain', display: 'block' }} // Adjust height, objectFit
                  />
                </div>
              ))}
              {videoUrls.map((url, index) => (
                <div key={`vid-${index}`} className="media-slide" style={{ background: '#000' }}> {/* Dark background for video */}
                  <video
                    src={url}
                    controls
                    style={{ width: '100%', height: '400px', display: 'block' }} // Consistent height
                  />
                </div>
              ))}
            </Carousel>
            {category?.categoryName && (
              <Tag color="blue" className="category-badge" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
                {category.categoryName}
              </Tag>
            )}
          </div>
        )}

        {/* User/Organizer Info */}
        {user && ( // Check if user exists
          <Card size="small"> {/* Wrap in a card for better visual grouping */}
            <Flex align="center" gap={15}>
              <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Text strong>{user.fullName || 'Unknown User'}</Text>
                <div style={{ fontSize: '0.85rem', color: '#595959', marginTop: '4px' }}>
                  {phone && <span><strong>Phone:</strong> {phone}<br /></span>}
                  {email && <span><strong>Email:</strong> {email}<br /></span>}
                  {location && <span><strong>Location:</strong> {location}</span>}
                </div>
              </div>
            </Flex>
          </Card>
        )}


        <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0' }} />

        {/* Tags */}
        {requestTags?.length > 0 && (
          <div className="request-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {requestTags.map((taggable) => (
              <Tag
                key={taggable.tag.id}
                icon={<CheckCircleOutlined />}
                color="success" // Use Ant Design colors
                style={{ borderRadius: '12px', padding: '3px 8px' }} // Style adjustments
              >
                {taggable.tag.tagName}
              </Tag>
            ))}
          </div>
        )}

        {/* Content */}
        <Card title="Details" size="small"> {/* Added card around content */}
          <Paragraph style={{ whiteSpace: 'pre-wrap' }}> {/* Preserve line breaks */}
            {expanded ? content : `${content?.substring(0, 800)}${content?.length > 800 ? '...' : ''}`}
          </Paragraph>
          {content?.length > 800 && ( // Only show Read More/Less if content is long
            <Button type="link" style={{ paddingLeft: 0 }} onClick={() => setExpanded(!expanded)}>
              {expanded ? "Read Less" : "Read More"}
            </Button>
          )}
        </Card>


        {/* Action Buttons */}
        <Flex gap={10} style={{ marginTop: '1rem' }}>
          {currentUser?.id !== user?.id && ( // Safer check with optional chaining
            <Button type="primary" block style={{ flex: 1 }} onClick={() => {
              if (myOrganization) {
                if (myOrganization.organizationStatus === "APPROVED") {
                  const availableMembers = orgMembers?.filter((member) => member.user.userRole !== "Leader"); // Check orgMembers exist
                  if (!availableMembers || availableMembers.length === 0) { // Check if filter result is empty or orgMembers is null/undefined
                    message.error("Your organization doesn't have any available members to assign.");
                  } else {
                    navigate(`/manage-organization/projects/create/${helpRequest.id}`);
                  }
                } else {
                  message.warning(`Your organization (${myOrganization.organizationName}) is pending approval or has been rejected.`);
                }
              } else {
                message.error("You must be the leader of an organization to register for this request.");
              }
            }}>
              Register Project
            </Button>
          )}
          {/* Updated Share Button */}
          <Button type="default" block style={{ flex: 1 }} onClick={handleShareClick}>
            Share
          </Button>
        </Flex>

      </Flex>

      {/* Related/Active Carousel */}
      {/* Passing props explicitly */}
      <RequestActiveCarousel showSearch={false} showMap={false} title="Other Active Requests" />
    </Flex>
  );
};

export default RequestDetailScreen;