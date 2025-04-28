import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from "../../redux/category/categorySlice";
import { fetchTags } from "../../redux/tag/tagSlice";
import { uploadFileHelper } from "../../redux/helper/helperSlice";

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

/** Tìm province theo tên (so sánh đơn giản, toLowerCase + includes) */
function findProvinceByName(provinces, name) {
  if (!name) return null;
  return provinces.find(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
}
/** Tìm district theo tên */
function findDistrictByName(districts, name) {
  if (!name) return null;
  return districts.find(d =>
    d.name.toLowerCase().includes(name.toLowerCase())
  );
}
/** Tìm commune theo tên */
function findCommuneByName(communes, name) {
  if (!name) return null;
  return communes.find(c =>
    c.name.toLowerCase().includes(name.toLowerCase())
  );
}

const UpdateRequestModal = ({
  form,
  isOpen,
  attachments,
  setAttachments,
  handleUpdate,
  handleCancel
}) => {
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.category.categories || []);
  const tags = useSelector((state) => state.tag.tags || []);

  // Các state quản lý danh sách dropdown address
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Hàm load provinces
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

  // Hàm load districts (khi có provinceCode)
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

  // Hàm load communes (khi có districtCode)
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

  // useEffect: khi Modal mở, parse location nếu DB chưa có province
  useEffect(() => {
    if (isOpen) {
      // Tải categories, tags nếu chưa có
      if (!categories.length) dispatch(fetchCategories());
      if (!tags.length) dispatch(fetchTags());

      const loadData = async () => {
        const currentProvince = form.getFieldValue('province');
        const currentDistrict = form.getFieldValue('district');
        const locationString = form.getFieldValue('location') || "";

        // Tải danh sách tỉnh
        const provincesData = await loadProvinces();

        // Nếu DB chưa có province code, ta parse location
        if (!currentProvince && locationString) {
          const { detail, communeName, districtName, provinceName } = parseLocationString(locationString);

          // 1) Gán detail cho ô location -> chỉ hiển thị "123"
          form.setFieldsValue({ location: detail });

          // 2) Tìm province code từ provincesData
          const foundProvince = findProvinceByName(provincesData, provinceName);
          if (foundProvince) {
            form.setFieldsValue({ province: foundProvince.code });
            setSelectedProvince(foundProvince.code);

            // 3) Tải danh sách district -> tìm district code
            const districtsData = await loadDistricts(foundProvince.code);
            const foundDistrict = findDistrictByName(districtsData, districtName);
            if (foundDistrict) {
              form.setFieldsValue({ district: foundDistrict.code });
              setSelectedDistrict(foundDistrict.code);

              // 4) Tải danh sách commune -> tìm commune code
              const communesData = await loadCommunes(foundDistrict.code);
              const foundCommune = findCommuneByName(communesData, communeName);
              if (foundCommune) {
                form.setFieldsValue({ commune: foundCommune.code });
              }
            }
          }
        } else {
          // Nếu DB đã có province code -> load districts/communes cho dropdown
          if (currentProvince) await loadDistricts(currentProvince);
          if (currentDistrict) await loadCommunes(currentDistrict);
        }
      };
      loadData().catch(err => console.error("Error in loadData:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle user changing province/district/commune
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

  // Xử lý upload Images
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
      images: [...prev.images, ...uploadedFiles],
      videos: prev.videos || []
    }));
    setUploading(false);
  };

  // Xử lý upload Videos
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
      videos: [...prev.videos, ...uploadedFiles],
      images: prev.images || []
    }));
    setUploading(false);
  };

  return (
    <Modal
      open={isOpen}
      footer={null}
      title="Update Request"
      onCancel={handleCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleUpdate}>
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

        {/* Location */}
        <Form.Item
          label="Address"
          name="location"
          rules={[{ required: true, message: "Address is required" },
          { pattern: /^[^,]*$/, message: "Address should not contain comma" }
          ]}
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
            {provinces.map(province => (
              <Option key={province.code} value={province.code}>
                {province.name}
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
            {districts.map(district => (
              <Option key={district.code} value={district.code}>
                {district.name}
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
            {communes.map(commune => (
              <Option key={commune.code} value={commune.code}>
                {commune.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Upload Images */}
        <Form.Item label="Images" name="images">
          <Upload
            multiple
            listType="picture"
            beforeUpload={() => false}
            accept="image/*"
            onChange={handleImageChange}
            defaultFileList={
              Array.isArray(attachments.images)
                ? attachments.images.map((image, index) => ({
                    uid: index.toString(),
                    name: `Image ${index + 1}`,
                    url: image,
                  }))
                : []
            }
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
            defaultFileList={
              Array.isArray(attachments.videos)
                ? attachments.videos.map((video, index) => ({
                    uid: index.toString(),
                    name: `Video ${index + 1}`,
                    url: video,
                  }))
                : []
            }
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
          name="requestTags"
          rules={[{ required: true, message: "At least one tag is required" }]}
        >
          <Select mode="multiple" placeholder="Select tags" allowClear>
            {tags.map(tag => (
              <Option key={tag.id} value={tag.id}>
                {tag.tagName}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block className="request-btn">
            Update Request
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateRequestModal;
