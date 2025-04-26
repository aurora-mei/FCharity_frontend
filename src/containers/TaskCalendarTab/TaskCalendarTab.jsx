import React, { useMemo, useState, useCallback } from 'react'; // Added useState, useCallback
import { Typography, message,Card ,Flex  } from 'antd'; // Added message
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'; // Import DnD addon
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Import DnD CSS (important!)
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // Optional: If dealing with timezones
import utc from 'dayjs/plugin/utc'; // Optional: If dealing with timezones
import { useDispatch, useSelector } from 'react-redux';
import { getAllPhasesByProjectId, getAllTaskStatuses, getTasksOfProject, updateTaskOfPhase, addTaskToPhase } from '../../redux/project/timelineSlice'; // Giả sử có action này
dayjs.extend(utc); // Optional
dayjs.extend(timezone); // Optional
import { fetchAllProjectMembersThunk } from '../../redux/project/projectSlice'; // Giả sử có action này
import { useEffect } from 'react'; // Added useEffect
import { useParams } from 'react-router-dom'; // Added useParams
import TaskDetailModal from '../../components/Task/TaskDetailModal';
import TaskModal from '../../components/Task/TaskModal'; // Import modal for adding tasks
import styled from 'styled-components'; // Added styled-components
const { Title } = Typography;

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
const {Text } = Typography;
const TaskCalendarTab = ({ tasks = [], statuses = [] }) => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskStart, setNewTaskStart] = useState(null); // State for new task start time
    const [newTaskEnd, setNewTaskEnd] = useState(null); // State for new task end time
    const currentPhase = useSelector((state) => state.timeline.currentPhase);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const projectMembers = useSelector((state) => state.project.allProjectMembers);

    const localizer = useMemo(() => dayjsLocalizer(dayjs), []);

    useMemo(() => {
        const mappedEvents = tasks.filter(task => task.phaseId === currentPhase?.phase?.id)
            .map(task => {
                let start = task.startTime ? dayjs(task.startTime).toDate() : null;
                let end = task.endTime ? dayjs(task.endTime).toDate() : null;

                if (start && !end) {
                    end = dayjs(start).add(1, 'hour').toDate();
                } else if (!start && end) {
                    start = dayjs(end).subtract(1, 'hour').toDate();
                } else if (!start && !end) {
                    return null;
                }

                if (start && end && dayjs(start).isAfter(dayjs(end))) {
                    end = dayjs(start).add(1, 'hour').toDate();
                    console.warn(`Task "${task.taskName}" has start time after end time. Adjusted end time.`);
                }

                return {
                    id: task.id,
                    title: task.taskName,
                    start: start,
                    end: end,
                    allDay: false,
                    resource: task,
                };
            })
            .filter(event => event !== null && event.start && event.end);

        setCalendarEvents(mappedEvents);
    }, [tasks]);
    useEffect(() => {
        setLoading(true);
        setError(null);
        Promise.all([
            dispatch(getAllPhasesByProjectId(projectId)),
            dispatch(getAllTaskStatuses(currentPhase?.phase?.id)),
            dispatch(getTasksOfProject(projectId)),
            dispatch(fetchAllProjectMembersThunk(projectId)),
            new Promise(resolve => setTimeout(resolve, 1000))
        ]).then(() => { }).catch(err => {
            console.error("Error fetching task plan data:", err);
            setError("Failed to load project data. Please try again.");
        }).finally(() => {
            setLoading(false);
        });
    }, [dispatch, currentPhase?.phase?.id, projectId]);


    const handleUpdateTaskField = async (taskIdToUpdate, startTime, endTime, oldUserId) => {
        const taskData = {
            "startTime": startTime,
            "endTime": endTime
        };
        if (oldUserId) {
            taskData.userId = oldUserId;
        }
        dispatch(updateTaskOfPhase({ taskId: taskIdToUpdate, taskData }));
    }
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
        setSelectedTaskId(event.id);
        setIsDetailModalOpen(true);
    }, []);

    const handleEventDrop = useCallback(({ event, start, end }) => {
        handleUpdateTaskField(event.id, dayjs(start).toISOString(), dayjs(end).toISOString(), event?.resource?.user?.id || null);
        setCalendarEvents(prevEvents => prevEvents.map(ev =>
            ev.id === event.id ? { ...ev, start, end } : ev
        ));
    }, []);

    const handleEventResize = useCallback(({ event, start, end }) => {
        handleUpdateTaskField(event.id, dayjs(start).toISOString(), dayjs(end).toISOString(), event?.resource?.user?.id || null);
        setCalendarEvents(prevEvents => prevEvents.map(ev =>
            ev.id === event.id ? { ...ev, start, end } : ev
        ));
    }, []);

    const handleOpenAddTaskModal = (slotInfo) => {
        setNewTaskStart(slotInfo.start);
        setNewTaskEnd(slotInfo.end);
        setIsTaskModalOpen(true);
    };

    const handleAddTaskSubmit = async (values) => {
        if (!currentPhase?.phase?.id) {
            message.error("Cannot add task: No current phase selected.");
            return;
        }
        setIsSubmittingTask(true);
        const taskData = {
            ...values,
            taskPlanStatusId: values.taskPlanStatusId || selectedStatus.id,
            projectId: projectId,
            phaseId: currentPhase?.phase?.id
        };
        try {
            await dispatch(addTaskToPhase({ phaseId: currentPhase?.phase?.id, taskData })).unwrap();
            setIsTaskModalOpen(false); // Close modal on success
            dispatch(getAllPhasesByProjectId(projectId)); // Re-fetch phases
        } catch (error) {
            console.error("Failed to add task:", error);
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const statusOptionsForModal = statuses.map(s => ({ value: s.id, label: s.statusName }));

    return (
        <div>
            <Title level={4} style={{ marginBottom: '1rem' }}>Project Calendar</Title>
            <PhaseHeaderCard>
                {/* ... Phase header content remains the same ... */}
                <Flex justify="space-between" align="center">
                    <div>
                        <Title level={5} style={{ marginBottom: '0.25rem' }}>{currentPhase?.phase?.title}</Title>
                        <Text type="secondary">
                            {dayjs(currentPhase?.phase?.startTime).format('DD/MM/YYYY hh:mm A')} - {currentPhase?.phase?.endTime ? dayjs(currentPhase?.phase?.endTime).format('DD/MM/YYYY hh:mm A') : 'Ongoing'}
                        </Text>
                    </div>
                </Flex>
            </PhaseHeaderCard>
            <div style={{ height: '700px', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <DnDCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK}
                    views={['week', 'day', 'month']}
                    selectable
                    resizable
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                    onEventResize={handleEventResize}
                    onSelectSlot={handleOpenAddTaskModal} // Handle slot selection
                    eventPropGetter={eventStyleGetter}
                    style={{ height: '100%' }}
                    tooltipAccessor={(event) => `${event.title}\n${dayjs(event.start).format('HH:mm')} - ${dayjs(event.end).format('HH:mm')}`}
                />
            </div>
            <TaskDetailModal
                statuses={statuses}
                taskId={selectedTaskId}
                isOpen={isDetailModalOpen}
                setIsOpen={setIsDetailModalOpen}
                projectId={projectId}
            />
            <TaskModal
                mode="create"
                open={isTaskModalOpen}
                onCancel={() => setIsTaskModalOpen(false)}
                initialData={{ startTime: newTaskStart, endTime: newTaskEnd }} // Set initial data from selected slot
                onSubmit={handleAddTaskSubmit}
                statusOptions={statusOptionsForModal}
                loading={isSubmittingTask}
                userOptions={projectMembers.filter(x => !x.leaveDate)}
            />
        </div>
    );
};

export default TaskCalendarTab;