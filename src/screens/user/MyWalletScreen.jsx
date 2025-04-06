import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Table, Select, Button, Card, Row, Col, Typography, Image, Flex, Tag, DatePicker } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined, WalletOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionHistoryOfUser, getCurrentWalletThunk } from '../../redux/user/userSlice';
import moment from 'moment-timezone';
const { Title, Text } = Typography;
const { Option } = Select;

const Container = styled.div`
//   padding: 24px;
//   background-color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  .ant-card-body{
   background-color: #ffffff !important;
  }
`;
const StyledButton = styled(Button)`
    background-color:#fff;
    border-radius: 0.5rem;
    color: black;
   font-size: 1rem !important;
    font-weight: 500;
    padding:1rem;
    box-shadow:rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    &:hover{
        box-shadow: rgba(0, 0, 0, 0.3) 0px 7px 10px 0px; 
        background-color: #fff !important;
        border-color: #fff !important;
        color: black !important;
    }
`;
const StyledCard = styled(Card)`
    background-color: #ffffff !important;
    border-radius: 0.5rem;
    height:7rem;
    margin-bottom: 1rem;
     box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    transition: all 0.3s ease; /* Smooth transition for hover effect */
    &:hover {
        cursor: pointer;
        transform: translateY(-0.3rem); /* Move the card up by 10px */
        box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px; /* Enhance shadow on hover */
        background-color: #ffffff !important;
        border-color: #e5e7eb !important;
        color: #374151 !important;
    }
 
    }
`;
const MyWalletScreen = () => {

    const dispatch = useDispatch();
    const transactions = useSelector((state) => state.user.transactionHistory);
    const balance = useSelector((state) => state.user.currentBalance);
    const loading = useSelector((state) => state.user.loading);
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    const [pageSize, setPageSize] = useState(5);
    const columns = [
        {
            title: 'Transaction Date', dataIndex: 'transactionDate', key: 'transactionDate',
            render: (text) => (<Text>{moment(new Date(text)).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY hh:mm A')}</Text>),
            sorter: (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate), // Sort by date
            defaultSortOrder: 'descend',
        },
        {
            title: 'Amount', dataIndex: 'amount', key: 'amount',
            render: (text, record) => {
                if (record.transactionType === "DEPOSIT") {
                    return <Text type="success"><ArrowUpOutlined /> {text.toLocaleString()} VND</Text>
                } else {
                    return <Text type="danger"><ArrowDownOutlined /> {text.toLocaleString()} VND</Text>
                }
            }
        },
        {
            title: 'Transaction Type', dataIndex: 'transactionType', key: 'transactionType',
            render: (text) => {
                if (text === "DEPOSIT") {
                    return <Tag color="green" >{text}</Tag>
                } else {
                    return <Tag color="red">{text}</Tag>
                }
            }
        },
        {
            title: 'Target Account', dataIndex: 'objectId', key: 'objectName',
            render: (text, record) => {
                if (record.transactionType === "DEPOSIT" || record.transactionType === "WITHDRAW") {
                    return null
                } else if (record.transactionType === "DONATE_PROJECT") {
                    return <Link to={`/projects/${record.objectId}`}>
                        {record.objectName}
                    </Link>
                } else {
                    return null; // Ensure the else block is not empty
                }
            }
        },
    ];
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }
    useEffect(() => {
        dispatch(getCurrentWalletThunk()).unwrap();
        dispatch(getTransactionHistoryOfUser(currentUser.id))
    }, [dispatch, balance, currentUser.id]);

    useEffect(() => {
        setFilteredTransactions(transactions); // ban đầu gán toàn bộ
    }, [transactions]);
    const onChange = (date) => {
        if (!date) {
            // Nếu user clear DatePicker
            setFilteredTransactions(transactions);
            return;
        }

        const filtered = transactions.filter((transaction) => {
            const selectedDate = new Date(date);
            const transactionDate = new Date(transaction.transactionDate);

            return (
                selectedDate.getFullYear() === transactionDate.getFullYear() &&
                selectedDate.getMonth() === transactionDate.getMonth() &&
                selectedDate.getDate() === transactionDate.getDate()
            );
        });
        setFilteredTransactions(filtered);
    };

    return (
        <Container>
            <Card>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={6}>
                        <StyledCard>
                            {/* <Text type="success">+8.8%</Text> */}
                            <b>Balance</b>
                            <Title level={3}>{balance.toLocaleString()} VND</Title>
                        </StyledCard>
                    </Col>
                    <Col xs={24} md={6}>
                        <StyledCard >
                            <b>Total deposit <span><Text type="success">+10.2%</Text></span></b>
                            <Title level={3}>{transactions
                                .filter((x) => x.transactionType === "DEPOSIT")
                                .reduce((total, transaction) => total + transaction.amount, 0)
                                .toLocaleString()} VND</Title>
                        </StyledCard>
                    </Col>
                    <Col xs={24} md={6}>
                        <StyledCard>
                            <b>Total spending <span> <Text type="danger">-16.4%</Text></span></b>
                            <Title level={3}>{transactions
                                .filter((x) => x.transactionType !== "DEPOSIT")
                                .reduce((total, transaction) => total + transaction.amount, 0)
                                .toLocaleString()} VND</Title>
                        </StyledCard>
                    </Col>
                    <Col xs={24} md={6}>
                        <StyledCard vertical gap={10} style={{ fontSize: "1rem", textAlign: "left" }}
                            onClick={() => navigate(`/user/manage-profile/deposit/${currentUser.id}`)}
                        >
                            <WalletOutlined style={{ fontSize: "1rem", alignSelf: "center", margin: "auto 0" }} /> <b> Make Deposit/Withdraw</b>
                        </StyledCard>
                    </Col>
                </Row>

                {/* <Card title="Analysis" extra={
          <Select defaultValue="2022" style={{ width: 120 }}>
            <Option value="2022">2022</Option>
          </Select>
        } style={{ marginBottom: 24 }}>
          <Image
            src="https://storage.googleapis.com/a1aa/image/O2TKlfq-o_4O5Dio7TRBf-aNtaHDKCdjtWUn-ZSAiHg.jpg"
            width={600}
            height={300}
            alt="Analysis graph"
            preview={false}
          />
        </Card> */}

                <Card
                    title="Transition history"
                    extra={
                        <DatePicker onChange={onChange} needConfirm />
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={filteredTransactions}
                        pagination={{
                            pageSize: pageSize,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            onChange: (page, pageSize) => setPageSize(pageSize),
                            showSizeChanger: true,
                            showQuickJumper: true,
                        }}
                        style={{ backgroundColor: "#fff" }}
                    />
                </Card>
            </Card>
        </Container>
    );
};

export default MyWalletScreen;