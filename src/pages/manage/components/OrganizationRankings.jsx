import React, { useEffect, useState } from "react";
import { GiTrophyCup } from "react-icons/gi";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizationsRanking } from "../../../redux/organization/organizationSlice";
import { Link } from "react-router-dom";

const OrganizationRankings = () => {
  const dispatch = useDispatch();

  const organizationsRanking = useSelector(
    (state) => state.organization.organizationsRanking
  );

  console.log("organizationsRanking: ", organizationsRanking);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(getOrganizationsRanking());
  }, [dispatch]);

  const [sortBy, setSortBy] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const organizationsPerPage = 6;
  const totalPages = Math.ceil(
    organizationsRanking.length / organizationsPerPage
  );

  const startIndex = (currentPage - 1) * organizationsPerPage;
  const endIndex = startIndex + organizationsPerPage;

  const calculateScores = (orgs) => {
    const members = orgs.map((org) => org.numberOfMembers);
    const projects = orgs.map((org) => org.numberOfProjects);
    const funding = orgs.map((org) => org.totalFunding);
    const minMembers = Math.min(...members);
    const maxMembers = Math.max(...members);

    const minProjects = Math.min(...projects);
    const maxProjects = Math.max(...projects);

    const minFunding = Math.min(...funding);
    const maxFunding = Math.max(...funding);

    return orgs.map((org) => {
      const normalizedMembers =
        maxMembers == minMembers
          ? 1
          : (org.numberOfMembers - minMembers) / (maxMembers - minMembers);

      const normalizedProjects =
        minProjects == maxProjects
          ? 1
          : (org.numberOfProjects - minProjects) / (maxProjects - minProjects);

      const normalizedFunding =
        minFunding == maxFunding
          ? 1
          : (org.totalFunding - minFunding) / (maxFunding - minFunding);

      const score =
        0.2 * normalizedMembers +
        0.3 * normalizedProjects +
        0.5 * normalizedFunding;
      return { ...org, score };
    });
  };

  const organizationsRankingScored = calculateScores(organizationsRanking)
    .sort((a, b) => b.score - a.score)
    .map((org, index) => ({
      ...org,
      rank: index + 1,
    }));

  const currentOrganizations = organizationsRankingScored
    .sort((a, b) => {
      if (sortBy === "member") {
        return sortOrder === "asc"
          ? a.numberOfMembers - b.numberOfMembers
          : b.numberOfMembers - a.numberOfMembers;
      } else if (sortBy === "project") {
        return sortOrder === "asc"
          ? a.numberOfProjects - b.numberOfProjects
          : b.numberOfProjects - a.numberOfProjects;
      } else if (sortBy === "funding") {
        return sortOrder === "asc"
          ? a.totalFunding - b.totalFunding
          : b.totalFunding - a.totalFunding;
      } else if (sortBy === "all") {
        return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
      }
      return 0;
    })
    .slice(startIndex, endIndex)
    .filter((organization) => {
      if (
        searchTerm === "" ||
        organization.organizationName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        organization.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return true;
      }
      return false;
    });

  return (
    <div className="flex flex-col gap-2 w-full p-3 mb-10 max-w-[1200px] mx-auto">
      <div className="mb-3">
        <h1
          className="text-3xl font-bold text-gray-800"
          style={{ margin: "0" }}
        >
          Organization Rankings
        </h1>
        <p className="text-gray-600 mt-2">
          Top organizations ranked by FCharity.
        </p>
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center justify-between ml-3">
          <label htmlFor="searchTerm" className="z-10 -mr-6 inline-block">
            <FaSearch style={{ fontSize: "12px", color: "gray" }} />
          </label>
          <input
            type="text"
            name="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-[250px] pl-8 p-1 bg-gray-50 border border-gray-300 rounded-md text-gray-600 placeholder-gray-500 focus:outline-none"
            style={{ color: "#303030" }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="sortBy" className="z-10 inline-block w-[70px]">
              Sort By
            </label>
            <select
              className="w-[170px] p-1 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none"
              name="sortBy"
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="all">All</option>
              <option value="member">Member</option>
              <option value="project">Project</option>
              <option value="funding">Funding</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sortOrder" className="z-10 inline-block w-[70px]">
              Order
            </label>
            <select
              className="w-[80px] p-1 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none"
              name="sortOrder"
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">asc</option>
              <option value="desc">desc</option>
            </select>
          </div>
        </div>
      </div>
      <table className="table-auto grow-1">
        <thead>
          <tr className="bg-gray-200 text-gray-600 text-sm font-semibold uppercase">
            <td className="px-8 py-6">RANK</td>
            <td className="px-8 py-6">ORGANIZATION</td>
            <td className="px-8 py-6">MEMBERS (0.2)</td>
            <td className="px-8 py-6">PROJECTS (0.3)</td>
            <td className="px-8 py-6">TOTAL FUNDING (0.5)</td>
          </tr>
        </thead>
        <tbody className="">
          {currentOrganizations.map((organization, index) => (
            <tr
              key={index}
              className=" hover:bg-gray-100 hover:cursor-pointer transition duration-200"
            >
              <td className="center px-8 py-6">
                {organization.rank == 1 && (
                  <GiTrophyCup className="size-8 text-yellow-500" />
                )}
                {organization.rank == 2 && (
                  <GiTrophyCup className="size-8 text-gray-500" />
                )}
                {organization.rank == 3 && (
                  <GiTrophyCup className="size-8 text-orange-300" />
                )}
                {organization.rank > 3 && (
                  <p className="ml-3" style={{ marginBottom: 0, padding: 0 }}>
                    {organization.rank}
                  </p>
                )}
              </td>
              <td className="flex items-center gap-6 px-8 py-6">
                <img
                  src={organization.backgroundUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-full scale-125"
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Link
                      className="text-gray-800 font-semibold hover:underline"
                      style={{ margin: 0, padding: 0 }}
                      to={`/organizations/${organization.organizationId}`}
                    >
                      {organization.organizationName}
                    </Link>
                    {organization.organizationStatus == "APPROVED" && (
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
                  <p
                    className="text-gray-500"
                    style={{ margin: 0, padding: 0 }}
                  >
                    {organization.email}
                  </p>
                </div>
              </td>
              <td className="px-8 py-6">{organization.numberOfMembers}</td>
              <td className="px-8 py-6">{organization.numberOfProjects}</td>
              <td className="px-8 py-6">${organization.totalFunding}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-end mt-6">
        <div className="flex justify-center items-center gap-2">
          <button
            className={`px-3 py-1 ${
              currentPage > 1 && "hover:cursor-pointer"
            } ${currentPage == 1 && "hover:cursor-not-allowed"}`}
            onClick={() => {
              if (currentPage > 1) setCurrentPage(currentPage - 1);
            }}
          >
            <FaArrowLeftLong
              className={`${currentPage == 1 && "text-gray-500"}`}
            />
          </button>
          {Array.from({ length: totalPages }, (_, index) => {
            if (
              index + 1 < 3 ||
              index + 1 > totalPages - 2 ||
              (index + 1 >= currentPage - 2 && index + 1 <= currentPage + 2)
            )
              return (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-xs font-semibold hover:cursor-pointer ${
                    currentPage === index + 1
                      ? "bg-gray-200 border border-gray-400 text-white"
                      : " hover:bg-gray-100"
                  } transition`}
                >
                  {index + 1}
                </button>
              );
            return <div className="font-semibold">.</div>;
          })}
          <button
            className={`px-3 py-1 ${
              currentPage < totalPages && "hover:cursor-pointer"
            } ${currentPage == totalPages && "hover:cursor-not-allowed"}`}
            onClick={() => {
              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
            }}
          >
            <FaArrowRightLong
              className={`${currentPage == totalPages && "text-gray-500"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationRankings;
