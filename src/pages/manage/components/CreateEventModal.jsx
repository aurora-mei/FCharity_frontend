import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { IoClose } from "react-icons/io5";
import { IoChevronDownOutline } from "react-icons/io5";

const CreateEventModal = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  newEvent,
  setNewEvent,
  errors,
  handleInputChange,
  handleCreateEvent,
}) => {
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const colorOptions = [
    { value: "#3788d8", label: "Blue", color: "#3788d8" },
    { value: "#28a745", label: "Green", color: "#28a745" },
    { value: "#dc3545", label: "Red", color: "#dc3545" },
    { value: "#ffca2c", label: "Yellow", color: "#ffca2c" },
    { value: "#6f42c1", label: "Purple", color: "#6f42c1" },
  ];

  const mapEventTypeToDisplayName = (eventType) => {
    const eventTypeMap = {
      COMMUNITY_SUPPORT: "Community Support",
      SEMINAR: "Seminar",
      VOLUNTEER: "Volunteer",
      FUNDRAISING: "Fundraising",
      TRAINING: "Training",
    };
    return eventTypeMap[eventType] || eventType;
  };
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
                  <option value="Hỗ trợ cộng đồng">Community Support</option>
                  <option value="Hội thảo">Seminar</option>
                  <option value="Tình nguyện">Volunteer</option>
                  <option value="Gây quỹ">Fundraising</option>
                  <option value="Tập huấn">Training</option>
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
                Organization
              </label>
              <input
                type="text"
                name="organizer"
                value={newEvent.organizer}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              {errors.organizer && (
                <p className="text-red-500 text-xs mt-1">{errors.organizer}</p>
              )}
            </div> */}

            <div>
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
        <button
          onClick={() => setIsCreateModalOpen(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors hover:cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateEvent}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors  hover:cursor-pointer"
        >
          Create
        </button>
      </div>
    </Modal>
  );
};

export default CreateEventModal;
