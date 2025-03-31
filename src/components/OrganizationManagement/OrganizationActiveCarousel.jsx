import React, { useEffect } from "react";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrganizations } from "../../redux/organization/organizationSlice";
import OrganizationCard from "./OrganizationCard";

const OrganizationActiveCarousel = () => {
  const dispatch = useDispatch();
  const organizations = useSelector((state) => state.organization.organizations);
  const loading = useSelector((state) => state.organization.loading);
  const error = useSelector((state) => state.organization.error);

  // Gọi API để lấy tất cả tổ chức khi component được render lần đầu
  useEffect(() => {
    dispatch(getAllOrganizations());
  }, [dispatch]);

  // Lọc ra các tổ chức có trạng thái "APPROVED"
  const approvedOrganizations = organizations.filter((org) => org.status === "APPROVED");

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow />, 
    nextArrow: <CustomNextArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="organization-active-carousel">
      <h2>Approved Organizations</h2>
      {approvedOrganizations.length > 0 ? (
        <Carousel {...settings}>
          {approvedOrganizations.map((org) => (
            <div key={org.id}>
              <OrganizationCard organizationData={org} />
            </div>
          ))}
        </Carousel>
      ) : (
        <p>No approved organizations found.</p>
      )}
    </div>
  );
};

const CustomPrevArrow = ({ onClick }) => (
  <LeftOutlined className="custom-arrow prev" onClick={onClick} />
);
const CustomNextArrow = ({ onClick }) => (
  <RightOutlined className="custom-arrow next" onClick={onClick} />
);

export default OrganizationActiveCarousel;
