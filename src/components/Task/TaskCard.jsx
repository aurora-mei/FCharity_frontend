// src/components/TaskCard/TaskCard.js
import React from 'react';
import { Card, Typography, Avatar, Tooltip, Tag, Dropdown, Menu, Button,Flex } from 'antd';
import { UserOutlined, MoreOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { useSelector,useDispatch } from 'react-redux';
import { cancelTaskOfPhase,updateTaskOfPhase } from '../../redux/project/timelineSlice';
const { Text } = Typography;
const StyledTaskCard = styled(Card)`
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
  border-radius: 5px;
  background-color: #fff; // Nền trắng cho card

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 8px 0px;
  }

  .ant-card-body {
    padding: 0.8rem !important;
    display: flex;
    flex-direction: column;
    gap: 0.5rem; /* Khoảng cách giữa các dòng */
  }

  .task-card-header {
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: 0.25rem; /* Khoảng cách nhỏ dưới tên task */
    /* Có thể thêm giới hạn dòng nếu cần */
     display: -webkit-box;
     -webkit-line-clamp: 2; /* Giới hạn 2 dòng */
     -webkit-box-orient: vertical;
     overflow: hidden;
     text-overflow: ellipsis;
  }

  .task-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #888;
  }
`;

const TaskLabel = styled(Tag)`
    margin-right: 0 !important; // Bỏ margin mặc định của Tag
    font-size: 0.75rem;
    padding: 1px 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px; // Giới hạn chiều rộng label
`;


const TaskCard = ({ task, onClick }) => {
    const dispatch  = useDispatch();
    const currentUser = useSelector((state) => state.auth.currentUser);
    const menu = (
        <Menu>
            <Menu.Item key="1" onClick={()=>dispatch(updateTaskOfPhase({taskId:task.id, taskData:{ userId: currentUser.id }}))}>Assign to me</Menu.Item>
            <Menu.Divider />
            <Menu.Item key="2" danger onClick={()=>dispatch(cancelTaskOfPhase(task.id))}>Delete Task</Menu.Item>
        </Menu>
    );

    return (
        <StyledTaskCard hoverable onClick={() => onClick(task.id)}>
            {/* Header: Tên task và nút More */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <Flex vertical gap={3}>
                    <Text className="task-card-header">
                        {task.taskName || 'Untitled Task'}
                    </Text>
                    {task.updatedAt != undefined ? (
                        <Text key="updated" type="secondary" style={{ fontSize: '0.8em' }}>
                            Updated: {dayjs(task.updatedAt).format('DD/MM/YY')}
                        </Text>
                    ) : (
                        <Text key="updated" type="secondary" style={{ fontSize: '0.8em' }}>
                            Created: {dayjs(task.createdAt).format('DD/MM/YY')}
                        </Text>
                    )}
                </Flex>
                {/* Nút More Actions (Dropdown) */}
                <Dropdown overlay={menu} trigger={['click']} onClick={(e) => e.stopPropagation()}>
                    <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: '#888' }} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
            </div>




            {/* Footer: Task ID và Assignee */}
            <div className="task-card-footer">
                <span>
                    {/* Có thể thêm icon checkbox nhỏ trước ID */}
                    {task.taskIdentifier || task.id.substring(0, 6)}
                </span>
                <Tooltip title={task.user ? task.user.fullName : 'Unassigned'}>
                    <Avatar
                        size={24}
                        src={task.user?.avatar} // Dùng optional chaining
                        icon={!task.user?.avatar ? <UserOutlined /> : null} // Icon nếu không có avatar
                    />
                </Tooltip>
            </div>
        </StyledTaskCard>
    );
};

export default TaskCard;