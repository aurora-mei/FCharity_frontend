import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Spin, Row, Col } from 'antd';
import moment from 'moment'; // Or import dayjs from 'dayjs';
import dayjs from 'dayjs'; // For date manipulation
const { Option } = Select;
const { TextArea } = Input;

const TaskModal = ({
    open, // <-- Use 'open' (for Antd v5+) or 'visible' (for Antd v4)
    mode,
    initialData,
    loading,
    onSubmit,
    onCancel, // <-- Use standard onCancel prop name
    userOptions = [],
    statusOptions = [],
    initStatus,
}) => {
    const [form] = Form.useForm();

    const isEditMode = mode === 'edit';
    const modalTitle = isEditMode ? 'Edit Task' : 'Create New Task';
    const okText = isEditMode ? 'Update Task' : 'Create Task';
    console.log("initialData", initialData);

    useEffect(() => {
        // Use 'open' (or 'visible') in the condition
        if (open) {
            if (isEditMode && initialData) {
                form.setFieldsValue({
                    ...initialData,
                    startTime: initialData.startTime ? dayjs(initialData.startTime) : null,
                    endTime: initialData.endTime ? dayjs(initialData.endTime) : null,
                    // Set status from initialData if editing, otherwise use initStatus
                    taskPlanStatusId: initialData.taskPlanStatusId?.toString() || initStatus?.id || null,
                    userId: initialData.userId?.toString() || null,
                });
            } else {
                form.resetFields();
                if(initialData && initialData.startTime ){
                    form.setFieldsValue({
                        startTime: initialData.startTime ? dayjs(initialData.startTime) : null,
                        endTime: initialData.endTime ? dayjs(initialData.endTime) : null,
                    });
                }
                form.setFieldsValue({
                    // Set initial status when creating
                    taskPlanStatusId: initStatus?.id || null, // Use optional chaining
                });
            }
        }
    // Use 'open' (or 'visible') in the dependency array
    }, [open, isEditMode, initialData, form, initStatus]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const submissionData = {
                ...values,
                startTime: values.startTime ? values.startTime.toISOString() : null,
                endTime: values.endTime ? values.endTime.toISOString() : null,
            };

            if (isEditMode && initialData?.id) {
                submissionData.id = initialData.id;
            }
            // Ensure status ID is included even if the field is disabled/not changed
            submissionData.taskPlanStatusId = form.getFieldValue('taskPlanStatusId');

            onSubmit(submissionData);

        } catch (errorInfo) {
            console.error('Validation Failed:', errorInfo);
        }
    };

console.log("member", userOptions)
    const renderUserOptions = () => {
        if (!Array.isArray(userOptions)) return null; // Add check for safety
        return userOptions.map(opt => {
             // Check if structure is as expected
             if (!opt || !opt.id || !opt.user || typeof opt.user.fullName === 'undefined') {
                 console.warn("Skipping invalid user option:", opt);
                 return null;
             }
            return (
                 <Option key={opt.user.id} value={opt.user.id}>
                     {opt.user.fullName}
                 </Option>
             );
        });
    };
console.log("status op", statusOptions);
    // Ensure statusOptions have the correct structure: { value: '...', label: '...' }
     const renderStatusOptions = () => {
        if (!Array.isArray(statusOptions)) return null; // Add check for safety
        return statusOptions.map(opt => {
            // Check if structure is as expected
            if (!opt || typeof opt.label === 'undefined' || typeof opt.label === 'undefined') {
                console.warn("Skipping invalid status option:", opt);
                return null;
            }
            return (
                <Option key={opt.value} value={opt.value}>
                    {opt.label}
                </Option>
            );
        });
    };


    return (
        <Modal
            title={modalTitle}
            open={open} // <-- Pass the 'open' (or 'visible') prop here
            onOk={handleOk}
            onCancel={onCancel} // <-- Call the passed onCancel function directly
            confirmLoading={loading}
            destroyOnClose
            // maskClosable={false}
            width={600}
            okText={okText}
        >
            {/* Use 'open' (or 'visible') in the Spin condition */}
            <Spin spinning={loading && !open}>
                <Form form={form} layout="vertical" name="taskForm">
                    {isEditMode && initialData?.id && <Form.Item name="id" hidden><Input /></Form.Item>}

                    <Form.Item
                        name="taskName"
                        label="Task Name"
                        rules={[{ required: true, message: 'Please enter the task name' }]}
                    >
                        <Input placeholder="Enter task name" />
                    </Form.Item>

                    <Form.Item
                        name="taskPlanDescription"
                        label="Description"
                    >
                        <TextArea rows={4} placeholder="Enter task description" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="startTime" label="Start Time">
                                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder="Select start date and time" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                             <Form.Item
                                name="endTime"
                                label="End Time"
                                rules={[
                                     ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || !getFieldValue('startTime') || getFieldValue('startTime').isBefore(value)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('End time must be after start time!'));
                                        },
                                     }),
                                ]}
                             >
                                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder="Select end date and time" />
                             </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="userId"
                        label="Assignee"
                    >
                        <Select placeholder="Select user" allowClear showSearch filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase()) // Safer filtering
                        }>
                            {renderUserOptions()}
                        </Select>
                    </Form.Item>

                     {/* Make status potentially read-only for create mode if needed */}
                    <Form.Item
                        name="taskPlanStatusId"
                        label="Status"
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select
                            placeholder="Select status"
                            allowClear
                            // disabled={mode === 'create'} // Optionally disable status selection on create
                        >
                            {renderStatusOptions()}
                        </Select>
                    </Form.Item>

                </Form>
            </Spin>
        </Modal>
    );
};

export default TaskModal;