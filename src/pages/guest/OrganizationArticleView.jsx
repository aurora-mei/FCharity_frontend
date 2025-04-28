import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import ColorThief from "colorthief";
import { FaPeopleGroup } from "react-icons/fa6";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import ArticleCard from "../manage/components/ArticleCard";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoPeople } from "react-icons/io5";
import { FaFolderOpen } from "react-icons/fa6";
import { FaCodePullRequest } from "react-icons/fa6";

import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

import {
  getAllMembersInOrganization,
  getArticleByOrganizationId,
  getOrganizationById,
  createJoinRequest,
  getAllJoinRequestsByOrganizationId,
  getAllInvitationRequestsByOrganizationId,
  getArticleById,
} from "../../redux/organization/organizationSlice";
import ArticleDetail from "./ArticleDetail";

const OrganizationArticleView = () => {
  const { organizationId, articleId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const currentOrganizationMembers = useSelector(
    (state) => state.organization.currentOrganizationMembers
  );

  const organizationArticles = useSelector(
    (state) => state.organization.organizationArticles
  );

  const [sortedArticles, setSortedArticles] = useState([]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [articleId]);

  useEffect(() => {
    if (organizationId) {
      dispatch(getOrganizationById(organizationId));
      dispatch(getAllMembersInOrganization(organizationId));
      dispatch(getArticleByOrganizationId(organizationId));
    }
  }, [organizationId]);

  useEffect(() => {
    setSortedArticles(organizationArticles);
  }, [organizationArticles]);

  useEffect(() => {
    if (articleId) {
      dispatch(getArticleById(articleId));
    }
  }, [articleId]);

  const handleViewOrganization = () => {
    navigate(`/organizations/${organizationId}`);
  };

  const handleSort = (e) => {
    let tmpArticles = [...organizationArticles];

    switch (e.target.value) {
      case "latest":
        setSortedArticles(
          tmpArticles.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateB - dateA;
          })
        );
        break;
      case "oldest":
        setSortedArticles(
          tmpArticles.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);
            return dateA - dateB;
          })
        );
        break;
      case "most-viewed":
        setSortedArticles(tmpArticles.sort((a, b) => b.views - a.views));
        break;
      default:
        setSortedArticles(organizationArticles);
    }
  };

  return (
    <div className="w-full">
      <div className="m-auto max-w-[1250px]">
        <div className={`shadow-md pb-10 flex flex-col items-center`}>
          <div
            className="w-full aspect-video overflow-hidden rounded-bl-md rounded-br-md relative bg-gray-300 "
            style={{
              maxWidth: "1250px",
              maxHeight: "360px",
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url("${currentOrganization?.backgroundUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  // Linear gradient từ dưới (đen đậm) lên trên (trong suốt)
                  background:
                    "linear-gradient(to bottom right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0))",
                }}
              />
            </div>

            <div className="absolute top-16 left-12 ">
              <p
                style={{ margin: 0, marginBottom: "20px", padding: 0 }}
                className="text-5xl font-bold w-[60%] text-white"
              >
                {currentOrganization?.organizationDescription
                  ?.split("|")[0]
                  .trim()}
              </p>
              <div className="text-xl font-bold px-3 py-1 rounded-full text-white bg-blue-500 inline-block">
                Get Involved
              </div>
            </div>
          </div>

          <div className=" mt-6 w-[90%] flex items-start justify-between">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex gap-2 items-center">
                <p className="font-semibold text-3xl" style={{ margin: 0 }}>
                  {currentOrganization?.organizationName || "Organization Name"}
                </p>
                {currentOrganization?.organizationStatus == "APPROVED" && (
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
              <div className="flex gap-2 items-center text-gray-600">
                <div className="flex items-end gap-2">
                  <LiaBirthdayCakeSolid style={{ fontSize: "22px" }} />
                  <span>
                    Ngày thành lập:{" "}
                    {currentOrganization?.startTime?.split("T")[0]}
                  </span>
                </div>
                <span>.</span>
                <div className="flex items-center gap-2">
                  <FaPeopleGroup style={{ fontSize: "22px" }} />
                  <span>{currentOrganizationMembers?.length} thành viên</span>
                </div>
              </div>
            </div>

            <div
              className="bg-blue-500 mt-3  px-6 py-2 rounded-md font-semibold transition duration-300 hover:bg-blue-600 hover:shadow-md  hover:cursor-pointer text-white"
              onClick={handleViewOrganization}
            >
              Tìm hiểu về tổ chức
            </div>
          </div>
        </div>
        <div className="flex my-12 max-w-[1250px] mx-auto gap-10">
          <ArticleDetail />
        </div>

        <div className="my-18 max-w-[1250px] mx-auto">
          <div className="flex justify-between items-center mb-7">
            <p
              style={{ margin: 0, marginBottom: "20px" }}
              className="text-2xl font-semibold"
            >
              Các cài báo nổi bật
            </p>
            <div className="flex gap-2 items-center">
              <span>Sort by: </span>
              <select
                onChange={handleSort}
                className="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none"
              >
                <option value="all" selected>
                  All
                </option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="most-viewed">Most viewed</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap max-w-[1250px] ml-10 gap-6 max-h-[700px] overflow-y-auto">
            {organizationArticles.length > 0 &&
              sortedArticles.map((article) => (
                <ArticleCard key={article.articleId} article={article} />
              ))}
          </div>
        </div>
      </div>
      <footer className="bg-gray-800 text-white pt-12 pb-6 -mb-96 z-50">
        <div className="container max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Về Chúng Tôi</h3>
              <p className="text-gray-300 mb-4">
                {currentOrganization?.organizationDescription}
              </p>
              <div className="flex space-x-4">
                <Link
                  to={`/organizations/${currentOrganization?.organizationId}`}
                  className="text-gray-300 hover:text-white transition"
                >
                  <FaFacebook size={20} />
                </Link>
                <Link
                  to={`/organizations/${currentOrganization?.organizationId}`}
                  className="text-gray-300 hover:text-white transition"
                >
                  <FaTwitter size={20} />
                </Link>
                <Link
                  to={`/organizations/${currentOrganization?.organizationId}`}
                  className="text-gray-300 hover:text-white transition"
                >
                  <FaLinkedin size={20} />
                </Link>
                <Link
                  to={`/organizations/${currentOrganization?.organizationId}`}
                  className="text-gray-300 hover:text-white transition"
                >
                  <FaInstagram size={20} />
                </Link>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Liên Kết Nhanh</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to={`/organizations/${currentOrganization?.organizationId}`}
                    className="text-gray-300 hover:text-white transition"
                  >
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/organizations/${currentOrganization?.organizationId}/projects`}
                    className="text-gray-300 hover:text-white transition"
                  >
                    Dự Án
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/organizations/${currentOrganization?.organizationId}/articles`}
                    className="text-gray-300 hover:text-white transition"
                  >
                    Tin Tức
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/organizations/${currentOrganization?.organizationId}/events`}
                    className="text-gray-300 hover:text-white transition"
                  >
                    Sự Kiện
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/organizations/${currentOrganization?.organizationId}/donations`}
                    className="text-gray-300 hover:text-white transition"
                  >
                    Quyên Góp
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaPhone className="mt-1 mr-3 text-gray-300" />
                  <div>
                    <p className="text-gray-300">Phone number</p>
                    <a
                      href="tel:+84123456789"
                      className="hover:text-white transition"
                    >
                      {currentOrganization?.phoneNumber}
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaEnvelope className="mt-1 mr-3 text-gray-300" />
                  <div>
                    <p className="text-gray-300">Email</p>
                    <a
                      href="mailto:contact@organization.org"
                      className="hover:text-white transition"
                    >
                      {currentOrganization?.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <FaMapMarkerAlt className="mt-1 mr-3 text-gray-300" />
                  <div>
                    <p className="text-gray-300">Address</p>
                    <p>{currentOrganization?.address}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4">Đăng Ký Nhận Tin</h3>
              <p className="text-gray-300 mb-4">
                Nhận thông tin mới nhất về các hoạt động của chúng tôi
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="px-4 py-2 w-full rounded-l focus:outline-none text-gray-800"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r transition"
                >
                  Gửi
                </button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Tên Tổ Chức. Tất cả quyền được bảo
              lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrganizationArticleView;
