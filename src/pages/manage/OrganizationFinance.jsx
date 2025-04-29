import { Empty } from "antd";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  getDonatesByOrganizationId,
  getTotalExpense,
  getTotalIncome,
  getTransactionsByOrganizationId,
} from "../../redux/organization/organizationSlice";

const donationColumns = [
  { id: "name", label: "From user", minWidth: 170 },
  { id: "code", label: "To organization", minWidth: 170 },
  {
    id: "amount",
    label: "Amount",
    minWidth: 70,
    format: (value) => value.toFixed(2),
  },
  {
    id: "status",
    label: "Status",
    minWidth: 170,
  },
  {
    id: "message",
    label: "Message",
    minWidth: 170,
  },
  {
    id: "orderCode",
    label: "Order code",
    minWidth: 70,
  },
  {
    id: "time",
    label: "Time",
    minWidth: 120,

    format: (value) => value.toLocaleString("en-US"),
  },
];

const transactionColumns = [
  { id: "name", label: "From organization", minWidth: 170 },
  { id: "code", label: "To project", minWidth: 170 },
  {
    id: "amount",
    label: "Amount",
    minWidth: 70,
    format: (value) => value.toFixed(2),
  },
  {
    id: "status",
    label: "Status",
    minWidth: 170,
  },
  {
    id: "message",
    label: "Message",
    minWidth: 170,
  },
  {
    id: "transactionType",
    label: "Transaction type",
    minWidth: 70,
  },
  {
    id: "time",
    label: "Time",
    minWidth: 120,
    format: (value) => value.toLocaleString("en-US"),
  },
];

const OrganizationFinance = () => {
  const dispatch = useDispatch();
  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const [donationPage, setDonationPage] = useState(0);
  const [rowsPerDonationPage, setRowsPerDonationPage] = useState(10);

  const [transactionPage, setTransactionPage] = useState(0);
  const [rowsPerTransactionPage, setRowsPerTransactionPage] = useState(10);

  const totalIncome = useSelector((state) => state.organization.totalIncome);
  const totalExpense = useSelector((state) => state.organization.totalExpense);

  const organizationTransactions = useSelector(
    (state) => state.organization.organizationTransactions
  );

  const toOrganizationDonations = useSelector(
    (state) => state.organization.toOrganizationDonations
  );

  useEffect(() => {
    if (currentOrganization) {
      dispatch(getTotalIncome(currentOrganization.organizationId));
      dispatch(getTotalExpense(currentOrganization.organizationId));
      dispatch(getDonatesByOrganizationId(currentOrganization.organizationId));
      dispatch(
        getTransactionsByOrganizationId(currentOrganization.organizationId)
      );
    }
  }, [currentOrganization]);

  const handleChangeDonationPage = (event, newPage) => {
    setDonationPage(newPage);
  };

  const handleChangeRowsPerDonationPage = (event) => {
    setRowsPerDonationPage(+event.target.value);
    setDonationPage(0);
  };

  const handleChangeTransactionPage = (event, newPage) => {
    setTransactionPage(newPage);
  };

  const handleChangeRowsPerTransactionPage = (event) => {
    setRowsPerTransactionPage(+event.target.value);
    setTransactionPage(0);
  };

  console.log("organizationTransactions", organizationTransactions);
  console.log("toOrganizationDonations", toOrganizationDonations);

  return (
    <div>
      {currentOrganization && (
        <div className="p-4 bg-gray-100">
          <h1 className="text-2xl font-bold mb-3">Organization finance</h1>
          <div className=" p-4 flex flex-col">
            <div className="flex items-center">
              <h2 style={{ margin: 0 }} className="text-xl text-gray-700">
                Donations
              </h2>
            </div>
            <Paper sx={{ width: "100%", overflow: "hidden" }} className="mt-3">
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {donationColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {toOrganizationDonations
                      .slice(
                        donationPage * rowsPerDonationPage,
                        donationPage * rowsPerDonationPage + rowsPerDonationPage
                      )
                      .map((row, index) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={index}
                          >
                            <TableCell>{row.user.fullName}</TableCell>
                            <TableCell>
                              {row.organization.organizationName}
                            </TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell>{row.donationStatus}</TableCell>
                            <TableCell>{row.message}</TableCell>
                            <TableCell>{row.orderCode}</TableCell>
                            <TableCell>{row.donationTime}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={toOrganizationDonations.length}
                rowsPerPage={rowsPerDonationPage}
                page={donationPage}
                onPageChange={handleChangeDonationPage}
                onRowsPerPageChange={handleChangeRowsPerDonationPage}
              />
            </Paper>
          </div>

          <div className="p-4 flex flex-col mt-3">
            <h2 style={{ margin: 0 }} className="text-xl text-gray-700">
              Transaction requests
            </h2>
            <Paper sx={{ width: "100%", overflow: "hidden" }} className="mt-3">
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {transactionColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizationTransactions
                      .slice(
                        transactionPage * rowsPerTransactionPage,
                        transactionPage * rowsPerTransactionPage +
                          rowsPerTransactionPage
                      )
                      .map((row, index) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={index}
                          >
                            <TableCell>
                              {row.organization.organizationName}
                            </TableCell>
                            <TableCell>{row.project.projectName}</TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell>
                              <div className="relative hover:cursor-pointer">
                                {(row.transactionStatus === "PENDING" ||
                                  !row.transactionStatus) && (
                                  <span
                                    className="bg-yellow-400  px-2 py-1 rounded-full text-xs"
                                    onClick={() => {}}
                                  >
                                    Pending
                                  </span>
                                )}

                                {row.transactionStatus === "ACCEPTED" && (
                                  <span className="bg-green-400  px-2 py-1 rounded-full text-xs">
                                    Accepted
                                  </span>
                                )}

                                {row.transactionStatus === "REJECTED" && (
                                  <span className="bg-red-400  px-2 py-1 rounded-full text-xs">
                                    Rejected
                                  </span>
                                )}
                                <div className="absolute"></div>
                              </div>
                            </TableCell>
                            <TableCell>{row.message}</TableCell>
                            <TableCell>{row.transactionType}</TableCell>
                            <TableCell>
                              {row.transactionTime.split(".")[0]}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={organizationTransactions.length}
                rowsPerPage={rowsPerTransactionPage}
                page={transactionPage}
                onPageChange={handleChangeTransactionPage}
                onRowsPerPageChange={handleChangeRowsPerTransactionPage}
              />
            </Paper>
          </div>
        </div>
      )}
      {!currentOrganization && (
        <div className="p-6">
          <div className="flex justify-end items-center">
            <Link
              to="/organizations"
              className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
            >
              Discover organizations
            </Link>
          </div>
          <div className="flex justify-center items-center min-h-[500px]">
            <Empty description="You are not a manager of any organization" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationFinance;
