import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button, Flex,Menu,Dropdown } from 'antd';
import { EditOutlined, PlusOutlined,MoreOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import TaskCard from '../Task/TaskCard'; // Import TaskCard

const { Title, Text } = Typography;

const ColumnWrapper = styled.div`
  background-color: #f4f5f7; /* Màu nền xám nhạt cho cột */
  border-radius: 6px;
  padding: 0.8rem;
  width: 300px; /* Chiều rộng cố định cho cột */
  flex-shrink: 0; /* Ngăn cột bị co lại */
  display: flex;
  flex-direction: column;
  gap: 0.8rem; /* Khoảng cách giữa header, list và button */
`;

const ColumnHeader = styled(Flex)`
  padding-bottom: 0.5rem;
`;

const TaskListWrapper = styled.div`
  flex-grow: 1; /* Cho phép danh sách task mở rộng */
  overflow-y: auto; /* Thêm cuộn nếu nhiều task */
  max-height: calc(100vh - 250px); /* Giới hạn chiều cao (điều chỉnh nếu cần) */
  min-height: 60px; /* Chiều cao tối thiểu */
  /* Tùy chỉnh thanh cuộn nếu muốn */
   &::-webkit-scrollbar { width: 5px; }
   &::-webkit-scrollbar-track { background: #e0e0e0; border-radius: 3px;}
   &::-webkit-scrollbar-thumb { background: #b0b0b0; border-radius: 3px;}
   &::-webkit-scrollbar-thumb:hover { background: #999; }
`;

const KanbanColumn = ({ status, tasks = [],  onEditStatus,onDeleteStatus, onAddTask, onTaskClick }) => {
    const menu = (
        <Menu>
            <Menu.Item key="1" onClick={onEditStatus}>Edit Status</Menu.Item>
            <Menu.Divider />
            <Menu.Item key="2" danger onClick={onDeleteStatus}>Delete Status</Menu.Item>
        </Menu>
    );
    return (
        <ColumnWrapper>
            {/* Header Cột */}
            <ColumnHeader justify="space-between" align="center">
                <Title level={5} style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', color: '#5e6c84' }}>
                    {status.statusName} <Text type="secondary">({tasks.length})</Text>
                </Title>
                <Dropdown overlay={menu} trigger={['click']} onClick={(e) => e.stopPropagation()}>
                    <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: '#888' }} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
            </ColumnHeader>

            {/* Danh sách Task Cards */}
            <TaskListWrapper>
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onClick={()=>onTaskClick(task.id)} // Truyền hàm click xuống TaskCard
                     />
                ))}
                {/* Thêm placeholder nếu dùng DND */}
            </TaskListWrapper>

            {/* Nút thêm Task */}
            <Button
                icon={<PlusOutlined />}
                onClick={onAddTask}
                block // Nút chiếm toàn bộ chiều rộng
                type="text" // Kiểu text để ít nổi bật hơn
                style={{ textAlign: 'left', color: '#5e6c84' }}
            >
                Create task
            </Button>
        </ColumnWrapper>
    );
};

KanbanColumn.propTypes = {
    status: PropTypes.shape({
        id: PropTypes.string.isRequired,
        statusName: PropTypes.string.isRequired,
    }).isRequired,
    tasks: PropTypes.array,
    onAddTask: PropTypes.func.isRequired,
    onTaskClick: PropTypes.func.isRequired,
};

export default KanbanColumn;