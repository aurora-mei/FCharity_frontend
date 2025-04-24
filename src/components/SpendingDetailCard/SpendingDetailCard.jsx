import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment-timezone';
import { Card, Typography, Row, Col, Image, Space, Tooltip, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
const { Text, Paragraph } = Typography;

// Styled Components (Adapting from DonationCard)
const StyledSpendingCard = styled(Card)`
  width: 100%;
  margin-bottom: 1rem; // Add space between cards like in the board example
  border-radius: 8px; // Slightly less rounded than the board's wrapper
  box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 8px 0px; // Subtle shadow
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
     box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 12px 0px; // Enhance shadow on hover
  }

  .ant-card-body {
    padding: 0.8rem 1rem !important; // Keep padding similar
  }

  // Column specific styles
  .info-col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem; // Space between text and image
  }

  .text-details {
     line-height: 1.4;
     word-break: break-word; // Prevent long descriptions from breaking layout
  }

  .proof-image-thumbnail {
    max-width: 50px; // Match previous size
    height: auto;
    border-radius: 4px;
    object-fit: cover;
    border: 1px solid #eee;
    cursor: pointer;
    align-self: flex-end; // Keep image aligned left
  }

  .spending-amount {
    font-size: 1rem;
    color: #dc3545; // Red for expenses
    font-weight: bold;
    text-align: center; // Align amount to the right of its column
    padding-top: 0.2rem; // Align with first line of text
    white-space: nowrap; // Prevent amount wrapping
  }

  .actions-area {
      
    text-align: right; // Align buttons to the right
    padding-top: 0.2rem; // Align with first line of text
     .ant-btn {
        font-size: 1rem; // Icon size within button
     }
  }
`;

// --- Spending Detail Card Component ---
const SpendingDetailCard = ({ detail, onEdit, onDelete,isLeader }) => {

    if (!detail) return null;
    const today = dayjs().startOf('day');
    const transactionDate = detail.transactionTime ? dayjs(detail.transactionTime).startOf('day') : null;
    // Chỉ hiển thị nút nếu là leader VÀ transactionDate hợp lệ VÀ trùng với ngày hôm nay
    const showActions = isLeader && transactionDate && transactionDate.isSame(today);
    return (
        <StyledSpendingCard>
            <Row gutter={[16, 16]} style={{ backgroundColor: "white" }}>
                <Col xs={12} sm={12} md={8} lg={8} xl={8} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="text-details">
                        <Text strong>{detail.description || 'No Description'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '0.85em' }}>
                            Time: {moment(detail.transactionTime).format("DD/MM/YYYY hh:mm A")}
                        </Text>
                        {detail.spendingItem?.itemName && (
                            <>
                                <br />
                                <Text type="secondary" style={{ fontSize: '0.85em' }}>
                                    Spending item: {detail.spendingItem.itemName}
                                </Text>
                            </>
                        )}
                    </div>
                </Col>

                <Col xs={12} sm={12} md={8} lg={8} xl={8} style={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                    <div className="spending-amount">
                        {detail.amount?.toLocaleString() ?? 'N/A'} VND
                    </div>
                </Col>


                <Col xs={12} sm={12} md={8} lg={8} xl={8} style={{ display: 'flex', alignItems: 'center', justifyContent: "flex-end" }}>
                    <div className="actions-area">
                        <Space direction="horizontal" size="small">
                            {detail.proofImage && (
                                <Image
                                    className="proof-image-thumbnail"
                                    src={detail.proofImage}
                                    alt={`Proof for ${detail.description || 'expense'}`}
                                    width={80}
                                    preview={{ src: detail.proofImage }}
                                />
                            )}
                           {showActions && isLeader &&(
                            <>
                              <Tooltip title="Edit Expense">
                                <Button
                                    shape="circle"
                                    icon={<EditOutlined />}
                                    onClick={() => onEdit(detail)}
                                    size="middle"
                                />
                            </Tooltip>
                            <Tooltip title="Delete Expense">
                                <Button
                                    shape="circle"
                                    icon={<DeleteOutlined />}
                                    onClick={onDelete}
                                    danger
                                    size="middle"
                                />
                            </Tooltip>
                            </>
                           )}
                        </Space>
                    </div>
                </Col>
            </Row>

        </StyledSpendingCard>
    );
};

// --- PropTypes ---
SpendingDetailCard.propTypes = {
    detail: PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string,
        transactionTime: PropTypes.string.isRequired,
        amount: PropTypes.number,
        spendingItem: PropTypes.shape({
            name: PropTypes.string, // Ensure this matches your data structure
        }),
        proofImage: PropTypes.string,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired, // Expects the function to call for deletion (likely includes confirmation)
};

export default SpendingDetailCard;