import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRecommendedOrganizations } from "../../redux/organization/organizationSlice";
import OrganizationCard from "../manage/components/OrganizationCard";

const OrganizationsView = () => {
  const dispatch = useDispatch();
  const { recommendedOrganizations, loading, error } = useSelector(
    (state) => state.organization
  );

  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (recommendedOrganizations.length == 0)
      dispatch(getRecommendedOrganizations());
    setOrganizations(recommendedOrganizations);
  }, [dispatch, recommendedOrganizations]);

  console.log("recommendedOrganizations", recommendedOrganizations);

  const handleJoinOrganization = async (organizationId) => {
    const joinRequestData = {
      organizationId: organizationId,
      userId: JSON.parse(localStorage.getItem("currentUser"))?.id,
    };

    console.log("joinRequestData", joinRequestData);

    try {
      dispatch(createJoinRequest(joinRequestData));
      setOrganizations((prev) =>
        prev.map((org) =>
          org.organizationId === organizationId ? { ...org, joined: true } : org
        )
      );
    } catch (error) {
      console.error("Failed to create join request:", error);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto mt-10 mb-52">
      <h1 className="text-3xl font-bold">Recommended Organizations</h1>
      <div className="mt-10 flex items-center gap-3">
        <label className="block text-gray-700 font-bold mb-2">Search:</label>
        <input
          type="text"
          placeholder="Search by related keywords"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[500px]"
        />
      </div>
      <div className="flex flex-wrap gap-4 max-w-[1000px] mt-7 mx-auto max-h-[2000px] overflow-y-auto">
        {organizations
          .filter((organization) => {
            if (
              searchTerm === "" ||
              organization.organizationName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              organization.organizationDescription
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            ) {
              return true;
            }
            return false;
          })
          .map((org) => (
            <OrganizationCard
              key={org.organizationId}
              org={org}
              handleJoinOrganization={handleJoinOrganization}
            />
          ))}
      </div>
    </div>
  );
};

export default OrganizationsView;
