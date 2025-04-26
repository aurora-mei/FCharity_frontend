import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../services/api";
import moment from "moment";
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
  rejectSpendingPlanThunk,
  setOrgProjects,
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
const { Title, Text } = Typography;
import { Table, Pagination, Form, Input } from "antd";
const { TextArea } = Input;
const OrganizationProject = () => {
  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const [rejectForm] = Form.useForm();
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
  const loading = useSelector((state) => state.project.loading);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };
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
    if (currentOrganization) {
      dispatch(fetchProjectsByOrgThunk(currentOrganization.organizationId));
    } else {
      dispatch(setOrgProjects([]));
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
      render: (text) => <span>{text.toLocaleString()} VND</span>,
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
    },
  ];

  console.log("projectByOrg", projectByOrg);

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
                            setSelectedProject(project);
                            console.log("Selected Project:", project);
                            dispatch(
                              fetchSpendingPlanOfProject(project.project.id)
                            );
                            if (currentSpendingPlan && currentSpendingPlan.id) {
                              dispatch(
                                fetchSpendingItemOfPlan(currentSpendingPlan.id)
                              );
                            }
                            setIsOpenModal(true);
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
            {selectedProject && selectedProject.project && (
              <Modal
                open={isOpenModal}
                title={
                  <>
                    Spending plan of project{" "}
                    <b>{selectedProject?.project.projectName}</b>
                    <br />
                    Project planned start at:{" "}
                    <Text type="secondary">
                      {moment(selectedProject.project.plannedStartTime).format(
                        "DD/MM/YYYY hh:mm A"
                      )}
                    </Text>
                  </>
                }
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
                        style={{
                          padding: "16px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <Title level={5} style={{ margin: 0 }}>
                          {currentSpendingPlan.planName}
                        </Title>

                        <Flex gap={10} align="center">
                          {currentSpendingPlan.approvalStatus === "SUBMITED" ? (
                            <>
                              <Button
                                type="primary"
                                onClick={() => {
                                  Modal.confirm({
                                    title:
                                      "Are you sure you want to approve this spending plan?",
                                    onOk: () => {
                                      dispatch(
                                        approveSpendingPlanThunk(
                                          currentSpendingPlan.id
                                        )
                                      );
                                    },
                                    onCancel: () => {
                                      console.log("Cancelled");
                                    },
                                    okText: "Approve",
                                    cancelText: "Cancel",
                                    centered: true,
                                    closable: true,
                                    maskClosable: true,
                                  });
                                }}
                              >
                                Approve
                              </Button>

                              <Button
                                type="primary"
                                danger
                                onClick={() => setOpenRejectModal(true)}
                              >
                                Reject
                              </Button>

                              <Modal
                                open={openRejectModal}
                                onCancel={() => setOpenRejectModal(false)}
                                title={
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "18px",
                                    }}
                                  >
                                    Reject Spending Plan
                                  </span>
                                }
                                footer={null}
                                centered
                                destroyOnClose
                              >
                                <p
                                  style={{
                                    marginBottom: "16px",
                                    color: "#555",
                                  }}
                                >
                                  Please provide a reason to help the project
                                  leader adjust the plan accordingly.
                                </p>

                                <Form
                                  form={rejectForm}
                                  layout="vertical"
                                  onFinish={(values) => {
                                    console.log(
                                      "Reject Reason:",
                                      values.reason
                                    );
                                    dispatch(
                                      rejectSpendingPlanThunk({
                                        planId: currentSpendingPlan.id,
                                        reason: values.reason,
                                      })
                                    );
                                    setOpenRejectModal(false);
                                  }}
                                >
                                  <Form.Item
                                    label={
                                      <span style={{ fontWeight: 500 }}>
                                        Reason
                                      </span>
                                    }
                                    name="reason"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please enter a reason",
                                      },
                                    ]}
                                  >
                                    <Input.TextArea
                                      rows={4}
                                      placeholder="Enter your reason here..."
                                    />
                                  </Form.Item>

                                  <Form.Item
                                    style={{
                                      textAlign: "right",
                                      marginTop: 24,
                                    }}
                                  >
                                    <Button
                                      onClick={() => setOpenRejectModal(false)}
                                      style={{ marginRight: 8 }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit">
                                      Reject Plan
                                    </Button>
                                  </Form.Item>
                                </Form>
                              </Modal>
                            </>
                          ) : (
                            <Tag color="blue" style={{ fontWeight: 500 }}>
                              {currentSpendingPlan.approvalStatus}
                            </Tag>
                          )}

                          <div style={{ fontWeight: "bold" }}>
                            Total:&nbsp;
                            {spendingItems
                              .reduce(
                                (total, item) =>
                                  total + (item.estimatedCost || 0),
                                0
                              )
                              .toLocaleString()}{" "}
                            VND
                          </div>
                          <b>
                            Extra fund:{" "}
                            {currentSpendingPlan.maxExtraCostPercentage}%
                          </b>
                        </Flex>
                      </Flex>

                      <div style={{ marginTop: 20 }}>
                        {spendingItems && spendingItems.length > 0 ? (
                          <Flex vertical gap={20}>
                            <Table
                              rowKey={(record, index) => index}
                              columns={columns.filter(Boolean)}
                              dataSource={spendingItems.slice(
                                (currentPage - 1) * pageSize,
                                currentPage * pageSize
                              )}
                              bordered
                              pagination={false}
                            />

                            <Pagination
                              current={currentPage}
                              pageSize={pageSize}
                              total={spendingItems.length}
                              showSizeChanger
                              pageSizeOptions={["5", "10", "20", "50"]}
                              onChange={handlePaginationChange}
                              onShowSizeChange={handlePaginationChange}
                              showTotal={(total, range) =>
                                `${range[0]}-${range[1]} of ${total} items`
                              }
                              itemRender={(page, type, originalElement) => {
                                if (type === "page") {
                                  return <a>{page}</a>;
                                }
                                return originalElement;
                              }}
                              locale={{
                                items_per_page: "items / page",
                              }}
                              style={{ alignSelf: "flex-end" }}
                            />
                          </Flex>
                        ) : (
                          <Empty
                            description="No spending items found"
                            style={{ marginTop: 40 }}
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <Empty
                      description="No spending plan found"
                      style={{ marginTop: 40 }}
                    />
                  )
                ) : (
                  <Skeleton active paragraph={{ rows: 4 }} />
                )}
              </Modal>
            )}
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

  console.log("currentOrganization: ", currentOrganization);

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
                className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${
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
