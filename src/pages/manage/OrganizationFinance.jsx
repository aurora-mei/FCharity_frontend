import { Empty } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const OrganizationFinance = () => {
  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );
  return (
    <div>
      {currentOrganization && (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Organization finance</h1>
        </div>
      )}
      {!currentOrganization && (
        <div className="p-6">
          <div className="flex justify-end items-center">
            <Link
              to="/organizations"
              className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
            >
              Discover organizations
            </Link>
          </div>
          <div className="flex justify-center items-center min-h-[500px]">
            <Empty description="You are not a manager of any organization" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationFinance;
