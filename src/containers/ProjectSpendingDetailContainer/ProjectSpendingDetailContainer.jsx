import React, { useEffect, useState, useMemo } from "react";
import {
    Card,
    Typography,
    DatePicker,
    Empty,
    Pagination,
    Divider,
    Image,
    Button,
    Form, // Import Form hook
    Space,
    Modal,
    Tooltip,
    Upload, // Keep Upload
    message, // Import message for feedback
} from "antd";
import { Flex } from "antd";
import styled from "styled-components";
import dayjs from 'dayjs'; // Use dayjs for date handling
import PropTypes from "prop-types";
import SpendingDetailModal from "../../components/SpendingDetailModal/SpendingDetailModal";
import {
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    UploadOutlined,
    ExclamationCircleFilled,
    PlusOutlined
} from "@ant-design/icons";
import { StyledButtonInvite } from '../ProjectFinancePlanContainer/ProjectFinancePlanContainer' // Reuse button style
import SpendingDetailCard from "../../components/SpendingDetailCard/SpendingDetailCard";
import {
    deleteSpendingDetailThunk,
    fetchExpenseTemplateThunk,
    importExpensesThunk,
    createSpendingDetailThunk, // Import create thunk
    updateSpendingDetailThunk, // Import update thunk
    fetchSpendingDetailsByProject, // Import fetch details thunk
    fetchSpendingItemOfPlan // Import fetch items thunk
} from "../../redux/project/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom"; // Import useParams

const { Title, Text } = Typography;
const { confirm } = Modal;

// --- Styled Components (Keep as is) ---
const StyledWrapper = styled.div`
  /* ... styles ... */
  width: 100%;
  .spending-card-wrapper { // Renamed class slightly for clarity
    width: 100%;
    background: #fff !important;
    padding: 0; // Reset padding, handle inside
    border-radius: 1rem;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    transition: all 0.3s ease;

    .ant-card-body {
      background: #fff !important;
      padding: 0; // Remove default Card padding
    }
  }
`;
const DateGroupWrapper = styled.div`
  /* ... styles ... */
  background-color: rgb(230, 244, 255); // Ant Design's light blue (@blue-1) or choose another color like light yellow/orange for expenses
  // background-color: #FFFBE6; // Example: Light Yellow (@yellow-1)
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  &:last-child {
    margin-bottom: 0;
  }
`;
const SpendingDetailRow = styled(Flex)`
  /* ... styles ... */
   width: 100%;
  padding: 1rem 0; // Increased padding slightly for more breathing room
  border-bottom: 1px solid #f0f0f0;
  gap: 1rem; // Add gap between main sections (info, amount, actions)

  &:last-child {
    border-bottom: none;
  }

  .spending-info {
    flex: 1; // Take up available space
    display: flex;
    flex-direction: column; // Stack text and image vertically
    gap: 0.5rem; // Space between text lines and image
    min-width: 0; // Prevent flex item overflow issues
  }

  .spending-amount {
    min-width: 120px;
    text-align: right;
    font-weight: 500;
    color: #dc3545; // Make amount stand out (optional, using danger color)
    font-size: 1rem; // Slightly larger amount font
    // Ensure amount stays top-aligned if info block grows
    align-self: flex-start;
    padding-top: 0.1rem; // Align roughly with first line of text
  }

   .spending-actions {
     // Ensure actions stay top-aligned
     align-self: flex-start;
     .ant-btn {
        // Add specific styles to buttons if needed, size is handled by props
        font-size: 1rem; // Makes the icon itself slightly larger within the button bounds
     }
   }

   .proof-image-thumbnail {
     margin-top: 0.5rem; // Space above the image
     max-width: 100px; // Control max width
     height: auto; // Maintain aspect ratio
     border-radius: 4px; // Slightly rounded corners
     object-fit: cover; // Cover the area without distortion
     border: 1px solid #f0f0f0; // Subtle border
     cursor: pointer;
   }
`;


// --- Helper Function (Keep as is) ---
const groupSpendingByDate = (spendingDetails) => {
    if (!spendingDetails || spendingDetails.length === 0) {
        return {};
    }
    // Assuming transactionTime is a valid date string or Instant object
    const grouped = spendingDetails.reduce((acc, detail) => {
        // Ensure detail and transactionTime exist
        if (!detail || !detail.transactionTime) return acc;
        const dateKey = dayjs(detail.transactionTime)
            // .tz("Asia/Ho_Chi_Minh") // Adjust timezone if necessary - dayjs handles local time by default
            .startOf("day")
            .format("YYYY-MM-DD");

        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(detail);
        // Sort by transaction time descending within each day
        acc[dateKey].sort((a, b) => dayjs(b.transactionTime).valueOf() - dayjs(a.transactionTime).valueOf());
        return acc;
    }, {});

    return grouped;
};

// --- Component ---
const ProjectSpendingDetailContainer = ({
    spendingDetails = [], // Provide default empty array
    isLeader
}) => {
    const dispatch = useDispatch();
    const { projectId } = useParams(); // Get projectId from URL params
    const [form] = Form.useForm(); // Single form instance for Add/Edit Modal

    // Redux Selectors
    const currentProject = useSelector((state) => state.project.currentProject);
    const spendingItems = useSelector((state) => state.project.spendingItems || []); // Get spending items for dropdown
    const currentSpendingPlan = useSelector((state) => state.project.currentSpendingPlan); // Needed to fetch items
    const donations = useSelector((state) => state.project.donations); // Get donations for balance calculation
    const isLoading = useSelector((state) =>
        state.project.status === 'loading' // Use a general loading state or specific ones
    );

    // Local State
    const [groupedSpendingDetails, setGroupedSpendingDetails] = useState({});
    const [selectedDate, setSelectedDate] = useState(null); // Keep null or dayjs object
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false); // Single state for modal visibility
    const [modalTitle, setModalTitle] = useState('Add Expense Detail');
    const [editingDetail, setEditingDetail] = useState(null); // Holds data for editing, null for adding
    // Calculate total spending amount
    const totalSpendingAmount = useMemo(() => {
        return spendingDetails.reduce((total, d) => total + (Number(d?.amount) || 0), 0);
    }, [spendingDetails]);

    const currentDonationAmount = useMemo(() => {
        return donations
            ?.filter((d) => d.donationStatus === "COMPLETED")
            .reduce((total, d) => total + d.amount, 0) || 0;
    }, [donations]);

    const remainingBalance = useMemo(() => {
        return currentDonationAmount - totalSpendingAmount;
    }, [spendingDetails]);

    const isReachSpendingLimit = useMemo(() => {
        return remainingBalance <= 0;
    }, [spendingDetails]);
    // Fetch data on mount and when projectId/plan changes
    useEffect(() => {
        if (projectId) {
            dispatch(fetchSpendingDetailsByProject(projectId));
            // Fetch spending items if plan ID is available
            if (currentSpendingPlan?.id) {
                dispatch(fetchSpendingItemOfPlan(currentSpendingPlan.id));
            }
        }
    }, [dispatch, projectId, currentSpendingPlan?.id]); // Depend on plan ID

    // Group spending details when the prop changes
    useEffect(() => {
        const grouped = groupSpendingByDate(spendingDetails);
        setGroupedSpendingDetails(grouped);
        setCurrentPage(1); // Reset page on data change
    }, [spendingDetails]);

    // Get sorted dates for display order
    const sortedDates = useMemo(() => {
        return Object.keys(groupedSpendingDetails).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());
    }, [groupedSpendingDetails]);

    // --- Handlers ---
    const handleDateChange = (date) => { // date is a dayjs object or null
        setSelectedDate(date);
        setCurrentPage(1);
    };

    const handlePageChange = (page, newPageSize) => {
        setCurrentPage(page);
        if (newPageSize && newPageSize !== pageSize) {
            setPageSize(newPageSize);
        }
    };

    // --- Modal Control ---
    const showAddModal = () => {
        setEditingDetail(null);
        setModalTitle('Add New Expense Detail');
        form.resetFields(); // Reset form for adding
        setIsModalOpen(true);
    };

    const showEditModal = (record) => {
        setEditingDetail(record);
        setModalTitle('Edit Expense Detail');
        // Form values will be set by useEffect in SpendingDetailModal based on 'initialData' prop
        setIsModalOpen(true);
    };

    // --- Form Submission ---
    const handleFormSubmit = async (values) => {
        // Prepare data - common transformations
        const transformedValues = {
            ...values,
            // Convert Dayjs back to ISO string (UTC) for backend
            transactionTime: values.transactionTime ? values.transactionTime.toISOString() : null,
            // Ensure amount is a number
            amount: Number(values.amount) || 0,
            projectId: projectId, // Add projectId
        };

        try {
            if (editingDetail && editingDetail.id) {
                // --- Editing ---
                const id = editingDetail.id;
                const detailData = { ...transformedValues };
                // Remove id from the payload data object if it exists from form autofill
                if ('id' in detailData) delete detailData.id;

                console.log("Updating expense with ID:", id, "Data:", detailData);
                await dispatch(updateSpendingDetailThunk({ id, detailData })).unwrap();
                message.success('Expense updated successfully!');

            } else {
                // --- Creating ---
                const detailData = { ...transformedValues };
                // Remove potential empty id field from values if form didn't reset fully
                if ('id' in detailData) delete detailData.id;

                console.log("Creating expense:", detailData);
                await dispatch(createSpendingDetailThunk(detailData)).unwrap();
                message.success('Expense added successfully!');
            }
            setIsModalOpen(false);
            form.resetFields();
            // Re-fetch data after successful add/edit
            dispatch(fetchSpendingDetailsByProject(projectId));

        } catch (error) {
            console.error("Failed to save expense:", error);
            message.error(error?.message || 'Failed to save expense. Please try again.');
            // Keep modal open on error? Optional.
        }
    };

    // --- Delete Confirmation ---
    const showDeleteConfirm = (detail) => {
        confirm({
            title: 'Are you sure you want to delete this expense record?',
            icon: <ExclamationCircleFilled />,
            content: ( // More robust content display
                <div>
                    <p><b>Item:</b> {detail?.spendingItem?.itemName || 'N/A'}</p>
                    <p><b>Amount:</b> {Number(detail?.amount || 0).toLocaleString('vi-VN')} VND</p>
                    {detail?.description && <p><b>Description:</b> {detail.description}</p>}
                </div>
            ),
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No, Cancel',
            async onOk() { // Make async to handle potential errors
                try {
                    console.log("Deleting expense with ID:", detail.id);
                    await dispatch(deleteSpendingDetailThunk(detail.id)).unwrap();
                    message.success('Expense deleted successfully!');
                    // Re-fetch data after successful delete
                    dispatch(fetchSpendingDetailsByProject(projectId));
                } catch (error) {
                    console.error("Failed to delete expense:", error);
                    message.error(error?.message || 'Failed to delete expense.');
                }
            },
        });
    };

    // --- Main Content Rendering Logic (Keep existing renderContent logic) ---
    const renderContent = () => {
        // ... (Keep the existing logic for rendering based on selectedDate) ...
        // Ensure SpendingDetailCard receives the correct onEdit prop

        if (selectedDate) {
            // --- Displaying expenses for a specific selected date ---
            const dateKey = selectedDate.format("YYYY-MM-DD");
            const expensesForSelectedDate = groupedSpendingDetails[dateKey] || [];

            if (expensesForSelectedDate.length === 0) {
                return <Empty description={`No expenses found for ${selectedDate.format("DD/MM/YYYY")}`} />;
            }

            const paginatedExpenses = expensesForSelectedDate.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
            );

            return (
                <DateGroupWrapper key={dateKey}>
                    <Title level={5} style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                        Expenses on {dayjs(dateKey).format("DD MMMM YYYY")} ({expensesForSelectedDate.length} total)
                    </Title>
                    <Divider style={{ marginTop: "0.5rem", marginBottom: "1rem", backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
                    <Flex vertical >
                        {paginatedExpenses.map(detail => (
                            <SpendingDetailCard
                                isLeader={isLeader}
                                key={detail.id}
                                detail={detail}
                                // Pass function to trigger edit modal for this detail
                                onEdit={() => showEditModal(detail)}
                                onDelete={() => showDeleteConfirm(detail)}
                            />
                        ))}
                    </Flex>
                    {expensesForSelectedDate.length > pageSize && (
                        <Pagination
                            style={{ marginTop: '1.5rem', textAlign: 'center' }}
                            current={currentPage}
                            pageSize={pageSize}
                            total={expensesForSelectedDate.length}
                            onChange={handlePageChange}
                            showSizeChanger
                            pageSizeOptions={['5', '10', '20', '50']}
                            showQuickJumper
                        />
                    )}
                </DateGroupWrapper>
            );
        } else {
            // --- Displaying expenses grouped by date ---
            if (sortedDates.length === 0) {
                return <Empty description="No expense records available" />;
            }

            const paginatedDates = sortedDates.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
            );

            return (
                <>
                    <Flex vertical>
                        {paginatedDates.map((dateKey) => (
                            <DateGroupWrapper key={dateKey}>
                                <Title level={5} style={{ marginBottom: '0.5rem' }}>
                                    {dayjs(dateKey).format("DD MMMM YYYY")} ({groupedSpendingDetails[dateKey]?.length || 0} expenses)
                                </Title>
                                <Divider style={{ marginTop: "0.5rem", marginBottom: "1rem", backgroundColor: "rgba(0, 0, 0, 0.1)" }} />
                                <Flex vertical>
                                    {groupedSpendingDetails[dateKey].map(detail => (
                                        <SpendingDetailCard
                                            isLeader={isLeader}
                                            key={detail.id}
                                            detail={detail}
                                            // Pass function to trigger edit modal for this detail
                                            onEdit={() => showEditModal(detail)}
                                            onDelete={() => showDeleteConfirm(detail)}
                                        />
                                    ))}
                                </Flex>
                            </DateGroupWrapper>
                        ))}
                    </Flex>
                    {sortedDates.length > pageSize && (
                        <Pagination
                            style={{ marginTop: '2rem', textAlign: 'center' }}
                            current={currentPage}
                            pageSize={pageSize}
                            total={sortedDates.length}
                            onChange={handlePageChange}
                            showSizeChanger
                            pageSizeOptions={['5', '10', '20', '50']}
                            showQuickJumper
                        />
                    )}
                </>
            );
        }
    };


    // --- Component Return ---
    return (
        <StyledWrapper>
            <Card className="spending-card-wrapper" bordered={false}>
                {/* Header Section */}
                <div style={{ padding: '1rem 1rem 0 1rem' }}>
                    {/* Title and Total */}
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small" style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: "1.1rem" }}>Expense Records</Text>
                        <Text style={{ fontSize: "1rem", fontWeight: 500 }}>
                            Total Spent:{" "}
                            <Text type="danger" style={{ fontSize: "1.1rem" }}>
                                {totalSpendingAmount.toLocaleString('vi-VN')} VND {/* Format currency */}
                            </Text>
                        </Text>
                    </Flex>

                    {/* Action Buttons and Date Search */}
                    <Flex justify="space-between" align="center" wrap="wrap" gap="middle" style={{ marginBottom: 16 }}>
                        {/* Add/Download/Import Buttons */}
                            {isLeader && (
                                <Space wrap> {/* Bọc các nút trong Space để quản lý khoảng cách */}
                                    {/* --- Nút Add Expense Detail --- */}
                                    {isReachSpendingLimit ? (
                                        <Tooltip title="Spending limit reached. Cannot add new expenses.">
                                            {/* Wrapper span rất quan trọng cho tooltip trên nút disabled */}
                                            <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
                                                <StyledButtonInvite
                                                    icon={<PlusOutlined />}
                                                    disabled={true} // Nút bên trong phải được disable
                                                    style={{ pointerEvents: 'none' }} // Thêm để chắc chắn không có sự kiện nào lọt qua
                                                >
                                                    Add Expense Detail
                                                </StyledButtonInvite>
                                            </span>
                                        </Tooltip>
                                    ) : (
                                        // Render nút bình thường khi không bị disable bởi limit
                                        <StyledButtonInvite icon={<PlusOutlined />} onClick={showAddModal}>
                                            Add Expense Detail
                                        </StyledButtonInvite>
                                    )}

                                    {/* --- Nút Download Template --- */}
                                    <Tooltip title="Click here to download creating expenses template">
                                        <StyledButtonInvite
                                            icon={<DownloadOutlined />}
                                            onClick={() => {
                                                if (currentProject?.project?.id) {
                                                    dispatch(fetchExpenseTemplateThunk(currentProject.project.id));
                                                } else {
                                                    message.error("Project details not loaded yet.");
                                                }
                                            }}
                                        >
                                            Download Template
                                        </StyledButtonInvite>
                                    </Tooltip>

                                    {/* --- Nút Import Expenses --- */}
                                    <Upload
                                        accept=".xlsx"
                                        showUploadList={false}
                                        beforeUpload={(file) => {
                                            // Thêm kiểm tra giới hạn ở đây làm lớp bảo vệ thứ hai (tùy chọn)
                                            if (isReachSpendingLimit) {
                                                message.warning("Cannot import: Spending limit reached.");
                                                return Upload.LIST_IGNORE; // Ngăn chặn hành động upload
                                            }
                                            if (currentProject?.project?.id) {
                                                dispatch(importExpensesThunk({ file, projectId: currentProject.project.id }));
                                            } else {
                                                message.error("Project details not loaded yet.");
                                            }
                                            return false; // Luôn ngăn chặn việc upload mặc định của Antd
                                        }}
                                    // Không cần disable Upload component nếu nút bên trong đã disable
                                    >
                                        {isReachSpendingLimit ? (
                                            <Tooltip title="Spending limit reached. Cannot import expenses.">
                                                <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
                                                    <StyledButtonInvite
                                                        icon={<UploadOutlined />}
                                                        disabled={true} // Disable nút bên trong
                                                        style={{ pointerEvents: 'none' }}
                                                    >
                                                        Import Expenses
                                                    </StyledButtonInvite>
                                                </span>
                                            </Tooltip>
                                        ) : (
                                            // Render nút bình thường bên trong Upload khi không bị disable bởi limit
                                            <StyledButtonInvite icon={<UploadOutlined />}>
                                                Import Expenses
                                            </StyledButtonInvite>
                                        )}
                                    </Upload>
                                </Space>
                            )}

                        {/* Date Search */}
                        <DatePicker
                            onChange={handleDateChange}
                            value={selectedDate}
                            placeholder="Search by Date"
                            format="DD/MM/YYYY"
                            allowClear
                        />
                    </Flex>
                    <Divider style={{ marginTop: 0, marginBottom: "1.5rem" }} />
                </div>

                {/* Spending List Section */}
                <div style={{ padding: "0 1rem 1rem 1rem" }}>
                    {renderContent()}
                </div>

                {/* --- MODAL --- */}
                <SpendingDetailModal
                    isOpen={isModalOpen}
                    remainingBalance={remainingBalance}
                    setIsOpen={setIsModalOpen}
                    initialData={editingDetail} // Pass null for add, object for edit
                    title={modalTitle}
                    form={form}
                    onFinish={handleFormSubmit}
                    spendingItems={spendingItems} // Pass the list of items
                    isLoading={isLoading} // Pass loading state
                />

            </Card>
        </StyledWrapper>
    );
};

// --- PropTypes (Keep as is or update based on actual detail structure) ---
ProjectSpendingDetailContainer.propTypes = {
    spendingDetails: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            spendingItem: PropTypes.shape({
                id: PropTypes.string,
                itemName: PropTypes.string, // Ensure itemName is expected
            }),
            amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Allow string or number from API/state
            transactionTime: PropTypes.string.isRequired,
            description: PropTypes.string,
            proofImage: PropTypes.string,
        })
    ), // Removed .isRequired since defaultProps handles it
    isLeader: PropTypes.bool
};

ProjectSpendingDetailContainer.defaultProps = {
    spendingDetails: [],
    isLeader: false,
};

export default ProjectSpendingDetailContainer;