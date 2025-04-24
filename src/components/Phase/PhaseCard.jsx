import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Image, List, Avatar, Tooltip, Tag } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styled from 'styled-components';
import TaskListItem from '../Task/TaskListItem'; // Component hiển thị từng task trong list

const { Title, Text, Paragraph } = Typography;

const StyledPhaseCard = styled(Card)`
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 1.5rem; /* Thêm margin nếu không dùng Divider */
  box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 4px 0px;

  .ant-card-body {
    padding: 1rem 1.5rem !important;
  }
`;

const ImagePreviewContainer = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const PhaseCard = ({ phase, tasks = [] }) => {
    if (!phase) return null;

    return (
        <StyledPhaseCard>
            {/* Tiêu đề và thời gian Phase */}
            <Title level={5}>{phase.title || 'Untitled Phase'}</Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: '0.75rem' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                {dayjs(phase.startTime).format('DD/MM/YYYY')} - {phase.endTime ? dayjs(phase.endTime).format('DD/MM/YYYY') : 'Ongoing'}
            </Text>

            {/* Nội dung Phase */}
            {phase.content && <Paragraph>{phase.content}</Paragraph>}

            {/* Hình ảnh Phase (nếu có) */}
            {phase.images && phase.images.length > 0 && (
                <ImagePreviewContainer>
                    <Image.PreviewGroup>
                        {phase.images.map((imgUrl, index) => (
                            <Image
                                key={index}
                                width={80}
                                height={60}
                                src={imgUrl}
                                alt={`Phase image ${index + 1}`}
                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                            />
                        ))}
                    </Image.PreviewGroup>
                </ImagePreviewContainer>
            )}

            {/* Danh sách Task thuộc Phase */}
            {tasks.length > 0 && (
                <>
                    <Title level={5} style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Tasks in this Phase</Title>
                    <List
                        itemLayout="horizontal"
                        dataSource={tasks}
                        renderItem={(task) => (
                            <TaskListItem task={task} /> // Sử dụng component TaskListItem
                        )}
                    />
                </>
            )}
            {tasks.length === 0 && (
                 <Text type="secondary" italic style={{display: 'block', marginTop: '1.5rem'}}>No tasks assigned to this phase yet.</Text>
            )}
        </StyledPhaseCard>
    );
};

PhaseCard.propTypes = {
    phase: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        startTime: PropTypes.string,
        endTime: PropTypes.string,
        content: PropTypes.string,
        images: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    tasks: PropTypes.array,
};

export default PhaseCard;