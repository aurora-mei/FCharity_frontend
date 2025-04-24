import React, { useEffect, useState, useCallback } from "react";
import { Carousel, Form, Input, Select, Flex, Skeleton, Empty, Modal, Button, Space } from "antd"; // Thêm Modal, Button, Space
import { LeftOutlined, RightOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons"; // Thêm FilterOutlined, ClearOutlined
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import RequestCard from "../RequestCard/RequestCard"; // Đảm bảo đường dẫn đúng
import { fetchActiveRequests } from "../../redux/request/requestSlice"; // Đảm bảo đường dẫn đúng
import { fetchCategories } from "../../redux/category/categorySlice"; // Đảm bảo đường dẫn đúng
import { fetchTags } from "../../redux/tag/tagSlice"; // Đảm bảo đường dẫn đúng
import provinceCoordinates from "./provinceCoordinates"; // Đảm bảo file này tồn tại và đúng

// Import React Leaflet cho map
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet'; // Import L để sửa lỗi icon marker
import "leaflet/dist/leaflet.css";

// ---- Sửa lỗi Icon Marker của Leaflet ----
// Leaflet không tự tìm thấy icon khi dùng với bundler như Webpack
// Cần import và đặt lại đường dẫn thủ công
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});
// -----------------------------------------


// Hàm parse location (giữ nguyên)
function parseLocationString(locationString = "") {
  const parts = locationString.split(",").map(p => p.trim());
  if(parts.length < 3) {
    return { detail: locationString, communeName: "", districtName: "", provinceName: "" };
  }
  const provincePart = parts[parts.length - 1];
  const districtPart = parts[parts.length - 2];
  const communePart  = parts[parts.length - 3];
  const detailParts  = parts.slice(0, parts.length - 3);
  const detail = detailParts.join(", ");
  const provinceName = provincePart.replace(/^(tỉnh|thành phố|tp)\s*/i, "").trim();
  const districtName = districtPart.replace(/^(huyện|quận|thị xã|thành phố|tp)\s*/i, "").trim();
  const communeName  = communePart.replace(/^(xã|phường|thị trấn)\s*/i, "").trim();
  return { detail, communeName, districtName, provinceName };
}

// Hàm normalize (giữ nguyên)
function normalizeString(str = "") {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const { Option } = Select;

const RequestActiveCarousel = ({ search = true, map = true }) => {
  const dispatch = useDispatch();
  const activeRequests = useSelector((state) => state.request.activeRequests);
  const loading = useSelector((state) => state.request.loading);
  const error = useSelector((state) => state.request.error);

  const categories = useSelector((state) => state.category.categories) || [];
  const tags = useSelector((state) => state.tag.tags) || [];
  const [provinces, setProvinces] = useState([]);

  // State filter và modal
  const [filters, setFilters] = useState({}); // State chứa bộ lọc ĐÃ ÁP DỤNG
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm(); // Form instance cho modal

  const [filteredRequests, setFilteredRequests] = useState([]);

  // Fetch data ban đầu
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
    if (!tags.length) dispatch(fetchTags());
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));
    if (activeRequests.length === 0) {
      dispatch(fetchActiveRequests());
    }
  }, [dispatch, categories.length, tags.length, activeRequests.length]);

  // Lọc danh sách request mỗi khi activeRequests hoặc filters (đã áp dụng) thay đổi
  useEffect(() => {
    let data = [...activeRequests];

    if (filters.search && filters.search.trim()) {
      const keyword = normalizeString(filters.search.trim()); // Chuẩn hóa keyword
      data = data.filter((item) => {
        const title = normalizeString(item.helpRequest.title || "");
        const content = normalizeString(item.helpRequest.content || "");
        return title.includes(keyword) || content.includes(keyword);
      });
    }

    if (filters.categoryId) {
      data = data.filter((item) => item.helpRequest.category?.id === filters.categoryId);
    }

    if (filters.requestTags && filters.requestTags.length > 0) {
      data = data.filter((item) => {
        const requestTagIds = item.requestTags?.map((t) => t.tag?.id) || [];
        return filters.requestTags.some((filterTag) => requestTagIds.includes(filterTag));
      });
    }

    if (filters.province) {
      const filterProvs = Array.isArray(filters.province)
        ? filters.province.map(normalizeString)
        : [normalizeString(filters.province)];

      if (filterProvs.length > 0 && filterProvs[0]) { // Chỉ lọc nếu có tỉnh được chọn
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
             // Check if requestProvName contains any of the filterProv values
            return filterProvs.some((filterProv) => requestProvName.includes(filterProv));
          });
      }
    }

    setFilteredRequests(data);
  }, [activeRequests, filters, provinces]); // Phụ thuộc vào filters đã áp dụng

  // --- Modal Handlers ---
  const showModal = () => {
    // Khi mở modal, đặt giá trị của form bằng bộ lọc hiện tại đã áp dụng
    form.setFieldsValue(filters);
    setIsModalVisible(true);
  };

  const handleApplyFilters = () => {
    const currentFormValues = form.getFieldsValue();
     // Xóa trường province nếu nó là undefined hoặc null (khi người dùng clear Select)
    if (!currentFormValues.province) {
       delete currentFormValues.province;
    }
    setFilters(currentFormValues); // Cập nhật bộ lọc chính
    setIsModalVisible(false); // Đóng modal
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
     // Không cần reset form ở đây vì khi mở lại, nó sẽ lấy giá trị từ `filters`
  };

  const handleClearAllFilters = () => {
    setFilters({}); // Xóa bộ lọc chính
    form.resetFields(); // Xóa các trường trong form (bao gồm cả form trong modal nếu đang mở)
     // Không cần đóng modal ở đây, nút này thường ở ngoài modal
  };
  // --------------------

  // Carousel settings (giữ nguyên)
  const settings = {
    dots: false, // Ẩn dots mặc định nếu dùng custom arrows nổi bật
    infinite: filteredRequests.length > 4, // Chỉ infinite nếu đủ thẻ để cuộn
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
     draggable: true, // Cho phép kéo trên mobile
    responsive: [
      {
        breakpoint: 1200, // Điều chỉnh breakpoint
        settings: { slidesToShow: 3, slidesToScroll: 1, infinite: filteredRequests.length > 3 },
      },
       {
        breakpoint: 992, // Điều chỉnh breakpoint
        settings: { slidesToShow: 2, slidesToScroll: 1, infinite: filteredRequests.length > 2 },
      },
      {
        breakpoint: 768, // Điều chỉnh breakpoint
        settings: { slidesToShow: 1, slidesToScroll: 1, infinite: filteredRequests.length > 1 },
      },
    ],
  };

  // Xử lý dữ liệu cho Map (giữ nguyên)
  const requestsByProvince = {};
  filteredRequests.forEach((request) => {
    let provinceName = "";
     let provinceDisplayName = "Unknown Location"; // Tên để hiển thị trên popup
    if (request.helpRequest.provinceCode) {
      const provObj = provinces.find((p) => p.code === request.helpRequest.provinceCode);
      if (provObj) {
        const noPrefix = provObj.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
        provinceName = normalizeString(noPrefix);
         provinceDisplayName = provObj.name; // Lấy tên đầy đủ để hiển thị
      }
    } else {
      const { provinceName: parsedProvince } = parseLocationString(request.helpRequest.location || "");
      provinceName = normalizeString(parsedProvince);
       provinceDisplayName = parsedProvince || "Unknown Location"; // Lấy tên đã parse
    }
    if (provinceName) {
      if (!requestsByProvince[provinceName]) {
        requestsByProvince[provinceName] = {
             requests: [],
             displayName: provinceDisplayName // Lưu tên hiển thị
         };
      }
      requestsByProvince[provinceName].requests.push(request);
    }
  });


  if (loading) return <Skeleton active paragraph={{ rows: 10 }}/>; // Skeleton chi tiết hơn
  if (error) return <div>Error loading requests: {error.message || 'Unknown error'}</div>;

  return (
    <div className="request-active-carousel" style={{ padding: '0 10px' }}> {/* Thêm padding nhỏ */}

      <Flex justify="space-between" align="center" style={{ marginBottom: "1rem" }}>
        <b style={{ fontSize: "1.4rem" }}>Requests Waiting To Be Registered</b>
        {/* Chỉ hiển thị nút Filter/Clear nếu prop search là true */}
        {search && (
          <Space>
            <Button icon={<FilterOutlined />} onClick={showModal}>
              Filter & Search
            </Button>
             {/* Chỉ hiển thị nút Clear nếu có bộ lọc đang được áp dụng */}
            {Object.keys(filters).length > 0 && (
              <Button icon={<ClearOutlined />} onClick={handleClearAllFilters} danger>
                Clear Filters
              </Button>
            )}
          </Space>
        )}
      </Flex>

        {/* --- Modal Filter --- */}
        <Modal
            title="Filter & Search Requests"
            visible={isModalVisible}
            onCancel={handleCancelModal}
            destroyOnClose // Reset form state khi modal đóng hoàn toàn
            footer={[
                <Button key="clear" onClick={() => form.resetFields()}>
                    Reset Fields
                </Button>,
                <Button key="cancel" onClick={handleCancelModal}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleApplyFilters}>
                    Apply Filters
                </Button>,
            ]}
        >
            <Form layout="vertical" form={form} initialValues={filters}>
                <Form.Item name="search" label="Search Keyword">
                    <Input placeholder="Enter keyword for title or content" allowClear />
                </Form.Item>
                <Form.Item name="categoryId" label="Category">
                    <Select placeholder="Select category" allowClear>
                    {categories.map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                        </Option>
                    ))}
                    </Select>
                </Form.Item>
                <Form.Item name="requestTags" label="Tags">
                    <Select mode="multiple" placeholder="Select tags" allowClear>
                    {tags.map((tag) => (
                        <Option key={tag.id} value={tag.id}>
                        {tag.tagName}
                        </Option>
                    ))}
                    </Select>
                </Form.Item>
                <Form.Item name="province" label="Province">
                     <Select placeholder="Select province" allowClear showSearch optionFilterProp="children" filterOption={(input, option) =>
                        normalizeString(option.children).includes(normalizeString(input))
                    }>
                    {provinces.sort((a,b) => a.name.localeCompare(b.name)).map(prov => {
                        const valueForFilter = prov.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
                        return (
                        <Option key={prov.code} value={valueForFilter}>
                            {prov.name}
                        </Option>
                        );
                    })}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
        {/* --- End Modal Filter --- */}


      {/* Carousel hiển thị filteredRequests */}
      {Array.isArray(filteredRequests) && filteredRequests.length > 0 ? (
        <Carousel {...settings}>
          {filteredRequests.map((request) => (
            // Thêm padding cho từng slide item để có khoảng cách
            <div key={request.helpRequest?.id || request.id} style={{ padding: '0 8px' }}>
              <RequestCard requestData={request} showActions={false} />
            </div>
          ))}
        </Carousel>
      ) : (
         // Hiển thị Empty state nếu không có request nào sau khi lọc
        <Empty description={Object.keys(filters).length > 0 ? "No requests match your filters" : "No active requests found"} />
      )}

      {/* Map (giữ nguyên logic hiển thị map) */}
      {map && (
        <div style={{ marginTop: "2rem" }}>
           <Flex vertical={true}> {/* Sửa lỗi typo vertical='true' thành vertical={true} */}
                <b style={{ fontSize: "1.4rem", marginBottom:"1rem" }}>Requests Distribution Map</b>
            </Flex>
            {/* Đảm bảo MapContainer có chiều cao */}
            <MapContainer
                center={[16.0471, 108.2062]}
                zoom={6} // Zoom nhỏ hơn để thấy tổng quan VN
                style={{ height: '500px', width: '100%' }} // Đặt chiều cao rõ ràng
                scrollWheelZoom={true} // Cho phép zoom bằng cuộn chuột
                maxBounds={[[8.1, 101.0], [23.5, 110.0]]} // Điều chỉnh giới hạn chặt hơn một chút
                maxBoundsViscosity={1.0}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {Object.keys(requestsByProvince).map((provKey) => {
                const data = requestsByProvince[provKey];
                if (!data || !data.requests || data.requests.length === 0) return null;

                const coord = provinceCoordinates[provKey]; // Lấy tọa độ từ file JSON/JS của bạn
                if (!coord) {
                    console.warn("Coordinates not found for province key:", provKey);
                    return null;
                }

                const requestCount = data.requests.length;
                const displayName = data.displayName; // Lấy tên hiển thị đã lưu

                return (
                    <Marker key={provKey} position={[coord.lat, coord.lng]}>
                    <Popup>
                        <h3 style={{ marginBottom: '5px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                            {displayName} ({requestCount} request{requestCount > 1 ? "s" : ""})
                        </h3>
                        <ul style={{ listStyle: 'none', paddingLeft: 0, maxHeight: '150px', overflowY: 'auto', margin: 0 }}>
                        {data.requests.slice(0, 5).map((req) => ( // Chỉ hiển thị tối đa 5 request trong popup
                            <li key={req.helpRequest?.id || req.id} style={{ marginBottom: '3px' }}>
                            <Link to={`/requests/${req.helpRequest?.id || req.id}`} title={req.helpRequest?.title || 'Untitled Request'}>
                                {/* Cắt bớt title nếu quá dài */}
                                { (req.helpRequest?.title || 'Untitled Request').length > 40
                                    ? (req.helpRequest?.title || 'Untitled Request').substring(0, 37) + '...'
                                    : (req.helpRequest?.title || 'Untitled Request') }
                            </Link>
                            </li>
                        ))}
                        {requestCount > 5 && <li style={{ fontStyle: 'italic', color: '#888' }}>...and {requestCount - 5} more</li>}
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

// Custom Arrows (giữ nguyên)
const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <LeftOutlined
       className={className} // Giữ lại className để có thể style từ CSS của Carousel nếu cần
      style={{ ...style, display: "block", left: "-25px", fontSize: "20px", color: "#555" , zIndex: 10 }} // Điều chỉnh style
      onClick={onClick}
    />
  );
};
const CustomNextArrow = (props) => {
   const { className, style, onClick } = props;
  return (
    <RightOutlined
      className={className}
      style={{ ...style, display: "block", right: "-25px", fontSize: "20px", color: "#555", zIndex: 10 }}
      onClick={onClick}
    />
  );
};


export default RequestActiveCarousel;