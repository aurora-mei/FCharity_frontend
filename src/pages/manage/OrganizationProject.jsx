import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,

} from "recharts";
import { fetchProjectsByOrgThunk, fetchSpendingPlansOfProject, fetchSpendingItemOfPlan } from "../../redux/project/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import ManagerLayout from "../../components/Layout/ManagerLayout";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { Col, Row, Button, Flex, Modal, Skeleton, Empty ,Typography } from "antd";
const { Title } = Typography;
import { Table } from "antd";
const OrganizationProject = () => {
  const myOrganization = useSelector((state) => state.organization.ownedOrganization);

  // const { organizationId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const spendingPlans = useSelector((state) => state.project.spendingPlans);
  const spendingItems = useSelector((state) => state.project.spendingItems);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Active",
  });
  const projectByOrg = useSelector(state => state.project.projects);
  useEffect(() => {
    // console.log("Organization ID:", organizationId);
    dispatch(fetchProjectsByOrgThunk(myOrganization.organizationId));
  }, [myOrganization]);

  const projectStatusData = [
    {
      name: "Active",
      value: projects.filter((p) => p.status === "Active").length,
    },
    {
      name: "Completed",
      value: projects.filter((p) => p.status === "Completed").length,
    },
    {
      name: "Pending",
      value: projects.filter((p) => p.status === "Pending").length,
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "members", label: "Members" },
    { id: "tasks", label: "Tasks" },
    { id: "reports", label: "Reports" },
  ];
  const columns = [
    {
      title: "Item Name",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Estimated Cost",
      dataIndex: "estimatedCost",
      key: "estimatedCost",
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
    },

  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>

            <Row gutter={[16, 16]}>
              {
                projectByOrg &&
                Array.isArray(projectByOrg) &&
                projectByOrg.length > 1 && projectByOrg.map(project => (
                  <Col key={project.project.id} span='8' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                    {project.project.projectStatus === "PLANNING"
                      ?
                      (
                        <Flex vertical='true' gap='1rem' style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                          <ProjectCard key={project.project.id} projectData={project} only={false} />
                          <Button onClickCapture={() => {
                            setIsOpenModal(true)
                            setSelectedProject(project)
                            setLoading(true);
                            console.log("Selected Project:", project);
                            if (selectedProject && selectedProject.project) {
                              console.log(selectedProject.project.id);
                              dispatch(fetchSpendingPlansOfProject(selectedProject.project.id));
                            }
                            if (spendingPlans && spendingPlans.length > 0) {
                              dispatch(fetchSpendingItemOfPlan(spendingPlans[0].id));
                            }
                          }
                          } type="primary" style={{ marginTop: '10px' }} onClick={() => { }}>View Spending plan</Button>
                        </Flex>
                      ) : <ProjectCard key={project.project.id} projectData={project} only={false} />}
                  </Col>
                ))
              }
            </Row>
            <Modal open={isOpenModal} onCancel={() => setIsOpenModal(false)} footer={null} width={1000}>
              {loading ? (
                <>
                  <Flex justify="space-between" align="center" style={{ padding: '20px' }}>
                    <Title level={4}>
                      {(spendingPlans && spendingPlans.length) ? spendingPlans[0].planName : ""}
                    </Title>
                    <Button>Approve</Button>
                  </Flex>

                  {spendingItems && spendingItems.length > 0 ? (
                    <Table
                      rowKey={(record, index) => index}
                      columns={columns.filter(Boolean)}
                      dataSource={spendingItems}
                      pagination={false}
                    />
                  ) : (
                    <Empty
                      title="No spending items found"
                      description="Please add a spending item."
                      style={{ marginTop: '20px' }}
                    />
                  )}
                </>
              ) : (
                <Skeleton active paragraph={{ rows: 4 }} />
              )}
            </Modal>

          </>
        );
      case "members":
        return (
          <div className="text-gray-600">
            List of members working on projects (to be implemented).
          </div>
        );
      case "tasks":
        return (
          <div className="text-gray-600">
            List of tasks for projects (to be implemented).
          </div>
        );
      case "reports":
        return (
          <div className="text-gray-600">
            Project reports (to be implemented).
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="pl-2">
        <div className="inline-flex gap-2 items-baseline">
          <FaLink />
          <Link to={"/"} className="hover:underline">
            Home
          </Link>
        </div>
        <span> / </span>
        <Link to={"/manage-organization"} className="hover:underline">
          my-organization
        </Link>
        <span> / </span>
        <Link to={"/manage-organization/projects"} className="hover:underline">
          projects
        </Link>
      </div>
      <div className="min-h-screen bg-gray-100 p-6 m-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Project Management
          </h1>

          <nav className="flex space-x-4 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationProject;
