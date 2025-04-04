import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List, Typography, Empty, Form, Input, Select } from "antd";
import LoadingModal from "../../components/LoadingModal";
import RequestCard from "../../components/RequestCard/RequestCard";
import { fetchRequests } from "../../redux/request/requestSlice";
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";

const { Title } = Typography;
const { Option } = Select;

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


function normalizeString(str = "") {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const RequestListScreen = () => {
  const dispatch = useDispatch();
  const requests = useSelector((state) => state.request.requests);
  const loading = useSelector((state) => state.request.loading);
  const error = useSelector((state) => state.request.error);

  // Lấy categories, tags
  const categories = useSelector((state) => state.category.categories) || [];
  const tags = useSelector((state) => state.tag.tags) || [];
  useEffect(() => {
    if (!categories.length) dispatch(fetchCategories());
    if (!tags.length) dispatch(fetchTags());
  }, [dispatch, categories.length, tags.length]);

  // Lấy provinces
  const [provinces, setProvinces] = useState([]);
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Gọi API fetchRequests 1 lần
  useEffect(() => {
    dispatch(fetchRequests()).then((res) => {
      console.log("Fetched requests:", res.payload);
    });
  }, [dispatch]);

  // Filter state
  const [filters, setFilters] = useState({});
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [form] = Form.useForm();

  // Lọc cục bộ
  useEffect(() => {
    let data = [...requests];

    // search
    if (filters.search && filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter(item => {
        const title = item.helpRequest.title.toLowerCase();
        const content = item.helpRequest.content.toLowerCase();
        return title.includes(keyword) || content.includes(keyword);
      });
    }

    // category
    if (filters.categoryId) {
      data = data.filter(item => item.helpRequest.category.id === filters.categoryId);
    }

    // tags
    if (filters.requestTags && filters.requestTags.length > 0) {
      data = data.filter(item => {
        const requestTagIds = item.requestTags.map(t => t.tag.id);
        return filters.requestTags.some(filterTag => requestTagIds.includes(filterTag));
      });
    }

    // province
    if (filters.province) {
      const filterProv = normalizeString(filters.province);
      data = data.filter(item => {
        let requestProvName = "";
        if (item.helpRequest.provinceCode) {
          const provObj = provinces.find(p => p.code === item.helpRequest.provinceCode);
          if (provObj) {
            const noPrefix = provObj.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
            requestProvName = normalizeString(noPrefix);
          }
        } else {
          const { provinceName } = parseLocationString(item.helpRequest.location || "");
          requestProvName = normalizeString(provinceName);
        }
        return requestProvName.includes(filterProv);
      });
    }

    setFilteredRequests(data);
  }, [requests, filters, provinces]);

  const onValuesChange = (changedValues, allValues) => {
    if (!allValues.province) {
      delete allValues.province;
    }
    setFilters(allValues);
  };
  

  if (loading) return <LoadingModal />;
  if (error) return <p style={{ color: "red" }}>Failed to load requests: {error}</p>;

  return (
    <div className="request-list" style={{ padding: "2rem" }}>
      <Title level={2}>Requests</Title>

      {/* Inline filter */}
      <Form layout="inline" form={form} onValuesChange={onValuesChange} style={{ marginBottom: "1rem" }}>
      <Form.Item name="search" label="Search">
          <Input
            placeholder="Search requests" 
            allowClear 
            size="small"
            style={{ height: 31 }}
            suffix={null} // Bỏ icon tìm kiếm
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
      </Form>

      {Array.isArray(filteredRequests) && filteredRequests.length > 0 ? (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={filteredRequests}
          renderItem={(request) => (
            <List.Item key={request.id}>
              <RequestCard requestData={request} />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No request found." />
      )}
    </div>
  );
};

export default RequestListScreen;
