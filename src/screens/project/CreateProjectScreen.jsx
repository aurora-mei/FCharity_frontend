import { Row, Col, Menu, Affix, Button, Empty,Flex,Card   } from 'antd';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
const ScreenStyled = styled.div`
  padding: 4rem;
  background-color: #f0f2f5;
  min-height: 100vh;
`;
const CreateProjectScreen = () => {
    const { requestId } = useParams();
    const newProject = useSelector((state) => state.project.currentProject);
    useEffect(() => {
        console.log("New Project:", newProject);
    }
    , [newProject]);
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
                                <Card>
                                    <h1>Project Information</h1>
                                    <p>{newProject.project.projectName}</p>
                                    <Button type="primary">Save</Button>
                                </Card>
                            </Flex>
                        ):<Empty >No project created.</Empty>
                    }

                </Col>
            </Row>
        </ScreenStyled>
    );
}
export default CreateProjectScreen;