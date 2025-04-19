import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import OrganizationCard from "./OrganizationCard";

// Giả lập API lấy danh sách tổ chức
const fetchOrganizations = async () => {
  // Giả lập dữ liệu API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Vietnam Travel Guide VN",
          image: "https://via.placeholder.com/300x150",
          title: "Hello Viet Nam",
          members: "664K",
          postsPerDay: "10+",
          joined: false,
        },
        {
          id: 2,
          name: "Hanoi Foodies",
          image: "https://via.placeholder.com/300x150",
          title: "Taste Hanoi",
          members: "450K",
          postsPerDay: "8+",
          joined: false,
        },
        {
          id: 3,
          name: "Saigon Explorers",
          image: "https://via.placeholder.com/300x150",
          title: "Discover Saigon",
          members: "300K",
          postsPerDay: "5+",
          joined: false,
        },
        {
          id: 4,
          name: "Da Nang Adventures",
          image: "https://via.placeholder.com/300x150",
          title: "Explore Da Nang",
          members: "200K",
          postsPerDay: "3+",
          joined: false,
        },
        {
          id: 5,
          name: "Da Nang Adventures",
          image: "https://via.placeholder.com/300x150",
          title: "Explore Da Nang",
          members: "200K",
          postsPerDay: "3+",
          joined: false,
        },
      ]);
    }, 1000); // Giả lập thời gian gọi API
  });
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  // Lấy dữ liệu tổ chức từ API (giả lập)
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoading(true);
        const data = await fetchOrganizations();
        setOrganizations(data);
      } catch (err) {
        setError("Failed to load organizations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrganizations();
  }, []);

  // Xử lý sự kiện Tham gia nhóm
  const handleJoinGroup = (orgId) => {
    setOrganizations((prev) =>
      prev.map((org) => (org.id === orgId ? { ...org, joined: true } : org))
    );
    // Gọi API tham gia nhóm nếu cần
    console.log(`Joined group with ID: ${orgId}`);
  };

  // Xử lý sự kiện Đóng card
  const handleCloseCard = (orgId) => {
    setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
    console.log(`Closed card with ID: ${orgId}`);
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

  if (loading) {
    return (
      <div className="py-4 px-2 text-center text-white">
        <p>Loading organizations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-2 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="py-4 px-2 text-center text-white">
        <p>No organizations found.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-6">
      <p className="text-2xl font-bold mb-4 text-gray-800">
        Organizational suggestions
      </p>
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
            {organizations.map((org) => (
              <OrganizationCard
                key={org.id}
                org={org}
                handleCloseCard={handleCloseCard}
                handleJoinGroup={handleJoinGroup}
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
    </div>
  );
};

export default OrganizationSlider;
