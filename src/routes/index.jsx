import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "../screens/general/HomeScreen.jsx";
import LoginScreen from "../screens/auth/LoginScreen.jsx";
import SignupScreen from "../screens/auth/SignupScreen.jsx";
import OtpVerificationScreen from "../screens/auth/OtpVerificationScreen.jsx";
import PrivateRoute from "./PrivateRoute";
import LoadingModal from "../components/LoadingModal/index.jsx";
import ResetPwdScreen from "../screens/auth/ResetPwdScreen.jsx";
import CreateRequestScreen from "../screens/request/CreateRequestScreen.jsx";
import RequestListScreen from "../screens/request/RequestListScreen.jsx";
import RequestDetailScreen from "./screens/request/RequestDetailScreen";
import EditRequestScreen from "./screens/request/EditRequestScreen";
import Layout from "./Layout";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/auth">
                    <Route path="login" element={<LoginScreen />} />
                    <Route path="signup" element={<SignupScreen />} />
                    <Route path="otp-verification" element={<OtpVerificationScreen />} />
                    <Route path="otp-reset-password" element={<ResetPwdScreen />} />
                </Route>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomeScreen />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/donate" element={<LoadingModal />} />
                        <Route path="/requests">
                            <Route path="" element={<RequestListScreen />} />
                            <Route path="create" element={<CreateRequestScreen />} />
                            <Route path=":id" element={<RequestDetailScreen />} />
                            <Route path="edit/:id" element={<EditRequestScreen />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;