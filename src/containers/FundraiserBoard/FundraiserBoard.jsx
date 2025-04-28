import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Flex, Empty, Dropdown, Menu } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { fetchProjectsNeedDonateThunk, fetchActiveProjectsThunk, fetchFinishedProjectsThunk } from '../../redux/project/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import './FundraiserBoard.pcss';

const FundraiserBoard = () => {
  const projects = useSelector((state) => state.project.projects);
  const dispatch = useDispatch();
  const [selectedType, setSelectedType] = useState('Need Donate');

  useEffect(() => {
    dispatch(fetchProjectsNeedDonateThunk());
  }, [dispatch]);

  const handleMenuClick = (e) => {
    const { key } = e;
    setSelectedType(key);
    if (key === 'Need Donate') {
      dispatch(fetchProjectsNeedDonateThunk());
    } else if (key === 'Active') {
      dispatch(fetchActiveProjectsThunk());
    } else if (key === 'Finished') {
      dispatch(fetchFinishedProjectsThunk());
    }
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        { label: 'Need Donate', key: 'Need Donate' },
        { label: 'Active', key: 'Active' },
        { label: 'Finished', key: 'Finished' },
      ]}
    />
  );

  const top5Projects = [...projects]
    .sort((a, b) => new Date(b.project.plannedStartTime) - new Date(a.project.plannedStartTime))
    .slice(0, 5);

  return (
    <Flex vertical gap="20px">
      <Row gutter={16}>
        <Col span={24}>
          <Flex vertical gap="15px" align="start">
            <b style={{ fontSize: '1.4rem' }}>Discover fundraisers inspired by what you care about</b>
            <Dropdown overlay={menu}>
              <Button type="primary" shape="round">
                <b>{selectedType}</b> <CaretDownOutlined />
              </Button>
            </Dropdown>
          </Flex>
        </Col>
      </Row>

      {top5Projects && top5Projects.length > 0 ? (
        <Row gutter={20} style={{ height: 'fit-content', display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
          <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
            <ProjectCard key={top5Projects[0].project.id} projectData={top5Projects[0]} only={true} />
          </Col>
          <Col span={12}>
            <Row gutter={[16, 16]}>
              {top5Projects.length > 1 &&
                top5Projects.slice(1, 5).map((project) => (
                  <Col key={project.project.id} span={12} style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                    <ProjectCard key={project.project.id} projectData={project} only={false} />
                  </Col>
                ))}
            </Row>
          </Col>
        </Row>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No projects found" />
      )}

      <Flex justify="end" style={{ marginTop: '20px' }}>
        <Link to="/projects">View All Projects</Link>
      </Flex>
    </Flex>
  );
};

export default FundraiserBoard;
