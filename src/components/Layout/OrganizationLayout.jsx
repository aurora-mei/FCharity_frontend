import React from "react";
import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router-dom";
import { StompSessionProvider } from "react-stomp-hooks";
import SidebarContainer from "../OrganizationManagement/SidebarContainer";

const OrganizationLayout = ({ children }) => {
  return (
    <StompSessionProvider url={"ws://localhost:8080/ws/websocket"}>
      <div>
        <div className="flex">
          <SidebarContainer />
          <main className="grow-1">
            <Outlet />
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

export default OrganizationLayout;
