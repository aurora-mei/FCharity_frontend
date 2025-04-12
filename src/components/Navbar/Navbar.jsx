import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  CaretDownOutlined,
  // Example icons you might want for the popover:
  // BulbOutlined, TeamOutlined, ReadOutlined, PlusCircleOutlined
} from "@ant-design/icons";
import {
  Affix,
  Button,
  Flex,
  Space,
  Row,
  Col,
  Dropdown, // Keep for User Menu
  Popover, // **** ADD Popover ****
  Typography, // **** ADD Typography ****
} from "antd";
import avatar from "../../assets/download (11).jpg";
import { logOut } from "../../redux/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation, Trans } from "react-i18next";
import {
  getManagedOrganizationByCeo, // tự động lấy tổ chức do mình tạo ra
  getManagedOrganizationsByManager, // lấy các tổ chức do mình nắm vai trò quản lý
  getJoinedOrganizations, // lấy các tổ chức mà mình đã tham gia (member)
} from "../../redux/organization/organizationSlice";
import logo from "../../assets/apgsoohzrdamo4loggow.svg";
import "./Navbar.pcss";
import { fetchMyProjectsThunk } from "../../redux/project/projectSlice"; // Import your thunk action
const lngs = {
  en: { nativeName: "English" },
  ja: { nativeName: "Japan" },
};

// **** ADD Popover Content Component ****
const FundraisePopoverContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigate = (path) => {
    navigate(path);
    // Popover usually closes on navigation or click outside,
    // manual close logic is typically not needed here.
  };

  return (
    // Add a wrapper div with a class for styling from Navbar.pcss
    <div className="fundraise-content-wrapper">
      <Flex align="center" gap="10px" className="fundraise-popover-header">
        {/* <BulbOutlined className="popover-header-icon" /> */}
        <Typography.Title level={5} style={{ margin: 0 }}>
          {t("fundraisingResources", "Fundraising Resources")}
        </Typography.Title>
      </Flex>

      <Row gutter={[24, 16]}>
        {" "}
        {/* Use gutter for spacing between columns */}
        {/* Column 1 */}
        <Col xs={24} sm={12}>
          <div
            className="popover-item"
            onClick={() => handleNavigate("/requests/create")}
          >
            {/* <PlusCircleOutlined className="popover-item-icon" /> */}
            <div className="popover-item-text">
              <Typography.Text strong>
                {t("createRequestWithAI", "Create Request with AI")}
              </Typography.Text>
              <Typography.Text type="secondary">
                {t(
                  "startNewSupportRequestAI",
                  "Start a new support request using AI."
                )}
              </Typography.Text>
            </div>
          </div>
          <div
            className="popover-item"
            onClick={() => handleNavigate("/fundraising-ideas")}
          >
            {/* <BulbOutlined className="popover-item-icon" /> */}
            <div className="popover-item-text">
              <Typography.Text strong>
                {t("fundraisingIdeas", "Fundraising Ideas")}
              </Typography.Text>
              <Typography.Text type="secondary">
                {t("ideasToSparkCreativity", "Ideas to spark your creativity.")}
              </Typography.Text>
            </div>
          </div>
          {/* Add more items like "Fundraising Categories" here if needed */}
        </Col>
        {/* Column 2 */}
        <Col xs={24} sm={12}>
          <div
            className="popover-item"
            onClick={() => handleNavigate("/fundraising-tips")}
          >
            {/* <ReadOutlined className="popover-item-icon" /> */}
            <div className="popover-item-text">
              <Typography.Text strong>
                {t("fundraisingTips", "Fundraising Tips")}
              </Typography.Text>
              <Typography.Text type="secondary">
                {t(
                  "ultimateFundraisingGuide",
                  "The ultimate fundraising tips guide."
                )}
              </Typography.Text>
            </div>
          </div>

          <div
            className="popover-item"
            onClick={() => handleNavigate("/team-fundraising")}
          >
            {/* <TeamOutlined className="popover-item-icon" /> */}
            <div className="popover-item-text">
              <Typography.Text strong>
                {t("teamFundraising", "Team Fundraising")}
              </Typography.Text>
              <Typography.Text type="secondary">
                {t("fundraiseTogether", "Fundraise together with a team.")}
              </Typography.Text>
            </div>
          </div>
          {/* Add more items like "Charity Fundraising" or "Sign up as Charity" here if needed */}
        </Col>
      </Row>
      {/* Optional Footer Button (Example) */}
      {/* <Button type="primary" className="popover-footer-button" block onClick={() => handleNavigate('/start-fundraiser')}>
          {t('startAFundraiser', 'Start a Fundraiser')}
       </Button> */}
    </div>
  );
};
// **** End Popover Content Component ****

const Navbar = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const token = useSelector((state) => state.auth.token);
  const storedUser = localStorage.getItem("currentUser");
  const dispatch = useDispatch();
  const myProjects = useSelector((state) => state.project.myProjects);

  let currentUser = {};
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Error parsing currentUser from localStorage:", error);
    currentUser = {};
  }

  // *** Updated logout function - prefer navigation over full page reload ***
  const logout = () => {
    dispatch(logOut());
    navigate("/");
  };

  const { ownedOrganization, managedOrganizations } =
    useSelector((state) => state.organization);

  useEffect(() => {
    if (currentUser && currentUser.id !== undefined) {
      dispatch(fetchMyProjectsThunk(currentUser.id));
    }
    dispatch(getManagedOrganizationByCeo());
    dispatch(getManagedOrganizationsByManager());
    dispatch(getJoinedOrganizations());
  }, []);

  // *** This is NO LONGER needed if using Popover ***
  // const fundraiseMenuItems = [ ... ];

  // User Menu Items (Dropdown) - Renamed for clarity
  const userMenuItems = [
    {
      key: "1",
      label: (
        <Link to="/user/manage-profile/profile">
          {t("userDashboard", "User Dashboard")}
        </Link>
      ),
    },
    {
      key: "2",
      label: ownedOrganization ? (
        <Link rel="noopener noreferrer" to="/my-organization">
          My Organization
        </Link>
      ) : (
        <Link rel="noopener noreferrer" to="/organizations/create">
          Create Your Organization
        </Link>
      ),
    },
    {
      key: "3",
      label:
        managedOrganizations && managedOrganizations.length > 0 ? (
          <Link rel="noopener noreferrer" to="/joined-organizations">
            Joined Organizations
          </Link>
        ) : (
          <Link rel="noopener noreferrer" to="/organizations">
            Discover Organizations
          </Link>
        ),
    },
    {
      key: "4",
      label:
        myProjects && myProjects.length > 0 ? (
          <Link rel="noopener noreferrer" to="/manage-project">
            My Project
          </Link>
        ) : (
          <Link rel="noopener noreferrer" to="/manage-project">
            Discover Project
          </Link>
        ),
    },
    {
      key: "5",
      // Use a span or div for onClick if not a real navigation link
      label: (
        <span onClick={logout} style={{ cursor: "pointer", display: "block" }}>
          {t("signOut", "Sign out")}
        </span>
      ),
    },
  ].filter((item) => item.label); // Filter out items that shouldn't be rendered (like key '3' if not leader)

  return (
    // Removed onChange from Affix as it was just logging
    <Affix offsetTop={0}>
      {/* Apply the .navbar class from your pcss file */}
      <Row className="navbar" align="middle">
        {" "}
        {/* Added align="middle" for vertical centering */}
        {/* Column 1: Left Links */}
        <Col xs={24} md={8}>
          {" "}
          {/* Responsive Columns */}
          <Flex justify="flex-start" align="center" gap="10px" wrap="wrap">
            {" "}
            {/* Added wrap */}
            <Button
              className="btn-custom"
              type="text"
              icon={<SearchOutlined />}
              onClick={() => navigate("/search")} // Example navigation
            >
              {t("search", "Search")}
            </Button>
            <Button className="btn-custom" type="text">
              <Space>
                {t("donate", "Donate")} <CaretDownOutlined />
              </Space>
            </Button>
            {/* **** REPLACE Dropdown with Popover **** */}
            <Popover
              content={<FundraisePopoverContent />}
              trigger="click"
              placement="bottomLeft"
              overlayClassName="fundraise-popover-panel" // Class for styling the panel
            // arrow={false} // Optionally hide the arrow pointer
            >
              <Button className="btn-custom" type="text">
                <Space>
                  {t("fundraise", "Fundraise")} <CaretDownOutlined />
                </Space>
              </Button>
            </Popover>
            {/* **** End Replacement **** */}
            <Button
              type="text"
              className="btn-custom"
              onClick={() => navigate("/forum")}
            >
              {t("forum", "Forum")}
            </Button>
          </Flex>
        </Col>
        {/* Column 2: Logo */}
        {/* Hide logo on smaller screens to prevent layout issues if needed */}
        <Col xs={0} md={8}>
          <Flex justify="center" align="center" style={{ height: "100%" }}>
            {" "}
            {/* Use 100% height */}
            {/* Use Link for internal navigation */}
            <Link to="/">
              {/* Ensure alt text is descriptive */}
              <img
                src={logo}
                alt="FCharity Logo"
                style={{ height: "90px", display: "block" }}
              />{" "}
              {/* Added display block */}
            </Link>
          </Flex>
        </Col>
        {/* Column 3: Right Actions */}
        <Col xs={24} md={8}>
          {" "}
          {/* Responsive Columns */}
          <Flex justify="flex-end" align="center" gap="10px" wrap="wrap">
            {" "}
            {/* Added wrap */}
            {token ? (
              // Use the renamed user menu items
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                {/* Added specific class for potential user button styling */}
                <Button className="btn-custom btn-user" type="text">
                  <img
                    src={currentUser?.avatar ?? avatar} // Use optional chaining
                    alt="User avatar" // Better alt text
                    className="user-avatar" // Add class for styling
                  />
                  {/* Wrap name in span for styling/hiding on small screens */}
                  <span className="user-name">{currentUser?.fullName}</span>
                </Button>
              </Dropdown>
            ) : (
              <Button
                className="btn-custom"
                type="text"
                onClick={() => navigate("/auth/login")}
              >
                {t("signIn", "Sign in")}
              </Button>
            )}
            <Button
              type="primary"
              shape="round"
              // Use the class from your pcss
              className="request-btn"
              onClick={() => navigate("/requests/create")}
            >
              {t("startRequest", "Start a request")}
            </Button>
            {/* Language Switcher */}
            <Flex vertical className="language-switcher">
              {Object.keys(lngs).map((lng) => (
                <button
                  key={lng}
                  // Add classes for styling from pcss
                  className={`language-button ${i18n.resolvedLanguage === lng ? "active" : ""
                    }`}
                  // *** Use type="button" for non-submitting buttons ***
                  type="button"
                  onClick={() => {
                    i18n.changeLanguage(lng);
                  }}
                // Remove inline style if handled by CSS/PCSS
                >
                  {lngs[lng].nativeName}
                </button>
              ))}
            </Flex>
          </Flex>
        </Col>
      </Row>
    </Affix>
  );
};

export default Navbar;
