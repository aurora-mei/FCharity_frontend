import React, { useEffect, useState } from "react";

import { FaFileWord } from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";
import { FaFilePowerpoint } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { getFileUrlLocal } from "../../../redux/organization/organizationSlice";

const FileCard = ({
  index,
  fileName,
  type,
  size,
  isEditing,
  isNew,
  handleDeleteDocument,
  handleDeleteNewDocument,
}) => {
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

  const [fileUrl, setFileUrl] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fileName && !fileUrl) {
      if (fileName.includes("..")) {
        console.log("Invalid file name");
      }
      dispatch(getFileUrlLocal(fileName))
        .unwrap()
        .then((result) => {
          setFileUrl(result); // result là blob URL
          console.log("fileUrl 🤖🤖🤖", result);
        })
        .catch((err) => {
          console.error("Failed to get file URL:", err);
        });
    }
  }, [dispatch, fileName, fileUrl]);

  const handleDownload = async () => {
    try {
      if (!fileUrl) {
        console.log("No file available to download");
        return;
      }
      console.log(
        "Download triggered for fileUrl:",
        fileUrl,
        "fileName:",
        fileName
      );
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch blob");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
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

  return (
    <div className="relative">
      <div
        key={index}
        className="relative w-24 h-24 border border-gray-300 rounded-md flex flex-col items-center justify-center p-2 bg-gray-50 hover:cursor-pointer"
        onClick={handleDownload}
      >
        <div className={`flex flex-col items-center gap-1`} onClick={() => {}}>
          {genIcon(type)}
          <p className="text-xs mt-1 text-center truncate w-[80px]">
            {isNew
              ? fileName
              : String(fileName).substring(
                  String(fileName).lastIndexOf("_") + 1
                )}
          </p>
        </div>

        <span className="absolute bottom-1 right-1 text-xs text-gray-500">
          {(size / 1024).toFixed(1)}KB
        </span>
      </div>

      {isEditing && (
        <button
          onClick={() => {
            isNew
              ? handleDeleteNewDocument(index)
              : handleDeleteDocument(fileName);
          }}
          className="absolute -top-2 -right-2 border-2 border-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 hover:cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default FileCard;
