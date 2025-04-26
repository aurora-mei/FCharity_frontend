import React, { useEffect, useState,useRef } from 'react';
import {
    Layout, Row, Col, Typography, Button, Input, Table, Avatar, Tag, DatePicker,
    Select, Tooltip, message, Tabs, Form, Empty, Descriptions, Flex, Breadcrumb,
    Progress, Space, Divider,Modal
} from 'antd';
import {
    PlusOutlined, PaperClipOutlined, LinkOutlined, SubnodeOutlined,
    UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import moment from 'moment'; // Or import dayjs if using Antd v5+ with dayjs
import { cancelTaskOfPhase } from '../../redux/project/timelineSlice';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph, Link } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { confirm } = Modal;

const getInitials = (name = '') => {
    return name.split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || <UserOutlined />;
};


const TaskDetailView = ({
    taskId,
    mainTask,
    subtasks = [],     // Array of TaskPlanResponse objects for subtasks
    projectMembers = [], // Array of members for Assignee dropdown [{ id: 'uuid', user: { fullName: '...' } }]
    statusOptions = [],  // Array of statuses for Status dropdown [{ id: 'uuid', statusName: '...' }]
    parentTaskName = '', // Optional: Name of the parent task if mainTask itself is a subtask
    loading = false,
    onCancelTask,           // Function to close this view/modal
    onCreateSubtask,   // Function(subtaskData) called when creating a new subtask
    onUpdateTaskField, // Function(taskId, field, value) called to update any field (main or subtask)
    onNavigateToTask,
}) => {
    const inputRef = useRef(null);

    const [newSubtaskName, setNewSubtaskName] = useState('');
    const [isCreatingSubtask, setIsCreatingSubtask] = useState(false); // Loading state for subtask creation
    if (!mainTask) {
        return <Empty description="Task data not available." />;
    }
    const showConfirm = (taskId) => {
        confirm({
          title: "Are you sure you want to remove this task?",
          content: "This action cannot be undone.",
          okText: "Yes, remove it",
          okType: "danger",
          cancelText: "Cancel",
          onOk() {
            onCancelTask(taskId);
          },
        });
      };
    const handleCreateSubtask = async () => {
        if (!newSubtaskName.trim()) {
            message.error("Please enter a subtask name.");
            return;
        }
        if (!onCreateSubtask) {
            message.warn("Subtask creation handler not implemented.");
            return;
        }

        setIsCreatingSubtask(true);
        try {
            const defaultStatus = statusOptions.find(s => s.statusName?.toLowerCase() === 'to do') || statusOptions[0];
            const subtaskData = {
                taskName: newSubtaskName,
                parentTaskId: mainTask.id,
                phaseId: mainTask.phaseId, // Subtask belongs to the same phase
                statusId: defaultStatus?.id, // Assign a default status ID
            };
            await onCreateSubtask(subtaskData);
            setNewSubtaskName(''); // Clear input on success
        } catch (error) {
            console.error("Subtask creation error:", error);
        } finally {
            setIsCreatingSubtask(false);
        }
    };
    // --- Handlers ---
    const handleSubtaskClick = (subtaskId) => {
        console.log("Subtask clicked:", subtaskId);
        if (onNavigateToTask && subtaskId) {
            onNavigateToTask(subtaskId);
        } else {
            console.warn("Navigation handler or subtaskId not provided");
        }
    };

    const handleParentTaskClick = () => {
        if (onNavigateToTask && mainTask.parentTask.id) {
            onNavigateToTask(mainTask.parentTask.id);
        } else {
            console.warn("Navigation handler or parentTask.id not provided");
        }
    };

    const isTaskLevel3 = mainTask?.parentTask && mainTask?.parentTask?.id !== undefined && mainTask?.parentTask?.parentTask && mainTask?.parentTask?.parentTask.id !== null;
    const subtaskColumns = [
        { // Optional: Key - if you have a way to generate/show it
            title: 'Key',
            dataIndex: 'id', // Or a specific key field if available
            key: 'key',
            width: 100,
            hidden: true, // Hide if not needed
        },
        {
            title: 'Type',
            key: 'type',
            width: 50,
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => handleSubtaskClick(record.id)}
                    style={{ padding: 0, height: 'auto', whiteSpace: 'normal', textAlign: 'left' }} // Style as needed
                    title={`View details for subtask: ${record.taskName}`} // Tooltip
                >
                    <Tooltip title="Subtask"><SubnodeOutlined style={{ color: '#42526E' }} /></Tooltip>
                </Button>
            )
        },
        {
            title: 'Summary',
            dataIndex: 'taskName',
            key: 'summary',
            render: (text, record) => (
                <Text type="primary"
                    editable={{
                        onChange: (value) => onUpdateTaskField?.(record.id, 'taskName', value, record?.user?.id || null)
                    }}
                >{text}</Text>
            )
        },
        {
            title: 'Assignee',
            dataIndex: ['user', 'fullName'], // Access nested property
            key: 'user',
            width: 150,
            render: (user, record) => (
                <Select
                    showSearch
                    allowClear
                    placeholder="Unassigned"
                    value={record.user?.id || undefined} // Use user ID for value
                    onChange={(value) => onUpdateTaskField?.(record.id, 'userId', value, null)}
                    style={{ width: '100%' }}
                    bordered={false}
                    filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    dropdownMatchSelectWidth={false}
                >
                    <Option value={null}>Unassigned</Option>
                    {projectMembers.map(member => (
                        <Option key={member.user.id} value={member.user.id}>
                            <Avatar size="small" src={member.user?.avatar} style={{ marginRight: 8 }}>
                                {getInitials(member.user?.fullName)}
                            </Avatar>
                            {member.user?.fullName}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Status',
            dataIndex: ['status', 'statusName'],
            key: 'status',
            width: 120,
            render: (statusName, record) => (
                <Select
                    value={record.status?.id} // Use status ID for value
                    onChange={(value) => onUpdateTaskField?.(record.id, 'taskPlanStatusId', value, record?.user?.id || null)}
                    style={{ width: '100%' }}
                    bordered={false}
                >
                    {statusOptions.map(statusOpt => (
                        <Option key={statusOpt.id} value={statusOpt.id}>
                            {/* Simple Tag for display within option if needed */}
                            <Tag color={statusOpt.color || 'default'} style={{ marginRight: 0 }}>{statusOpt.statusName}</Tag>
                        </Option>
                    ))}
                </Select>
            )
        },
    ];
    const handleDateChange = (field, date, dateString) => {
        if (date) {
            // Update the field with both date and time (format: YYYY-MM-DD HH:mm:ss)
            onUpdateTaskField?.(mainTask.id, field, date, mainTask?.user?.id || null);
        }
    };
    // --- Calculate Subtask Progress (Example) ---
    const completedSubtasks = subtasks.filter(st => st.status?.statusName?.toLowerCase() === 'done').length;
    const progressPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
    return (
        <Layout style={{ background: '#fff', height: 'fit-content', overflow: 'hidden' }}>

            <Layout>
                <Content style={{ padding: '24px', overflowY: 'auto', background: '#fff' }}>
                    <Title level={3}
                        style={{ marginTop: 0, textDecoration: mainTask.status?.statusName === "DONE" ? 'line-through' : 'none', color: mainTask.status?.statusName === "DONE" ? 'gray' : 'black' }}
                        editable={{ onChange: (value) => onUpdateTaskField?.(mainTask.id, 'taskName', value, mainTask?.user?.id || null) }}>
                        {mainTask.taskName}</Title>
                    <Space gap={10} style={{ marginBottom: 24 }}>
                        <Button icon={<DeleteOutlined />} onClick={() => showConfirm(mainTask.id)}>Remove task</Button>
                        {!isTaskLevel3 && (
                            <Button onClick={() => inputRef.current?.focus()}>Add subtask</Button>
                        )}
                    </Space>

                    <Descriptions title="Description" column={1} style={{ marginBottom: 24 }}>
                        <Descriptions.Item>
                            <Paragraph editable={{ onChange: (value) => onUpdateTaskField?.(mainTask.id, 'taskPlanDescription', value, mainTask?.user?.id || null) }}>
                                {mainTask.taskPlanDescription || 'Add a description...'}
                            </Paragraph>
                        </Descriptions.Item>
                    </Descriptions>

                    {!isTaskLevel3 && (
                        <div style={{ marginBottom: 24 }}>
                            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                                <Title level={5} style={{ margin: 0 }}>Child work items</Title>
                                <Space>
                                    <Button onClick={() => inputRef.current?.focus()}>Add subtask</Button>
                                </Space>
                            </Flex>
                            {subtasks.length > 0 && (
                                <Progress percent={progressPercent} size="small" style={{ marginBottom: 16 }} />
                            )}
                            <Table
                                dataSource={Array.isArray(subtasks) // 1. Check if subtasks IS an array
                                    ? [...subtasks].sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt))) // 3. Sort the COPY (descending order - latest first)
                                    : []} // Sort by task name
                                columns={subtaskColumns}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                scroll={{ y: 200 }}
                                showHeader={subtasks.length > 0} // Only show header if there are tasks
                            />
                            <Input.Group compact style={{ marginTop: 8, display: 'flex' }}>
                                <Flex gap={10} align='center' style={{ padding: '4px 11px', border: '1px solid #d9d9d9', borderRight: 0, background: '#fafafa' }}>
                                    <SubnodeOutlined /> Subtask
                                </Flex>
                                <Input
                                     ref={inputRef}
                                    style={{ flexGrow: 1 }}
                                    placeholder="What needs to be done?"
                                    value={newSubtaskName}
                                    onChange={(e) => setNewSubtaskName(e.target.value)}
                                    onPressEnter={handleCreateSubtask}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleCreateSubtask}
                                    loading={isCreatingSubtask}
                                    style={{ marginLeft: 8, height: "auto", borderRadius: "0.3rem" }} // Add some space
                                >
                                    Create
                                </Button>
                                <Button onClick={() => setNewSubtaskName('')} style={{ marginLeft: 8, height: "auto", borderRadius: "0.3rem" }}>Cancel</Button>
                            </Input.Group>
                        </div>

                    )}
                </Content>

                <Sider width={320} theme="light" style={{ padding: '24px 16px', borderLeft: '1px solid #dfe1e6', overflowY: 'auto' }}>


                    <Title level={5} style={{ marginBottom: 16 }}>Details</Title>
                    <Descriptions
                        column={1}
                        size="small"
                        labelStyle={{ color: '#5E6C84', fontWeight: 'bold', minWidth: '80px' }} // Added minWidth for alignment
                        contentStyle={{ paddingBottom: '10px' }} // Use padding instead of margin for consistency
                    >
                        <Descriptions.Item label="Assignee">
                            <Select
                                showSearch
                                allowClear
                                placeholder="Unassigned"
                                value={mainTask.user?.id ?? null} // Prefer null for "unassigned" value matching the Option
                                onChange={(value) => onUpdateTaskField?.(mainTask.id, 'userId', value, null)} // Pass null if unassigned is selected
                                style={{ width: '100%' }}
                                bordered={false}
                                disabled={loading} // Disable while loading
                                filterOption={(input, option) =>
                                    // Ensure option.children is treated safely
                                    option?.props?.children && typeof option.props.children[1] === 'string'
                                        ? option.props.children[1].toLowerCase().includes(input.toLowerCase())
                                        : false // Handle cases where children might not be as expected
                                }
                            >
                                <Option value={null}>Unassigned</Option>
                                {projectMembers.map(member => (
                                    <Option key={member.user?.id} value={member.user?.id}>
                                        <Avatar size="small" src={member.user?.avatar} style={{ marginRight: 8 }}>
                                            {getInitials(member.user?.fullName)}
                                        </Avatar>
                                        {member.user?.fullName}
                                    </Option>
                                ))}
                            </Select>
                        </Descriptions.Item>

                        {parentTaskName && (
                            <Descriptions.Item label="Parent Task">
                                <Link onClick={handleParentTaskClick}>{parentTaskName}</Link>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Status">
                            <Select
                                value={mainTask.status?.id} // Directly bind to status id
                                onChange={(value) => onUpdateTaskField?.(mainTask.id, 'taskPlanStatusId', value, mainTask?.user?.id || null)}
                                style={{ width: '100%' }}
                                bordered={false}
                                disabled={loading} // Disable while loading
                            >
                                {statusOptions.map(statusOpt => (
                                    <Option key={statusOpt.id} value={statusOpt.id}>
                                        <Tag color={statusOpt.color || 'default'} style={{ marginRight: 0 }}>
                                            {statusOpt.statusName}
                                        </Tag>
                                    </Option>
                                ))}
                            </Select>
                        </Descriptions.Item>

                        <Descriptions.Item label="Start time">
                            <DatePicker
                                value={mainTask.startTime ? dayjs(mainTask.startTime) : null}
                                onChange={(date, dateString) => handleDateChange('startTime', date, dateString)}
                                format="YYYY-MM-DD HH:mm:ss" // Adjust the format to include time
                                showTime // This will show the time picker
                                style={{ width: '100%' }}
                                bordered={false}
                            />
                        </Descriptions.Item>

                        <Descriptions.Item label="Due time">
                            <DatePicker
                                value={mainTask.endTime ? dayjs(mainTask.endTime) : null}
                                onChange={(date, dateString) => handleDateChange('endTime', date, dateString)}
                                format="YYYY-MM-DD HH:mm:ss"
                                style={{ width: '100%' }}
                                bordered={false}
                                showTime
                                placeholder="Select due date"
                                allowClear
                                disabled={loading}
                                disabledDate={(current) => {
                                    if (!mainTask.startTime) return false;
                                    // Chặn ngày trước ngày start
                                    return current && current.isBefore(dayjs(mainTask.startTime), 'day');
                                }}
                                disabledTime={(current) => {
                                    if (!mainTask.startTime || !current) return {};
                                    const start = dayjs(mainTask.startTime);

                                    // Nếu cùng ngày thì giới hạn giờ/phút
                                    if (current.isSame(start, 'day')) {
                                        const disabledHours = Array.from({ length: 24 }, (_, i) =>
                                            i < start.hour() ? i : null
                                        ).filter((i) => i !== null);

                                        const disabledMinutes = (selectedHour) => {
                                            if (selectedHour === start.hour()) {
                                                return Array.from({ length: 60 }, (_, i) =>
                                                    i < start.minute() ? i : null
                                                ).filter((i) => i !== null);
                                            }
                                            return [];
                                        };

                                        return {
                                            disabledHours: () => disabledHours,
                                            disabledMinutes,
                                        };
                                    }

                                    return {};
                                }}
                            />
                        </Descriptions.Item>



                    </Descriptions>

                    <Divider style={{ margin: '16px 0' }} />

                    <Flex justify="space-between" align="center" style={{ fontSize: '12px', color: '#5E6C84' }}>
                        <span>Created {moment(mainTask.createdAt).fromNow()}</span>
                        <Tooltip title={moment(mainTask.updatedAt).format('YYYY-MM-DD HH:mm')}>
                            {mainTask.updatedAt && (
                                <span>Updated {moment(mainTask.updatedAt).fromNow()}</span>
                            )}
                        </Tooltip>
                    </Flex>
                </Sider>
            </Layout>
        </Layout>
    );
};

export default TaskDetailView;