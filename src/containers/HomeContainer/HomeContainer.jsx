import React from 'react';
import './HomeContainer.pcss';
import Banner from "../../components/Banner/Banner";
import Navbar from "../../components/Navbar/Navbar";
import Noting from "../../components/Noting/Noting";
import FundraiserBoard from "../FundraiserBoard/FundraiserBoard";
import AppFooter from "../../components/AppFooter/AppFooter";
import EventBoard from "../EventBoard/EventBoard";
import ForumBoard from "../ForumBoard/ForumBoard";
import NotingGreen from "../../components/NotingGreen/NotingGreen";
import { Flex } from 'antd';
const HomeContainer = () => {
    return (
        <div >
            <Flex vertical='true' className='home-upper'>
                <Navbar />
                <Banner />
                <Noting />
                <Flex vertical='true' gap='4rem' style={{ margin: '4rem 10rem' }}>
                    <FundraiserBoard />
                    <EventBoard />
                </Flex>
                <NotingGreen message={
                    <>
                        A forum dedicated to charity and kindness. <br />
                        Connect with like-minded people, share opportunities, and support those in need.
                    </>
                } bgColor='#F0FCE9' style={{ color: 'black', padding: '3rem 0', textAlign: 'center' }} />
                <Flex vertical='true' style={{ margin: '4rem 10rem' }}>
                    <ForumBoard />
                </Flex>
                <NotingGreen message='FCharity – Connecting Hearts, Changing Lives' bgColor='#012D19' style={{ color: 'white', padding: '10rem 0', fontSize: '2rem', fontWeight: 'bold', fontStyle: 'italic' }} />
                <AppFooter />
            </Flex>
        </div>
    )
}
export default HomeContainer;