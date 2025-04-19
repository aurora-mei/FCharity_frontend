import React, { useEffect, useRef, useState } from "react";

import {
  deleteFileLocal,
  getManagedOrganizationByCeo,
  getOrganizationVerificationDocuments,
  updateOrganization,
  uploadFileLocal,
} from "../../redux/organization/organizationSlice";

import helperApi from "../../redux/helper/helperApi";

import { useDispatch, useSelector } from "react-redux";
import { IoCamera } from "react-icons/io5";
import ColorThief from "colorthief";

import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "../../utils/showMessage";
import ReferenceLink from "./components/ReferenceLink";
import FileCard from "./components/FileCard";

const MyOrganization = () => {
  const dispatch = useDispatch();

  const { ownedOrganization, verificationDocuments } = useSelector(
    (state) => state.organization
  );
  console.log(" owned organization: ", ownedOrganization);
  console.log("verificationDocuments: ", verificationDocuments);

  const [orgInfo, setOrgInfo] = useState({
    organizationId: "",
    organizationName: "",
    email: "",
    phoneNumber: "",
    address: "",
    walletAddress: null,
    ceo: null,
    organizationDescription: "",
    organizationStatus: "",
    backgroundUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newDocuments, setNewDocuments] = useState([]);
  const [deletedDocuments, setDeletedDocuments] = useState([]);

  const [activeTab, setActiveTab] = useState("Basic Information");

  useEffect(() => {
    dispatch(getManagedOrganizationByCeo());
  }, []);

  useEffect(() => {
    if (ownedOrganization) {
      dispatch(
        getOrganizationVerificationDocuments(ownedOrganization.organizationId)
      );

      setOrgInfo({
        organizationId: ownedOrganization?.organizationId,
        organizationName: ownedOrganization?.organizationName,
        email: ownedOrganization?.email,
        phoneNumber: ownedOrganization?.phoneNumber,
        address: ownedOrganization?.address,
        walletAddress: ownedOrganization?.walletAddress,
        ceo: ownedOrganization?.ceo,
        organizationDescription: ownedOrganization?.organizationDescription,
        organizationStatus: ownedOrganization?.organizationStatus,
        backgroundUrl: ownedOrganization?.backgroundUrl,
        reason: ownedOrganization?.reason,
        advice: ownedOrganization?.advice,
      });
    }
  }, [ownedOrganization, dispatch]);

  const [background, setBackground] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(null);

  const backgroundInputRef = useRef(null);

  const triggerBackgroundUpload = () => backgroundInputRef.current.click();

  console.log("🍎🍎🍎new documents:", newDocuments);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrgInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewDocuments((prev) => [...prev, ...files]);
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
    handleSubmit();
  };

  const handleSubmitFile = async () => {
    try {
      if (newDocuments.length > 0) {
        const newDocUrls = await Promise.all(
          newDocuments.map(
            async (docFile) =>
              await dispatch(
                uploadFileLocal({
                  file: docFile,
                  organizationId: ownedOrganization.organizationId,
                })
              ).unwrap()
          )
        );
        console.log("newDocUrls 🦔🦔🦔: ", newDocUrls);
        setNewDocuments([]);
      } else {
        showWarning("Chưa chon file");
      }

      if (deletedDocuments.length > 0) {
        await Promise.all(
          deletedDocuments.map(
            async (docId) =>
              await dispatch(
                deleteFileLocal({
                  organizationId: ownedOrganization.organizationId,
                  documentId: docId,
                })
              ).unwrap()
          )
        );
        setDeletedDocuments([]);
      }
    } catch (err) {
      console.error("Failed to upload file:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      let updatedOrgInfo = { ...orgInfo };
      showInfo("Cập nhật tổ chức...");

      if (backgroundInputRef.current?.files[0]) {
        const backgroundUrl = await helperApi.uploadFile({
          file: backgroundInputRef.current.files[0],
          folderName: "organizations",
        });
        updatedOrgInfo = { ...updatedOrgInfo, backgroundUrl };
      }
      console.log("updatedOrgInfo: ", updatedOrgInfo);
      setOrgInfo(updatedOrgInfo);

      dispatch(updateOrganization(updatedOrgInfo))
        .then(() => {
          console.log("Cập nhật tổ chức thành công!");
          setBackground(null);
          backgroundInputRef.current.value = null;
          showSuccess("Cập nhật tổ chức thanh cong!");
          dispatch(getManagedOrganizationByCeo());
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật tổ chức: ", error);
          showError("Lỗi khi cập nhật tổ chức!");
        });
    } catch (error) {
      console.error("Lỗi khi upload ảnh: ", error);
      showError("Lỗi khi cập nhật tổ chức!");
    }
  };

  const rgbToCss = (rgb) =>
    rgb ? `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` : "bg-gray-300";

  const getFileType = (type) => {
    switch (type) {
      case "text/csv":
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      case "application/vnd.oasis.opendocument.spreadsheet":
        return "excel";

      case "application/pdf":
        return "pdf";

      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "word";

      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      case "application/vnd.ms-powerpoint":
        return "powerpoint";
    }
  };

  const handleDeleteDocument = (fileName) => {
    if (verificationDocuments.some((d) => d.fileName == fileName)) {
      const file = verificationDocuments.find((d) => d.fileName == fileName);
      setDeletedDocuments((prev) => [...prev, file]);
    }
  };

  const handleDeleteNewDocument = (index) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      <div
        className={`shadow-md pb-10 flex flex-col items-center`}
        style={{
          background: `linear-gradient(to bottom, ${rgbToCss(
            backgroundColor
          )} 0%, white 50%, white 100%) `,
        }}
      >
        <div
          className="w-[96%] aspect-video  overflow-hidden rounded-xs relative bg-gray-300"
          style={{ maxWidth: "1250px", maxHeight: "260px" }}
        >
          {(background || ownedOrganization?.backgroundUrl) && (
            <img
              src={background || ownedOrganization.backgroundUrl}
              alt="Background image"
              className="w-full h-full object-cover"
            />
          )}
          {isEditing && (
            <div>
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
          )}
        </div>
        <div className="ml-20 mt-6 self-start">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2 items-center justify-between">
              <p className="font-semibold text-3xl" style={{ margin: 0 }}>
                {orgInfo.organizationName || "Organization Name"}
              </p>
              {orgInfo.organizationStatus !== "PENDING" && (
                <span className="text-blue-500">
                  <svg
                    viewBox="0 0 12 13"
                    width={20}
                    height={20}
                    fill="currentColor"
                    title="The account was verified."
                    className=""
                  >
                    <title>This account was verified.</title>
                    <g fillRule="evenodd" transform="translate(-98 -917)">
                      <path d="m106.853 922.354-3.5 3.5a.499.499 0 0 1-.706 0l-1.5-1.5a.5.5 0 1 1 .706-.708l1.147 1.147 3.147-3.147a.5.5 0 1 1 .706.708m3.078 2.295-.589-1.149.588-1.15a.633.633 0 0 0-.219-.82l-1.085-.7-.065-1.287a.627.627 0 0 0-.6-.603l-1.29-.066-.703-1.087a.636.636 0 0 0-.82-.217l-1.148.588-1.15-.588a.631.631 0 0 0-.82.22l-.701 1.085-1.289.065a.626.626 0 0 0-.6.6l-.066 1.29-1.088.702a.634.634 0 0 0-.216.82l.588 1.149-.588 1.15a.632.632 0 0 0 .219.819l1.085.701.065 1.286c.014.33.274.59.6.604l1.29.065.703 1.088c.177.27.53.362.82.216l1.148-.588 1.15.589a.629.629 0 0 0 .82-.22l.701-1.085 1.286-.064a.627.627 0 0 0 .604-.601l.065-1.29 1.088-.703a.633.633 0 0 0 .216-.819"></path>
                    </g>
                  </svg>
                </span>
              )}
            </div>
            <span>@{orgInfo.organizationId || "organizationUrl"}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6 mt-8">
        <button
          onClick={() => setActiveTab("Basic Information")}
          className={`px-6 py-3 text-lg font-semibold transition-all duration-300 hover:cursor-pointer ${
            activeTab === "Basic Information"
              ? "border-b-4 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          Basic Information
        </button>
        <button
          onClick={() => setActiveTab("Verification Documents")}
          className={`px-6 py-3 text-lg font-semibold transition-all duration-300 hover:cursor-pointer ${
            activeTab === "Verification Documents"
              ? "border-b-4 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          Verification Documents
        </button>
      </div>

      {activeTab === "Basic Information" &&
        (isEditing ? (
          <div className="mx-10 my-20 max-w-[800px]">
            <p className="font-bold text-xl text-gray-900 mb-4">
              Basic Information
            </p>
            <div className="space-y-3 ml-8">
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
                  value={orgInfo.walletAddress.id}
                  disabled
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
                />
              </div>
              <div className="flex gap-2 items-start">
                <label
                  htmlFor="description"
                  className="w-[160px] shrink-0 mt-3"
                >
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
              <div className="flex flex-row-reverse mt-8 gap-3">
                <button
                  type="button"
                  className="bg-gray-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-gray-700 hover:shadow-md hover:cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
                  onClick={() => {
                    dispatch(getManagedOrganizationByCeo());
                    setIsEditing(false);
                  }}
                >
                  <span className="text-white">Cancel</span>
                </button>
                <button
                  type="submit"
                  className="bg-green-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-green-700 hover:shadow-md  hover:cursor-pointer  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
                  onClick={() => {
                    setIsEditing(false);
                    handleSubmit();
                  }}
                >
                  <span className="text-white">Save</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 animate-fadeIn relative">
            {/* Thông tin tổ chức */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-[160px] font-semibold text-gray-700">
                  Organization name
                </span>
                <span className="text-gray-800  px-3 py-1 rounded-md">
                  {orgInfo.organizationName}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="w-[160px] font-semibold text-gray-700">
                  Email
                </span>
                <span className="text-gray-800  px-3 py-1 rounded-md">
                  {orgInfo.email}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="w-[160px] font-semibold text-gray-700">
                  Phone number
                </span>
                <span className="text-gray-800  px-3 py-1 rounded-md">
                  {orgInfo.phoneNumber}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="w-[160px] font-semibold text-gray-700">
                  Address
                </span>
                <span className="text-gray-800  px-3 py-1 rounded-md">
                  {orgInfo.address}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="w-[160px] font-semibold text-gray-700">
                  Wallet address
                </span>
                <span className="text-gray-800  px-3 py-1 rounded-md">
                  {orgInfo?.walletAddress?.id}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-[160px] font-semibold text-gray-700">
                  Descriptions
                </span>
                <span className="text-gray-800  px-3 py-1 rounded-md flex-1">
                  {orgInfo.organizationDescription}
                </span>
              </div>
            </div>
            <div className="absolute bottom-2 right-4">
              <button
                onClick={() => {
                  setIsEditing(true);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-white transform transition-all duration-300 hover:cursor-pointer hover:scale-105 bg-green-500 hover:bg-green-600`}
              >
                Update
              </button>
            </div>
          </div>
        ))}
      {activeTab === "Verification Documents" &&
        (isEditing ? (
          <div className="flex flex-col gap-10">
            <div className="flex gap-3 items-start min-h-[50px]">
              <label
                htmlFor="verificationDocs"
                className="w-[160px] font-semibold text-gray-700 mt-3"
              >
                Verification Docs
              </label>
              <div className="w-full">
                <input
                  id="verificationDocs"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  onChange={handleFileChange}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition duration-200"
                  maxLength={10 * 1024 * 1024}
                />
                {newDocuments.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap hover:cursor-pointer">
                    {newDocuments.map((file, index) => (
                      <FileCard
                        key={index}
                        index={index}
                        fileName={file.name}
                        type={getFileType(file.type)}
                        size={file.size}
                        isEditing={isEditing}
                        isNew={true}
                        handleDeleteDocument={handleDeleteDocument}
                        handleDeleteNewDocument={handleDeleteNewDocument}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {verificationDocuments?.length > 0 ? (
              <div className="flex gap-4 flex-wrap">
                {verificationDocuments
                  .filter(
                    (v) =>
                      !deletedDocuments.some(
                        (d) => d.uploadedFileId == v.uploadedFileId
                      )
                  )
                  .map((file, index) => (
                    <FileCard
                      key={index}
                      index={index}
                      fileName={file.fileName}
                      type={getFileType(file.fileType)}
                      size={file.fileSize}
                      isEditing={isEditing}
                      isNew={false}
                      handleDeleteDocument={handleDeleteDocument}
                      handleDeleteNewDocument={handleDeleteNewDocument}
                    />
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No verification documents uploaded yet.
              </p>
            )}

            <div className="flex flex-row-reverse mt-8 gap-3">
              <button
                type="button"
                className="bg-gray-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-gray-700 hover:shadow-md hover:cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
                onClick={() => {
                  setIsEditing(false);
                  setNewDocuments([]);
                  setDeletedDocuments([]);
                }}
              >
                <span className="text-white">Cancel</span>
              </button>
              <button
                type="submit"
                className="bg-green-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-green-700 hover:shadow-md  hover:cursor-pointer  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300"
                onClick={() => {
                  setIsEditing(false);
                  handleSubmitFile();
                }}
              >
                <span className="text-white">Save files</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Verification Documents
              </h2>
              {verificationDocuments?.length > 0 ? (
                <div className="flex gap-4 flex-wrap hover:cursor-pointer">
                  {verificationDocuments
                    .filter(
                      (v) =>
                        !deletedDocuments.some(
                          (d) => d.organizationImageId == v.organizationImageId
                        )
                    )
                    .map((file, index) => (
                      <FileCard
                        key={index}
                        index={index}
                        fileName={file.fileName}
                        type={getFileType(file.fileType)}
                        size={file.fileSize}
                        isEditing={isEditing}
                        isNew={false}
                        handleDeleteDocument={handleDeleteDocument}
                        handleDeleteNewDocument={handleDeleteNewDocument}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  No verification documents uploaded yet.
                </p>
              )}
            </div>
            <div className="absolute bottom-2 right-4">
              <button
                onClick={() => {
                  setIsEditing(true);
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-white transform transition-all duration-300 hover:cursor-pointer hover:scale-105 bg-green-500 hover:bg-green-600`}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default MyOrganization;
