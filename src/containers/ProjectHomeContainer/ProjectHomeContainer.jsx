import React, { useEffect, useMemo, useState } from 'react'; // Added useMemo, useState
import { Card, Row, Col, Typography, Carousel, Flex, Tag, Empty, Spin,Skeleton, Statistic, Progress } from 'antd'; // Added Statistic, Progress, Spin
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import dayjs from 'dayjs'; // For date formatting

// --- Import Thunks ---
import {
    fetchProjectById,
    fetchAllProjectMembersThunk,
    fetchDonationsOfProject,
    fetchSpendingDetailsByProject
} from '../../redux/project/projectSlice';
import {
    getTasksOfProject,
    getAllPhasesByProjectId
} from '../../redux/project/timelineSlice'; // Assuming timelineSlice holds phases/tasks

const { Title, Text, Paragraph } = Typography; // Added Paragraph

const StyledScreen = styled.div`
  /* Keep existing styles */
  height: 100vh;
  overflow-y: auto;
   scrollbar-width: none; /* Firefox */
   &::-webkit-scrollbar { /* WebKit */
    display: none;
  }
   display:flex;
   flex-direction: column;
   gap:1.5rem; /* Adjusted gap slightly */
   padding: 1rem; /* Add some overall padding */
`;

const CarouselImage = styled.img`
  width: 100%;
  height: 23rem; /* Consider making height responsive or use aspect-ratio */
  object-fit: cover;
  border-radius: 8px;
  display: block; /* Fix potential spacing issues */
`;

const StatCard = styled(Card)`
  height: 100%; // Make cards in a row equal height
  .ant-card-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between; // Align content if height varies
  }
`;

// Helper function for currency formatting
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};


const ProjectHomeContainer = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Selectors for all required data ---
    const currentProjectData = useSelector((state) => state.project.currentProject);
    const members = useSelector((state) => state.project.allProjectMembers);
    const donations = useSelector((state) => state.project.donations);
    const spendingDetails = useSelector((state) => state.project.spendingDetails);
    const phases = useSelector((state) => state.timeline.phases); // Assuming timeline slice structure
    const tasks = useSelector((state) => state.timeline.tasks);     // Assuming timeline slice structure

    // --- Fetch Data ---
    useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        console.log("Fetching data for projectId:", projectId);

        Promise.all([
            dispatch(fetchProjectById(projectId)),
            dispatch(fetchAllProjectMembersThunk(projectId)),
            dispatch(fetchDonationsOfProject(projectId)),
            dispatch(fetchSpendingDetailsByProject(projectId)),
            dispatch(getAllPhasesByProjectId(projectId)),
            dispatch(getTasksOfProject(projectId))
        ]).then(() => {
            console.log("Data fetching complete");
            setLoading(false);
        }).catch((err) => {
            console.error("Error fetching project home data:", err);
            setError("Failed to load project details. Please try again.");
            setLoading(false);
        });

    }, [projectId, dispatch]);

    // --- Calculate Statistics using useMemo ---
    const statistics = useMemo(() => {
        if (!currentProjectData?.project) return null;

        // Active Members
        const activeMembers = members?.filter(m => m.leaveDate === null).length || 0;

        // Total Donations
        const totalDonationsReceived = donations
            ?.filter(d => d.donationStatus?.toUpperCase() === 'COMPLETED') // Adjust status name if needed
            .reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;

        // Total Spending
        const totalSpending = spendingDetails
            ?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;

        // Phases Completed
        const completedPhases = phases?.filter(p => p.phase.status?.toUpperCase() === 'FINISHED').length || 0; // Adjust status name if needed
        const totalPhases = phases?.length || 0;

        // Tasks Completed
        const completedTasks = tasks?.filter(t => !t.parentTask && (t.status?.statusName?.toUpperCase() === 'DONE')).length || 0;
        const totalTasks = tasks?.filter(t => !t.parentTask).length || 0; // Count only parent tasks for total

        // Project Dates
        const { plannedStartTime, plannedEndTime, actualStartTime, actualEndTime } = currentProjectData.project;

        return {
            activeMembers,
            totalDonationsReceived,
            totalSpending,
            completedPhases,
            totalPhases,
            completedTasks,
            totalTasks,
            plannedStartTime,
            plannedEndTime,
            actualStartTime,
            actualEndTime,
        };
    }, [currentProjectData, members, donations, spendingDetails, phases, tasks]); // Dependencies


    // --- Render Logic ---
    if (loading) {
        return <Flex justify="center" align="center" style={{ height: '600px' }}><Skeleton active paragraph={{row:10}}/></Flex>;
    }

    if (error) {
        return <Flex justify="center" align="center" style={{ height: '80vh' }}><Text type="danger">{error}</Text></Flex>;
    }

    if (!currentProjectData?.project) {
        return <Empty description="Project data not found." />;
    }

    const { project, attachments = [] } = currentProjectData;

    return (
        <StyledScreen>
            {/* --- Image Carousel --- */}
            {attachments.length > 0 ? (
                <Carousel autoplay={{ delay: 5000 }} /* Removed dotDuration, use delay */ dots={{ className: 'custom-dots' }} >
                    {attachments.map((att, index) => (
                        <div key={att.id || index}> {/* Use attachment ID if available */}
                            <CarouselImage
                                src={att.imageUrl}
                                alt={`Project image ${index + 1}`}
                            />
                        </div>
                    ))}
                </Carousel>
            ) : (
                <Card>
                    <Empty description="No project images available." />
                </Card>
            )}

            {/* --- Welcome Card --- */}
            <Card>
                <Flex justify='space-between' align='flex-start' wrap="wrap">
                    <Title level={3} style={{ marginBottom: '0.5rem' }}>Welcome to {project.projectName}</Title>
                    {/* Link to Organization Page - Adjust path if needed */}
                    <Link to={`/organizations/${project.organization?.id || '#'}`}>
                         <Tag color="blue" style={{ cursor: 'pointer' }}>
                             Managed by: {project.organizationName?.toUpperCase() || 'N/A'}
                         </Tag>
                     </Link>
                </Flex>
                <Paragraph type="secondary" style={{ marginBottom: '1rem' }}>
                    {project.projectDescription?.substring(0, 150)}{project.projectDescription?.length > 150 ? '...' : ''}
                </Paragraph>
                 <Text>Click <Link to={`/projects/${project.id}`}>here</Link> to navigate to the project details.</Text>
            </Card>

            {/* --- Statistics Section --- */}
            {statistics && (
                <Card title={<Title level={4} style={{ margin: 0 }}>Project Snapshot</Title>}>
                    <Row gutter={[16, 16]}>
                        {/* Column 1: Members */}
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <StatCard bordered={false}>
                                <Statistic title="Active Members" value={statistics.activeMembers} />
                            </StatCard>
                        </Col>

                        {/* Column 2: Donations */}
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <StatCard bordered={false}>
                                <Statistic title="Donations Received" value={formatCurrency(statistics.totalDonationsReceived)} />
                            </StatCard>
                        </Col>

                        {/* Column 3: Spending */}
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <StatCard bordered={false}>
                                <Statistic title="Total Spending" value={formatCurrency(statistics.totalSpending)} />
                            </StatCard>
                        </Col>

                         {/* Column 4: Project Timeline */}
                         <Col xs={24} sm={12} md={8} lg={6}>
                             <StatCard bordered={false} title="Project Timeline">
                                 <Flex vertical gap="small">
                                     <Text strong>Planned:</Text>
                                     <Text>
                                         {statistics.plannedStartTime ? dayjs(statistics.plannedStartTime).format('DD/MM/YYYY') : 'N/A'}
                                         {' - '}
                                         {statistics.plannedEndTime ? dayjs(statistics.plannedEndTime).format('DD/MM/YYYY') : 'N/A'}
                                     </Text>
                                     <Text strong style={{ marginTop: '8px' }}>Actual:</Text>
                                     <Text>
                                         {statistics.actualStartTime ? dayjs(statistics.actualStartTime).format('DD/MM/YYYY') : 'Not Started'}
                                         {' - '}
                                         {statistics.actualEndTime ? dayjs(statistics.actualEndTime).format('DD/MM/YYYY') : (statistics.actualStartTime ? 'Ongoing' : 'N/A')}
                                     </Text>
                                 </Flex>
                             </StatCard>
                         </Col>

                        {/* Column 5: Phases */}
                         <Col xs={24} sm={12} md={8} lg={6}>
                             <StatCard bordered={false} title="Phases Progress">
                                {statistics.totalPhases > 0 ? (
                                    <Flex align="center" gap="small">
                                        <Progress
                                            type="circle"
                                            percent={Math.round((statistics.completedPhases / statistics.totalPhases) * 100)}
                                            size={60}
                                        />
                                        <Text>{statistics.completedPhases} / {statistics.totalPhases} Completed</Text>
                                    </Flex>
                                ) : (
                                    <Text type="secondary">No phases defined</Text>
                                )}
                             </StatCard>
                         </Col>


                        {/* Column 6: Tasks */}
                        <Col xs={24} sm={12} md={8} lg={6}>
                             <StatCard bordered={false} title="Tasks Progress">
                                {statistics.totalTasks > 0 ? (
                                     <Flex align="center" gap="small">
                                         <Progress
                                             type="circle"
                                             percent={Math.round((statistics.completedTasks / statistics.totalTasks) * 100)}
                                             size={60}
                                             status={statistics.completedTasks === statistics.totalTasks ? 'success' : 'normal'}
                                         />
                                          <Text>{statistics.completedTasks} / {statistics.totalTasks} Completed</Text>
                                     </Flex>
                                ) : (
                                    <Text type="secondary">No tasks defined</Text>
                                )}
                             </StatCard>
                        </Col>

                    </Row>
                </Card>
            )}

            {/* Remove Duplicate Cards */}
            {/* <Card style={{ marginBottom: 24 }}> ... </Card> */}
            {/* <Card style={{ marginBottom: 24 }}> ... </Card> */}

        </StyledScreen>
    );
};

export default ProjectHomeContainer;