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
      <h1 className="text-3xl font-bold mb-4">Recommended Organizations</h1>
      <div className="flex flex-wrap gap-4 max-w-[1000px] mt-12 mx-auto">
        {organizations.map((org) => (
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
