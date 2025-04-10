import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchMyInvitationsThunk,
    approveInviteThunk,
    rejectInviteThunk,
    resetInviteStatus,
} from "../../redux/inviterequestproject/inviteRequestProjectSlice";
import { Table, Button, Card, Space, message, Spin, Typography, Empty } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;

const InviteRequestScreen = () => {
    const dispatch = useDispatch();

    const [currentUser, setCurrentUser] = useState(null);

    const { myInvitations, loading, success, error } = useSelector(
        (state) => state.inviteRequestProject || {}
    );

    // Lấy user từ localStorage sau khi component mounted
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        try {
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
                if (parsedUser?.id) {
                    dispatch(fetchMyInvitationsThunk(parsedUser.id));
                }
            }
        } catch (err) {
            console.error("Error parsing currentUser:", err);
        }
    }, [dispatch]);

    // Khi approve hoặc reject thành công
    useEffect(() => {
        if (success && currentUser?.id) {
            message.success("Action completed successfully!");
            dispatch(fetchMyInvitationsThunk(currentUser.id));
            dispatch(resetInviteStatus());
        } else if (error) {
            message.error(error.message || "Something went wrong!");
            dispatch(resetInviteStatus());
        }
    }, [success, error, dispatch, currentUser]);

    const handleApprove = (id) => {
        dispatch(approveInviteThunk(id));
    };

    const handleReject = (id) => {
        dispatch(rejectInviteThunk(id));
    };

    const columns = [
        {
            title: "Project Name",
            dataIndex: "projectName",
            key: "projectName",
        },
        {
            title: "Organization Name",
            dataIndex: "organizationName",
            key: "organizationName",
        },
        {
            title: "Invited By",
            dataIndex: "inviterName",
            key: "inviterName",
        },
        {
            title: "Date",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleApprove(record.id)}
                        loading={loading}
                    >
                        Approve
                    </Button>
                    <Button
                        type="default"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleReject(record.id)}
                        loading={loading}
                    >
                        Reject
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card style={{ margin: 24 }}>
            <Title level={3}>Project Invitations</Title>
            {loading && myInvitations.length === 0 ? (
                <Spin size="large" />
            ) : myInvitations.length === 0 ? (
                <Empty description="No invitations yet" />
            ) : (
                <Table
                    dataSource={myInvitations?.map((invite) => ({
                        key: invite.id,
                        id: invite.id,
                        projectName: invite.project?.projectName || "Unnamed",
                        organizationName: invite.project?.organizationName || "Unknown",
                        inviterName: invite.project?.leader?.email || "Unknown",
                        createdAt: invite.createdAt,
                        status: invite.status,
                    }))}
                    columns={columns}
                />
            )}
        </Card>
    );
};

export default InviteRequestScreen;
