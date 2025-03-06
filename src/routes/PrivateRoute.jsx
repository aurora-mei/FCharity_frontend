import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useLoading from "../../hooks/useLoading";
const PrivateRoute = () => {
    const loadingUI = useLoading();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status

    useEffect(() => {
        const checkAuth = async () => {
            const storeModule = await import("../redux/store"); // ✅ Dynamic import
            const store = storeModule.default;
            const token = store.getState().auth.token;
            console.log("Token in PrivateRoute: ", token);
            setIsAuthenticated(!!token); // Update state based on token
        };

        checkAuth();
    }, []);

    if (loadingUI || loading) return <LoadingModal />;
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default PrivateRoute;