import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Empty, List, Typography, Form, Input, Select, Tabs, Badge } from "antd";
import LoadingModal from "../../components/LoadingModal";
import RequestCard from "../../components/RequestCard/RequestCard";
import { fetchRequestsByUserIdThunk } from "../../redux/request/requestSlice";
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

function parseLocationString(locationString = "") {
  const parts = locationString.split(",").map(p => p.trim());
  // Lấy ra từ phải sang trái
  const provinceName = parts[parts.length - 1] || "";
  const districtName = parts[parts.length - 2] || "";
  const communeName  = parts[parts.length - 3] || "";
  // Còn lại (các phần đầu) ghép lại thành detail
  const detailParts  = parts.slice(0, parts.length - 3);
  const detail       = detailParts.join(", ");

  return { detail, communeName, districtName, provinceName };
}


/** Loại bỏ dấu và chuyển về chữ thường */
const normalizeString = (str = "") => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const MyRequestScreen = () => {
  const [requestCounts, setRequestCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    hidden: 0,
  });

  const dispatch = useDispatch();
  const loading = useSelector((state) => state.request.loading);
  const requestsByUserId = useSelector((state) => state.request.requestsByUserId) || [];
  const error = useSelector((state) => state.request.error);

  // Lấy user từ localStorage
  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (err) {
    console.error("Error parsing currentUser:", err);
  }

  // State filter, list filtered
  const [filters, setFilters] = useState({});
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [provinces, setProvinces] = useState([]);

  // Categories, tags từ Redux
  const categories = useSelector((state) => state.category.categories) || [];
  const tags = useSelector((state) => state.tag.tags) || [];

  useEffect(() => {
    const counts = {
      all: requestsByUserId.length,
      pending: requestsByUserId.filter(req => req.helpRequest.status.toLowerCase() === "pending").length,
      approved: requestsByUserId.filter(req => req.helpRequest.status.toLowerCase() === "approved").length,
      rejected: requestsByUserId.filter(req => req.helpRequest.status.toLowerCase() === "rejected").length,
      completed: requestsByUserId.filter(req => req.helpRequest.status.toLowerCase() === "completed").length,
      hidden: requestsByUserId.filter(req => req.helpRequest.status.toLowerCase() === "hidden").length,
    };
    setRequestCounts(counts);
  }, [requestsByUserId]);

  // Nếu chưa có categories/tags thì load
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
    if (!tags.length) dispatch(fetchTags());
  }, [dispatch, categories.length, tags.length]);

  // Lấy provinces từ open-api
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Lấy request của user 1 lần
  useEffect(() => {
    if (currentUser.id) {
      dispatch(fetchRequestsByUserIdThunk(currentUser.id));
    }
  }, [dispatch, currentUser.id]);

  // Mỗi khi requestsByUserId hoặc filters thay đổi -> filter cục bộ
  useEffect(() => {
    let data = [...requestsByUserId];

    // Filter by status
    if (activeTab !== "all") {
      data = data.filter(item => item.helpRequest.status.toLowerCase() === activeTab);
    }

    // Search (title, content)
    if (filters.search && filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter(item => {
        const title = item.helpRequest.title.toLowerCase();
        const content = item.helpRequest.content.toLowerCase();
        const email = item.helpRequest.email.toLowerCase();
        return title.includes(keyword) || content.includes(keyword) || email.includes(keyword);
      });
    }

    // Category
    if (filters.categoryId) {
      data = data.filter(item => item.helpRequest.category.id === filters.categoryId);
    }

    // Tags
    if (filters.requestTags && filters.requestTags.length > 0) {
      data = data.filter(item => {
        const requestTagIds = item.requestTags.map(t => t.tag.id);
        return filters.requestTags.some(filterTag => requestTagIds.includes(filterTag));
      });
    }

    // Province
    if (filters.province) {
      const filterProv = normalizeString(filters.province); // "ha giang" (nếu user chọn "Hà Giang")
      data = data.filter(item => {
        let requestProvName = "";
        if (item.request.provinceCode) {
          // Tìm object province trong list
          const provObj = provinces.find(p => p.code === item.helpRequest.provinceCode);
          if (provObj) {
            // "Tỉnh Hà Giang" -> ta bỏ tiền tố "Tỉnh " (nếu có) => "Hà Giang"
            const noPrefix = provObj.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
            requestProvName = normalizeString(noPrefix);
          }
        } else {
          // parse location => "Hà Giang"
          const { provinceName } = parseLocationString(item.helpRequest.location || "");
          requestProvName = normalizeString(provinceName);
        }
        // So sánh partial => "ha giang".includes("ha giang") => true
        return requestProvName.includes(filterProv);
      });
    }

    setFilteredRequests(data);
  }, [requestsByUserId, filters, activeTab, provinces]);

  const onValuesChange = (changedValues, allValues) => {
    if (!allValues.province) {
      delete allValues.province;
    }
    setFilters(allValues);
  };
  

  if (loading) return <LoadingModal />;
  if (error) {
    return <p style={{ color: "red" }}>Failed to load your requests: {error.message || error}</p>;
  }

  return (
    <div style={{ padding: "0 2rem" }}>
      {/* <Title level={5}>My Requests</Title> */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <TabPane tab={<Badge count={requestCounts.all} offset={[10, 0]} color="gray" >All</Badge>} key="all" />
      <TabPane tab={<Badge count={requestCounts.pending} offset={[10, 0]} color="gray" >Pending</Badge>} key="pending" />
      <TabPane tab={<Badge count={requestCounts.approved} offset={[10, 0]}>Approved</Badge>} key="approved" />
      <TabPane tab={<Badge count={requestCounts.rejected} offset={[10, 0]}>Rejected</Badge>} key="rejected" />
      <TabPane tab={<Badge count={requestCounts.completed} offset={[10, 0]} color="gray" >Completed</Badge>} key="completed" />
      <TabPane tab={<Badge count={requestCounts.hidden} offset={[10, 0]} color="gray" >Hidden</Badge>} key="hidden" />
    </Tabs>

      {/* Form filter */}
      <Form layout="inline" form={form} onValuesChange={onValuesChange} style={{ marginBottom: "1rem" }}>
      <Form.Item name="search" label="Search">
          <Input
            placeholder="Search requests" 
            allowClear 
            size="small"
            style={{ height: 31 }}
            suffix={null}
          />
        </Form.Item>
        <Form.Item name="categoryId" label="Category">
          <Select placeholder="Select category" allowClear style={{ minWidth: 150 }}>
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="requestTags" label="Tags">
          <Select mode="multiple" placeholder="Select tags" allowClear style={{ minWidth: 150 }}>
            {tags.map(tag => (
              <Option key={tag.id} value={tag.id}>
                {tag.tagName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* Province: hiển thị "Tỉnh Hà Giang" cho user, nhưng value là "Hà Giang" */}
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

      {filteredRequests.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={filteredRequests}
          renderItem={(request) => (
            <List.Item key={request.helpRequest.id}>
              <RequestCard requestData={request} />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No request found" />
      )}
    </div>
  );
};

export default MyRequestScreen;