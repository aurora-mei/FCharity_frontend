import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, DatePicker, Button, Row, Col } from 'antd';
import dayjs from 'dayjs'; // Cần thiết cho DatePicker

const { TextArea } = Input;
const { RangePicker } = DatePicker; // Có thể dùng RangePicker cho tiện lợi hơn

const PhaseModal = ({
    isOpen,
    setIsOpen, // Hoặc onClose
    initialData, // Dữ liệu phase ban đầu khi edit (null hoặc undefined khi create)
    onFinish,    // Hàm gọi khi form submit thành công (truyền dữ liệu đã xử lý)
    isLoading = false, // Trạng thái loading cho nút submit
    projectId,   // ID của project, cần khi tạo mới phase
}) => {
    const [form] = Form.useForm();

    const isEditing = Boolean(initialData && initialData.id); // Kiểm tra xem có đang edit không
    const modalTitle = isEditing ? 'Update Phase' : 'Create New Phase';

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                // Đang edit: set giá trị từ initialData
                form.setFieldsValue({
                    ...initialData,
                    // Chuyển đổi Instant/ISO string sang Dayjs cho DatePicker
                    // Hoặc set giá trị cho RangePicker nếu dùng
                    startTime: initialData.startTime ? dayjs(initialData.startTime) : null,
                    endTime: initialData.endTime ? dayjs(initialData.endTime) : null,
                    // Nếu dùng RangePicker:
                    // timeRange: [
                    //     initialData.startTime ? dayjs(initialData.startTime) : null,
                    //     initialData.endTime ? dayjs(initialData.endTime) : null
                    // ].filter(Boolean) // Lọc bỏ null nếu một trong hai thiếu
                });
            } else {
                // Đang tạo mới: reset form
                form.resetFields();
            }
        }
    }, [isOpen, initialData, form, isEditing]);

    const handleCancel = () => {
        setIsOpen(false);
        // form.resetFields(); // destroyOnClose sẽ làm việc này
    };

    // Xử lý submit form nội bộ để chuẩn bị dữ liệu trước khi gọi onFinish của cha
    const handleInternalFinish = (values) => {
        // Chuyển đổi date/time về định dạng backend mong muốn (ví dụ: ISO string)
        const transformedValues = {
            ...values,
        };

        // Nếu dùng RangePicker:
        // const transformedValues = {
        //     ...values,
        //     startTime: values.timeRange && values.timeRange[0] ? values.timeRange[0].toISOString() : null,
        //     endTime: values.timeRange && values.timeRange[1] ? values.timeRange[1].toISOString() : null,
        // };
        // delete transformedValues.timeRange; // Xóa trường tạm

        // Nếu là tạo mới, thêm projectId vào
        if (!isEditing) {
            transformedValues.projectId = projectId;
        }

        // Gọi hàm onFinish của component cha với dữ liệu đã chuẩn bị
        onFinish(transformedValues);
    };

    return (
        <Modal
            title={modalTitle}
            open={isOpen} // Dùng 'open' cho Antd v5+
            onCancel={handleCancel}
            confirmLoading={isLoading} // Hiện loading trên nút OK
            destroyOnClose // Xóa state của form khi đóng modal
            // Footer tùy chỉnh
            footer={[
                <Button key="back" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={() => form.submit()} // Trigger form validation and onFinish
                >
                    {isEditing ? 'Update Phase' : 'Create Phase'}
                </Button>,
            ]}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleInternalFinish} // Gọi hàm xử lý nội bộ
                name="phaseForm"
            >
                {/* Trường ID ẩn đi khi edit */}
                {isEditing && (
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                )}
                <Form.Item name="projectId" hidden>
                    <Input />
                </Form.Item>
                <Form.Item
                    name="title"
                    label="Phase Title"
                    rules={[{ required: true, message: 'Please enter the phase title!' }]}
                >
                    <Input placeholder="Enter phase title (e.g., Requirement Analysis)" />
                </Form.Item>

                {/* --- Cách 1: Dùng 2 DatePicker riêng biệt --- */}
                {/* <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startTime"
                            label="Start Time"
                            rules={[
                                { required: true, message: 'Please select the start time!' },
                                // Validator kiểm tra startTime phải trước endTime
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const endTime = getFieldValue('endTime');
                                        if (!value || !endTime || value.isBefore(endTime)) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Start time must be before end time!'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder="Select start time"/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endTime"
                            label="End Time"
                            rules={[
                                { required: true, message: 'Please select the end time!' },
                                // Validator kiểm tra endTime phải sau startTime
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startTime = getFieldValue('startTime');
                                        if (!value || !startTime || value.isAfter(startTime)) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('End time must be after start time!'));
                                    },
                                }),
                             ]}
                             dependencies={['startTime']} // Chạy lại validation khi startTime thay đổi
                        >
                            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder="Select end time"/>
                        </Form.Item>
                    </Col>
                </Row> */}

                {/* --- Cách 2: Dùng RangePicker (thay thế cho 2 DatePicker trên) --- */}
                {/*
                <Form.Item
                    name="timeRange"
                    label="Phase Duration"
                    rules={[
                        { required: true, message: 'Please select the start and end time!' },
                         ({ getFieldValue }) => ({
                             validator(_, value) {
                                 if (value && value[0] && value[1] && value[0].isSame(value[1])) {
                                     return Promise.reject(new Error('Start and end time cannot be the same!'));
                                 }
                                 return Promise.resolve();
                             },
                         }),
                    ]}
                >
                    <RangePicker
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        style={{ width: '100%' }}
                        placeholder={['Start Time', 'End Time']}
                    />
                </Form.Item>
                */}

                <Form.Item
                    name="content"
                    label="Goals Summary / Notes"
                    rules={[
                        { required: true, message: 'Please provide a goals summary!' },
                        { min: 10, message: 'Notes must be at least 10 characters.' }
                    ]}
                >
                    <TextArea rows={4} placeholder="Describe the outcome, challenges met, achievements..." />
                </Form.Item>

            </Form>
        </Modal>
    );
};

PhaseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired, // Hoặc onClose nếu dùng cách đó
    initialData: PropTypes.shape({ // Dữ liệu để edit
        id: PropTypes.string.isRequired, // Hoặc UUID nếu backend dùng UUID object
        title: PropTypes.string,
        startTime: PropTypes.string, // Mong đợi ISO string hoặc Instant
        endTime: PropTypes.string,   // Mong đợi ISO string hoặc Instant
        content: PropTypes.string,
        projectId: PropTypes.string, // projectId cũng có thể có ở đây
    }),
    onFinish: PropTypes.func.isRequired, // Hàm xử lý khi submit thành công
    isLoading: PropTypes.bool,
    projectId: PropTypes.string, // Cần thiết khi tạo mới
};

export default PhaseModal;