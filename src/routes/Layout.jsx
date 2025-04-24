import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import AppFooter from "../components/AppFooter/AppFooter";
import { StompSessionProvider } from "react-stomp-hooks";

const FloatingChatButton = React.lazy(() => import("../components/GeminiChatBox/FloatingChatButton"));

const Layout = () => {
  return (
    <StompSessionProvider url={"ws://localhost:8080/ws/websocket"}>
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
    </StompSessionProvider>
  );
};

export default Layout;
