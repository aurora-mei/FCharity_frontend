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
  approveExtraFundRequest,
  getExtraFundRequestsByOrganizationId,
  getTotalExpense,
  getTotalIncome,
  getTransactionsByOrganizationId,
  rejectExtraFundRequest,
} from "../../redux/organization/organizationSlice";

import Modal from "react-modal";
import { IoClose } from "react-icons/io5";
import { ImArrowDown } from "react-icons/im";
import { ImArrowUp } from "react-icons/im";
import helperApi from "../../redux/helper/helperApi";

const donationColumns = [
  { id: "project", label: "From project", minWidth: 170 },
  { id: "organization", label: "To organization", minWidth: 170 },
  {
    id: "amount",
    label: "Amount",
    minWidth: 70,
    format: (value) => value.toFixed(2),
  },
  {
    id: "proofImage",
    label: "Proof image",
    minWidth: 130,
  },
  {
    id: "status",
    label: "Status",
    minWidth: 70,
  },
  {
    id: "createdAt",
    label: "Created at",
    minWidth: 120,

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "updatedAt",
    label: "Updated at",
    minWidth: 120,

    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
  },
];

const transactionColumns = [
  { id: "organization", label: "Organization", minWidth: 170 },
  { id: "project", label: "Project", minWidth: 170 },
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

const OrganizationFinance = () => {
  const dispatch = useDispatch();

  const [currentExtraFundRequest, setCurrentExtraFundRequest] = useState({
    projectId: "",
    amount: 0,
    proofImage: "",
    reason: "", // for reject
    status: "",
    createdDate: "",
    updatedDate: "",
    organizationId: "",
  });

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );

  const [isModalOpen, setIsModalOpen] = useState(0); // 0 -> off, 1 -> show proof image, 2 -> approve, 3 -> reject

  const [selectedRequest, setSelectedRequest] = useState({});

  const [donationPage, setDonationPage] = useState(0);
  const [rowsPerDonationPage, setRowsPerDonationPage] = useState(10);

  const [transactionPage, setTransactionPage] = useState(0);
  const [rowsPerTransactionPage, setRowsPerTransactionPage] = useState(10);

  const totalIncome = useSelector((state) => state.organization.totalIncome);
  const totalExpense = useSelector((state) => state.organization.totalExpense);

  const extraFundRequests = useSelector(
    (state) => state.organization.extraFundRequests
  );

  // const extraFundRequests = [
  //   {
  //     project: {
  //       projectName: "project name",
  //     },
  //     organization: {
  //       organizationName: "organization name",
  //     },
  //     amount: 123,
  //     proofImage:
  //       "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg",
  //     reason: "", // for reject
  //     status: "PENDING",
  //     createdDate: Date.now(),
  //     updatedDate: Date.now(),
  //   },
  // ];

  const organizationTransactions = useSelector(
    (state) => state.organization.organizationTransactions
  );

  useEffect(() => {
    if (currentOrganization) {
      dispatch(getTotalIncome(currentOrganization.organizationId));
      dispatch(getTotalExpense(currentOrganization.organizationId));
      dispatch(
        getExtraFundRequestsByOrganizationId(currentOrganization.organizationId)
      );
      dispatch(
        getTransactionsByOrganizationId(currentOrganization.organizationId)
      );
    }
  }, [currentOrganization, dispatch]);

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

  const submitAcceptRequest = () => {
    const dataInfo = {
      id: selectedRequest.id,
      projectId: selectedRequest.project.projectId,
      amount: selectedRequest.amount,
      proofImage: selectedRequest.proofImage,
      reason: selectedRequest.reason,
      status: selectedRequest.status,
      createdDate: selectedRequest.createdDate,
      updatedDate: selectedRequest.updatedDate,
      organizationId: selectedRequest.organization.organizationId,
    };

    setIsModalOpen(0);
    setSelectedRequest({});

    dispatch(approveExtraFundRequest(dataInfo));
  };

  const submitRejectRequest = () => {
    const dataInfo = {
      id: selectedRequest.id,
      projectId: selectedRequest.project.projectId,
      amount: selectedRequest.amount,
      proofImage: selectedRequest.proofImage,
      reason: selectedRequest.reason,
      status: selectedRequest.status,
      createdDate: selectedRequest.createdDate,
      updatedDate: selectedRequest.updatedDate,
      organizationId: selectedRequest.organization.organizationId,
    };

    setIsModalOpen(0);
    setSelectedRequest({});

    dispatch(rejectExtraFundRequest(dataInfo));
  };

  console.log("currentOrganization", currentOrganization);
  console.log("organizationTransactions", organizationTransactions);
  console.log("extraFundRequests", extraFundRequests);

  return (
    <div>
      {currentOrganization && (
        <div className="p-4 bg-gray-100">
          <h1 className="text-2xl font-bold mb-3">Organization finance</h1>
          <div className="flex items-center gap-3 p-4">
            <div className="w-28 h-28 rounded-md bg-white shadow-md flex flex-col gap-2 items-center justify-center">
              <p
                style={{ margin: 0 }}
                className="font-semibold text-gray-700 text-xl"
              >
                Balance
              </p>
              <p
                style={{ margin: 0 }}
                className="font-bold text-2xl text-green-500"
              >
                ${totalIncome - totalExpense}
              </p>
            </div>
            <div className="w-28 h-28 rounded-md bg-white shadow-md flex flex-col gap-2 items-center justify-center">
              <p
                style={{ margin: 0 }}
                className="font-semibold text-gray-700 text-xl"
              >
                Income
              </p>
              <p
                style={{ margin: 0 }}
                className="font-bold text-2xl text-green-500"
              >
                ${totalIncome}
              </p>
            </div>
            <div className="w-28 h-28 rounded-md bg-white shadow-md flex flex-col gap-2 items-center justify-center">
              <p
                style={{ margin: 0 }}
                className="font-semibold text-gray-700 text-xl"
              >
                Expense
              </p>
              <p
                style={{ margin: 0 }}
                className="font-bold text-2xl text-red-500"
              >
                ${totalExpense}
              </p>
            </div>
          </div>
          <div className="p-4 flex flex-col">
            <div className="flex items-center">
              <h2 style={{ margin: 0 }} className="text-xl text-gray-700">
                Requests for additional project funding
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
                    {extraFundRequests
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
                            <TableCell>{row.project.projectName}</TableCell>
                            <TableCell>
                              {row.organization.organizationName}
                            </TableCell>
                            <TableCell>{row.amount}</TableCell>
                            <TableCell>
                              <div
                                className="w-20 h-20 overflow-hidden hover:cursor-pointer"
                                onClick={() => {
                                  setIsModalOpen(1);
                                  setSelectedRequest(row);
                                }}
                              >
                                <img
                                  src={row.proofImage}
                                  alt="proof image"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              {row.status === "PENDING" && (
                                <div className="text-yellow-500 text-xs border border-yellow-500 rounded-full px-2 py-1">
                                  {row.status}
                                </div>
                              )}
                              {row.status === "APPROVED" && (
                                <div className="text-green-500 text-xs border border-green-500 rounded-full px-2 py-1">
                                  {row.status}
                                </div>
                              )}
                              {row.status === "REJECTED" && (
                                <div className="text-red-500 text-xs border border-red-500 rounded-full px-2 py-1">
                                  {row.status}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{row.createdDate}</TableCell>
                            <TableCell>{row.updatedDate}</TableCell>
                            <TableCell>
                              {row.status === "PENDING" && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="text-green-500 px-2 py-1 border border-green-500 rounded-md hover:bg-green-500 hover:text-white hover:cursor-pointer"
                                    onClick={() => {
                                      setSelectedRequest(row);
                                      setIsModalOpen(2);
                                    }}
                                  >
                                    Accept
                                  </div>
                                  <div
                                    className="text-red-500 px-2 py-1 border border-red-500 rounded-md hover:bg-red-500 hover:text-white hover:cursor-pointer"
                                    onClick={() => {
                                      setSelectedRequest(row);
                                      setIsModalOpen(3);
                                    }}
                                  >
                                    Reject
                                  </div>
                                </div>
                              )}
                              {row.status !== "PENDING" && (
                                <div className="flex items-center justify-center text-gray-500">
                                  <p>No action</p>
                                </div>
                              )}
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
                count={extraFundRequests.length}
                rowsPerPage={rowsPerDonationPage}
                page={donationPage}
                onPageChange={handleChangeDonationPage}
                onRowsPerPageChange={handleChangeRowsPerDonationPage}
              />
            </Paper>
          </div>

          <div className="p-4 flex flex-col mt-3">
            <h2 style={{ margin: 0 }} className="text-xl text-gray-700">
              Transactions history
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

      {isModalOpen > 0 && (
        <Modal
          isOpen={isModalOpen > 0}
          onRequestClose={() => {
            setIsModalOpen(false);
          }}
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            },
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              padding: "0",
              borderRadius: "8px",
              border: "none",
              overflow: "hidden",
              zIndex: 1001,
            },
          }}
        >
          <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
            <p
              className="text-xl font-bold text-gray-800"
              style={{ margin: 0, padding: 0 }}
            >
              {isModalOpen == 1 && "Proof image"}
              {isModalOpen == 2 && "Upload proof image for approval"}
              {isModalOpen == 3 && "Provide reason for rejection"}
            </p>
            <button
              className="focus:outline-none hover:cursor-pointer"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedRequest({});
              }}
            >
              <IoClose className="text-gray-500 hover:text-gray-700 " />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {isModalOpen == 1 && (
              <img
                src={selectedRequest.proofImage}
                alt="Proof image"
                className="w-full"
              />
            )}
            {isModalOpen == 2 && (
              <div className="w-full flex flex-col justify-center ">
                <input
                  type="file"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md"
                  accept="image/*"
                  onChange={async (e) => {
                    //upload proof image
                    const file = e.target.files[0];
                    if (file) {
                      const imageUrl = await helperApi.uploadFile({
                        file: file,
                        folderName: "proof-image",
                        resourceType: "image",
                      });
                      setSelectedRequest({
                        ...selectedRequest,
                        proofImage: imageUrl,
                      });
                    }
                  }}
                />
                <img
                  src={selectedRequest.proofImage}
                  alt="Proof image"
                  className="mt-3 ml-2 rounded-md w-20 h-20 object-cover"
                />
                <div className="flex justify-end items-center w-full mt-2 gap-2">
                  <div
                    className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
                    onClick={() => {
                      submitAcceptRequest();
                      setIsModalOpen(false);
                      setSelectedRequest({});
                    }}
                  >
                    Submit
                  </div>
                  <div
                    className="bg-gray-500 px-3 py-2 rounded-md text-white hover:bg-gray-600 hover:cursor-pointer"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedRequest({});
                    }}
                  >
                    Cancel
                  </div>
                </div>
              </div>
            )}
            {isModalOpen == 3 && (
              <div className="w-full flex flex-col justify-center items-center">
                <textarea
                  className="w-full border border-gray-300 rounded-md min-h-[200px] p-2"
                  placeholder="Reason for rejection"
                  value={selectedRequest.reason}
                  onChange={(e) => {
                    setSelectedRequest({
                      ...selectedRequest,
                      reason: e.target.value,
                    });
                  }}
                />
                <div className="flex justify-end items-center w-full mt-2 gap-2">
                  <div
                    className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
                    onClick={() => {
                      submitRejectRequest();
                      setIsModalOpen(false);
                      setSelectedRequest({});
                    }}
                  >
                    Submit
                  </div>
                  <div
                    className="bg-gray-500 px-3 py-2 rounded-md text-white hover:bg-gray-600 hover:cursor-pointer"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedRequest({});
                    }}
                  >
                    Cancel
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrganizationFinance;
