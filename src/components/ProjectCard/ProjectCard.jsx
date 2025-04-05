import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Flex, Typography } from 'antd';
import LoadingModal from "../../components/LoadingModal";
import { Card, Progress, Badge } from "antd";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
const StyledCard = styled(Card)`
    width: 100%;
    // height: 100%;
    border-radius: 1rem !important;
    transition: all 0.3s ease; /* Smooth transition for hover effect */
    
    &:hover {
        cursor: pointer;
        transform: translateY(-0.3rem); /* Move the card up by 10px */
        box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px; /* Enhance shadow on hover */
    }
    .ant-card-cover {
       position: relative;
    }
    .ant-card-body {
        height: ${(props) => (props.$only ? "8rem" : "auto")};
        padding: 1rem 0.5rem !important;
        background-color: #ffffff !important; /* Fixed the extra # */
        border-radius: 1rem !important;
    }
`;

const { Title, Text, Paragraph } = Typography;
const ProjectCard = ({ projectData, only }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        console.log(projectData)
        if (projectData && projectData.project.id) {
            setLoading(false);
        }
    }, [projectData])
    if (loading) {
        return <LoadingModal />;
    }
    return (
        <StyledCard
            hoverable
            onClick={()=>navigate(`/projects/${projectData.project.id}`)}
            $only={only}
            cover={
                <>
                    <img 
                        alt="A young boy and a woman sitting together in a hospital room"
                        src={(projectData.attachments && projectData.attachments[0].imageUrl) ?? "https://storage.googleapis.com/a1aa/image/qQQjl4qj7DHlqXa_8HW9b_jbVC0DSVZlMwQjUJA78VU.jpg"}
                        style={{ width: "100%",height: `${only===true ? "28.2rem" : "9rem"}`, objectFit: "cover", borderRadius: "1rem 1rem 0 0 ",position: "relative" }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            bottom: 10,
                            padding: "0.1rem 0.5rem",
                            left: 10,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none", // Ensure the border is removed
                            borderRadius: "1rem",
                            width: "fit-content",
                            fontSize: "0.9rem",
                        }}
                    >6.9K donations</div>
                </>
            }
        >
            <Title level={5}>
                {projectData.project.projectName} Campaña para Ayuda y Solidaridad con las Niñas IAPs
            </Title>
            <Progress percent={75} showInfo={false} strokeColor="#00A458" style={{ marginTop: `${only ? "2.4rem":"0.9rem"}` }} />
            <Text type="primary" style={{ display: "block", fontWeight: "bold" }}>
                $535,708 raised
            </Text>
        </StyledCard>
    )
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