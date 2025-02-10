import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Affix, Button, Splitter, Flex, Space, Row, Col, Menu } from 'antd';
import './Navbar.pcss';
const Navbar = () => {
    const navigate = useNavigate();
    return (
        <Affix offsetTop={0} onChange={(affixed) => console.log(affixed)}>
            <Row className='navbar'>
                <Col span={8} >
                    <Flex justify='flex-start' align='center' gap='10px'>
                        <Button type="text" icon={<SearchOutlined />}>Search</Button>
                        <Button type='text'><Space>Donate <CaretDownOutlined /></Space></Button>
                        <Button type='text'><Space>Fundraise <CaretDownOutlined /></Space></Button>
                    </Flex>
                </Col>
                <Col span={8}>
                    <Flex justify='center' align='flex-start' style={{ height: '80px' }}>
                        <a href="#">
                            <img src="./src/assets/apgsoohzrdamo4loggow.svg" alt="" style={{ height: '90px' }} />
                        </a>
                    </Flex>
                </Col>
                <Col span={8}>
                    <Flex justify='flex-end' align='center' gap='10px'>
                        < Button type='text'><Space>About <CaretDownOutlined /></Space></Button>
                        <Button type="text" onClick={() => navigate("/auth/login")}>Sign in</Button>
                        <Button type="primary" shape="round" className='request-btn'><b>Start a request</b></Button>
                    </Flex>
                </Col>
            </Row>
        </Affix >
    )
}
export default Navbar;