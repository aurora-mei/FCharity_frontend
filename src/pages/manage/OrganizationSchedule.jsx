import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "react-modal";
import "./organizationSchedule.css";

import CreateEventModal from "./components/CreateEventModal";
import { useDispatch, useSelector } from "react-redux";
import {
  addOrganizationEvent,
  getOrganizationEvents,
  updateOrganizationEvent,
} from "../../redux/organization/organizationSlice";

import {
  showError,
  showSuccess,
  showWarning,
  showInfo,
} from "../../utils/showMessage";
import { Link } from "react-router-dom";

const OrganizationSchedule = () => {
  const dispatch = useDispatch();

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const organizationEvents = useSelector(
    (state) => state.organization.organizationEvents
  );

  useEffect(() => {
    if (currentOrganization)
      dispatch(getOrganizationEvents(currentOrganization.organizationId));
  }, [currentOrganization, dispatch]);

  useEffect(() => {
    if (organizationEvents && organizationEvents.length > 0) {
      console.log("update events 🦄", organizationEvents);
      setEvents(
        organizationEvents.map((event, index) => ({
          ...event,
          id: index,
          start: event?.startTime,
          end: event?.endTime,
        }))
      );
    }
  }, [organizationEvents]);

  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [events, setEvents] = useState([]);

  console.log("Events: ", events);

  const [newEvent, setNewEvent] = useState({
    // các thuộc tính mặc định
    title: "",
    start: null,
    end: null,
    backgroundColor: "",
    borderColor: "",
    textColor: "",
    // các thuộc tính mở rộng
    location: "",
    meetingLink: "",
    eventType: "",
    targetAudience: "",
    summary: "",
    fullDescription: "",
  });

  const [errors, setErrors] = useState([]);

  const renderEventContent = (eventInfo) => {
    const start = eventInfo.event.start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const eventStyle = {
      backgroundColor: eventInfo.event.backgroundColor,
      color: eventInfo.event.textColor,
    };

    return (
      <div className="event-item" style={eventStyle}>
        <div className="event-header">
          <span className="event-time">{start}</span>
          <span className="event-title">{eventInfo.event.title}</span>
        </div>
        <div className="event-type">
          {eventInfo.event.extendedProps.eventType}
        </div>
        <div className="event-summary">
          {eventInfo.event.extendedProps.summary}
        </div>
        <div className="event-location">
          <strong>Address:</strong> {eventInfo.event.extendedProps.location}
          {eventInfo.event.extendedProps.meetingLink && (
            <div className="event-link">
              <a
                href={eventInfo.event.extende}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold"
              >
                Join Online
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      location: info.event.extendedProps.location,
      meetingLink: info.event.extendedProps.meetingLink,
      eventType: info.event.extendedProps.eventType,
      organizer: info.event.extendedProps.organizer,
      targetAudience: info.event.extendedProps.targetAudience,
      summary: info.event.extendedProps.summary,
      fullDescription: info.event.extendedProps.fullDescription,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDateClick = (info) => {
    setCalendarView("timeGridDay");
    info.view.calendar.gotoDate(info.dateStr);

    setNewEvent({
      ...newEvent,
      start: new Date(info.dateStr),
      end: new Date(info.dateStr),
    });

    setIsCreateModalOpen(true);
  };

  const handleEventDrop = (info) => {
    const updatedEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,

      organizationEventId: info.event.extendedProps.organizationEventId,
      startTime: info.event.start,
      endTime: info.event.end,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      textColor: info.event.textColor,
      location: info.event.extendedProps.location,
      meetingLink: info.event.extendedProps.meetingLink,
      eventType: info.event.extendedProps.eventType,
      organizer: info.event.extendedProps.organizer,
      targetAudience: info.event.extendedProps.targetAudience,
      summary: info.event.extendedProps.summary,
      fullDescription: info.event.extendedProps.fullDescription,
    };

    const updatedEvents = events.map((event) =>
      event.id === info.event.id ? updatedEvent : event
    );

    alert(
      `Event "${
        info.event.title
      }" has been moved to ${info.event.start.toLocaleString()}`
    );

    try {
      showInfo("Updating event...");
      const savedEvent = {
        // organizer: ownedOrganization,
        organizer: currentOrganization,
        organizationEventId: updatedEvent.organizationEventId,
        title: updatedEvent.title,
        startTime: info.event.start,
        endTime: info.event.end,
        backgroundColor: updatedEvent.backgroundColor,
        borderColor: updatedEvent.borderColor,
        textColor: updatedEvent.textColor,
        location: updatedEvent.location,
        meetingLink: updatedEvent.meetingLink,
        eventType: updatedEvent.eventType,
        // organizer: updatedEvent.organizer,
        targetAudience: updatedEvent.targetAudience,
        summary: updatedEvent.summary,
        fullDescription: updatedEvent.fullDescription,
      };

      dispatch(updateOrganizationEvent(savedEvent));
      // setEvents(updatedEvents);
      showSuccess("Event updated successfully");
    } catch (error) {
      showError("Failed to update event");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newEvent.title) newErrors.title = "Title cannot be blank";
    if (!newEvent.start) newErrors.start = "Start time cannot be blank";
    if (!newEvent.end) newErrors.end = "End time cannot be blank";
    if (newEvent.start && newEvent.end && newEvent.start >= newEvent.end) {
      newErrors.end = "The end time must be after the start time.";
    }
    if (!newEvent.location) newErrors.location = "Location cannot be empty";
    if (!newEvent.eventType) newErrors.eventType = "Event type cannot be blank";

    if (!newEvent.targetAudience)
      newErrors.targetAudience = "Participants cannot be left blank";
    if (!newEvent.summary) newErrors.summary = "Summary cannot be left blank";
    if (!newEvent.fullDescription)
      newErrors.fullDescription = "Details cannot be left blank";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEvent = () => {
    if (!validateForm()) return;

    const newEventData = {
      organizerId: currentOrganization.organizationId,
      title: newEvent.title,
      startTime: newEvent.start,
      endTime: newEvent.end,
      backgroundColor: newEvent.backgroundColor || "#3788d8",
      borderColor: newEvent.borderColor || "#3788d8",
      textColor: newEvent.textColor,
      location: newEvent.location,
      meetingLink: newEvent.meetingLink,
      eventType: newEvent.eventType,
      organizer: newEvent.organizer,
      targetAudience: newEvent.targetAudience,
      summary: newEvent.summary,
      fullDescription: newEvent.fullDescription,
    };

    console.log("New Event Data: 🧊🧊", newEventData);
    console.log("Organizer: ", currentOrganization);

    dispatch(addOrganizationEvent(newEventData));

    setIsCreateModalOpen(false);
    setNewEvent({
      // các thuộc tính mặc định
      title: "",
      start: null,
      end: null,
      backgroundColor: "",
      borderColor: "",
      textColor: "",
      // các thuộc tính mở rộng
      location: "",
      meetingLink: "",
      eventType: "",
      targetAudience: "",
      summary: "",
      fullDescription: "",
    });

    setErrors({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">Organization Event Schedule</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 hover:cursor-pointer"
        >
          Create Event
        </button>
      </div>
      <div
        className={`calendar-container ${
          isModalOpen || isCreateModalOpen ? "calendar-blurred" : ""
        }`}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          initialDate="2025-04-01"
          events={events}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable={true}
          eventDrop={handleEventDrop}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
        />
      </div>
      {selectedEvent && (
        <Modal
          isOpen={isModalOpen}
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
              width: "450px",
              padding: "20px",
              borderRadius: "8px",
              zIndex: 1001,
            },
          }}
        >
          <p className="text-xl font-bold mb-4">{selectedEvent.title}</p>
          <p className="mb-2">
            <strong>Time:</strong> {selectedEvent.start.toLocaleString()} -{" "}
            {selectedEvent.end
              ? selectedEvent.end.toLocaleString()
              : "Not specified"}
          </p>
          <p className="mb-2">
            <strong>Event Type:</strong> {selectedEvent.eventType}
          </p>
          <p className="mb-2">
            {/* <strong>Organization:</strong> {selectedEvent.organizer} */}
          </p>
          <p className="mb-2">
            <strong>Target Audience:</strong> {selectedEvent.targetAudience}
          </p>
          <p className="mb-2">
            <strong>Location:</strong> {selectedEvent.location}
            {selectedEvent.meetingLink && (
              <span>
                <Link
                  to={selectedEvent.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 underline"
                >
                  Join Online
                </Link>
                <span className="live-dot w-3 h-3 bg-green-500 rounded-full inline-block ml-2 animate-pulse"></span>
              </span>
            )}
          </p>
          <p className="mb-2">
            <strong>Summary:</strong> {selectedEvent.summary}
          </p>
          <p className="mb-4">
            <strong>Details:</strong> {selectedEvent.fullDescription}
          </p>
          <div className="flex justify-end items-center">
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 hover:cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      <CreateEventModal
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        errors={errors}
        handleInputChange={handleInputChange}
        handleCreateEvent={handleCreateEvent}
      />
    </div>
  );
};

export default OrganizationSchedule;
