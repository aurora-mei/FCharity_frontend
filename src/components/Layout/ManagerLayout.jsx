import React from "react";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../OrganizationManagement/Sidebar";
import { ToastContainer } from "react-toastify";

const ManagerLayout = ({ children }) => {
  return (
      <div className="relative">
        <Sidebar />
        <main className="flex-1 ml-64 pt-6">
          <div>{children}</div>
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
  );
};

export default ManagerLayout;
