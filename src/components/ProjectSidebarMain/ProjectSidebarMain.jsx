import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes,useParams, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Typography, Divider, Button, Card, Flex, Row, Col,Form } from 'antd';
import {
    UserOutlined,
    EditOutlined,
    HomeOutlined,
    TeamOutlined,
    DollarOutlined,
    FileTextOutlined,
    OrderedListOutlined,
    QuestionCircleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { fetchProjectById } from '../../redux/project/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import ProjectUpdateModal from '../ProjectUpdateModal/ProjectUpdateModal';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const SideBarMain = () => {
    const [form] = Form.useForm();
    const {projectId} = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isOpenModal, setIsOpenModal] = React.useState(false);
    const location = useLocation();
    const currentProject = useSelector((state) => state.project.currentProject);
    const selectedTab = location.pathname.substring(1) || 'home';
    const currentUser = useSelector((state) => state.auth.currentUser);
    const [isLeader, setIsLeader] = React.useState(false);

    useEffect(() => {
        console.log(projectId)
        dispatch(fetchProjectById(projectId));
        if (currentProject && currentProject.project && currentProject.project.leader.id === currentUser.id) {
            console.log(currentProject && currentProject.project && currentProject.project.leader.id === currentUser.id)
            setIsLeader(true);
        }
    }, [projectId, dispatch]);
    return (
        <Sider width={250} theme="light">
         {currentProject &&currentProject.project && (
               <div style={{ padding: 16 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Text strong>{currentProject.project.projectName}</Text>
                  {isLeader &&
                  (
                    <Button style={{ padding: "1rem" }} icon={<EditOutlined />} type="text"
                    onClick={() => setIsOpenModal(true)} />
                  )}
               </div>
               <div style={{ marginTop: 16, textAlign: 'center' }}>
                   <Flex gap="10px" justify="left" align="center">
                       <Avatar src={currentProject.project.leader.avatar} size={40} icon={<UserOutlined />} />
                       <Flex vertical gap="0px" align="left" style={{textAlign: "left"}}>
                           <Text>Leader: {currentProject.project.leader.fullName}</Text>
                           {/* <Text type="secondary" style={{ fontSize: "0.7rem" }}>Join date: 29/03/2025</Text> */}
                       </Flex>
                   </Flex>
               </div>
               <Divider />
               <Menu
                   mode="inline"
                   selectedKeys={[selectedTab]}
                   onClick={(e) => navigate(`/manage-project/${projectId}/${e.key}`)}
               >
                   <Menu.ItemGroup key="general" title="General">
                       <Menu.Item key="home" icon={<HomeOutlined />}>Home</Menu.Item>
                       <Menu.Item key="members" icon={<TeamOutlined />}>Members</Menu.Item>
                       <Menu.Item key="finance" icon={<DollarOutlined />}>Finance Plan</Menu.Item>
                       <Menu.Item key="donations" icon={<FileTextOutlined />}>Donations Records</Menu.Item>
                       <Menu.Item key="tasks" icon={<OrderedListOutlined />}>Task Plan</Menu.Item>
                       <Menu.Item key="help" icon={<QuestionCircleOutlined />}>Help Request</Menu.Item>
                   </Menu.ItemGroup>
               </Menu>
               <Divider />
               <Menu
                   mode="inline"
                   selectedKeys={[selectedTab]}
                   onClick={(e) => navigate(`/manage-project/${projectId}/${e.key}`)}
               >
                   <Menu.ItemGroup key="general" title="Personal">
                       <Menu.Item key="mytasks" icon={<CheckCircleOutlined />}>My Tasks</Menu.Item>
                   </Menu.ItemGroup>
               </Menu>
               <ProjectUpdateModal form={form} projectData={currentProject} isOpenModal={isOpenModal} setIsOpenModal={setIsOpenModal} />
           </div>
            )}
        </Sider>
    );
};
export default SideBarMain;