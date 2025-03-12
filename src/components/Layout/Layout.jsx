import React from "react";
import ManagerNavbar from "../Navbar/ManagerNavbar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <ManagerNavbar />
      <main className="flex-1 ml-[250px] pt-6 p-6 min-h-screen md:ml-[250px]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
