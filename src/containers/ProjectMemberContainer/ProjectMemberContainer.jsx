import { Card, Col, Row, Typography, Flex, Space, Select, Tag, Table, Button, Input } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById } from '../../redux/project/projectSlice';
import React from 'react';
const { Title, Text } = Typography;
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TeamOutlined, EditOutlined } from '@ant-design/icons';
import { fetchProjectRequests, fetchAllProjectMembersThunk } from '../../redux/project/projectSlice';
import ProjectMemberList from '../../components/ProjectMemberList/ProjectMemberList';
import ProjectRequestList from '../../components/ProjectRequestList/ProjectRequestList';
const StyledCard = styled(Card)`
    background-color: #fff;
     transition: all 0.3s ease;
    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
        cursor: pointer;
    }
        .ant-card-head {
        min-height:3rem !important;
}
   .ant-card-head-title {
        font-size: 1rem;
        font-weight: bold;
        color: black; 
         text-align: center;
    }
    .ant-card-head-icon {
        font-size: 1.5rem;
        color: #1890ff; /* Chỉnh màu của icon nếu cần */
    }
      .ant-card-body{
          background-color: #fff !important;
           text-align: center;
           padding-top: 0 !important;
           padding-bottom:1rem !important;
           font-weight: semibold !important;
            font-size: 1.2rem;
        }  
   
`;
const StyledSearch = styled.div`
    .ant-input{
     height: 1rem !important;
     padding:1rem !important;
    }
    .ant-input-group-addon{
    .ant-btn{
    background-color: #f0f0f0 !important;
        border: 1px solid green !important;
        padding: 1rem !important;
    }
 
    }
`;
const StyledButtonInvite = styled(Button)`
    background-color: #fff !important;
    border: 1px solid green !important;
    padding: 1rem !important;
      transition: all 0.3s ease;
    &:hover{
        background-color: #fff !important;
        border: 1px solid green !important;
        padding: 1rem !important;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      
        }
}
    .ant-btn{
        // span{
        //     color: green !important;
        //     font-size: 1rem !important;
        //     }
        // }    
  

}`

const StyledSelect = styled(Select)`
    .ant-select-selector{
        border: 1px solid green !important;
        border-radius: 4px !important;
        padding: 0.5rem !important;
        background-color: #fff !important;
        .ant-select-selection-item{
            color: green !important;
        }
    }
    .ant-select-arrow{
        color: green !important;
    }
    .ant-select-item-option{
        color: green !important;
        &:hover{
            background-color: #fff !important;
            color: green !important;
        }
    }
    .ant-select-item-option-selected{
        background-color: #fff !important;
        color: green !important;
        &:hover{
            background-color: #fff !important;
            color: green !important;
        }
    }
    .ant-select-item-option-active{
        background-color: #fff !important;
        color: green !important;
        &:hover{
            background-color: #fff !important;
            color: green !important;
        }
    }
}`;
const ProjectMemberContainer = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentProject = useSelector((state) => state.project.currentProject);
    const allProjectMembers = useSelector((state) => state.project.allProjectMembers);
    const projectRequests = useSelector((state) => state.project.projectRequests);
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [isLeader, setIsLeader] = useState(false);
    useEffect(() => {
        console.log(projectId)
        dispatch(fetchProjectById(projectId));
        dispatch(fetchAllProjectMembersThunk(projectId));
        dispatch(fetchProjectRequests(projectId));
    }, [dispatch, projectId]);

    useEffect(() => {
        if (currentProject && currentProject.project && currentProject.project.leader.id === currentUser.id) {
            console.log(currentProject && currentProject.project && currentProject.project.leader.id === currentUser.id)
            setIsLeader(true);
        }
    }, [currentProject, allProjectMembers.length, currentUser.id, projectRequests.length]);

    return (
        <Flex vertical gap={25} style={{ overflowY: "auto", height: "100vh", padding: "0 1rem", scrollbarWidth: "none" }}>
            <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                    <StyledCard icon={<TeamOutlined />} title="Total Active Members" bordered={false}>
                        {allProjectMembers.filter(member => member.leaveDate === null).length}/{allProjectMembers.length}
                    </StyledCard>
                </Col>
                <Col span={8}>
                    <StyledCard title="Total Processing Invitation" bordered={false}>
                        {(() => {
                            if (projectRequests && projectRequests.length > 0) {
                                const invitations = projectRequests.filter(request => request.requestType === "INVITATION");
                                const pendingInvitations = invitations.filter(request => request.status === "PENDING");
                                return `${pendingInvitations.length}/${invitations.length}`;
                            }
                            return "0/0"; // Return default when no requests are present
                        })()}
                    </StyledCard>
                </Col>
                <Col span={8}>
                    <StyledCard title="Total Processing Join Request" bordered={false}>
                        {(() => {
                            if (projectRequests && projectRequests.length > 0) {
                                const joinRequests = projectRequests.filter(request => request.requestType === "JOIN_REQUEST");
                                const pendingJoinRequests = joinRequests.filter(request => request.status === "PENDING");
                                return `${pendingJoinRequests.length}/${joinRequests.length}`;
                            }
                            return "0/0"; // Return default when no requests are present
                        })()}
                    </StyledCard>
                </Col>


            </Row>
            <ProjectMemberList isLeader={isLeader} projectId={projectId} />
            <ProjectRequestList isLeader={isLeader} projectId={projectId} />
        </Flex>
    );
}
export default ProjectMemberContainer;