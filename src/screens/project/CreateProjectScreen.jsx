import { Row, Col, Menu, Affix, Button, Empty, Flex, Card } from 'antd';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import {fetchProjectMembers } from '../../redux/project/projectSlice';
import { useEffect } from 'react';
import moment from 'moment';
const ScreenStyled = styled.div`
  padding: 4rem;
  background-color: #f0f2f5;
  min-height: 100vh;
`;
const StyledContainer = styled.div`
  padding: 16px;
  background: #f3f4f6;
  min-height: 100vh;
  display: flex;
  justify-content: center;

  .table-wrapper {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
    max-width: 800px;
  }

  .name-container {
    display: flex;
    align-items: center;
  }

  .avatar {
    margin-left: 8px;
  }

  .name-text {
    margin-left: 8px;
  }

  .status-text {
    display: flex;
    align-items: center;
  }
`;
const StyledCard = styled(Card)`
    margin-bottom: 16px;
`;
const columns = [
    {
        title: "Name",
        dataIndex: "user.fullName",
        key: "user.fullName",
        render: (text, record) => (
            <div className="name-container">
                <Checkbox />
                <Avatar src={record.user.avartar} className="avatar" />
                <span className="name-text">{text}</span>
            </div>
        ),
    },
    {
        title: "Join Date",
        dataIndex: "joinDate",
        key: "joinDate",
        render: (text) => <span>{moment(text).format("DD/MM/YYYY")}</span>
    },
    {
        title: "Role",
        dataIndex: "memberRole",
        key: "memberRole",
        render: (text, record) => <Tag>{text}</Tag>,
    },
];
const CreateProjectScreen = () => {
    const { requestId } = useParams();
    const dispatch = useDispatch();
    const projectMembers = useSelector((state) => state.project.projectMembers);
    const newProject = useSelector((state) => state.project.currentProject);
    useEffect(() => {
        console.log("New Project:", newProject);
    //    if(newProject) dispatch(fetchProjectMembers(newProject.project.id));
    }, [dispatch, newProject]);
    return (
        <ScreenStyled>
            <Row
                justify="center"
                align="middle"
                gutter={[32, 16]}
                style={{ minHeight: "100vh" }}
            >
                <Col span={12}>
                    <ProjectForm requestId={requestId} />
                </Col>
                <Col span={12}>
                    {
                        newProject.project ? (
                            <Flex>
                                <StyledCard title="Project Information">
                                    <Flex>
                                        <Flex style={{ marginRight: '1rem' }}>
                                            <img src={newProject.attachments.imageUrl} style={{ width: '3rem', height: '3rem' }} />
                                            <Flex vertical gap={5} style={{ marginLeft: '1rem' }}>
                                                <p><strong>Project Name:</strong> {newProject.project.projectName}</p>
                                                <p><strong>Project Start Date:</strong> {moment(newProject.project.startDate).format("DD/MM/YYYY")}</p>
                                            </Flex>
                                        </Flex>
                                        <Flex vertical gap={5}>
                                            <p><strong>Project Description:</strong> {newProject.project.description}</p>
                                            <p><strong>Project Status:</strong> {newProject.project.status}</p>
                                        </Flex>
                                    </Flex>
                                </StyledCard>
                                <StyledContainer>
                                    <div className="table-wrapper">
                                        {
                                            projectMembers.length > 0 && (
                                                <Table dataSource={projectMembers} columns={columns} pagination={false} />
                                            )
                                        }   
                                    </div>
                                </StyledContainer>
                            </Flex>
                        ) : <Empty >No project created.</Empty>
                    }

                </Col>
            </Row>
        </ScreenStyled>
    );
}
export default CreateProjectScreen;