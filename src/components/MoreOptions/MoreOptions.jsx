import React from "react";
import { Dropdown, Menu } from "antd";
import { MoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const MoreOptions = ({ onEdit, onDelete }) => {
    const menu = (
        <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit}>
                Edit
            </Menu.Item>
            <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={onDelete} style={{ color: "red" }}>
                Delete
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} placement="bottomRight">
            <MoreOutlined style={{ fontSize: 20, cursor: "pointer" }} />
        </Dropdown>
    );
};

export default MoreOptions;
