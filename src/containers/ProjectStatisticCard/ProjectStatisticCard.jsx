import { useEffect, useState } from "react";
// Add Tooltip import
import { Card, Typography, Space, Button, Avatar, Progress, Modal, Skeleton, Tooltip } from "antd";
import { ShareAltOutlined, DollarOutlined, RiseOutlined, UserOutlined, FlagOutlined } from "@ant-design/icons";
import styled from "styled-components";
import moment from "moment-timezone";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendJoinRequestThunk, fetchProjectRequests, fetchActiveProjectMembers, fetchSpendingPlanOfProject } from "../../redux/project/projectSlice";
import PropTypes from "prop-types";

const { Title, Text } = Typography;

// --- Styled Components remain the same ---
const StyledWrapper = styled.div`
//   margin-top:2rem;
    padding:1rem;
  width: 100%;

  .donation-card {
    width: 100%;
     background: #fff !important;
     padding:1rem;
    border-radius: 1rem;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
     transition: all 0.3s ease; /* Smooth transition for hover effect */
    .ant-card-body{
        background: #fff !important;
        padding: 1rem !important; // Ensure padding
    }
    &:hover {
        // Optional: Keep hover effect even if card itself isn't clickable
        // cursor: pointer;
        transform: translateY(-0.3rem); /* Move the card up by 10px */
        box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px; /* Enhance shadow on hover */
    }
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .progress-container {
    text-align: center;
  }

  .full-width-button {
    width: 100%;
    font-weight: 600;
     transition: all 0.3s ease; /* Smooth transition for hover effect */

    &:hover:not(:disabled) { // Apply hover only when not disabled
        cursor: pointer;
        transform: translateY(-0.3rem); /* Move the card up by 10px */
        box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px; /* Enhance shadow on hover */
    }

  }

  .donation-item {
    display: flex;
    align-items: center;
  }

  .donation-info {
    margin-left: 8px;
  }

  .bottom-actions {
    display: flex;
    justify-content: space-between;
    gap:1rem;

    font-size: 0.9rem!important;
    .ant-btn:hover{
        background-color: #f0f0f0 !important;
        color: black !important;
        border-color: black !important;
    }
  }
    .custom-table .ant-table {
    font-size: 0.8rem;
}

.custom-table .ant-table-thead > tr > th {
    font-size: 1rem; /* Đặt kích thước chữ cho tiêu đề */
}

.custom-table .ant-table-tbody > tr > td {
    font-size: 0.9rem; /* Đặt kích thước chữ cho các ô dữ liệu */
}

`;
const StyledButton = styled(Button)`
    background-color:#fff;
    border-radius: 0.5rem;
    color: black;
   font-size: 1rem !important;
    font-weight: 500;
     border-color: black !important;
    padding:1rem;
    box-shadow:rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    &:hover{
        box-shadow: rgba(0, 0, 0, 0.3) 0px 7px 10px 0px;
        background-color: #fff !important;
        border-color: black !important;
        color: black !important;
    }
`;
// --- End Styled Components ---

const ProjectStatisticCard = ({ project, projectRequests, projectMembers, donations, isOpenModal, setIsOpenModal }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentSpendingPlan = useSelector((state) => state.project.currentSpendingPlan);
    const [currentDonationValue, setCurrentDonationValue] = useState(0);
    const [estimatedTotalCost, setEstimatedTotalCost] = useState(0);
    const [recentDonation, setRecentDonation] = useState([]);
    const [topDonation, setTopDonation] = useState([]);
    const [firstDonation, setFirstDonation] = useState([]);
    const loading = useSelector((state) => state.project.loading); // Get general loading state
    const loadingSpendingPlan = useSelector((state) => state.project.loadingSpendingPlan); // Specific loading state for spending plan

    const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }

    useEffect(() => {
        if (donations && donations.length >= 0) { // Check >= 0 to handle empty array case correctly
            const completedDonations = donations.filter(x => x.donationStatus === "COMPLETED");

             // Sort recent donations (within the last 24 hours for example, or just sort all completed)
             setRecentDonation(
                completedDonations
                    .slice() // Create a shallow copy before sorting
                    .sort((a, b) => moment(b.donationTime).diff(moment(a.donationTime)))
            );

            // Sort top donations
            setTopDonation(
                completedDonations
                    .slice() // Create a shallow copy
                    .sort((a, b) => b.amount - a.amount)
            );

            // Sort first donations
            setFirstDonation(
                completedDonations
                    .slice() // Create a shallow copy
                    .sort((a, b) => moment(a.donationTime).diff(moment(b.donationTime)))
            );

             // Calculate total donated amount
             setCurrentDonationValue(
                completedDonations.reduce((total, donation) => total + donation.amount, 0)
            );
        } else {
            // Reset if donations array is null or undefined
            setRecentDonation([]);
            setTopDonation([]);
            setFirstDonation([]);
            setCurrentDonationValue(0);
        }
    }, [donations]); // Rerun when donations change

    useEffect(() => {
        if (project?.id) {
            dispatch(fetchSpendingPlanOfProject(project.id));
        }
    }, [dispatch, project?.id]);

    useEffect(() => {
        // Set estimated cost when spending plan is loaded
        if (currentSpendingPlan) {
            setEstimatedTotalCost(currentSpendingPlan.estimatedTotalCost || 0); // Default to 0 if undefined
        } else {
            setEstimatedTotalCost(0); // Reset if no spending plan
        }
    }, [currentSpendingPlan]);

    // Fetch members and requests (can be kept separate, doesn't depend on donations/spending plan)
    useEffect(() => {
        if (project?.id) {
            dispatch(fetchProjectRequests(project.id));
            dispatch(fetchActiveProjectMembers(project.id));
        }
    }, [dispatch, project?.id]);


    const handleSendJoinRequest = () => {
         if (!currentUser || !currentUser.id) {
            console.error("Cannot send join request: User not logged in.");
            navigate("/auth/login"); // Redirect if user somehow gets here without being logged in
            return;
        }
        dispatch(
            sendJoinRequestThunk({
                projectId: project.id,
                requestData: { userId: currentUser.id }
            })
        );
    };

    const showConfirm = () => {
        Modal.confirm({
            title: 'Are you sure you want to send a join request?',
            content: 'Your request will be sent to the project leader for approval.', // More informative content
            okText: 'Yes, Send Request', // Clearer button text
            cancelText: 'Cancel',
            okButtonProps: { style: { backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#fff' } }, // Style OK button
            // cancel ButtonProps: { type: 'default' }, // Default cancel style
            onOk() {
                handleSendJoinRequest();
            },
            onCancel() {
                console.log('User cancelled the join request');
            }
        });
    };

    // Conditional Loading State
    // Show skeleton if the spending plan is loading OR if the main project data is loading initially
    if (loading === 'pending' || loadingSpendingPlan === 'pending') {
        return (
             <StyledWrapper>
                 <Card className="donation-card">
                    <Skeleton active paragraph={{ rows: 6 }} />
                 </Card>
             </StyledWrapper>
        )
    }

    // Derived state: Check if goal is reached
    const isGoalReached = estimatedTotalCost > 0 && currentDonationValue >= estimatedTotalCost;


    return (
        <StyledWrapper>
            <Card className="donation-card">
                <div className="flex-between">
                    <div>
                        <Title level={4}>{
                            currentDonationValue.toLocaleString()
                        } VND raised</Title>
                        {/* Handle case where estimatedTotalCost might be 0 */}
                        <Text type="secondary">
                            {estimatedTotalCost > 0 ? `${estimatedTotalCost.toLocaleString()} VND goal` : 'No goal set'}
                             · {donations?.filter((x) => x.donationStatus === "COMPLETED").length || 0} donations
                        </Text>
                    </div>
                    <div className="progress-container">
                        <Progress
                            type="circle"
                             // Calculate percentage safely, handle goal = 0
                            percent={estimatedTotalCost > 0 ? Math.min(100, (currentDonationValue / estimatedTotalCost) * 100) : 0}
                            strokeWidth={8}
                            trailWidth={8}
                            width={80}
                            strokeColor={isGoalReached ? "#52c41a" : "#1890ff"} // Green when reached, blue otherwise
                            format={percent => `${percent === 100 ? 100 : percent.toFixed(isGoalReached ? 0 : 1)}%`} // Show decimals only if not 100%
                        />
                    </div>
                </div>

                <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
                    {/* Share Button */}
                    <Button
                        className="full-width-button"
                        type="primary" // Changed back to primary or keep as default? Let's use default.
                        icon={<ShareAltOutlined />}
                        // style={{ backgroundColor: '#F3BC51', borderColor: '#F3BC51' }} // Removed specific color
                    >
                        Share
                    </Button>

                    {/* Donate Button - Conditional Rendering and Disabling */}
                    {project.projectStatus === "DONATING" && (
                        <Tooltip title={isGoalReached ? "Fundraising goal has been reached!" : ""}>
                            {/* Tooltip explains why it's disabled */}
                             <Button
                                className="full-width-button"
                                type="primary"
                                icon={<DollarOutlined />}
                                style={{ backgroundColor: '#F99A32', borderColor: '#F99A32' }}
                                onClick={() => {
                                    // Check user login status first
                                    if (!currentUser || !currentUser.id) {
                                        navigate("/auth/login");
                                        return;
                                    }
                                    // Only open modal if not disabled
                                    if (!isGoalReached) {
                                        setIsOpenModal(true);
                                    }
                                }}
                                // Disable button if goal is reached
                                disabled={isGoalReached}
                            >
                                Donate now
                            </Button>
                        </Tooltip>
                    )}
                </Space>

                {/* Recent Donations Section */}
                {donations && donations.length > 0 && donations.some(d => d.donationStatus === 'COMPLETED') ? ( // Check if there are *any* completed donations
                    <>
                        <div className="donation-item" style={{ marginBottom: 16 }}>
                            <Avatar icon={<RiseOutlined />} style={{ backgroundColor: '#efdbff' }} />
                            <Text style={{ marginLeft: 8, color: '#722ed1', fontWeight: 500 }}>
                                {/* Count only completed donations from today */}
                                {donations.filter(d => d.donationStatus === 'COMPLETED' && moment(d.donationTime).isSame(moment(), 'day')).length} people donated today
                            </Text>
                        </div>

                        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                            {/* Recent Donation Display */}
                             {recentDonation.length > 0 && (
                                <div className="donation-item">
                                    <Avatar icon={<UserOutlined />} src={recentDonation[0]?.user?.avatar} />
                                    <div className="donation-info">
                                        <Text strong>{recentDonation[0]?.user?.fullName || "Anonymous"}</Text>
                                        <br />
                                        <Text type="secondary">{recentDonation[0]?.amount?.toLocaleString() || 0} VND · <Link to="#">Recent donation</Link></Text>
                                    </div>
                                </div>
                            )}

                            {/* Top Donation Display */}
                            {topDonation.length > 0 && (
                                <div className="donation-item">
                                    <Avatar icon={<UserOutlined />} src={topDonation[0]?.user?.avatar} />
                                    <div className="donation-info">
                                        <Text strong>{topDonation[0]?.user?.fullName || "Anonymous"}</Text>
                                        <br />
                                        <Text type="secondary">{topDonation[0]?.amount?.toLocaleString() || 0} VND · <Link to="#">Top donation</Link></Text>
                                    </div>
                                </div>
                            )}

                             {/* First Donation Display */}
                            {firstDonation.length > 0 && (
                                <div className="donation-item">
                                    <Avatar icon={<UserOutlined />} src={firstDonation[0]?.user?.avatar} />
                                    <div className="donation-info">
                                        <Text strong>{firstDonation[0]?.user?.fullName || "Anonymous"}</Text>
                                        <br />
                                        <Text type="secondary">{firstDonation[0]?.amount?.toLocaleString() || 0} VND · <Link to="#">First donation</Link></Text>
                                    </div>
                                </div>
                            )}
                        </Space>
                    </>
                ) : (
                     <Text type="secondary" style={{display: 'block', textAlign: 'center', marginBottom: '1rem'}}>No donations recorded yet.</Text>
                )}


                {/* Join Request Logic */}
                { (project.projectStatus === "DONATING" || project.projectStatus === "ACTIVE" || project.projectStatus === "PLANNING") && (
                   // Check if user is logged in
                   !currentUser || !currentUser.id ? (
                        // Render a button prompting login to join
                         <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="bottom-actions">
                            <Button type="default" block style={{ flex: 1 }}
                                onClick={() => navigate("/auth/login")}
                            >
                                Login to Send Join Request
                            </Button>
                        </div>
                   ) : (
                         // User is logged in, proceed with request/member logic
                        (() => {
                             // Handle loading state for requests/members if needed, or rely on parent component's loading
                            if (loading === 'pending') {
                                return <Skeleton.Button active block style={{marginTop: 20}}/>;
                            }

                            // Ensure projectRequests and projectMembers are arrays before filtering/checking
                            const safeProjectRequests = Array.isArray(projectRequests) ? projectRequests : [];
                            const safeProjectMembers = Array.isArray(projectMembers) ? projectMembers : [];


                            const userRequests = safeProjectRequests.filter(x => x.user?.id === currentUser.id); // Safe access to user.id
                            const userIsMember = safeProjectMembers.some(x => x.user?.id === currentUser.id) || (project?.leader?.id === currentUser.id); // Safe access

                            if (userIsMember) {
                                return (
                                    <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="bottom-actions">
                                        <Button type="primary" block style={{ flex: 1 }} // Changed to primary
                                            onClick={() => navigate(`/manage-project/${project.id}/home`)}
                                        >
                                            View Manage Project
                                        </Button>
                                    </div>
                                );
                            }

                             // Check if user has a PENDING join request or invitation
                            const hasPendingRequest = userRequests.some(x =>
                                ((x.requestType === "JOIN_REQUEST" || x.requestType === "INVITATION") && x.status === "PENDING")
                            );

                            if (hasPendingRequest) {
                                return (
                                    <Text type="secondary" style={{ display: 'block', fontSize: "0.9rem", marginTop: 20, textAlign: 'center' }}>
                                        <FlagOutlined /> Your request is pending approval.
                                    </Text>
                                );
                            }

                            // If no pending request and not a member, allow sending a request
                            return (
                                <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="bottom-actions">
                                    <Button type="default" block style={{ flex: 1 }}
                                        onClick={showConfirm} // Use the confirmation modal
                                    >
                                        Send Join Request
                                    </Button>
                                </div>
                            );

                        })()
                   )
                )}
            </Card>
        </StyledWrapper>
    );
}

// --- PropTypes remain the same ---
ProjectStatisticCard.propTypes = {
    project: PropTypes.object, // Added project prop type
    donations: PropTypes.arrayOf(
        PropTypes.shape({
            // projectId: PropTypes.string, // No longer needed if passed project object
            donationStatus: PropTypes.string,
            donationTime: PropTypes.string,
            amount: PropTypes.number,
            user: PropTypes.shape({
                id: PropTypes.string, // Added user ID
                fullName: PropTypes.string,
                avatar: PropTypes.string, // Added avatar
            }),
        })
    ), // Can be null or empty array initially
    projectRequests: PropTypes.array, // Can be null initially
    projectMembers: PropTypes.array, // Can be null initially
    isOpenModal: PropTypes.bool.isRequired,
    setIsOpenModal: PropTypes.func.isRequired,
};


export default ProjectStatisticCard;