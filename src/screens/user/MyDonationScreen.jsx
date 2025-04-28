import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Line } from '@ant-design/charts';
import { Table, Select, Button, Card, Row, Col, Typography, DatePicker, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactionHistoryOfUser } from '../../redux/user/userSlice';
import moment from 'moment-timezone';
import ReactApexChart from 'react-apexcharts'; // Import ApexCharts

const { Title, Text } = Typography;

const Container = styled.div`
//   padding: 24px;
//   background-color: #f3f4f6;
  font-family: 'Inter', sans-serif;
  .ant-card-body{
   background-color: #ffffff !important;
  }`
    ;
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
    }`
    ;
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
    }`
    ;
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
 
    }`
    ;

const MyDonationScreen = () => {
    const dispatch = useDispatch();
    const transactions = useSelector((state) => state.user.transactionHistory);
    const loading = useSelector((state) => state.user.loading);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [pageSize, setPageSize] = useState(5);

    const columns = [
        {
            title: 'Transaction Time',
            dataIndex: 'transactionTime',
            key: 'transactionTime',
            render: (text) => (<Text>{moment(new Date(text)).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY hh:mm A')}</Text>),
            sorter: (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Transaction Amount',
            dataIndex: 'transactionAmount',
            key: 'transactionAmount',
            render: (text) => text ? `${text.toLocaleString()} VND` : '-',
        },
        {
            title: 'Transaction Status',
            dataIndex: 'transactionStatus',
            key: 'transactionStatus',
            render: (text) => {
                if (text === "COMPLETED") {
                    return <Tag color="green">{text}</Tag>;
                } else {
                    return <Tag color="blue">{text}</Tag>;
                }
            },
        },
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        let currentUser = {};
        try {
            currentUser = storedUser ? JSON.parse(storedUser) : {};
        } catch (error) {
            console.error("Error parsing currentUser from localStorage:", error);
        }
        dispatch(getTransactionHistoryOfUser(currentUser.id));
    }, [dispatch]);

    useEffect(() => {
        setFilteredTransactions(transactions);
    }, [transactions]);

    const onChange = (date) => {
        if (!date) {
            setFilteredTransactions(transactions);
            return;
        }
        const filtered = transactions.filter((transaction) => {
            const selectedDate = new Date(date);
            const transactionDate = new Date(transaction.transactionTime);

            return (
                selectedDate.getFullYear() === transactionDate.getFullYear() &&
                selectedDate.getMonth() === transactionDate.getMonth() &&
                selectedDate.getDate() === transactionDate.getDate()
            );
        });
        setFilteredTransactions(filtered);
    };

    const chartData = [...transactions]
        .sort((a, b) => new Date(a.transactionTime) - new Date(b.transactionTime))
        .map((transaction) => ({
            x: moment(transaction.transactionTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY hh:mm A'),
            y: transaction.transactionAmount,
        }));


    const chartOptions = {
        chart: {
            type: 'line',
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: true,
            },
        },
        xaxis: {
            type: 'category',
            categories: chartData.map((data) => data.x),
        },
        yaxis: {
            labels: {
                formatter: (value) => `${value.toLocaleString()} VND`,
            },
        },
        title: {
            text: 'Transaction Amount Over Time',
            align: 'center',
        },
    };

    return (
        <Container>
            <Card>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={12}>
                        <StyledCard>
                            <b>Total donations</b>
                            <Title level={3}>
                                {transactions.reduce((total, transaction) => total + transaction.transactionAmount, 0).toLocaleString()} VND
                            </Title>
                        </StyledCard>
                    </Col>
                </Row>

                <Card title="Transaction History Over Time">
                    <ReactApexChart
                        options={chartOptions}
                        series={[{ name: 'Transaction Amount', data: chartData.map((data) => data.y) }]}
                        type="line"
                        height={350}
                    />
                </Card>

                <Card title="Transaction History" extra={<DatePicker onChange={onChange} />}>
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
                    />
                </Card>
            </Card>
        </Container>
    );
};

export default MyDonationScreen;
