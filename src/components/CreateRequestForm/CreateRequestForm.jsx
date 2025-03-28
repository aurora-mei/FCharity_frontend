import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, Typography, Select, Upload, message, Spin } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import "antd/dist/reset.css";
import { useDispatch, useSelector } from 'react-redux';
import { createRequest } from '../../redux/request/requestSlice';
import { fetchCategories } from '../../redux/category/categorySlice';
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { fetchTags } from '../../redux/tag/tagSlice';
import { useNavigate } from "react-router-dom";
import LoadingModal from "../LoadingModal/index.jsx";
import useLoading from "../../hooks/useLoading";

const { Title } = Typography;
const { Option } = Select;

/* ---------------------------------------------------------
   1) HÀM HỖ TRỢ PARSE ĐỊA CHỈ VÀ TÌM TỈNH/QUẬN/PHƯỜNG THEO TÊN
   --------------------------------------------------------- */

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

// Tìm province theo tên (so sánh lowercase, bỏ dấu)
function findProvinceByName(provinces, name) {
  if (!name) return null;
  return provinces.find((p) =>
    removeVietnameseTones(p.name).includes(removeVietnameseTones(name))
  );
}

// Tìm district theo tên
function findDistrictByName(districts, name) {
  if (!name) return null;
  return districts.find((d) =>
    removeVietnameseTones(d.name).includes(removeVietnameseTones(name))
  );
}

// Tìm commune theo tên
function findCommuneByName(communes, name) {
  if (!name) return null;
  return communes.find((c) =>
    removeVietnameseTones(c.name).includes(removeVietnameseTones(name))
  );
}

// Hàm bỏ dấu tiếng Việt và chuyển về lowercase
function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .toLowerCase();
}

const CreateRequestForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loadingUI = useLoading();

  // State từ Redux
  const loading = useSelector((state) => state.request.loading);
  const categories = useSelector((state) => state.category.categories || []);
  const tags = useSelector((state) => state.tag.tags || []);

  // State upload file
  const [attachments, setAttachments] = useState({});
  const [uploading, setUploading] = useState(false);

  // State cho dropdown địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Để hiển thị spinner khi chưa load xong tỉnh (vì cần load xong mới parse)
  const [initialLoading, setInitialLoading] = useState(true);

  /* -----------------------------------------
     2) LẤY CATEGORIES, TAGS, DANH SÁCH TỈNH
     ----------------------------------------- */
  useEffect(() => {
    // Gọi API lấy categories, tags
    dispatch(fetchCategories());
    dispatch(fetchTags());

    // Gọi API lấy danh sách tỉnh
    loadProvinces();
  }, [dispatch]);

  // Hàm load danh sách tỉnh
  const loadProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error("Failed to load provinces:", error);
    }
  };

  /* ---------------------------------------------------------
     3) PARSE ĐỊA CHỈ CỦA USER TỪ localStorage VÀ SET VÀO FORM
     --------------------------------------------------------- */
  useEffect(() => {
    // Hàm async để load data, parse địa chỉ
    const initFormData = async () => {
      // Lấy user từ localStorage
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Parse address => detail, communeName, districtName, provinceName
          const { detail, communeName, districtName, provinceName } = parseLocationString(
            parsedUser.address || ""
          );

          // Gán email, phone, location (detail) vào form
          form.setFieldsValue({
            email: parsedUser.email || "",
            phone: parsedUser.phoneNumber || "",
            location: detail || "", // Số nhà, tên đường
          });

          // Nếu có provinces đã load xong => tìm province code => set form
          if (provinces.length > 0) {
            // Tìm province theo provinceName
            const foundProv = findProvinceByName(provinces, provinceName);
            if (foundProv) {
              // Set form
              form.setFieldsValue({ province: foundProv.code });
              setSelectedProvince(foundProv.code);

              // Load districts
              const distData = await loadDistricts(foundProv.code);

              // Tìm district theo districtName
              if (distData && distData.length > 0) {
                const foundDist = findDistrictByName(distData, districtName);
                if (foundDist) {
                  form.setFieldsValue({ district: foundDist.code });
                  setSelectedDistrict(foundDist.code);

                  // Load communes
                  const commData = await loadCommunes(foundDist.code);
                  // Tìm commune
                  if (commData && commData.length > 0) {
                    const foundComm = findCommuneByName(commData, communeName);
                    if (foundComm) {
                      form.setFieldsValue({ commune: foundComm.code });
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error parsing currentUser:", error);
        }
      }
      setInitialLoading(false); // Kết thúc giai đoạn load dữ liệu ban đầu
    };

    // Gọi initFormData khi provinces đã có (load xong)
    if (provinces.length > 0) {
      initFormData();
    }
  }, [provinces, form]);

  // Hàm load districts
  const loadDistricts = async (provinceCode) => {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await res.json();
      const dist = data.districts || [];
      setDistricts(dist);
      return dist;
    } catch (err) {
      console.error("Failed to load districts:", err);
      return [];
    }
  };

  // Hàm load communes
  const loadCommunes = async (districtCode) => {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await res.json();
      const wards = data.wards || [];
      setCommunes(wards);
      return wards;
    } catch (err) {
      console.error("Failed to load communes:", err);
      return [];
    }
  };

  /* ------------------------------------------------------
     4) XỬ LÝ THAY ĐỔI TRONG SELECT (PROVINCE, DISTRICT,...)
     ------------------------------------------------------ */
  const handleProvinceChange = async (value) => {
    setSelectedProvince(value);
    form.setFieldsValue({ district: null, commune: null });
    setDistricts([]);
    setCommunes([]);
    setSelectedDistrict(null);

    // Load district theo province code
    await loadDistricts(value);
  };

  const handleDistrictChange = async (value) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ commune: null });
    setCommunes([]);

    // Load commune theo district code
    await loadCommunes(value);
  };

  const handleCommuneChange = (value) => {
    form.setFieldsValue({ commune: value });
  };

  /* ----------------------------------
     5) XỬ LÝ UPLOAD ẢNH & VIDEO
     ---------------------------------- */
  const handleImageChange = async ({ fileList }) => {
    setUploading(true);
    let uploadedFiles = [];

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
      images: uploadedFiles,
      videos: prev.videos || []
    }));
    setUploading(false);
  };

  const handleVideoChange = async ({ fileList }) => {
    setUploading(true);
    let uploadedFiles = [];

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
      videos: uploadedFiles,
      images: prev.images || []
    }));
    setUploading(false);
  };

  /* -----------------------
     6) XỬ LÝ SUBMIT FORM
     ----------------------- */
  const onFinish = async (values) => {
    console.log("Form Values:", values);

    // Lấy text hiển thị cho province, district, commune
    const provinceObj = provinces.find((p) => p.code === values.province);
    const districtObj = districts.find((d) => d.code === values.district);
    const communeObj  = communes.find((c) => c.code === values.commune);

    // Ghép fullAddress
    const fullAddress = [
      values.location || "", 
      communeObj ? communeObj.name : "",
      districtObj ? districtObj.name : "",
      provinceObj ? provinceObj.name : ""
    ].filter(Boolean).join(", ");

    // Lấy userId
    let currentUser = {};
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing currentUser:", error);
      }
    }

    // Tạo object gửi lên API
    const requestData = {
      ...values,
      userId: currentUser.id,
      tagIds: values.tagIds,
      imageUrls: attachments.images,
      videoUrls: attachments.videos,
      fullAddress
    };

    console.log("Final Request Data:", requestData);
    try {
      await dispatch(createRequest(requestData)).unwrap();
      message.success("Create request successfully!");
      navigate('/user/manage-profile/myrequests', { replace: true });
    } catch (error) {
      console.error("Error creating request:", error);
      message.error("Failed to create request");
    }
  };

  /* --------------------------------------
     7) HIỂN THỊ SPINNER NẾU ĐANG INIT
     -------------------------------------- */
  if (loadingUI || loading || initialLoading) {
    return <LoadingModal />;
  }

  /* ---------------
     8) GIAO DIỆN UI
     --------------- */
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
            <Form.Item label="Title" name="title" rules={[{ required: true, message: "Title is required" }]}>
              <Input />
            </Form.Item>

            {/* Content */}
            <Form.Item label="Content" name="content" rules={[{ required: true, message: "Content is required" }]}>
              <Input.TextArea />
            </Form.Item>

            {/* Phone */}
            <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone is required" }]}>
              <Input />
            </Form.Item>

            {/* Email */}
            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
              <Input />
            </Form.Item>

            {/* Địa chỉ chi tiết (số nhà, tên đường) */}
            <Form.Item 
              label="Address" 
              name="location" 
              rules={[
                { required: true, message: "Address is required" },
                { pattern: /^[^,]*$/, message: "Address should not contain commas" }
              ]}
            >
              <Input />
            </Form.Item>

            {/* Province */}
            <Form.Item label="Province" name="province" rules={[{ required: true, message: "Province is required" }]}>
              <Select placeholder="Select Province" onChange={handleProvinceChange}>
                {provinces.map(province => (
                  <Option key={province.code} value={province.code}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* District */}
            <Form.Item label="District" name="district" rules={[{ required: true, message: "District is required" }]}>
              <Select
                placeholder="Select District"
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
              >
                {districts.map(district => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Commune */}
            <Form.Item label="Commune" name="commune" rules={[{ required: true, message: "Commune is required" }]}>
              <Select
                placeholder="Select Commune"
                onChange={handleCommuneChange}
                disabled={!selectedDistrict}
              >
                {communes.map(commune => (
                  <Option key={commune.code} value={commune.code}>
                    {commune.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Upload Images */}
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

            {/* Upload Videos */}
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
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.categoryName}
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
                {Array.isArray(tags) &&
                  tags.map(tag => (
                    <Option key={tag.id} value={tag.id}>
                      {tag.tagName}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            {/* Checkbox Emergency */}
            <Form.Item name="isEmergency" valuePropName="checked">
              <Checkbox>Is Emergency</Checkbox>
            </Form.Item>

            {/* Submit Button */}
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
