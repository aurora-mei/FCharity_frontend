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
import {
  fetchProjectsByOrgThunk,
  fetchSpendingPlanOfProject,
  fetchSpendingItemOfPlan,
  approveSpendingPlanThunk,
} from "../../redux/project/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { getManagedOrganizationsByManager } from "../../redux/organization/organizationSlice";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getManagedOrganizationByCeo } from "../../redux/organization/organizationSlice";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import {
  Col,
  Row,
  Button,
  Flex,
  Modal,
  Skeleton,
  Empty,
  Typography,
  Tag,
} from "antd";
const { Title } = Typography;
import { Table } from "antd";
const OrganizationProject = () => {
  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  // const { organizationId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const currentSpendingPlan = useSelector(
    (state) => state.project.currentSpendingPlan
  );
  const spendingItems = useSelector((state) => state.project.spendingItems);
  const [loading, setLoading] = useState(false);
  const currentRole = useSelector((state) => state.organization.currentRole);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  const projectByOrg = useSelector((state) => state.project.projects);

  useEffect(() => {
    if (currentRole === "ceo") dispatch(getManagedOrganizationByCeo());

    if (currentRole === "manager") dispatch(getManagedOrganizationsByManager());
  }, [dispatch]);

  useEffect(() => {
    if (currentOrganization && currentOrganization.organizationId) {
      dispatch(fetchProjectsByOrgThunk(currentOrganization.organizationId));
    }
  }, [dispatch, currentOrganization]);

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
              {projectByOrg &&
                Array.isArray(projectByOrg) &&
                projectByOrg.length > 1 &&
                projectByOrg.map((project) => (
                  <Col
                    key={project.project.id}
                    span="8"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignContent: "center",
                    }}
                  >
                    {project.project.projectStatus === "PLANNING" ? (
                      <Flex
                        vertical="true"
                        gap="1rem"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignContent: "center",
                          position: "relative",
                          width: "100%",
                        }}
                      >
                        <ProjectCard
                          key={project.project.id}
                          projectData={project}
                          only={false}
                        />
                        <Button
                          style={{
                            marginTop: "10px",
                          }}
                          onClickCapture={() => {
                            setIsOpenModal(true);
                            setLoading(true);
                            setSelectedProject(project);
                            console.log("Selected Project:", project);
                            if (
                              selectedProject &&
                              selectedProject.project &&
                              selectedProject.project.id
                            ) {
                              dispatch(
                                fetchSpendingPlanOfProject(
                                  selectedProject.project.id
                                )
                              );
                            }
                            if (currentSpendingPlan && currentSpendingPlan.id) {
                              dispatch(
                                fetchSpendingItemOfPlan(currentSpendingPlan.id)
                              );
                            }
                            if (spendingItems && spendingItems.length > 0) {
                              setLoading(false);
                            }
                          }}
                          type="primary"
                          onClick={() => {}}
                        >
                          View Spending plan
                        </Button>
                      </Flex>
                    ) : (
                      <ProjectCard
                        key={project.project.id}
                        projectData={project}
                        only={false}
                      />
                    )}
                  </Col>
                ))}
            </Row>
            <Modal
              open={isOpenModal}
              onCancel={() => setIsOpenModal(false)}
              footer={null}
              width={1000}
            >
              {!loading ? (
                currentSpendingPlan && currentSpendingPlan.id ? (
                  <>
                    <Flex
                      justify="space-between"
                      align="center"
                      style={{ padding: "20px" }}
                    >
                      <Title level={4}>{currentSpendingPlan.planName}</Title>
                      {currentSpendingPlan.approvalStatus === "SUBMITED" ? (
                        <Button
                          onClick={() => {
                            dispatch(
                              approveSpendingPlanThunk(currentSpendingPlan.id)
                            );
                          }}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Tag>{currentSpendingPlan.approvalStatus}</Tag>
                      )}
                    </Flex>

                    {spendingItems && spendingItems.length > 0 ? (
                      <Table
                        rowKey={(record, index) => index}
                        columns={columns.filter(Boolean)}
                        dataSource={spendingItems}
                        pagination={false}
                      />
                    ) : (
                      <Empty description="No spending items found" />
                    )}
                  </>
                ) : (
                  <Empty description="No spending plan found" />
                )
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
      {currentOrganization && (
        <div className="min-h-screen mx-auto bg-gray-50 p-4">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Project Management
          </h1>

          <nav className="flex space-x-4 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 hover:cursor-pointer text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="bg-white rounded-sm shadow-md px-6 py-3 h-[600px] overflow-y-scroll">
            {renderContent()}
          </div>
        </div>
      )}

      {!currentOrganization && (
        <div className="p-6">
          <div className="flex justify-end items-center">
            <Link
              to="/organizations"
              className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
            >
              Discover organizations
            </Link>
          </div>
          <div className="flex justify-center items-center min-h-[500px]">
            <Empty description="You are not a member of any organization" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationProject;
