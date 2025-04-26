// src/components/TaskCard/TaskCard.js
import React, { useEffect } from 'react';
import { Card, Typography, Avatar, Tooltip, Tag, Dropdown, Menu, Button, Flex, Skeleton } from 'antd';
import { UserOutlined, MoreOutlined, SubnodeOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { cancelTaskOfPhase, updateTaskOfPhase, getSubtasksOfTask } from '../../redux/project/timelineSlice';

const { Text } = Typography;

const StyledTaskCard = styled(Card)`
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
  border-radius: 5px;
  background-color: #fff;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 8px 0px;
  }

  .ant-card-body {
    padding: 0.8rem !important;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-card-header {
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: 0.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
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

const TaskCard = ({ task, onClick }) => {

  return (
    <StyledTaskCard hoverable onClick={() => onClick(task.id)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <Flex vertical gap={3}>
          <Text
            className="task-card-header"
            style={{ textDecoration: task.status?.statusName === "DONE" ? 'line-through' : 'none', color:task.status?.statusName === "DONE" ? 'gray' : 'black' }}
          >
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
      </div>

      {/* Footer: Task ID và Assignee */}
      <div className="task-card-footer">
        <span>{task.taskPlanDescription || task.id.substring(0, 6)}</span>
        <Tooltip title={task.user ? task.user.fullName : 'Unassigned'}>
          <Avatar
            size={24}
            src={task.user?.avatar}
            icon={!task.user?.avatar ? <UserOutlined /> : null}
          />
        </Tooltip>
      </div>
    </StyledTaskCard>
  );
};

export default TaskCard;
