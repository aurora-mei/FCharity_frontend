import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateManagerRoute = ({ requiredRole }) => {
  const { currentUser, managedOrganizations } = useSelector(
    (state) => state.auth
  );

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole === "Manager" && managedOrganizations.length === 0) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateManagerRoute;
