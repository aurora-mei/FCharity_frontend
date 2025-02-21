import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Affix, Button, Splitter, Flex, Space, Row, Col, Dropdown } from 'antd';
import avatar from '../../assets/download (11).jpg'
import { logOut } from '../../redux/auth/authSlice';
import { useSelector, useDispatch } from 'react-redux';

const Navbar = () => {
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const currentUser = useSelector((state) => state.auth.currentUser);
    const dispatch = useDispatch();
    useEffect(() => {
        console.log("---Navbar---");
        console.log("token: ", token);
        console.log("currentUser:", currentUser);
    }, [currentUser]);
    const logout = async () => {
        dispatch(logOut());
        window.location.reload();
    }
    const items = [
        {
            key: '1',
            label: (
                <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
                    Profile
                </a>
            ),
        },
        {
            key: '2',
            label: (
                <a onClick={logout}>
                    Sign out
                </a>
            ),
        },
    ];


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
                        {(!token == "") ? (
                            <Dropdown
                                menu={{ items }}
                                placement="bottomRight"
                            >
                                <Button>
                                    <img
                                        src={currentUser.avatar ?? avatar}
                                        alt="avatar"
                                        style={{ borderRadius: '50%', width: '40px', height: '40px' }}
                                    />
                                    {currentUser.fullName}
                                </Button>
                            </Dropdown>
                        ) : (
                            <Button type="text" onClick={() => navigate("/auth/login")}>
                                Sign in
                            </Button>
                        )}


                        <Button type="primary" shape="round" className='request-btn'><b>Start a request</b></Button>
                    </Flex>
                </Col>
            </Row>
        </Affix >
    )
}
export default Navbar;