import React, { useEffect } from 'react';
import Banner from "../../components/Banner/Banner";
import Noting from "../../components/Noting/Noting";
import FundraiserBoard from "../FundraiserBoard/FundraiserBoard";
import EventBoard from "../EventBoard/EventBoard";
import ForumBoard from "../../containers/ForumBoard/ForumBoard";
import NotingGreen from "../../components/NotingGreen/NotingGreen";
import RequestListScreen from "../../screens/request/RequestListScreen";
import RequestActiveCarousel from "../../components/RequestActiveCarousel/RequestActiveCarousel";
import { fetchProjectsThunk } from '../../redux/project/projectSlice';
import { Flex } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';

const HomeContainer = () => {
    const projects = useSelector(state => state.project.projects);
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchProjectsThunk());
    }, [dispatch]);
    
    const { t, i18n } = useTranslation();
    
    return (
        <div>
            <Flex vertical='true' className='home-upper'>
                <Banner />
                <Noting />
                <Flex vertical='true' gap='4rem' style={{ margin: '4rem 10rem' }}>
                    <RequestActiveCarousel />
                    <FundraiserBoard projects={projects} />
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
            </Flex>
        </div>
    )
}

export default HomeContainer;