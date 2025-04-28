import React, { useMemo, useState, useCallback, useEffect } from 'react'; // Ensure useEffect is imported
import { Typography, message, Card, Flex, Skeleton } from 'antd';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPhasesByProjectId, getAllTaskStatuses, getTasksOfProject, updateTaskOfPhase, addTaskToPhase } from '../../redux/project/timelineSlice';
dayjs.extend(utc);
dayjs.extend(timezone);
import { fetchAllProjectMembersThunk } from '../../redux/project/projectSlice';
import { useParams } from 'react-router-dom';
import TaskDetailModal from '../../components/Task/TaskDetailModal';
import TaskModal from '../../components/Task/TaskModal';
import styled from 'styled-components';

const { Title, Text } = Typography;

const DnDCalendar = withDragAndDrop(Calendar);

const PhaseHeaderCard = styled(Card)`
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 3px 0px;

  .ant-card-body {
    padding: 1rem 1.5rem !important;
  }
`;

const ProjectMyTaskContainer = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    // calendarEvents state moved after myTasks calculation
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskStart, setNewTaskStart] = useState(null);
    const [newTaskEnd, setNewTaskEnd] = useState(null);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);

    // --- Raw Data Selection ---
    const allTasks = useSelector((state) => state.timeline.tasks);
    const currentPhase = useSelector((state) => state.timeline.currentPhase);
    const currentUser = useSelector((state) => state.auth.currentUser);
    const statuses = useSelector((state) => state.timeline.taskStatuses); // Assuming this doesn't cause issues or is memoized correctly in the slice
    const projectMembers = useSelector((state) => state.project.allProjectMembers); // Assuming this doesn't cause issues

    // --- Memoized Derived Data ---
    const myTasks = useMemo(() => {
        // Check if necessary data is available
        if (!currentUser || !currentPhase?.phase?.id || !Array.isArray(allTasks)) {
            console.log("Prerequisites for myTasks not met:", { hasUser: !!currentUser, hasPhaseId: !!currentPhase?.phase?.id, hasAllTasks: Array.isArray(allTasks) });
            return []; // Return empty array if data is missing
        }
        console.log(`Filtering tasks for user ${currentUser.id} and phase ${currentPhase.phase.id}`);
        console.log("all",allTasks)
        return allTasks.filter(task =>
            task?.user?.id === currentUser.id &&
            task.phaseId === currentPhase.phase.id
        );
    }, [allTasks, currentUser, currentPhase]); // Dependencies for the memoization
    console.log("myTasks", myTasks); // Log the filtered tasks
    const [calendarEvents, setCalendarEvents] = useState([]); // Initial state

    // --- Effect to update calendarEvents when myTasks changes ---
    useEffect(() => {
        console.log("myTasks updated, recalculating calendarEvents:", myTasks);
        const mappedEvents = myTasks
            .map(task => {
                let start = task.startTime ? dayjs(task.startTime).toDate() : null;
                let end = task.endTime ? dayjs(task.endTime).toDate() : null;

                // Basic date validation and adjustment
                if (start && !end) {
                    end = dayjs(start).add(1, 'hour').toDate(); // Default duration if only start exists
                } else if (!start && end) {
                    start = dayjs(end).subtract(1, 'hour').toDate(); // Default duration if only end exists
                } else if (!start && !end) {
                    console.warn(`Task "${task.taskName}" (ID: ${task.id}) has no start or end time. Skipping.`);
                    return null; // Skip tasks without any time
                }

                // Ensure start is not after end
                if (start && end && dayjs(start).isAfter(dayjs(end))) {
                    end = dayjs(start).add(1, 'hour').toDate();
                    console.warn(`Task "${task.taskName}" (ID: ${task.id}) has start time after end time. Adjusted end time.`);
                }

                return {
                    id: task.id,
                    title: task.taskName,
                    start: start,
                    end: end,
                    allDay: false, // Or determine based on task data if needed
                    resource: task, // Include original task data
                };
            })
            .filter(event => event !== null && event.start && event.end); // Ensure valid events

        console.log("Mapped Calendar Events:", mappedEvents);
        setCalendarEvents(mappedEvents);
    }, [myTasks]); // Dependency: only recalculate when myTasks changes


    const localizer = useMemo(() => dayjsLocalizer(dayjs), []);

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!projectId) return; // Don't fetch if projectId is missing

        setLoading(true);
        setError(null);
        console.log("Fetching data for project:", projectId);

        const fetchData = async () => {
            try {
                // Fetch common data first
                await Promise.all([
                    dispatch(getAllPhasesByProjectId(projectId)),
                    dispatch(getTasksOfProject(projectId)),
                    dispatch(fetchAllProjectMembersThunk(projectId)),
                   
                ]);

                if (currentPhase?.phase?.id) {
                    console.log("Fetching statuses for phase:", currentPhase.phase.id);
                    await dispatch(getAllTaskStatuses(currentPhase.phase.id));
                } else {
                    console.log("No current phase selected, skipping phase-specific status fetch initially.");
                }

                console.log("Data fetching complete.");

            } catch (err) {
                console.error("Error fetching task plan data:", err);
                setError("Failed to load project data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

         }, [dispatch, projectId]);

    // --- Event Handlers (Callbacks are good for performance) ---
    const handleUpdateTaskField = useCallback(async (taskIdToUpdate, startTime, endTime, oldUserId) => {
        const taskData = {
            startTime: dayjs(startTime).toISOString(),
            endTime: dayjs(endTime).toISOString(),
            ...(oldUserId && { userId: oldUserId })
        };
        console.log("Updating task:", taskIdToUpdate, taskData);
        try {
            await dispatch(updateTaskOfPhase({ taskId: taskIdToUpdate, taskData })).unwrap();
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    }, [dispatch]); // Dependency: dispatch

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

    const handleSelectEvent = useCallback((event) => {
        console.log("Event selected:", event);
        setSelectedTaskId(event.id);
        setIsDetailModalOpen(true);
    }, []); // No dependencies needed if only setting state

    const handleEventDrop = useCallback(({ event, start, end }) => {
        console.log("Event dropped:", event.id, start, end);
        // Pass the original user ID from the event's resource
        handleUpdateTaskField(event.id, start, end, event?.resource?.userId || null);
        // Optimistic UI update (commented out - rely on Redux update cycle)
        setCalendarEvents(prevEvents => prevEvents.map(ev =>
            ev.id === event.id ? { ...ev, start, end } : ev
        ));
    }, [handleUpdateTaskField]); // Dependency: the update handler

    const handleEventResize = useCallback(({ event, start, end }) => {
        console.log("Event resized:", event.id, start, end);
        // Pass the original user ID from the event's resource
        handleUpdateTaskField(event.id, start, end, event?.resource?.userId || null);
        // Optimistic UI update (commented out - rely on Redux update cycle)
        setCalendarEvents(prevEvents => prevEvents.map(ev =>
            ev.id === event.id ? { ...ev, start, end } : ev
        ));
    }, [handleUpdateTaskField]); // Dependency: the update handler

    const handleOpenAddTaskModal = useCallback((slotInfo) => {
        console.log("Slot selected:", slotInfo);
        const start = dayjs(slotInfo.start);
        const end = dayjs(slotInfo.end);
        setNewTaskStart(start.toDate());
        setNewTaskEnd(start.isSame(end) ? start.add(1, 'hour').toDate() : end.toDate());
        setIsTaskModalOpen(true);
    }, []); // No dependencies needed

    const handleAddTaskSubmit = useCallback(async (values) => {
        if (!currentPhase?.phase?.id) {
            message.error("Cannot add task: No current phase selected.");
            console.error("Add Task Error: Missing currentPhase.phase.id");
            return;
        }
        const defaultStatusId = statuses?.[0]?.id;
        if (!values.taskPlanStatusId && !defaultStatusId) {
            message.error("Cannot add task: No status selected and no default status available.");
            console.error("Add Task Error: Missing status ID");
            return;
        }

        setIsSubmittingTask(true);
        const taskData = {
            ...values, // Includes taskName, description, userId, etc. from form
            taskPlanStatusId: values.taskPlanStatusId || defaultStatusId,
            projectId: projectId,
            phaseId: currentPhase.phase.id,
            ...(values.startTime && { startTime: dayjs(values.startTime).toISOString() }),
            ...(values.endTime && { endTime: dayjs(values.endTime).toISOString() }),
        };
        console.log("Submitting new task:", taskData);

        try {
            await dispatch(addTaskToPhase({ phaseId: currentPhase.phase.id, taskData })).unwrap();
            setIsTaskModalOpen(false);
        } catch (error) {
            console.error("Failed to add task:", error);
        } finally {
            setIsSubmittingTask(false);
        }
    }, [dispatch, projectId, currentPhase, statuses]); // Dependencies

    const statusOptionsForModal = useMemo(() => statuses.map(s => ({ value: s.id, label: s.statusName })), [statuses]);
    const userOptionsForModal = useMemo(() => projectMembers.filter(x => !x.leaveDate), // Map to value/label
        [projectMembers]);

    if (loading && calendarEvents.length === 0) { // Show loading only initially
        return <Flex justify="center" align="center" style={{ minHeight: '600px' }}>
            <Skeleton active paragraph={{ rows: 10 }} title={{ width: '30%' }} />
        </Flex>;
    }

    if (error) {
        return <Flex justify="center" align="center" style={{ minHeight: '300px' }}><Text type="danger">{error}</Text></Flex>;
    }

    return (
        <div>
            <Title level={4} style={{ marginBottom: '1rem' }}>My Tasks Calendar</Title>
            {currentPhase?.phase ? (
                <PhaseHeaderCard>
                    {/* Phase header content */}
                    <Flex justify="space-between" align="center">
                        <div>
                            <Title level={5} style={{ marginBottom: '0.25rem' }}>Current Phase: {currentPhase.phase.title}</Title>
                            <Text type="secondary">
                                {dayjs(currentPhase.phase.startTime).format('DD/MM/YYYY hh:mm A')} - {currentPhase.phase.endTime ? dayjs(currentPhase.phase.endTime).format('DD/MM/YYYY hh:mm A') : 'Ongoing'}
                            </Text>
                        </div>
                    </Flex>
                </PhaseHeaderCard>
            ) : (
                <PhaseHeaderCard>
                    <Text type="secondary">No phase selected or loaded.</Text>
                </PhaseHeaderCard>
            )}

            <div style={{ height: '700px', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <DnDCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK}
                    views={['month', 'week', 'day']} // Common views
                    selectable
                    resizable
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    onSelectSlot={handleOpenAddTaskModal}
                    eventPropGetter={eventStyleGetter}
                    style={{ height: '100%' }}
                    tooltipAccessor={(event) => `${event.title}\n(${event?.resource?.status?.statusName || 'No Status'})\n${dayjs(event.start).format('HH:mm')} - ${dayjs(event.end).format('HH:mm')}`} // Enhanced tooltip
                // Optionally set min/max times for the day view
                // min={dayjs().hour(8).minute(0).toDate()}
                // max={dayjs().hour(18).minute(0).toDate()}
                />
            </div>

            {/* Modals */}
            {isDetailModalOpen && selectedTaskId && ( // Render modal only when needed
                <TaskDetailModal
                    statuses={statuses} // Pass all statuses
                    taskId={selectedTaskId}
                    isOpen={isDetailModalOpen}
                    setIsOpen={setIsDetailModalOpen}
                    projectId={projectId}
                    phaseId={currentPhase?.phase?.id} // Pass phaseId if needed
                    userOptions={userOptionsForModal}
                />
            )}

            {isTaskModalOpen && ( // Render modal only when needed
                <TaskModal
                    mode="create"
                    open={isTaskModalOpen}
                    onCancel={() => setIsTaskModalOpen(false)}
                    // Pass initial start/end derived from slot selection
                    initialData={{ startTime: newTaskStart, endTime: newTaskEnd }}
                    onSubmit={handleAddTaskSubmit}
                    statusOptions={statusOptionsForModal} // Pass memoized options
                    loading={isSubmittingTask}
                    userOptions={userOptionsForModal} // Pass memoized options
                    // Pass phaseId explicitly if needed by modal, though submit handler uses currentPhase
                    phaseId={currentPhase?.phase?.id}
                />
            )}
        </div>
    );
};

export default ProjectMyTaskContainer;