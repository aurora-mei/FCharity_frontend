import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { IoClose } from "react-icons/io5";
import { IoChevronDownOutline } from "react-icons/io5";

import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useDispatch, useSelector } from "react-redux";
import {
  addOrganizationEvent,
  createIncludesExcludes,
  getAllMembersInOrganization,
  getAllUsersNotInOrganization,
  getIncludesExcludes,
  updateIncludesExcludes,
  updateOrganizationEvent,
} from "../../../redux/organization/organizationSlice";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const EditEventModal = ({
  isEditModalOpen,
  setIsEditModalOpen,
  selectedEvent,
}) => {
  const dispatch = useDispatch();

  const currentIncludes = useSelector(
    (state) => state.organization.currentIncludes
  );

  const currentExcludes = useSelector(
    (state) => state.organization.currentExcludes
  );

  const usersOutsideOrganization = useSelector(
    (state) => state.organization.usersOutsideOrganization
  );
  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );
  const currentOrganizationMembers = useSelector(
    (state) => state.organization.currentOrganizationMembers
  );

  const usersList = [
    ...usersOutsideOrganization,
    ...[...currentOrganizationMembers].map((member) => member.user),
  ];

  const [editingEvent, setEditingEvent] = useState();

  useEffect(() => {
    if (selectedEvent.organizationEventId) {
      dispatch(getIncludesExcludes(selectedEvent.organizationEventId));
      setEditingEvent({
        ...selectedEvent,
      });
    }
  }, [selectedEvent.organizationEventId, dispatch]);

  const [errors, setErrors] = useState([]);

  const memberList = [...currentOrganizationMembers]
    .filter((member) => member.memberRole == "MEMBER")
    .map((member) => member.user);

  const managerList = [...currentOrganizationMembers]
    .filter((member) => member.memberRole == "MANAGER")
    .map((member) => member.user);

  const ceoList = [...currentOrganizationMembers]
    .filter((member) => member.memberRole == "CEO")
    .map((member) => member.user);

  // lưu trạng thái cho audienceGroups, sử dụng cho excludeUsers
  const [selectedUsers, setSelectedUsers] = useState(
    selectedEvent?.targetAudienceGroups.includes("ALL")
      ? [...usersList]
      : selectedEvent?.targetAudienceGroups.includes("MEMBER")
      ? [...memberList]
      : selectedEvent?.targetAudienceGroups.includes("MANAGER")
      ? [...managerList]
      : selectedEvent?.targetAudienceGroups.includes("CEO")
      ? [...ceoList]
      : []
  );

  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  const [includeUsers, setIncludeUsers] = useState([
    ...usersList.filter((user) => currentIncludes.includes(user.email)),
  ]);
  const [excludeUsers, setExcludeUsers] = useState([
    ...usersList.filter((user) => currentExcludes.includes(user.email)),
  ]); // sử dụng với selectedUsers

  const colorOptions = [
    { value: "#3788d8", label: "Blue", color: "#3788d8" },
    { value: "#28a745", label: "Green", color: "#28a745" },
    { value: "#dc3545", label: "Red", color: "#dc3545" },
    { value: "#ffca2c", label: "Yellow", color: "#ffca2c" },
    { value: "#6f42c1", label: "Purple", color: "#6f42c1" },
  ];
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name?.startsWith("audienceGroups")) {
      if (name === "audienceGroupsAll") {
        if (checked) {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: ["ALL", "MEMBER", "MANAGER", "CEO"],
          });
          setSelectedUsers([...usersList]);
          setIncludeUsers([]);
          setExcludeUsers([]);
        } else {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: [],
          });
          setSelectedUsers([]);
          setIncludeUsers([]);
          setExcludeUsers([]);
        }
      }
      if (name === "audienceGroupsMember") {
        if (checked) {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: [
              ...editingEvent.targetAudienceGroups,
              "MEMBER",
            ],
          });
          setSelectedUsers((prev) => [...prev, ...memberList]);
          setIncludeUsers((prev) =>
            prev.filter((user) => !memberList.includes(user))
          );
        } else {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: editingEvent.targetAudienceGroups.filter(
              (group) => group !== "MEMBER"
            ),
          });
          setSelectedUsers((prev) =>
            prev.filter((user) => !memberList.includes(user))
          );
          setExcludeUsers((prev) =>
            prev.filter((user) => !memberList.includes(user))
          );
        }
      }
      if (name === "audienceGroupsManager") {
        if (checked) {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: [
              ...editingEvent.targetAudienceGroups,
              "MANAGER",
            ],
          });
          setSelectedUsers((prev) => [...prev, ...managerList]);
          setIncludeUsers((prev) =>
            prev.filter((user) => !managerList.includes(user))
          );
        } else {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: editingEvent.targetAudienceGroups.filter(
              (group) => group !== "MANAGER"
            ),
          });
          setSelectedUsers((prev) =>
            prev.filter((user) => !managerList.includes(user))
          );
          setExcludeUsers((prev) =>
            prev.filter((user) => !managerList.includes(user))
          );
        }
      }
      if (name === "audienceGroupsCeo") {
        if (checked) {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: [...editingEvent.targetAudienceGroups, "CEO"],
          });
          setSelectedUsers((prev) => [...prev, ...ceoList]);
          setIncludeUsers((prev) =>
            prev.filter((user) => !ceoList.includes(user))
          );
        } else {
          setEditingEvent({
            ...editingEvent,
            targetAudienceGroups: editingEvent.targetAudienceGroups.filter(
              (group) => group !== "CEO"
            ),
          });
          setSelectedUsers((prev) =>
            prev.filter((user) => !ceoList.includes(user))
          );
          setExcludeUsers((prev) =>
            prev.filter((user) => !ceoList.includes(user))
          );
        }
      }
    } else {
      setEditingEvent({ ...editingEvent, [name]: value });
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!editingEvent.title) newErrors.title = "Title cannot be blank";
    if (!editingEvent.start) newErrors.start = "Start time cannot be blank";
    if (!editingEvent.end) newErrors.end = "End time cannot be blank";
    if (
      editingEvent.start &&
      editingEvent.end &&
      editingEvent.start >= editingEvent.end
    ) {
      newErrors.end = "The end time must be after the start time.";
    }
    if (!editingEvent.location) newErrors.location = "Location cannot be empty";
    if (!editingEvent.eventType)
      newErrors.eventType = "Event type cannot be blank";
    if (selectedUsers.length === 0)
      newErrors.targetAudienceGroups = "Participants cannot be left blank";
    if (!editingEvent.summary)
      newErrors.summary = "Summary cannot be left blank";
    if (!editingEvent.fullDescription)
      newErrors.fullDescription = "Details cannot be left blank";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleUpdateEvent = async () => {
    if (!validateForm()) return;

    console.log("editingEvent:⌚⌚ ", editingEvent);

    const editingEventData = {
      organizationEventId: editingEvent.organizationEventId,
      title: editingEvent.title,
      startTime: editingEvent.start,
      endTime: editingEvent.end,
      backgroundColor: editingEvent.backgroundColor || "#3788d8",
      borderColor: editingEvent.borderColor || "#3788d8",
      textColor: editingEvent.textColor,
      location: editingEvent.location,
      meetingLink: editingEvent.meetingLink,
      eventType: editingEvent.eventType,
      organizer: editingEvent.organizer,
      targetAudienceGroups: editingEvent.targetAudienceGroups.join(","),
      summary: editingEvent.summary,
      fullDescription: editingEvent.fullDescription,
    };
    console.log("New Event Data: 🧊🧊", editingEventData);
    console.log("Organizer: ", currentOrganization);

    const evenUpdatedResponse = await dispatch(
      updateOrganizationEvent(editingEventData)
    ).unwrap();

    console.log("eventUpdatedResponse: ", evenUpdatedResponse);

    dispatch(
      updateIncludesExcludes({
        includes: [...includeUsers.map((user) => user.email)],
        excludes: [...excludeUsers.map((user) => user.email)],
        organizationEventId: editingEventData.organizationEventId,
      })
    );

    //TODO: gửi mail tới người được mời tham gia (tự dộng gửi khi dispatch updateIncludesExcludes)
    setIsEditModalOpen(false);
    setErrors({});
  };
  // console.log("usersOutsideOrganization 🍎🍎", usersOutsideOrganization);
  // console.log("currentOrganizationMembers ⚓⚓", currentOrganizationMembers);
  // console.log("targetAudienceGroups: ", editingEvent?.targetAudienceGroups);
  // console.log("selectedUsers: ", selectedUsers);
  // console.log("includeUsers: ", includeUsers);
  // console.log("excludeUsers: ", excludeUsers);
  console.log("editing event: ", editingEvent);

  return (
    <Modal
      isOpen={isEditModalOpen}
      onRequestClose={() => setIsEditModalOpen(false)}
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
          Edit Event
        </p>
        <button
          className="focus:outline-none hover:cursor-pointer"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingEvent({
              ...editingEvent,
              targetAudienceGroups: [],
            });
            setIncludeUsers([]);
            setExcludeUsers([]);
            setSelectedUsers([]);
          }}
        >
          <IoClose className="text-gray-500 hover:text-gray-700 " />
        </button>
      </div>
      <div className="p-6 overflow-y-auto max-h-[70vh]">
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-gray-700">
              Basic information
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={editingEvent?.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start time <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={editingEvent?.start}
                  onChange={(date) =>
                    setEditingEvent({ ...editingEvent, start: date })
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {errors.start && (
                  <p className="text-red-500 text-xs mt-1">{errors.start}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End time <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={editingEvent?.end}
                  onChange={(date) =>
                    setEditingEvent({ ...editingEvent, end: date })
                  }
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {errors.end && (
                  <p className="text-red-500 text-xs mt-1">{errors.end}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={editingEvent?.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Online meeting link (if have)
                </label>
                <input
                  type="text"
                  name="meetingLink"
                  value={editingEvent?.meetingLink}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg font-semibold text-gray-700">
              More information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event type <span className="text-red-500">*</span>
                </label>
                <select
                  name="eventType"
                  value={editingEvent?.eventType}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select event type</option>
                  <option value="COMMUNITY_SUPPORT">Community Support</option>
                  <option value="SEMINAR">Seminar</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="FUNDRAISING">Fundraising</option>
                  <option value="TRAINING">Training</option>
                </select>
                {errors.eventType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.eventType}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu sắc
                </label>
                <div className="relative">
                  {/* Custom Select */}
                  <div className="w-full p-2 border border-gray-300 rounded shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() =>
                        setIsColorDropdownOpen(!isColorDropdownOpen)
                      }
                    >
                      <span
                        className="w-4 h-4 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            editingEvent?.backgroundColor || "#3788d8",
                        }}
                      ></span>
                      <span className="flex-1">
                        {colorOptions.find(
                          (option) =>
                            option.value ===
                            (editingEvent?.backgroundColor || "#3788d8")
                        )?.label || "Select color"}
                      </span>
                      <IoChevronDownOutline
                        className={`w-4 h-4 text-gray-400 transform transition-transform ${
                          isColorDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    {/* Dropdown */}
                    {isColorDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                        {colorOptions.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setEditingEvent({
                                ...editingEvent,
                                backgroundColor: option.value,
                                borderColor: option.value,
                                textColor:
                                  option.value === "#ffca2c"
                                    ? "#000000"
                                    : "#ffffff",
                              });
                              setIsColorDropdownOpen(false);
                            }}
                          >
                            <span
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: option.color }}
                            ></span>
                            <span>{option.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-gray-900">
                Target audience <span className="text-red-500">*</span>
                <span className="text-sm text-gray-500">
                  (For sending invitation emails)
                </span>
              </h3>
              <div className="flex flex-col items-end">
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
                        onChange={handleInputChange}
                        checked={editingEvent?.targetAudienceGroups.includes(
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
                        onChange={handleInputChange}
                        disabled={editingEvent?.targetAudienceGroups.includes(
                          "ALL"
                        )}
                        checked={editingEvent?.targetAudienceGroups.includes(
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
                        onChange={handleInputChange}
                        disabled={editingEvent?.targetAudienceGroups.includes(
                          "ALL"
                        )}
                        checked={editingEvent?.targetAudienceGroups.includes(
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
                        onChange={handleInputChange}
                        disabled={editingEvent?.targetAudienceGroups.includes(
                          "ALL"
                        )}
                        checked={editingEvent?.targetAudienceGroups.includes(
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
                    id="checkboxes-tags-demo"
                    options={usersList.filter(
                      (user) => !selectedUsers.includes(user)
                    )}
                    disableCloseOnSelect
                    value={includeUsers}
                    getOptionLabel={(option) => option.fullName}
                    filterOptions={(options, { inputValue }) =>
                      options.filter(
                        (option) =>
                          option.fullName
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()) ||
                          option.email
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                      )
                    }
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
                    onChange={(event, newValue) => {
                      console.log("Users include list selected:", newValue);
                      setIncludeUsers(newValue);
                    }}
                  />
                </div>
                <div className="mt-4">
                  <h4 className="text-gray-800 text-md">Exclude</h4>
                  <Autocomplete
                    multiple
                    id="checkboxes-tags-demo"
                    options={selectedUsers}
                    disableCloseOnSelect
                    value={excludeUsers}
                    getOptionLabel={(option) => option.fullName}
                    filterOptions={(options, { inputValue }) =>
                      options.filter(
                        (option) =>
                          option.fullName
                            .toLowerCase()
                            .includes(inputValue.toLowerCase()) ||
                          option.email
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                      )
                    }
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
                    onChange={(event, newValue) => {
                      setExcludeUsers(newValue);
                    }}
                  />
                </div>
              </div>
              {errors.targetAudienceGroups && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.targetAudienceGroups}
                </p>
              )}
              <div className="mt-4">
                <p style={{ margin: 0 }}>Selected users</p>
                <div className="mt-1 w-full overflow-y-scroll h-[100px] border rounded-sm border-gray-300 p-2 flex gap-1 flex-wrap items-start">
                  {selectedUsers.length > 0 &&
                    selectedUsers
                      .filter((user) => !excludeUsers.includes(user))
                      .map((user, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-200 rounded-full text-gray-600 shrink-0"
                        >
                          {user.fullName} {"  "} ({user.email})
                        </span>
                      ))}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-lg font-semibold text-gray-700">
              Detail information
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                name="summary"
                value={editingEvent?.summary}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 h-24 resize-none"
              />
              {errors.summary && (
                <p className="text-red-500 text-xs mt-1">{errors.summary}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details <span className="text-red-500">*</span>
              </label>
              <textarea
                name="fullDescription"
                value={editingEvent?.fullDescription}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 h-32 resize-none"
              />
              {errors.fullDescription && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-end items-center gap-8">
        <div
          onClick={() => {
            handleUpdateEvent();
          }}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors  hover:cursor-pointer"
        >
          Update
        </div>
        <div
          onClick={() => {
            setIsEditModalOpen(false);
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors hover:cursor-pointer"
        >
          Cancel
        </div>
      </div>
    </Modal>
  );
};

export default EditEventModal;
