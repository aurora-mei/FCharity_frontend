
import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, Upload, message, Skeleton } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UploadOutlined } from "@ant-design/icons";
import { fetchSpendingItemById, updateProjectThunk } from "../../redux/project/projectSlice";
import styled from "styled-components";
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
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
const SpendingItemModal = ({ project, form, isOpenModal, setIsOpenModal, spendingItem, handleSubmit, title }) => {
    const [initialLoading, setInitialLoading] = useState(true);
    const currentSpendingItem = useSelector((state) => state.project.currentSpendingItem);

    const dispatch = useDispatch();
    useEffect(() => {
        console.log("sp", spendingItem);
        if (spendingItem?.itemName) {
            setInitialLoading(true);
            initFormData();
        }
        setInitialLoading(false);
    }, [dispatch, form,spendingItem]);

    const initFormData = async () => {
        // dispatch(fetchSpendingItemById(spendingItem.id));
        form.setFieldsValue({
            id: spendingItem.id,
            itemName: spendingItem.itemName,
            estimatedCost: spendingItem.estimatedCost,
            note: spendingItem.note,
        });
    }
    if(initialLoading){
        return <Skeleton active/>
    }
    return (
        <Modal
            title={`${spendingItem && spendingItem.itemName ? spendingItem.itemName : "Spending item"} - ${title}`}
            centered
            open={isOpenModal}
            footer={null}
            onCancel={() => {
                setIsOpenModal(false);
                // form.resetFields();
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Item Name"
                    name="itemName"
                    rules={[{ required: true, message: "Please enter item name" }]}
                >
                    <Input placeholder="Enter item name" />
                </Form.Item>
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
                    label="Estimated Cost"
                    name="estimatedCost"
                    rules={[{ required: true, message: "Please enter estimated cost" }]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        step={0.01}
                        stringMode
                        placeholder="Enter estimated cost"
                    />
                </Form.Item>

                <Form.Item label="Note" name="note">
                    <Input.TextArea rows={4} placeholder="Enter note (optional)" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal >
    )
};

SpendingItemModal.propTypes = {
    project: PropTypes.object,
    form: PropTypes.object.isRequired,
    isOpenModal: PropTypes.bool.isRequired,
    setIsOpenModal: PropTypes.func.isRequired,
    spendingItem: PropTypes.shape({
        id: PropTypes.number,
        itemName: PropTypes.string,
        estimatedCost: PropTypes.number,
        note: PropTypes.string,
    }),
    handleSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
};

export default SpendingItemModal;