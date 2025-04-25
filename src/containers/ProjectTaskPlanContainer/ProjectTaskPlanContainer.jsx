import React, { useState, useEffect } from 'react';
import { Tabs, Spin, Alert, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

// Import các tab views
import TaskOverviewTab from '../TaskOverviewTab/TaskOverviewTab';
import TaskKanbanTab from '../TaskKanbanTab/TaskKanbanTab';
import TaskCalendarTab from '../TaskCalendarTab/TaskCalendarTab';
import TaskDetailModal from '../../components/Task/TaskDetailModal'; // Import modal chi tiết task
// Import actions (ví dụ)
import {getAllPhasesByProjectId, getAllTaskStatuses,getTasksOfProject } from '../../redux/project/timelineSlice'; // Giả sử có slice riêng
// import { fetchProjectPhases, fetchProjectTasks } from '../../redux/project/taskPlanSlice'; // Giả sử có slice riêng

const StyledContainer = styled.div`
  padding: 1rem;
  height: calc(100vh - 64px); /* Adjust height based on your layout's header */
  overflow-y: auto;
  background-color: #f0f2f5; /* Light background for the container */

   /* Style cho Tabs */
  .ant-tabs-nav {
    margin-bottom: 0px !important; /* Remove default bottom margin */
     background-color: #fff;
     padding-left: 1rem;
     border-bottom: 1px solid #f0f0f0;
  }
   .ant-tabs-tab {
     padding: 12px 16px !important;
   }
   .ant-tabs-content-holder {
      background-color: #f0f2f5; /* Background for tab content area */
       padding: 1rem; /* Add padding around tab content */
   }
`;

const ProjectTaskPlanContainer = () => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('overview'); // Tab mặc định
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Lấy dữ liệu từ Redux (ví dụ) ---
    const phases = useSelector((state) => state.timeline.phases);
    const currentPhase = useSelector((state) => state.timeline.currentPhase);
    const currentTask = useSelector((state) => state.timeline.currentTask);
    const tasks = useSelector((state) => state.timeline.tasks);
    const statuses = useSelector((state) => state.timeline.taskStatuses);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    const handleOpenTaskDetail = (taskId) => {
        console.log("Opening detail for task ID:", taskId);
        setSelectedTaskId(taskId);
        setIsDetailModalOpen(true);
    };
    // *** HÀM ĐÓNG MODAL ***
    const handleCloseTaskDetail = () => {
        setIsDetailModalOpen(false);
        setSelectedTaskId(null); // Reset ID khi đóng
    };
    useEffect(() => {
        setLoading(true);
        setError(null);
        // Gọi API hoặc dispatch action để lấy dữ liệu
        Promise.all([
            dispatch(getAllPhasesByProjectId(projectId)),
            dispatch(getAllTaskStatuses(currentPhase.id)), 
            dispatch(getTasksOfProject(projectId)), // Giả sử có action này
            // Giả lập fetch
            new Promise(resolve => setTimeout(resolve, 1000))
        ]).then(() => {
            // Xử lý thành công
        }).catch(err => {
            console.error("Error fetching task plan data:", err);
            setError("Failed to load project data. Please try again.");
        }).finally(() => {
            setLoading(false);
        });
    }, [dispatch, projectId]);

    const handleTabChange = (key) => {
        setActiveTab(key);
    };
  
    const tabItems = [
        {
            key: 'overview',
            label: 'Overview',
            // Truyền hàm mở modal xuống nếu Overview cũng cần
            children: <TaskOverviewTab phases={phases} tasks={tasks} /* onViewTaskDetail={handleOpenTaskDetail} */ />,
        },
        {
            key: 'kanban',
            label: 'Kanban Board',
            // *** TRUYỀN HÀM MỞ MODAL XUỐNG KANBAN TAB ***
            children: <TaskKanbanTab
                            phases={phases}
                            tasks={tasks}
                            statuses={statuses}
                            projectId={projectId}
                            onViewTaskDetail={handleOpenTaskDetail} // Truyền hàm xử lý click
                      />,
        },
        {
            key: 'calendar',
            label: 'Calendar',
             // Truyền hàm mở modal xuống nếu Calendar cũng cần
            children: <TaskCalendarTab tasks={tasks} /* onViewTaskDetail={handleOpenTaskDetail} */ />,
        },
    ];
    console.log("ProjectTaskPlanContainer - tasks:", statuses);
    return (
        <StyledContainer>
            {/* ... (Loading, Error handling) ... */}
            {!loading && !error && (
                <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
            )}

            {/* *** RENDER MODAL Ở ĐÂY *** */}
            <TaskDetailModal
            statuses={statuses}
            phaseId={currentPhase?.id} // Truyền phaseId nếu cần
            taskId={selectedTaskId} // Truyền ID task đang chọn
                isOpen={isDetailModalOpen} 
                setIsOpen={setIsDetailModalOpen}
                projectId={projectId} // Truyền projectId nếu cần
            />
        </StyledContainer>
    );
};

export default ProjectTaskPlanContainer;