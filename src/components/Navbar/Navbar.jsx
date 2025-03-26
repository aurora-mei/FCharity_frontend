import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Affix, Button, Flex, Space, Row, Col, Dropdown } from 'antd';
import avatar from '../../assets/download (11).jpg'
import { logOut } from '../../redux/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';

const lngs = {
    en: { nativeName: 'English' },
    ja: { nativeName: 'Japan' }
};
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
const Navbar = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const token = useSelector((state) => state.auth.token);
    const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};
    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
        currentUser = {};
    }

  const dispatch = useDispatch();
  useEffect(() => {
    console.log("---Navbar---");
    console.log("token: ", token);
    console.log("currentUser:", currentUser);
  }, [currentUser]);

  const logout = async () => {
    dispatch(logOut());
    window.location.reload();
  };

    const items = [
        {
            key: '1',
            label: (
                <a rel="noopener noreferrer" href="/user/manage-profile/profile">
                    User Dashboard
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
                        <Button className='btn-custom' type="text" icon={<SearchOutlined />}>Search</Button>
                        <Button className='btn-custom' type='text'><Space>Donate <CaretDownOutlined /></Space></Button>
                        <Button className='btn-custom' type='text'><Space>Fundraise <CaretDownOutlined /></Space></Button>
                        {/* <Button className='btn-custom' type='text'><Space>{t('play', 'play')} </Space></Button> */}
                        <Button
                            type="text"
                            className='btn-custom'
                            onClick={() => {
                                console.log("Navigating to ForumPage...");
                                navigate("/forum");
                            }}
                        >
                            Forum
                        </Button>
                    </Flex>
                </Col>
                <Col span={8}>
                    <Flex justify='center' align='flex-start' style={{ height: '80px' }}>
                        <a href="/">
                            <img src={logo} alt="" style={{ height: '90px' }} />
                        </a>
                    </Flex>
                </Col>
                <Col span={8}>
                    <Flex justify='flex-end' align='center' gap='10px'>
                        {/* <Button className='btn-custom' type='text'><Space>About <CaretDownOutlined /></Space></Button> */}
                        {token ? (
                            <Dropdown
                                menu={{ items }}
                                placement="bottomRight"
                            >
                                <Button className='btn-custom' type='text'>
                                    <img
                                        src={currentUser.avatar ?? avatar}
                                        alt="avatar"
                                        style={{ borderRadius: '50%', width: '35px', height: '35px' }}
                                    />
                                    {currentUser.fullName}
                                </Button>


                            </Dropdown>
                        ) : (
                            <Button className='btn-custom' type="text" onClick={() => navigate("/auth/login")}>
                                Sign in
                            </Button>
                        )}
                        <Button type="primary" shape="round" className='request-btn' onClick={() => navigate("/requests/create")}>
                            <b>Start a request</b>
                            {t('startRequest', 'Start a request')}
                        </Button>
                        <Flex vertical>
                            {Object.keys(lngs).map((lng) => (
                                <button key={lng} style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }} type="submit" onClick={() => {
                                    i18n.changeLanguage(lng);
                                }
                                }>
                                    {lngs[lng].nativeName}
                                </button>
                            ))}
                        </Flex>
                    </Flex>
                </Col>
            </Row>
        </Affix>
    );
}

export default Navbar;
