import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllOrganizations } from "../../../redux/organization/organizationSlice";

const OrganizationSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const dispatch = useDispatch();

  const { loading, error, organizations } = useSelector(
    (state) => state.organization
  );
  console.log("organizations", organizations);

  useEffect(() => {
    dispatch(getAllOrganizations());
  }, [dispatch]);

  useEffect(() => {
    if (organizations.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % organizations.length);
      }, 3000);
      return () => clearInterval(interval); // Dọn dẹp khi component unmount
    }
  }, [organizations]);

  return (
    <div className="container mx-auto p-6 max-w-[1000px]">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Featured Organizations
      </h2>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {organizations.map((org) => (
            <div
              key={org.organizationId}
              className="min-w-full rounded-md overflow-hidden"
            >
              <Link to={`/organizations/${org.organizationId}`}>
                <div
                  className="h-64 bg-cover bg-center relative flex flex-col justify-end p-6 text-white"
                  style={{
                    backgroundImage: `url(${org.backgroundUrl})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black opacity-40"></div>
                  <div className="relative z-10">
                    <h3 className="text-4xl font-semibold">
                      {org.organizationName}
                    </h3>
                    <p className="text-sm mt-2 line-clamp-2">
                      {(org.organizationDescription != "" &&
                        org.organizationDescription) ||
                        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
                    </p>
                    <div className="mt-4 text-sm">
                      <p>Projects: {org.projectCount || 0}</p>
                      <p>Donations: ${org.totalDonations || 0}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        {/* Dots điều hướng */}
        <div className="flex justify-center items-center mt-4 gap-1">
          {organizations.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-gray-800" : "bg-gray-400"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSlideshow;
