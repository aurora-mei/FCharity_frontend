import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from "../components/Navbar/Navbar";
import AppFooter from "../components/AppFooter/AppFooter";

const Layout = () => {
    return (
        <div>
            <Navbar/>
            <main>
                <Outlet />
            </main>
            <AppFooter />
        </div>
    );
};

export default Layout;