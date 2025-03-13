import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ForumHeader = ({ sortBy, setSortBy, viewMode, setViewMode }) => {
    const navigate = useNavigate();

    const sortOptions = (
        <Menu>
            {["Best", "New", "Hot", "Top", "Rising"].map((option) => (
                <Menu.Item key={option} onClick={() => setSortBy(option)}>
                    {option}
                </Menu.Item>
            ))}
        </Menu>
    );

    const viewOptions = (
        <Menu>
            <Menu.Item onClick={() => setViewMode("card")} icon={<AppstoreOutlined />}>Card</Menu.Item>
            <Menu.Item onClick={() => setViewMode("compact")} icon={<BarsOutlined />}>Compact</Menu.Item>
        </Menu>
    );

    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingRight: "20px", paddingTop: "20px" }}>
            <Dropdown overlay={sortOptions} placement="bottomLeft">
                <Button>{sortBy} ▼</Button>
            </Dropdown>
            <Dropdown overlay={viewOptions} placement="bottomRight">
                <Button>{viewMode === "card" ? <AppstoreOutlined /> : <BarsOutlined />} ▼</Button>
            </Dropdown>
            <Button type="primary" style={{ backgroundColor: "#000", color: "#fff" }} onClick={() => navigate("/create-post")}>
                Create Post
            </Button>
        </div>
    );
};

export default ForumHeader;
