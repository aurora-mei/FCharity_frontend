import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Spin } from 'antd';

const TaskStatusModal = ({
    isOpen,             // Boolean: Controls modal visibility (use 'open' for antd v5+, 'visible' for v4)
    mode,             // String: 'create' or 'edit'
    initialData,      // Object: { id: UUID, statusName: String, phaseId: UUID } for editing, or null/undefined for create
    loading,          // Boolean: Show loading state on the submit button
    onSubmit,         // Function: Called with submission data ({ statusName, phaseId } or { id, statusName, phaseId })
    setIsOpen,         // Function: Called when the modal is closed/cancelled
    phaseId,          // UUID: The ID of the phase this status belongs to (Required, especially for create)
}) => {
    const [form] = Form.useForm();

    const isEditMode = mode === 'edit';
    const modalTitle = isEditMode ? 'Edit Task Status' : 'Create New Task Status';
    const okText = isEditMode ? 'Update Status' : 'Create Status';

    // Effect to reset and pre-fill form when modal opens or relevant data changes
    useEffect(() => {
        if (open) {
            if (isEditMode && initialData) {
                // Pre-fill form for editing
                form.setFieldsValue({
                    statusName: initialData.statusName,
                    // id and phaseId are not typically form fields but handled in onSubmit
                });
            } else {
                // Reset form for creation
                form.resetFields();
            }
        }
    }, [open, mode, initialData, form]);

    const handleOk = async () => {
        if (!phaseId && !isEditMode) {
             console.error("Phase ID is required to create a status.");
             // Optionally show an Ant Design message.error here
             return; // Prevent submission if phaseId is missing in create mode
        }

        try {
            const values = await form.validateFields(); // Validates only 'statusName'

            const submissionData = {
                statusName: values.statusName,
                phaseId: isEditMode ? initialData.phaseId : phaseId, // Use initialData's phaseId if editing, otherwise use the prop
            };

            // If editing, include the original ID
            if (isEditMode && initialData?.id) {
                submissionData.id = initialData.id;
            } else if (!submissionData.phaseId) {
                // Defensive check again for phaseId in create mode before submitting
                console.error("Phase ID is missing in submission data for create.");
                return;
            }


            onSubmit(submissionData); // Pass formatted data to the parent handler

        } catch (errorInfo) {
            // Antd Form automatically highlights validation errors
            console.log('Validation Failed:', errorInfo);
        }
    };

    return (
        <Modal
            title={modalTitle}
            open={isOpen} // Use 'open' (v5+) or 'visible' (v4)
            onOk={handleOk} // Uses the default OK button which triggers validation
            onCancel={()=>setIsOpen(false)} // Call the passed handler
            confirmLoading={loading} // Show loading spinner on OK button
            destroyOnClose // Reset form state completely when modal closes
            width={400} // Adjust width as needed
            okText={okText} // Customize OK button text
        >
            <Spin spinning={loading && !open}> {/* Optional: Show overlay spinner */}
                <Form form={form} layout="vertical" name="taskStatusForm">
                    {/*
                      Hidden field for ID during edit? Not usually needed if ID is passed
                      back correctly in onSubmit based on initialData.
                      {isEditMode && initialData?.id && <Form.Item name="id" hidden><Input /></Form.Item>}
                    */}

                    <Form.Item
                        name="statusName"
                        label="Status Name"
                        rules={[{ required: true, message: 'Please enter the status name' }]}
                    >
                        <Input placeholder="E.g., To Do, In Progress, Done" />
                    </Form.Item>

                    {/*
                       phaseId is usually determined by the context where the modal is opened
                       (e.g., clicking "Add Status" within a specific phase column in Kanban)
                       and passed as a prop, rather than being a user-editable field here.
                       If it needed to be selectable, you'd add a Select component here.
                    */}
                </Form>
            </Spin>
        </Modal>
    );
};

export default TaskStatusModal;