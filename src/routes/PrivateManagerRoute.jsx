import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateManagerRoute = ({ requiredRole }) => {
  const { currentUser } = useSelector((state) => state.auth);

  const { managedOrganizations } = useSelector((state) => state.organization);

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole === "Manager" && managedOrganizations?.length === 0) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateManagerRoute;
