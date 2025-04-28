import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { StompSessionProvider } from "react-stomp-hooks";
import Navbar from "../Navbar/Navbar";

const FloatingChatButton = React.lazy(() =>
  import("../GeminiChatBox/FloatingChatButton")
);

const TopLayout = () => {
  return (
    <StompSessionProvider url={"ws://localhost:8080/ws/websocket"}>
      <div>
        <Navbar />
        <main>
          <Outlet />
          <Suspense fallback={null}>
            {" "}
            {/* or <div>Loading chat...</div> */}
            <FloatingChatButton />
          </Suspense>
        </main>
      </div>
    </StompSessionProvider>
  );
};

export default TopLayout;
