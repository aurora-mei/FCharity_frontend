import React, { useEffect, useState } from "react";
import { Empty, List, Typography, Form, Input, Select, Tabs, Badge } from "antd";
import LoadingModal from "../../components/LoadingModal";
import RequestCard from "../../components/RequestCard/RequestCard";
import { fetchRequestsByUserIdThunk } from "../../redux/request/requestSlice";
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useDispatch, useSelector } from "react-redux";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

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

// Normalize a string (remove diacritics and convert to lowercase)
const normalizeString = (str = "") =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Get an array of years from (currentYear - 10) to currentYear
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 10; y <= currentYear; y++) {
    years.push(y.toString());
  }
  return years;
};

// Compute monthly counts for the filtered requests (for a given year)
const processRequestsByMonth = (requests, year) => {
  const counts = {};
  // Initialize counts for all 12 months
  for (let m = 1; m <= 12; m++) {
    const monthStr = m.toString().padStart(2, "0");
    counts[monthStr] = 0;
  }
  requests.forEach((req) => {
    const date = new Date(req.helpRequest.creationDate);
    if (date.getFullYear().toString() === year) {
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      counts[month] = (counts[month] || 0) + 1;
    }
  });
  return {
    labels: Object.keys(counts),
    data: Object.values(counts),
  };
};

const MyRequestScreen = () => {
  const [requestCounts, setRequestCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    hidden: 0,
  });

  const [filters, setFilters] = useState({});
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [provinces, setProvinces] = useState([]);
  
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.request.loading);
  const requestsByUserId = useSelector((state) => state.request.requestsByUserId) || [];
  const error = useSelector((state) => state.request.error);

  // Get user from localStorage
  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (err) {
    console.error("Error parsing currentUser:", err);
  }

  const categories = useSelector((state) => state.category.categories) || [];
  const tags = useSelector((state) => state.tag.tags) || [];

  // Update request counts based on requestsByUserId
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

  // Load categories and tags if not available
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
    if (!tags.length) dispatch(fetchTags());
  }, [dispatch, categories.length, tags.length]);

  // Load provinces from open-api
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Fetch user's requests on mount
  useEffect(() => {
    if (currentUser.id) {
      dispatch(fetchRequestsByUserIdThunk(currentUser.id));
    }
  }, [dispatch, currentUser.id]);

  // Filter requests whenever requests, filters, activeTab, or provinces change
  useEffect(() => {
    let data = [...requestsByUserId];

    // Filter by status tab
    if (activeTab !== "all") {
      data = data.filter(item => item.helpRequest.status.toLowerCase() === activeTab);
    }

    // Filter by search keyword
    if (filters.search && filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter(item => {
        const title = item.helpRequest.title.toLowerCase();
        const content = item.helpRequest.content.toLowerCase();
        const email = item.helpRequest.email.toLowerCase();
        return title.includes(keyword) || content.includes(keyword) || email.includes(keyword);
      });
    }

    // Filter by category
    if (filters.categoryId) {
      data = data.filter(item => item.helpRequest.category.id === filters.categoryId);
    }

    // Filter by tags
    if (filters.requestTags && filters.requestTags.length > 0) {
      data = data.filter(item => {
        const requestTagIds = item.requestTags.map(t => t.tag.id);
        return filters.requestTags.some(filterTag => requestTagIds.includes(filterTag));
      });
    }

    // Filter by province
    if (filters.province) {
      const filterProv = normalizeString(filters.province);
      data = data.filter(item => {
        let requestProvName = "";
        if (item.helpRequest?.provinceCode) {
          const provObj = provinces.find(p => p.code === item.helpRequest.provinceCode);
          if (provObj) {
            const noPrefix = provObj.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
            requestProvName = normalizeString(noPrefix);
          }
        } else {
          const { provinceName } = parseLocationString(item.helpRequest?.location || "");
          requestProvName = normalizeString(provinceName);
        }
        return requestProvName.includes(filterProv);
      });
    }

    // Filter by year if provided
    if (filters.year) {
      data = data.filter(item => {
        const date = new Date(item.helpRequest.creationDate);
        return date.getFullYear().toString() === filters.year;
      });
    }

    setFilteredRequests(data);
  }, [requestsByUserId, filters, activeTab, provinces]);

  // Update filters when form values change
  const onValuesChange = (changedValues, allValues) => {
    if (!allValues.province) {
      delete allValues.province;
    }
    setFilters(allValues);
  };

  // Prepare data for monthly chart (for the selected year from the filter)
  const selectedYear = filters.year || new Date().getFullYear().toString();
  const { labels: months, data: requestCountsByMonth } = processRequestsByMonth(filteredRequests, selectedYear);

  const barChartData = {
    labels: months,
    datasets: [
      {
        label: "Requests per Month",
        backgroundColor: "#3498db",
        borderColor: "#2980b9",
        data: requestCountsByMonth,
      },
    ],
  };

  const lineChartData = {
    labels: months,
    datasets: [
      {
        label: "Requests per Month",
        backgroundColor: "rgba(52, 152, 219, 0.2)",
        borderColor: "#3498db",
        pointBackgroundColor: "#2980b9",
        data: requestCountsByMonth,
        fill: true,
      },
    ],
  };

  // Compute year options (current year - 10 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= currentYear - 10; y--) {
    yearOptions.push(y.toString());
  }


  if (loading) return <LoadingModal />;
  if (error) {
    return <p style={{ color: "red" }}>
      Failed to load your requests: {error.message || error}
    </p>;
  }

  return (
    <div style={{ padding: "0 2rem" }}>
      <Form layout="inline" form={form} onValuesChange={onValuesChange} style={{ marginBottom: "1rem" }}>
      <Form.Item name="year" label="Year">
          <Select placeholder="Select year" allowClear style={{ minWidth: 100 }}>
            {yearOptions.map(year => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      {/* Charts for monthly trend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ width: "45%" }}>
          <h3>Monthly Trend (Bar Chart)</h3>
          <Bar data={barChartData} />
        </div>
        <div style={{ width: "45%" }}>
          <h3>Monthly Trend (Line Chart)</h3>
          <Line data={lineChartData} />
        </div>
      </div>

      {/* Filter Form */}
      <Form layout="inline" form={form} onValuesChange={onValuesChange} style={{ marginBottom: "1rem" }}>
        <Form.Item name="search" label="Search">
          <Input placeholder="Search requests" allowClear size="small" style={{ height: 31 }} />
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
        {/* Province filter */}
        <Form.Item name="province" label="Province">
          <Select placeholder="Select province" allowClear style={{ minWidth: 150 }}>
            {provinces.map(prov => {
              const noPrefix = prov.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
              return (
                <Option key={prov.code} value={noPrefix}>
                  {prov.name}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        {/* Year filter */}
      </Form>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
  <TabPane key="all" tab={<Badge count={requestCounts.all}>All</Badge>} />
  <TabPane key="pending" tab={<Badge count={requestCounts.pending}>Pending</Badge>} />
  <TabPane key="approved" tab={<Badge count={requestCounts.approved}>Approved</Badge>} />
  <TabPane key="rejected" tab={<Badge count={requestCounts.rejected}>Rejected</Badge>} />
  <TabPane key="completed" tab={<Badge count={requestCounts.completed}>Completed</Badge>} />
  <TabPane key="hidden" tab={<Badge count={requestCounts.hidden}>Hidden</Badge>} />
  </Tabs>

      {/* List of Requests */}
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
        <Empty
          description={
            <span>
              You have no request.{" "}
              <a href="/requests/create">Create one now</a>
            </span>
          }
        />
      )}
    </div>
  );
};

export default MyRequestScreen;
