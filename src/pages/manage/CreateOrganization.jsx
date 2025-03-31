import ManagerLayout from "../../components/Layout/ManagerLayout";
import React, { useRef, useState } from "react";
import {
  createOrganization,
  getManagedOrganizations,
} from "../../redux/organization/organizationSlice";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { FaLink } from "react-icons/fa";
import { IoCamera } from "react-icons/io5";
import ColorThief from "colorthief";
import { uploadFile } from "../../redux/helper/helperApi";
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
    organizationStatus: "Active",
    avatarUrl: null,
    backgroundUrl: null,
  });

  const [avatar, setAvatar] = useState(null);
  const [background, setBackground] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(null);

  const avatarInputRef = useRef(null);
  const backgroundInputRef = useRef(null);

  const triggerAvatarUpload = () => avatarInputRef.current.click();
  const triggerBackgroundUpload = () => backgroundInputRef.current.click();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrgInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let updatedOrgInfo = { ...orgInfo };
      showInfo("Đang tạo tổ chức...");
      if (avatarInputRef.current?.files[0]) {
        const avatarUrl = await uploadFile(
          {file:avatarInputRef.current.files[0],
          folderName:"organizations"}
        );
        updatedOrgInfo = { ...updatedOrgInfo, avatarUrl };
      }

      if (backgroundInputRef.current?.files[0]) {
        const backgroundUrl = await uploadFile(
          {file:backgroundInputRef.current.files[0],
          folderName:"organizations"}
        );
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
            organizationStatus: "Active",
            avatarUrl: "",
            backgroundUrl: "",
          });
          setAvatar(null);
          setBackground(null);
          avatarInputRef.current.value = null;
          backgroundInputRef.current.value = null;
          navigate("/manage-organization");
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
    <ManagerLayout>
      <div className="pl-2">
        <div className="inline-flex gap-2 items-baseline">
          <FaLink />
          <Link to={"/"} className="hover:underline">
            Home
          </Link>
        </div>
        <span> / </span>
        <Link to={"/organizations"} className="hover:underline">
          organizations
        </Link>
        <span> / </span>
        <Link to={"/organizations/create"} className="hover:underline">
          create
        </Link>
      </div>
      <div className="relative m-10">
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
            style={{ maxWidth: "1250px", maxHeight: "460px" }}
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
          <div className="-mt-8 ml-20 self-start">
            <div className="flex gap-8 items-end px-8">
              <div className="relative h-32 w-32">
                <div className="rounded-full h-full w-full border-4 border-white overflow-hidden bg-gray-500">
                  {avatar && (
                    <img
                      src={avatar}
                      alt="Avatar image"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={triggerAvatarUpload}
                  className="p-[6px] rounded-full absolute bottom-0 right-0 bg-gray-200 flex items-center justify-center hover:cursor-pointer hover:bg-gray-300"
                >
                  <IoCamera style={{ fontSize: "24px" }} />
                </button>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <p className="font-semibold text-3xl" style={{ margin: 0 }}>
                  {orgInfo.organizationName || "Organization Name"}
                </p>
                <span>@organizationUrl</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-10 my-20 max-w-[800px]">
          <p className="font-bold text-xl text-gray-900 mb-4">
            Basic Information
          </p>
          <form className="space-y-3 ml-8" onSubmit={handleSubmit}>
            <div className="flex gap-2 items-center">
              <label htmlFor="name" className="w-[160px] shrink-0">
                Organization name
              </label>
              <input
                id="name"
                type="text"
                name="organizationName"
                placeholder="Fpt Software Academy"
                value={orgInfo.organizationName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="email" className="w-[160px] shrink-0">
                Email
              </label>
              <input
                id="email"
                type="text"
                name="email"
                placeholder="duc@gmail.com"
                value={orgInfo.email}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="phone" className="w-[160px] shrink-0">
                Phone number
              </label>
              <input
                id="phone"
                type="text"
                name="phoneNumber"
                placeholder="0123456789"
                value={orgInfo.phoneNumber}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
            </div>

            <div className="flex gap-2 items-center">
              <label htmlFor="address" className="w-[160px] shrink-0">
                Address
              </label>
              <input
                id="address"
                type="text"
                name="address"
                placeholder="Số 1, phường Hòa Hải, quận Ngũ Hành Sơn, tp Đà Nẵng."
                value={orgInfo.address}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="wallet" className="w-[160px] shrink-0">
                Wallet address
              </label>
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
            <div className="flex gap-2 items-start">
              <label htmlFor="description" className="w-[160px] shrink-0 mt-3">
                Descriptions
              </label>
              <textarea
                id="description"
                type="text"
                name="organizationDescription"
                placeholder="Tổ chức giáo dục phi lợi nhuận."
                value={orgInfo.organizationDescription}
                onChange={handleChange}
                className="w-full h-[120px] p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
              />
            </div>
            <div className="flex flex-row-reverse mt-8">
              <button className="bg-green-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-green-700 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300">
                <span className="text-white">Create</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default CreateOrganization;
