import React from "react";
import "./HomeContainer.pcss";
import Banner from "../../components/Banner/Banner";
import Noting from "../../components/Noting/Noting";
import FundraiserBoard from "../FundraiserBoard/FundraiserBoard";
import EventBoard from "../EventBoard/EventBoard";
import ForumBoard from "../ForumBoard/ForumBoard";
import NotingGreen from "../../components/NotingGreen/NotingGreen";
import RequestActiveCarousel from "../../components/RequestActiveCarousel/RequestActiveCarousel";
import { fetchProjectsThunk } from '../../redux/project/projectSlice';
import { useEffect } from 'react';
import { Flex,Upload,Button,message  } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import {uploadFileMedia} from '../../redux/helper/helperSlice';
import { UploadOutlined } from '@ant-design/icons';

const HomeContainer = () => {
    const projects = useSelector(state => state.project.projects);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchProjectsThunk());
    }, [dispatch]);
    const { t, i18n } = useTranslation();
    const handleImageChange = async ({ fileList }) => {
        if (fileList.length === 0) return; // Nếu danh sách trống, không làm gì
    
        const latestFile = fileList[fileList.length - 1];
    
        try {
          const response = await dispatch(
            uploadFileMedia({
              file: latestFile.originFileObj,
              folderName: "images",
              resourceType:"raw"
            })
          ).unwrap();
          console.log("response", response);
          latestFile.url = response;
          message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
          console.error("Error uploading image:", error);
          message.error(`Upload failed for ${latestFile.name}`);
        }
    
      };
    return (
        <div> {/* Bỏ Flex ở đây nếu không cần thiết cho toàn bộ */}
            <Flex vertical={true} className='home-upper'>
                <Banner />
                <Noting />
                <Upload
                  multiple
                  listType="picture"
                  beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                  beforeRemove={() => false}
                  onChange={handleImageChange} // Xử lý khi chọn file
                >
                  <Button
                    icon={<UploadOutlined />}
                  >
                    Click to Upload
                  </Button>
                </Upload>
                <Flex vertical={true} gap='4rem' style={{ margin: '4rem 10rem' }}>
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
                <Flex vertical={true} style={{ margin: '4rem 10rem' }}>
                    <ForumBoard />
                </Flex>
                <NotingGreen message='FCharity – Connecting Hearts, Changing Lives' bgColor='#012D19' style={{ color: 'white', padding: '10rem 0', fontSize: '2rem', fontWeight: 'bold', fontStyle: 'italic' }} />
            </Flex>
        </div>
    )
}
export default HomeContainer;
