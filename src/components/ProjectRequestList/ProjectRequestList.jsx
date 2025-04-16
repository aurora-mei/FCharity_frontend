import React, { useEffect, useState } from 'react';
import { Table, Typography, Space, Button, Dropdown, Select, Flex, Input, Tag } from 'antd';
import { TeamOutlined, MoreOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { approveJoinRequestThunk,rejectJoinRequestThunk ,
     approveLeaveRequestThunk, cancelProjectRequestThunk, fetchProjectRequests, rejectLeaveRequestThunk } from '../../redux/project/projectSlice';
import styled from 'styled-components';
const { Title, Text } = Typography;
const { Search } = Input;
const StyledSearch = styled.div`
    .ant-input{
     height: 1rem !important;
     padding:1rem !important;
    }
    .ant-input-group-addon{
    .ant-btn{
    background-color: #f0f0f0 !important;
        border: 1px solid green !important;
        padding: 1rem !important;
        .anticon svg{
            color: green !important;
            }
    }
 
    }
`;
const StyledButtonInvite = styled(Button)`
    background-color: #fff !important;
    border: 1px solid green !important;
    padding: 1rem !important;
      transition: all 0.3s ease;
    .anticon svg{
        color: green !important;
        }
    &:hover{
        background-color: #fff !important;
        border: 1px solid green !important;
        padding: 1rem !important;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        .anticon svg{
            color: green !important;
            }
        }
}
    .ant-btn{
        span{
            color: green !important;
            font-size: 1rem !important;
            }
        }    
  

}`

const StyledSelect = styled(Select)`
    .ant-select-selector{
        border: 1px solid green !important;
        border-radius: 4px !important;
        padding: 0.5rem !important;
        background-color: #fff !important;
        .ant-select-selection-item{
            color: green !important;
        }
    }
    .ant-select-arrow{
        color: green !important;
    }
    .ant-select-item-option{
        color: green !important;
        &:hover{
            background-color: #fff !important;
            color: green !important;
        }
    }
    .ant-select-item-option-selected{
        background-color: #fff !important;
        color: green !important;
        &:hover{
            background-color: #fff !important;
            color: green !important;
        }
    }
    .ant-select-item-option-active{
        background-color: #fff !important;
        color: green !important;
        &:hover{
            background-color: #fff !important;
            color: green !important;
        }
    }
}`;
const ProjectRequestList = ({ isLeader, projectId }) => {
    const dispatch = useDispatch();
    const { projectRequests, loading } = useSelector((state) => state.project);
    const [dataSource, setDataSource] = useState([]);
    const [filerOption, setFilterOption] = useState("all");
    useEffect(() => {
        // dispatch(fetchProjectRequests(projectId));
    }, [projectId, dispatch]);
    useEffect(() => {
        if (projectRequests && projectRequests.length > 0) {
            switch (filerOption) {
                case "all":
                    setDataSource(projectRequests);
                    break;
                case "pending":
                    setDataSource(projectRequests.filter(member => member.status === "PENDING"));
                    break;
                case "approved":
                    setDataSource(projectRequests.filter(member => member.status === "APPROVED"));
                    break;
                case "rejected":
                    setDataSource(projectRequests.filter(member => member.status === "REJECTED"));
                    break;
                case "cancelled":
                    setDataSource(projectRequests.filter(member => member.status === "CANCELLED"));
                    break;
                default:
                    setDataSource(projectRequests);
            }
        }
    }, [ dataSource,filerOption]);
    const handleApproveJoinRequest = (requestId) => {
        dispatch(approveJoinRequestThunk(requestId));
    };

    const handleRejectJoinRequest = (requestId) => {
        dispatch(rejectJoinRequestThunk(requestId));
    };
    const handleApproveLeaveRequest = (requestId) => {
        dispatch(approveLeaveRequestThunk(requestId));
    };

    const handleRejectLeaveRequest = (requestId) => {
        dispatch(rejectLeaveRequestThunk(requestId));
    };
    const handleCancelInvitation = (requestId) => {
        dispatch(cancelProjectRequestThunk(requestId));
    };
    const onSearch = (value) => {
        if (value && value.length > 0) {
            setDataSource(projectRequests.filter(req => req.user.fullName.toLowerCase().includes(value.toLowerCase())));
        } else {
            setDataSource(projectRequests);
        }
    }
    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <img src={user.avatar ?? "https://img.pikbest.com/illustration/20240824/a-tree-house-on-a-big-in-forest-wallpaper_10754695.jpg!w700wp"} alt="avatar" style={{ width: 50, height: 50, borderRadius: '50%' }} />
            ),
        },
        {
            title: 'Full Name',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Text>{user.fullName}</Text>
            ),
        },
        {
            title: 'Request Type',
            dataIndex: 'requestType',
            key: 'requestType',
            render: (requestType) => {
                let requestTypeTag;
                if (requestType === "INVITATION") {
                    requestTypeTag = <Tag color="blue"><b>{requestType}</b></Tag>;
                } else if (requestType === "JOIN_REQUEST") {
                    requestTypeTag = <Tag color="green">{requestType}</Tag>;
                } else {
                    requestTypeTag = <Tag color="orange">{requestType}</Tag>;
                }
                return requestTypeTag;
            },
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => (
                <Text>{new Date(createdAt).toLocaleDateString()}</Text>
            ),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (updatedAt) => (
                <Text>{updatedAt ? new Date(updatedAt).toLocaleDateString() : '-'}</Text>
            ),
            sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let statusTag;
                if (status === "PENDING") {
                    statusTag = <Tag color="red"><b>{status}</b></Tag>;
                } else if (status === "APPROVED") {
                    statusTag = <Tag color="green">{status}</Tag>;
                } else {
                    statusTag = <Tag color="orange">{status}</Tag>;
                }
                return statusTag;
            },
        },
        isLeader && {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                let menuItems = [];
                if (record.requestType === "INVITATION" && record.status === "PENDING") {
                    menuItems = ["CANCELLED"].map((status) => ({
                        key: status,
                        label: <span style={{ color: 'gray' }}>{status}</span>,
                        onClick: () => {
                            if (status === "CANCELLED") {
                                handleCancelInvitation(record.id);
                            }
                        },
                    }));
                } else {
                    if (record.status === "PENDING") {
                        menuItems = ["APPROVED", "REJECTED"].map((status) => ({
                            key: status,
                            label: (
                                <span style={{ color: status === "APPROVED" ? 'green' : 'red' }}>
                                    {status}
                                </span>
                            ),
                            onClick: () => {
                                if (status === "APPROVED" && record.requestType === "JOIN_REQUEST") {
                                    handleApproveJoinRequest(record.id);
                                } else if (status === "REJECTED" && record.requestType === "JOIN_REQUEST") {
                                    handleRejectJoinRequest(record.id);
                                } else if (status === "APPROVED" && record.requestType === "LEAVE_REQUEST") {
                                    handleApproveLeaveRequest(record.id);
                                } else if (status === "REJECTED" && record.requestType === "LEAVE_REQUEST") {
                                    handleRejectLeaveRequest(record.id);
                                }
                            },
                        }));
                    }
                }

                menuItems.push({
                    key: 'divider',
                    type: 'divider',
                });

                return (
                    <Dropdown menu={{ items: menuItems }} placement="bottomLeft" >
                        <Button type="default" shape="circle" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },

        },
    ];
    return (
        <>
            <Flex vertical style={{ marginTop: 0 }}>
                <Title level={5} styled={{ margin: "0 !important" }}>Requests List</Title>
                <Space>
                    <StyledSearch><Search onSearch={onSearch} /></StyledSearch>
                    <StyledSelect defaultValue="all" style={{ width: 120, borderColor: "green" }} onChange={(value) => setFilterOption(value)}>
                        <StyledSelect.Option value="all" >All</StyledSelect.Option>
                        <StyledSelect.Option value="pending">Pending</StyledSelect.Option>
                        <StyledSelect.Option value="approved">Approved</StyledSelect.Option>
                        <StyledSelect.Option value="rejected">Rejected</StyledSelect.Option>
                    </StyledSelect>
                </Space>
            </Flex>
            <Table columns={columns.filter(Boolean)} dataSource={dataSource} pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
                }} />
        </>
    );
}
export default ProjectRequestList;