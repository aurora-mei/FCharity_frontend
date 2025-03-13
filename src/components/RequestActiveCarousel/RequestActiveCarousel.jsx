import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { fetchActiveRequests } from "../../redux/request/requestSlice";
import RequestCard from "../RequestCard/RequestCard";


const RequestActiveCarousel = () => {
    const dispatch = useDispatch();
    const activeRequests = useSelector((state) => state.request.activeRequests);
    const loading = useSelector((state) => state.request.loading);
    const error = useSelector((state) => state.request.error);

    useEffect(() => {
        if (activeRequests.length === 0) {
            dispatch(fetchActiveRequests());
        }
    }, [dispatch]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true, // Bật hiển thị mũi tên
        prevArrow: <CustomPrevArrow />, // Mũi tên trước tùy chỉnh
        nextArrow: <CustomNextArrow />, // Mũi tên sau tùy chỉnh
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: 1
                }
            }
        ]
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="request-active-carousel">
            {Array.isArray(activeRequests) && activeRequests.length > 0 ? (
                <Carousel {...settings}>
                    {activeRequests.map((request) => (
                        <div key={request.id}>
                            <RequestCard requestData={request} showActions={false} />
                        </div>
                    ))}
                </Carousel>
            ) : (
                <p>No active requests found.</p>
            )}
        </div>
    );
};

// Thành phần mũi tên trước tùy chỉnh
const CustomPrevArrow = ({ onClick }) => (
    <LeftOutlined
        style={{
            position: "absolute",
            left: "-40px", // Dịch sang trái để không che nội dung
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "24px",
            color: "#000",
            zIndex: 10, // Đảm bảo hiển thị trên các phần khác
            cursor: "pointer"
        }}
        onClick={onClick}
    />
);

// Thành phần mũi tên sau tùy chỉnh
const CustomNextArrow = ({ onClick }) => (
    <RightOutlined
        style={{
            position: "absolute",
            right: "-40px", // Dịch sang phải để không che nội dung
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "24px",
            color: "#000",
            zIndex: 10,
            cursor: "pointer"
        }}
        onClick={onClick}
    />
);


export default RequestActiveCarousel;
