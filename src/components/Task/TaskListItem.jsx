import React from 'react';
import PropTypes from 'prop-types';
import { List, Avatar, Tooltip, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const TaskListItem = ({ task }) => {
    return (
        <List.Item
            actions={[
                <Tag key="status" color={task.status?.color || 'blue'}>
                    {task.status?.statusName || 'Unknown'}
                </Tag>,
                task.user ? (
                    <Tooltip key="assignee" title={`Assigned to: ${task.user.fullName}`}>
                        <Avatar size="small" src={task.user.avatar} icon={<UserOutlined />} />
                    </Tooltip>
                ):(
                    <Avatar size="small" icon={<UserOutlined />} />
                ),
                task.updatedAt ? (
                    <Text key="updated" type="secondary" style={{ fontSize: '0.8em' }}>
                    Updated: {dayjs(task.updatedAt).format('DD/MM/YY hh:mm A')}
                </Text>
                ):(
                    <Text key="updated" type="secondary" style={{ fontSize: '0.8em' }}>
                    Created: {dayjs(task.createdAt).format('DD/MM/YY hh:mm A')}
                </Text>
                )
            ]}
        >
            <List.Item.Meta
                title={<a href="#">{task.taskName || 'Untitled Task'}</a>} // Link tới trang chi tiết task
                description={task.taskPlanDescription || 'No description.'}
            />
        </List.Item>
    );
};

TaskListItem.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        taskName: PropTypes.string,
        taskPlanDescription: PropTypes.string,
        status: PropTypes.shape({ name: PropTypes.string, color: PropTypes.string }),
        assignee: PropTypes.shape({ name: PropTypes.string, avatar: PropTypes.string }),
        updatedAt: PropTypes.string,
    }).isRequired,
};

export default TaskListItem;