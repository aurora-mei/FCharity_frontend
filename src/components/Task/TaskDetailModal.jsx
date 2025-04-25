import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Typography, Spin, Alert,
  Skeleton
} from 'antd';
import {
  getSubtasksOfTask, getTaskById, getTasksOfProject,
  updateTaskOfPhase
} from '../../redux/project/timelineSlice';
import { fetchAllProjectMembersThunk } from '../../redux/project/projectSlice';
import { addTaskToPhase } from '../../redux/project/timelineSlice';
import TaskDetailView from './TaskDetailView';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';

const { Title, Text, Paragraph } = Typography;

const ModalContentWrapper = styled.div``;

const TaskDetailModal = ({ statuses, taskId, isOpen, setIsOpen, projectId, phaseId }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mainTask = useSelector(state => state.timeline.currentTask);
  const subtasks = useSelector(state => state.timeline.subtasks);
  const tasks = useSelector(state => state.timeline.tasks);
  const allProjectMembers = useSelector(state => state.project.allProjectMembers);

  const [currentTaskId, setCurrentTaskId] = useState(taskId);

  const fetchData = async () => {
    if (isOpen && currentTaskId && projectId) {
      setLoading(true);
      try {
        const promises = [
          dispatch(getTaskById(currentTaskId)),
          dispatch(getSubtasksOfTask(currentTaskId)),
          dispatch(getTasksOfProject(projectId)),
          dispatch(fetchAllProjectMembersThunk(projectId))
        ];
        await Promise.all(promises);

      } catch (error) {
        console.error("Failed to fetch task data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log("task",taskId)
    if (isOpen) fetchData();
  }, [isOpen, projectId]);
  useEffect(() => {
    setCurrentTaskId(taskId);
  }, [taskId]);
  
  useEffect(() => {
    if (isOpen && currentTaskId) {
      fetchData();
    }
  }, [currentTaskId]);
  
  const handleCreateSubtask = async (subtaskData) => {
    dispatch(addTaskToPhase({
      phaseId: phaseId,
      taskData: { ...subtaskData, parentTaskId: mainTask.id }
    })).then(() => {
      setCurrentTaskId(localStorage.getItem('taskId'));
      fetchData();
    }).catch((error) => {
      console.error("Error creating subtask:", error);
    });
  };

  const handleUpdateTaskField = async (taskIdToUpdate, field, value, oldUserId) => {
    console.log(`Updating task ${taskIdToUpdate}: ${field} = ${value}`);
    const taskData = { [field]: value };
    if (field !== "userId") {
      taskData.userId = oldUserId;
    }
    dispatch(updateTaskOfPhase({ taskId: taskIdToUpdate, taskData }))
      .then(() => {
        setCurrentTaskId(taskIdToUpdate);
        fetchData();
      })
      .catch(error => console.error("Error updating task:", error));
    

  }
  const handleNavigateToTask = (id) => {
    if (id && id !== currentTaskId) {
      setCurrentTaskId(id);
    }
  };

  const parentTaskName = mainTask?.parentTask?.id ? mainTask?.parentTask.taskName : null;

  return (
    <Modal open={isOpen} onCancel={() => setIsOpen(false)} footer={null} width={1000} centered>
      {loading && <Skeleton active paragraph={{ rows: 10 }} />}
      {error && <Alert message="Error" description={error.message} type="error" showIcon />}
      {!loading && !error && mainTask && (
        <TaskDetailView
          key={currentTaskId}
          taskId={currentTaskId}
          mainTask={mainTask}
          subtasks={subtasks}
          projectMembers={allProjectMembers}
          statusOptions={statuses}
          loading={loading}
          onCreateSubtask={handleCreateSubtask}
          onUpdateTaskField={handleUpdateTaskField}
          onNavigateToTask={handleNavigateToTask}
          parentTaskName={parentTaskName}
        />
      )}
      {!loading && !mainTask && <div>Task not found or failed to load.</div>}
    </Modal>
  );
};

TaskDetailModal.propTypes = {
  statuses: PropTypes.array,
  taskId: PropTypes.string,
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  projectId: PropTypes.string,
  phaseId: PropTypes.string
};

export default TaskDetailModal;
