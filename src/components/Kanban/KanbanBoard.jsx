import React from 'react';
import PropTypes from 'prop-types';
import { Button, Flex, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import KanbanColumn from '../Kanban/KanbanColumn';

const BoardContainer = styled(Flex)`
  gap: 1rem;
  overflow-x: auto; /* Cho phép cuộn ngang nếu nhiều cột */
  padding-bottom: 1rem; /* Thêm padding dưới để không bị cắt bóng */
  align-items: flex-start; /* Căn các cột lên trên */
`;

const AddColumnButtonWrapper = styled.div`
  flex-shrink: 0; /* Ngăn nút bị co lại */
  padding-top: 5px; /* Căn chỉnh với đỉnh cột */
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
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableKanbanColumn = ({ status, ...props }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: status.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <KanbanColumn status={status} {...props} />
        </div>
    );
};

const KanbanBoard = ({
    tasks = [],
    statuses = [],
    onAddTaskToStatus,
    onAddStatus,
    onEditStatus,
    onDeleteStatus,
    onTaskClick,
    onStatusOrderChange // <- Thêm hàm callback để lưu order mới
}) => {
    const [statusOrder, setStatusOrder] = React.useState([]);

    React.useEffect(() => {
        const savedOrder = localStorage.getItem('kanbanStatusOrder');
        if (savedOrder) {
            const parsedOrder = JSON.parse(savedOrder);
            // Chỉ giữ lại các ID còn tồn tại trong props.statuses
            const filteredOrder = parsedOrder.filter(id =>
                statuses.find(s => s.id === id)
            );
            const missingStatuses = statuses
                .map(s => s.id)
                .filter(id => !filteredOrder.includes(id));
            setStatusOrder([...filteredOrder, ...missingStatuses]);
        } else {
            setStatusOrder(statuses.map(s => s.id));
        }
    }, [statuses]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = statusOrder.indexOf(active.id);
            const newIndex = statusOrder.indexOf(over.id);
            const newOrder = arrayMove(statusOrder, oldIndex, newIndex);
            setStatusOrder(newOrder);
            localStorage.setItem('kanbanStatusOrder', JSON.stringify(newOrder));

            const updatedStatuses = newOrder.map((id, index) => {
                const original = statuses.find(s => s.id === id);
                return { ...original, order: index };
            });

            onStatusOrderChange?.(updatedStatuses);
        }
    };


    const sortedStatuses = statusOrder
        .map(id => statuses.find(s => s.id === id))
        .filter(Boolean);

    const parentTasks = tasks.filter(task => !task.parentTask);
    const tasksByStatus = parentTasks.reduce((acc, task) => {
        const statusId = task.status?.id || 'unclassified';
        if (!acc[statusId]) acc[statusId] = [];
        acc[statusId].push(task);
        return acc;
    }, {});
    console.log("Tasks by status:", statuses);
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={statusOrder} strategy={horizontalListSortingStrategy}>
                <BoardContainer>
                    {sortedStatuses.map(status => (
                        <SortableKanbanColumn
                            key={status.id}
                            status={status}
                            tasks={tasksByStatus[status.id] || []}
                            onAddTask={() => onAddTaskToStatus(status)}
                            onEditStatus={() => onEditStatus(status)}
                            onDeleteStatus={() => onDeleteStatus(status.id)}
                            onTaskClick={onTaskClick}
                        />
                    ))}
                    <AddColumnButtonWrapper>
                        <Tooltip title="Add new status column">
                            <Button
                                icon={<PlusOutlined />}
                                onClick={onAddStatus}
                                type="dashed"
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


KanbanBoard.propTypes = {
    tasks: PropTypes.array,
    statuses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        statusName: PropTypes.string.isRequired,
        order: PropTypes.number,
    })).isRequired,
    onAddTaskToStatus: PropTypes.func.isRequired,
    onAddStatus: PropTypes.func.isRequired,
    onTaskClick: PropTypes.func.isRequired,
    onEditStatus: PropTypes.func,
    onDeleteStatus: PropTypes.func,
    onStatusOrderChange: PropTypes.func, // Thêm
};

export default KanbanBoard;