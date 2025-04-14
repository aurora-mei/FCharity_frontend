import React from "react";
import Navbar from "../Navbar/Navbar";
import ManagerSidebar from "../OrganizationManagement/ManagerSidebar";
import { ToastContainer } from "react-toastify";
import AppFooter from "../AppFooter/AppFooter";
import { Outlet } from "react-router-dom";
import { StompSessionProvider } from "react-stomp-hooks";
const ManagerLayout = ({ children }) => {
  return (
    <StompSessionProvider url={"ws://localhost:8080/ws/websocket"}>
    <div>
      <Navbar />
      <div className="relative">
        <ManagerSidebar />
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
    </StompSessionProvider>
  );
};

export default ManagerLayout;
