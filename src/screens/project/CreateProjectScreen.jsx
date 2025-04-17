import {
  Row,
  Col,
  Menu,
  Affix,
  Button,
  Empty,
  Flex,
  Card,
  Table,
  Checkbox,
  Avatar,Select ,
  Tag,
  Typography,Skeleton
} from "antd";
import ProjectForm from "../../components/ProjectForm/ProjectForm";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  addProjectMemberThunk,
  removeProjectMemberThunk,
  fetchAllProjectMembersThunk,
} from "../../redux/project/projectSlice";
import {
  getAllMembersInOrganization,
  getManagedOrganizationByCeo,
} from "../../redux/organization/organizationSlice";
import { useEffect, useState } from "react";

import moment from "moment";
const { Title } = Typography;
const ScreenStyled = styled.div`
  padding: 4rem;
  background-color: #f0f2f5;
  min-height: 100vh;
`;
const StyledContainer = styled.div`
  padding: 0;
  background: #f3f4f6;
  min-height: 20rem;
  display: flex;
  justify-content: center;
  .table-wrapper {
    padding: 1rem;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
  }

  .name-container {
    display: flex;
    align-items: center;
  }

  .avatar {
    margin-left: 8px;
  }

  .name-text {
    margin-left: 8px;
  }

  .status-text {
    display: flex;
    align-items: center;
  }
`;
const StyledCard = styled(Card)`
  padding: 1rem;
  height: fit-content;
  width: 100%;
  align-self: flex-start;
`;
const StyledButton = styled(Button)`
  padding: 1rem !important;
  background-color: var(--primary-button-bg-color);
  border-color: var(--primary-button-bg-color);
  color: white !important;
  font-size: 0.8rem !important;
  &:hover {
    padding: 1rem !important;
    background-color: var(--primary-button-bg-color) !important;
    border-color: var(--primary-button-bg-color) !important;
    box-shadow: 0 0 0 2px var(--primary-button-bg-color);
  }
`;
const CreateProjectScreen = () => {
  const { requestId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myProjectMembers = useSelector((state) => state.project.projectMembers);
  const newProject = useSelector((state) => state.project.currentProject);
  const { ownedOrganization } = useSelector((state) => state.organization);
  const { currentOrganizationMembers } = useSelector(
    (state) => state.organization
  );
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedOrgMembers, setSelectedOrgMembers] = useState([]);
  const [selectedProjectMembers, setSelectedProjectMembers] = useState([]);
  const [isFirstMount, setIsFirstMount] = useState(true);
  const [memberRole, setMemberRole] = useState("MEMBER");

  let currentUser = {};
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Error parsing currentUser:", error);
    }
  }
  const handleAddMembers =  () => {
    console.log("selectedOrgMembers", selectedOrgMembers);
    for (const userId of selectedOrgMembers) {
         dispatch(addProjectMemberThunk({ projectId: newProject.project.id, userId,role: memberRole }));
    }
    setAvailableMembers((prev) =>
        prev.filter((member) => !selectedOrgMembers.includes(member.user.id))
    );
    setSelectedOrgMembers([]);
};
  const handleRemoveMembers = () => {
    console.log("selectedProjectMembers", selectedProjectMembers);
    selectedProjectMembers.forEach((memberId) => {
      dispatch(removeProjectMemberThunk(memberId));
    });
    const removedMembers = myProjectMembers.filter((member) =>
      selectedProjectMembers.includes(member.id)
    );
    setAvailableMembers((prev) => [...prev, ...removedMembers]);

    setSelectedProjectMembers([]);
  };
  const handleCheckboxChange = (userId, checked) => {
    setSelectedOrgMembers((prev) => {
      if (checked) {
        return [...prev, userId]; // Thêm user nếu được check
      } else {
        return prev.filter((id) => id !== userId); // Bỏ user nếu bị uncheck
      }
    });
    console.log(userId, checked);
    console.log("selectedOrgMembers", selectedOrgMembers);
  };
  const handleCheckboxProjectChange = (memberId, checked) => {
    setSelectedProjectMembers((prev) => {
      if (checked) {
        return [...prev, memberId]; // Thêm user nếu được check
      } else {
        return prev.filter((id) => id !== memberId); // Bỏ user nếu bị uncheck
      }
    });
    console.log("selectedMembersProject", selectedProjectMembers);
  };
  const projectColumns = [
    {
      title: "Select",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Checkbox
          onChange={(e) => handleCheckboxProjectChange(text, e.target.checked)}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div className="name-container">
          <Avatar src={user.avatar} className="avatar" />
          <span className="name-text">{user.fullName}</span>
        </div>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (text) => <span>{moment(text).format("DD/MM/YYYY")}</span>,
    },
    {
      title: "Role",
      dataIndex: "memberRole",
      key: "memberRole",
      render: (text, record) => <Tag>{text}</Tag>,
    },
  ];
  const orgColumns = [
    {
      title: "Select",
      dataIndex: "user",
      key: "select",
      render: (user) => (
        <Checkbox
          onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div className="name-container">
          <Avatar src={user.avatar} className="avatar" />
          <span className="name-text">{user.fullName}</span>
        </div>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (text) => <span>{moment(text).format("DD/MM/YYYY")}</span>,
    },
    {
      title: "Role",
      dataIndex: "memberRole",
      key: "memberRole",
      render: (text, record) => <Tag>{text}</Tag>,
    },
  ];
  useEffect(() => {
    console.log("New Project:", newProject);
    dispatch(getManagedOrganizationByCeo()); // tự động lấy id người dùng phía backend
    if (newProject && newProject.project)
      dispatch(fetchAllProjectMembersThunk(newProject.project.id));
    console.log("Project Members:", myProjectMembers);
    console.log("Organization Members:", currentOrganizationMembers);
    if (isFirstMount && currentOrganizationMembers?.length > 0) {
      setAvailableMembers(currentOrganizationMembers.filter((x)=>x.memberRole==="MEMBER" && newProject.project.leader.id !== x.user.id));
      setIsFirstMount(false); 
    }
  }, [dispatch, newProject]);
    useEffect(() => {
      if (ownedOrganization) {
        dispatch(getAllMembersInOrganization(ownedOrganization.organizationId));
      }
    }, [dispatch, ownedOrganization]);
  return (
    <ScreenStyled>
      <Row
        justify="center"
        align="top"
        gutter={[32, 16]}
        style={{ minHeight: "100vh" }}
      >
        <Col span={24}>
         {
          ownedOrganization && ownedOrganization.organizationId && !newProject.project  ? 
          (<ProjectForm requestId={requestId} myOrganization={ownedOrganization} />)
         :(
          newProject.project && 
            (
            <Flex vertical gap={20} justify="flex-start">
              <StyledCard title="Project Information">
                <Flex>
                  <Flex style={{ marginRight: "1rem" }}>
                    <img
                      src={newProject.attachments[0].imageUrl}
                      style={{
                        width: "3rem",
                        height: "3rem",
                        borderRadius: "2rem",
                      }}
                    />
                    <Flex vertical gap={5} style={{ marginLeft: "1rem" }}>
                      <p>
                        <strong>Project Name:</strong>{" "}
                        {newProject.project.projectName}
                      </p>
                      <p>
                        <strong>Project Start Date:</strong>{" "}
                        {moment(newProject.project.startDate).format(
                          "DD/MM/YYYY"
                        )}
                      </p>
                    </Flex>
                  </Flex>
                  <Flex vertical gap={5}>
                    <p>
                      <strong>Project Description:</strong>{" "}
                      {newProject.project.projectDescription}
                    </p>
                    <p>
                      <strong>Project Status:</strong>{" "}
                      {newProject.project.projectStatus}
                    </p>
                  </Flex>
                </Flex>
              </StyledCard>
              <StyledContainer>
                <div className="table-wrapper">
                  {myProjectMembers && myProjectMembers.length > 0 && (
                    <>
                      <Flex
                        gap={10}
                        justify="space-between"
                        style={{ marginBottom: "0.5rem" }}
                      >
                        <Title level={5}>
                          {newProject.project.projectName} Members
                        </Title>
                        {selectedProjectMembers.length > 0 && (
                          <StyledButton onClick={handleRemoveMembers}>
                            Remove from project
                          </StyledButton>
                        )}
                      </Flex>
                      {myProjectMembers && myProjectMembers.length > 0 ? (
                        <Table
                          dataSource={myProjectMembers}
                          columns={projectColumns}
                          pagination={{
                            pageSize: 10, // Number of rows per page
                            showSizeChanger: true, // Allow the user to change the page size
                            pageSizeOptions: ["5", "10", "20", "50"], // Options for page size
                            showQuickJumper: true, // Allow the user to jump to a specific page
                          }}
                        />
                      ) : (
                        <Empty>No members in this project.</Empty>
                      )}
                    </>
                  )}
                </div>
              </StyledContainer>
              <StyledContainer>
                <div className="table-wrapper">
                  {currentOrganizationMembers && currentOrganizationMembers.length > 0 && (
                    <>
                      <Flex
                        gap={10}
                        justify="space-between"
                        style={{ marginBottom: "0.5rem" }}
                      >
                        <Title level={5}>{ownedOrganization.organizationName.toUpperCase()} Members</Title>
                        {selectedOrgMembers.length > 0 && (
                          <>
                          <Select onChange={(value) => setMemberRole(value)} style={{ width: '20rem', marginRight: '1rem' }} placeholder="Select role">
                              <Select.Option value="ACCOUNTANT">Accountant</Select.Option>
                              <Select.Option value="MEMBER">Member</Select.Option>
                              </Select>
                              <StyledButton onClick={handleAddMembers}>
                                  Add to project
                              </StyledButton>
                              </>
                        )}
                      </Flex>
                      {availableMembers && availableMembers.length > 0 ? (
                        <Table
                          dataSource={availableMembers}
                          columns={orgColumns}
                          pagination={{
                            pageSize: 10, // Number of rows per page
                            showSizeChanger: true, // Allow the user to change the page size
                            pageSizeOptions: ["5", "10", "20", "50"], // Options for page size
                            showQuickJumper: true, // Allow the user to jump to a specific page
                          }}
                        />
                      ) : (
                        <Empty>No members available.</Empty>
                      )}
                    </>
                  )}
                </div>
              </StyledContainer>
              <StyledButton
                onClick={() => {
                  navigate("/my-organization/projects");
                }}
              >
                Navigate to {ownedOrganization.organizationName.toUpperCase()} 
              </StyledButton>
            </Flex>
         
         )
         )} 
        </Col>
      
      </Row>
    </ScreenStyled>
  );
};
export default CreateProjectScreen;
