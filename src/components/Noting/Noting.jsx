import { DashOutlined, HeartOutlined, DollarOutlined, FireOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import React from 'react';
const Noting = () => {
    return (
        <div className='sth-yellow'>
            <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
                <Col span='4'>
                    <FireOutlined /> No fee to start fundraising
                </Col>
                <Col span='1'>
                    <DashOutlined />
                </Col>
                <Col span='4'>
                    <DollarOutlined /> 1 donation made every second
                </Col>
                <Col span='1'>
                    <DashOutlined />
                </Col>
                <Col span='4'>
                    <HeartOutlined /> 8K+ fundraisers started daily
                </Col>
            </Row>
        </div>
    );
}
export default Noting;