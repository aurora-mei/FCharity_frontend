import { Card, Row, Col, Typography, Carousel } from 'antd';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById } from '../../redux/project/projectSlice';
import React from 'react';
const { Title, Text } = Typography;
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
const StyledScreen = styled.div`
  height: 100vh;
  overflow-y: auto;
   scrollbar-width: none;

  `;
const ProjectHomeContainer = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentProject = useSelector((state) => state.project.currentProject);

  useEffect(() => {
    console.log(projectId)
    dispatch(fetchProjectById(projectId));
  }, [projectId, dispatch]);

  return (
    <>
      {currentProject && currentProject.project && (
        <StyledScreen>
          <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={5000}>
            {currentProject && currentProject.project && currentProject.attachments.map((image, index) => (
              <div key={index}>
                <img
                  src={image.imageUrl}
                  style={{
                    width: '100%',
                    height: '23rem',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              </div>
            ))}
          </Carousel>
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>Welcome to Project {currentProject.project.projectName}</Title>
            <Text>Here's a quick overview of your project.</Text>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card title="Total Members" bordered={false}>10</Card>
              </Col>
              <Col span={8}>
                <Card title="Total Donations" bordered={false}>$5,000</Card>
              </Col>
              <Col span={8}>
                <Card title="Tasks Completed" bordered={false}>25/30</Card>
              </Col>
            </Row>
          </Card>
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>Welcome to Project {currentProject.project.projectName}</Title>
            <Text>Here's a quick overview of your project.</Text>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card title="Total Members" bordered={false}>10</Card>
              </Col>
              <Col span={8}>
                <Card title="Total Donations" bordered={false}>$5,000</Card>
              </Col>
              <Col span={8}>
                <Card title="Tasks Completed" bordered={false}>25/30</Card>
              </Col>
            </Row>
          </Card>
          <Card style={{ marginBottom: 24 }}>
            <Title level={4}>Welcome to Project {currentProject.project.projectName}</Title>
            <Text>Here's a quick overview of your project.</Text>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card title="Total Members" bordered={false}>10</Card>
              </Col>
              <Col span={8}>
                <Card title="Total Donations" bordered={false}>$5,000</Card>
              </Col>
              <Col span={8}>
                <Card title="Tasks Completed" bordered={false}>25/30</Card>
              </Col>
            </Row>
          </Card>
        </StyledScreen>
      )}
    </>

  )

};
export default ProjectHomeContainer;