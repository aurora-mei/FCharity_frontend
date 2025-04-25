import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

// Import actions/thunks from BOTH slices
import {
    fetchMyInvitationsThunk as fetchProjectInvitesThunk,
    approveInviteThunk as approveProjectInviteThunk,
    rejectInviteThunk as rejectProjectInviteThunk,
    resetInviteStatus as resetProjectInviteStatus,
} from "../redux/inviterequestproject/inviteRequestProjectSlice"; // Project-specific imports

import {
    fetchMyOrgInvitationsThunk,
    acceptOrgInvitationThunk,
    rejectOrgInvitationThunk,
    resetOrgInviteStatus,
} from "../redux/organizationinvite/organizationInviteSlice"; // Organization-specific imports

import { Table, Button, Card, Space, message, Spin, Typography, Empty, Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;

// Default initial state shapes for useSelector fallback
const initialProjectState = { myInvitations: [], loading: false, success: null, error: null };
const initialOrgState = { myOrgInvitations: [], loading: false, success: null, error: null };

const InviteRequestScreen = () => {
    const dispatch = useDispatch();
    const [currentUser, setCurrentUser] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null); // Local state for specific row loading

    // Select state from project slice
    const {
        myInvitations: projectInvitations,
        loading: projectLoading,
        success: projectSuccess,
        error: projectError
    } = useSelector(
        (state) => state.inviteRequestProject || initialProjectState
    );

    // Select state from organization slice
    const {
        myOrgInvitations,
        loading: orgLoading,
        success: orgSuccess,
        error: orgError
    } = useSelector(
        (state) => state.organizationInvite || initialOrgState
    );

    // Combined loading state for initial fetch spinner
    const initialFetchLoading = projectLoading || orgLoading;

    // Get user and fetch both types of invitations
    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        try {
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
                if (parsedUser?.id) {
                    // Dispatch fetch actions for both slices
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

    // Effect for handling project action success/error
    useEffect(() => {
        if (projectSuccess && currentUser?.id) {
            message.success(projectSuccess.message || "Project action completed successfully!");
            setActionLoadingId(null); // Clear loading indicator
            dispatch(fetchProjectInvitesThunk(currentUser.id)); // Re-fetch project invites
            dispatch(resetProjectInviteStatus()); // Reset project slice status
        } else if (projectError) {
            message.error(projectError.message || "Project action failed!");
            setActionLoadingId(null); // Clear loading indicator
            dispatch(resetProjectInviteStatus()); // Reset project slice status
        }
    }, [projectSuccess, projectError, dispatch, currentUser]);

    // Effect for handling organization action success/error
    useEffect(() => {
        if (orgSuccess && currentUser?.id) {
            message.success(orgSuccess.message || "Organization action completed successfully!");
            setActionLoadingId(null); // Clear loading indicator
            dispatch(fetchMyOrgInvitationsThunk(currentUser.id)); // Re-fetch org invites
            dispatch(resetOrgInviteStatus()); // Reset org slice status
        } else if (orgError) {
            message.error(orgError.message || "Organization action failed!");
             setActionLoadingId(null); // Clear loading indicator
            dispatch(resetOrgInviteStatus()); // Reset org slice status
        }
    }, [orgSuccess, orgError, dispatch, currentUser]);


    const handleApprove = (id, type) => {
        setActionLoadingId(`${type}-${id}`); // Set loading for this specific item
        if (type === 'project') {
            dispatch(approveProjectInviteThunk(id)); // Dispatch project approve action
        } else if (type === 'organization') {
            dispatch(acceptOrgInvitationThunk(id)); // Dispatch organization accept action
        }
    };

    const handleReject = (id, type) => {
        setActionLoadingId(`${type}-${id}`); // Set loading for this specific item
        if (type === 'project') {
            dispatch(rejectProjectInviteThunk(id)); // Dispatch project reject action
        } else if (type === 'organization') {
            dispatch(rejectOrgInvitationThunk(id)); // Dispatch organization reject action
        }
    };

    // Combine data from both slices into a single dataSource
    const dataSource = useMemo(() => {
        const mappedProjectInvites = projectInvitations?.map((invite) => ({
            key: `project-${invite.id}`, // Unique key including type
            id: invite.id,
            type: 'project', // Add type identifier
            // --- Project Invite Mapping - ADJUST PATHS AS NEEDED ---
            name: invite.project?.projectName || "Unnamed Project",
            context: invite.project?.organizationName || "Unknown Organization",
            inviter: invite.project?.leader?.email || "Unknown Leader",
            createdAt: invite.createdAt,
        })) || [];

        const mappedOrgInvites = myOrgInvitations?.map((invite) => ({
            key: `org-${invite.id}`, // Unique key including type
            id: invite.id,
            type: 'organization', // Add type identifier
            // --- Organization Invite Mapping - ADJUST PATHS AS NEEDED ---
            name: invite.organization?.name || "Unnamed Organization",
            context: invite.organization?.creator?.email || "Organization Admin",
            inviter: invite.organization?.creator?.email || "Organization Admin", // Adjust if different field
            createdAt: invite.createdAt,
        })) || [];

        // Combine and sort (e.g., by date descending)
        return [...mappedProjectInvites, ...mappedOrgInvites]
               .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    }, [projectInvitations, myOrgInvitations]); // Recalculate only when invites change


    // Define columns for the combined table
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
            title: "Name", // Project or Org Name
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: "Context / From", // Org Name (Project) or Inviter (Org)
            dataIndex: "context",
            key: "context",
             sorter: (a, b) => (a.context || '').localeCompare(b.context || ''),
        },
        // Optional: Add distinct "Invited By" if needed
        // {
        //     title: "Invited By",
        //     dataIndex: "inviter",
        //     key: "inviter",
        // },
        {
            title: "Date Received",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => text ? new Date(text).toLocaleString() : "N/A",
            sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
            defaultSortOrder: 'descend',
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
                            // Disable all action buttons if any action is loading
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
            {/* Show spinner only during initial fetch of EITHER list */}
            {initialFetchLoading && dataSource.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                </div>
            // Show Empty state if no data after loading both lists
            ) : dataSource.length === 0 ? (
                 <Empty description="You have no pending invitations." />
            ) : (
                <Table
                    dataSource={dataSource}
                    columns={columns}
                     // Show table loading indicator only on initial fetch when data might already exist
                    loading={initialFetchLoading && dataSource.length > 0}
                    rowKey="key" // Use the generated unique key
                />
            )}
        </Card>
    );
};

export default InviteRequestScreen;