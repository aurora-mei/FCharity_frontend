import { useState } from "react";
import { Modal, Form, Input, InputNumber, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { Link } from "react-router-dom";

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

const DonateProjectModal = ({ form, isOpenModal, setIsOpenModal, project, handleDonate }) => {
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
                            min: 2000,
                            message: "Amount must be greater than 2000 VND"
                        }
                    ]}
                >
                    <InputNumber
                        placeholder="Enter amount"
                        min={2000}
                        style={{ width: '100%' }}
                        value={form.getFieldValue('amount')}
                        onChange={(value) => form.setFieldsValue({ amount: value })}
                    />
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
                            max: 25,
                            message: "Message cannot be more than 25 characters."
                        }
                    ]}
                >
                    <Input
                        type="text"
                        maxLength={25}
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
