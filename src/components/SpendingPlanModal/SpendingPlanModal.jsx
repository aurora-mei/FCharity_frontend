import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, Upload, message, Skeleton, Typography } from "antd"; // Added Typography
import { useDispatch, useSelector } from "react-redux";
// REMOVE: import { UploadOutlined } from "@ant-design/icons"; // Not used in the form
// Assuming updateProjectThunk is for a different purpose, not used here directly
// import { updateProjectThunk } from "../../redux/project/projectSlice";
import { fetchRequestById } from "../../redux/request/requestSlice"; // --- IMPORT NEEDED ACTION ---
import styled from "styled-components";
import moment from 'moment-timezone';

const { TextArea } = Input;
const { Title } = Typography; // For potential use in Modal title

// StyledButton definition is kept, but not used in the example below
// const StyledButton = styled(Button)`...`;

const SpendingPlanModal = ({
    project,
    form,
    isOpenModal,
    setIsOpenModal,
    spendingPlan, // Data for EXISTING plan (null/undefined for create)
    handleSubmit,
    title // Should be "Create" or "Update"
}) => {
    // Removed initialLoading state - form renders immediately, populates via effects
    const dispatch = useDispatch();
    const currentRequest = useSelector((state) => state.request.currentRequest); // Assuming path is correct

    // Effect 1: Fetch related request data based on project ID
    useEffect(() => {
        // Only fetch if project ID exists
        if (project?.project?.id) {
            //  console.log('Fetching request for project ID:', project.project.id);
            dispatch(fetchRequestById(project.project.requestId));
        }
    }, [dispatch, project]); // Depend on project object

    // Effect 2: Pre-fill form based on spendingPlan (for Update) or defaults (for Create)
    useEffect(() => {
        if (spendingPlan) {
            // --- UPDATE MODE ---
            // console.log("Populating form for UPDATE:", spendingPlan);
            form.setFieldsValue({
                id: spendingPlan.id,
                planName: spendingPlan.planName,
                description: spendingPlan.description,
                // Use the value from the existing plan being updated
                maxExtraCostPercentage: spendingPlan.maxExtraCostPercentage,
                // estimatedTotalCost: spendingPlan.estimatedTotalCost, // Uncomment if needed
                // approvalStatus: spendingPlan.approvalStatus, // Uncomment if needed
            });
        } else if (currentRequest?.helpRequest) {
             // --- CREATE MODE (after currentRequest is loaded) ---
            //  console.log("Setting defaults for CREATE based on currentRequest:", currentRequest);
             // Reset fields first in case modal is reused
            form.resetFields();
            // Set default extra cost based on request type
            form.setFieldsValue({
                maxExtraCostPercentage: currentRequest.helpRequest.supportType === "MONEY" ? 0 : 10,
                // Set other defaults for CREATE mode if needed here
            });
        } else {
            // --- CREATE MODE (before currentRequest is loaded) ---
            //  console.log("Resetting form for CREATE (request not loaded yet)");
            // Reset fields if opening for create and request isn't loaded yet
             form.resetFields();
             // Optionally set a temporary default for maxExtraCostPercentage here if needed
             form.setFieldsValue({ maxExtraCostPercentage: 10 }); // Example default
        }
    }, [spendingPlan, currentRequest, form]); // Depend on spendingPlan, currentRequest, and form instance


    // No skeleton needed if form renders immediately
    // if (initialLoading) { return <Skeleton active />; }

    const modalTitle = `${title} Spending Plan ${spendingPlan ? `- ${spendingPlan.planName}` : ''}`;

    return (
        <Modal
            title={modalTitle}
            centered
            open={isOpenModal}
            footer={null} // Keep footer null as form has submit button
            onCancel={() => {
                setIsOpenModal(false);
                // No need to reset form here if using destroyOnClose
            }}
            destroyOnClose // <--- Add this to reset form state when closed
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                 // initialValues are less flexible than setFieldsValue in useEffect for this case
            >
                {/* Hidden ID field - only relevant for updates, but harmless on create */}
                <Form.Item name="id" hidden>
                    <Input /> {/* InputNumber not strictly needed for hidden field */}
                </Form.Item>

                <Form.Item
                    name="planName"
                    label="Plan Name"
                    rules={[{ required: true, message: "Please input the plan name" }]}
                >
                    <Input placeholder="Enter plan name" />
                </Form.Item>

                <Form.Item name="description" label="Description">
                    <TextArea rows={4} placeholder="Enter description (optional)" />
                </Form.Item>

                <Form.Item
                    name="maxExtraCostPercentage"
                    label="Max Extra Cost Percentage"
                    tooltip="Maximum allowed cost overrun. Set based on project support type." // Add tooltip
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) => `${value} %`}
                        parser={(value) => value?.replace(' %', '') ?? ''}
                        readOnly // Keep read-only as it's derived
                        min={0} // Set min value
                        max={100} // Set max value
                    />
                </Form.Item>

                {/* Commented out fields kept commented */}
                {/* <Form.Item name="estimatedTotalCost" ... /> */}
                {/* <Form.Item name="approvalStatus" ... /> */}

                <Form.Item style={{marginTop: '24px'}}> {/* Add margin for spacing */}
                    {/* Use standard Ant Button */}
                    <Button type="primary" htmlType="submit" block>
                        {title === "Create" ? "Create Plan" : "Save Changes"} {/* Dynamic Button Text */}
                    </Button>
                    {/* Or use your StyledButton if you prefer: */}
                    {/* <StyledButton htmlType="submit" block>
                        {title === "Create" ? "Create Plan" : "Save Changes"}
                    </StyledButton> */}
                </Form.Item>
            </Form>
        </Modal >
    )
};

export default SpendingPlanModal;