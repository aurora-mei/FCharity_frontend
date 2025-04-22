import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, Button, Tag, Input, Typography, Flex, Form, Empty, Table, Upload, Tooltip, Modal, Progress } from 'antd';
import { DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { deleteSpendingItemThunk, fetchProjectById, deleteSpendingPlanThunk } from '../../redux/project/projectSlice';
import { useEffect } from 'react';
import {
    fetchSpendingTemplateThunk, importSpendingPlanThunk, fetchSpendingDetailsByProject, fetchDonationsOfProject,
    fetchSpendingPlanOfProject, fetchSpendingItemOfPlan, createSpendingPlanThunk
    , createSpendingItemThunk, updateSpendingPlanThunk, updateSpendingItemThunk
} from '../../redux/project/projectSlice';
import SpendingPlanModal from '../../components/SpendingPlanModal/SpendingPlanModal';
import SpendingItemModal from '../../components/SpendingItemModal/SpendingItemModal';
import ProjectDonationContainer from '../ProjectDonationContainer/ProjectDonationContainer';
import ProjectSpendingDetailContainer from '../ProjectSpendingDetailContainer/ProjectSpendingDetailContainer';
import ProjectSpendingPlanContainer from '../ProjectSpendingPlanContainer/ProjectSpendingPlanContainer';
const { Title, Text } = Typography;

export const SpendingPlanFlex = styled(Flex)`
  width: 100%;
  flex-direction: column;
  border-radius:0.5rem;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 8px 0px;
  padding:2rem;
    background: #fff;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

`;

export const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const SpendingItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
`;
export const StyledButtonInvite = styled(Button)`
    background-color: #fff !important;
    // border: 1px solid green !important;
    padding: 1rem !important;
      transition: all 0.3s ease;
   color:black;
    font-size: 0.7rem !important;
    &:hover{
        background-color: #fff !important;
        border: 1px solid green !important;
        padding: 1rem !important;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
       color:black!important;
        }
}
    .ant-btn{
        span{
            font-size: 0.7rem !important;
            }
        }    
}`
export const StyledButtonSubmit = styled(Button)`
    background-color: green !important;
    padding: 1rem !important;
    border-radius: 0.5rem;
      transition: all 0.3s ease;
   color:white;
    &:hover{
        background-color: green !important;
        border: 1px solid green !important;
        padding: 1rem !important;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
       color:white!important;
        }
}
    .ant-btn{
        span{
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

    const currentUser = useSelector((state) => state.auth.currentUser);
    const [isLeader, setIsLeader] = useState(false);
    const spendingDetails = useSelector((state) => state.project.spendingDetails);
    const currentSpendingDetail = useSelector((state) => state.project.currentSpendingDetail);
    const donations = useSelector((state) => state.project.donations);


    useEffect(() => {
        dispatch(fetchProjectById(projectId));
        dispatch(fetchDonationsOfProject(projectId));
        if (currentProject && currentProject.project) {
            console.log(currentProject.project.id);
            dispatch(fetchSpendingPlanOfProject(currentProject.project.id));
            dispatch(fetchSpendingDetailsByProject(currentProject.project.id));
        }
    }, [projectId, dispatch]);
    useEffect(() => {
        if (currentSpendingPlan && currentSpendingPlan.id) {
            dispatch(fetchSpendingItemOfPlan(currentSpendingPlan.id));
        }
    }, [currentSpendingPlan, dispatch]);

    useEffect(() => {
        if (currentProject?.project?.leader?.id === currentUser?.id) {
            setIsLeader(true);
        } else {
            setIsLeader(false);
        }
        console.log(isLeader)
        console.log(isLeader && (currentSpendingPlan && currentSpendingPlan.approvalStatus === "PREPARING"))
    }, [currentProject, currentUser]);
    const currentDonationAmount = donations
        .filter((d) => d.donationStatus === "COMPLETED")
        .reduce((total, d) => total + d.amount, 0);
    const totalEstimatedCost = Array.isArray(spendingItems)
        ? spendingItems.reduce((total, item) => total + (Number(item.estimatedCost) || 0), 0)
        : 0;
    const donationPercentage = totalEstimatedCost > 0
        ? Math.min(100, (currentDonationAmount / totalEstimatedCost) * 100) // Cap at 100% for standard view, or let it exceed if desired
        : 0; // Avoid division by zero
    const progressStatus = donationPercentage >= 100 ? 'success' : 'normal';


    // --- Determine Expense Progress status ---
    const currentExpenseAmount = spendingDetails.reduce((total, d) => total + d.amount, 0);
    const expensePercentage = totalEstimatedCost > 0
        ? Math.min(100, (currentExpenseAmount / totalEstimatedCost) * 100) // Cap at 100% for standard view, or let it exceed if desired
        : 0; // Avoid division by zero
    const expenseProgressStatus = expensePercentage >= 100 ? 'success' : 'normal';
    return (
        <Flex vertical gap="2rem" style={{ padding: "1rem" }}>
            {currentProject && currentProject.project && (
                <>
                    <ProjectSpendingPlanContainer isLeader={isLeader}
                        currentProject={currentProject}
                        />
                    {donations && donations.length > 0 && (
                        <>
                            <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 8px 0px" }}>
                                <Text strong style={{ fontSize: "1.1rem" }}>Donation Progress</Text>
                                <Tooltip title={`${donationPercentage.toFixed(1)}% Funded (${currentDonationAmount.toLocaleString()} / ${totalEstimatedCost.toLocaleString()} VND)`}>
                                    <Progress
                                        percent={donationPercentage}
                                        status={progressStatus}
                                        strokeColor={donationPercentage >= 100 ? '#52c41a' : undefined} // Optional: explicit success color
                                        // format={(percent) => `${percent?.toFixed(1)}%`} // Optional: format text inside bar
                                        showInfo={true} // Show percentage text next to the bar
                                        format={(percent) => `${percent?.toFixed(1)}% Funded (${currentDonationAmount.toLocaleString()} / ${totalEstimatedCost.toLocaleString()} VND)`} // Optional: format text inside bar
                                    />
                                </Tooltip>
                            </div>
                            <ProjectDonationContainer />
                        </>
                    )}
                    {
                        spendingDetails && spendingDetails.length > 0 && (
                            <>  <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "0.5rem", boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 8px 0px" }}>
                            <Text strong style={{ fontSize: "1.1rem" }}>Expense Progress</Text>
                            <Tooltip title={`${expensePercentage.toFixed(1)}% Funded (${currentExpenseAmount.toLocaleString()} / ${totalEstimatedCost.toLocaleString()} VND)`}>
                                <Progress
                                    percent={expensePercentage}
                                    status={expenseProgressStatus}
                                    strokeColor={expensePercentage >= 100 ? '#52c41a' : undefined} // Optional: explicit success color
                                    // format={(percent) => `${percent?.toFixed(1)}%`} // Optional: format text inside bar
                                    showInfo={true} // Show percentage text next to the bar
                                    format={(percent) => `${percent?.toFixed(1)}% Expensed (${currentExpenseAmount.toLocaleString()} / ${totalEstimatedCost.toLocaleString()} VND)`} // Optional: format text inside bar
                                />
                            </Tooltip>
                        </div>
                        <ProjectSpendingDetailContainer spendingDetails={spendingDetails} />
                            </>
                        )
                    }
                  
                </>
            )
            }
        </Flex >
    );
};

export default ProjectFinancePlanContainer;
