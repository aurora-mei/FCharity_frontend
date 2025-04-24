// src/components/TaskDetailModal/TaskDetailModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// *** BỎ import 'Comment' từ 'antd' ***
import { Modal, Row, Col, Typography, Button, Input, Select, DatePicker, Avatar, Tag, /*Comment,*/ List, Form, Divider, Spin, Alert, Tooltip } from 'antd';
import { CloseOutlined, LockOutlined, UserOutlined, TagOutlined, CalendarOutlined, TeamOutlined, PaperClipOutlined, SendOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // Thêm plugin cho fromNow()
dayjs.extend(relativeTime);
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ModalContentWrapper = styled.div` /* ... */ `;

const TaskDetailModal = ({ taskId, isOpen, onClose }) => {
    const [taskDetails, setTaskDetails] = useState(// Ví dụ response từ getTaskDetailsApi('task-1')
        {
          "id": "task-1",
          "phaseId": "phase-1", // ID của Phase chứa task này (nếu có)
          "taskIdentifier": "BTS-3", // Mã định danh task (ví dụ: BTS-3)
          "taskName": "(Sample) Fix Database Connection Errors",
          "taskPlanDescription": "Users are experiencing database connection errors frequently, especially during peak hours. Need to investigate connection pool settings, database credentials validity, and potential network latency issues between the application server and the database server.",
          "startTime": "2024-04-25T09:00:00Z", // ISO 8601 format (hoặc null)
          "endTime": null, // ISO 8601 format (hoặc null nếu chưa có ngày hết hạn)
          "createdAt": "2024-04-23T10:00:00Z", // Thời gian tạo
          "updatedAt": "2024-04-24T15:30:00Z", // Thời gian cập nhật cuối
          "status": { // Object chứa thông tin status
            "id": "status-inprogress",
            "name": "In Progress",
            "color": "#ffa500" // Màu sắc (tùy chọn)
          },
          "assignee": { // Object chứa thông tin người được giao (hoặc null)
            "id": "user-ab",
            "name": "An Binh",
            "avatar": "/avatars/ab.png" // Đường dẫn tới ảnh avatar
          },
          "reporter": { // Object chứa thông tin người báo cáo
            "id": "user-cd",
            "name": "Cao Thi Thanh Huyen (K18 DN)",
            "avatar": "/avatars/cd.png"
          },
          "labels": [ // Mảng các object label (hoặc mảng rỗng)
            {
              "id": "lbl-1",
              "name": "(SAMPLE) BACKEND BUGS",
              "color": "#eadeff",      // Màu nền của tag
              "textColor": "#5e4db2" // Màu chữ của tag (tùy chọn)
            },
            {
              "id": "lbl-priority-high",
              "name": "High Priority",
              "color": "#ffccc7",
              "textColor": "#a8071a"
            }
          ],
          "parentTask": null, // ID của task cha (hoặc null)
          "attachments": [ // Mảng các file đính kèm (ví dụ)
              { "id": "att-1", "fileName": "error_log.txt", "url": "/attachments/error_log.txt", "uploadedAt": "2024-04-24T10:00:00Z" },
              { "id": "att-2", "fileName": "screenshot.png", "url": "/attachments/screenshot.png", "uploadedAt": "2024-04-24T11:15:00Z" }
          ]
          // Thêm các trường khác nếu cần (ví dụ: points, estimated time, etc.)
        });
    const [comments, setComments] = useState([]); // Dữ liệu comments giả lập
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);

    const currentUser = { id: 'user-current', name: 'Current User', avatar: '/avatars/current.png' };

    // useEffect fetch data (giữ nguyên)
    useEffect(() => {
        if (isOpen && taskId) {
           // ... (logic fetch data)
            // Giả lập comments
           setComments([
               { id: 'cmt-1', author: { name: 'An Binh', avatar: '/avatars/ab.png' }, content: 'I\'ll take a look at this.', datetime: dayjs().subtract(1, 'hour') },
               { id: 'cmt-2', author: { name: 'Current User', avatar: '/avatars/current.png' }, content: 'Thanks! Let me know if you need logs.', datetime: dayjs().subtract(30, 'minute') }
           ]);
           setLoading(false); // Giả lập xong fetch
        }
    }, [isOpen, taskId]);

    const handleAddComment = () => { /* ... (logic thêm comment giữ nguyên) ... */ };
    const handleUpdateField = (fieldName, value) => { /* ... */ };
    const renderDetailItem = (label, value, editable, fieldName, editComponent) => { /* ... */ };


    return (
        <Modal /* ... props ... */ >
            {/* ... (Loading, Error, Row, Col setup) ... */}
            {!loading && !error && taskDetails && (
                 <Row gutter={0}>
                      {/* Cột chính (Trái) */}
                     <Col span={16} /* ... */ >
                         <ModalContentWrapper>
                              {/* ... (Title, Description, Attachments) ... */}

                             {/* Activity (Comments) */}
                             <div className="detail-section">
                                 <Title level={5}>Activity</Title>
                                 <Divider style={{marginTop: '0.5rem', marginBottom: '1rem'}}/>

                                 {/* Comment Input (giữ nguyên) */}
                                 {/* ... */}

                                 {/* --- SỬA PHẦN HIỂN THỊ COMMENT --- */}
                                 <List
                                     style={{marginTop: '1rem'}}
                                     dataSource={comments}
                                     itemLayout="horizontal"
                                     renderItem={item => (
                                         <List.Item>
                                             <List.Item.Meta
                                                 avatar={<Avatar src={item.author.avatar} icon={<UserOutlined />} alt={item.author.name} />}
                                                 title={ // Kết hợp tên và thời gian vào title
                                                     <Space size="small">
                                                         <a>{item.author.name}</a>
                                                         <Tooltip title={item.datetime.format('YYYY-MM-DD HH:mm:ss')}>
                                                             <Text type="secondary" style={{ fontSize: '0.8em' }}>{item.datetime.fromNow()}</Text>
                                                         </Tooltip>
                                                     </Space>
                                                 }
                                                 description={<Paragraph style={{ margin: 0 }}>{item.content}</Paragraph>} // Nội dung comment
                                             />
                                             {/* Có thể thêm actions cho comment ở đây */}
                                             {/* <div><Button type="text" size="small">Reply</Button></div> */}
                                         </List.Item>
                                     )}
                                 />
                                {/* --- KẾT THÚC SỬA ĐỔI --- */}
                             </div>
                         </ModalContentWrapper>
                     </Col>
                     {/* Cột phụ (Phải) - Giữ nguyên */}
                     <Col span={8} /* ... */ >{/* ... */}</Col>
                 </Row>
            )}
             {/* ... (Phần xử lý lỗi/không có data) ... */}
        </Modal>
    );
};

TaskDetailModal.propTypes = { /* ... */ };

export default TaskDetailModal;