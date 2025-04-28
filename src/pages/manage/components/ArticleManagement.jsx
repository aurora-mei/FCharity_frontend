import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { MdEditSquare, MdDelete } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteArticle } from "../../../redux/organization/organizationSlice";

const formatDate = (isoString) => {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(isoString));
};

function extractFirstImageUrl(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const firstImg = doc.querySelector("img");
  if (firstImg) {
    return firstImg.src;
  }
  return null;
}

function extractFirstParagraph(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const firstP = doc.querySelector("p");
  if (firstP) {
    return firstP.textContent;
  }
  return null;
}

const ArticleManagement = ({
  articles,
  setIsEditingArticle,
  setEditingArticle,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State cho tìm kiếm, dữ liệu đã lọc, phân trang
  const [selectedArticles, setSelectedArticles] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setFilteredData(articles);
  }, [articles]);

  // Lọc dữ liệu khi searchTerm thay đổi
  useEffect(() => {
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowercasedSearch) ||
        article.content.toLowerCase().includes(lowercasedSearch) ||
        article.author.fullName.toLowerCase().includes(lowercasedSearch) ||
        article.author.email.toLowerCase().includes(lowercasedSearch) ||
        article.createdAt.toLowerCase().includes(lowercasedSearch) ||
        lowercasedSearch == ""
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDeleteArticle = async (articleId) => {
    try {
      await dispatch(deleteArticle(articleId)).unwrap();
      alert("Article deleted successfully!");
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  return (
    <div className="p-4 pr-0 mb-28">
      <div className="flex items-center ml-2 mb-6">
        <label htmlFor="searchTerm" className="-mr-8 z-10">
          <IoSearch style={{ fontSize: "22px", color: "gray" }} />
        </label>
        <input
          type="text"
          name="searchTerm"
          id="searchTerm"
          placeholder="Search..."
          className="w-[300px] pl-10 p-2 bg-gray-50 border border-gray-300 rounded-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white focus:border-blue-400 transition duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onChange={(e) => {
                    alert(e.target.checked);
                  }}
                />
              </th>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Article title</th>
              <th className="border border-gray-300 p-2">Short description</th>
              <th className="border border-gray-300 p-2">Author</th>
              <th className="border border-gray-300 p-2">Created at</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((article, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-center">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {article?.articleId}
                </td>
                <td className="border border-gray-300 p-2">{article?.title}</td>
                <td className="border border-gray-300 p-2">
                  {extractFirstParagraph(article?.content).slice(0, 70)}...
                </td>
                <td className="border border-gray-300 p-2 w-[190px]">
                  <div>{article?.author?.fullName}</div>
                  <div>{article?.author?.email}</div>
                </td>
                <td className="border border-gray-300 p-2">
                  {formatDate(article.createdAt)}
                </td>
                <td className="border border-gray-300 p-2">
                  <div className="flex gap-2 items-center justify-center">
                    <div
                      className="flex items-center justify-center gap-1 text-green-500 hover:text-green-600 hover:cursor-pointer hover:bg-green-100 px-2 py-1 border rounded-md"
                      onClick={() => {
                        navigate(
                          `/organizations/${article?.organization?.organizationId}/articles/${article?.articleId}`
                        );
                      }}
                    >
                      <FaEye style={{ fontSize: "12px" }} />
                      <span className="text-xs">View</span>
                    </div>
                    <div
                      className="flex items-center justify-center gap-1 text-yellow-500 hover:text-yellow-600 hover:cursor-pointer hover:bg-yellow-100 px-2 py-1 border rounded-md"
                      onClick={() => {
                        setEditingArticle(article);
                        setIsEditingArticle(true);
                      }}
                    >
                      <MdEditSquare style={{ fontSize: "12px" }} />
                      <span className="text-xs">Edit</span>
                    </div>
                    <div
                      className="flex items-center justify-center gap-1 text-red-500 hover:text-red-600 hover:cursor-pointer hover:bg-red-100 px-2 py-1 border rounded-md"
                      onClick={() => {
                        handleDeleteArticle(article?.articleId);
                      }}
                    >
                      <MdDelete style={{ fontSize: "12px" }} />
                      <span className="text-xs">Delete</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <span>Rows per page: </span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            className="border border-gray-300 rounded p-1"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center">
          <span className="mr-2">
            {startIndex + 1}-
            {Math.min(startIndex + rowsPerPage, filteredData.length)} of{" "}
            {filteredData.length}
          </span>
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="p-2 disabled:opacity-50 hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="p-2 disabled:opacity-50 hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleManagement;
