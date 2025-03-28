import React, { useEffect, useState } from "react";
import { Carousel, Form, Input, Select,Flex } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import RequestCard from "../RequestCard/RequestCard";
import { fetchActiveRequests } from "../../redux/request/requestSlice";
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import provinceCoordinates from "./provinceCoordinates";

// Import React Leaflet cho map
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Hàm parse location
function parseLocationString(locationString = "") {
  const parts = locationString.split(",").map(p => p.trim());
  
  // If there are less than 3 parts, return what we can.
  if(parts.length < 3) {
    return { detail: locationString, communeName: "", districtName: "", provinceName: "" };
  }
  
  const provincePart = parts[parts.length - 1];
  const districtPart = parts[parts.length - 2];
  const communePart  = parts[parts.length - 3];
  const detailParts  = parts.slice(0, parts.length - 3);
  
  const detail = detailParts.join(", ");
  // For province, remove common prefixes (tỉnh, thành phố, tp)
  const provinceName = provincePart.replace(/^(tỉnh|thành phố|tp)\s*/i, "").trim();
  // For district, even if it contains "thành phố" keyword, treat it as district
  const districtName = districtPart.replace(/^(huyện|quận|thị xã|thành phố|tp)\s*/i, "").trim();
  // For commune, remove the commune keywords
  const communeName  = communePart.replace(/^(xã|phường|thị trấn)\s*/i, "").trim();
  
  return { detail, communeName, districtName, provinceName };
}

// Hàm normalize
function normalizeString(str = "") {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const { Option } = Select;

const RequestActiveCarousel = ({ search = true, map = true }) => {
  const dispatch = useDispatch();
  const activeRequests = useSelector((state) => state.request.activeRequests);
  const loading = useSelector((state) => state.request.loading);
  const error = useSelector((state) => state.request.error);

  // Lấy categories, tags
  const categories = useSelector((state) => state.category.categories) || [];
  const tags = useSelector((state) => state.tag.tags) || [];
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
    if (!tags.length) dispatch(fetchTags());
  }, [dispatch, categories.length, tags.length]);

  // Fetch provinces từ API (dùng để hiển thị tên cho filter)
  const [provinces, setProvinces] = useState([]);
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Gọi API lấy activeRequests (chỉ 1 lần)
  useEffect(() => {
    if (activeRequests.length === 0) {
      dispatch(fetchActiveRequests());
    }
  }, [dispatch, activeRequests.length]);

  // State filter cục bộ
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();

  // State filteredRequests
  const [filteredRequests, setFilteredRequests] = useState([]);

  // Mỗi khi activeRequests hoặc filters thay đổi, ta lọc cục bộ
  useEffect(() => {
    let data = [...activeRequests];

    // Lọc search
    if (filters.search && filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter((item) => {
        const title = item.helpRequest.title.toLowerCase();
        const content = item.helpRequest.content.toLowerCase();
        return title.includes(keyword) || content.includes(keyword);
      });
    }

    // Lọc category
    if (filters.categoryId) {
      data = data.filter((item) => item.helpRequest.category.id === filters.categoryId);
    }

    // Lọc tags
    if (filters.requestTags && filters.requestTags.length > 0) {
      data = data.filter((item) => {
        const requestTagIds = item.requestTags.map((t) => t.tag.id);
        return filters.requestTags.some((filterTag) => requestTagIds.includes(filterTag));
      });
    }

    // Lọc province (theo tên)
    if (filters.province) {
      const filterProvs = Array.isArray(filters.province)
        ? filters.province.map(normalizeString)
        : [normalizeString(filters.province)];
      data = data.filter((item) => {
        let requestProvName = "";
        if (item.helpRequest.provinceCode) {
          const provObj = provinces.find((p) => p.code === item.helpRequest.provinceCode);
          if (provObj) {
            const noPrefix = provObj.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
            requestProvName = normalizeString(noPrefix);
          }
        } else {
          const { provinceName } = parseLocationString(item.helpRequest.location || "");
          requestProvName = normalizeString(provinceName);
        }
        return filterProvs.some((filterProv) => requestProvName.includes(filterProv));
      });
    }

    setFilteredRequests(data);
  }, [activeRequests, filters, provinces]);

  const onValuesChange = (changedValues, allValues) => {
    if (!allValues.province) {
      delete allValues.province;
    }
    setFilters(allValues);
  };


  // Carousel settings
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
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1, infinite: true, dots: true },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1, slidesToScroll: 1, initialSlide: 1 },
      },
    ],
  };

  // --- Xử lý dữ liệu cho Map ---
  // Tạo object nhóm requests theo tên tỉnh (đã normalize)
  const requestsByProvince = {};
  filteredRequests.forEach((request) => {
    let provinceName = "";
    if (request.helpRequest.provinceCode) {
      const provObj = provinces.find((p) => p.code === request.helpRequest.provinceCode);
      if (provObj) {
        const noPrefix = provObj.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
        provinceName = normalizeString(noPrefix);
      }
    } else {
      const { provinceName: parsedProvince } = parseLocationString(request.helpRequest.location || "");
      provinceName = normalizeString(parsedProvince);
    }
    if (provinceName) {
      if (!requestsByProvince[provinceName]) {
        requestsByProvince[provinceName] = [];
      }
      requestsByProvince[provinceName].push(request);
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="request-active-carousel">

      <Flex vertical='true'>
        <b style={{ fontSize: "1.4rem", marginBottom:"1rem" }}>Active requests</b>
      </Flex>

      {/* Hiển thị search nếu search = true */}
      {search && (
        <Form layout="inline" form={form} onValuesChange={onValuesChange} style={{ marginBottom: "1rem" }}>
          <Form.Item name="search" label="Search">
            <Input placeholder="Search requests" allowClear size="small" style={{ height: 31 }} suffix={null} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category">
            <Select placeholder="Select category" allowClear style={{ minWidth: 150 }}>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="requestTags" label="Tags">
            <Select mode="multiple" placeholder="Select tags" allowClear style={{ minWidth: 150 }}>
              {tags.map((tag) => (
                <Option key={tag.id} value={tag.id}>
                  {tag.tagName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="province" label="Province">
            <Select placeholder="Select province" allowClear style={{ minWidth: 150 }}>
              {provinces.map(prov => {
                // Bỏ tiền tố "Tỉnh " nếu có
                const noPrefix = prov.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
                return (
                  <Option key={prov.code} value={noPrefix}>
                    {prov.name} {/* hiển thị Tỉnh Hà Giang, value = Hà Giang */}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      )}

      {Array.isArray(filteredRequests) && filteredRequests.length > 0 ? (
        <Carousel {...settings}>
          {filteredRequests.map((request) => (
            <div key={request.id}>
              <RequestCard requestData={request} showActions={false} />
            </div>
          ))}
        </Carousel>
      ) : (
        <p>No active requests found.</p>
      )}

      {/* Hiển thị map nếu map = true */}
      {map && (
        <div style={{ marginTop: "2rem" }}>
           <Flex vertical='true'>
        <b style={{ fontSize: "1.4rem", marginBottom:"1rem" }}>Active requests</b>
      </Flex>
          <MapContainer 
              center={[16.0471, 108.2062]} // Trung tâm VN (Đà Nẵng)
              zoom={8} 
              style={{ height: "500px", width: "100%" }}
              maxBounds={[[8.0, 102.0], [34.5, 110.5]]} // Giới hạn phạm vi VN
              maxBoundsViscosity={1.0} // Ngăn kéo bản đồ ra khỏi VN
            > 
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {Object.keys(requestsByProvince).map((provKey) => {
              const coord = provinceCoordinates[provKey];
              if (!coord) return null;
              const requests = requestsByProvince[provKey];
              return (
                <Marker key={provKey} position={[coord.lat, coord.lng]}>
                  <Popup>
                    <h3>
                      {coord.displayName} ({requests.length} request{requests.length > 1 ? "s" : ""})
                    </h3>
                    <ul>
                      {requests.slice(0, 5).map((req) => (
                        <li key={req.id}>
                          <strong>
                            <Link to={`/requests/${req.helpRequest.id}`}>{req.helpRequest.title}</Link>
                          </strong>
                        </li>
                      ))}
                      {requests.length > 5 && <li>...</li>}
                    </ul>

                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

// Mũi tên custom
const CustomPrevArrow = ({ onClick }) => (
  <LeftOutlined
    style={{
      position: "absolute",
      left: "-40px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "24px",
      color: "#000",
      zIndex: 10,
      cursor: "pointer",
    }}
    onClick={onClick}
  />
);
const CustomNextArrow = ({ onClick }) => (
  <RightOutlined
    style={{
      position: "absolute",
      right: "-40px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "24px",
      color: "#000",
      zIndex: 10,
      cursor: "pointer",
    }}
    onClick={onClick}
  />
);

export default RequestActiveCarousel;
