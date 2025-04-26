import React, { useEffect, useState } from "react";
import { SiPhpmyadmin } from "react-icons/si";
import { VscOrganization } from "react-icons/vsc";
import { SiAwsorganizations } from "react-icons/si";

import UserSidebar from "./UserSidebar";
import ManagerSidebar from "./ManagerSidebar";
import CeoSidebar from "./CeoSidebar";
import { useDispatch, useSelector } from "react-redux";
import {
  getJoinedOrganizations,
  getManagedOrganizationByCeo,
  getManagedOrganizationsByManager,
  getOrganizationById,
  setCurrentOrganization,
  setCurrentRole,
} from "../../redux/organization/organizationSlice";

import ColorThief from "colorthief";

const SidebarContainer = () => {
  const [mode, setMode] = useState("ceo");

  const dispatch = useDispatch();

  const ownedOrganization = useSelector(
    (state) => state.organization.ownedOrganization
  );

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const managedOrganizations = useSelector(
    (state) => state.organization.managedOrganizations
  );

  const joinedOrganizations = useSelector(
    (state) => state.organization.joinedOrganizations
  );

  useEffect(() => {
    if (mode === "ceo") {
      dispatch(getManagedOrganizationByCeo());
      dispatch(setCurrentRole("ceo"));
      dispatch(setCurrentOrganization(ownedOrganization));
    }

    if (mode === "manager") {
      dispatch(getManagedOrganizationsByManager());
      dispatch(setCurrentRole("manager"));
    }

    if (mode === "member") {
      dispatch(getJoinedOrganizations());
      dispatch(setCurrentRole("member"));
    }
  }, [mode]);

  const handleChangeCurrentOrganization = (organizationId) => {
    dispatch(getOrganizationById(organizationId));
  };

  const getDominantColor = async (backgroundUrl) => {
    if (!backgroundUrl) return "rgb(71, 222, 156)";

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = backgroundUrl;

    img.onload = async () => {
      try {
        const colorThief = new ColorThief();
        const color = await colorThief.getColor(img);

        const formattedColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        return formattedColor;
      } catch (error) {
        console.error("Lỗi khi lấy màu chính: ", error);
      }
    };

    img.onerror = () => {
      console.error("Lỗi khi tải ảnh: ", backgroundUrl);
      return "rgb(71, 222, 156)";
    };
  };

  console.log("ownedOrganization: ", ownedOrganization);

  return (
    <div className="w-[270px] items-stretch shrink-0 grow-0 min-h-[500px] flex bg-white shadow-md overflow-y-auto">
      <div className="pt-4 px-1 flex flex-col gap-2 bg-gray-50">
        <div
          className={`flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300 ${
            mode === "ceo" ? "bg-gray-300" : ""
          }`}
          title="My owned organization"
          onClick={() => {
            setMode("ceo");
            dispatch(setCurrentRole("ceo"));
            if (ownedOrganization) {
              handleChangeCurrentOrganization(
                ownedOrganization?.organizationId
              );
            } else {
              dispatch(setCurrentOrganization(null));
            }
          }}
        >
          <SiPhpmyadmin style={{ fontSize: "24px" }} />
        </div>

        <div
          className={`flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300 ${
            mode === "manager" ? "bg-gray-300" : ""
          }`}
          title="My managed organizations"
          onClick={() => {
            setMode("manager");
            dispatch(setCurrentRole("manager"));
            if (managedOrganizations?.length > 0) {
              handleChangeCurrentOrganization(
                managedOrganizations[0]?.organizationId
              );
            } else {
              dispatch(setCurrentOrganization(null));
              console.log("currentOrganization: ", currentOrganization);
            }
          }}
        >
          <SiAwsorganizations style={{ fontSize: "24px" }} />
        </div>

        <div
          className={`flex justify-center items-center p-2 hover:cursor-pointer hover:bg-gray-300 ${
            mode === "member" ? "bg-gray-300" : ""
          }`}
          title="My joined organizations"
          onClick={() => {
            setMode("member");
            dispatch(setCurrentRole("member"));
            if (joinedOrganizations?.length > 0) {
              handleChangeCurrentOrganization(
                joinedOrganizations[0]?.organizationId
              );
            } else {
              dispatch(setCurrentOrganization(null));
            }
          }}
        >
          <VscOrganization style={{ fontSize: "24px" }} />
        </div>
        <span className="h-[2px] bg-gray-500" />
        {mode === "ceo" && ownedOrganization && (
          <div className="pt-4 flex flex-col gap-2">
            <div
              className={`uppercase flex items-center justify-center py-2 px-3 font-bold hover:cursor-pointer hover:scale-105 transition duration-200 bg-blue-300 ${
                ownedOrganization?.organizationId ===
                currentOrganization?.organizationId
                  ? "bg-blue-500"
                  : ""
              }`}
              title={ownedOrganization?.organizationName}
              style={{
                backgroundColor: getDominantColor(
                  ownedOrganization?.backgroundUrl
                ),
              }}
              onClick={() => {
                handleChangeCurrentOrganization(
                  ownedOrganization?.organizationId
                );
              }}
            >
              {ownedOrganization?.organizationName[0]}
            </div>
          </div>
        )}

        {mode === "manager" && managedOrganizations.length > 0 && (
          <div className="pt-4 flex flex-col gap-2">
            {managedOrganizations?.map((organization, index) => (
              <div
                key={index}
                className={`uppercase flex items-center justify-center py-2 px-3 font-bold hover:cursor-pointer hover:scale-105 transition duration-200 bg-blue-300 ${
                  organization?.organizationId ===
                  currentOrganization?.organizationId
                    ? "bg-blue-500"
                    : ""
                }`}
                title={organization?.organizationName}
                style={{
                  backgroundColor:
                    "'" + getDominantColor(organization?.backgroundUrl) + "'",
                }}
                onClick={() => {
                  handleChangeCurrentOrganization(organization?.organizationId);
                }}
              >
                {organization.organizationName[0]}
              </div>
            ))}
          </div>
        )}

        {mode === "member" && joinedOrganizations.length > 0 && (
          <div className="pt-4 flex flex-col gap-2">
            {joinedOrganizations?.map((organization, index) => (
              <span
                key={index}
                className={`uppercase flex items-center justify-center py-2 px-3  font-bold hover:cursor-pointer hover:scale-105 transition duration-200 bg-blue-300 ${
                  organization?.organizationId ===
                  currentOrganization?.organizationId
                    ? "bg-blue-500"
                    : ""
                }`}
                title={organization?.organizationName}
                style={{
                  backgroundColor: getDominantColor(
                    organization?.backgroundUrl
                  ),
                }}
                onClick={() => {
                  handleChangeCurrentOrganization(organization?.organizationId);
                }}
              >
                {organization.organizationName[0]}
              </span>
            ))}
          </div>
        )}
      </div>

      {mode === "ceo" && <CeoSidebar />}
      {mode === "manager" && <ManagerSidebar />}
      {mode === "member" && <UserSidebar />}
    </div>
  );
};

export default SidebarContainer;
