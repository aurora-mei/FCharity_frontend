import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './FundraiserBoard.pcss';
import { CaretDownOutlined } from '@ant-design/icons';
import { Row, Col, Button, Flex, Empty } from 'antd';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import image from '../../assets/two-birds-white-minimalist-g98cih2t3q56hxky.jpg';
const FundraiserBoard = ({ projects }) => {
    const top5Projects = [...projects] 
        .filter(project => project.project.projectStatus !== 'PLANNING' && project.project.projectStatus !== 'COMPLETED')
        .sort((a, b) => new Date(b.project.plannedStartTime) - new Date(a.project.plannedStartTime))
        .slice(0, 5);
    useEffect(() => {
        console.log(projects)
        console.log(top5Projects);
    })

    return (
        <Flex vertical='true' gap='20px'>
            <Row gutter={16}>
                <Col span='24'>
                    <Flex vertical='true' gap='15px'>
                        <b style={{ fontSize: '1.4rem' }}>Discover fundraisers inspired by what you care about</b>
                        <Button type='primary' shape="round" className='type-btn'><b>change type</b> <CaretDownOutlined /></Button>
                    </Flex>
                </Col>
            </Row>

            {top5Projects && top5Projects.length > 0 ? (
                <Row gutter={20} style={{ height: 'fit-content', display: 'flex', justifyContent: 'center', alignContent: 'center' }} >
                    <Col span='12' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                    <ProjectCard key={top5Projects[0].project.id} projectData={top5Projects[0]} only={true} />
                        {/* <img src={top5Projects[0].attachments[0].imageUrl} alt="" style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)' }} /> */}
                    </Col>
                    <Col span='12'>
                        <Row gutter={[16, 16]}>
                            {
                                top5Projects &&
                                Array.isArray(top5Projects) &&
                                top5Projects.length > 1 && top5Projects.slice(1, 4).map(project => (
                                    <Col key={project.project.id} span='12' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                                        <ProjectCard key={project.project.id} projectData={project} only={false} />
                                    </Col>
                                ))
                            }
                        </Row>
                    </Col>
                </Row>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No projects found' />}
        </Flex >
    );

}
FundraiserBoard.propTypes = {
    projects: PropTypes.arrayOf(
        PropTypes.shape({
            plannedStartTime: PropTypes.string.isRequired,
        })
    ).isRequired,
};
export default FundraiserBoard;