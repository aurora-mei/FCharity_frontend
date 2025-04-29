import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import OrganizationCard from "./OrganizationCard";
import { useDispatch, useSelector } from "react-redux";
import {
  createJoinRequest,
  getRecommendedOrganizations,
} from "../../../redux/organization/organizationSlice";

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToScroll: 1,
  arrows: false,
  autoplay: false,
  autoplaySpeed: 3000,
  variableWidth: true, // Cho phép card hiển thị dựa trên độ rộng
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        variableWidth: true, // Giữ variableWidth trên desktop
      },
    },
    {
      breakpoint: 768,
      settings: {
        variableWidth: true, // Giữ variableWidth trên mobile
      },
    },
  ],
};

const OrganizationSlider = () => {
  const [organizations, setOrganizations] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const dispatch = useDispatch();

  const { recommendedOrganizations, loading, error } = useSelector(
    (state) => state.organization
  );

  // Lấy dữ liệu tổ chức từ API (giả lập)
  useEffect(() => {
    if (recommendedOrganizations.length == 0)
      dispatch(getRecommendedOrganizations());
    setOrganizations(recommendedOrganizations);
  }, [dispatch, recommendedOrganizations]);

  console.log("recommendedOrganizations", recommendedOrganizations);

  // Xử lý sự kiện Tham gia nhóm
  const handleJoinOrganization = async (organizationId) => {
    const joinRequestData = {
      organizationId: organizationId,
      userId: JSON.parse(localStorage.getItem("currentUser"))?.id,
    };

    console.log("joinRequestData", joinRequestData);

    try {
      dispatch(createJoinRequest(joinRequestData));
      setOrganizations((prev) =>
        prev.map((org) =>
          org.organizationId === organizationId ? { ...org, joined: true } : org
        )
      );
    } catch (error) {
      console.error("Failed to create join request:", error);
    }
  };

  // Điều hướng slider
  const goToPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const goToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  // Xử lý khi slide thay đổi
  const handleSlideChange = (current) => {
    setCurrentSlide(current);
  };

  // Kiểm tra có thể trượt trái/phải
  const canGoPrev = currentSlide > 0;
  const canGoNext =
    currentSlide <
    (organizations.length % 2 === 0
      ? organizations.length / 2 - 1
      : Math.floor(organizations.length / 2));

  return (
    <div className="mt-6 mb-6">
      <p
        className="text-2xl font-bold mb-4 text-gray-800"
        style={{
          marginBottom: "8px",
        }}
      >
        Recommended Organizations
      </p>
      <p>Total: {organizations.length}</p>
      <div className="">
        <div className="relative">
          {/* Nút điều hướng trái */}
          {canGoPrev && (
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-12 bg-white border border-gray-300 text-white p-3 rounded-full hover:bg-gray-200 hover:cursor-pointer transition z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Slider */}
          <Slider
            ref={sliderRef}
            {...sliderSettings}
            beforeChange={(oldIndex, newIndex) => handleSlideChange(newIndex)}
          >
            {organizations &&
              organizations.map((org) => (
                <OrganizationCard
                  key={org.organizationId}
                  org={org}
                  handleJoinOrganization={handleJoinOrganization}
                />
              ))}
          </Slider>

          {/* Nút điều hướng phải */}
          {canGoNext && (
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-12 bg-white border border-gray-300 text-white p-3 rounded-full hover:bg-gray-200 hover:cursor-pointer transition z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-end items-center mt-3 mr-3">
        <Link to="/organizations">Discover more organizations &gt;&gt;</Link>
      </div>
    </div>
  );
};

export default OrganizationSlider;
