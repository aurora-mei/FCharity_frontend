import React, { useEffect } from 'react';
import { Table, Typography, Space, Button, Select, Flex, Input, Tag, Modal, Dropdown } from 'antd';
import { TeamOutlined, MoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProjectMembersThunk, moveOutProjectMemberThunk, inviteProjectMemberThunk, fetchUserNotInProjectThunk } from '../../redux/project/projectSlice';
import { useState } from 'react';
import styled from 'styled-components';
import LoadingModal from '../../components/LoadingModal';

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
      
    }
 
    }`
    ;
const StyledButtonInvite = styled(Button)`
    background-color: #fff !important;
    border: 1px solid green !important;
    padding: 1rem !important;
      transition: all 0.3s ease;
   
    &:hover{
        background-color: #fff !important;
        border: 1px solid green !important;
        padding: 1rem !important;
         box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
       
        }
}
    .ant-btn{
        span{
            font-size: 1rem !important;
            }
        }    
  
}`;


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
const ProjectMemberList = ({ isLeader, projectId }) => {
    const dispatch = useDispatch();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const { userNotInProject, allProjectMembers, currentProject } = useSelector((state) => state.project);
    const [userToInvite, setUserToInvite] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [filterOption, setFilterOption] = useState("all");

    useEffect(() => {
        if (allProjectMembers && allProjectMembers.length > 0) {
            let filtered;
            switch (filterOption) {
                case "active":
                    filtered = allProjectMembers.filter(m => m.leaveDate === null);
                    break;
                case "leaved":
                    filtered = allProjectMembers.filter(m => m.leaveDate !== null);
                    break;
                default:
                    filtered = allProjectMembers;
            }
            setDataSource(filtered);
        }
    }, [allProjectMembers, filterOption]);

    useEffect(() => {
        setUserToInvite(userNotInProject);
    }, [userNotInProject]);

    const handleMoveOutMember = (memberId) => {
        dispatch(moveOutProjectMemberThunk(memberId));
    };

    const handleInviteMember = (userIds) => {
        userIds.forEach(userId => {
            dispatch(inviteProjectMemberThunk({ projectId, userId }));
        });
        setIsInviteModalOpen(false);
    };

    const onSearch = (value) => {
        if (value?.length > 0) {
            setDataSource(allProjectMembers.filter(member =>
                member.user.fullName.toLowerCase().includes(value.toLowerCase())
            ));
        } else {
            setDataSource(allProjectMembers);
        }
    };

    const onSearchUserToInvite = (value) => {
        if (value?.length > 0) {
            setUserToInvite(userNotInProject.filter(user =>
                user.fullName.toLowerCase().includes(value.toLowerCase()) ||
                user.email.toLowerCase().includes(value.toLowerCase())
            ));
        } else {
            setUserToInvite(userNotInProject);
        }
    };

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
            key: 'fullName',
            render: (user) => <Text>{user.fullName}</Text>,
        },
        {
            title: 'Email',
            dataIndex: 'user',
            key: 'email',
            render: (user) => <Text>{user.email}</Text>,
        },
        {
            title: 'Join Date',
            dataIndex: 'joinDate',
            key: 'joinDate',
            render: (joinDate) => <Text>{new Date(joinDate).toLocaleDateString()}</Text>,
            sorter: (a, b) => new Date(a.joinDate) - new Date(b.joinDate),
        },
        {
            title: 'Leave Date',
            dataIndex: 'leaveDate',
            key: 'leaveDate',
            render: (leaveDate) => <Text>{leaveDate ? new Date(leaveDate).toLocaleDateString() : '-'}</Text>,
            sorter: (a, b) => new Date(a.leaveDate || 0) - new Date(b.leaveDate || 0),
        },
        {
            title: 'Role',
            dataIndex: 'memberRole',
            key: 'memberRole',
            render: (memberRole) => {
                let color = memberRole === "LEADER" ? "green" : memberRole === "MEMBER" ? "blue" : "red";
                return <Tag color={color}><b>{memberRole}</b></Tag>;
            },
        },
    ];

    if (isLeader) {
        columns.push({
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                if (record.user.id === currentProject.project.leader.id) {
                    return null;
                } else {
                    const menuItems = [
                        {
                            key: 'moveOut',
                            label: 'Move Out',
                            icon: <TeamOutlined />,
                            onClick: () => handleMoveOutMember(record.id),
                        },
                    ];
                    return (
                        <Dropdown menu={{ items: menuItems }} placement="bottomLeft">
                            <Button type="default" shape="circle" icon={<MoreOutlined />} />
                        </Dropdown>
                    );
                }
            },
        });
    }

    return (
        <div style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 8px 0px", borderRadius:"1rem",
            padding:"2rem",
              background: "#fff"}}>
            <Flex vertical >
                <Title level={5}>Members List</Title>
                <Flex justify='space-between'>
                    <Space>
                        <StyledSearch><Search onSearch={onSearch} /></StyledSearch>
                        <StyledSelect value={filterOption} style={{ width: 120 }} onChange={(value) => setFilterOption(value)}>
                            <Select.Option value="all">All</Select.Option>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="leaved">Leaved</Select.Option>
                        </StyledSelect>
                    </Space>
                    {isLeader &&
                        <StyledButtonInvite icon={<TeamOutlined />} onClick={() => {
                            setIsInviteModalOpen(true);
                            dispatch(fetchUserNotInProjectThunk(projectId));
                        }}>
                            Invite
                        </StyledButtonInvite>}
                </Flex>
            </Flex>

            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={(record) => record.user.id}
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} members`,
                }}
            />

            <Modal
                title="Invite Member"
                open={isInviteModalOpen}
                onCancel={() => setIsInviteModalOpen(false)}
                footer={null}
            >
                <StyledSelect
                    mode="multiple"
                    allowClear
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Select members to invite"
                    onSearch={onSearchUserToInvite}
                    onChange={handleInviteMember}
                >
                    {userToInvite.map(user => (
                        <Select.Option key={user.id} value={user.id}>
                            {user.fullName}
                        </Select.Option>
                    ))}
                </StyledSelect>
            </Modal>
        </div>
    );
};

export default ProjectMemberList;
