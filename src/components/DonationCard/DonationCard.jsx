import React, { useState, useEffect } from "react";
import { Card, Typography, Row, Col, Pagination,Flex } from "antd";
import styled from "styled-components";
import moment from "moment";
import PropTypes from "prop-types";

// Styled Components
const StyledCard = styled(Card)`
//   display: flex;
//   align-items: center;
//   padding: 1rem;
  width: 100%;
//   margin: 1rem;
//   border-radius: 1rem;
//   box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
//   background-color: white;

.ant-card-body{
padding: 0.8rem !important;
}
  .profile-image {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }

  .profile-info {
    flex-grow: 1;
    margin-left: 1rem;
  }

  .amount {
  margin-top: 0.5rem;
    font-size: 1rem;
    color: #22c55e; /* Tailwind's green-500 */
    font-weight: bold;
  }

  .message {
    font-weight: bold;
    margin-top: 0.5rem;
  }
`;

const { Text } = Typography;

const DonationCard = ({ donation }) => {
    return (
        <StyledCard>
        <Row gutter={[16, 16]} style={{ width: "100%" }}>
            <Col span={9}>
            <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                <img
                    alt="Profile picture"
                    src={donation.user.avatar || "https://via.placeholder.com/50"}
                    className="profile-image"
                />
                <div className="profile-info">
                    <Text strong style={{ fontSize: "1rem" }}>
                        {donation.user.fullName}
                    </Text>
                    <div style={{ color: "#6b7280" }}>
                        {moment(donation.donationTime).format("DD/MM/YYYY hh:mm A")}
                    </div>
                </div>
            </Flex>
            </Col>
            <Col span={7}>
            <div className="amount">+ {donation.amount.toLocaleString()} VND</div>
            </Col>
            <Col span={7}>
            <div className="message">{donation.message || "No message"}fdgdgdfgsdgfsdgdggdgdgf</div>
            </Col>
        </Row>
        </StyledCard>
    );
};

DonationCard.propTypes = {
    donation: PropTypes.shape({
        user: PropTypes.shape({
            fullName: PropTypes.string.isRequired,
            avatar: PropTypes.string,
        }).isRequired,
        donationTime: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
        message: PropTypes.string,
    }).isRequired,
};
export default DonationCard;