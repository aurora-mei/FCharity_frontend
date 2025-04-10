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
const DepositButton = styled(Button)`
    background-color: #8BD766 !important;
    padding:1.4rem 0.7rem;
    font-size: 1rem;
    align-self: center;
    &:hover{
        box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px; 
        background-color: #8BD766 !important;
        border-color: #8BD766 !important;
        color: black !important;
    }
`;
const StyledCard = styled(Card)`
    background-color: #ffffff !important;
    border-radius: 0.5rem;
    height:7rem;
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
const MyDonationScreen = () => {

    const dispatch = useDispatch();
    const transactions = useSelector((state) => state.user.transactionHistory);
    const balance = useSelector((state) => state.user.currentBalance);
    const loading = useSelector((state) => state.user.loading);
    const [totalDepositToday, setTotalDepositToday] = useState(0);
    const [totalDepositYesterday, setTotalDepositYesterday] = useState(0);
    const [totalSpendingToday, setTotalSpendingToday] = useState(0);
    const [totalSpendingYesterday, setTotalSpendingYesterday] = useState(0);
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
        setFilteredTransactions(transactions); 
    }, [transactions]);

    useEffect(() => {
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');

        // Tính tổng deposit hôm nay
        const totalDToday = transactions
            .filter((transaction) =>
                transaction.transactionType === "DEPOSIT" &&
                moment(transaction.transactionDate).isSame(today, 'day')
            )
            .reduce((total, transaction) => total + transaction.amount, 0);

        // Tính tổng deposit hôm qua
        const totalDYesterday = transactions
            .filter((transaction) =>
                transaction.transactionType === "DEPOSIT" &&
                moment(transaction.transactionDate).isSame(yesterday, 'day')
            )
            .reduce((total, transaction) => total + transaction.amount, 0);

        // Tính tổng spending hôm nay
        const totalSToday = transactions
            .filter((transaction) =>
                transaction.transactionType !== "DEPOSIT" &&
                moment(transaction.transactionDate).isSame(today, 'day')
            )
            .reduce((total, transaction) => total + transaction.amount, 0);
        // Tính tổng spending hôm qua
        const totalSYesterday = transactions
            .filter((transaction) =>
                transaction.transactionType !== "DEPOSIT" &&
                moment(transaction.transactionDate).isSame(yesterday, 'day')
            )
            .reduce((total, transaction) => total + transaction.amount, 0);

        setTotalSpendingToday(totalSToday);
        setTotalSpendingYesterday(totalSYesterday);
        setTotalDepositToday(totalDToday);
        setTotalDepositYesterday(totalDYesterday);
        console.log("Total deposit today:", totalSToday);
        console.log("Total deposit yesterday:", totalSYesterday);
    }, [transactions]);

    const depositChange = totalDepositYesterday > 0
        ? ((totalDepositToday - totalDepositYesterday) / totalDepositYesterday) * 100
        : 0;
    const spendingChange = totalSpendingYesterday > 0
        ? ((totalSpendingToday - totalSpendingYesterday) / totalSpendingYesterday) * 100
        : 0;
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
                    <Col xs={24} md={12}>
                        <StyledCard >
                            <b>Total donations <span>
                                <Text type={depositChange >= 0 ? "success" : "danger"}>
                                    {depositChange >= 0 ? "+" : ""}{depositChange.toFixed(2)}%
                                </Text></span>
                                </b>
                            <Title level={3}>{transactions
                                .filter((x) => x.transactionType === "DEPOSIT")
                                .reduce((total, transaction) => total + transaction.amount, 0)
                                .toLocaleString()} VND</Title>
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

export default MyDonationScreen;