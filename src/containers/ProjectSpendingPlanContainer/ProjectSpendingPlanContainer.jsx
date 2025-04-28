import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyledButtonInvite, StyledButtonSubmit, SpendingPlanFlex, Header, TitleSection, ButtonGroup, SpendingItemRow } from "../ProjectFinancePlanContainer/ProjectFinancePlanContainer";
import { Tooltip, Upload, Typography, Button, Form, Table, Tag, Modal, Empty, Flex } from "antd";
import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { fetchSpendingPlanOfProject, fetchSpendingItemOfPlan, createSpendingPlanThunk, createSpendingItemThunk, updateSpendingPlanThunk, updateSpendingItemThunk, deleteSpendingItemThunk, deleteSpendingPlanThunk } from "../../redux/project/projectSlice";
import SpendingPlanModal from "../../components/SpendingPlanModal/SpendingPlanModal";
import SpendingItemModal from "../../components/SpendingItemModal/SpendingItemModal";
import moment from "moment";
import { fetchSpendingTemplateThunk, importSpendingPlanThunk } from "../../redux/project/projectSlice";
const { Title } = Typography;
const ProjectSpendingPlanContainer = ({currentProject, isLeader}) => {
    const dispatch = useDispatch();
    const currentSpendingPlan = useSelector((state) => state.project.currentSpendingPlan);
    const currentSpendingItem = useSelector((state) => state.project.currentSpendingItem);
    const spendingItems = useSelector((state) => state.project.spendingItems);
    const [selectedSpendingItem, setSelectedSpendingItem] = useState(null);
    const [selectedSpendingPlan, setSelectedSpendingPlan] = useState(null);
    const [downloadTemplate, setDownloadTemplate] = useState(true);
    const [isOpenCreatePlanModal, setIsOpenCreatePlanModal] = useState(false);
    const [isOpenUpdatePlanModal, setIsOpenUpdatePlanModal] = useState(false);
    const [isOpenCreateItemModal, setIsOpenCreateItemModal] = useState(false);
    const [isOpenUpdateItemModal, setIsOpenUpdateItemModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [createPlanForm] = Form.useForm();
    const [updatePlanForm] = Form.useForm();
    const [createItemForm] = Form.useForm();
    const [updateItemForm] = Form.useForm();

    const handleAddSpendingPlan = (values) => {
        console.log("values", values);
        const newPlan = {
            ...values,
            projectId: currentProject.project.id,
        };
        dispatch(createSpendingPlanThunk(newPlan))
    };
    const handleAddSpendingItem = (values) => {
        console.log("values", values);
        const newItem = {
            ...values,
            spendingPlanId: currentSpendingPlan.id,
        };
        dispatch(createSpendingItemThunk(newItem))
        setIsOpenCreateItemModal(false);
    };
    const handleUpdateSpendingPlan = (values) => {
        console.log("values", values);
        if (values) {
            const updatedPlan = {
                ...values,
                projectId: currentProject.project.id,
            };
            dispatch(updateSpendingPlanThunk({ planId: updatedPlan.id, dto: updatedPlan }));
        }
        setIsOpenUpdatePlanModal(false);
        // window.location.reload();
    };
    const handleUpdateSpendingItem = (values) => {
        if (values) {
            const updatedItem = {
                ...values,
                spendingPlanId: currentSpendingPlan.id,
            };
            console.log("updatedItem", updatedItem);
            dispatch(updateSpendingItemThunk({ itemId: updatedItem.id, dto: updatedItem }));
        }
        updateItemForm.resetFields();
        setIsOpenUpdateItemModal(false);
    };

    const handleDeleteSpendingItem = (item) => {
        if (item) {
            const itemId = item.id;
            dispatch(deleteSpendingItemThunk(itemId));
        }
    };
    const [isSubmitted, setIsSubmitted] = useState(false);


    const handleSubmit = () => {
        const updatedPlan = {
            ...currentSpendingPlan,
            approvalStatus: "SUBMITED",
            estimatedTotalCost: spendingItems.reduce((total, item) => total + (item.estimatedCost || 0), 0),
            projectId: currentProject.project.id,
        };
        dispatch(updateSpendingPlanThunk({ planId: updatedPlan.id, dto: updatedPlan }));
        setIsOpenUpdatePlanModal(false);
        setIsSubmitted(true);
        // window.location.reload();

    };
    console.log("currentProject", currentProject);
    const columns = [
        {
            title: "Item Name",
            dataIndex: "itemName",
            key: "itemName",
        },
        {
            title: "Estimated Cost",
            dataIndex: "estimatedCost",
            key: "estimatedCost",
            render: (_) => (
                <span>{_ ? _.toLocaleString() : 0} VND</span>
            ),
        },
        {
            title: "Note",
            dataIndex: "note",
            key: "note",
        },
        isLeader && currentSpendingPlan && (currentSpendingPlan.approvalStatus === "PREPARING" || currentSpendingPlan.approvalStatus === "REJECTED") && {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <>
                    <Button
                        size="small"
                         shape="circle"
                        icon={<EditOutlined />}
                        style={{ marginRight: 8 }}
                        onClick={() => {
                            console.log("record", record);
                            setSelectedSpendingItem(record);
                            console.log("selectedSpendingItem", selectedSpendingItem);
                            setIsOpenUpdateItemModal(true);
                        }}
                    />
                    <Button
                        size="small"
                         shape="circle"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteSpendingItem(record)}
                    />

                </>
            ),
        },
    ];
    console.log(!currentSpendingPlan || (currentSpendingPlan.approvalStatus !== "SUBMITED" && currentSpendingPlan.approvalStatus !== "APPROVED"))
    return (
        <SpendingPlanFlex>
            {isLeader &&
                (
                    <Flex justify="space-between" align="center" wrap gap={12} style={{ marginBottom: '1rem' }}>
                        {
                            currentSpendingPlan && !currentSpendingPlan.id && (
                                <Tooltip title="Create new spending plan">
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<PlusOutlined />}
                                        onClick={() => setIsOpenCreatePlanModal(true)}
                                    />
                                </Tooltip>)
                        }

                        {!currentSpendingPlan || (currentSpendingPlan.approvalStatus !== "SUBMITED" && currentSpendingPlan.approvalStatus !== "APPROVED")
                            && (
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <Tooltip title="Click here to download creating spending plan template">
                                        <StyledButtonInvite
                                            icon={<DownloadOutlined />}
                                            onClick={() => {
                                                dispatch(fetchSpendingTemplateThunk(currentProject.project.id));
                                                setDownloadTemplate(true);
                                            }}
                                        >
                                            Download Template
                                        </StyledButtonInvite>
                                    </Tooltip>

                                    {(downloadTemplate || (currentSpendingPlan && currentSpendingPlan.id)) && (
                                        <Upload
                                            accept=".xlsx"
                                            showUploadList={false}
                                            beforeUpload={(file) => {
                                                dispatch(importSpendingPlanThunk({ file, projectId: currentProject.project.id }));
                                                return false; // prevent auto upload
                                            }}
                                        >
                                            <StyledButtonInvite icon={<UploadOutlined />}>Import Plan</StyledButtonInvite>
                                        </Upload>
                                    )}
                                </div>
                            )
                        }

                    </Flex>
                )}
            {currentSpendingPlan && currentSpendingPlan.id ? (
                <>
                    <Header>
                        <TitleSection>
                            <Title level={5} style={{ marginBottom: 0 }}>
                                {currentSpendingPlan.planName ? `Spending Plan: ${currentSpendingPlan.planName}` : ''}
                            </Title>

                            {isLeader && (["PREPARING", "REJECTED"].includes(currentSpendingPlan.approvalStatus)) && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <StyledButtonInvite
                                        icon={<EditOutlined />}
                                        onClick={() => setIsOpenUpdatePlanModal(true)}
                                        style={{ cursor: 'pointer', fontSize: '16px' }}
                                    />
                                    <StyledButtonInvite
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                            Modal.confirm({
                                                centered: true,
                                                title: 'Are you sure you want to delete this spending plan?',
                                                content: 'This action cannot be undone.',
                                                okText: 'Yes, Delete',
                                                okType: 'danger',
                                                cancelText: 'Cancel',
                                                onOk: () => {
                                                    dispatch(deleteSpendingPlanThunk(currentSpendingPlan.id));
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            )}
                        </TitleSection>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <Tag color={
                                currentSpendingPlan.approvalStatus === "PREPARING" ? "orange"
                                    : currentSpendingPlan.approvalStatus === "SUBMITED" ? "blue"
                                        : currentSpendingPlan.approvalStatus === "APPROVED" ? "green"
                                            : "red"
                            }>
                                <b>{currentSpendingPlan.approvalStatus} at {currentSpendingPlan.approvalStatus === "PREPARING" ? moment(currentSpendingPlan.createdDate).format("DD/MM/YYYY hh:mm A") : moment(currentSpendingPlan.updatedDate).format("DD/MM/YYYY hh:mm A")}</b>
                            </Tag>
                            <b>Total: {spendingItems.reduce((total, item) => total + (item.estimatedCost || 0), 0).toLocaleString()} VND</b>
                            <b>Extra fund: {currentSpendingPlan.maxExtraCostPercentage ?? 0}%</b>

                        </div>
                    </Header>

                    <SpendingPlanModal
                        form={updatePlanForm}
                        project={currentProject}
                        isOpenModal={isOpenUpdatePlanModal}
                        setIsOpenModal={setIsOpenUpdatePlanModal}
                        spendingPlan={currentSpendingPlan}
                        handleSubmit={handleUpdateSpendingPlan}
                        title="Update"
                    />

                    {isLeader && ["PREPARING", "REJECTED"].includes(currentSpendingPlan.approvalStatus) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {currentSpendingPlan.approvalStatus === "REJECTED" && (
                                    <Button
                                        danger
                                        onClick={() => {
                                            Modal.info({
                                                centered: true,
                                                title: 'Reason for Rejection',
                                                content: <p>{currentSpendingPlan.reason}</p>,
                                                onOk() { }
                                            });
                                        }}
                                    >
                                        View Reason
                                    </Button>
                                )}
                                <StyledButtonInvite icon={<PlusOutlined />} onClick={() => setIsOpenCreateItemModal(true)}>
                                    Add Item
                                </StyledButtonInvite>
                            </div>
                        </div>
                    )}

                    <SpendingItemModal
                        form={createItemForm}
                        project={currentProject}
                        isOpenModal={isOpenCreateItemModal}
                        setIsOpenModal={setIsOpenCreateItemModal}
                        handleSubmit={handleAddSpendingItem}
                        title="Create"
                    />

                    <SpendingItemModal
                        form={updateItemForm}
                        project={currentProject}
                        isOpenModal={isOpenUpdateItemModal}
                        setIsOpenModal={setIsOpenUpdateItemModal}
                        spendingItem={selectedSpendingItem}
                        handleSubmit={handleUpdateSpendingItem}
                        title="Update"
                    />

                    {spendingItems?.length > 0 ? (
                        <>
                            <Table
                                rowKey="id"
                                columns={columns.filter(Boolean)}
                                style={{ marginTop: 20 }}
                                dataSource={spendingItems}
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: spendingItems.length,
                                    showSizeChanger: true,
                                    pageSizeOptions: ["5", "10", "20", "50"],
                                    onChange: (page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    },
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                                }}
                            />
                            {["PREPARING", "REJECTED"].includes(currentSpendingPlan.approvalStatus) && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                                    <StyledButtonSubmit
                                        onClick={() => {
                                            Modal.confirm({
                                                title: 'Submit Spending Plan',
                                                content: 'Are you sure you want to submit this plan for approval?',
                                                okText: 'Yes, Submit',
                                                cancelText: 'Cancel',
                                                centered: true,
                                                onOk: () => {
                                                    handleSubmit();
                                                }
                                            });
                                        }}
                                    >
                                        Submit
                                    </StyledButtonSubmit>
                                </div>
                            )}
                        </>
                    ) : (
                        <Empty
                            title="No Spending Items"
                            description="Please add a spending item to get started."
                            style={{ marginTop: 32 }}
                        />
                    )}


                </>
            ) : (
                <Empty
                    title="No Spending Plan Found"
                    description="Please create a spending plan."
                    style={{ marginTop: 32 }}
                />
            )}
            <SpendingPlanModal form={createPlanForm} project={currentProject}
                isOpenModal={isOpenCreatePlanModal} setIsOpenModal={setIsOpenCreatePlanModal}
                handleSubmit={handleAddSpendingPlan} title="Create" />
        </SpendingPlanFlex>
    );
}
export default ProjectSpendingPlanContainer;