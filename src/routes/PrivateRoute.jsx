import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = async () => {
  const storeModule = await import("../redux/store"); // ✅ Dùng dynamic import
  const store = storeModule.default;
  const token = store.getState().auth.token;
  console.log("Token in PrivateRoute: ", token);
  return token ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default PrivateRoute;
