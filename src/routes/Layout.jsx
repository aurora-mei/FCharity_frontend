import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import AppFooter from "../components/AppFooter/AppFooter";

const FloatingChatButton = React.lazy(() => import("../components/GeminiChatBox/FloatingChatButton"));

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
        <Suspense fallback={null}> {/* or <div>Loading chat...</div> */}
          <FloatingChatButton />
        </Suspense>
      </main>
      <AppFooter />
    </div>
  );
};

export default Layout;
