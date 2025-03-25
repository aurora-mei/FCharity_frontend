import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { useDispatch, useSelector } from 'react-redux';
import { createRequest } from '../../redux/request/requestSlice';
import { fetchCategories } from '../../redux/category/categorySlice';
import { fetchTags } from '../../redux/tag/tagSlice';
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../LoadingModal/index.jsx";
import useLoading from "../../hooks/useLoading";

const { Title } = Typography;
const { Option } = Select;

function parseLocationString(locationString = "") {
  const parts = locationString.split(",").map((p) => p.trim());
  const provinceName = parts[parts.length - 1] || "";
  const districtName = parts[parts.length - 2] || "";
  const communeName  = parts[parts.length - 3] || "";
  const detail       = parts.slice(0, parts.length - 3).join(", ");
  return { detail, communeName, districtName, provinceName };
}

/** Tìm province theo tên (so sánh đơn giản, toLowerCase + includes) */
function findProvinceByName(provinces, name) {
  if (!name || !provinces) return null;
  return provinces.find(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
}
/** Tìm district theo tên */
function findDistrictByName(districts, name) {
  if (!name || !districts) return null;
  return districts.find(d =>
    d.name.toLowerCase().includes(name.toLowerCase())
  );
}
/** Tìm commune theo tên */
function findCommuneByName(communes, name) {
  if (!name || !communes) return null;
  return communes.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

const CreateRequestForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadingUI = useLoading();
  const loading = useSelector((state) => state.request.loading);
  const categories = useSelector((state) => state.category.categories || []);
  const tags = useSelector((state) => state.tag.tags || []);
  
  const storedUser = localStorage.getItem("currentUser");
  let currentUser = {};
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Error parsing currentUser:", error);
  }

  const [attachments, setAttachments] = useState({ images: [], videos: [] });
  const [uploading, setUploading] = useState(false);

  // For address dropdown
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    // Fetch categories and tags
    dispatch(fetchCategories());
    dispatch(fetchTags());

    // Load provinces
    loadProvinces();
  }, [dispatch]);

  // Load list of provinces from open-api
  const loadProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      setProvinces(data);
      return data;
    } catch (error) {
      console.error("Failed to load provinces:", error);
      return [];
    }
  };

  // Load list of districts from open-api
  const loadDistricts = async (provinceCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await response.json();
      setDistricts(data.districts || []);
      return data.districts || [];
    } catch (error) {
      console.error("Failed to load districts:", error);
      return [];
    }
  };

  // Load list of communes from open-api
  const loadCommunes = async (districtCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await response.json();
      setCommunes(data.wards || []);
      return data.wards || [];
    } catch (error) {
      console.error("Failed to load communes:", error);
      return [];
    }
  };

  // Pre-fill the form if currentUser has an address
  useEffect(() => {
    if (currentUser.address) {
      const { detail, communeName, districtName, provinceName } = parseLocationString(currentUser.address);
      form.setFieldsValue({
        phone: currentUser.phoneNumber || '',
        email: currentUser.email || '',
        location: detail,          // e.g. "123"
        provinceName,              // hidden field
        districtName,              // hidden field
        communeName,               // hidden field
      });

      const loadData = async () => {
        // Tải danh sách tỉnh
        const provincesData = await loadProvinces();

        // Tìm province code từ provincesData
        const foundProvince = findProvinceByName(provincesData, provinceName);
        if (foundProvince) {
          form.setFieldsValue({ province: foundProvince.code });
          setSelectedProvince(foundProvince.code);

          // Tải danh sách district -> tìm district code
          const districtsData = await loadDistricts(foundProvince.code);
          const foundDistrict = findDistrictByName(districtsData, districtName);
          if (foundDistrict) {
            form.setFieldsValue({ district: foundDistrict.code });
            setSelectedDistrict(foundDistrict.code);

            // Tải danh sách commune -> tìm commune code
            const communesData = await loadCommunes(foundDistrict.code);
            const foundCommune = findCommuneByName(communesData, communeName);
            if (foundCommune) {
              form.setFieldsValue({ commune: foundCommune.code });
            }
          }
        }
      };
      loadData().catch(err => console.error("Error in loadData:", err));
    } else {
      // If user has no address in DB, just fill phone/email
      form.setFieldsValue({
        phone: currentUser.phoneNumber || '',
        email: currentUser.email || '',
        location: ''
      });
    }
  }, [form, currentUser]);

  const handleProvinceChange = async (value) => {
    setSelectedProvince(value);
    form.setFieldsValue({ district: null, commune: null });
    setDistricts([]);
    setCommunes([]);
    await loadDistricts(value);
  };

  const handleDistrictChange = async (value) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ commune: null });
    setCommunes([]);
    await loadCommunes(value);
  };

  const handleCommuneChange = (value) => {
    form.setFieldsValue({ commune: value });
  };

  const onFinish = async (values) => {
    const { location, communeName, districtName, provinceName } = values;
    // Combine them into a single address
    const fullAddress = `${location}, ${communeName}, ${districtName}, ${provinceName}`;
    const requestData = {
      ...values,
      userId: currentUser.id,
      fullAddress,
      tagIds: values.tagIds,
      imageUrls: attachments.images,
      videoUrls: attachments.videos
    };
    console.log("Final Request Data:", requestData);

    try {
      await dispatch(createRequest(requestData)).unwrap();
      message.success("Request created successfully!");
      navigate('/user/manage-profile/myrequests', { replace: true });
    } catch (err) {
      message.error(err.message || "Failed to create request");
      console.error("Create request error:", err);
    }
  };

  // Upload images
  const handleImageChange = async ({ fileList }) => {
    setUploading(true);
    const uploadedFiles = [];
    for (const file of fileList) {
      try {
        const response = await dispatch(uploadFileHelper(file.originFileObj, "images")).unwrap();
        uploadedFiles.push(response);
        message.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error(`Upload failed for ${file.name}`);
      }
    }
    setAttachments((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedFiles]
    }));
    setUploading(false);
  };

  // Upload videos
  const handleVideoChange = async ({ fileList }) => {
    setUploading(true);
    const uploadedFiles = [];
    for (const file of fileList) {
      try {
        const response = await dispatch(uploadFileHelper(file.originFileObj, "videos")).unwrap();
        uploadedFiles.push(response);
        message.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error("Error uploading video:", error);
        message.error(`Upload failed for ${file.name}`);
      }
    }
    setAttachments((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), ...uploadedFiles]
    }));
    setUploading(false);
  };

  if (loadingUI || loading) {
    return <LoadingModal />;
  }

  return (
    <div className="upper-container-request">
      <div className="container-request">
        <div className="create-request-form">
          <div className="request-header">
            <Title level={3} style={{ lineHeight: '1' }} className="title">
              Create a Request
            </Title>
            <p className="subtitle">
              Fill in the details to create a new request.
            </p>
          </div>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {/* Title */}
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input />
            </Form.Item>

            {/* Content */}
            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, message: "Content is required" }]}
            >
              <Input.TextArea />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Phone is required" }]}
            >
              <Input />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
            >
              <Input />
            </Form.Item>

            {/* Province */}
            <Form.Item
              label="Province"
              name="province"
              rules={[{ required: true, message: "Province is required" }]}
            >
              <Select placeholder="Select Province" onChange={handleProvinceChange}>
                {provinces.map((p) => (
                  <Option key={p.code} value={p.code}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* District */}
            <Form.Item
              label="District"
              name="district"
              rules={[{ required: true, message: "District is required" }]}
            >
              <Select
                placeholder="Select District"
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              >
                {districts.map((d) => (
                  <Option key={d.code} value={d.code}>
                    {d.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Commune */}
            <Form.Item
              label="Commune"
              name="commune"
              rules={[{ required: true, message: "Commune is required" }]}
            >
              <Select
                placeholder="Select Commune"
                onChange={handleCommuneChange}
                disabled={!selectedDistrict}
              >
                {communes.map((c) => (
                  <Option key={c.code} value={c.code}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Street address detail */}
            <Form.Item
              label="Address"
              name="location"
              rules={[{ required: true, message: "Street address is required" }]}
            >
              <Input placeholder="e.g. 123, Phường..." />
            </Form.Item>

            {/* Hidden fields for storing parsed address parts (if needed) */}
            <Form.Item name="provinceName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="districtName" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="communeName" hidden>
              <Input />
            </Form.Item>

            {/* Images */}
            <Form.Item
              label="Images"
              name="images"
              rules={[{ required: true, message: "At least one image is required" }]}
            >
              <Upload
                multiple
                listType="picture"
                beforeUpload={() => false}
                accept="image/*"
                onChange={handleImageChange}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Click to Upload
                </Button>
              </Upload>
            </Form.Item>

            {/* Videos */}
            <Form.Item label="Videos" name="videos">
              <Upload
                multiple
                listType="picture"
                beforeUpload={() => false}
                accept="video/*"
                onChange={handleVideoChange}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  Click to Upload
                </Button>
              </Upload>
            </Form.Item>

            {/* Category */}
            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{ required: true, message: "Category is required" }]}
            >
              <Select placeholder="Select a category">
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Tags */}
            <Form.Item
              label="Tags"
              name="tagIds"
              rules={[{ required: true, message: "At least one tag is required" }]}
            >
              <Select mode="multiple" placeholder="Select tags" allowClear>
                {tags.map((tag) => (
                  <Option key={tag.id} value={tag.id}>
                    {tag.tagName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Is Emergency checkbox */}
            <Form.Item name="isEmergency" valuePropName="checked">
              <Checkbox>Is Emergency</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="continue-button"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Create Request"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestForm;