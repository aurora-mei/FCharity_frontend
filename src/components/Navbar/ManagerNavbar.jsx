import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logOut } from "../../redux/auth/authSlice";

import { getManagedOrganizations } from "../../redux/organization/organizationSlice";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { currentUser, managedOrganizations } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(getManagedOrganizations());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  //TODO: Get organization ID from the URL

  return (
    <nav className="fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white flex flex-col p-5 shadow-lg z-50">
      <div className="mb-8">
        <Link to="/" className="text-2xl font-bold text-white no-underline">
          Dynamics
        </Link>
      </div>

      <div className="flex flex-col flex-grow">
        <Link
          to={`/manager`}
          className="text-gray-400 hover:bg-gray-700 hover:text-white px-4 py-2 rounded transition duration-300"
        >
          Home
        </Link>
        <Link
          to={`/manager/dashboard`}
          className="text-gray-400 hover:bg-gray-700 hover:text-white px-4 py-2 rounded transition duration-300"
        >
          Dashboard
        </Link>
        <Link
          to={`/manager/organizations`}
          className="text-gray-400 hover:bg-gray-700 hover:text-white px-4 py-2 rounded transition duration-300"
        >
          My Organization
        </Link>
        <Link
          to="/manager/projects"
          className="text-gray-400 hover:bg-gray-700 hover:text-white px-4 py-2 rounded transition duration-300"
        >
          Projects
        </Link>
        <Link
          to="/manager/requests"
          className="text-gray-400 hover:bg-gray-700 hover:text-white px-4 py-2 rounded transition duration-300"
        >
          Requests
        </Link>
      </div>

      {currentUser && (
        <div className="mt-auto relative">
          <div
            className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 transition duration-300"
            onClick={toggleDropdown}
          >
            <img
              src={
                currentUser.avatar ||
                "https://science.nasa.gov/wp-content/uploads/2023/07/hubble-space-telescope-hst-6.jpg"
              }
              alt="User Avatar"
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="text-white">{currentUser.fullName}</span>
          </div>
          {isDropdownOpen && (
            <div className="absolute bottom-14 left-0 bg-gray-700 rounded-lg shadow-lg w-48 p-2">
              <Link
                to="/profile"
                className="block text-gray-300 hover:bg-gray-600 px-4 py-2 rounded transition duration-300"
                onClick={() => setIsDropdownOpen(false)}
              >
                View Profile
              </Link>
              <Link
                to="/update-profile"
                className="block text-gray-300 hover:bg-gray-600 px-4 py-2 rounded transition duration-300"
                onClick={() => setIsDropdownOpen(false)}
              >
                Update Profile
              </Link>
              <Link
                to="/change-password"
                className="block text-gray-300 hover:bg-gray-600 px-4 py-2 rounded transition duration-300"
                onClick={() => setIsDropdownOpen(false)}
              >
                Change Password
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-gray-300 hover:bg-gray-600 px-4 py-2 rounded transition duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
