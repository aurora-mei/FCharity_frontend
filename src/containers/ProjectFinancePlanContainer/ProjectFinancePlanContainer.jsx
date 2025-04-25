import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Card, Button, Tag, Input, Typography, Flex, Form, Empty, Table, Upload, Skeleton,
    Tooltip, Modal, Progress, message, Row, Col, Statistic
} from 'antd';
import {
    DeleteOutlined, DownloadOutlined, EditOutlined, PlusOutlined, UploadOutlined,
    DollarCircleOutlined,
    BankOutlined,
    WalletOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import {
    deleteSpendingItemThunk, fetchProjectById, deleteSpendingPlanThunk,
    fetchSpendingTemplateThunk, importSpendingPlanThunk, fetchSpendingDetailsByProject,
    fetchDonationsOfProject, fetchSpendingPlanOfProject, fetchSpendingItemOfPlan,
    createSpendingPlanThunk, createSpendingItemThunk, updateSpendingPlanThunk,
    updateSpendingItemThunk ,fetchProjectWallet,
    fetchExpenseTemplateThunk
} from '../../redux/project/projectSlice';
import WithdrawRequestModal from '../../components/WithdrawRequestModal/WithdrawRequestModal';
// Assuming these components exist and are correctly imported
// import SpendingPlanModal from '../../components/SpendingPlanModal/SpendingPlanModal';
// import SpendingItemModal from '../../components/SpendingItemModal/SpendingItemModal';
import ProjectDonationContainer from '../ProjectDonationContainer/ProjectDonationContainer';
import ProjectSpendingDetailContainer from '../ProjectSpendingDetailContainer/ProjectSpendingDetailContainer';
import ProjectSpendingPlanContainer from '../ProjectSpendingPlanContainer/ProjectSpendingPlanContainer';

const { Title, Text } = Typography;

// Styled components
export const SpendingPlanFlex = styled(Flex)`
  width: 100%;
  flex-direction: column;
  border-radius:0.5rem;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 8px 0px;
  padding:2rem;
  background: #fff; // This applies to the Flex container itself if used
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
    .ant-btn{
        span{
            font-size: 0.7rem !important;
        }
    }
`;
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
    .ant-btn{
        span{
            font-size: 1rem !important;
        }
    }
`;

// Corrected StyledCard to target the card body for background color
const StyledCard = styled(Card)`
    border-radius: 0.5rem;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 8px 0px;
    width: 100%; /* Ensure card takes full width */
    background-color: #fff; /* Set outer card background */

    .ant-card-head {
        /* Optional: Style header if needed */
        background-color: #fff;
         border-bottom: 1px solid #f0f0f0; /* Add a subtle separator */
    }

    .ant-card-body {
       background-color: #fff !important; /* Ensure card body is white */
       padding: 16px; /* Adjust padding as needed */
       /* Remove default padding if you want content flush against edges */
       /* padding: 0; */
    }
`;

const StatisticCard = styled(Card)`
    border-radius: 0.5rem;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 3px 0px;
    background-color: #fff !important;
     border: 1px solid #f0f0f0;

     .ant-card-body {
       background-color: #fff !important;
       padding: 16px !important;
     }

     /* Target the container holding the prefix and value */
     .ant-statistic-content {
        display: flex;         /* Use flexbox */
        align-self: center;   /* Align items vertically centered */
        gap: 8px;              /* Add space between icon and value */
        /* You might need 'align-items: baseline;' if 'center' isn't quite right */
        /* align-items: baseline; */
     }

     /* Optional: Ensure prefix (icon) itself is centered if needed */
     .ant-statistic-content-prefix {
        display: inline-flex;
        align-items: center;
     }

      /* Optional: Adjust value styling if needed */
      .ant-statistic-content-value {
       /* line-height: 1; /* Sometimes helps with baseline alignment */
     }
`;





// --- Main Component ---
const ProjectFinancePlanContainer = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { projectId } = useParams();
    const [isOpenWithdrawalModal, setIsOpenWithdrawalModal] = useState(false);
    // --- Redux State ---
    const currentProject = useSelector((state) => state.project.currentProject);
    const spendingItems = useSelector((state) => state.project.spendingItems);
    const currentSpendingPlan = useSelector((state) => state.project.currentSpendingPlan);
    const currentUser = useSelector((state) => state.auth.currentUser);
    const spendingDetails = useSelector((state) => state.project.spendingDetails);
    const donations = useSelector((state) => state.project.donations);
    const projectWallet = useSelector((state) => state.project.projectWallet);

    // --- Local State ---
    const [isLeader, setIsLeader] = useState(false);
    const [loading, setLoading] = useState(true); // Added loading state

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (projectId) {
                await Promise.all([
                    dispatch(fetchProjectById(projectId)),
                    dispatch(fetchDonationsOfProject(projectId)),
                    dispatch(fetchSpendingDetailsByProject(projectId))
                ]);
            }
            // Set loading to false after initial project/donation/details fetch
            // Plan/Items fetch happens in subsequent effects
            // This prevents showing "Loading..." for too long if plan takes time
            setLoading(false);
        };
        fetchData();
    }, [projectId, dispatch]);

    useEffect(() => {
        // Fetch spending plan associated with the project *after* project loads
        if (currentProject?.project?.id) {
            dispatch(fetchProjectWallet(currentProject.project.walletId));
            dispatch(fetchSpendingPlanOfProject(currentProject.project.id));
        }
        // Determine leader status
        setIsLeader(currentProject?.project?.leader?.id === currentUser?.id);

    }, [currentProject, currentUser?.id, dispatch]); // Added currentUser.id dependency

    useEffect(() => {
        // Fetch items for the specific plan *after* the plan loads
        if (currentSpendingPlan?.id) {
            // No need to set loading here
            dispatch(fetchSpendingItemOfPlan(currentSpendingPlan.id));
        }
    }, [currentSpendingPlan, dispatch]);

    // --- Calculations ---
    const currentDonationAmount = donations
        ?.filter((d) => d.donationStatus === "COMPLETED")
        .reduce((total, d) => total + d.amount, 0) || 0;

    const totalEstimatedCost = Array.isArray(spendingItems)
        ? spendingItems.reduce((total, item) => total + (Number(item.estimatedCost) || 0), 0)
        : 0;

    const currentExpenseAmount = spendingDetails
        ?.reduce((total, d) => total + d.amount, 0) || 0;

    const remainingBalance = currentDonationAmount - currentExpenseAmount;

    // --- Progress Bar Calculations ---
    const donationPercentage = totalEstimatedCost > 0
        ? Math.min(100, (currentDonationAmount / totalEstimatedCost) * 100)
        : 0;
    const donationProgressStatus = donationPercentage >= 100 ? 'success' : 'normal';

    const expensePercentage = totalEstimatedCost > 0
        ? Math.min(100, (currentExpenseAmount / totalEstimatedCost) * 100)
        : 0;
    const expenseProgressStatus = expensePercentage >= 100 ? 'success' : 'normal';

    // --- Render Logic ---
    const formatCurrency = (amount) => {
        // Ensure amount is a number before formatting
        const numericAmount = Number(amount) || 0;
        return numericAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    // Updated Loading Check
    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '600px' }}>
                <Skeleton active paragraph={{ rows: 10 }} title={{ width: '30%' }} />
            </Flex>
        );
    }

    // Check if project data is available after loading is false
    if (!currentProject?.project) {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '200px' }}>
                <Empty description="Could not load project data." />
            </Flex>
        );
    }


    return (
        <Flex vertical gap="2rem" style={{ padding: "1rem" }}>

            {/* --- 1. Summary Section --- */}
            <StyledCard> {/* Use StyledCard here */}
                <Flex justify="space-between" align="center" wrap="wrap" gap="1rem">
                    {/* Financial Summary Cards */}
                    <Row gutter={[16, 16]} style={{ flexGrow: 1 }}>
                        <Col xs={24} sm={12} md={6}> {/* Adjusted grid for better spacing */}
                            {/* Use StatisticCard for individual stats */}
                            <StatisticCard bordered={false}>
                                <Statistic
                                    title="Donations Received"
                                    value={formatCurrency(currentDonationAmount)}
                                    precision={0} // Ensure whole numbers if preferred
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<DollarCircleOutlined />}
                                />
                            </StatisticCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}> {/* Adjusted grid */}
                            <StatisticCard bordered={false}>
                                <Statistic
                                    title="Expenses Paid"
                                    value={formatCurrency(currentExpenseAmount)}
                                    precision={0}
                                    valueStyle={{ color: '#cf1322' }}
                                    prefix={<BankOutlined />}
                                />
                            </StatisticCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}> {/* Adjusted grid */}
                            <StatisticCard bordered={false}>
                                <Statistic
                                    title="Remaining Funds"
                                    value={formatCurrency(remainingBalance)}
                                    precision={0}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix={<WalletOutlined />}
                                />
                            </StatisticCard>
                        </Col>
                        <Col xs={24} sm={12} md={6}> {/* Adjusted grid */}
                            <StatisticCard bordered={false}>
                                <Statistic
                                    title="Balance"
                                    value={formatCurrency(projectWallet.balance)}
                                    precision={0}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix={<WalletOutlined />}
                                />
                            </StatisticCard>
                        </Col>
                    </Row>
                    {/* Withdrawal Button */}
                    {isLeader && currentProject.project.projectStatus === "ACTIVE" && (
                        <Button
                            type="primary"
                            icon={<BankOutlined />}
                            onClick={()=>setIsOpenWithdrawalModal(true)}
                            style={{ backgroundColor: 'green', borderColor: 'green', marginLeft: 'auto' }} // Ensure button aligns well
                        >
                            Request Withdrawal
                        </Button>
                    )}
                    <WithdrawRequestModal form={form} isOpenWithdrawalModal={isOpenWithdrawalModal} setIsOpenWithdrawalModal={setIsOpenWithdrawalModal} />

                </Flex>
            </StyledCard>

            {/* --- 2. Spending Plan Section --- */}
            {/* Assuming ProjectSpendingPlanContainer renders its own Card/StyledCard */}
            <ProjectSpendingPlanContainer
                isLeader={isLeader}
                currentProject={currentProject}
            />

            {/* --- 3. Donation Section --- */}
            {/* Conditionally render based on plan existence OR if donations exist */}
            {(currentSpendingPlan || donations?.length > 0) && (
                <StyledCard title={<Title level={4} style={{ margin: 0 }}>Donations</Title>}>
                    {totalEstimatedCost > 0 ? (
                        <Flex vertical gap="1rem">
                            {/* Progress bar section */}
                            <StyledCard> {/* Removed extra styling, StyledCard handles background */}
                                <Text strong>Funding Progress vs. Estimated Cost</Text>
                                <Tooltip title={`${donationPercentage.toFixed(1)}% Funded (${formatCurrency(currentDonationAmount)} / ${formatCurrency(totalEstimatedCost)})`}>
                                    <Progress
                                        percent={donationPercentage}
                                        status={donationProgressStatus}
                                        strokeColor={donationProgressStatus === 'success' ? '#52c41a' : undefined}
                                        format={(percent) => `${percent?.toFixed(1)}% (${formatCurrency(currentDonationAmount)} / ${formatCurrency(totalEstimatedCost)})`}
                                    />
                                </Tooltip>
                            </StyledCard>
                            {/* Donation List */}
                            <ProjectDonationContainer />
                        </Flex>
                    ) : (
                        donations?.length > 0 ? (
                            <Flex vertical gap="1rem">
                                <StyledCard>
                                    <Text strong>Total Donations Received: {formatCurrency(currentDonationAmount)}</Text>
                                    {/* Display only if plan exists but cost is 0 */}
                                    {currentSpendingPlan && <Text style={{ display: 'block', color: 'orange', margin: '8px 0' }}>
                                        (Spending plan items not found or have zero estimated cost. Progress relative to estimate cannot be shown.)
                                    </Text>}
                                </StyledCard>
                                <ProjectDonationContainer />
                            </Flex>
                        ) : (
                            /* This case should ideally not be hit if outer condition is correct,
                               but kept for safety. Shows if plan exists but no donations & no cost */
                            <Empty description="No donations received yet." />
                        )
                    )}
                </StyledCard>
            )}


            {/* --- 4. Expense Section --- */}
            {/* Conditionally render based on plan existence OR if expenses exist */}
            {(currentSpendingPlan || spendingDetails?.length > 0) && (
                <StyledCard title={<Title level={4} style={{ margin: 0 }}>Expenses</Title>}>
                    {totalEstimatedCost > 0 ? (
                        <Flex vertical gap="1rem">
                            {/* Progress bar section */}
                            <StyledCard>
                                <Text strong>Expense Progress vs. Estimated Cost</Text>
                                <Tooltip title={`${expensePercentage.toFixed(1)}% Expensed (${formatCurrency(currentExpenseAmount)} / ${formatCurrency(totalEstimatedCost)})`}>
                                    <Progress
                                        percent={expensePercentage}
                                        status={expenseProgressStatus} // 'success' might mean fully expensed based on estimate
                                        strokeColor={expenseProgressStatus === 'success' ? '#52c41a' : undefined}
                                        format={(percent) => `${percent?.toFixed(1)}% (${formatCurrency(currentExpenseAmount)} / ${formatCurrency(totalEstimatedCost)})`}
                                    />
                                </Tooltip>
                            </StyledCard>
                            {/* Expense List */}
                            <ProjectSpendingDetailContainer
                                isLeader={isLeader}
                                spendingDetails={spendingDetails}
                            />
                        </Flex>
                    ) : (
                        spendingDetails?.length > 0 ? (
                            <Flex vertical gap="1rem">
                                <StyledCard>
                                    <Text strong>Total Expenses Paid: {formatCurrency(currentExpenseAmount)}</Text>
                                    {/* Display only if plan exists but cost is 0 */}
                                    {currentSpendingPlan && <Text style={{ display: 'block', color: 'orange', margin: '8px 0' }}>
                                        (Spending plan items not found or have zero estimated cost. Progress relative to estimate cannot be shown.)
                                    </Text>}
                                </StyledCard>
                                <ProjectSpendingDetailContainer
                                    isLeader={isLeader}
                                    spendingDetails={spendingDetails}
                                />
                            </Flex>
                        ) : (
                            /* This case should ideally not be hit if outer condition is correct,
                               but kept for safety. Shows if plan exists but no expenses & no cost */
                            <Empty description="No expenses recorded yet." />
                        )
                    )}
                </StyledCard>
            )}

            {/* Final Empty state if nothing exists */}
            {!loading && !currentSpendingPlan && !donations?.length && !spendingDetails?.length && (
                <StyledCard>
                    <Empty description="No spending plan, donations, or expenses found for this project yet." />
                </StyledCard>
            )}

        </Flex >
    );
};

export default ProjectFinancePlanContainer;