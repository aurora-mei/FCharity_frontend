import React, { useEffect, useState, useMemo } from "react";
import { Card, Typography, DatePicker, Empty, Pagination, Divider } from "antd";
import { Flex } from "antd";
import styled from "styled-components";
import moment from "moment-timezone";
import PropTypes from "prop-types";
import DonationCard from "../../components/DonationCard/DonationCard"; // Assuming correct path

const { Title, Text } = Typography;

// --- Styled Components ---
const StyledWrapper = styled.div`
  width: 100%;
  .donation-card-wrapper {
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

// NEW: Styled component for the date group background
const DateGroupWrapper = styled.div`
  background-color:rgb(230, 244, 255); // Ant Design's light blue (@blue-1)
  padding: 1rem;
  border-radius: 8px; // Optional: slightly rounded corners
  margin-bottom: 1.5rem; // Space between date groups
  &:last-child {
    margin-bottom: 0; // No margin after the last item
  }
`;


// --- Helper Function (Keep as is) ---
const groupDonationsByDate = (donations) => {
  // ... (keep the existing grouping logic)
  if (!donations || donations.length === 0) {
    return {};
  }

  const grouped = donations.reduce((acc, donation) => {
    const dateKey = moment(donation.donationTime)
      .tz("Asia/Ho_Chi_Minh")
      .startOf("day")
      .format("YYYY-MM-DD");

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(donation);
    acc[dateKey].sort((a, b) => moment(b.donationTime).valueOf() - moment(a.donationTime).valueOf());
    return acc;
  }, {});

  return grouped;
};


const ProjectDonationBoard = ({ donations }) => {
  const [groupedDonations, setGroupedDonations] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalDonationAmount = useMemo(() => {
    return donations
      .filter((d) => d.donationStatus === "COMPLETED")
      .reduce((total, d) => total + d.amount, 0);
  }, [donations]);

  useEffect(() => {
    const grouped = groupDonationsByDate(donations);
    setGroupedDonations(grouped);
    setCurrentPage(1);
  }, [donations]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedDonations).sort((a, b) => moment(b).valueOf() - moment(a).valueOf());
  }, [groupedDonations]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
        setPageSize(newPageSize);
    }
  };

  // --- Prepare Data for Display ---
  const renderContent = () => {
    if (selectedDate) {
      // --- Displaying donations for a specific selected date ---
      const dateKey = selectedDate.format("YYYY-MM-DD");
      const donationsForSelectedDate = groupedDonations[dateKey] || [];

      if (donationsForSelectedDate.length === 0) {
        return <Empty description={`No donations found for ${selectedDate.format("DD/MM/YYYY")}`} />;
      }

      const paginatedDonations = donationsForSelectedDate.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

      // No background needed for single date view
      return (
        <>
         <DateGroupWrapper key={dateKey}>
                <Title level={5} style={{ marginBottom: '0.5rem' }}>
                  {moment(dateKey).format("DD MMMM YYYY")} ({groupedDonations[dateKey]?.length || 0} donations)
                </Title>
                 <Divider style={{marginTop:"0.5rem", marginBottom:"1rem", backgroundColor: "rgba(0, 0, 0, 0.1)"}}/> {/* Optional: slightly darker divider */}
                <Flex vertical gap={16}>
                  {groupedDonations[dateKey].map((donation) => (
                    <DonationCard key={donation.id} donation={donation} />
                  ))}
                </Flex>
              </DateGroupWrapper>
          {donationsForSelectedDate.length > pageSize && (
             <Pagination
                style={{ marginTop: '1rem', textAlign: 'center' }}
                current={currentPage}
                pageSize={pageSize}
                total={donationsForSelectedDate.length}
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={['5', '10', '20', '50']}
                showQuickJumper
            />
          )}
        </>
      );
    } else {
      // --- Displaying donations grouped by date (paginating through dates) ---
      if (sortedDates.length === 0) {
        return <Empty description="No donations available" />;
      }

       const paginatedDates = sortedDates.slice(
         (currentPage - 1) * pageSize,
         currentPage * pageSize
       );

      return (
        <>
          {/* Remove gap from Flex, handle spacing with DateGroupWrapper margin */}
          <Flex vertical>
            {paginatedDates.map((dateKey) => (
              // Use the new styled component wrapper here
              <DateGroupWrapper key={dateKey}>
                <Title level={5} style={{ marginBottom: '0.5rem' }}>
                  {moment(dateKey).format("DD MMMM YYYY")} ({groupedDonations[dateKey]?.length || 0} donations)
                </Title>
                 <Divider style={{marginTop:"0.5rem", marginBottom:"1rem", backgroundColor: "rgba(0, 0, 0, 0.1)"}}/> {/* Optional: slightly darker divider */}
                <Flex vertical gap={16}>
                  {groupedDonations[dateKey].map((donation) => (
                    <DonationCard key={donation.id} donation={donation} />
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

  return (
    <StyledWrapper>
      {/* Use Card for overall structure, but control padding manually */}
      <Card className="donation-card-wrapper" bordered={false}>
         {/* Header Section - Add padding here */}
        <div style={{ padding: '1rem 1rem 0 1rem' }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: "1.1rem" }}>Donation Records</Text>
              <Text style={{ fontSize: "1rem", fontWeight: 500 }}>
                Total Completed:{" "}
                <Text type="success" style={{ fontSize: "1.1rem" }}>
                  {totalDonationAmount.toLocaleString()} VND
                </Text>
              </Text>
            </Flex>

            {/* Date Search Section */}
            <Flex justify="flex-end" style={{ marginBottom: 16 }}> {/* Reduced margin */}
              <DatePicker
                onChange={handleDateChange}
                value={selectedDate}
                placeholder="Search by Date"
                format="DD/MM/YYYY"
                allowClear
              />
            </Flex>
            <Divider style={{marginTop:0, marginBottom:"1.5rem"}}/>
        </div>

        {/* Donation List Section - Add padding here */}
         <div style={{padding: "0 1rem 1rem 1rem"}}>
            {renderContent()}
         </div>

      </Card>
    </StyledWrapper>
  );
};

ProjectDonationBoard.propTypes = {
  // ... (keep existing propTypes)
  donations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      donationTime: PropTypes.string.isRequired,
      user: PropTypes.shape({
        fullName: PropTypes.string.isRequired,
      }).isRequired,
      amount: PropTypes.number.isRequired,
      message: PropTypes.string,
      donationStatus: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ProjectDonationBoard;