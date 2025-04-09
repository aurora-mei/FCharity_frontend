import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import SideBarMain from '../../components/ProjectSidebarMain/ProjectSidebarMain.jsx';
import SideBarMini from '../../components/ProjectSidebarMini/ProjectSidebarMini.jsx';
import HomeContent from '../../containers/ProjectHomeContainer/ProjectHomeContainer.jsx';
import {TeamOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
const { Content } = Layout;
const ProjectDashboard = () => (
      <Layout style={{ minHeight: '100vh' }}>
        <SideBarMini />
        <Layout>
          <SideBarMain />
          <Layout>
            <Content style={{ padding: 24 }}>
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </Layout>
  );
  export default ProjectDashboard;