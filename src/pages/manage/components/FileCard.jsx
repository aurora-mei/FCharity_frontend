import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { MdClear } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";

import { FaFileWord } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePowerpoint } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import axios from "axios";

const FileCard = ({
  index,
  file,
  type,
  isEditing,
  isNew,
  handleDeleteDocument,
  handleDeleteNewDocument,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isNew) console.log("newFile: ", file, type);
  const getFileColor = (type) => {
    switch (type) {
      case "excel":
        return "#00B050";
      case "pdf":
        return "#E81123";
      case "word":
        return "#0070C0";
      case "powerpoint":
        return "#FF6600";
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await axios({
        url: fileUrl,
        method: "GET",
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "downloaded-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const genIcon = (type) => {
    switch (type) {
      case "excel":
        return (
          <FaFileExcel
            className="w-12 h-12"
            style={{
              color: getFileColor(type),
            }}
          />
        );
      case "pdf":
        return (
          <FaFilePdf
            className="w-12 h-12"
            style={{
              color: getFileColor(type),
            }}
          />
        );
      case "word":
        return (
          <FaFileWord
            className="w-12 h-12"
            style={{
              color: getFileColor(type),
            }}
          />
        );
      case "powerpoint":
        return (
          <FaFilePowerpoint
            className="w-12 h-12"
            style={{
              color: getFileColor(type),
            }}
          />
        );
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleViewDocument = () => {
    setIsModalOpen(true);
  };

  const getViewerUrl = (fileUrl) => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      fileUrl
    )}`;
  };

  return (
    <div
      key={index}
      className="relative w-24 h-24 border border-gray-300 rounded-md flex flex-col items-center justify-center p-2 bg-gray-50 hover:cursor-pointer"
    >
      <div
        className={`flex flex-col items-center gap-1`}
        onClick={() => {
          handleViewDocument(file);
        }}
      >
        {genIcon(type)}
        <p className="text-xs mt-1 text-center truncate w-[80px]">
          {isNew
            ? file?.fileName
            : String(file?.fileName).substring(
                String(file?.fileName).lastIndexOf("_") + 1
              )}
        </p>
      </div>

      <span className="absolute bottom-1 left-1 text-xs text-gray-500">
        {(file?.fileSize / 1024).toFixed(1)}KB
      </span>

      <button className="z-50">
        <IoMdDownload
          className="absolute bottom-1 right-1 text-gray-500 hover:text-gray-800 hover:cursor-pointer"
          onClick={() => {
            handleDownload(file?.filePath, file?.fileName);
          }}
        />
      </button>

      {isEditing && (
        <button
          onClick={() => {
            isNew
              ? handleDeleteNewDocument(index)
              : handleDeleteDocument(file?.uploadedFileId);
          }}
          className="absolute top-0 right-0 bg-gray-300 text-white rounded-bl-sm rounded-tr-sm w-5 h-5 flex items-center justify-center text-md hover:bg-gray-500 hover:cursor-pointer"
        >
          <MdClear className="w-3 h-3" />
        </button>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "850px",
            padding: "20px",
            paddingTop: "10px",
            borderRadius: "8px",
            zIndex: 1001,
          },
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl">View document</h1>
          <div className="cursor-pointer">
            <IoClose size={24} onClick={closeModal} />
          </div>
        </div>
        <h2 className="font-semibold">
          {file?.fileName} {"  "}
          <span className="text-gray-500 text-xs">
            ({(file?.fileSize / 1024).toFixed(1)}KB)
          </span>
        </h2>
        <div className="mt-4">
          <iframe
            src={getViewerUrl(file?.filePath)}
            width="100%"
            height="500px"
            title="View Document"
            allowFullScreen
            className="border border-gray-500 rounded"
          />
        </div>
        <div
          className="absolute bottom-12 right-6 text-gray-500 hover:text-gray-800 hover:cursor-pointer"
          title="Download document"
          onClick={() => {
            handleDownload(file?.filePath, file?.fileName);
          }}
        >
          <IoMdDownload size={24} />
        </div>
      </Modal>
    </div>
  );
};

export default FileCard;
