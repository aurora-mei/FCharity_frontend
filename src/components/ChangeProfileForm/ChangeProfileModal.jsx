import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Spin, Modal, Select } from "antd";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../redux/user/userSlice";

const { Option } = Select;

function parseLocationString(locationString = "") {
  const parts = locationString.split(",").map(p => p.trim());
  // Nếu số phần nhỏ hơn 3, trả về chuỗi ban đầu
  if (parts.length < 3) {
    return { detail: locationString, communeName: "", districtName: "", provinceName: "" };
  }
  const provinceName = parts[parts.length - 1] || "";
  const districtName = parts[parts.length - 2] || "";
  const communeName  = parts[parts.length - 3] || "";
  const detailParts  = parts.slice(0, parts.length - 3);
  const detail       = detailParts.join(", ");
  return { detail, communeName, districtName, provinceName };
}

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

  // State cho dropdown địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Vì modal này không cập nhật avatar nên ta chỉ giữ giá trị avatar ban đầu
  const [initialAvatar, setInitialAvatar] = useState("");

  // Hàm load danh sách tỉnh
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

  // Hàm load district
  const loadDistricts = async (provinceCode) => {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await res.json();
      setDistricts(data.districts || []);
      return data.districts || [];
    } catch (err) {
      console.error("Failed to load districts:", err);
      return [];
    }
  };

  // Hàm load commune
  const loadCommunes = async (districtCode) => {
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await res.json();
      setCommunes(data.wards || []);
      return data.wards || [];
    } catch (err) {
      console.error("Failed to load communes:", err);
      return [];
    }
  };

  // Khi modal mở, load dữ liệu user từ localStorage và set vào form
  useEffect(() => {
    if (!visible) return;
    const fetchData = async () => {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Đặt avatar ban đầu, không cho phép thay đổi qua modal này
          setInitialAvatar(parsedUser.avatar);
          form.setFieldsValue({
            fullName: parsedUser.fullName,
            phoneNumber: parsedUser.phoneNumber,
            address: "", // Chờ parse address sau
            avatar: parsedUser.avatar, // Giữ lại avatar cũ
          });

          // Parse địa chỉ
          const { detail, communeName, districtName, provinceName } = parseLocationString(
            parsedUser.address || ""
          );
          form.setFieldsValue({ address: detail });

          // Load danh sách tỉnh
          const allProvinces = await loadProvinces();
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
  }, [visible, form]);

  // Xử lý thay đổi cho province, district, commune
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

  // Khi submit form, avatar không thay đổi – giữ giá trị ban đầu
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Giữ avatar cũ nếu không có giá trị mới (modal này không cho sửa avatar)
      values.avatar = initialAvatar;

      // Lấy đối tượng province, district, commune để ghép fullAddress
      const provinceObj = provinces.find((p) => p.code === form.getFieldValue("province"));
      const districtObj = districts.find((d) => d.code === form.getFieldValue("district"));
      const communeObj  = communes.find((c) => c.code === form.getFieldValue("commune"));

      values.fullAddress =
        values.address +
        (communeObj ? `, ${communeObj.name}` : "") +
        (districtObj ? `, ${districtObj.name}` : "") +
        (provinceObj ? `, ${provinceObj.name}` : "");

      // Gọi API cập nhật profile với avatar không thay đổi
      await dispatch(updateProfile(values)).unwrap();
      message.success("Profile updated successfully");

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
          rules={[
            { required: true, message: "Address is required" },
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

        {/* Hidden field để giữ avatar hiện tại */}
        <Form.Item name="avatar" hidden>
          <Input />
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
