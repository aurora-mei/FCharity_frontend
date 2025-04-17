import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, Button, Tag, Input, Typography, Flex, Form, Empty, Table } from 'antd';
import { DownloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { deleteSpendingItemThunk, fetchProjectById } from '../../redux/project/projectSlice';
import { useEffect } from 'react';
import {
    fetchSpendingTemplateThunk, importSpendingPlanThunk,
    fetchSpendingPlanOfProject, fetchSpendingItemOfPlan, createSpendingPlanThunk
    , createSpendingItemThunk, updateSpendingPlanThunk, updateSpendingItemThunk
} from '../../redux/project/projectSlice';
import SpendingPlanModal from '../../components/SpendingPlanModal/SpendingPlanModal';
import SpendingItemModal from '../../components/SpendingItemModal/SpendingItemModal';
const { Title } = Typography;

const SpendingPlanFlex = styled(Flex)`
  width: 100%;
  flex-direction: column;
  border-radius:1rem;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 8px 0px;
  padding:2rem;
    background: #fff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const SpendingItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
`;
const StyledButtonInvite = styled(Button)`
    background-color: #fff !important;
    border: 1px solid green !important;
    padding: 1rem !important;
      transition: all 0.3s ease;
    .anticon svg{
        color: green !important;
        }
    &:hover{
        background-color: #fff !important;
        border: 1px solid green !important;
        padding: 1rem !important;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        .anticon svg{
            color: green !important;
            }
        }
}
    .ant-btn{
        span{
            color: green !important;
            font-size: 1rem !important;
            }
        }    
  

}`

const ProjectFinancePlanContainer = () => {
    const dispatch = useDispatch();
    const { projectId } = useParams();
    const currentProject = useSelector((state) => state.project.currentProject);
    const spendingItems = useSelector((state) => state.project.spendingItems);
    const currentSpendingPlan = useSelector((state) => state.project.currentSpendingPlan);
    const currentSpendingItem = useSelector((state) => state.project.currentSpendingItem);
    const [selectedSpendingItem, setSelectedSpendingItem] = useState(null);
    const [selectedSpendingPlan, setSelectedSpendingPlan] = useState(null);
    const [downloadTemplate, setDownloadTemplate] = useState(false);
    const [isOpenCreatePlanModal, setIsOpenCreatePlanModal] = useState(false);
    const [isOpenUpdatePlanModal, setIsOpenUpdatePlanModal] = useState(false);
    const [isOpenCreateItemModal, setIsOpenCreateItemModal] = useState(false);
    const [isOpenUpdateItemModal, setIsOpenUpdateItemModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [isLeader, setIsLeader] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
        dispatch(fetchProjectById(projectId));
        if (currentProject && currentProject.project) {
            console.log(currentProject.project.id);
            dispatch(fetchSpendingPlanOfProject(currentProject.project.id));
        }
    }, [projectId, dispatch]);
    useEffect(() => {
        if (currentSpendingPlan && currentSpendingPlan.id) {
            dispatch(fetchSpendingItemOfPlan(currentSpendingPlan.id));
        }
    }, [currentSpendingPlan, dispatch]);
    useEffect(() => {
        console.log("curr", currentSpendingPlan)
        if (currentProject && currentProject.project && currentProject.project.leader.id === currentUser.id) {
            console.log(currentProject && currentProject.project && currentProject.project.leader.id === currentUser.id)
            setIsLeader(true);
        }
        setTotalItems(spendingItems.length);
        console.log("isLeader", currentSpendingPlan.approvalStatus !== "PREPARING");
    }, [currentSpendingPlan, spendingItems,currentProject.project]);

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
        form.resetFields();
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
        },
        {
            title: "Note",
            dataIndex: "note",
            key: "note",
        },
        isLeader && currentSpendingPlan.approvalStatus === "PREPARING" && {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <>
                    <Button
                        size="small"
                        style={{ marginRight: 8 }}
                        onClick={() => {
                            console.log("record", record);
                            setSelectedSpendingItem(record);
                            console.log("selectedSpendingItem", selectedSpendingItem);
                            setIsOpenUpdateItemModal(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        danger
                        onClick={() => handleDeleteSpendingItem(record)}
                    >
                        Delete
                    </Button>
                    <SpendingItemModal
                        form={form}
                        project={currentProject}
                        isOpenModal={isOpenUpdateItemModal}
                        setIsOpenModal={setIsOpenUpdateItemModal}
                        spendingItem={selectedSpendingItem}
                        handleSubmit={handleUpdateSpendingItem}
                        title="Update"
                    />
                </>
            ),
        },
    ];

    return (
        <div style={{padding:'2rem'}}>
            {currentProject && currentProject.project && (
                (!currentSpendingPlan.id) ? (
                    <>
                        <SpendingPlanFlex>
                            {isLeader &&
                                (
                                    <>
                                        <StyledButtonInvite icon={<PlusOutlined />} onClick={() => setIsOpenCreatePlanModal(true)} />
                                        <Button title="Click here to download creating spending plan template" onClick={() => {
                                            dispatch(fetchSpendingTemplateThunk(currentProject.project.id));
                                            setDownloadTemplate(true);
                                        }}>Download template</Button>
                                        {downloadTemplate && (
                                            <Form>
                                                <Form.Item>
                                                    <Input
                                                        type="file"
                                                        accept=".xlsx"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            dispatch(importSpendingPlanThunk({ file, projectId: currentProject.project.id }));
                                                        }}
                                                    />
                                                </Form.Item>
                                                <Form.Item>
                                                    <Button type="primary" htmlType="submit">
                                                        Upload
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                        )}
                                    </>
                                )}
                        </SpendingPlanFlex>
                        <SpendingPlanModal form={form} project={currentProject} isOpenModal={isOpenCreatePlanModal} setIsOpenModal={setIsOpenCreatePlanModal} handleSubmit={handleAddSpendingPlan} title="Create" />
                    </>
                ) : (
                    <SpendingPlanFlex>
                        <Header>
                            <TitleSection>
                                <Title level={4}>{(currentSpendingPlan && currentSpendingPlan.planName) ? `${currentSpendingPlan.planName}` : ""}</Title>
                                {isLeader || currentSpendingPlan.approvalStatus === "PREPARING" &&
                                    <StyledButtonInvite icon={<EditOutlined
                                        onClick={() => setIsOpenUpdatePlanModal(true)}
                                        style={{ cursor: 'pointer', fontSize: "1rem" }} />}></StyledButtonInvite>}
                            </TitleSection>
                            <SpendingPlanModal form={form} project={currentProject} isOpenModal={isOpenUpdatePlanModal} setIsOpenModal={setIsOpenUpdatePlanModal} spendingPlan={currentSpendingPlan} handleSubmit={handleUpdateSpendingPlan} title="Update" />

                            {currentSpendingPlan.approvalStatus !== "PREPARING" ? (
                                <Tag color="orange">{currentSpendingPlan.approvalStatus}</Tag>
                            ) : isLeader ? (
                                <div>
                                    <ButtonGroup>
                                        <b style={{ alignSelf: "center" }}>
                                            Total: {spendingItems.reduce((total, item) => total + (item.estimatedCost || 0), 0).toLocaleString()} VND
                                        </b>
                                        <StyledButtonInvite icon={<PlusOutlined />} onClick={() => setIsOpenCreateItemModal(true)} />
                                        <StyledButtonInvite icon={<DownloadOutlined />} title="Click here to download current spending plan details" />
                                    </ButtonGroup>

                                    <SpendingItemModal
                                        form={form}
                                        project={currentProject}
                                        isOpenModal={isOpenCreateItemModal}
                                        setIsOpenModal={setIsOpenCreateItemModal}
                                        handleSubmit={handleAddSpendingItem}
                                        title="Create"
                                    />
                                </div>
                            ) : null}

                        </Header>
                        {spendingItems && spendingItems.length > 0 ? (
                           <>
                            <Table
                                rowKey={(record) => record.id}
                                columns={columns.filter(Boolean)}
                                dataSource={spendingItems}
                                s pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: totalItems,
                                    showSizeChanger: true,
                                    pageSizeOptions: ["5", "10", "20", "50"],
                                    onChange: (page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    },
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                                }}
                            />
                      {currentSpendingPlan.approvalStatus ==="PREPARING" &&   <StyledButtonInvite type="primary" onClick={handleSubmit} style={{alignSelf:"flex-end"}}>Submit</StyledButtonInvite>}
                           </>
                        )
                            : (
                                <Empty title="No spending items found" description="Please add a spending item." style={{ marginTop: '20px' }} />
                            )}
                    </SpendingPlanFlex>
                )

            )}
        </div>
    );
};

export default ProjectFinancePlanContainer;
