import { useState } from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

const StyledButton = styled(Button)`
    background-color: green;
    border-radius: 0.5rem;
    color: white;
    font-size: 1rem !important;
    font-weight: 500;
    padding: 1rem;

    &:hover {
        box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 8px 0px;
        background-color: green !important;
        border-color: black !important;
        color: white !important;
    }
`;

const DonateProjectModal = ({ form, isOpenModal, setIsOpenModal, project, handleDonate, balance }) => {

    const showConfirm = (values) => {
        Modal.confirm({
            title: "Confirm your donation",
            content: (
                <>
                    <p><strong>Project:</strong> {project.projectName}</p>
                    <p><strong>Amount:</strong> {values.amount.toLocaleString()} VND</p>
                    {values.message && <p><strong>Message:</strong> {values.message}</p>}
                </>
            ),
            okText: "Confirm",
            cancelText: "Cancel",
            onOk() {
                handleDonate(values);
            }
        });
    };

    return (
        <Modal
            title={`${project.projectName} - Donate`}
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
                onFinish={showConfirm}  
            >
                <Form.Item
                    label="Amount (VND)"
                    name="amount"
                    rules={[
                        {
                            required: true,
                            message: "Please input amount"
                        },
                        {
                            type: 'number',
                            min: 1000,
                            max: balance,
                            message: balance < 1000 ? (
                                <>You don't have enough balance to donate. Please <a href="/user/manage-profile/mywallet">make a deposit</a> to continue</>
                            ) : (
                                <>Amount must be between 1000 and {balance}</>
                            )
                        }
                    ]}
                >
                    <InputNumber
                        placeholder="Enter amount"
                        min={1000}
                        max={balance}
                        style={{ width: '100%' }}
                        value={form.getFieldValue('amount')}
                        onChange={(value) => form.setFieldsValue({ amount: value })}
                    />
                    <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#8c8c8c' }}>
                        * Minimum amount: {"1000".toLocaleString()} VND, Maximum amount: {balance.toLocaleString()} VND
                    </div>
                </Form.Item>

                <Form.Item
                    label="Message"
                    name="message"
                    rules={[
                        {
                            required: false,
                            message: "Message is optional"
                        },
                        {
                            max: 50,
                            message: "Message cannot be more than 50 characters."
                        }
                    ]}
                >
                    <Input
                        type="text"
                        maxLength={50}
                        placeholder="Enter message"
                    />
                </Form.Item>

                <Form.Item>
                    <StyledButton type="primary" htmlType="submit">
                        Donate
                    </StyledButton>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DonateProjectModal;
