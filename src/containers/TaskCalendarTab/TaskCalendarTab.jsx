import React, { useMemo, useState, useCallback } from 'react'; // Added useState, useCallback
import { Typography, message } from 'antd'; // Added message
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'; // Import DnD addon
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Import DnD CSS (important!)
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // Optional: If dealing with timezones
import utc from 'dayjs/plugin/utc'; // Optional: If dealing with timezones
import { useDispatch, useSelector } from 'react-redux';
import { getAllPhasesByProjectId, getAllTaskStatuses, getTasksOfProject,updateTaskOfPhase  } from '../../redux/project/timelineSlice'; // Giả sử có action này
dayjs.extend(utc); // Optional
dayjs.extend(timezone); // Optional
import { useEffect } from 'react'; // Added useEffect
import { useParams } from 'react-router-dom'; // Added useParams
import TaskDetailModal from '../../components/Task/TaskDetailModal'; // Import modal chi tiết task
const { Title } = Typography;

const DnDCalendar = withDragAndDrop(Calendar);

const TaskCalendarTab = ({ tasks = [] }) => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // --- State ---
    const statuses = useSelector((state) => state.timeline.taskStatuses);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    // --- Memos and Effects ---
    const localizer = useMemo(() => dayjsLocalizer(dayjs), []);

    useMemo(() => {
        const mappedEvents = tasks
            .map(task => {
                let start = task.startTime ? dayjs(task.startTime).toDate() : null;
                let end = task.endTime ? dayjs(task.endTime).toDate() : null;

                // Handle missing dates for display purposes
                if (start && !end) {
                    end = dayjs(start).add(1, 'hour').toDate(); // Default duration 1 hour
                } else if (!start && end) {
                    // If only end time, default start to 1 hour before (adjust as needed)
                    start = dayjs(end).subtract(1, 'hour').toDate();
                } else if (!start && !end) {
                    return null; // Cannot display if no dates are present
                }

                // Ensure end is after start for valid display
                if (start && end && dayjs(start).isAfter(dayjs(end))) {
                    // Option: Set end to start + default duration (safer)
                    end = dayjs(start).add(1, 'hour').toDate();
                    console.warn(`Task "${task.taskName}" (ID: ${task.id}) has start time after end time. Adjusted end time for display.`);
                }


                return {
                    id: task.id, // Use task id
                    title: task.taskName,
                    start: start,
                    end: end,
                    allDay: false, // Assuming tasks with times are not all-day
                    resource: task, // Keep original task data attached
                };
            })
            .filter(event => event !== null && event.start && event.end); // Filter out invalid events

        setCalendarEvents(mappedEvents);
    }, [tasks]); // Rerun when tasks prop changes
    useEffect(() => {
        setLoading(true);
        setError(null);
        // Gọi API hoặc dispatch action để lấy dữ liệu
        Promise.all([
            dispatch(getAllPhasesByProjectId(projectId)),
            dispatch(getAllTaskStatuses(projectId)),
            dispatch(getTasksOfProject(projectId)), // Giả sử có action này
            // Giả lập fetch
            new Promise(resolve => setTimeout(resolve, 1000))
        ]).then(() => {
            // Xử lý thành công
        }).catch(err => {
            console.error("Error fetching task plan data:", err);
            setError("Failed to load project data. Please try again.");
        }).finally(() => {
            setLoading(false);
        });
    }, [dispatch, projectId]);

    const handleUpdateTaskField = async (taskIdToUpdate, startTime, endTime, oldUserId) => {
        console.log(`Updating task ${taskIdToUpdate}: startTime = ${startTime}`);
        console.log(`Updating task ${taskIdToUpdate}: endTime = ${endTime}`);
        const taskData = { 
            "startTime":startTime,
            "endTime":endTime
        };
        if (oldUserId) {
            taskData.userId = oldUserId;
        }
        dispatch(updateTaskOfPhase({ taskId: taskIdToUpdate, taskData }));
    }
    // --- Event Handlers ---

    // Fired when an event is selected (clicked)
    const handleSelectEvent = useCallback((event) => {
        console.log("Opening detail for task ID:", event.id);
        setSelectedTaskId(event.id);
        setIsDetailModalOpen(true);
    }, []);

    const handleEventDrop = useCallback(({ event, start, end }) => {
        console.log(`Task "${event.title}" (ID: ${event.id}) dropped. New start: ${start}, New end: ${end}`);
        console.log("evne",event)
        handleUpdateTaskField(event.id, dayjs(start).toISOString(),dayjs(end).toISOString(), event?.resource?.user?.id||null);
        setCalendarEvents(prevEvents => {
            return prevEvents.map(ev =>
                ev.id === event.id
                    ? { ...ev, start, end } // Update start and end times
                    : ev
            );
        });
        // message.success(`Moved "${event.title}"`);

    }, []); 

    const handleEventResize = useCallback(({ event, start, end }) => {
        console.log(`Task "${event.title}" (ID: ${event.id}) resized. New start: ${start}, New end: ${end}`);
        handleUpdateTaskField(event.id, dayjs(start).toISOString(),dayjs(end).toISOString(), event?.resource?.user?.id||null);
        setCalendarEvents(prevEvents => {
            return prevEvents.map(ev =>
                ev.id === event.id
                    ? { ...ev, start, end }
                    : ev
            );
        });

        // message.success(`Resized "${event.title}"`);

    }, []); // Add dependencies if needed

    // --- Styling ---

    // Function to apply custom styles to each event
    const eventStyleGetter = useCallback((event, start, end, isSelected) => {
        const style = {
            backgroundColor: '#e6f7ff', // Light blue background
            borderRadius: '5px',
            opacity: 0.9,
            color: '#1d39c4', // Darker blue text color for contrast
            border: '1px solid #91d5ff', // Slightly darker blue border
            display: 'block',
            cursor: 'pointer', // Indicate interactivity
        };

        // Optionally change style when selected
        if (isSelected) {
            style.backgroundColor = '#91d5ff'; // Darker blue when selected
            style.color = '#fff';
            style.border = '1px solid #1d39c4';
        }

        return {
            style: style,
        };
    }, []);

    // --- Render ---
    return (
        <div>
            <Title level={4} style={{ marginBottom: '1rem' }}>Project Calendar</Title>
            <div style={{ height: '600px', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <DnDCalendar // Use the DnDCalendar component
                    localizer={localizer}
                    events={calendarEvents} // Use the local state for events
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK} // Default view
                    views={['week', 'day', 'month']} // Allowed views
                    selectable // Allows clicking/dragging on empty slots (optional)
                    resizable // Allows resizing events
                    onSelectEvent={handleSelectEvent} // Handle event clicks
                    onEventDrop={handleEventDrop} // Handle event drag & drop
                    onEventResize={handleEventResize} // Handle event resize
                    eventPropGetter={eventStyleGetter}
                    style={{ height: '100%' }}
                    tooltipAccessor={(event) => `${event.title}\n${dayjs(event.start).format('HH:mm')} - ${dayjs(event.end).format('HH:mm')}`} // Custom tooltip on hover
                />
            </div>
            <TaskDetailModal
                statuses={statuses}
                taskId={selectedTaskId} // Truyền ID task đang chọn
                isOpen={isDetailModalOpen}
                setIsOpen={setIsDetailModalOpen}
                projectId={projectId} // Truyền projectId nếu cần
            />
        </div>
    );
};

export default TaskCalendarTab;