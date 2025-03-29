import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin, Modal, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../redux/user/userSlice";
import { uploadFileHelper } from "../../redux/helper/helperSlice";

const { Option } = Select;

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

// Hàm tìm province theo tên (so sánh lowercase, bỏ dấu)
function findProvinceByName(provinces, name) {
  if (!name) return null;
  return provinces.find((p) =>
    p.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(
        name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
      )
  );
}

// Tương tự cho district, commune
function findDistrictByName(districts, name) {
  if (!name) return null;
  return districts.find((d) =>
    d.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(
        name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
      )
  );
}

function findCommuneByName(communes, name) {
  if (!name) return null;
  return communes.find((c) =>
    c.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(
        name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
      )
  );
}

const ChangeProfileModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // State cho dropdown
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // State upload avatar
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Tải danh sách tỉnh
  const loadProvinces = async () => {
    try {
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await res.json();
      setProvinces(data);
      return data;
    } catch (err) {
      console.error("Failed to load provinces:", err);
      return [];
    }
  };

  // Tải danh sách district
  const loadDistricts = async (provinceCode) => {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await res.json();
      setDistricts(data.districts || []);
      return data.districts || [];
    } catch (err) {
      console.error("Failed to load districts:", err);
      return [];
    }
  };

  // Tải danh sách commune
  const loadCommunes = async (districtCode) => {
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await res.json();
      setCommunes(data.wards || []);
      return data.wards || [];
    } catch (err) {
      console.error("Failed to load communes:", err);
      return [];
    }
  };

  // Khi modal mở, ta parse address
  useEffect(() => {
    if (!visible) return;
    const fetchData = async () => {
      // Lấy user từ localStorage
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Gán form
          form.setFieldsValue({
            fullName: parsedUser.fullName,
            phoneNumber: parsedUser.phoneNumber,
            address: "", // tạm thời để rỗng, lát parse
            avatar: parsedUser.avatar,
          });
          setAvatarUrl(parsedUser.avatar);

          // parse address
          const { detail, communeName, districtName, provinceName } = parseLocationString(
            parsedUser.address || ""
          );

          // Tải danh sách tỉnh
          const allProvinces = await loadProvinces();

          // fill address detail
          form.setFieldsValue({ address: detail });

          // Tìm province code
          if (provinceName) {
            const foundProv = findProvinceByName(allProvinces, provinceName);
            if (foundProv) {
              form.setFieldsValue({ province: foundProv.code });
              setSelectedProvince(foundProv.code);
              const allDistricts = await loadDistricts(foundProv.code);
              if (districtName) {
                const foundDist = findDistrictByName(allDistricts, districtName);
                if (foundDist) {
                  form.setFieldsValue({ district: foundDist.code });
                  setSelectedDistrict(foundDist.code);
                  const allCommunes = await loadCommunes(foundDist.code);
                  if (communeName) {
                    const foundComm = findCommuneByName(allCommunes, communeName);
                    if (foundComm) {
                      form.setFieldsValue({ commune: foundComm.code });
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Error parsing currentUser:", err);
        }
      }
      setInitialLoading(false);
    };
    fetchData();
  }, [visible]);

  // handle province/district/commune change
  const handleProvinceChange = async (value) => {
    setSelectedProvince(value);
    form.setFieldsValue({ district: null, commune: null });
    setDistricts([]);
    setCommunes([]);
    setSelectedDistrict(null);
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

  // Upload avatar
  const handleAvatarChange = async ({ fileList }) => {
    setUploading(true);
    const file = fileList[0];
    if (file) {
      try {
        const result = await dispatch(uploadFileHelper(file.originFileObj, "images")).unwrap();
        const newAvatarUrl = result.url || result;
        setAvatarUrl(newAvatarUrl);
        form.setFieldsValue({ avatar: newAvatarUrl });
        message.success("Avatar uploaded");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        message.error(`Upload failed for ${file.name}`);
      }
    }
    setUploading(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Lấy provinceObj, districtObj, communeObj
      const provinceObj = provinces.find((p) => p.code === form.getFieldValue("province"));
      const districtObj = districts.find((d) => d.code === form.getFieldValue("district"));
      const communeObj = communes.find((c) => c.code === form.getFieldValue("commune"));
      // Ghép fullAddress
      values.fullAddress =
        values.address +
        (communeObj ? `, ${communeObj.name}` : "") +
        (districtObj ? `, ${districtObj.name}` : "") +
        (provinceObj ? `, ${provinceObj.name}` : "");

      // Gọi API update
      await dispatch(updateProfile(values)).unwrap();
      message.success("Profile updated successfully");

      // Đóng modal + refresh
      onCancel();
      window.location.reload();
    } catch (err) {
      message.error(err || "Update profile failed");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Modal visible={visible} onCancel={onCancel} footer={null} destroyOnClose>
        <Spin style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }} />
      </Modal>
    );
  }

  return (
    <Modal
      title="Edit Profile"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: "Please input your full name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Phone Number" name="phoneNumber">
          <Input />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Address is required" },
          { pattern: /^[^,]*$/, message: "Address should not contain comma" }
          ]}          
        >
          <Input placeholder="Enter street address" />
        </Form.Item>

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
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            className="continue-button"
            loading={loading}
          >
            Update Profile
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangeProfileModal;
