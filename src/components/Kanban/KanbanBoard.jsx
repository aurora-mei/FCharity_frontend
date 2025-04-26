import React, { useState, useMemo, useEffect } from 'react'; // Added useEffect
import PropTypes from 'prop-types';
import { Button, Flex, Tooltip, Space, Input, DatePicker, Empty, Typography } from 'antd'; // Added Typography
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import KanbanColumn from '../Kanban/KanbanColumn'; // Assuming this exists and displays tasks
import SortableKanbanColumn from '../Kanban/SortableKanbanColumn';
import dayjs from 'dayjs'; // Import dayjs
import isBetween from 'dayjs/plugin/isBetween'; // Import plugin

dayjs.extend(isBetween); // Extend dayjs

const { RangePicker } = DatePicker;
const { Text } = Typography; // Import Text for potential use

const BoardContainer = styled(Flex)`
  gap: 1rem;
  overflow-x: auto; /* Enable horizontal scrolling */
  padding-bottom: 1rem; /* Add padding for shadow visibility */
  align-items: flex-start; /* Align columns to the top */
  min-height: 300px; /* Ensure minimum height even when empty */
`;

const FilterWrapper = styled(Space)`
  padding: 1rem;
  background: #f9f9f9; // Light background for filter area
  border-radius: 8px;
  margin-bottom: 1rem;
  width: 100%; // Make filter section take full width
  flex-wrap: wrap; // Allow items to wrap on smaller screens
`;


const AddColumnButtonWrapper = styled.div`
  flex-shrink: 0; /* Prevent button from shrinking */
  padding-top: 5px; /* Align with column tops */
  height: fit-content; // Ensure button aligns correctly if columns vary height slightly
`;

import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

const KanbanBoard = ({
    tasks = [],
    statuses = [],
    onAddTaskToStatus,
    onAddStatus,
    onEditStatus,
    onDeleteStatus,
    onTaskClick,
    onStatusOrderChange,
}) => {
    const [statusOrder, setStatusOrder] = useState([]);
    const [filterTaskName, setFilterTaskName] = useState('');
    const [filterTaskDateRange, setFilterTaskDateRange] = useState(null);

    // Effect to initialize and manage status order
    useEffect(() => {
        const savedOrder = localStorage.getItem('kanbanStatusOrder');
        let initialOrder;
        if (savedOrder) {
            const parsedOrder = JSON.parse(savedOrder);
            const existingStatusIds = statuses.map(s => s.id);
            // Keep only IDs that still exist in the current statuses
            const filteredOrder = parsedOrder.filter(id => existingStatusIds.includes(id));
            // Find statuses that are new (not in the saved order)
            const missingStatuses = existingStatusIds.filter(id => !filteredOrder.includes(id));
            initialOrder = [...filteredOrder, ...missingStatuses];
        } else {
            // Default order if nothing is saved
            initialOrder = statuses.map(s => s.id);
        }
        setStatusOrder(initialOrder);
    }, [statuses]); // Re-run only when the statuses prop changes

    // --- Filtering Logic ---

    // 1. Get parent tasks first
    const parentTasks = useMemo(() => tasks.filter(task => !task.parentTask), [tasks]);

    // 2. Apply filters to the parent tasks
    const filteredParentTasks = useMemo(() => {
        let currentTasks = parentTasks;

        // Filter by Name
        if (filterTaskName.trim()) {
            const searchTerm = filterTaskName.trim().toLowerCase();
            currentTasks = currentTasks.filter(task =>
                task?.taskName?.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by Date Range (Overlap Check)
        if (filterTaskDateRange && filterTaskDateRange[0] && filterTaskDateRange[1]) {
            const filterStart = filterTaskDateRange[0].startOf('day');
            const filterEnd = filterTaskDateRange[1].endOf('day');

            currentTasks = currentTasks.filter(task => {
                const taskStart = task?.startTime ? dayjs(task.startTime) : null;
                const taskEnd = task?.endTime ? dayjs(task.endTime) : null;

                // A task must have at least a start time to be considered for date filtering
                if (!taskStart) return false;

                // Determine the effective end for comparison (handle ongoing tasks)
                const taskEffectivelyEnds = taskEnd ? taskEnd.endOf('day') : dayjs().add(100, 'year');

                // Check for overlap: Task starts before filter ends AND task ends after filter starts
                return taskStart.isBefore(filterEnd) && taskEffectivelyEnds.isAfter(filterStart);
            });
        }

        return currentTasks;
    }, [parentTasks, filterTaskName, filterTaskDateRange]); // Dependencies

    // 3. Group the *filtered* tasks by status
    const filteredTasksByStatus = useMemo(() => {
        return filteredParentTasks.reduce((acc, task) => {
            const statusId = task.status?.id || 'unclassified'; // Use a default key if status is missing
            if (!acc[statusId]) {
                acc[statusId] = [];
            }
            acc[statusId].push(task);
            return acc;
        }, {});
    }, [filteredParentTasks]); // Dependency: only the filtered task list

    // --- DND Setup ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }, // Slightly more distance to trigger drag
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id && over) { // Ensure 'over' exists
            const oldIndex = statusOrder.indexOf(active.id);
            const newIndex = statusOrder.indexOf(over.id);

            if (oldIndex === -1 || newIndex === -1) return; // Should not happen if IDs are correct

            const newOrder = arrayMove(statusOrder, oldIndex, newIndex);
            setStatusOrder(newOrder);
            localStorage.setItem('kanbanStatusOrder', JSON.stringify(newOrder));

            // Prepare data for saving the order (e.g., update order property)
            const updatedStatusesWithOrder = newOrder.map((id, index) => ({
                 id: id,
                 order: index // Send back the ID and its new index/order
             }));

            // Notify parent component about the order change
            onStatusOrderChange?.(updatedStatusesWithOrder); // Pass only ID and new order
        }
    };

    // --- Render Helper ---
    // Get the correctly sorted list of status objects based on statusOrder
    const sortedStatuses = useMemo(() => statusOrder
        .map(id => statuses.find(s => s.id === id))
        .filter(Boolean), // Filter out any potential undefined if a status was deleted but order wasn't updated
        [statusOrder, statuses]
    );

    // Filter change handlers
    const handleTaskNameFilterChange = (e) => {
        setFilterTaskName(e.target.value);
    };

    const handleTaskDateFilterChange = (dates) => {
        setFilterTaskDateRange(dates);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* Filter Section */}
            <FilterWrapper>
                 <Input
                   style={{padding:0}}
                     placeholder="Search task name..."
                     value={filterTaskName}
                     onChange={handleTaskNameFilterChange}
                     allowClear
                 />
                 <RangePicker
                    style={{ width: '100%',padding:"0.5rem" }}
                     value={filterTaskDateRange}
                     onChange={handleTaskDateFilterChange}
                     format="DD/MM/YYYY"
                     placeholder={['Task Start Date', 'Task End Date']}
                 />
                  {/* Optional Clear Button */}
                  {/* <Button onClick={() => { setFilterTaskName(''); setFilterTaskDateRange(null); }}>Clear Filters</Button> */}
            </FilterWrapper>

            {/* Kanban Board Area */}
            <SortableContext items={statusOrder} strategy={horizontalListSortingStrategy}>
                <BoardContainer>
                    {sortedStatuses.length > 0 ? (
                        sortedStatuses.map(status => (
                            <SortableKanbanColumn
                                key={status.id}
                                status={status}
                                // Pass the correctly filtered tasks for this specific status column
                                tasks={filteredTasksByStatus[status.id] || []}
                                onAddTask={() => onAddTaskToStatus(status)}
                                onEditStatus={() => onEditStatus(status)}
                                onDeleteStatus={() => onDeleteStatus(status.id)}
                                onTaskClick={onTaskClick}
                            />
                        ))
                    ) : (
                         // Only show this if there are genuinely no statuses defined
                         <Empty description="No status columns defined. Click 'Add Status' to create one." />
                    )}

                    {/* Show message specifically when filters result in no tasks */}
                    {/* Check if filters are active AND the filtered task list is empty */}
                    {/* {sortedStatuses.length > 0 && filteredParentTasks.length === 0 && (filterTaskName || filterTaskDateRange) && (
                        <Flex justify="center" align="center" style={{ width: '100%', minHeight: '200px' }}>
                            <Empty description="No tasks match the current filters." />
                        </Flex>
                    )} */}


                    {/* Add Column Button - Always visible if statuses are potentially addable */}
                    <AddColumnButtonWrapper>
                        <Tooltip title="Add new status column">
                            <Button
                                icon={<PlusOutlined />}
                                onClick={onAddStatus}
                                type="dashed"
                                style={{ height: '100%' }} // Make button fill height if needed
                            >
                                Add Status
                            </Button>
                        </Tooltip>
                    </AddColumnButtonWrapper>
                </BoardContainer>
            </SortableContext>
        </DndContext>
    );
};

// Updated PropTypes
KanbanBoard.propTypes = {
    tasks: PropTypes.array,
    statuses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        statusName: PropTypes.string.isRequired,
        color: PropTypes.string, // Optional color
        // order: PropTypes.number, // Order is now managed internally by statusOrder state
    })).isRequired,
    onAddTaskToStatus: PropTypes.func.isRequired, // Function to trigger adding task (passes status)
    onAddStatus: PropTypes.func.isRequired,       // Function to trigger adding a new status column
    onTaskClick: PropTypes.func.isRequired,       // Function when a task card is clicked (passes task)
    onEditStatus: PropTypes.func,                 // Function to trigger editing a status (passes status)
    onDeleteStatus: PropTypes.func,               // Function to trigger deleting a status (passes statusId)
    onStatusOrderChange: PropTypes.func,          // Callback when column order changes (passes [{id, order}, ...])
};

// Default props for safety
KanbanBoard.defaultProps = {
    tasks: [],
    statuses: [],
    onEditStatus: () => {},
    onDeleteStatus: () => {},
    onStatusOrderChange: () => {},
};

export default KanbanBoard;