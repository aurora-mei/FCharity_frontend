import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Typography, Divider, Card, Row, Col } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProjectsThunk } from '../../redux/project/projectSlice';
const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const SideBarMini = () => {
    const [selectedKey, setSelectedKey] = useState('');
    const myProjects = useSelector((state) => state.project.myProjects);
    const [ownerProject, setOwnerProject] = useState({});
    const [joinedProjects, setJoinedProjects] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.auth.currentUser);
    useEffect(() => {
        if(currentUser && currentUser.id !== undefined) {
            dispatch(fetchMyProjectsThunk(currentUser.id));
        }
    }, [dispatch,currentUser]);
    useEffect(() => {
        console.log(myProjects);
       if(Array.isArray(myProjects)  && myProjects.length > 0) {
            setOwnerProject(myProjects.filter(projectData => projectData.project.leader.id === currentUser.id)[0]);
            setJoinedProjects(myProjects.filter(projectData =>projectData.project.leader.id !== currentUser.id));
        }
        console.log("ownerProjects", ownerProject);
        console.log("joinedProjects", joinedProjects);
       
    }, [dispatch,myProjects,currentUser]);
    useEffect(()=>{
        if(ownerProject && ownerProject.project && ownerProject.project.id) {
            console.log("ownerProject", ownerProject);
            setSelectedKey(ownerProject.project.id);
            navigate(`/manage-project/${ownerProject.project.id}/home`)
           }
    },[ownerProject, joinedProjects]);
    const handleClick = (e) => {
        setSelectedKey(e.key);
        navigate(`/manage-project/${e.key}/home`)
    };

    return (
        <Sider width={80} theme="light">
            <div style={{ padding: '1rem 0', textAlign: 'center', backgroundColor: '#f0f2f5', fontSize: '0.9rem' }}>
                <b>Lead</b> 
            </div>
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={handleClick}
            >
                {ownerProject && ownerProject.project && (
                        <Menu.Item key={ownerProject.project.id}
                         title={ownerProject.project.projectName}><Title level={4} >{ownerProject.project.projectName.substring(0, 1).toUpperCase()}</Title></Menu.Item>
                    )
                }
            </Menu>
            <Divider />
            <div style={{ padding: '1rem 0', textAlign: 'center', backgroundColor: '#f0f2f5', fontSize: '0.8rem' }}>
                <b>Joined</b>
            </div>
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={handleClick}
            >
                 {joinedProjects && joinedProjects.length > 0 &&
                    joinedProjects.map((projectData) => (
                        <Menu.Item key={projectData.project.id} title={projectData.project.projectName}><Title level={4} >{projectData.project.projectName.substring(0,1).toUpperCase()}</Title></Menu.Item>
                    ))
                }
           </Menu>
        </Sider>
    );
};
export default SideBarMini;