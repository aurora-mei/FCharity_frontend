import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, Skeleton, Progress } from 'antd';
import { fetchDonationsOfProject, fetchSpendingPlansOfProject } from "../../redux/project/projectSlice";
import { Card } from "antd";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';

const StyledCard = styled(Card)`
    width: 100%;
    border-radius: 1rem !important;
    transition: all 0.3s ease;

    &:hover {
        cursor: pointer;
        transform: translateY(-0.3rem);
        box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px;
    }

    .ant-card-cover {
        position: relative;
    }

    .ant-card-body {
        height: ${(props) => (props.$only ? "8rem" : "auto")};
        padding: 1rem 0.5rem !important;
        background-color: #ffffff !important;
        border-radius: 1rem !important;
    }
`;

const { Title, Text } = Typography;

const ProjectCard = ({ projectData, only }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [donations, setDonations] = useState([]);
    const [spendingPlans, setSpendingPlans] = useState([]);
    const [currentDonationValue, setCurrentDonationValue] = useState(0);
    const [estimatedTotalCost, setEstimatedTotalCost] = useState(0);
    const [loading, setLoading] = useState(true);

    const projectId = projectData?.project?.id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [donationRes, spendingPlanRes] = await Promise.all([
                    dispatch(fetchDonationsOfProject(projectId)).unwrap(),
                    dispatch(fetchSpendingPlansOfProject(projectId)).unwrap()
                ]);
                setDonations(donationRes);
                setSpendingPlans(spendingPlanRes);

                const verifiedAmount = donationRes
                    .filter((x) => x.donationStatus === "COMPLETED")
                    .reduce((sum, d) => sum + d.amount, 0);
                setCurrentDonationValue(verifiedAmount);

                if (spendingPlanRes.length > 0) {
                    setEstimatedTotalCost(spendingPlanRes[0].estimatedTotalCost);
                }
            } catch (error) {
                console.error("Error loading project data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchData();
        }
        console.log("donations", projectData.project.projectName);
        console.log("currentDonationValue", currentDonationValue);
        console.log("estimatedTotalCost", estimatedTotalCost);
    }, [projectId]);

    return (
        <>
            {!loading ? (
                <StyledCard
                    hoverable
                    onClick={() => navigate(`/projects/${projectId}`)}
                    $only={only}
                    cover={
                        <>
                            <img
                                alt="project cover"
                                src={
                                    (projectData.attachments?.[0]?.imageUrl) ??
                                    "https://storage.googleapis.com/a1aa/image/qQQjl4qj7DHlqXa_8HW9b_jbVC0DSVZlMwQjUJA78VU.jpg"
                                }
                                style={{
                                    width: "100%",
                                    height: `${only ? "28.2rem" : "9rem"}`,
                                    objectFit: "cover",
                                    borderRadius: "1rem 1rem 0 0",
                                    position: "relative",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 10,
                                    padding: "0.1rem 0.5rem",
                                    left: 10,
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    borderRadius: "1rem",
                                    width: "fit-content",
                                    fontSize: "0.9rem",
                                }}
                            >
                                {donations.filter((x) => x.donationStatus === "COMPLETED").length} donations
                            </div>
                        </>
                    }
                >
                    <Title level={5}>{projectData.project.projectName}</Title>
                    <Progress
                        percent={(currentDonationValue / estimatedTotalCost) * 100}
                        showInfo={false}
                        strokeColor="#00A458"
                        style={{ marginTop: only ? "1.2rem" : "0.9rem" }}
                    />
                    <Text type="primary" style={{ fontWeight: "bold" }}>
                        {currentDonationValue.toLocaleString()} VND raised
                    </Text>
                </StyledCard>
            ) : (
                <Skeleton
                    active
                    paragraph={{ rows: 2 }}
                    title={{ width: "100%" }}
                    style={{
                        width: "100%",
                        height: `${only ? "28.2rem" : "9rem"}`,
                        borderRadius: "1rem",
                        marginTop: "1rem",
                    }}
                />
            )}
        </>
    );
};

ProjectCard.propTypes = {
    projectData: PropTypes.shape({
        attachments: PropTypes.arrayOf(
            PropTypes.shape({
                imageUrl: PropTypes.string,
            })
        ),
        project: PropTypes.shape({
            id: PropTypes.string.isRequired,
            category: PropTypes.shape({
                categoryName: PropTypes.string.isRequired,
            }).isRequired,
            projectName: PropTypes.string,
            email: PropTypes.string.isRequired,
        }).isRequired,
        projectTags: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                tag: PropTypes.shape({
                    tagName: PropTypes.string.isRequired,
                }).isRequired,
            })
        ).isRequired,
    }).isRequired,
};

export default ProjectCard;
