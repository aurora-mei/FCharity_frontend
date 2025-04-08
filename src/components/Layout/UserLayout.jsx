import React from "react";
import Navbar from "../Navbar/Navbar";
import { ToastContainer } from "react-toastify";
import AppFooter from "../AppFooter/AppFooter";
import { Outlet } from "react-router-dom";
import UserSidebar from "../OrganizationManagement/UserSidebar";

const UserLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="relative">
        <UserSidebar />
        <main className="flex-1 ml-64 pt-6">
          <Outlet />
          <AppFooter />
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="red"
            style={{ background: "white" }}
          />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
