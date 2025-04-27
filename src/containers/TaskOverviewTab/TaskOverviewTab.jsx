import React, { useState, useMemo, useEffect } from 'react';
import {
    Typography, Row, Col, Empty, Divider, Input, DatePicker, Space, Button, Tooltip, Modal
} from 'antd';
import PhaseCard from '../../components/Phase/PhaseCard'; // Ensure this path is correct
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import {
    sendConfirmReceiveRequestThunk,
    getConfirmReceiveRequestByProjectThunk,
    setCurrentConfirmRequest // Assume you have this action to open the detail modal
} from '../../redux/project/projectSlice'; // Ensure this path is correct
import { useParams } from 'react-router-dom';

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetween);

const { confirm } = Modal;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TaskOverviewTab = ({ phases = [], tasks = [] }) => {
    const { projectId } = useParams(); // Get projectId from URL params
    const dispatch = useDispatch();

    // --- Redux State ---
    // Get the current confirm request state for this project from the Redux store
    const currentConfirmRequest = useSelector(state => state.project.currentConfirmRequest); // Assuming storage by projectId
    const currentProject = useSelector(state => state.project.currentProject); // Assuming you have this in your Redux store
    // --- Local State ---
    const [filterPhaseName, setFilterPhaseName] = useState('');
    const [filterPhaseDateRange, setFilterPhaseDateRange] = useState(null); // [startDate, endDate] or null
    const [isViewConfirmModalVisible, setIsViewConfirmModalVisible] = useState(false); // State for the view details modal
    const currentUser = useSelector(state => state.auth.currentUser); // Assuming you have this in your Redux store
    // --- Fetch Data Effect ---
    useEffect(() => {
        // Only fetch if projectId exists
        if (projectId) {
            dispatch(getConfirmReceiveRequestByProjectThunk(projectId));
        }
        // Dependency array ensures the effect runs when dispatch or projectId changes
    }, [dispatch, projectId]);

    // --- Memoized Calculations ---

    // Filter the phases list based on name and date range filters
    const filteredPhases = useMemo(() => {
        let currentPhases = Array.isArray(phases) ? phases : [];

        // 1. Filter by Phase Name (case-insensitive)
        if (filterPhaseName.trim()) {
            const searchTerm = filterPhaseName.trim().toLowerCase();
            currentPhases = currentPhases.filter(phase =>
                phase?.phase?.title?.toLowerCase().includes(searchTerm)
            );
        }

        // 2. Filter by Date Range (Overlap Check)
        if (filterPhaseDateRange && filterPhaseDateRange[0] && filterPhaseDateRange[1]) {
            const filterStart = filterPhaseDateRange[0].startOf('day'); // Start of the selected day
            const filterEnd = filterPhaseDateRange[1].endOf('day');     // End of the selected day

            currentPhases = currentPhases.filter(phase => {
                // Skip if phase is invalid
                if (!phase?.phase) return false;

                const phaseStart = phase.phase.startTime ? dayjs(phase.phase.startTime) : null;
                const phaseEnd = phase.phase.endTime ? dayjs(phase.phase.endTime) : null;

                // If no start date, cannot filter by date
                if (!phaseStart) return false;

                // If no end date, treat it as indefinitely long for overlap check
                const phaseEffectivelyEnds = phaseEnd ? phaseEnd.endOf('day') : dayjs().add(100, 'year');

                // Overlap check: phase starts before filter ends AND phase ends after filter starts
                return phaseStart.isBefore(filterEnd) && phaseEffectivelyEnds.isAfter(filterStart);
            });
        }

        return currentPhases;
        // Re-run memo only if phases, filterPhaseName, or filterPhaseDateRange change
    }, [phases, filterPhaseName, filterPhaseDateRange]);

    // Group tasks by phaseId (including only root tasks, not subtasks)
    const tasksByPhase = useMemo(() => {
        const validTasks = Array.isArray(tasks) ? tasks : [];
        // Filter out parentTask and group by phaseId
        return validTasks.filter(task => !task.parentTask).reduce((acc, task) => {
            const phaseId = task.phaseId; // Or task.phase?.id depending on data structure
            if (phaseId) { // Only add if phaseId exists
                 if (!acc[phaseId]) {
                    acc[phaseId] = [];
                }
                acc[phaseId].push(task);
            }
            return acc;
        }, {});
        // Depends only on the original tasks array
    }, [tasks]);

    // Check if any phase is currently ACTIVE (to disable the Send Confirm button)
    const canNotSendConfirmReceive = useMemo(() => {
        const validPhases = Array.isArray(phases) ? phases : [];
        // Returns true if at least one phase has status "ACTIVE"
        return validPhases.some(phase => phase?.phase?.status === "ACTIVE");
        // Depends only on the original phases array
    }, [phases]);

    // --- Event Handlers ---
    const handlePhaseNameFilterChange = (e) => {
        setFilterPhaseName(e.target.value);
    };

    const handlePhaseDateFilterChange = (dates) => {
        // dates is [dayjsObjectStart, dayjsObjectEnd] or null
        setFilterPhaseDateRange(dates);
    };

    // Show confirmation modal before sending the request
    const showConfirmSendModal = () => {
        confirm({
            title: 'Are you sure you want to send the confirmation request?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action will notify the requester to confirm project completion.',
            okText: 'Send Request',
            cancelText: 'Cancel',
            onOk() {
                console.log('Dispatching sendConfirmReceiveRequestThunk for projectId:', projectId);
                if (projectId) {
                    dispatch(sendConfirmReceiveRequestThunk(projectId))
                        .unwrap() // Use unwrap to catch potential errors
                        .then(() => {
                            console.log("Confirm request sent successfully.");
                            // Optional: Re-fetch or update local state if needed
                        })
                        .catch(err => {
                            console.error("Failed to send confirm request:", err);
                            // Optional: Show error message to user
                        });
                } else {
                     console.error("Cannot send confirm request: Project ID is missing.");
                }
            },
            onCancel() {
                console.log('Send confirm request cancelled.');
            },
        });
    };

    // Open the modal to view confirm request details
    const handleViewConfirmRequest = () => {
        if (currentConfirmRequest) {
            // Optional: Dispatch action to set the current request in detail modal state if needed
            // dispatch(setCurrentConfirmRequest(currentConfirmRequest));
            setIsViewConfirmModalVisible(true);
        }
    };

    // --- Render Logic ---

    // Case where no phases are defined initially
    if (!Array.isArray(phases) || phases.length === 0) {
        return <Empty description="No phases have been defined for this project yet." style={{ marginTop: '2rem' }} />;
    }
    console.log("currentConfirmRequest",currentConfirmRequest)
    return (
        <div style={{ padding: '1rem' }}>
            <Title level={4} style={{ marginBottom: '1rem' }}>Project Phases</Title>

            {/* Filter Controls */}
            <Space wrap
                style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    background: '#fff', // White background for filter bar
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)', // Add light shadow
                    width: '100%'
                }}
            >
                {/* Filter Section */}
                <Space wrap>
                    <Input
                    style={{padding:0}}
                        placeholder="Search by phase name..."
                        value={filterPhaseName}
                        onChange={handlePhaseNameFilterChange}
                        allowClear
                    />
                    <RangePicker
                        value={filterPhaseDateRange}
                        onChange={handlePhaseDateFilterChange}
                        format="DD/MM/YYYY"
                        placeholder={['Start Date', 'End Date']}
                        style={{ minWidth: '240px',padding:"0.6rem" }} // Set minimum width
                    />
                </Space>

                {currentProject && currentProject.project.leader.id === currentUser.id &&(
                    <Space>
                    {currentConfirmRequest ? (
                        <Button
                            onClick={handleViewConfirmRequest}
                            type="primary" // Or other style as desired
                            style={{ padding: '0 1.5rem', height: 'auto', lineHeight: '2.5' }} // Adjust padding/height
                        >
                            View Confirmation Request
                        </Button>
                    ) : (
                        <Tooltip
                            title={
                                canNotSendConfirmReceive
                                    ? "Please complete all phases before sending the confirmation request."
                                    : "Send completion confirmation request to the requester."
                            }
                            placement="top"
                        >
                            {/* Wrap Button in div for Tooltip to work when Button is disabled */}
                            <div style={{ display: 'inline-block', cursor: canNotSendConfirmReceive ? 'not-allowed' : 'pointer' }}>
                                <Button
                                    disabled={canNotSendConfirmReceive}
                                    onClick={showConfirmSendModal}
                                    style={{
                                        backgroundColor: canNotSendConfirmReceive ? '#f5f5f5' : 'green', // Background color when disabled/enabled
                                        color: canNotSendConfirmReceive ? 'rgba(0, 0, 0, 0.25)' : 'white',    // Text color when disabled/enabled
                                        borderColor: canNotSendConfirmReceive ? '#d9d9d9' : 'green', // Border color when disabled/enabled
                                        padding: '0 1.5rem', // Increase horizontal padding
                                        height: 'auto',       // Auto height based on content
                                        lineHeight: '2.5', // Adjust line-height for aesthetics
                                        pointerEvents: canNotSendConfirmReceive ? 'none' : 'auto' // Important for Tooltip to work correctly
                                    }}
                                    type="primary" // Keep type primary for basic effect
                                >
                                    Send Confirmation to Requester
                                </Button>
                            </div>
                        </Tooltip>
                    )}
                </Space>
                )}
            </Space>

            {/* Render Filtered Phases */}
            {filteredPhases.length > 0 ? (
                filteredPhases.map((phase, index) => (
                    // Use React.Fragment to avoid creating unnecessary div tags
                    <React.Fragment key={phase?.phase?.id ?? `phase-${index}`}>
                        <PhaseCard
                            phase={phase} // Pass the filtered phase object
                            // Pass tasks corresponding to this phase ID (from the original task grouping)
                            tasks={tasksByPhase[phase?.phase?.id] || []}
                        />
                        {/* Add Divider between PhaseCards, except for the last one */}
                        {index < filteredPhases.length - 1 && <Divider />}
                    </React.Fragment>
                ))
            ) : (
                // Show Empty state if filters are active and yield no results
                (filterPhaseName || filterPhaseDateRange) ? (
                    <Empty description="No phases found matching the current filters." style={{ marginTop: '2rem' }} />
                ) : (
                    // This case is unlikely if the initial check passed, but included for robustness
                    <Empty description="No phases found for the project." style={{ marginTop: '2rem' }}/>
                )
            )}

            {/* Modal to view Confirm Request details */}
            <Modal
                title="Confirmation Request Details"
                open={isViewConfirmModalVisible}
                onCancel={() => setIsViewConfirmModalVisible(false)}
                footer={null} // No default footer needed if only displaying information
                width={600} // Customize width
            >
                {currentConfirmRequest ? (
                    <div>
                        <p><strong>Request ID:</strong> {currentConfirmRequest.requestName}</p>
                        <p><strong>Status:</strong> {currentConfirmRequest.isConfirmed ? 'Confirmed' : 'Not Confirmed'}</p>
                        <p><strong>Note:</strong> {currentConfirmRequest.note || 'None'}</p>
                        <p><strong>Creation Date:</strong> {dayjs(currentConfirmRequest.creationDate).format('DD/MM/YYYY HH:mm')}</p>
                        {!currentConfirmRequest.isConfirmed && (
                              <Button
                              disabled={canNotSendConfirmReceive}
                              onClick={showConfirmSendModal}
                              style={{
                                  backgroundColor: canNotSendConfirmReceive ? '#f5f5f5' : 'green', // Background color when disabled/enabled
                                  color: canNotSendConfirmReceive ? 'rgba(0, 0, 0, 0.25)' : 'white',    // Text color when disabled/enabled
                                  borderColor: canNotSendConfirmReceive ? '#d9d9d9' : 'green', // Border color when disabled/enabled
                                  padding: '0 1.5rem', // Increase horizontal padding
                                  height: 'auto',       // Auto height based on content
                                  lineHeight: '2.5', // Adjust line-height for aesthetics
                                  pointerEvents: canNotSendConfirmReceive ? 'none' : 'auto' // Important for Tooltip to work correctly
                              }}
                              type="primary" // Keep type primary for basic effect
                          >
                              Send Confirmation Request Again
                          </Button>
                        )}
                    </div>
                ) : (
                    <p>Could not load request details.</p>
                )}
            </Modal>
        </div>
    );
};

export default TaskOverviewTab;