import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Flex, Button } from 'antd';
const Banner = () => {
    const navigate = useNavigate();
    return (
        <div className="banner">
            <Row style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
                <Col span={8} ></Col>
                <Col span={8} >
                    <Flex vertical='true' justify='center' align='center' gap='20px' className='banner-content'>
                        <h1 className="banner-content__text-1">#1 friendly funding website in Vietnam</h1>
                        <p className='banner-content__text-2'>Successful fundraisers start here</p>
                        <Button type="primary" shape="round" className='request-btn' onClick={() => navigate("/requests/create")}>
                            <b>Start a request</b>
                        </Button>
                    </Flex>
                </Col>
                <Col span={8}></Col>
            </Row>

        </div>
    )
}
export default Banner;