import React, { useEffect, useState } from "react";
import { GiTrophyCup } from "react-icons/gi";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getOrganizationsRanking } from "../../../redux/organization/organizationSlice";
import { Link } from "react-router-dom";

const OrganizationRankingsOverview = () => {
  const dispatch = useDispatch();

  const organizationsRanking = useSelector(
    (state) => state.organization.organizationsRanking
  );

  useEffect(() => {
    dispatch(getOrganizationsRanking());
  }, [dispatch]);

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

  return (
    <div className=" mb-6">
      <p
        className="text-2xl font-bold mb-4 text-gray-800"
        style={{
          marginBottom: "30px",
        }}
      >
        Top Organizations
      </p>
      <div className="w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
        <div className="">
          <div className="bg-gray-200 text-gray-600 text-sm font-semibold uppercase grid grid-cols-10">
            <div className="px-8 py-6 col-span-1">RANK</div>
            <div className="px-8 py-6 col-span-3">ORGANIZATION</div>
            <div className="px-8 py-6 col-span-2">MEMBERS (0.2)</div>
            <div className="px-8 py-6 col-span-2">PROJECTS (0.3)</div>
            <div className="px-8 py-6 col-span-2">TOTAL FUNDING (0.5)</div>
          </div>
        </div>
        <div className="">
          {organizationsRankingScored.slice(0, 3).map((organization, index) => (
            <div
              key={index}
              className="even:bg-gray-100 odd:bg-white hover:bg-gray-100 hover:cursor-pointer transition duration-200 grid grid-cols-10"
            >
              <div className="center px-8 py-6 col-span-1">
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
              </div>
              <div className="flex items-center gap-6 px-8 py-6 col-span-3">
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
                      <span className="text-gray-800 font-semibold hover:underline">
                        {organization.organizationName}
                      </span>
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
              </div>
              <div className="px-8 py-6 col-span-2">
                {organization.numberOfMembers}
              </div>
              <div className="px-8 py-6 col-span-2">
                {organization.numberOfProjects}
              </div>
              <div className="px-8 py-6 col-span-2">
                ${organization.totalFunding}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end mt-6">
        <Link
          to="/organizations/rankings"
          className="text-gray-500 hover:underline"
          style={{ margin: 0, padding: 0 }}
        >
          <span>See all organizations &gt;&gt;</span>
        </Link>
      </div>
    </div>
  );
};

export default OrganizationRankingsOverview;
