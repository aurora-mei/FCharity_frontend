import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.pcss'
import App from "./App.jsx";
import HomeScreen from "./screens/General/HomeScreen.jsx";
import LoginScreen from "./screens/Authentication/LoginScreen.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
  {
    path: "/blockchain",
    element: <App />,
  },
  {
    path: "/",
    element: <HomeScreen />,
  },
  {
    path: "/auth/login",
    element: <LoginScreen />,
  },
]);


createRoot(document.getElementById('root')).render(

  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
