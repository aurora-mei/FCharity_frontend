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
  getAllMembersInOrganization,
  getAllUsersNotInOrganization,
} from "../../../redux/organization/organizationSlice";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const top100Films = [
  { title: "The Shawshank Redemption", year: 1994 },
  { title: "The Godfather", year: 1972 },
  { title: "The Godfather: Part II", year: 1974 },
  { title: "The Dark Knight", year: 2008 },
  { title: "12 Angry Men", year: 1957 },
  { title: "Schindler's List", year: 1993 },
  { title: "Pulp Fiction", year: 1994 },
  {
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
  },
  { title: "The Good, the Bad and the Ugly", year: 1966 },
  { title: "Fight Club", year: 1999 },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    year: 2001,
  },
  {
    title: "Star Wars: Episode V - The Empire Strikes Back",
    year: 1980,
  },
  { title: "Forrest Gump", year: 1994 },
  { title: "Inception", year: 2010 },
  {
    title: "The Lord of the Rings: The Two Towers",
    year: 2002,
  },
  { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { title: "Goodfellas", year: 1990 },
  { title: "The Matrix", year: 1999 },
  { title: "Seven Samurai", year: 1954 },
  {
    title: "Star Wars: Episode IV - A New Hope",
    year: 1977,
  },
  { title: "City of God", year: 2002 },
  { title: "Se7en", year: 1995 },
  { title: "The Silence of the Lambs", year: 1991 },
  { title: "It's a Wonderful Life", year: 1946 },
  { title: "Life Is Beautiful", year: 1997 },
  { title: "The Usual Suspects", year: 1995 },
  { title: "Léon: The Professional", year: 1994 },
  { title: "Spirited Away", year: 2001 },
  { title: "Saving Private Ryan", year: 1998 },
  { title: "Once Upon a Time in the West", year: 1968 },
  { title: "American History X", year: 1998 },
  { title: "Interstellar", year: 2014 },
];

const CreateEventModal = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  newEvent,
  setNewEvent,
  errors,
  handleInputChange,
  handleCreateEvent,
}) => {
  const dispatch = useDispatch();

  const usersOutsideOrganization = useSelector(
    (state) => state.organization.usersOutsideOrganization
  );

  const currentOrganizationMembers = useSelector(
    (state) => state.organization.currentOrganizationMembers
  );

  const ownedOrganization = useSelector(
    (state) => state.organization.ownedOrganization
  );

  useEffect(() => {
    if (ownedOrganization?.organizationId) {
      dispatch(getAllMembersInOrganization(ownedOrganization.organizationId));
      dispatch(getAllUsersNotInOrganization(ownedOrganization.organizationId));
    }
  }, [dispatch, ownedOrganization]);

  const usersList = [
    ...usersOutsideOrganization,
    ...currentOrganizationMembers.map((member) => member.user),
  ];
  const [selectedEmailsList, setSelectedEmailsList] = useState([]);

  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  const colorOptions = [
    { value: "#3788d8", label: "Blue", color: "#3788d8" },
    { value: "#28a745", label: "Green", color: "#28a745" },
    { value: "#dc3545", label: "Red", color: "#dc3545" },
    { value: "#ffca2c", label: "Yellow", color: "#ffca2c" },
    { value: "#6f42c1", label: "Purple", color: "#6f42c1" },
  ];

  const filterEmails = () => {};

  console.log("usersOutsideOrganization 🍎🍎", usersOutsideOrganization);
  console.log("currentOrganizationMembers ⚓⚓", currentOrganizationMembers);
  console.log("users: ", usersList);

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onRequestClose={() => setIsCreateModalOpen(false)}
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
          Create New Event
        </p>
        <button
          className="focus:outline-none hover:cursor-pointer"
          onClick={() => setIsCreateModalOpen(false)}
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
                Title
              </label>
              <input
                type="text"
                name="title"
                value={newEvent.title}
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
                  Start time
                </label>
                <DatePicker
                  selected={newEvent.start}
                  onChange={(date) => setNewEvent({ ...newEvent, start: date })}
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
                  End time
                </label>
                <DatePicker
                  selected={newEvent.end}
                  onChange={(date) => setNewEvent({ ...newEvent, end: date })}
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
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={newEvent.location}
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
                  value={newEvent.meetingLink}
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
                  Event type
                </label>
                <select
                  name="eventType"
                  value={newEvent.eventType}
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
                            newEvent.backgroundColor || "#3788d8",
                        }}
                      ></span>
                      <span className="flex-1">
                        {colorOptions.find(
                          (option) =>
                            option.value ===
                            (newEvent.backgroundColor || "#3788d8")
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
                              setNewEvent({
                                ...newEvent,
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

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target audience
              </label>
              <input
                type="text"
                name="targetAudience"
                value={newEvent.targetAudience}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {errors.targetAudience && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.targetAudience}
                </p>
              )}
            </div> */}

            <div>
              <h3 className="mb-4 font-semibold text-gray-900">
                Target audience{" "}
                <span className="text-sm text-gray-500">
                  (For sending invitation email)
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
                        id="vue-checkbox-list"
                        type="checkbox"
                        value=""
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500"
                        style={{ color: "blue" }}
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
                        id="react-checkbox-list"
                        type="checkbox"
                        value=""
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 "
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
                        id="angular-checkbox-list"
                        type="checkbox"
                        value=""
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 "
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
                        id="laravel-checkbox-list"
                        type="checkbox"
                        value=""
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 "
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
                    options={usersList}
                    disableCloseOnSelect
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
                    id="checkboxes-tags-demo"
                    options={usersList}
                    disableCloseOnSelect
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
          </div>

          <div className="space-y-4">
            <p className="text-lg font-semibold text-gray-700">
              Detail information
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary
              </label>
              <textarea
                name="summary"
                value={newEvent.summary}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 h-24 resize-none"
              />
              {errors.summary && (
                <p className="text-red-500 text-xs mt-1">{errors.summary}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                name="fullDescription"
                value={newEvent.fullDescription}
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
          onClick={() => setIsCreateModalOpen(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors hover:cursor-pointer"
        >
          Cancel
        </div>
        <div
          onClick={handleCreateEvent}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors  hover:cursor-pointer"
        >
          Create
        </div>
      </div>
    </Modal>
  );
};

export default CreateEventModal;
