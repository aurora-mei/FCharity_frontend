import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import apiService from "../../services/api";
import OrganizationOverview from "../../components/OrganizationManagement/OrganizationOverview";
import OrganizationMembers from "../../components/OrganizationManagement/OrganizationMembers";
import JoinRequests from "../../components/OrganizationManagement/JoinRequests";
import InviteMembers from "../../components/OrganizationManagement/InviteMembers";
import TransferCEO from "../../components/OrganizationManagement/TransferCEO";
import Layout from "../../components/Layout/Layout";
import { useSelector } from "react-redux";

const ManagerOrganizationManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { selectedOrganization: organization } = useSelector(
    (state) => state.auth
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "members", label: "Members" },
    { id: "join-requests", label: "Join Requests" },
    { id: "invite-members", label: "Invite Members" },
    { id: "transfer-ceo", label: "Transfer CEO" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OrganizationOverview organization={organization} />;
      case "members":
        return (
          <OrganizationMembers organizationId={organization?.organizationId} />
        );
      case "join-requests":
        return <JoinRequests organizationId={organization?.organizationId} />;
      case "invite-members":
        return <InviteMembers organizationId={organization?.organizationId} />;
      case "transfer-ceo":
        return <TransferCEO organizationId={organization?.organizationId} />;
      default:
        return null;
    }
  };

  if (!organization) {
    return <Navigate to="/manager" replace />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            {organization.organizationName}
          </h1>

          {/* Tabs */}
          <nav className="flex space-x-4 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Nội dung */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerOrganizationManagement;
