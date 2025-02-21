import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const PrivateRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Track authentication status

    useEffect(() => {
        const checkAuth = async () => {
            const storeModule = await import("../redux/store"); // ✅ Dynamic import
            const store = storeModule.default;
            const token = store.getState().auth.token;
            console.log("Token in PrivateRoute: ", token);
            setIsAuthenticated(!!token); // Update state based on token
        };

        checkAuth(); // Check authentication when component mounts
    }, []);

    if (isAuthenticated === null) {
        // While authentication status is being checked, render nothing or a loading indicator
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" />;
};

export default PrivateRoute;
