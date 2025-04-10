
import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, Upload, message ,Skeleton} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UploadOutlined } from "@ant-design/icons";
import { updateProjectThunk } from "../../redux/project/projectSlice";
import styled from "styled-components";
import moment from 'moment-timezone';
const { TextArea } = Input;
const StyledButton = styled(Button)`
    background-color:green;
    border-radius: 0.5rem;
    color: white;
   font-size: 1rem !important;
    font-weight: 500;
    padding:1rem;
    // box-shadow:rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    &:hover{
        box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 8px 0px;
        background-color: green !important;
        border-color: black !important;
        color: white !important;
    }
`;
const SpendingPlanModal = ({project, form, isOpenModal,setIsOpenModal , spendingPlan, handleSubmit, title }) => {
    const [initialLoading, setInitialLoading] = useState(true);
    const dispatch = useDispatch();
    useEffect(() => {
        console.log("project", project);
        if (spendingPlan && spendingPlan.projectId) {
            setInitialLoading(true);
            initFormData();
        }
            setInitialLoading(false); 
    }, [dispatch, form]);

    const initFormData = async () => {
        form.setFieldsValue({
            id: spendingPlan.id,
            planName: spendingPlan.planName,
            description: spendingPlan.description,
            minRequiredDonationAmount: spendingPlan.minRequiredDonationAmount,
            estimatedTotalCost: spendingPlan.estimatedTotalCost,
            approvalStatus: spendingPlan.approvalStatus,
          });
    }
    if(initialLoading) {
        return <Skeleton active />
    }
return (
    <Modal
        title={`${spendingPlan && spendingPlan.planName ? spendingPlan.planName : "Spending plan"} - ${title}`}
        centered
        open={isOpenModal}
        footer={null}
        onCancel={() => {
            setIsOpenModal(false);
            form.resetFields();
        }}
    >
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
        >
            <Form.Item
                    label="id"
                    name="id"
                    hidden
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        step={0.01}
                        stringMode
                        placeholder="Enter id"
                    />
                </Form.Item>
            <Form.Item
                name="planName"
                label="Plan Name"
                rules={[{ required: true, message: "Please input the plan name" }]}
            >
                <Input placeholder="Enter plan name" />
            </Form.Item>

            <Form.Item name="description" label="Description">
                <TextArea rows={4} placeholder="Enter description" />
            </Form.Item>

            <Form.Item
                name="minRequiredDonationAmount"
                label="Minimum Required Donation Amount"
                rules={[{ required: true, message: "Please input the minimum donation amount" }]}
            >
                <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="e.g. 100.00"
                />
            </Form.Item>

            {/* <Form.Item
                name="estimatedTotalCost"
                label="Estimated Total Cost"
                rules={[{ required: true, message: "Please input the estimated total cost" }]}
            >
                <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={0.01}
                    placeholder="e.g. 1000.00"
                />
            </Form.Item> */}
{/* 
            <Form.Item
                name="approvalStatus"
                label="Approval Status"
                rules={[{ required: true, message: "Please select approval status" }]}
            >
                <Select options={approvalOptions} placeholder="Select approval status" />
            </Form.Item> */}

            <Form.Item>
                <Button type="primary" htmlType="submit" block>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    </Modal >
)};


export default SpendingPlanModal;