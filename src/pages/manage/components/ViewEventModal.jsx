import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import {
  deleteIncludesExcludes,
  deleteOrganizationEvent,
  getAllMembersInOrganization,
  getAllUsersNotInOrganization,
  getIncludesExcludes,
} from "../../../redux/organization/organizationSlice";
import { IoClose } from "react-icons/io5";
import DatePicker from "react-datepicker";
import { CgBorderStyleDashed } from "react-icons/cg";
import { Link } from "react-router-dom";
import { Autocomplete, Checkbox, TextField } from "@mui/material";

const ViewEventModal = ({
  isViewModalOpen,
  setIsViewModalOpen,
  selectedEvent,
  setSelectedEvent,
  setIsEditModalOpen,
}) => {
  const dispatch = useDispatch();

  const currentRole = useSelector((state) => state.organization.currentRole);

  const currentIncludes = useSelector(
    (state) => state.organization.currentIncludes
  );

  const currentExcludes = useSelector(
    (state) => state.organization.currentExcludes
  );

  const usersOutsideOrganization = useSelector(
    (state) => state.organization.usersOutsideOrganization
  );

  const currentOrganizationMembers = useSelector(
    (state) => state.organization.currentOrganizationMembers
  );

  const usersList = [
    ...usersOutsideOrganization,
    ...[...currentOrganizationMembers].map((member) => member.user),
  ];

  useEffect(() => {
    if (selectedEvent)
      dispatch(getIncludesExcludes(selectedEvent.organizationEventId));
  }, [selectedEvent, dispatch]);

  const closeModal = () => {
    setIsViewModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (organizationEventId) => {
    alert("Are you sure you want to delete this event?", organizationEventId);
    try {
      dispatch(deleteIncludesExcludes(organizationEventId));
      dispatch(deleteOrganizationEvent(organizationEventId));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      isOpen={isViewModalOpen}
      onRequestClose={closeModal}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          padding: "0",
          borderRadius: "8px",
          border: "none",
          overflow: "hidden",
          zIndex: 1001,
        },
      }}
    >
      <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
        <p
          className="text-xl font-bold text-gray-800"
          style={{ margin: 0, padding: 0 }}
        >
          Event Information
        </p>
        <button
          className="focus:outline-none hover:cursor-pointer"
          onClick={closeModal}
        >
          <IoClose className="text-gray-500 hover:text-gray-700 " />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[70vh]">
        <div>
          <p className="text-2xl font-bold mb-4">{selectedEvent?.title}</p>

          <div className="mb-4 flex items-center gap-6">
            <p style={{ margin: "0" }}>⌚Time:</p>
            <div className="flex gap-2 items-center justify-center">
              <DatePicker
                selected={selectedEvent?.start}
                disabled
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                className="w-32"
              />
              <CgBorderStyleDashed className="" size={20} />
              <DatePicker
                selected={selectedEvent?.end}
                disabled
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                className="w-32"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-6">
            <p style={{ margin: "0" }}>🚩Location:</p>
            <p style={{ margin: "0" }}>{selectedEvent?.location}</p>
          </div>

          <div className="mb-4 flex items-center gap-6">
            <p style={{ margin: "0" }}>📡Online meeting link:</p>
            <p style={{ margin: "0" }}>
              {selectedEvent?.meetingLink && (
                <div className="flex items-center gap-3">
                  <Link
                    to={selectedEvent?.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 underline"
                  >
                    Join Online
                  </Link>
                  <div class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                </div>
              )}
            </p>
          </div>

          <div className="mb-4 flex items-center gap-6">
            <p style={{ margin: "0" }}>📌Event type:</p>
            <p style={{ margin: "0" }}>{selectedEvent?.eventType}</p>
          </div>

          <div className="mb-4">
            <p style={{ margin: "0" }}>📲Target audience:</p>
            <div className="mt-2 flex flex-col items-end">
              <ul
                className="items-center w-[500px] text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex"
                style={{ marginBottom: "0" }}
              >
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
                  <div className="flex items-center ps-3">
                    <input
                      name="audienceGroupsAll"
                      type="checkbox"
                      value="ALL"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
                      style={{ color: "blue" }}
                      disabled
                      checked={selectedEvent?.targetAudienceGroups?.includes(
                        "ALL"
                      )}
                    />
                    <label
                      for="vue-checkbox-list"
                      className="w-full py-3 ms-2 text-sm font-medium text-gray-900"
                    >
                      All users
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r ">
                  <div className="flex items-center ps-3">
                    <input
                      name="audienceGroupsMember"
                      type="checkbox"
                      value="MEMBER"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 "
                      disabled
                      checked={selectedEvent?.targetAudienceGroups?.includes(
                        "MEMBER"
                      )}
                    />
                    <label
                      for="react-checkbox-list"
                      className="w-full py-3 ms-2 text-sm font-medium text-gray-900 "
                    >
                      Members
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r ">
                  <div className="flex items-center ps-3">
                    <input
                      name="audienceGroupsManager"
                      type="checkbox"
                      value="MANAGER"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 "
                      disabled
                      checked={selectedEvent?.targetAudienceGroups?.includes(
                        "MANAGER"
                      )}
                    />
                    <label
                      for="angular-checkbox-list"
                      className="w-full py-3 ms-2 text-sm font-medium text-gray-900 "
                    >
                      Managers
                    </label>
                  </div>
                </li>
                <li className="w-full">
                  <div className="flex items-center ps-3">
                    <input
                      name="audienceGroupsCeo"
                      type="checkbox"
                      value="CEO"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 "
                      disabled
                      checked={selectedEvent?.targetAudienceGroups?.includes(
                        "CEO"
                      )}
                    />
                    <label
                      for="laravel-checkbox-list"
                      className="w-full py-3 ms-2 text-sm font-medium text-gray-900"
                    >
                      CEOs
                    </label>
                  </div>
                </li>
              </ul>

              <div className="mt-4">
                <h4 className="text-gray-800 text-md">Include</h4>
                <Autocomplete
                  multiple
                  disabled
                  options={usersList}
                  disableCloseOnSelect
                  value={usersList.filter((user) =>
                    currentIncludes.includes(user.email)
                  )}
                  getOptionLabel={(option) => option.fullName}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.fullName} {"  "} ({option.email})
                      </li>
                    );
                  }}
                  style={{ width: 500 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Includes users"
                      placeholder="Includes users"
                    />
                  )}
                />
              </div>
              <div className="mt-4">
                <h4 className="text-gray-800 text-md">Exclude</h4>
                <Autocomplete
                  multiple
                  disabled
                  options={usersList}
                  disableCloseOnSelect
                  value={usersList.filter((user) =>
                    currentExcludes.includes(user.email)
                  )}
                  getOptionLabel={(option) => option.fullName}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.fullName} {"  "} ({option.email})
                      </li>
                    );
                  }}
                  style={{ width: 500 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Excludes users"
                      placeholder="Excludes users"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <p style={{ margin: "0" }} className="font-semibold text-xl">
              Detail information
            </p>
            <div className="mt-2 ml-6 flex flex-col gap-6">
              <div className="flex gap-6 items-start justify-between">
                <p style={{ margin: "0" }} className="font-semibold">
                  Summary:
                </p>
                <p
                  style={{ margin: "0" }}
                  className="mb-2 w-[370px] grow-0 shrink-0"
                >
                  {selectedEvent?.summary}
                </p>
              </div>
              <div className="flex gap-6 items-start justify-between">
                <p style={{ margin: "0" }} className="font-semibold">
                  Details:
                </p>
                <p
                  style={{ margin: "0" }}
                  className="mb-4 w-[370px] grow-0 shrink-0"
                >
                  {selectedEvent?.fullDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 items-center">
            {currentRole !== "member" && (
              <div
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:cursor-pointer"
              >
                Edit
              </div>
            )}

            <div
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 hover:cursor-pointer"
            >
              Close
            </div>
            {currentRole !== "member" && (
              <div
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleDeleteEvent(selectedEvent.organizationEventId);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hover:cursor-pointer"
              >
                Delete
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewEventModal;
