import React, { useState, useMemo, useEffect } from 'react'; // Import useState and useMemo
import { Typography, Row, Col, Empty, Divider, Input, DatePicker, Space, Button, Tooltip, Modal } from 'antd'; // Import Input, DatePicker, Space
import PhaseCard from '../../components/Phase/PhaseCard';
import dayjs from 'dayjs'; // Import dayjs for date comparisons
import isBetween from 'dayjs/plugin/isBetween'; // Import isBetween plugin for overlap check
import { ExclamationCircleOutlined } from '@ant-design/icons'; // Import ExclamationCircleOutlined for confirmation dialog
import { useDispatch, useSelector } from "react-redux";
import { sendConfirmReceiveRequestThunk,getConfirmReceiveRequestByProjectThunk  } from '../../redux/project/projectSlice';
import { useParams } from 'react-router-dom';
dayjs.extend(isBetween); // Extend dayjs with the plugin
const { confirm } = Modal;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TaskOverviewTab = ({ phases = [], tasks = [] }) => {
    const { projectId } = useParams(); // Get projectId from URL params
    const dispatch = useDispatch();
    const currentConfirmRequest = useSelector(state => state.project.currentConfirmRequest);
    const [filterPhaseName, setFilterPhaseName] = useState('');
    const [filterPhaseDateRange, setFilterPhaseDateRange] = useState(null); // [startDate, endDate] or null

    // Memoize the filtered phases list
    const filteredPhases = useMemo(() => {
        let currentPhases = phases;

        // 1. Filter by Phase Name (case-insensitive)
        if (filterPhaseName.trim()) {
            currentPhases = currentPhases.filter(phase =>
                phase?.phase?.title?.toLowerCase().includes(filterPhaseName.trim().toLowerCase())
            );
        }

        // 2. Filter by Date Range (Overlap Check)
        if (filterPhaseDateRange && filterPhaseDateRange[0] && filterPhaseDateRange[1]) {
            const filterStart = filterPhaseDateRange[0].startOf('day'); // Start of the selected day
            const filterEnd = filterPhaseDateRange[1].endOf('day');     // End of the selected day

            currentPhases = currentPhases.filter(phase => {
                const phaseStart = phase?.phase?.startTime ? dayjs(phase.phase.startTime) : null;
                const phaseEnd = phase?.phase?.endTime ? dayjs(phase.phase.endTime) : null;

                if (!phaseStart) {
                    // Cannot filter phases without a start time by date
                    return false;
                }
                const phaseEffectivelyEnds = phaseEnd ? phaseEnd.endOf('day') : dayjs().add(100, 'year'); // Treat ongoing as very long end

                return phaseStart.isBefore(filterEnd) && phaseEffectivelyEnds.isAfter(filterStart);


            });
        }

        return currentPhases;
    }, [phases, filterPhaseName, filterPhaseDateRange]); // Re-run memo only if these change

    useEffect(() => {
        dispatch(getConfirmReceiveRequestByProjectThunk(projectId));
    }, [dispatch, projectId])
    // Group tasks by phaseId (this logic remains the same, using the original tasks prop)
    const tasksByPhase = useMemo(() => {
        return tasks.filter(task => !task.parentTask).reduce((acc, task) => {
            const phaseId = task.phaseId; // Or task.phase?.id
            if (!acc[phaseId]) {
                acc[phaseId] = [];
            }
            acc[phaseId].push(task);
            return acc;
        }, {});
    }, [tasks]); // Depends only on the original tasks array

    // --- Event Handlers for Filters ---
    const handlePhaseNameFilterChange = (e) => {
        setFilterPhaseName(e.target.value);
    };

    const handlePhaseDateFilterChange = (dates) => {
        setFilterPhaseDateRange(dates); // dates is [dayjsMomentStart, dayjsMomentEnd] or null
    };

    // --- Render Logic ---
    if (phases.length === 0) { // Initial check if no phases exist at all
        return <Empty description="No project phases defined yet." />;
    }
    const canNotSendConfirmReceive = useMemo(() => {
        const canNotSendConfirmReceive = phases.some(phase => phase?.phase?.status === "ACTIVE");
        return canNotSendConfirmReceive;
    }, [phases]);

    const showConfirmModal = () => {
        confirm({
            title: 'Are you sure you want to send the confirmation request?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action will notify the requester about the confirmation.',
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                dispatch(sendConfirmReceiveRequestThunk(projectId));
            },
        });
    };
   
    return (
        <div>
            <Title level={4} style={{ marginBottom: '1rem' }}>Project Phases</Title>

            {/* Filter Controls */}
            <Space style={{ padding: '1rem 0', background: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Input
                        style={{ padding: 0 }}
                        placeholder="Search phase name..."
                        value={filterPhaseName}
                        onChange={handlePhaseNameFilterChange}
                        allowClear
                    />
                    <RangePicker
                        style={{ width: '100%', padding: "0.5rem" }}
                        value={filterPhaseDateRange}
                        onChange={handlePhaseDateFilterChange}
                        format="DD/MM/YYYY"
                        placeholder={['Phase Start Date', 'Phase End Date']}
                    />
                </Space>
                {currentConfirmRequest ? (
                      <Button>View confirm request</Button>
                ): (
                    <>
                       <Tooltip
                    title={
                        canNotSendConfirmReceive
                            ? "Please end all phase of your project before send confirm receive request to requester"
                            : "Send Confirm Receive"
                    }
                    placement="top"
                    arrowPointAtCenter
                >
                    <Button
                        disabled={canNotSendConfirmReceive}
                        onClick={showConfirmModal}
                        style={{ padding: '1.2rem', backgroundColor: 'green', color: 'white' }}
                        type="primary"
                    >
                        Send Confirm Receive To Requester
                    </Button>
                </Tooltip>
                    </>
                )}
             
            </Space>

            {/* Render Filtered Phases */}
            {filteredPhases.length > 0 ? (
                filteredPhases.map((phase, index) => (
                    <React.Fragment key={phase?.phase?.id}>
                        <PhaseCard
                            phase={phase} // Pass the filtered phase object
                            // Pass tasks associated with this specific phase ID (from the original tasks grouping)
                            tasks={tasksByPhase[phase?.phase?.id] || []}
                        />
                        {index < filteredPhases.length - 1 && <Divider />}
                    </React.Fragment>
                ))
            ) : (
                // Show empty state only if filters are active and produced no results
                (filterPhaseName || filterPhaseDateRange) ? (
                    <Empty description="No phases match the current filters." />
                ) : (
                    // This case should ideally not be reached if initial check passes,
                    // but included for robustness if phases array becomes empty after initial load
                    <Empty description="No project phases found." />
                )
            )}
        </div>
    );
};

export default TaskOverviewTab;