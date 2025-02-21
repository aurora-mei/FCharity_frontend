import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "../screens/general/HomeScreen.jsx";
import LoginScreen from "../screens/auth/LoginScreen.jsx";
import SignupScreen from "../screens/auth/SignupScreen.jsx";
import OtpVerificationScreen from "../screens/auth/OtpVerificationScreen.jsx";
import PrivateRoute from "./PrivateRoute";
import LoadingModal from "../components/LoadingModal/index.jsx";
import ResetPwdScreen from "../screens/auth/ResetPwdScreen.jsx";
const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeScreen />} />
                {/* <Route path="/blockchain" element={<App />} /> */}
                <Route path="/auth">
                    <Route path="login" element={<LoginScreen />} />
                    <Route path="signup" element={<SignupScreen />} />
                    <Route path="otp-verification" element={<OtpVerificationScreen />} />
                    <Route path="otp-reset-password" element={<ResetPwdScreen />} />
                </Route>
                <Route element={<PrivateRoute />}>
                    <Route path="/donate" element={<LoadingModal />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;
