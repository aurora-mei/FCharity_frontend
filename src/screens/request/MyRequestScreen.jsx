import React, { useEffect, useState } from "react";
import { Empty, List, Typography, Card, Form, Divider, Descriptions, Space, Alert, Result, Input, Image, Select, Tabs, Badge, Button, Flex, Modal, Avatar } from "antd";
import LoadingModal from "../../components/LoadingModal";
import RequestCard from "../../components/RequestCard/RequestCard";
import { fetchRequestsByUserIdThunk, fetchTransferRequestByRequest, updateConfirmTransferThunk, updateErrorTransferThunk, setCurrentTransferRequest, updateBankInfoThunk } from "../../redux/request/requestSlice";
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import { getListBankThunk } from "../../redux/helper/helperSlice";
import { confirmReceiveRequestThunk, setCurrentConfirmRequest,rejectReceiveRequestThunk  } from "../../redux/project/projectSlice";
import { Bar, Line } from "react-chartjs-2";
import { useNavigate, Link } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
const { TextArea } = Input;
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
import { getConfirmReceiveRequestByRequestThunk } from "../../redux/project/projectSlice";
const { Text, Title, Paragraph } = Typography;
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
  if (parts.length < 3) {
    return { detail: locationString, communeName: "", districtName: "", provinceName: "" };
  }

  const provincePart = parts[parts.length - 1];
  const districtPart = parts[parts.length - 2];
  const communePart = parts[parts.length - 3];
  const detailParts = parts.slice(0, parts.length - 3);

  const detail = detailParts.join(", ");
  // For province, remove common prefixes (tỉnh, thành phố, tp)
  const provinceName = provincePart
    .replace(/^(tỉnh|thành phố|tp)\s*/i, "")
    .trim();
  // For district, even if it contains "thành phố" keyword, treat it as district
  const districtName = districtPart
    .replace(/^(huyện|quận|thị xã|thành phố|tp)\s*/i, "")
    .trim();
  // For commune, remove the commune keywords
  const communeName = communePart.replace(/^(xã|phường|thị trấn)\s*/i, "").trim();

  return { detail, communeName, districtName, provinceName };
}

// Normalize a string (remove diacritics and convert to lowercase)
const normalizeString = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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
    registered: 0,
  });
  const [rejectNote, setRejectNote] = useState("");
  const [filters, setFilters] = useState({});
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("all");
  const [provinces, setProvinces] = useState([]);
  const [transferRequests, setTransferRequests] = useState(new Map());
  const [confirmRequests, setConfirmRequests] = useState(new Map());
  const [navigateError, setNavigateError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.request.loading);
  const requestsByUserId =
    useSelector((state) => state.request.requestsByUserId) || [];
  const error = useSelector((state) => state.request.error);
  const listBank = useSelector((state) => state.helper.listBank) || [];
  const [transferRequestModalOpen, setTransferRequestModalOpen] = useState(false);
  const [confirmRequestModalOpen, setConfirmRequestModalOpen] = useState(false);
  const currentTransferRequest = useSelector((state) => state.request.currentTransferRequest) || {};
  const currentConfirmRequest = useSelector((state) => state.project.currentConfirmRequest)
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
      pending: requestsByUserId.filter(
        (req) => req.helpRequest.status.toLowerCase() === "pending"
      ).length,
      approved: requestsByUserId.filter(
        (req) => req.helpRequest.status.toLowerCase() === "approved"
      ).length,
      rejected: requestsByUserId.filter(
        (req) => req.helpRequest.status.toLowerCase() === "rejected"
      ).length,
      completed: requestsByUserId.filter(
        (req) => req.helpRequest.status.toLowerCase() === "completed"
      ).length,
      hidden: requestsByUserId.filter(
        (req) => req.helpRequest.status.toLowerCase() === "hidden"
      ).length,
      registered: requestsByUserId.filter(
        (req) => req.helpRequest.status.toLowerCase() === "registered"
      ).length,
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
    dispatch(getListBankThunk());

    if (currentUser.id) {
      dispatch(fetchRequestsByUserIdThunk(currentUser.id));
    }
  }, [dispatch, currentUser.id]);
  const fetchAllTransferRequests = async () => {
    const newMap = new Map();
    for (const request of requestsByUserId) {
      const response = await dispatch(fetchTransferRequestByRequest(request.helpRequest.id));
      newMap.set(request.helpRequest.id, response.payload);
    }
    setTransferRequests(newMap);
  };
  const fetchAllConfirmRequests = async () => {
    // Guard clause: If no requests, set an empty map and exit.
    if (!requestsByUserId || requestsByUserId.length === 0) {
      setConfirmRequests(new Map());
      return;
    }

    try {
      // 1. Create an array of Promises by dispatching the thunk for each request
      const promises = requestsByUserId.map(request =>
        dispatch(getConfirmReceiveRequestByRequestThunk(request.helpRequest.id))
      );

      // 2. Wait for ALL promises to settle (resolve or reject)
      const results = await Promise.all(promises); // This waits until all API calls finish

      // 3. Create the map *after* all promises have resolved
      const newMap = new Map();
      results.forEach((response, index) => {
        const correspondingRequest = requestsByUserId[index];
        const requestId = correspondingRequest.helpRequest.id;

        // Check if the thunk was fulfilled and has a payload
        // Note: Redux Toolkit Query or standard createAsyncThunk responses
        // usually wrap the result in a 'payload' property upon success.
        // Adjust this check if your thunk returns data differently.
        if (response && response.payload) {
          console.log(`Successfully fetched confirm request for ${requestId}:`, response.payload);
          newMap.set(requestId, response.payload);
        } else {
          // Handle cases where the thunk might have failed for a specific request
          // or returned an empty payload (if that's possible)
          console.warn(`No confirm request data found or fetch failed for request ID: ${requestId}`, response);
          // You might want to set null or skip setting in the map depending on requirements
          // newMap.set(requestId, null);
        }
      });

      // 4. Update the state with the complete map
      setConfirmRequests(newMap);

    } catch (error) {
      // Handle potential errors from Promise.all (if any single promise rejects)
      console.error("Error fetching one or more confirm requests:", error);
      // Optionally, set an error state or clear the map
      setConfirmRequests(new Map()); // Clear map on error
    }
  };
  useEffect(() => {
    if (requestsByUserId.length > 0) {
      fetchAllTransferRequests();

    }
    fetchAllConfirmRequests();
  }, [requestsByUserId]);
  // console.log("conff", confirmRequests)


  // Filter requests whenever requests, filters, activeTab, or provinces change
  useEffect(() => {
    let data = [...requestsByUserId];

    // Filter by status tab
    if (activeTab !== "all") {
      data = data.filter(
        (item) => item.helpRequest.status.toLowerCase() === activeTab
      );
    }

    // Filter by search keyword
    if (filters.search && filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter((item) => {
        const title = item.helpRequest.title.toLowerCase();
        const content = item.helpRequest.content.toLowerCase();
        const email = item.helpRequest.email.toLowerCase();
        return (
          title.includes(keyword) ||
          content.includes(keyword) ||
          email.includes(keyword)
        );
      });
    }

    // Filter by category
    if (filters.categoryId) {
      data = data.filter(
        (item) => item.helpRequest.category.id === filters.categoryId
      );
    }

    // Filter by tags
    if (filters.requestTags && filters.requestTags.length > 0) {
      data = data.filter((item) => {
        const requestTagIds = item.requestTags.map((t) => t.tag.id);
        return filters.requestTags.some((filterTag) =>
          requestTagIds.includes(filterTag)
        );
      });
    }

    // Filter by province
    if (filters.province) {
      const filterProv = normalizeString(filters.province);
      data = data.filter((item) => {
        let requestProvName = "";
        if (item.helpRequest?.provinceCode) {
          const provObj = provinces.find(
            (p) => p.code === item.helpRequest.provinceCode
          );
          if (provObj) {
            const noPrefix = provObj.name
              .replace(/^(Tỉnh|Thành phố|TP)\s+/i, "")
              .trim();
            requestProvName = normalizeString(noPrefix);
          }
        } else {
          const { provinceName } = parseLocationString(
            item.helpRequest?.location || ""
          );
          requestProvName = normalizeString(provinceName);
        }
        return requestProvName.includes(filterProv);
      });
    }

    // Filter by year if provided
    if (filters.year) {
      data = data.filter((item) => {
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
  const { labels: months, data: requestCountsByMonth } = processRequestsByMonth(
    filteredRequests,
    selectedYear
  );

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

  const handleSubmitBankInfo = (values) => {
    console.log("Bank Info submitted:", values);
    const id = values.transferRequestId;
    const { bankBin, accountNumber, accountHolder } = values;
    if (values) {
      dispatch(updateBankInfoThunk({ id: id, bankInfo: { bankBin, accountNumber, accountHolder } }))
        .then(() => {
          setTransferRequestModalOpen(false);
          fetchAllTransferRequests();
        })
        .catch((error) => {
          console.error("Failed to update bank info:", error);
        });
    }
  };
  const handleSubmitError = (values) => {
    console.log("Error Info submitted:", currentTransferRequest.id);
    const id = currentTransferRequest.id;
    const { note } = values;
    if (values) {
      dispatch(updateErrorTransferThunk({ id: id, note: "Error report from user: " + note }))
        .then(() => {
          setTransferRequestModalOpen(false);
        })
        .catch((error) => {
          console.error("Failed to update error info:", error);
        });
    }
  };
  if (!requestsByUserId) return <LoadingModal />;
  if (error) {
    return (
      <p style={{ color: "red" }}>
        Failed to load your requests: {error.message || error}
      </p>
    );
  }
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Consider using moment or dayjs here for better formatting options if available in your project
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Helper for formatting currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }); // Example using VND
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
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
      <Form
        layout="inline"
        form={form}
        onValuesChange={onValuesChange}
        style={{ marginBottom: "1rem" }}
      >
        <Form.Item name="search" label="Search">
          <Input
            placeholder="Search requests"
            allowClear
            size="small"
            style={{ height: 31 }}
          />
        </Form.Item>
        <Form.Item name="categoryId" label="Category">
          <Select
            placeholder="Select category"
            allowClear
            style={{ minWidth: 150 }}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="requestTags" label="Tags">
          <Select
            mode="multiple"
            placeholder="Select tags"
            allowClear
            style={{ minWidth: 150 }}
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.id}>
                {tag.tagName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* Province filter */}
        <Form.Item name="province" label="Province">
          <Select
            placeholder="Select province"
            allowClear
            style={{ minWidth: 150 }}
          >
            {provinces.map((prov) => {
              const noPrefix = prov.name
                .replace(/^(Tỉnh|Thành phố|TP)\s+/i, "")
                .trim();
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
        <TabPane key="registered" tab={<Badge count={requestCounts.registered}>Registered</Badge>} />
      </Tabs>

      {/* List of Requests */}
      {filteredRequests.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={filteredRequests}
          renderItem={(request) => (
            <List.Item key={request.helpRequest.id}>

              {transferRequests && transferRequests.get(request.helpRequest.id) && (
                <Flex vertical gap={10}>
                  <RequestCard requestData={request} />
                  <Button onClick={() => {
                    setTransferRequestModalOpen(true);
                    console.log("TransferRequest", transferRequests.get(request.helpRequest.id));
                    dispatch(setCurrentTransferRequest(transferRequests.get(request.helpRequest.id)));
                    form.setFieldsValue({
                      transferRequestId: transferRequests.get(request.helpRequest.id).id
                    })
                  }}>View transfer request</Button>
                  <Modal
                    width={800}
                    title="Transfer Request Details"
                    open={transferRequestModalOpen}
                    onCancel={() => setTransferRequestModalOpen(false)}
                    footer={null}
                  >
                    {(() => {
                      const transferRequest = currentTransferRequest;
                      const status = transferRequest.status;

                      const renderBankForm = () => (
                        <Form
                          form={form}
                          layout="vertical"
                          onFinish={handleSubmitBankInfo}
                          initialValues={{
                            transferRequestId: transferRequest.id,
                            bankBin: transferRequest.bankBin,
                            accountNumber: transferRequest.bankAccount,
                            accountHolder: transferRequest.bankOwner,
                          }}
                        >
                          <Form.Item name="transferRequestId" hidden>
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="Bank"
                            name="bankBin"
                            rules={[{ required: true, message: 'Please select your bank.' }]}
                          >
                            <Select placeholder="Select your bank">
                              {Array.isArray(listBank) &&
                                listBank.map((bank) => (
                                  <Option key={bank.id} value={bank.bin}>
                                    <Flex>
                                      <img
                                        src={bank.logo}
                                        alt={bank.name}
                                        style={{ width: 60, height: 30, marginRight: 8 }}
                                      />
                                      {`(${bank.bin}) ${bank.name}`}
                                    </Flex>
                                  </Option>
                                ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            label="Account Number"
                            name="accountNumber"
                            rules={[
                              { required: true, message: 'Please enter your bank account number.' },
                              { pattern: /^[0-9]{6,20}$/, message: 'The account number must be between 6 and 20 digits.' },
                            ]}
                          >
                            <Input placeholder="Enter your bank account number" maxLength={20} />
                          </Form.Item>

                          <Form.Item
                            label="Account Holder Name"
                            name="accountHolder"
                            rules={[{ required: true, message: 'Please enter the account holder name.' }]}
                          >
                            <Input placeholder="Enter the account holder name" />
                          </Form.Item>

                          <Form.Item style={{ textAlign: 'center' }}>
                            <Button type="primary" htmlType="submit" >
                              Submit Bank Information
                            </Button>
                          </Form.Item>
                        </Form>
                      );

                      switch (status) {
                        case "PENDING_USER_CONFIRM":
                          return (
                            <>
                              <Flex vertical gap={5}>
                                <p style={{ margin: 0 }}><b>From project: </b><Link to={`/projects/${transferRequest.project.id}/details`}>{transferRequest?.project.projectName}</Link></p>
                                <p style={{ margin: 0 }}><b>Total amount: </b>{formatCurrency(transferRequest.amount)}</p>
                              </Flex>
                              <div> {/* Wrap form in a div */}
                                {transferRequest?.reason && (
                                  <Alert
                                    description={transferRequest.reason}
                                    type="info" // Or warning/error as appropriate
                                    showIcon
                                    style={{ margin: "16px 0" }} // Add margin below alert
                                    icon={<ExclamationCircleOutlined />} // Keep specific icon if needed
                                  />
                                )}
                                {renderBankForm()}
                              </div>
                            </>
                          );
                        case "PENDING_ADMIN_APPROVAL":
                          return (
                            <>
                              <p>Your request has been sent to the administrator.</p>
                              <p>Please wait for their approval.</p>
                            </>
                          );
                        case "CONFIRM_SENT":
                          return (
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>

                              {/* Combined Transaction Details Section */}
                              <Card
                                title={<Title level={5} style={{ margin: 0 }}>Transaction Details</Title>}
                                size="small"
                                bordered={false} // Remove card border for cleaner modal look
                              // Remove box shadow if modal provides enough separation, or add if needed:
                              // style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                              >
                                {/* Bank Information */}
                                <Descriptions bordered size="small" column={1} style={{ marginBottom: '16px' }}>
                                  <Descriptions.Item label="Bank BIN">
                                    {transferRequest?.bankBin || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Bank Account">
                                    {transferRequest?.bankAccount || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Bank Owner">
                                    {transferRequest?.bankOwner || 'N/A'}
                                  </Descriptions.Item>
                                </Descriptions>

                                {/* Transaction Proof Image */}
                                {transferRequest?.transactionImage && (
                                  <Image
                                    width="100%"
                                    style={{ maxHeight: '250px', objectFit: 'contain', marginBottom: '16px', borderRadius: '4px', display: 'block' }} // Center image block
                                    src={transferRequest.transactionImage}
                                    alt="Transaction proof"
                                    preview={{ // Keep preview options if needed
                                      maskClassName: 'custom-image-mask',
                                    }}
                                  />
                                )}

                                {/* Note and Project Link */}
                                <Descriptions size="small" column={1}>
                                  {/* Unbordered Descriptions for Note/Project */}
                                  <Descriptions.Item label="Note">
                                    {transferRequest?.note || <Text type="secondary" italic>N/A</Text>}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Project">
                                    {transferRequest?.project?.id ? (
                                      <Link to={`/projects/${transferRequest.project.id}/details`}>
                                        {transferRequest?.project?.projectName || 'View Project'}
                                      </Link>
                                    ) : (
                                      transferRequest?.project?.projectName || 'N/A'
                                    )}
                                  </Descriptions.Item>
                                </Descriptions>
                              </Card>

                              {/* Confirmation / Error Reporting Section */}
                              {!navigateError ? (
                                // Confirmation View
                                <Card
                                  title={<Title level={5} style={{ margin: 0 }}>Action Required</Title>}
                                  size="small"
                                  bordered={false}
                                // style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                                >
                                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <Alert
                                      message="Confirm Transaction"
                                      description="A transfer is reported as made. Please check your account balance and confirm receipt of the funds."
                                      type="info"
                                      showIcon
                                    />
                                    <Button
                                      type="primary"
                                      onClick={() => {
                                        dispatch(updateConfirmTransferThunk(transferRequest.id));
                                        setTransferRequestModalOpen(false);
                                      }}
                                      style={{ width: 'auto' }} // Button width fits content
                                    >
                                      Confirm Receipt
                                    </Button>
                                    <Text type="secondary" style={{ fontSize: '0.85em', marginTop: '8px' }}> {/* Add margin top */}
                                      If there is an issue, click here to {' '}
                                      <Button type="link" danger size="small" onClick={() => setNavigateError(true)} style={{ padding: 0, height: 'auto', lineHeight: 'inherit' }}>
                                        Report Problem
                                      </Button>
                                      .
                                    </Text>
                                  </Space>
                                </Card>
                              ) : (
                                // Error Reporting View
                                <Card
                                  title={<Title level={5} style={{ margin: 0 }}>Report an Issue</Title>}
                                  size="small"
                                  bordered={false}
                                // style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                                >
                                  <Paragraph>
                                    If you encountered an issue with this transaction (e.g., amount incorrect, funds not received), please describe it below.
                                  </Paragraph>
                                  <Form layout="vertical" onFinish={handleSubmitError} requiredMark={false}>
                                    <Form.Item
                                      label="Issue Description"
                                      name="note" // Matches previous code
                                      rules={[{ required: true, message: 'Please describe the issue you encountered.' }]}
                                    >
                                      <Input.TextArea rows={3} placeholder="Example: Funds not received, amount doesn't match..." />
                                    </Form.Item>
                                    <Form.Item>
                                      <Space>
                                        <Button type="primary" danger htmlType="submit">
                                          Submit Report
                                        </Button>
                                        <Button type="default" onClick={() => setNavigateError(false)}>
                                          Cancel / Go Back
                                        </Button>
                                      </Space>
                                    </Form.Item>
                                  </Form>
                                </Card>
                              )}
                            </Space>
                          );

                        case "COMPLETED":
                          return (
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                              {/* Transaction Result Card - Modified to include Image */}
                              <Card
                                title={<Title level={5} style={{ margin: 0 }}>Transaction Result</Title>}
                                size="small"
                                bordered={false}
                                style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                              >
                                {/* Success Message */}
                                <Text type="success" style={{ display: 'block', marginBottom: '16px', fontSize: '1.1em', fontWeight: 500 }}>
                                  The transaction was completed!
                                </Text>

                                {/* Transaction Proof Image (Conditional Rendering) */}
                                {transferRequest?.transactionImage && (
                                  <>
                                    <Image
                                      width="100%" // Make image responsive
                                      style={{ maxHeight: '250px', objectFit: 'contain', marginBottom: '16px', borderRadius: '4px', display: 'block' }}
                                      src={transferRequest.transactionImage}
                                      alt="Transaction proof"
                                      preview={{ // Enable Ant Design's preview
                                        maskClassName: 'custom-image-mask', // Optional custom mask class
                                      }}
                                    />
                                    <Divider style={{ marginTop: 0, marginBottom: 16 }} /> {/* Divider between image and details */}
                                  </>
                                )}

                                {/* Bank Details */}
                                <Descriptions bordered size="small" column={1}>
                                  <Descriptions.Item label="Total amount">
                                    {formatCurrency(transferRequest?.amount)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Bank BIN">
                                    {transferRequest?.bankBin || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Bank Account">
                                    {transferRequest?.bankAccount || 'N/A'}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Bank Owner">
                                    {transferRequest?.bankOwner || 'N/A'}
                                  </Descriptions.Item>
                                </Descriptions>
                              </Card>

                              {/* Project Information Card (Remains the same) */}
                              <Card
                                title={<Title level={5} style={{ margin: 0 }}>Project Information</Title>}
                                size="small"
                                bordered={false}
                                style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                              >
                                <Descriptions bordered size="small" column={1}>
                                  <Descriptions.Item label="Project">
                                    {transferRequest?.project?.id ? (
                                      <Link to={`/projects/${transferRequest.project.id}/details`}>
                                        {transferRequest?.project?.projectName || 'View Project'}
                                      </Link>
                                    ) : (
                                      transferRequest?.project?.projectName || 'N/A'
                                    )}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="Start date">
                                    {formatDate(transferRequest?.project?.actualStartTime)}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="End date">
                                    {formatDate(transferRequest?.project?.actualEndTime)}
                                  </Descriptions.Item>
                                </Descriptions>
                              </Card>
                            </Space>

                          )
                        case "ERROR":
                          return (
                            <>
                              {
                                transferRequest.note.includes("Error report from user: ") ? (
                                  <>
                                    <p>Your error report: {transferRequest.note.replace("Error report from user: ", "")}</p>
                                    <p>Please wait for response from admin.</p>
                                  </>
                                ) : (
                                  <>
                                    <p>{transferRequest.note}</p>
                                    {renderBankForm()}
                                  </>
                                )
                              }
                            </>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </Modal>


                </Flex>
              )}

              {confirmRequests && confirmRequests.get(request.helpRequest.id) && (
                <Flex vertical gap={10}>
                  <RequestCard requestData={request} />
                  <Button onClick={() => {
                    setConfirmRequestModalOpen(true);
                    console.log("confirm req", confirmRequests.get(request.helpRequest.id));
                    dispatch(setCurrentConfirmRequest(confirmRequests.get(request.helpRequest.id)));
                    form.setFieldsValue({
                      id: confirmRequests.get(request.helpRequest.id).id
                    })
                  }}>View confirm request</Button>
                  <Modal
                    width={800}
                    title="Confirm Request Details"
                    open={confirmRequestModalOpen}
                    onCancel={() => setConfirmRequestModalOpen(false)}
                    footer={null}
                  >
                    {(() => {
                      const confirmRequest = currentConfirmRequest;
                      const isConfirmed = confirmRequest.isConfirmed;
                      const note = confirmRequest.note;

                      if (!isConfirmed && note && note.includes("Please confirm receive")) {
                        return (
                          <Flex vertical gap={16}>
                            <Text>{note}</Text>
                            <Text>You can view project details in</Text>
                            <Link to={`/projects/${confirmRequest.project.id}/details`}>
                                        {confirmRequest?.project?.projectName || 'View Project'}
                                      </Link>
                            <Flex gap={12}>
                              <Button
                                type="primary"
                                onClick={() => {
                                  Modal.confirm({
                                    title: 'Are you sure you want to confirm this request?',
                                    icon: <ExclamationCircleOutlined />,
                                    content: 'This action will confirm the request.',
                                    okText: 'Yes',
                                    cancelText: 'No',
                                    onOk() {
                                      dispatch(confirmReceiveRequestThunk(confirmRequest.id));
                                      setConfirmRequestModalOpen(false);
                                    },
                                  });
                                }}
                              >
                                Confirm
                              </Button>
                              <Button
                                danger
                                onClick={() => {
                                  Modal.confirm({
                                    title: 'Reject Reason',
                                    icon: <ExclamationCircleOutlined />,
                                    content: (
                                      <TextArea
                                        rows={4}
                                        placeholder="Enter rejection note..."
                                        onChange={(e) => {
                                        console.log(e.target.value);
                                        setRejectNote(e.target.value);
                                        }}
                                      />
                                    ),
                                    okText: 'Send',
                                    cancelText: 'Cancel',
                                    onOk() {
                                      if (rejectNote && rejectNote.trim()) {
                                        dispatch(rejectReceiveRequestThunk({
                                          id: confirmRequest.id,
                                          me: rejectNote
                                        })
                                      );
                                      setConfirmRequestModalOpen(false);
                                      } else {
                                        Modal.error({
                                          title: 'Note is required',
                                          content: 'Please enter a rejection reason before submitting.',
                                        });
                                        return Promise.reject();
                                      }
                                    }
                                  });
                                }}
                              >
                                Reject
                              </Button>
                            </Flex>
                          </Flex>
                        );
                      } else if (isConfirmed) {
                        return (
                          <Flex vertical>
                            <Text type="success">Request has been confirmed!</Text>
                            <Text>You can view project details in</Text>
                          </Flex>
                        );
                      } else if (!isConfirmed && note && !note.includes("Please confirm receive")) {
                        return (
                          <Flex vertical>
                            <Text>
                              Your response has been sent to project. 
                              Please wait for the project to check again and send you a final confirmation.
                            </Text>
                            <Text>You can view project details in</Text>
                            <Link to={`/projects/${confirmRequest.project.id}/details`}>
                                        {confirmRequest?.project?.projectName || 'View Project'}
                                      </Link>
                          </Flex>
                        );
                      }
                    })()}
                  </Modal>
                </Flex>
              )}
              <RequestCard requestData={request} />
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={
            <span>
              You have no request.{" "}
              <Link to="/requests/create">Create one now</Link>
            </span>
          }
        />
      )}
    </div>
  );
};

export default MyRequestScreen;
