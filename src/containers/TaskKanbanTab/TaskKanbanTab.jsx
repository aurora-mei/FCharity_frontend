import React, { useState, useEffect } from 'react';
import { Button, Typography, Flex, Card, Tooltip, Space, message, Spin } from 'antd'; // Added message
import { PlusOutlined, SettingOutlined, FlagOutlined, FileDoneOutlined } from '@ant-design/icons';
import KanbanBoard from '../../components/Kanban/KanbanBoard';
import styled from 'styled-components';
import dayjs from 'dayjs'; // Import dayjs
import PhaseModal from '../../components/Phase/PhaseModal';
// Make sure the path is correct and these actions exist and work
import { getAllPhasesByProjectId, getTasksOfProject,getAllTaskStatuses, createPhase, updatePhase, addTaskToPhase, addTaskStatus, updateTaskStatus, deleteTaskStatus } from '../../redux/project/timelineSlice';
import { fetchActiveProjectMembers } from '../../redux/project/projectSlice'; // Corrected import path assumption
import { useDispatch, useSelector } from 'react-redux';
import TaskModal from '../../components/Task/TaskModal';
import TaskStatusModal from '../../components/Task/TaskStatusModal';
const { Title, Text } = Typography;

// Styled component definition (kept as is)
const PhaseHeaderCard = styled(Card)`
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 3px 0px;

  .ant-card-body {
    padding: 1rem 1.5rem !important;
  }
`;


const TaskKanbanTab = ({ phases = [], tasks = [], statuses = [], projectId, onViewTaskDetail }) => {

    const currentPhase = useSelector((state) => state.timeline.currentPhase);
    const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
    const [editingPhaseData, setEditingPhaseData] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); // State to control TaskModal visibility
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); // State to control StatusModal visibility
    const [statusModalMode, setStatusModalMode] = useState('create'); // 'create' or 'edit'
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false); // Loading state for status submission
    const [editingStatusData, setEditingStatusData] = useState(null); // Status object for editing
    const projectMembers = useSelector((state) => state.project.projectMembers);
    const loadingTimeline = useSelector((state) => state.timeline.loading); // Loading state for timeline actions
    const loadingProject = useSelector((state) => state.project.loading); // Loading state for project actions (like fetching members)
    const dispatch = useDispatch();
    const [isSubmittingPhase, setIsSubmittingPhase] = useState(false);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false); // Separate loading for task submission
    useEffect(() => {
        // Fetch members if projectId is available and members aren't loaded
        if (projectId && (!projectMembers || projectMembers.length === 0)) {
            dispatch(fetchActiveProjectMembers(projectId));
        }
    }, [phases, projectId, dispatch]); // Removed projectMembers from dependency array to avoid potential loop if fetch modifies it

    useEffect(()=>{
        dispatch(getAllTaskStatuses(currentPhase.id));
    },dispatch,currentPhase)
    const handleEndPhase = (phaseId) => {
        console.log("TODO: End phase logic for phase ID:", phaseId);
        message.info("End Phase functionality not implemented yet.");
    };

    const handleReportPhase = (phaseId) => {
        console.log("TODO: Report phase logic for phase ID:", phaseId);
        message.info("Report Phase functionality not implemented yet.");
    };

    const handleAddTaskSubmit = async (values) => {
        if (!currentPhase?.id) {
            message.error("Cannot add task: No current phase selected.");
            return;
        }
        if (!selectedStatus?.id) {
            message.error("Cannot add task: Status information is missing.");
            return;
        }

        setIsSubmittingTask(true);
        console.log("Attempting to add task with data:", values);
        try {
            // Ensure the initial status ID is included if not directly in form values
            const taskData = {
                ...values,
                taskPlanStatusId: values.taskPlanStatusId || selectedStatus.id, // Use selectedStatus as fallback
                projectId: projectId, // Include projectId if needed by backend
                phaseId: currentPhase.id // Include phaseId if needed by backend
            };
            await dispatch(addTaskToPhase({ phaseId: currentPhase.id, taskData })).unwrap();
            setIsTaskModalOpen(false); // Close modal on success
            // Optionally: dispatch action to re-fetch tasks for the phase/project
            dispatch(getAllPhasesByProjectId(projectId)); // Re-fetch phases might re-fetch tasks if timelineSlice handles it
        } catch (error) {
            console.error("Failed to add task:", error);
        } finally {
            setIsSubmittingTask(false);
        }
    }

    const handleOpenAddTaskModal = (status) => {
        console.log("Opening task modal for status:", status);
        if (!status || !status.id) {
            message.error("Cannot determine the status to add the task to.");
            return;
        }
        setSelectedStatus(status); // Save the target status
        setIsTaskModalOpen(true); // Open the modal
    }

    const handleStatusFormSubmit = async (values) => {
        setIsSubmittingStatus(true);
        try {
            if (statusModalMode === 'create') {
                console.log('Creating status:', values); // Includes { statusName, phaseId }
                await dispatch(addTaskStatus(values))
            } else {
                console.log('Updating status:', values); // Includes { id, statusName, phaseId }
                await dispatch(updateTaskStatus(values)).unwrap(); // Adjust this line based on your action
            }
            setIsStatusModalOpen(false); // Close modal on success
            setEditingStatusData(null);
            // TODO: Refresh the list of statuses in the parent component
        } catch (error) {
            console.error('Failed to save status:', error);
        } finally {
            setIsSubmittingStatus(false);
        }
    };

    const tasksForCurrentPhase = currentPhase ? tasks.filter(task => task.phaseId === currentPhase.id) : [];
    const handleOpenCreatePhaseModal = () => {
        setEditingPhaseData(null);
        setIsPhaseModalOpen(true);
    };

    // handleOpenEditPhaseModal remains the same
    const showCreateStatusModal = () => {
        if (!currentPhase.id) {
            message.error("Cannot add status: Phase information is missing.");
            return;
        }
        setStatusModalMode('create');
        setEditingStatusData(null);
        setIsStatusModalOpen(true);
    };

    const showEditStatusModal = (status) => { // status = { id, statusName, phaseId }
        console.log("Editing status:", status);
        if (!status || !status.id || !status.phase.id) {
            message.error("Cannot edit status: Invalid status data provided.");
            return;
        }
        setStatusModalMode('edit');
        setEditingStatusData(status);
        setIsStatusModalOpen(true);
    };

    const handlePhaseFormSubmit = async (values) => {
        setIsSubmittingPhase(true);
        const phaseData = { ...values, projectId }; // Ensure projectId is included
        console.log("Submitting Phase Data:", phaseData);
        try {
            if (phaseData.id) {
                await dispatch(updatePhase(phaseData)).unwrap();
                message.success("Phase updated successfully!");
            } else {
                await dispatch(createPhase(phaseData)).unwrap();
                message.success("Phase created successfully!");
            }
            setIsPhaseModalOpen(false);
            dispatch(getAllPhasesByProjectId(projectId)); // Re-fetch phases
        } catch (error) {
            console.error("Failed to save phase:", error);
            message.error(error?.message || 'Failed to save phase.');
        } finally {
            setIsSubmittingPhase(false);
        }
    };

    // Prepare status options for TaskModal if needed (assuming statuses prop has { id, name } structure)
    const statusOptionsForModal = statuses.map(s => ({ value: s.id, label: s.statusName }));
    console.log("fff",statuses)
    return (
        // Add Spin wrapper for loading project members initially?
        <Spin spinning={loadingProject && !projectMembers}>
            {currentPhase ? (
                <>
                    <PhaseHeaderCard>
                        {/* ... Phase header content remains the same ... */}
                        <Flex justify="space-between" align="center">
                            <div>
                                <Title level={5} style={{ marginBottom: '0.25rem' }}>{currentPhase.title}</Title>
                                <Text type="secondary">
                                    {dayjs(currentPhase.startTime).format('DD/MM/YYYY')} - {currentPhase.endTime ? dayjs(currentPhase.endTime).format('DD/MM/YYYY') : 'Ongoing'}
                                </Text>
                            </div>
                            <Space>
                                <Tooltip title="End Phase">
                                    <Button
                                        icon={<FlagOutlined />}
                                        onClick={() => handleEndPhase(currentPhase.id)}
                                        disabled={!!currentPhase.endTime}
                                    >
                                        End Phase
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Report Phase">
                                    <Button
                                        icon={<FileDoneOutlined />}
                                        onClick={() => handleReportPhase(currentPhase.id)}
                                    >
                                        Report Phase
                                    </Button>
                                </Tooltip>
                            </Space>
                        </Flex>
                    </PhaseHeaderCard>

                    <KanbanBoard
                        tasks={tasksForCurrentPhase}
                        statuses={statuses}
                        // Pass the corrected handler to KanbanBoard
                        onAddTaskToStatus={handleOpenAddTaskModal}
                        onAddStatus={showCreateStatusModal}
                        onEditStatus={showEditStatusModal}
                        onDeleteStatus={(statusId) => dispatch(deleteTaskStatus(statusId))}
                        onTaskClick={onViewTaskDetail}
                    />

                    {/* Use corrected props for TaskModal */}
                    <TaskModal
                        mode="create"
                        open={isTaskModalOpen} // <-- Use 'open'
                        onCancel={() => setIsTaskModalOpen(false)} // <-- Pass the closing function
                        initialData={null}
                        onSubmit={handleAddTaskSubmit}
                        statusOptions={statusOptionsForModal} // Pass formatted statuses
                        loading={isSubmittingTask} // Use task-specific loading state
                        initStatus={selectedStatus} // Pass the status selected in Kanban
                        userOptions={projectMembers || []}
                    />
                    <TaskStatusModal
                        isOpen={isStatusModalOpen}
                        mode={statusModalMode}
                        initialData={editingStatusData}
                        loading={isSubmittingStatus}
                        onSubmit={handleStatusFormSubmit}
                        setIsOpen={setIsStatusModalOpen}
                        phaseId={currentPhase.id} // Pass the relevant phase ID
                    />
                </>
            ) : (
                // No phase view remains the same
                <Flex justify="center" align="center" style={{ flexDirection: 'column', minHeight: '300px' }}>
                    <Text>No active or upcoming phase found for the Kanban board.</Text>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreatePhaseModal}
                        style={{ marginTop: '1rem' }}
                    >
                        Create First Phase
                    </Button>
                </Flex>
            )}

            {/* PhaseModal remains the same */}
            <PhaseModal
                isOpen={isPhaseModalOpen} // Keep isOpen for PhaseModal if it uses that prop
                setIsOpen={setIsPhaseModalOpen}
                initialData={editingPhaseData}
                onFinish={handlePhaseFormSubmit}
                isLoading={isSubmittingPhase}
                projectId={projectId}
            />
        </Spin>
    );
};

export default TaskKanbanTab;