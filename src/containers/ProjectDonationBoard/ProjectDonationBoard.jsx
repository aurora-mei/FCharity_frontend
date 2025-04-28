import React, { useEffect, useState } from "react";
import { Card, Table, Typography, Select,Empty } from "antd";
import { Flex } from "antd";
import styled from "styled-components";
import moment from "moment-timezone";
import PropTypes from "prop-types";
import DonationCard from "../../components/DonationCard/DonationCard";
import { Row, Col, Pagination } from "antd";
import { useDispatch } from "react-redux";
const { Title, Text } = Typography;

const StyledWrapper = styled.div`
  padding: 1rem;
  width: 100%;
  .donation-card {
    width: 100%;
    background: #fff !important;
    padding: 1rem;
    border-radius: 1rem;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    transition: all 0.3s ease;

    .ant-card-body {
      background: #fff !important;
    }

    &:hover {
      cursor: pointer;
      transform: translateY(-0.3rem);
      box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px;
    }
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .full-width-button {
    width: 100%;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      cursor: pointer;
      transform: translateY(-0.3rem);
      box-shadow: rgba(0, 0, 0, 0.3) 0px 8px 10px 0px;
    }
  }

  .bottom-actions {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.9rem !important;

    .ant-btn:hover {
      background-color: #f0f0f0 !important;
      color: black !important;
      border-color: black !important;
    }
  }

  .custom-table .ant-table {
    font-size: 0.8rem;
  }

  .custom-table .ant-table-thead > tr > th {
    font-size: 1rem;
  }

  .custom-table .ant-table-tbody > tr > td {
    font-size: 0.9rem;
  }
`;

const columns = [
  {
    title: "Date",
    dataIndex: "donationTime",
    key: "donationTime",
    render: (text) => (
      <Text style={{ fontSize: "0.9rem" }}>
        {moment(text).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY hh:mm A")}
      </Text>
    ),
    sorter: (a, b) => new Date(a.donationTime) - new Date(b.donationTime),
    defaultSortOrder: "descend",
  },
  {
    title: "Donator",
    dataIndex: "user",
    key: "fullName",
    render: (user) => <p>{user.fullName}</p>,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (text) => (
      <Text style={{ fontSize: "0.9rem" }} type="success">
        {text?.toLocaleString() || 0} VND
      </Text>
    ),
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
    render: (text) => (
      <Text style={{ fontSize: "0.9rem" }}>
        {text || "No message"}
      </Text>
    ),
  },
];

const ProjectDonationBoard = ({ donations }) => {
  const [dataSource, setDataSource] = useState([]);
  const [filterOption, setFilterOption] = useState("All");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };


  useEffect(() => {
    filterDonations();
  }, [filterOption, donations]);
 
  const filterDonations = () => {
    let filtered;
  
    switch (filterOption) {
      case "Recent donations":
        filtered = donations
          .filter((x) => moment(x.donationTime).isSame(moment(), "day"))
          .sort((a, b) => moment(b.donationTime) - moment(a.donationTime));
        break;
  
      case "Top donations":
        filtered = donations
          .filter((x) => x.donationStatus === "VERIFIED")
          .sort((a, b) => b.amount - a.amount);
        break;
  
      case "First donations":
        filtered = donations
          .filter((x) => x.donationStatus === "VERIFIED")
          .sort((a, b) => moment(a.donationTime) - moment(b.donationTime));
        break;
  
      case "All":
      default:
        filtered = [...donations].sort((a, b) => moment(b.donationTime).valueOf() - moment(a.donationTime).valueOf());

    }
  
    setDataSource(filtered);
  };
  const paginatedData = dataSource.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const handleFilterChange = (value) => {
    setFilterOption(value);
  };
  

  const recentDonation = donations
    .filter((x) => moment(x.donationTime).isSame(moment(), "day"))
    .sort((a, b) => moment(b.donationTime) - moment(a.donationTime));

  return (
    <StyledWrapper>
      <Card className="donation-card">
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>
            Donation Records
          </Title>
          <Text type="primary" style={{ fontSize: "1rem", fontWeight: 500 }}>
            Total:{" "}
            <Text type="success">
              {donations
                .filter((x) => x.donationStatus === "COMPLETED")
                .reduce((total, d) => total + d.amount, 0)
                .toLocaleString()}{" "}
              VND
            </Text>
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "0.9rem", fontWeight: 400, color: "gray" }}>
            Newest:{" "}
            {recentDonation.length > 0
              ? moment(recentDonation[0].donationTime)
                  .tz("Asia/Ho_Chi_Minh")
                  .format("DD/MM/YYYY hh:mm A")
              : "No recent donations today"}
          </p>
          <Select
            value={filterOption}
            onChange={handleFilterChange}
            style={{ width: "10rem" }}
          >
            {["All", "Recent donations", "Top donations", "First donations"].map(
              (type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              )
            )}
          </Select>
        </Flex>

        {dataSource.length > 0 ? (
          // <Table
          //   columns={columns}
          //   size="middle"
          //   scroll={{ y: 300 }}
          //   dataSource={dataSource}
          //   pagination={{
          //       pageSize: pageSize,
          //       pageSizeOptions: ['5', '10', '20', '50'],
          //       onChange: (page, pageSize) => setPageSize(pageSize),
          //       showSizeChanger: true,
          //       showQuickJumper: true,
          //   }}
          //   rowKey="id"
          //   className="custom-table"
          // />
          <div>
      <Flex vertical gap={10} style={{marginBottom:"1rem", minHeight:"20rem"}}>
        {paginatedData.map((donation) => (
          <DonationCard donation={donation} />
        ))}
      </Flex>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={donations.length}
        onChange={handlePageChange}
        showSizeChanger
        pageSizeOptions={['5', '10', '20', '50']}
        showQuickJumper
      />
    </div>
        ) : (
          <Empty title="No donations available"></Empty>
        )}
      </Card>
    </StyledWrapper>
  );
};

ProjectDonationBoard.propTypes = {
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
