import React from "react";
import { useParams } from "react-router-dom";

const OrganizationDetails = () => {
  const { organizationId } = useParams();
  return <div>OrganizationDetails</div>;
};

export default OrganizationDetails;
