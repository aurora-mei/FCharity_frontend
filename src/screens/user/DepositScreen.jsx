import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentLinkThunk } from "../../redux/helper/helperSlice";
import { getCurrentWalletThunk, getTransactionHistoryOfUser } from "../../redux/user/userSlice";
import LoadingModal from "../../components/LoadingModal";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, Col, Row, Typography, Table, Card, Image, Tabs, Skeleton, message, Flex, Tag, DatePicker } from "antd";
import styled from "styled-components";
import moment from "moment-timezone";
import { Link } from "react-router-dom";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;

const StyledButton = styled(Button)`
    background-color:#fff;
    border-radius: 0.5rem;
    color: black;
   font-size: 1rem !important;
    font-weight: 500;
    padding:1rem;
    // box-shadow:rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    &:hover{
        box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 8px 0px;
        background-color: #fff !important;
        border-color: #fff !important;
        color: black !important;
    }
`;

const StyledCard = styled(Card)`
    background-color: #ffffff !important;
    border-radius: 0.5rem;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    .ant-card-body {
        background-color: #ffffff !important;
    }
`;

const DepositScreen = () => {
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

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId } = useParams();

    const [form] = Form.useForm();
    const [amount, setAmount] = useState(2000);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const checkoutURL = useSelector((state) => state.helper.checkoutURL);
    const loading = useSelector((state) => state.helper.loading);
    const transactions = useSelector((state) => state.user.transactionHistory);
    const balance = useSelector((state) => state.user.currentBalance);
    const storedUser = localStorage.getItem("currentUser");
    let currentUser = {};

    try {
        currentUser = storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
    }
    const onFinishDeposit = async () => {
        dispatch(
            getPaymentLinkThunk({
                itemContent: `${currentUser.email}'s deposit`,
                amount: amount,
                userId: currentUser.id,
            })
        );
    };
    useEffect(() => {
        if (checkoutURL) {
            window.location.href = checkoutURL;
        }
        dispatch(getCurrentWalletThunk());
        dispatch(getTransactionHistoryOfUser(currentUser.id))
    }, [dispatch, checkoutURL, balance]);
    useEffect(() => {
        setFilteredTransactions(transactions); // ban đầu gán toàn bộ
    }, [transactions]);
    if (loading) return <LoadingModal />;
    const depositComponent = () => {
        return (
            <div style={{ justifySelf: "center", borderRadius: 10, boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 8px 0px", padding: "1rem", backgroundColor: "#fff", width: "fit-content" }}>
                <Title level={5}>Deposit</Title>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ amount }}
                    onFinish={onFinishDeposit}
                >
                    <Form.Item
                        label="Amount"
                        name="amount"
                        rules={[{ required: true, message: "Please input amount" }]}
                    >
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            min={2000}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </Form.Item>

                    <Form.Item>
                        <StyledButton type="primary" htmlType="submit">
                            Generate Payment Link
                        </StyledButton>
                    </Form.Item>
                </Form>
            </div>
        );
    };
    const withdrawComponent = () => {
        return (
            <div style={{ justifySelf: "center", borderRadius: 10, boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 8px 0px", padding: "1rem", backgroundColor: "#fff", width: "fit-content" }}>
                <Title level={5}>Deposit</Title>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ amount }}
                    onFinish={onFinishDeposit}
                >
                    <Form.Item
                        label="Amount"
                        name="amount"
                        rules={[{ required: true, message: "Please input amount" }]}
                    >
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            min={2000}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                    </Form.Item>

                    <Form.Item>
                        <StyledButton type="primary" htmlType="submit">
                            Generate Payment Link
                        </StyledButton>
                    </Form.Item>
                </Form>
            </div>
        );
    };
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
        <Flex vertical gap={10} style={{ padding: "0 1rem", borderRadius: 10, minHeight: "100vh" }}>
            <StyledCard
                style={{ marginBottom: 16 }}
                title={<Title level={5}><b>Balance: </b>{balance.toLocaleString()} VND</Title>}
                bodyStyle={{ display: 'none' }}
                extra={<StyledButton onClick={() => navigate("/user/manage-profile/mywallet")}>Back to Wallet</StyledButton>}
            >
            </StyledCard>
            <Tabs
                defaultActiveKey="1"
                centered
                size="middle"
                style={{ paddingTop: "0 !important" }}
                items={[
                    {
                        label: "Make deposit",
                        key: "1",
                        children: depositComponent(),
                    },
                    {
                        label: "Make withdraw",
                        key: "2",
                        children: withdrawComponent(),
                    }
                ]}
            />
            <StyledCard
                style={{
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 8px 0px",
                    padding: "1rem",
                }}
                title="Transaction History"
                extra={
                    <DatePicker onChange={onChange} needConfirm />
                }
            >
                <Table columns={columns} dataSource={transactions}
                    pagination={{
                        pageSize: pageSize, // Number of rows per page
                        pageSizeOptions: ['5', '10', '20', '50'],
                        onChange: (page, pageSize) => {
                            setPageSize(pageSize);
                        },
                        showSizeChanger: true, // Allow the user to change the page size
                        showQuickJumper: true, // Allow the user to jump to a specific page
                    }}
                    style={{ backgroundColor: "#fff" }} />
            </StyledCard>
        </Flex>
    );
};

export default DepositScreen;
