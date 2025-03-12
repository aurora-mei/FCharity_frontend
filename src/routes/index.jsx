import React, { useEffect } from "react";

import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "../screens/general/HomeScreen.jsx";
import LoginScreen from "../screens/auth/LoginScreen.jsx";
import SignupScreen from "../screens/auth/SignupScreen.jsx";
import OtpVerificationScreen from "../screens/auth/OtpVerificationScreen.jsx";
import PrivateRoute from "./PrivateRoute";
import PrivateManagerRoute from "./PrivateManagerRoute";
import Donate from "../../src/components/Donation/Donate";

import ManagerOrganizationManagement from "../pages/manager/ManagerOrganizationManagement.jsx";
import ManagerProjectManagement from "../pages/manager/ManagerProjectManagement.jsx";
import ManagerRequestManagement from "../pages/manager/ManagerRequestManagement.jsx";
import ManagerOrganizationDashboard from "../pages/manager/ManagerOrganizationDashboard.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  getManagedOrganizations,
} from "../redux/auth/authSlice.js";
import ManagerOrganizationList from "../pages/manager/ManagerOrganizationList.jsx";

const AppRoutes = () => {
  const dispatch = useDispatch();
  const { currentUser, managedOrganizations, loading, error } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(getCurrentUser());
    dispatch(getManagedOrganizations());
  }, [dispatch]);

  const RedirectBasedOnRole = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (error || !currentUser) {
      return <Navigate to="/auth/login" replace />;
    }

    if (currentUser.userRole === "Manager" && managedOrganizations.length > 0) {
      return <Navigate to="/manager" replace />;
    }

    return <Navigate to="/" replace />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />

        <Route path="/auth">
          <Route path="login" element={<LoginScreen />} />
          <Route path="signup" element={<SignupScreen />} />
          <Route path="otp-verification" element={<OtpVerificationScreen />} />
        </Route>

        <Route element={<PrivateManagerRoute requiredRole="Manager" />}>
          <Route path="/manager">
            <Route
              path=""
              element={
                <ManagerOrganizationList
                  managedOrganizations={managedOrganizations}
                />
              }
            />
            <Route
              path="dashboard"
              element={<ManagerOrganizationDashboard />}
            />
            <Route
              path="organizations"
              element={<ManagerOrganizationManagement />}
            />
            <Route path="projects" element={<ManagerProjectManagement />} />
            <Route path="requests" element={<ManagerRequestManagement />} />
          </Route>
        </Route>

        <Route path="/user"></Route>

        <Route element={<PrivateRoute />}>
          <Route path="/donate" element={<Donate />} />
        </Route>

        {/* <Route path="/blockchain" element={<App />} /> */}

        <Route path="*" element={<RedirectBasedOnRole />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
