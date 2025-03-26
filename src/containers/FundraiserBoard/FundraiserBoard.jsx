import React from 'react';
import './FundraiserBoard.pcss';
import { CaretDownOutlined } from '@ant-design/icons';
import { Row, Col, Button, Flex } from 'antd';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import image from '../../assets/two-birds-white-minimalist-g98cih2t3q56hxky.jpg';
const FundraiserBoard = () => {
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

            <Row gutter={25} style={{ height: 'fit-content', display: 'flex', justifyContent: 'center', alignContent: 'center' }} >
                <Col span='12' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                    <img src={image} alt="" style={{ boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)' }} />
                </Col>
                <Col span='12'>
                    <Flex wrap gap='25px'>
                        <ProjectCard />
                        <ProjectCard />
                        <ProjectCard />
                        <ProjectCard />
                    </Flex>
                </Col>
            </Row>
        </Flex >
    );
};
export default FundraiserBoard;