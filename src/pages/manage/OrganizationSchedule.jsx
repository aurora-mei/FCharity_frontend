import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./organizationSchedule.css";

import CreateEventModal from "./components/CreateEventModal";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllMembersInOrganization,
  getAllUsersNotInOrganization,
  getIncludesExcludes,
  getOrganizationEvents,
  updateOrganizationEvent,
} from "../../redux/organization/organizationSlice";

import {
  showError,
  showSuccess,
  showWarning,
  showInfo,
} from "../../utils/showMessage";
import ViewEventModal from "./components/ViewEventModal";
import EditEvenModel from "./components/EditEvenModel";
import { Empty } from "antd";
import { Link } from "react-router-dom";

const OrganizationSchedule = () => {
  const dispatch = useDispatch();

  const currentRole = useSelector((state) => state.organization.currentRole);

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const organizationEvents = useSelector(
    (state) => state.organization.organizationEvents
  );

  useEffect(() => {
    if (currentOrganization) {
      dispatch(getAllMembersInOrganization(currentOrganization.organizationId));
      dispatch(
        getAllUsersNotInOrganization(currentOrganization.organizationId)
      );
      dispatch(getOrganizationEvents(currentOrganization.organizationId));
    } else {
    }
  }, [currentOrganization, dispatch]);

  useEffect(() => {
    setEvents(
      organizationEvents.map((event, index) => ({
        ...event,
        id: event.organizationEventId,
        start: event?.startTime,
        end: event?.endTime,
      }))
    );
  }, [organizationEvents, dispatch]);

  const [calendarView, setCalendarView] = useState("dayGridMonth");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [events, setEvents] = useState([]);

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
    targetAudienceGroups: [],
    summary: "",
    fullDescription: "",
  });

  console.log("Events: ", events);

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
      organizationEventId: info.event.extendedProps.organizationEventId,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      startTime: info.event.start,
      endTime: info.event.end,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      textColor: info.event.textColor,
      location: info.event.extendedProps.location,
      meetingLink: info.event.extendedProps.meetingLink,
      eventType: info.event.extendedProps.eventType,
      organizer: info.event.extendedProps.organizer,
      targetAudienceGroups: info.event.extendedProps.targetAudienceGroups,
      summary: info.event.extendedProps.summary,
      fullDescription: info.event.extendedProps.fullDescription,
    });

    setIsViewModalOpen(true);
  };

  const handleDateClick = (info) => {
    if (currentRole !== "member") {
      setCalendarView("timeGridDay");
      info.view.calendar.gotoDate(info.dateStr);

      setNewEvent({
        ...newEvent,
        start: new Date(info.dateStr),
        end: new Date(info.dateStr),
      });

      setIsCreateModalOpen(true);
    }
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
      targetAudienceGroups: info.event.extendedProps.targetAudienceGroups,
      summary: info.event.extendedProps.summary,
      fullDescription: info.event.extendedProps.fullDescription,
    };

    alert(
      `Event "${
        info.event.title
      }" has been moved to ${info.event.start.toLocaleString()}`
    );

    try {
      showInfo("Updating event...");
      const savedEvent = {
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

        targetAudienceGroups: updatedEvent.targetAudienceGroups.join(","),

        summary: updatedEvent.summary,
        fullDescription: updatedEvent.fullDescription,
      };

      dispatch(updateOrganizationEvent(savedEvent));
      showSuccess("Event updated successfully");
    } catch (error) {
      showError("Failed to update event");
    }
  };

  console.log("organization events: ", organizationEvents);
  console.log("Selected Event: ", selectedEvent);

  return (
    <div>
      {currentOrganization && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold mb-4">
              Organization Event Schedule
            </h1>
            {currentRole !== "member" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 hover:cursor-pointer"
              >
                Create Event
              </button>
            )}
          </div>
          <div
            className={`calendar-container ${
              isViewModalOpen || isCreateModalOpen || isEditModalOpen
                ? "calendar-blurred"
                : ""
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
          {isViewModalOpen && selectedEvent && (
            <ViewEventModal
              isViewModalOpen={isViewModalOpen}
              setIsViewModalOpen={setIsViewModalOpen}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              setIsEditModalOpen={setIsEditModalOpen}
            />
          )}

          {isEditModalOpen && selectedEvent && (
            <EditEvenModel
              isEditModalOpen={isEditModalOpen}
              setIsEditModalOpen={setIsEditModalOpen}
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
            />
          )}
          {isCreateModalOpen && newEvent && (
            <CreateEventModal
              isCreateModalOpen={isCreateModalOpen}
              setIsCreateModalOpen={setIsCreateModalOpen}
              newEvent={newEvent}
              setNewEvent={setNewEvent}
            />
          )}
        </div>
      )}
      {!currentOrganization && (
        <div className="p-6">
          <div className="flex justify-end items-center">
            <Link
              to="/organizations"
              className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
            >
              Discover organizations
            </Link>
          </div>
          <div className="flex justify-center items-center min-h-[500px]">
            <Empty description="You are not a member of any organization" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSchedule;
