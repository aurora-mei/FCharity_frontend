import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import PropTypes from 'prop-types';
import {
  Card, Typography, Image, List, Avatar, Tooltip, Tag, Carousel, Divider, Button,
  Row, Col, Statistic, Modal, Empty, // Import necessary components
  Skeleton
} from 'antd';
import {
  ClockCircleOutlined, UserOutlined, LeftOutlined, RightOutlined,
  CheckCircleOutlined, // Icon for completed tasks
  UnorderedListOutlined, // Icon for total tasks
  InfoCircleOutlined // Icon for modal title
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';
import TaskListItem from '../Task/TaskListItem'; // Assuming path is correct
import { useDispatch, useSelector } from 'react-redux';
import { getSubtasksOfTask } from '../../redux/project/timelineSlice';

const { Title, Text, Paragraph } = Typography;

// Styled Components (kept as they are)
const StyledPhaseCard = styled(Card)`
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 4px 0px;

  .ant-card-body {
    padding: 1rem 1.5rem !important;
  }
`;

const ArrowStyle = {
  fontSize: '28px',
  color: 'white',
  textShadow: '0 0 5px rgba(0,0,0,0.6)',
  zIndex: 2,
  cursor: 'pointer',
};

// --- Helper Arrows for Carousel ---
const PrevArrow = ({ onClick }) => (
  <div onClick={onClick} style={{ ...ArrowStyle, left: 10, position: 'absolute', top: '45%' }}>
    <LeftOutlined />
  </div>
);

const NextArrow = ({ onClick }) => (
  <div onClick={onClick} style={{ ...ArrowStyle, right: 10, position: 'absolute', top: '45%' }}>
    <RightOutlined />
  </div>
);

// --- Main PhaseCard Component ---
const PhaseCard = ({ phase, tasks = [] }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]); // State for subtasks
  const dispatch = useDispatch();
  // Memoize calculations for performance, re-calculates only if 'tasks' changes
  const taskStats = useMemo(() => {
    const totalTasks = tasks.length;
    // Define what status means "completed" - adjust based on your actual status names
    const completedTasks = tasks.filter(
      task => task.status?.statusName?.toLowerCase() === 'completed' || task.status?.statusName?.toLowerCase() === 'done'
    ).length;
    return { totalTasks, completedTasks };
  }, [tasks]);

  if (!phase?.phase) return null; // More robust check for phase data

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    const [subtasks] = await Promise.all([
      dispatch(getSubtasksOfTask(task.id)).unwrap(),
    ]);
    setSubtasks(subtasks);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedTask(null); // Clear selected task when closing
  };

  // --- Media Rendering Logic (extracted for clarity) ---
  const renderMediaCarousel = () => (
    <>
      <Title level={5} style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Media Attachments</Title>
      <Carousel
        arrows={true}
        dots={true}
        style={{ width: '100%', maxHeight: "30rem", borderRadius: '8px', overflow: 'hidden' }} // Use maxHeight and overflow
        autoplay
        prevArrow={<PrevArrow />}
        nextArrow={<NextArrow />}
      >
        {phase.attachments.map((attachment, index) => {
          const isImage = /\.(jpeg|jpg|gif|png|bmp|svg)$/i.test(attachment);
          const isVideo = /\.(mp4|avi|mov|mkv|webm)$/i.test(attachment); // Added webm

          if (isImage) {
            return (
              <div key={index}>
                <Image
                  preview={false} // Disable default preview if using carousel
                  width="100%"
                  height="30rem" // Consistent height
                  src={attachment}
                  alt={`Phase attachment ${index + 1}`}
                  style={{ objectFit: 'contain', backgroundColor: '#eee', borderRadius: '8px' }} // Use contain for better visibility, add bg
                />
              </div>
            );
          } else if (isVideo) {
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30rem', backgroundColor: 'black', borderRadius: '8px' }}>
                <video
                  width="100%"
                  height="100%" // Fill the container
                  controls
                  style={{ objectFit: 'contain', borderRadius: '8px' }} // Use contain to see controls
                >
                  <source src={attachment} /* Dynamically set type if possible, otherwise rely on browser */ />
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }
          return null; // Skip unsupported file types
        })}
      </Carousel>
    </>
  );
  const renderTaskSection = () => (
    <>
      <Divider /> {/* Thêm đường kẻ phân cách nếu muốn */}
      <Title level={5} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
        Tasks in this Phase
      </Title>

      {tasks.length > 0 && ( // Chỉ hiển thị thống kê nếu có task
        <Row gutter={[16, 16]} style={{ marginBottom: '1.5rem' }}>
          <Col xs={12} sm={8} md={6}>
            <Card size="small"> {/* Bọc Statistic trong Card nhỏ */}
              <Statistic title="Total Tasks" value={taskStats.totalTasks} prefix={<UnorderedListOutlined />} valueStyle={{ fontSize: '1em' }} />
            </Card>
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Card size="small">
              <Statistic
                title="Completed"
                value={taskStats.completedTasks}
                suffix={`/ ${taskStats.totalTasks}`}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ fontSize: '1.2em', color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* --- Task List --- */}
      {tasks.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={tasks}
          style={{ height: "20rem", overflowY: "auto" }}
          renderItem={(task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onClick={handleTaskClick}
            />
          )}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tasks assigned to this phase yet." />
      )}
    </>
  );

  return (
    <StyledPhaseCard>
      {/* --- Phase Title and Time --- */}
      <Title level={4} style={{ marginBottom: '0.25rem' }}>{phase.phase.title || 'Untitled Phase'}</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '1rem' }}>
        <ClockCircleOutlined style={{ marginRight: '8px' }} />
        {dayjs(phase.phase.startTime).format('DD/MM/YYYY hh:mm A')} - {phase.phase.endTime ? dayjs(phase.phase.endTime).format('DD/MM/YYYY hh:mm A') : 'Ongoing'}
      </Text>


      {/* --- Phase Content --- */}
      {phase.phase.content && (
        <Paragraph style={{ marginBottom: '1.5rem' }}>{phase.phase.content}</Paragraph>
      )}

      {/* --- Media Attachments Carousel --- */}
      {phase.attachments && phase.attachments.length > 0 && renderMediaCarousel()}

      {/* --- Task List --- */}
      {renderTaskSection()}

      {/* --- Task Detail Modal --- */}
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined /> Task Details
          </span>
        }
        open={isModalVisible}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
        footer={[ // Example footer, customize as needed
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={600} // Adjust width as needed
      >
        {selectedTask ? (
          <div>
            <Title level={4}>{selectedTask.taskName || 'Untitled Task'}</Title>
            <p><strong>Status:</strong> <Tag color={selectedTask.status?.color || 'default'}>{selectedTask.status?.statusName || 'Unknown'}</Tag></p>
            <p><strong>Assignee:</strong> {selectedTask.user?.fullName || <Text type="secondary">Unassigned</Text>}</p>
            <p><strong>Description:</strong></p>
            <Paragraph style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
              {selectedTask.taskPlanDescription || <Text type="secondary">No description provided.</Text>}
            </Paragraph>
            <p><strong>Created:</strong> {dayjs(selectedTask.createdAt).format('DD/MM/YYYY hh:mm A')}</p>
            {selectedTask.updatedAt && <p><strong>Last Updated:</strong> {dayjs(selectedTask.updatedAt).format('DD/MM/YYYY hh:mm A')}</p>}
            <List
              itemLayout="horizontal"
              dataSource={subtasks}
              style={{ height: "20rem", overflowY: "auto" }}
              renderItem={(task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onClick={handleTaskClick}
                />
              )}
            />
          </div>
        ) : (
          <Skeleton paragraph={{ rows: 4 }} active /> // Show loading state
        )}
      </Modal>

    </StyledPhaseCard>
  );
};

PhaseCard.propTypes = {
  phase: PropTypes.shape({
    phase: PropTypes.shape({ // Ensure phase object exists
      title: PropTypes.string,
      startTime: PropTypes.string.isRequired, // Assuming string date ISO format
      endTime: PropTypes.string, // Optional end time
      content: PropTypes.string,
    }).isRequired,
    attachments: PropTypes.arrayOf(PropTypes.string), // Array of URLs
  }), // Phase can be null/undefined initially
  tasks: PropTypes.arrayOf(PropTypes.shape({ // Array of tasks matching TaskListItem's shape
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
    updatedAt: PropTypes.string,
    // IMPORTANT: Ensure the task object passed to TaskListItem has all needed fields
  })),
};

// Default props for tasks to prevent errors if undefined is passed
PhaseCard.defaultProps = {
  tasks: [],
  phase: null, // Handle cases where phase might not be loaded yet
};


export default PhaseCard;