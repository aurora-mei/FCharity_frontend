import { getListBankThunk } from "../../redux/helper/helperSlice";
import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, Alert,Flex, Space, Card, Descriptions, Image, Typography,Divider  } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { createWithdrawRequest, updateErrorWithdrawRequest,fetchWithdrawRequestByProject,updateConfirmWithdrawRequest  } from "../../redux/project/projectSlice";
import {Link } from "react-router-dom";
const WithdrawRequestModal = ({form,isOpenWithdrawalModal,setIsOpenWithdrawalModal} ) => {
    const formatCurrency = (amount) => {
        // Ensure amount is a number before formatting
        const numericAmount = Number(amount) || 0;
        return numericAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          // Consider using moment or dayjs here for better formatting options if available in your project
          return new Date(dateString).toLocaleString();
        } catch (e) {
          return 'Invalid Date';
        }
      };
  const listBank = useSelector((state) => state.helper.listBank) || [];
  const [navigateError, setNavigateError] = useState(false);
  const currentWithdrawRequest = useSelector((state) => state.project.currentWithdrawRequest);
  const dispatch = useDispatch();
  const {Title,Text,Paragraph  } = Typography;
  const { Option } = Select;
  const currentProject = useSelector((state) => state.project.currentProject);
    useEffect(() => {
      dispatch(getListBankThunk());
      dispatch(fetchWithdrawRequestByProject(currentProject.project.id));
    }, [dispatch]);
      const handleSubmitBankInfo = (values) => {
        console.log("Bank Info submitted:", values);
        const projectId = currentProject.project.id;
        const { bankBin, accountNumber, accountHolder } = values;
        if (values) {
          dispatch(createWithdrawRequest({ projectId, bankInfo: { bankBin, accountNumber, accountHolder } }))
            .then(() => {
                setIsOpenWithdrawalModal(false);
                fetchWithdrawRequestByProject(projectId);
            })
            .catch((error) => {
              console.error("Failed to update bank info:", error);
            });
        }
      };
      const handleSubmitError = (values) => {
        console.log("Error Info submitted:", currentWithdrawRequest.id);
        const id = currentWithdrawRequest.id;
        const { note } = values;
        if (values) {
          dispatch(updateErrorWithdrawRequest({ id: id, note: "Error report from user: " + note }))
            .then(() => {
                setIsOpenWithdrawalModal(false);
            })
            .catch((error) => {
              console.error("Failed to update error info:", error);
            });
        }
      };
      console.log("currentWithdrawRequest", currentWithdrawRequest);
    return (
        <Modal
        width={800}
        title="Withdrawal Request Details"
        open={isOpenWithdrawalModal}
        onCancel={() => setIsOpenWithdrawalModal(false)}
        footer={null}
      >
        {(() => {
          const status = currentWithdrawRequest.status;

          const renderBankForm = () => (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitBankInfo}
              initialValues={{
                bankBin: currentWithdrawRequest.bankBin,
                accountNumber: currentWithdrawRequest.bankAccount,
                accountHolder: currentWithdrawRequest.bankOwner,
              }}
            >
              <Form.Item
                label="Bank"
                name="bankBin"
                rules={[{ required: true, message: 'Please select your bank.' }]}
              >
                <Select placeholder="Select your bank">
                  {Array.isArray(listBank) &&
                    listBank.map((bank) => (
                      <Option key={bank.id} value={bank.bin}>
                        <Flex>
                          <img
                            src={bank.logo}
                            alt={bank.name}
                            style={{ width: 60, height: 30, marginRight: 8 }}
                          />
                          {`(${bank.bin}) ${bank.name}`}
                        </Flex>
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Account Number"
                name="accountNumber"
                rules={[
                  { required: true, message: 'Please enter your bank account number.' },
                  { pattern: /^[0-9]{6,20}$/, message: 'The account number must be between 6 and 20 digits.' },
                ]}
              >
                <Input placeholder="Enter your bank account number" maxLength={20} />
              </Form.Item>

              <Form.Item
                label="Account Holder Name"
                name="accountHolder"
                rules={[{ required: true, message: 'Please enter the account holder name.' }]}
              >
                <Input placeholder="Enter the account holder name" />
              </Form.Item>

              <Form.Item style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit" >
                  Submit Bank Information
                </Button>
              </Form.Item>
            </Form>
          );

          switch (status) {
            case "PENDING_ADMIN_APPROVAL":
              return (
                <>
                  <p>Your request has been sent to the administrator.</p>
                  <p>Please wait for their approval.</p>
                </>
              );
            case "CONFIRM_SENT":
              return (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>

                  {/* Combined Transaction Details Section */}
                  <Card
                    title={<Title level={5} style={{ margin: 0 }}>Transaction Details</Title>}
                    size="small"
                    bordered={false} // Remove card border for cleaner modal look
                  // Remove box shadow if modal provides enough separation, or add if needed:
                  // style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                  >
                    {/* Bank Information */}
                    <Descriptions bordered size="small" column={1} style={{ marginBottom: '16px' }}>
                      <Descriptions.Item label="Bank BIN">
                        {currentWithdrawRequest?.bankBin || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bank Account">
                        {currentWithdrawRequest?.bankAccount || 'N/A'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Bank Owner">
                        {currentWithdrawRequest?.bankOwner || 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>

                    {/* Transaction Proof Image */}
                    {currentWithdrawRequest?.transactionImage && (
                      <Image
                        width="100%"
                        style={{ maxHeight: '250px', objectFit: 'contain', marginBottom: '16px', borderRadius: '4px', display: 'block' }} // Center image block
                        src={currentWithdrawRequest.transactionImage}
                        alt="Transaction proof"
                        preview={{ // Keep preview options if needed
                          maskClassName: 'custom-image-mask',
                        }}
                      />
                    )}

                    {/* Note and Project Link */}
                    <Descriptions size="small" column={1}>
                      {/* Unbordered Descriptions for Note/Project */}
                      <Descriptions.Item label="Note">
                        {currentWithdrawRequest?.note || <Text type="secondary" italic>No note</Text>}
                      </Descriptions.Item>
                      <Descriptions.Item label="Project">
                        {currentWithdrawRequest?.project?.id ? (
                          <Link to={`/projects/${currentWithdrawRequest.project.id}/details`}>
                            {currentWithdrawRequest?.project?.projectName || 'View Project'}
                          </Link>
                        ) : (
                            currentWithdrawRequest?.project?.projectName || 'N/A'
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* Confirmation / Error Reporting Section */}
                  {!navigateError ? (
                    // Confirmation View
                    <Card
                      title={<Title level={5} style={{ margin: 0 }}>Action Required</Title>}
                      size="small"
                      bordered={false}
                    // style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Alert
                          message="Confirm Transaction"
                          description="A transfer is reported as made. Please check your account balance and confirm receipt of the funds."
                          type="info"
                          showIcon
                        />
                        <Button
                          type="primary"
                          onClick={() => {
                            dispatch(updateConfirmWithdrawRequest(currentWithdrawRequest.id));
                            setIsOpenWithdrawalModal(false);
                          }}
                          style={{ width: 'auto' }} // Button width fits content
                        >
                          Confirm Receipt
                        </Button>
                        <Text type="secondary" style={{ fontSize: '0.85em', marginTop: '8px' }}> {/* Add margin top */}
                          If there is an issue, click here to {' '}
                          <Button type="link" danger size="small" onClick={() => setNavigateError(true)} style={{ padding: 0, height: 'auto', lineHeight: 'inherit' }}>
                            Report Problem
                          </Button>
                          .
                        </Text>
                      </Space>
                    </Card>
                  ) : (
                    // Error Reporting View
                    <Card
                      title={<Title level={5} style={{ margin: 0 }}>Report an Issue</Title>}
                      size="small"
                      bordered={false}
                    // style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                    >
                      <Paragraph>
                        If you encountered an issue with this transaction (e.g., amount incorrect, funds not received), please describe it below.
                      </Paragraph>
                      <Form layout="vertical" onFinish={handleSubmitError} requiredMark={false}>
                        <Form.Item
                          label="Issue Description"
                          name="note" // Matches previous code
                          rules={[{ required: true, message: 'Please describe the issue you encountered.' }]}
                        >
                          <Input.TextArea rows={3} placeholder="Example: Funds not received, amount doesn't match..." />
                        </Form.Item>
                        <Form.Item>
                          <Space>
                            <Button type="primary" danger htmlType="submit">
                              Submit Report
                            </Button>
                            <Button type="default" onClick={() => setNavigateError(false)}>
                              Cancel / Go Back
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    </Card>
                  )}
                </Space>
              );

            case "COMPLETED":
              return (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Transaction Result Card - Modified to include Image */}
                <Card
                    title={<Title level={5} style={{ margin: 0 }}>Transaction Result</Title>}
                    size="small"
                    bordered={false}
                    style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}
                >
                    {/* Success Message */}
                    <Text type="success" style={{ display: 'block', marginBottom: '16px', fontSize: '1.1em', fontWeight: 500 }}>
                        The transaction was completed!
                    </Text>
        
                    {/* Transaction Proof Image (Conditional Rendering) */}
                    {currentWithdrawRequest?.transactionImage && (
                        <>
                            <Image
                                width="100%" // Make image responsive
                                style={{ maxHeight: '250px', objectFit: 'contain', marginBottom: '16px', borderRadius: '4px', display: 'block' }}
                                src={currentWithdrawRequest.transactionImage}
                                alt="Transaction proof"
                                preview={{ // Enable Ant Design's preview
                                    maskClassName: 'custom-image-mask', // Optional custom mask class
                                }}
                            />
                            <Divider style={{ marginTop: 0, marginBottom: 16 }} /> {/* Divider between image and details */}
                        </>
                    )}
        
                    {/* Bank Details */}
                    <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Withdrawal Amount">
                            <b>{formatCurrency(currentWithdrawRequest?.amount)}</b>
                        </Descriptions.Item>
                        <Descriptions.Item label="Withdrawal Date">
                            {formatDate(currentWithdrawRequest?.updatedDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bank BIN">
                            {currentWithdrawRequest?.bankBin || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bank Account">
                            {currentWithdrawRequest?.bankAccount || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bank Owner">
                            {currentWithdrawRequest?.bankOwner || 'N/A'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
        
            </Space>

              )
            case "ERROR":
              return (
                <>
                  {
                    currentWithdrawRequest.note.includes("Error report from user: ") ? (
                      <>
                        <p>Your error report: {currentWithdrawRequest.note.replace("Error report from user: ", "")}</p>
                        <p>Please wait for response from admin.</p>
                      </>
                    ) : (
                      <>
                        <p>{currentWithdrawRequest.note}</p>
                        {renderBankForm()}
                      </>
                    )
                  }
                </>
              );
            default:
                return (
                    <>
                     {renderBankForm()}
                    </>
                  );
          }
        })()}
      </Modal>
    );
    }
export default WithdrawRequestModal;