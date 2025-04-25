import React from 'react';
import { Typography, Row, Col, Empty, Divider } from 'antd';
import PhaseCard from '../../components/Phase/PhaseCard'; // Import component PhaseCard
import { useSelector } from 'react-redux';
import { getTasksOfPhase } from '../../redux/project/timelineSlice';
const { Title } = Typography;

const TaskOverviewTab = ({ phases = [], tasks = [] }) => {

    if (phases.length === 0) {
        return <Empty description="No project phases defined yet." />;
    }
    console.log("Tasks in TaskOverviewTab:", tasks);
    // Nhóm tasks theo phaseId để dễ dàng truy cập
    const tasksByPhase = tasks.filter(task => !task.parentTask).reduce((acc, task) => {
        const phaseId = task.phaseId; // Hoặc task.phase?.id tùy cấu trúc data
        if (!acc[phaseId]) {
            acc[phaseId] = [];
        }
        acc[phaseId].push(task);
        return acc;
    }, {});

    return (
        <div>
            <Title level={4} style={{ marginBottom: '1rem' }}>Project Phases</Title>
            {phases.map((phase, index) => (
                <React.Fragment key={phase.id}>
                    <PhaseCard
                        phase={phase}
                        tasks={tasksByPhase[phase.id] || []} // Truyền tasks của phase này vào card
                    />
                    {/* Thêm Divider giữa các phase trừ phase cuối */}
                    {index < phases.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </div>
    );
};

export default TaskOverviewTab;