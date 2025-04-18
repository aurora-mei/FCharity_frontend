import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const ForumHeader = ({ sortBy, setSortBy, viewMode, setViewMode, onSortChange }) => {
    const navigate = useNavigate();

    const handleSortChange = (option) => {
        setSortBy(option);
        onSortChange(option); // Gọi hàm callback từ component cha
    };

    const sortOptions = (
        <Menu>
            {["Best", "New", "Oldest"].map((option) => (
                <Menu.Item key={option} onClick={() => handleSortChange(option)}>
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
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            padding: "20px"
        }}>
            {/* Nhóm Sort & View gần nhau hơn */}
            <div style={{ display: "flex", gap: "10px" }}>
                <Dropdown overlay={sortOptions} placement="bottomLeft">
                    <Button>{sortBy} ▼</Button>
                </Dropdown>
                <Dropdown overlay={viewOptions} placement="bottomLeft">
                    <Button>{viewMode === "card" ? <AppstoreOutlined /> : <BarsOutlined />} ▼</Button>
                </Dropdown>
            </div>

            <Button type="primary" style={{ backgroundColor: "#000", color: "#fff" }} onClick={() => navigate("/posts/create-post")}>
                Create Post
            </Button>
        </div>
    );
};

export default ForumHeader;
