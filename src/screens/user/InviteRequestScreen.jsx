import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchMyInvitationsThunk as fetchProjectInvitesThunk,
    approveInviteThunk as approveProjectInviteThunk,
    rejectInviteThunk as rejectProjectInviteThunk,
    resetInviteStatus as resetProjectInviteStatus,
} from "../../redux/inviterequestproject/inviteRequestProjectSlice";

import {
    fetchMyOrgInvitationsThunk,
    acceptOrgInvitationThunk,
    rejectOrgInvitationThunk,
    resetOrgInviteStatus,
} from "../../redux/inviterequestorganization/inviteRequestOrganizationSlice";

import { Table, Button, Card, Space, message, Spin, Typography, Empty, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;

const initialProjectState = { myInvitations: [], loading: false, success: null, error: null };
const initialOrgState = { myOrgInvitations: [], loading: false, success: null, error: null };

const InviteRequestScreen = () => {
    const dispatch = useDispatch();
    const [currentUser, setCurrentUser] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const {
        myInvitations: projectInvitations,
        loading: projectLoading,
        success: projectSuccess,
        error: projectError
    } = useSelector(
        (state) => state.inviteRequestProject || initialProjectState
    );

    const {
        myOrgInvitations,
        loading: orgLoading,
        success: orgSuccess,
        error: orgError
    } = useSelector(
        (state) => state.inviteRequestOrganization || initialOrgState
    );

    const initialFetchLoading = projectLoading || orgLoading;

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        try {
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
                if (parsedUser?.id) {
                    dispatch(fetchProjectInvitesThunk(parsedUser.id));
                    dispatch(fetchMyOrgInvitationsThunk(parsedUser.id));
                }
            } else {
                console.warn("No current user found in localStorage.");
            }
        } catch (err) {
            console.error("Error parsing currentUser:", err);
            message.error("Failed to load user data.");
        }
    }, [dispatch]);

    useEffect(() => {
        if (projectSuccess && currentUser?.id) {
            message.success(projectSuccess.message || "Project action completed successfully!");
            setActionLoadingId(null);
            dispatch(fetchProjectInvitesThunk(currentUser.id));
            dispatch(resetProjectInviteStatus());
        } else if (projectError) {
            message.error(projectError.message || "Project action failed!");
            setActionLoadingId(null);
            dispatch(resetProjectInviteStatus());
        }
    }, [projectSuccess, projectError, dispatch, currentUser]);

    useEffect(() => {
        if (orgSuccess && currentUser?.id) {
            message.success(orgSuccess.message || "Organization action completed successfully!");
            setActionLoadingId(null);
            dispatch(fetchMyOrgInvitationsThunk(currentUser.id));
            dispatch(resetOrgInviteStatus());
        } else if (orgError) {
            message.error(orgError.message || "Organization action failed!");
            setActionLoadingId(null);
            dispatch(resetOrgInviteStatus());
        }
    }, [orgSuccess, orgError, dispatch, currentUser]);


    const handleApprove = (id, type) => {
        setActionLoadingId(`${type}-${id}`);
        if (type === 'project') {
            dispatch(approveProjectInviteThunk(id));
        } else if (type === 'organization') {
            dispatch(acceptOrgInvitationThunk(id));
        }
    };

    const handleReject = (id, type) => {
        setActionLoadingId(`${type}-${id}`);
        if (type === 'project') {
            dispatch(rejectProjectInviteThunk(id));
        } else if (type === 'organization') {
            dispatch(rejectOrgInvitationThunk(id));
        }
    };

    const dataSource = useMemo(() => {
        const mappedProjectInvites = projectInvitations?.map((invite) => ({
            key: `project-${invite.id || invite.projectInvitationId}`, // Use a consistent ID field if names differ
            id: invite.id || invite.projectInvitationId,
            type: 'project',
            name: invite.project?.projectName || "Unnamed Project",
            context: invite.project?.organizationName || "Unknown Organization",
            inviter: invite.project?.leader?.email || "Unknown Leader",
            createdAt: invite.createdAt,
        })) || [];

        const mappedOrgInvites = myOrgInvitations?.map((invite) => ({
            key: `org-${invite.id || invite.organizationRequestId}`, // Use a consistent ID field
            id: invite.id || invite.organizationRequestId,
            type: 'organization',
            name: invite.organization?.name || invite.organization?.organizationName || "Unnamed Organization",
            context: invite.organization?.creator?.email || "Organization Admin",
            inviter: invite.organization?.creator?.email || "Organization Admin",
            createdAt: invite.createdAt,
        })) || [];

        // Add console log here to see the final combined data before sorting
        // console.log("Combined Data for Table:", [...mappedProjectInvites, ...mappedOrgInvites]);

        return [...mappedProjectInvites, ...mappedOrgInvites]
               .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    }, [projectInvitations, myOrgInvitations]);


    const columns = [
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (type) => (
                <Tag color={type === 'project' ? 'blue' : 'green'}>
                    {type === 'project' ? 'Project' : 'Organization'}
                </Tag>
            ),
             filters: [
                { text: 'Project', value: 'project' },
                { text: 'Organization', value: 'organization' },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: "Context / From",
            dataIndex: "context",
            key: "context",
             sorter: (a, b) => (a.context || '').localeCompare(b.context || ''),
        },
        {
            title: "Actions",
            key: "actions",
            width: 200,
            render: (_, record) => {
                 const isLoading = actionLoadingId === record.key;
                 return (
                    <Space>
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            onClick={() => handleApprove(record.id, record.type)}
                            loading={isLoading}
                            disabled={!!actionLoadingId}
                        >
                            Approve
                        </Button>
                        <Button
                            type="default"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleReject(record.id, record.type)}
                            loading={isLoading}
                            disabled={!!actionLoadingId}
                        >
                            Reject
                        </Button>
                    </Space>
                 );
            }
        },
    ];

    return (
        <Card style={{ margin: 24 }}>
            <Title level={3}>My Invitations</Title>
            {initialFetchLoading && dataSource.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                </div>
            ) : dataSource.length === 0 ? (
                 <Empty description="You have no pending invitations." />
            ) : (
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    loading={initialFetchLoading && dataSource.length > 0}
                    rowKey="key"
                />
            )}
        </Card>
    );
};

export default InviteRequestScreen;