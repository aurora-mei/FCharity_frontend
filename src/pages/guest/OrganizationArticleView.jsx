import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ColorThief from "colorthief";
import { FaPeopleGroup } from "react-icons/fa6";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import ArticleCard from "../manage/components/ArticleCard";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IoPeople } from "react-icons/io5";
import { FaFolderOpen } from "react-icons/fa6";
import { FaCodePullRequest } from "react-icons/fa6";

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
    if (articleId) {
      dispatch(getArticleById(articleId));
    }
  }, [articleId]);

  const handleViewOrganization = () => {
    navigate(`/organizations/${organizationId}`);
  };

  return (
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
        <p
          style={{ margin: 0, marginBottom: "20px" }}
          className="text-2xl font-semibold"
        >
          Các cài báo nổi bật
        </p>
        <div className="flex flex-wrap max-w-[1250px] ml-10 gap-6">
          {organizationArticles.length > 0 &&
            organizationArticles.map((article) => (
              <ArticleCard key={article.articleId} article={article} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationArticleView;
