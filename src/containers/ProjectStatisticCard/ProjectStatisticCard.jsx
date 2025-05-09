import { useEffect, useState } from "react";
import { Card, Typography, Space, Button, Avatar, Progress, Modal, Skeleton } from "antd";
import { ShareAltOutlined, DollarOutlined, RiseOutlined, UserOutlined, FlagOutlined } from "@ant-design/icons";
import styled from "styled-components";
import moment from "moment-timezone";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendJoinRequestThunk, fetchProjectRequests, fetchActiveProjectMembers, fetchSpendingPlanOfProject } from "../../redux/project/projectSlice";
import PropTypes from "prop-types";
const { Title, Text } = Typography;
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
    }
    &:hover {
        cursor: pointer;
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
    
    &:hover {
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
const ProjectStatisticCard = ({ project, projectRequests, projectMembers, donations, isOpenModal, setIsOpenModal }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentSpendingPlan = useSelector((state) => state.project.currentSpendingPlan);
    const [currentDonationValue, setCurrentDonationValue] = useState(0);
    const [estimatedTotalCost, setEstimatedTotalCost] = useState(0);
    const [recentDonation, setRecentDonation] = useState([]);
    const [topDonation, setTopDonation] = useState([]);
    const [firstDonation, setFirstDonation] = useState([]);
    const loading = useSelector((state) => state.project.loading);
    const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }


    useEffect(() => {
        if (donations && donations.length > 0) {
            setRecentDonation(donations.filter((x) => (
                moment().isSame(x.donationTime, 'day') && x.donationStatus === "COMPLETED"
            )).sort((a, b) => moment(b.donationTime) - moment(a.donationTime)));

            setTopDonation(donations.filter((x) => x.donationStatus === "COMPLETED")
                .sort((a, b) => b.amount - a.amount));

            setFirstDonation(donations.filter((x) => x.donationStatus === "COMPLETED")
                .sort((a, b) => moment(a.donationTime) - moment(b.donationTime)));
        }
    }, [donations]);

    useEffect(() => {
        if (project?.id) {
            dispatch(fetchSpendingPlanOfProject(project.id));
        }
    }, [dispatch, project?.id]);
    
    useEffect(() => {
        if (donations && currentSpendingPlan) {
            setCurrentDonationValue(
                donations
                    .filter((x) => x.donationStatus === "COMPLETED")
                    .reduce((total, donation) => total + donation.amount, 0)
            );
            setEstimatedTotalCost(currentSpendingPlan.estimatedTotalCost);
        }
    }, [donations, currentSpendingPlan]);
    
    useEffect(() => {
        if (project?.id) {
            dispatch(fetchProjectRequests(project.id));
            dispatch(fetchActiveProjectMembers(project.id));
        }
    }, [dispatch, project?.id]);
    

    const handleSendJoinRequest = () => {
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
            content: 'Once you send the join request, you cannot change your decision.',
            okText: <StyledButton>Yes</StyledButton>,
            cancelText: <StyledButton>No</StyledButton>,
            onOk() {
                console.log('User confirmed the request');
                handleSendJoinRequest();
            },
            onCancel() {
                console.log('User cancelled the request');
            }
        });
    };
    if(!estimatedTotalCost&& !currentDonationValue && loading){
        return <Skeleton active/>
    }
    return (
        <StyledWrapper>
            <Card className="donation-card">
                <div className="flex-between">
                    <div>
                        <Title level={4}>{
                            currentDonationValue.toLocaleString()
                        } VND raised</Title>
                        <Text type="secondary">{estimatedTotalCost} VND goal · {donations.filter((x) => x.donationStatus === "COMPLETED").length} donations</Text>
                    </div>
                    <div className="progress-container">
                        <Progress
                            type="circle"
                            percent={currentDonationValue / estimatedTotalCost * 100}
                            strokeWidth={8}
                            trailWidth={8}
                            width={80}
                            strokeColor="#52c41a"
                            format={percent => `${percent === 100? 100: percent.toFixed(2)}%`}
                        />
                    </div>
                </div>

                <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
                    <Button
                        className="full-width-button"
                        type="primary"
                        icon={<ShareAltOutlined />}
                        style={{ backgroundColor: '#F3BC51', borderColor: '#F3BC51' }}
                    >
                        Share
                    </Button>
                   {project.projectStatus === "DONATING" && (
                     <Button
                     className="full-width-button"
                     type="primary"
                     icon={<DollarOutlined />}
                     style={{ backgroundColor: '#F99A32', borderColor: '#F99A32' }}
                     onClick={() => {
                         if (!currentUser) {
                             navigate("/auth/login");
                             return;
                         }
                         setIsOpenModal(true)
                     }}
                 >
                     Donate now
                 </Button>
                   )}
                </Space>

                <div className="donation-item" style={{ marginBottom: 16 }}>
                    <Avatar icon={<RiseOutlined />} style={{ backgroundColor: '#efdbff' }} />
                    <Text style={{ marginLeft: 8, color: '#722ed1', fontWeight: 500 }}>
                        {recentDonation?.length || 0} people just donated</Text>
                </div>

                <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                    <div className="donation-item">
                        <Avatar icon={<UserOutlined />} src={recentDonation?.[0]?.user?.avatar} />
                        <div className="donation-info">
                            <Text strong>{recentDonation?.[0]?.user?.fullName || "No User"}</Text>
                            <br />
                            <Text type="secondary">{
                                recentDonation[0]?.amount.toLocaleString() || 0
                            } VND · <Link to="#">Recent donation</Link></Text>
                        </div>
                    </div>

                    <div className="donation-item">
                        <Avatar icon={<UserOutlined />} src={topDonation?.[0]?.user?.avatar} />
                        <div className="donation-info">
                            <Text strong>{topDonation?.[0]?.user?.fullName || "No User"}</Text>
                            <br />
                            <Text type="secondary">
                                {
                                    topDonation[0]?.amount.toLocaleString() || 0
                                }
                                VND · <Link to="#">Top donation</Link></Text>
                        </div>
                    </div>

                    <div className="donation-item">
                        <Avatar icon={<UserOutlined />} src={firstDonation?.[0]?.user?.avatar} />
                        <div className="donation-info">
                            <Text strong>{firstDonation?.[0]?.user?.fullName || "No User"}</Text>
                            <br />
                            <Text type="secondary"> {
                                firstDonation[0]?.amount.toLocaleString() || 0
                            } VND · <Link to="#">First donation</Link></Text>
                        </div>
                    </div>
                </Space>
                { (project.projectStatus === "DONATING" || project.projectStatus === "ACTIVE"||project.projectStatus === "PLANNING"  ) && (
                    currentUser === null && currentUser.id ===null? (
                        console.log("User is not logged in") ||
                        <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="bottom-actions">
                            <Button type="default" block style={{ flex: 1 }}
                                onClick={() => {
                                    navigate("/auth/login");
                                }}
                            >
                                Send join request dfg
                            </Button>
                        </div>
                    ) : (
                        // Handle Project Request and Member Logic
                        (() => {
                            if (projectRequests === null || projectRequests === undefined) {
                                return (
                                    <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="bottom-actions">
                                        <Button type="default" block style={{ flex: 1 }}
                                            onClick={showConfirm}
                                        >
                                            Send join request nuh
                                        </Button>
                                    </div>
                                );
                            }
                            console.log("Project Requests:", projectRequests);
                            const userRequests = projectRequests.filter(x => x.user.id === currentUser.id);
                            const userIsMember = projectMembers.some(x => x.user.id === currentUser.id) || (project.leader.id === currentUser.id);

                            // Check if any relevant request exists (Join, Invitation, Leave)
                            const hasRelevantRequest = userRequests.some(x =>
                                (x.requestType === "JOIN_REQUEST" && (x.status === "CANCELLED" || x.status === "REJECTED")) ||
                                (x.requestType === "INVITATION" && (x.status === "CANCELLED" || x.status === "REJECTED")) ||
                                (x.requestType === "LEAVE_REQUEST" && x.status === "APPROVED")
                            );
                            console.log("curr",currentUser)
                            console.log("userRequests", projectMembers)
                            if (userIsMember) {
                                return (
                                    <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="bottom-actions">
                                        <Button type="default" block style={{ flex: 1 }}
                                            onClick={() => {
                                                navigate(`/manage-project/${project.id}/home`);
                                            }}
                                        >
                                            View manage project
                                        </Button>
                                    </div>
                                );
                            }
                            if (hasRelevantRequest || userRequests.length === 0) {
                                return (
                                    <div style={{ display: "flex", gap: 10, marginTop: 20 }} className="bottom-actions">
                                        <Button type="default" block style={{ flex: 1 }}
                                            onClick={() => {
                                                showConfirm();
                                            }}
                                        >
                                            Send join request
                                        </Button>
                                    </div>
                                );
                            }

                            return (
                                <Text type="secondary" style={{ fontSize: "0.8rem", marginTop: 20 }}>
                                    <FlagOutlined /> You have already made a request to this project. Please wait for leader to resolve that.
                                </Text>
                            );
                        })()
                    ))
                }
            </Card>
        </StyledWrapper>
    );
}
ProjectStatisticCard.propTypes = {
    donations: PropTypes.arrayOf(
        PropTypes.shape({
            projectId: PropTypes.string.isRequired,
            donationStatus: PropTypes.string.isRequired,
            donationTime: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            user: PropTypes.shape({
                fullName: PropTypes.string,
            }),
        })
    ).isRequired,
    isOpenModal: PropTypes.bool.isRequired,
    setIsOpenModal: PropTypes.func.isRequired,
};

export default ProjectStatisticCard;