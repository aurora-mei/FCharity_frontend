import React, { useEffect } from 'react';
import { Table, Typography, Space, Button, Select, Flex,Input,Tag ,Modal } from 'antd';
import { TeamOutlined,EditOutlined  } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProjectMembersThunk, moveOutProjectMemberThunk,inviteProjectMemberThunk,fetchUserNotInProjectThunk } from '../../redux/project/projectSlice';
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
const ProjectMemberList = ({isLeader, projectId }) => {
    const dispatch = useDispatch();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const {userNotInProject, allProjectMembers} =useSelector((state) => state.project);
    const [userToInvite, setUserToInvite] = useState(userNotInProject);
    const [dataSource, setDataSource] = useState([]);
    const [filerOption, setFilterOption] = useState("all");
    
    useEffect(() => {
        if (allProjectMembers && allProjectMembers.length > 0) {
            switch (filerOption) {
                case "all":
                    setDataSource(allProjectMembers);
                    break;
                case "active":
                    setDataSource(allProjectMembers.filter(member => member.leaveDate === null));
                    break;
                case "leaved":
                    setDataSource(allProjectMembers.filter(member => member.leaveDate !== null));
                    break;
                default:
                    setDataSource(allProjectMembers);
            }
        }
    }, [dataSource, filerOption]);

    const handleMoveOutMember = (memberId) => {
        dispatch(moveOutProjectMemberThunk(memberId));
    };
    const handleInviteMember = (userId) => {
        dispatch(inviteProjectMemberThunk(
              { projectId: projectId,
                userId: userId,
              }
        ));
        setIsInviteModalOpen(false);
        // dispatch(fetchUserNotInProjectThunk(projectId));
    };
    const onSearch = (value) => {
        if (value && value.length > 0) {
            setDataSource(allProjectMembers.filter(member => member.user.fullName.toLowerCase().includes(value.toLowerCase())));
        } else {
            setDataSource(allProjectMembers);
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
            title: 'Email',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Text>{user.email}</Text>
            ),
        },
        {
            title: 'Join Date',
            dataIndex: 'joinDate',
            key: 'joinDate',
            render: (joinDate) => (
                <Text>{new Date(joinDate).toLocaleDateString()}</Text>
            ),
            sorter: (a, b) => new Date(a.joinDate) - new Date(b.joinDate),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Leave Date',
            dataIndex: 'leaveDate',
            key: 'leaveDate',
            render: (leaveDate) => (
                <Text>{leaveDate ? new Date(leaveDate).toLocaleDateString() : '-'}</Text>
            ),
            sorter: (a, b) => new Date(a.leaveDate) - new Date(b.leaveDate),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Role',
            dataIndex: 'memberRole',
            key: 'memberRole',
            render: (memberRole) => {
                let roleTag;
                if (memberRole === "LEADER") {
                    roleTag = <Tag color="green"><b>{memberRole}</b></Tag>;
                } else if (memberRole === "MEMBER") {
                    roleTag = <Tag color="blue">{memberRole}</Tag>;
                } else {
                    roleTag = <Tag color="red">{memberRole}</Tag>;
                }
                return roleTag;
            },
        },
        isLeader &&  {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} title="Move out" type="text" onClick={() => (handleMoveOutMember(record.id))}></Button>
                </Space>
            ),
        },
    ];
    const onSearchUserToInvite = (value) => {
        if (value && value.length > 0) {
            setUserToInvite(userNotInProject.filter(user => user.fullName.toLowerCase().includes(value.toLowerCase() || user.email.toLowerCase().includes(value.toLowerCase()))));
        } else {
            setUserToInvite(userNotInProject);
        }
    }
    return (
        <>
            <Flex vertical style={{ marginTop: 24 }}>
                <Title level={5} styled={{ margin: "0 !important" }}>Members List</Title>
                <Flex justify='space-between'>
                    <Space>
                        <StyledSearch><Search onSearch={onSearch} /></StyledSearch>
                        <StyledSelect defaultValue="all" style={{ width: 120, borderColor: "green" }} onChange={(value) => setFilterOption(value)}>
                            <StyledSelect.Option value="all" >All</StyledSelect.Option>
                            <StyledSelect.Option value="active">Active</StyledSelect.Option>
                            <StyledSelect.Option value="leaved">Leaved</StyledSelect.Option>
                        </StyledSelect>
                    </Space>
                   { isLeader &&  <StyledButtonInvite icon={<TeamOutlined />} bordered={false}  
                    onClick={()=> {
                        setIsInviteModalOpen(true);
                        dispatch(fetchUserNotInProjectThunk(projectId));
                    }} 
                    >Invite</StyledButtonInvite>}
                </Flex>
            </Flex>
            <Table columns={columns.filter(Boolean)} dataSource={dataSource} pagination={false} />
                <Modal
                    title="Invite Member"
                    visible={isInviteModalOpen}
                    onCancel={() => setIsInviteModalOpen(false)}
                    footer={null}
                >
                    <StyledSelect
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Select members to invite"
                        onSearch={onSearchUserToInvite}
                        onChange={handleInviteMember}
                    >
                        {userToInvite.map(user => (
                            <StyledSelect.Option key={user.id} value={user.id}>
                                {user.fullName}
                            </StyledSelect.Option>
                        ))}
                    </StyledSelect>
                </Modal>
        </>
    );
}
export default ProjectMemberList;