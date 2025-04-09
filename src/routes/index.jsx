import React, { useEffect } from "react";

import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "../screens/general/HomeScreen.jsx";
import ForumPage from "../screens/forum/ForumPage.jsx";
import CreatePostPage from "../screens/forum/CreatePostPage.jsx";
import PostDetailPage from "../screens/forum/PostDetailPage.jsx";
import LoginScreen from "../screens/auth/LoginScreen.jsx";
import SignupScreen from "../screens/auth/SignupScreen.jsx";
import OtpVerificationScreen from "../screens/auth/OtpVerificationScreen.jsx";
import ResetPwdScreen from "../screens/auth/ResetPwdScreen.jsx";
import PrivateRoute from "./PrivateRoute";
import LoadingModal from "../components/LoadingModal/index.jsx";
import CreateRequestScreen from "../screens/request/CreateRequestScreen.jsx";
import RequestListScreen from "../screens/request/RequestListScreen.jsx";
import RequestDetailScreen from "../screens/request/RequestDetailScreen";
import EditRequestScreen from "../screens/request/EditRequestScreen";
import Layout from "./Layout";
import MyRequestScreen from "../screens/request/MyRequestScreen.jsx";
import ManageProfileScreen from "../screens/user/ManageProfileScreen.jsx";
import ChangeProfileModal from "../components/ChangeProfileForm/ChangeProfileModal.jsx";
import ChangePasswordModal from "../screens/user/ChangePasswordModal.jsx";
import CreateProjectScreen from "../screens/project/CreateProjectScreen.jsx";

import MyOrganization from "../pages/manage/MyOrganization.jsx";
import OrganizationDashboard from "../pages/manage/OrganizationDashboard.jsx";
import CreateOrganization from "../pages/manage/CreateOrganization.jsx";
import OrganizationProject from "../pages/manage/OrganizationProject.jsx";
import OrganizationMember from "../pages/manage/OrganizationMember.jsx";
import OrganizationRequest from "../pages/manage/OrganizationRequest.jsx";
import OrganizationsOverview from "../pages/guest/OrganizationsOverview.jsx";
import OrganizationDetails from "../pages/guest/OrganizationDetails.jsx";
import OrganizationRankings from "../pages/manage/components/OrganizationRankings.jsx";
import UserRankings from "../pages/manage/components/UserRankings.jsx";
import ManagerLayout from "../components/Layout/ManagerLayout.jsx";
import UserLayout from "../components/Layout/UserLayout.jsx";
import OrganizationSchedule from "../pages/manage/OrganizationSchedule.jsx";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/auth">
          <Route path="login" element={<LoginScreen />} />
          <Route path="signup" element={<SignupScreen />} />
          <Route path="otp-verification" element={<OtpVerificationScreen />} />
          <Route path="otp-reset-password" element={<ResetPwdScreen />} />
        </Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeScreen />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/requests/:id" element={<RequestDetailScreen />} />
          <Route element={<PrivateRoute />}>
            <Route path="donate" element={<LoadingModal />} />
            <Route path="requests">
              <Route index element={<RequestListScreen />} />
              <Route path="create" element={<CreateRequestScreen />} />
              <Route path="edit/:id" element={<EditRequestScreen />} />
              <Route path="myrequests" element={<MyRequestScreen />} />
            </Route>
            <Route path="posts">
              <Route path="create-post" element={<CreatePostPage />} />
            </Route>
            <Route path="user">
              <Route
                path="manage-profile/:keyTab"
                element={<ManageProfileScreen />}
              />
              <Route path="change-profile" element={<ChangeProfileModal />} />
              <Route path="change-password" element={<ChangePasswordModal />} />
            </Route>
          </Route>
        </Route>
        <Route path="/" element={<ManagerLayout />}>
          <Route path="my-organization">
            <Route index element={<MyOrganization />} />
            <Route path="dashboard" element={<OrganizationDashboard />} />
            <Route path="members" element={<OrganizationMember />} />
            <Route path="projects" element={<OrganizationProject />} />
            <Route
              path="projects/create/:requestId"
              element={<CreateProjectScreen />}
            />
            <Route path="requests" element={<OrganizationRequest />} />
            <Route path="schedule" element={<OrganizationSchedule />} />
          </Route>
        </Route>
        <Route path="/" element={<UserLayout />}>
          <Route path="organizations">
            <Route index element={<OrganizationsOverview />} />
            <Route path=":organizationId" element={<OrganizationDetails />} />
            <Route path="create" element={<CreateOrganization />} />
          </Route>
          <Route path="rankings">
            <Route path="organizations" element={<OrganizationRankings />} />
            <Route path="users" element={<UserRankings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
