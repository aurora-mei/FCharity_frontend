import React, { useEffect, useRef, useState } from "react";

import {
  addOrganizationVerificationDocument,
  deleteOrganizationVerificationDocument,
  getCeoOrganization,
  getManagedOrganizationByCeo,
  getOrganizationVerificationDocuments,
  setCurrentOrganization,
  updateOrganization,
} from "../../redux/organization/organizationSlice";

import helperApi from "../../redux/helper/helperApi";

import { useDispatch, useSelector } from "react-redux";
import { IoCamera } from "react-icons/io5";
import ColorThief from "colorthief";
import CircularProgress from "@mui/material/CircularProgress";

import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "../../utils/showMessage";
import FileCard from "./components/FileCard";
import { Link } from "react-router-dom";
import { Empty } from "antd";

const MyOrganization = () => {
  const dispatch = useDispatch();

  const currentRole = useSelector((state) => state.organization.currentRole);
  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  console.log("currentRole: ", currentRole);
  console.log("currentOrganization: ", currentOrganization);

  const orgCeo = useSelector((state) => state.organization.orgCeo);
  const verificationDocuments = useSelector(
    (state) => state.organization.verificationDocuments
  );

  const ownedOrganization = useSelector(
    (state) => state.organization.ownedOrganization
  );

  const managedOrganizations = useSelector(
    (state) => state.organization.managedOrganizations
  );

  const joinedOrganizations = useSelector(
    (state) => state.organization.joinedOrganizations
  );

  console.log(" owned organization: ", currentOrganization);
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentRole == "ceo" && !ownedOrganization)
      dispatch(getManagedOrganizationByCeo());
    if (currentRole == "ceo" && ownedOrganization)
      dispatch(setCurrentOrganization(ownedOrganization));
  }, [ownedOrganization]);

  useEffect(() => {
    if (currentOrganization) {
      dispatch(
        getOrganizationVerificationDocuments(currentOrganization.organizationId)
      );
      dispatch(getCeoOrganization(currentOrganization.organizationId));
    }

    setOrgInfo({
      organizationId: currentOrganization?.organizationId || "",
      organizationName: currentOrganization?.organizationName || "",
      email: currentOrganization?.email || "",
      phoneNumber: currentOrganization?.phoneNumber || "",
      address: currentOrganization?.address || "",
      walletAddress: currentOrganization?.walletAddress || null,
      ceo: currentOrganization?.ceo || null,
      organizationDescription:
        currentOrganization?.organizationDescription || "",
      organizationStatus: currentOrganization?.organizationStatus || "",
      backgroundUrl: currentOrganization?.backgroundUrl || "",
      reason: currentOrganization?.reason || "",
      advice: currentOrganization?.advice || "",
    });
  }, [currentOrganization, dispatch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    if (currentOrganization?.backgroundUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Hỗ trợ CORS
      img.src = currentOrganization.backgroundUrl;

      img.onload = () => {
        try {
          const colorThief = new ColorThief();
          const dominantColor = colorThief.getColor(img);
          console.log("dominant: ", dominantColor);
          setBackgroundColor(dominantColor);
        } catch (error) {
          console.error("Lỗi khi lấy màu chủ đạo: ", error);
        }
      };

      img.onerror = () => {
        console.error(
          "Lỗi khi tải hình ảnh: ",
          currentOrganization.backgroundUrl
        );
      };
    }
  }, [currentOrganization?.backgroundUrl]);

  const [background, setBackground] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(null);

  const backgroundInputRef = useRef(null);

  const triggerBackgroundUpload = () => backgroundInputRef.current.click();

  console.log("🍎🍎🍎new documents:", newDocuments);

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
    handleSubmit();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const preparedDocuments = await Promise.all(
      files.map(async (docFile) => {
        const fileUrl = await helperApi.uploadFileMedia({
          file: docFile,
          folderName: "organizations",
          resourceType: "raw",
        });

        const uploadFileInfo = {
          fileName: docFile.name,
          filePath: fileUrl,
          fileType: docFile.type || docFile.name.split(".").pop(),
          uploadDate: new Date().toISOString(),
          uploadedBy: currentOrganization.ceo,
          organization: currentOrganization,
          fileSize: docFile.size,
        };

        return uploadFileInfo;
      })
    ).then((response) => {
      setUploading(false);
      return response;
    });
    setNewDocuments((prev) => [...prev, ...preparedDocuments]);
  };

  const handleSubmitFile = async () => {
    try {
      if (newDocuments.length > 0) {
        showInfo("Updating documents...");
        await Promise.all(
          newDocuments.map(
            async (doc) =>
              await dispatch(addOrganizationVerificationDocument(doc)).unwrap()
          )
        );
        showSuccess("Updated documents successfully!");
        setNewDocuments([]);
      }

      if (deletedDocuments.length > 0) {
        showInfo("Deleting documents...");
        await Promise.all(
          deletedDocuments.map(
            async (doc) =>
              await dispatch(
                deleteOrganizationVerificationDocument(doc.uploadedFileId)
              ).unwrap()
          )
        );
        showSuccess("Deleted documents successfully!");
        setDeletedDocuments([]);
      }

      dispatch(
        getOrganizationVerificationDocuments(currentOrganization.organizationId)
      );
    } catch (err) {
      showError(err);
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
          if (backgroundInputRef.current)
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

  const handleDeleteDocument = (uploadedFileId) => {
    if (verificationDocuments.some((d) => d.uploadedFileId == uploadedFileId)) {
      const file = verificationDocuments.find(
        (d) => d.uploadedFileId == uploadedFileId
      );
      setDeletedDocuments((prev) => [...prev, file]);
    }
  };

  const handleDeleteNewDocument = (index) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  return (
    <div>
      {currentOrganization && (
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
              className="w-[90%] aspect-video overflow-hidden rounded-bl-md rounded-br-md relative bg-gray-300"
              style={{ maxWidth: "1250px", maxHeight: "260px" }}
            >
              {(background || currentOrganization?.backgroundUrl) && (
                <img
                  src={background || currentOrganization.backgroundUrl}
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
            <div className="ml-24 mt-6 self-start">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-2 items-center">
                  <p className="font-semibold text-3xl" style={{ margin: 0 }}>
                    {orgInfo.organizationName || "Organization Name"}
                  </p>
                  {orgInfo.organizationStatus == "APPROVED" && (
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
                      className="bg-gray-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-gray-700 hover:shadow-md hover:cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      onClick={() => {
                        dispatch(getManagedOrganizationByCeo());
                        setIsEditing(false);
                        setDeletedDocuments([]);
                      }}
                    >
                      <span className="text-white">Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-blue-700 hover:shadow-md  hover:cursor-pointer  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              <div className="p-8 relative pb-20">
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
                {currentRole !== "member" && (
                  <div className="absolute bottom-2 right-4">
                    <div
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-white transform transition-all duration-300 hover:cursor-pointer hover:scale-105 bg-blue-500 hover:bg-blue-600`}
                    >
                      Update
                    </div>
                  </div>
                )}
              </div>
            ))}
          {activeTab === "Verification Documents" &&
            (isEditing ? (
              <div className="flex flex-col gap-10 m-6">
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
                    <div className="mt-2 flex gap-2 flex-wrap hover:cursor-pointer">
                      {newDocuments.length > 0 &&
                        newDocuments.map((file, index) => (
                          <FileCard
                            key={index}
                            index={index}
                            file={file}
                            type={getFileType(file.fileType)}
                            isEditing={isEditing}
                            isNew={true}
                            handleDeleteDocument={handleDeleteDocument}
                            handleDeleteNewDocument={handleDeleteNewDocument}
                          />
                        ))}
                      {uploading == true && (
                        <div className="w-24 h-24 border border-gray-300 rounded-md flex flex-col items-center justify-center p-2 bg-gray-300">
                          <CircularProgress className="text-gray-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {verificationDocuments?.length > 0 ? (
                  <div className="flex gap-4 flex-wrap">
                    {verificationDocuments
                      .filter((v) => {
                        for (const d of deletedDocuments) {
                          if (d.uploadedFileId == v.uploadedFileId) {
                            return false;
                          }
                        }
                        return true;
                      })
                      .map((file, index) => (
                        <FileCard
                          key={index}
                          index={index}
                          file={file}
                          type={getFileType(file.fileType)}
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
                    className="bg-gray-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-gray-700 hover:shadow-md hover:cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                    className="bg-blue-600  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-blue-700 hover:shadow-md  hover:cursor-pointer  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                <div className="p-8 pt-0">
                  <p className="text-xl text-gray-800">Documents</p>
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
                            file={file}
                            type={getFileType(file.fileType)}
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
                <div className="p-8 pt-0 pb-20">
                  <p className="text-xl text-gray-800">Response from admin</p>
                  <div>{currentOrganization?.reason || "No response"}</div>
                </div>
                {currentRole !== "member" && (
                  <div className="absolute bottom-3 right-8">
                    <div
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-white transform transition-all duration-300 hover:cursor-pointer hover:scale-105 bg-blue-500 hover:bg-blue-600`}
                    >
                      Edit
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {!currentOrganization && (
        <div className="p-6">
          <div className="flex justify-end items-center">
            <Link
              to="/organizations"
              className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
            >
              Discover organizations
            </Link>
          </div>
          <div className="flex justify-center items-center min-h-[500px]">
            <Empty description="You are not a member of any organization" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrganization;
