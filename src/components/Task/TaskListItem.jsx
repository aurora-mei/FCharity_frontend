import React from 'react';
import PropTypes from 'prop-types';
import { List, Avatar, Tooltip, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const TaskListItem = ({ task, onClick }) => {
    return (
        <List.Item onClick={() => onClick(task)}
            actions={[
                <Tag key="status" color={task.status?.color || 'blue'}>
                    {task.status?.statusName || 'Unknown'}
                </Tag>,
                task.user ? (
                    <Tooltip key="assignee" title={`Assigned to: ${task.user.fullName}`}>
                        <Avatar size="small" src={task.user.avatar} icon={<UserOutlined />} />
                    </Tooltip>
                ) : (
                    <Avatar size="small" icon={<UserOutlined />} />
                ),
                <Text key="updated" type="secondary" style={{ fontSize: '0.8em' }}>
                    {task.updatedAt
                        ? `Updated: ${dayjs(task.updatedAt).format('DD/MM/YY hh:mm A')}`
                        : `Created: ${dayjs(task.createdAt).format('DD/MM/YY hh:mm A')}`}
                </Text>
            ]}
        >
            <List.Item.Meta
                title={<a href="#" style={{ marginTop: 0, textDecoration: task.status?.statusName === "DONE" ? 'line-through' : 'none', color: task.status?.statusName === "DONE" ? 'gray' : 'black' }}
                >{task.taskName || 'Untitled Task'}</a>}
                description={
                    <Tooltip title={task.taskPlanDescription || 'No description'}>
                        <Text ellipsis style={{ maxWidth: 400, display: 'block' }}>
                            {task.taskPlanDescription || 'No description'}
                        </Text>
                    </Tooltip>
                }
            />
        </List.Item>
    );
};

TaskListItem.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        taskName: PropTypes.string,
        taskPlanDescription: PropTypes.string,
        status: PropTypes.shape({
            statusName: PropTypes.string,
            color: PropTypes.string
        }),
        user: PropTypes.shape({
            fullName: PropTypes.string,
            avatar: PropTypes.string
        }),
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string
    }).isRequired,
};

export default TaskListItem;
