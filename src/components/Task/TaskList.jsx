// src/components/TaskList/TaskList.js
import React from 'react';
import PropTypes from 'prop-types';
import TaskListItem from '../TaskListItem/TaskListItem';
import styled from 'styled-components';

const ListWrapper = styled.div`
  /* Add custom list wrapper styles if needed */
`;

const TaskList = ({ tasks = [] }) => {
    return (
        <ListWrapper>
            {tasks.map(task => (
                <TaskListItem key={task.id} task={task} />
            ))}
        </ListWrapper>
    );
};

TaskList.propTypes = {
    tasks: PropTypes.array,
};

export default TaskList;