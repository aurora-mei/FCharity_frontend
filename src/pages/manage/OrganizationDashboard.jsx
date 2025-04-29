import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllMembersInOrganization,
  getArticleByOrganizationId,
  getExtraFundRequestsByOrganizationId,
  getOrganizationEvents,
  getTotalExpense,
  getTotalIncome,
  getTransactionsByOrganizationId,
} from "../../redux/organization/organizationSlice";
import { fetchProjectsByOrgThunk } from "../../redux/project/projectSlice";
import UserRoleDashboardChart from "./components/charts/UserRoleDashboardChart";
import MemberOverTimeChart from "./components/charts/MemberOverTimeChart";
import ProjectStatusChart from "./components/charts/ProjectStatusChart";
import { Link } from "react-router-dom";
import { Empty } from "antd";
import { Paper } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { ImArrowDown } from "react-icons/im";
import { ImArrowUp } from "react-icons/im";

const transactionColumns = [
  { id: "name", label: "Organization", minWidth: 170 },
  { id: "code", label: "Project", minWidth: 170 },
  {
    id: "amount",
    label: "Amount",
    minWidth: 70,
    format: (value) => value.toFixed(2),
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

const OrganizationDashboard = () => {
  const dispatch = useDispatch();

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const currentOrganizationMembers = useSelector(
    (state) => state.organization.currentOrganizationMembers
  );

  const organizationArticles = useSelector(
    (state) => state.organization.organizationArticles
  );

  const organizationEvents = useSelector((state) => state.organization.events);

  const projects = useSelector((state) => state.project.projects);

  const totalIncome = useSelector((state) => state.organization.totalIncome);
  const totalExpense = useSelector((state) => state.organization.totalExpense);

  const organizationTransactions = useSelector(
    (state) => state.organization.organizationTransactions
  );

  const [transactionPage, setTransactionPage] = useState(0);
  const [rowsPerTransactionPage, setRowsPerTransactionPage] = useState(10);

  useEffect(() => {
    if (currentOrganization) {
      dispatch(getArticleByOrganizationId(currentOrganization.organizationId));
      dispatch(getAllMembersInOrganization(currentOrganization.organizationId));
      dispatch(fetchProjectsByOrgThunk(currentOrganization.organizationId));
      dispatch(getOrganizationEvents(currentOrganization.organizationId));

      dispatch(getTotalIncome(currentOrganization.organizationId));
      dispatch(getTotalExpense(currentOrganization.organizationId));

      dispatch(
        getTransactionsByOrganizationId(currentOrganization.organizationId)
      );
    }
  }, [currentOrganization]);

  const [showManagerInfo, setShowManagerInfo] = useState(-1);

  const handleChangeTransactionPage = (event, newPage) => {
    setTransactionPage(newPage);
  };

  const handleChangeRowsPerTransactionPage = (event) => {
    setRowsPerTransactionPage(+event.target.value);
    setTransactionPage(0);
  };

  // console.log("current Organization", currentOrganization);
  // console.log("projects", projects);
  // console.log("totalIncome", totalIncome);
  // console.log("totalExpense", totalExpense);
  // console.log("organizationTransactions", organizationTransactions);

  return (
    <div>
      {currentOrganization && (
        <div className="p-5 min-h-[390px] overflow-y-scroll bg-gray-50">
          <p className="text-5xl font-bold mb-4 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Organization Dashboard
          </p>
          <div className="flex items-center justify-center gap-10 mt-16">
            <div className="w-[200px] h-[100px] bg-white rounded-md shadow-md hover:transform hover:scale-105 transition duration-300 p-3 relative flex justify-center items-center">
              <div className="flex items-center gap-2 justify-center">
                <p
                  style={{ margin: 0 }}
                  className="text-4xl font-semibold text-purple-500"
                >
                  {organizationArticles?.length || 0}
                </p>
                <p
                  style={{ margin: 0 }}
                  className="text-xl font-semibold text-purple-500"
                >
                  Articles
                </p>
              </div>
            </div>
            <div className="w-[200px] h-[100px] bg-white rounded-md shadow-md hover:transform hover:scale-105 transition duration-300 p-3 relative flex justify-center items-center">
              <div className="flex items-center gap-2 justify-center">
                <p
                  style={{ margin: 0 }}
                  className="text-4xl font-semibold text-red-500"
                >
                  {projects?.length || 0}
                </p>
                <p
                  style={{ margin: 0 }}
                  className="text-xl font-semibold text-red-500"
                >
                  Projects
                </p>
              </div>
            </div>
            <div className="w-[200px] h-[100px] bg-white rounded-md shadow-md hover:transform hover:scale-105 transition duration-300 p-3 relative flex justify-center items-center">
              <div className="flex items-center gap-2 justify-center">
                <p
                  style={{ margin: 0 }}
                  className="text-4xl font-semibold text-blue-500"
                >
                  {currentOrganizationMembers?.length || 0}
                </p>
                <p
                  style={{ margin: 0 }}
                  className="text-xl font-semibold text-blue-500"
                >
                  Users
                </p>
              </div>
            </div>
            <div className="w-[200px] h-[100px] bg-white rounded-md shadow-md hover:transform hover:scale-105 transition duration-300 p-3 relative flex justify-center items-center">
              <div className="flex items-center gap-2 justify-center">
                <p
                  style={{ margin: 0 }}
                  className="text-4xl font-semibold text-orange-500"
                >
                  {organizationEvents?.length || 0}
                </p>
                <p
                  style={{ margin: 0 }}
                  className="text-xl font-semibold text-orange-500"
                >
                  Events
                </p>
              </div>
            </div>
            <div className="w-[200px] h-[100px] bg-white rounded-md shadow-md hover:transform  hover:scale-105 transition duration-300 p-3 relative flex justify-center items-center">
              <div className="flex items-center gap-2 justify-center">
                <p
                  style={{ margin: 0 }}
                  className="text-4xl font-semibold text-green-500"
                >
                  ${currentOrganization?.walletAddress?.balance}+
                </p>
                <p
                  style={{ margin: 0 }}
                  className="text-xl font-semibold text-green-500"
                >
                  CFund
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 w-full grid grid-cols-5 gap-8">
            <div className="col-span-3 bg-white rounded-md shadow-md p-4 ">
              <p style={{ margin: 0 }} className="text-xl text-gray-700">
                Member over time
              </p>
              <div className="mt-4 flex justify-center items-center">
                <div className="h-[370px] w-full">
                  <MemberOverTimeChart members={currentOrganizationMembers} />
                </div>
              </div>
            </div>
            <div className="col-span-2 flex flex-col justify-between gap-8">
              <div className="bg-white rounded-md shadow-md p-4">
                <p style={{ margin: 0 }} className="text-xl text-gray-700">
                  Role distribution chart
                </p>
                <div className="w-[320px] h-[200px] flex justify-center items-center">
                  <div className="w-full h-full">
                    <UserRoleDashboardChart
                      currentOrganizationMembers={currentOrganizationMembers}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-md shadow-md p-4 grow-1">
                <p style={{ margin: 0 }} className="text-xl text-gray-700">
                  Managers{" "}
                  <span className="text-gray-400 text-sm">(max 3)</span>
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {currentOrganizationMembers
                    .filter((member) => member.memberRole === "MANAGER")
                    .map((member, index) => (
                      <div
                        key={member.membershipId}
                        className="shadow-md rounded-md h-[75px] p-2 flex items-center gap-2 hover:cursor-pointer hover:bg-gray-100 transition-all duration-500 ease-in-out"
                      >
                        <div
                          className="w-15 h-15 rounded-full overflow-hidden border-4 border-green-500 hover:scale-105"
                          onClick={() => {
                            setShowManagerInfo((prev) =>
                              prev != index ? index : -1
                            );
                          }}
                        >
                          <img
                            src={
                              member?.user?.avatar ||
                              "https://avatar.iran.liara.run/public"
                            }
                            alt="manager avatars"
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.target.src =
                                "https://avatar.iran.liara.run/public")
                            }
                          />
                        </div>
                        {showManagerInfo === index && (
                          <div className="flex flex-col gap-1">
                            <p
                              style={{ margin: 0 }}
                              className="font-semibold hover:underline"
                            >
                              {member?.user?.fullName}
                            </p>
                            <p style={{ margin: 0 }}>{member?.user?.email}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-white rounded-md shadow-md p-4">
            <p style={{ margin: 0 }} className="text-xl text-gray-700">
              Organization projects status
            </p>
            <ProjectStatusChart projects={projects} />
          </div>

          <div className="mt-10  pt-4 ">
            <p
              style={{ margin: 0 }}
              className="text-2xl font-bold text-gray-700"
            >
              Fund Statistics
            </p>
            <div className="grid grid-cols-7 gap-4 mt-3">
              <div className="col-span-2 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="shadow-md rounded-md p-4 bg-white w-[100px] h-[100px] flex flex-col justify-center items-center gap-3">
                    <p
                      style={{ margin: 0 }}
                      className="font-semibold text-gray-600"
                    >
                      Income
                    </p>
                    <span
                      style={{ margin: 0 }}
                      className="text-green-500 text-2xl font-semibold"
                    >
                      ${totalIncome}+
                    </span>
                  </div>
                  <div className="shadow-md rounded-md p-4 bg-white w-[100px] h-[100px] flex flex-col justify-center items-center gap-3">
                    <p
                      style={{ margin: 0 }}
                      className=" font-semibold text-gray-600"
                    >
                      Expense
                    </p>
                    <span
                      style={{ margin: 0 }}
                      className="text-red-500  text-2xl font-semibold"
                    >
                      ${totalExpense}
                    </span>
                  </div>
                </div>
                <div className="shadow-md rounded-md p-4 bg-white grow-1">
                  <p style={{ margin: 0 }} className="text-md text-gray-700">
                    Top big expenses
                  </p>
                  <div className="mt-2 flex flex-col gap-1 h-[180px] overflow-y-scroll border border-gray-300 rounded-sm p-1">
                    {organizationTransactions
                      .filter(
                        (transaction) =>
                          transaction.transactionType === "ALLOCATE_EXTRA_COST"
                      )
                      .sort((a, b) => b.amount - a.amount)
                      .slice(0, 5)
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          title={transaction.message}
                          className="hover:cursor-pointer shadow-md rounded-md p-2 flex flex-col gap-1 hover:bg-gray-100 transition-all duration-500 ease-in-out text-sm"
                        >
                          <p style={{ margin: 0 }}>
                            To project: {"  "}
                            <span>{transaction.project.projectName}</span>
                          </p>
                          <p style={{ margin: 0 }}>
                            Amount: <span>$ {transaction.amount}</span>
                          </p>
                          <p style={{ margin: 0 }}>
                            Type:{" "}
                            <span className="text-xs font-semibold">
                              {transaction.transactionType}
                            </span>
                          </p>
                          <p style={{ margin: 0 }}>
                            Date:{" "}
                            <span>
                              {transaction.transactionTime.split(".")[0]}
                            </span>
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className="col-span-5 shadow-md rounded-md p-4 h-[350px] bg-white">
                <p style={{ margin: 0 }} className="text-md text-gray-700">
                  Cash flow chart over time
                </p>
                <div className="w-full mt-3 rounded-sm h-[290px] border border-gray-300"></div>
              </div>
            </div>

            <div className=" p-4 mt-3 bg-white shadow-md rounded-md">
              <h2 style={{ margin: 0 }} className="text-xl text-gray-700">
                Recent transactions history
              </h2>
              <Paper
                sx={{ width: "100%", overflow: "hidden" }}
                className="mt-3"
              >
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
                        .slice(0, 50)
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
                                <div className="flex gap-2 items-center">
                                  {row.organization.organizationName}
                                  {row.transactionType ===
                                  "EXTRACT_EXTRA_COST" ? (
                                    <ImArrowDown className="text-green-500" />
                                  ) : (
                                    <ImArrowUp className="text-red-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{row.project.projectName}</TableCell>
                              <TableCell>{row.amount}</TableCell>

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

export default OrganizationDashboard;

// "EXTRACT_EXTRA_COST";
// "ALLOCATE_EXTRA_COST";
