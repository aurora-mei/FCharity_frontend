import React, { useRef, useState } from "react";
import { createOrganization } from "../../redux/organization/organizationSlice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { FaLink } from "react-icons/fa";
import { IoCamera } from "react-icons/io5";
import ColorThief from "colorthief";
import helperApi from "../../redux/helper/helperApi";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "../../utils/showMessage";

const CreateOrganization = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [orgInfo, setOrgInfo] = useState({
    organizationName: "",
    email: "",
    phoneNumber: "",
    address: "",
    walletId: "",
    organizationDescription: "",
    organizationStatus: "PENDING",
    backgroundUrl: null,
  });

  const [errors, setErrors] = useState([]);

  const [background, setBackground] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(null);

  const backgroundInputRef = useRef(null);

  const triggerBackgroundUpload = () => backgroundInputRef.current.click();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrgInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackground(imageUrl);

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      const colorThief = new ColorThief();
      img.onload = () => {
        try {
          const dominantColor = colorThief.getColor(img);
          console.log("dominant: ", dominantColor);
          setBackgroundColor(dominantColor);
        } catch (error) {
          console.error("Lỗi khi lấy màu chủ đạo: ", error);
        }
      };

      img.onerror = () => console.error("Lỗi khi tải ảnh: ", imageUrl);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (orgInfo.organizationName.trim() === "")
      newErrors.organizationName = "Organization name cannot be blank";

    if (orgInfo.email.trim() === "") newErrors.email = "Email cannot be blank";
    else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(orgInfo.email)
    )
      newErrors.email = "Invalid email";

    if (orgInfo.phoneNumber.trim() === "")
      newErrors.phoneNumber = "Phone number cannot be blank";
    else if (!/^\d{10}$/.test(orgInfo.phoneNumber))
      newErrors.phoneNumber = "Invalid phone number";

    if (orgInfo.address.trim() === "")
      newErrors.address = "Address cannot be blank";

    if (orgInfo.organizationDescription.trim() === "")
      newErrors.organizationDescription = "Description cannot be blank";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let updatedOrgInfo = { ...orgInfo };
      showInfo("Đang tạo tổ chức...");

      if (backgroundInputRef.current?.files[0]) {
        const backgroundUrl = await uploadFile({
          file: backgroundInputRef.current.files[0],
          folderName: "organizations",
        });
        updatedOrgInfo = { ...updatedOrgInfo, backgroundUrl };
      }

      setOrgInfo(updatedOrgInfo);

      dispatch(createOrganization(updatedOrgInfo))
        .then(() => {
          console.log("Tạo tổ chức thành công!");
          showSuccess("Tạo tổ chức thanh cong!");

          setOrgInfo({
            organizationName: "",
            email: "",
            phoneNumber: "",
            address: "",
            walletId: "",
            organizationDescription: "",
            organizationStatus: "PENDING",
            backgroundUrl: "",
          });

          setBackground(null);
          backgroundInputRef.current.value = null;
          navigate("/my-organization");
        })
        .catch((error) => {
          showError("Tạo tổ chức that bai!");
          console.error("Lỗi khi tạo tổ chức: ", error);
        });
    } catch (error) {
      showError("Tạo tổ chức that bai!");
      console.error("Lỗi khi upload ảnh: ", error);
    }
  };

  const rgbToCss = (rgb) =>
    rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : "bg-gray-300";

  return (
    <div className="relative max-w-[1300px] mx-auto">
      <div
        className={`shadow-md pb-10 flex flex-col items-center`}
        style={{
          background: `linear-gradient(to bottom, ${rgbToCss(
            backgroundColor
          )} 0%, white 50%, white 100%) `,
        }}
      >
        <div
          className="w-[90%] aspect-video  overflow-hidden rounded-bl-2xl rounded-br-2xl relative bg-gray-300"
          style={{ maxWidth: "1250px", maxHeight: "360px" }}
        >
          {background && (
            <img
              src={background}
              alt="Background image"
              className="w-full h-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={triggerBackgroundUpload}
            className="absolute right-8 bottom-5 rounded-md bg-white flex items-center px-2 py-1 gap-2  hover:cursor-pointer hover:bg-gray-200"
          >
            <IoCamera style={{ fontSize: "24px" }} />
            <span>Edit background image</span>
          </button>
          <input
            type="file"
            ref={backgroundInputRef}
            onChange={handleBackgroundChange}
            accept="image/*"
            className="hidden"
          ></input>
        </div>
        <div className="mt-8 ml-20 self-start">
          <div className="flex gap-8 items-end px-8">
            <div className="flex flex-col gap-2 mb-4">
              <p className="font-semibold text-3xl" style={{ margin: 0 }}>
                {orgInfo.organizationName || "Organization Name"}
              </p>
              <span>@organizationUrl</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-10 my-20 max-w-[800px] mx-auto">
        <p className="font-bold text-xl text-gray-900 mb-4">
          Basic Information
        </p>
        <form className="space-y-3 ml-8" onSubmit={handleSubmit}>
          <div className="flex gap-2 items-start">
            <label htmlFor="name" className="w-[160px] shrink-0">
              Organization name <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-1 w-full">
              <input
                id="name"
                type="text"
                name="organizationName"
                placeholder="Fpt Software Academy"
                value={orgInfo.organizationName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
              {errors.organizationName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.organizationName}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <label htmlFor="email" className="w-[160px] shrink-0">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-1 w-full">
              <input
                id="email"
                type="text"
                name="email"
                placeholder="duc@gmail.com"
                value={orgInfo.email}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <label htmlFor="phone" className="w-[160px] shrink-0">
              Phone number <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-1 w-full">
              <input
                id="phone"
                type="text"
                name="phoneNumber"
                placeholder="0123456789"
                value={orgInfo.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <label htmlFor="address" className="w-[160px] shrink-0">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-1 w-full">
              <input
                id="address"
                type="text"
                name="address"
                placeholder="Số 1, phường Hòa Hải, quận Ngũ Hành Sơn, tp Đà Nẵng."
                value={orgInfo.address}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <label htmlFor="wallet" className="w-[160px] shrink-0">
              Wallet address
            </label>
            <div className="flex flex-col gap-1 w-full">
              <input
                id="wallet"
                type="text"
                name="walletId"
                placeholder="987-234234KKF-234423 (Auto-generate after creating organization.)"
                value={""}
                disabled
                className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <label htmlFor="description" className="w-[160px] shrink-0 mt-3">
              Descriptions <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-1 w-full">
              <textarea
                id="description"
                type="text"
                name="organizationDescription"
                placeholder="Message | Mô tả về chi tiết về tổ chức giáo dức phi lợi nhuận"
                value={orgInfo.organizationDescription}
                onChange={handleChange}
                className="w-full h-[120px] p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
              {errors.organizationDescription && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.organizationDescription}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-row-reverse mt-8">
            <button className="bg-green-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-green-700 hover:cursor-pointer hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300">
              <span className="text-white">Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganization;
