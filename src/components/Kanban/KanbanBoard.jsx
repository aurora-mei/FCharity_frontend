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

const KanbanBoard = ({
    tasks = [],
    statuses = [],
    onAddTaskToStatus, // Hàm để mở modal tạo task cho status cụ thể
    onAddStatus,       // Hàm để mở modal tạo status mới
    onTaskClick,       // Hàm xử lý khi click vào TaskCard
    // Thêm onTaskDrop nếu dùng DND
}) => {

    // Sắp xếp statuses theo thứ tự (nếu có)
    const sortedStatuses = [...statuses].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Nhóm tasks theo statusId
    const tasksByStatus = tasks.reduce((acc, task) => {
        const statusId = task.status?.id || 'unclassified'; // Nhóm task không có status
        if (!acc[statusId]) {
            acc[statusId] = [];
        }
        acc[statusId].push(task);
        return acc;
    }, {});

    return (
        <BoardContainer>
            {/* Render các cột Kanban */}
            {sortedStatuses.map(status => (
                <KanbanColumn
                    key={status.id}
                    status={status}
                    tasks={tasksByStatus[status.id] || []}
                    onAddTask={() => onAddTaskToStatus(status)}
                    onTaskClick={onTaskClick} // Truyền hàm click xuống
                    // Thêm props cho DND nếu cần
                />
            ))}

            {/* Nút thêm cột Status */}
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
};

export default KanbanBoard;