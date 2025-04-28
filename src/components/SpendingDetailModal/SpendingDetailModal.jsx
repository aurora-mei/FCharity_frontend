import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, Upload, message } from 'antd';
import { UploadOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
// *** ADJUST THE IMPORT PATH TO YOUR ACTUAL REDUX ACTION ***
import { uploadFileMedia } from '../../redux/helper/helperSlice'; // Or wherever your upload action lives

const { Option } = Select;
const { TextArea } = Input;

// Helper function to create initial file list for existing images
const createInitialFileList = (imageUrl) => {
    if (!imageUrl) return [];
    let filename = 'image.png'; // Default filename
    try {
        // Attempt to get filename from URL
        const urlParts = imageUrl.split('/');
        filename = urlParts[urlParts.length - 1] || filename;
        // Remove query parameters if they exist
        filename = filename.split('?')[0];
    } catch (e) {
        console.warn("Could not parse filename from URL:", imageUrl);
    }
    return [
        {
            uid: '-1', // Static unique ID for the initial file display
            name: filename,
            status: 'done', // Mark as already uploaded
            url: imageUrl, // URL used for preview links
            thumbUrl: imageUrl, // URL used for the thumbnail image
        },
    ];
};

const SpendingDetailModal = ({
    isOpen,
    setIsOpen,
    initialData,
    title,
    form,
    onFinish,
    spendingItems = [],
    remainingBalance,
    isLoading = false // Loading state for the main form submission
}) => {
    const dispatch = useDispatch();
    const [isUploading, setIsUploading] = useState(false); // Local loading state for image upload
    const [fileList, setFileList] = useState([]); // State to control the Upload component's display

    useEffect(() => {
        if (isOpen) {
            if (initialData && initialData.id) {
                // --- Editing Mode ---
                console.log('Editing spending detail:', initialData);
                form.setFieldsValue({
                    ...initialData,
                    // Ensure spendingItemId uses the nested object's id if initialData has the full object
                    spendingItemId: initialData.spendingItem?.id || initialData.spendingItemId, // Handle both cases
                    transactionTime: initialData.transactionTime ? dayjs(initialData.transactionTime) : null,
                    // proofImage field value is set here too if exists
                });
                // Populate fileList for the Upload component if an image URL exists
                setFileList(createInitialFileList(initialData.proofImage));
            } else {
                // --- Creating Mode ---
                form.resetFields();
                setFileList([]); // Ensure file list is empty for new entries
            }
        }
        // No need for an 'else' block if Modal has destroyOnClose={true}
    }, [isOpen, initialData, form]);

    const handleCancel = () => {
        setIsOpen(false);
        // Resetting state is handled by useEffect/destroyOnClose
    };

    // --- Custom Upload Logic ---
    const handleUploadChange = async ({ file, fileList: newFileList }) => {
        // Determine the current file (always the last one due to maxCount=1)
        const currentFile = newFileList.length > 0 ? newFileList[newFileList.length - 1] : null;

        // If list is empty (file removed or upload failed previously)
        if (!currentFile) {
            setFileList([]);
            form.setFieldsValue({ proofImage: null }); // Clear the URL in the form
            setIsUploading(false);
            return;
        }

        // Update the displayed file list (max 1 item)
        setFileList([currentFile]);

        // Handle explicit removal by user
        if (file.status === 'removed') {
            form.setFieldsValue({ proofImage: null }); // Clear the URL in the form
            setIsUploading(false);
            console.log("Proof image removed by user.");
            return;
        }

        // Trigger upload only for new files that haven't been processed
        if (currentFile.originFileObj && currentFile.status !== 'uploading' && currentFile.status !== 'done') {
            // Update UI to show 'uploading' status
            setFileList([{ ...currentFile, status: 'uploading' }]);
            setIsUploading(true);

            try {
                console.log("Uploading proof image:", currentFile.name);
                // *** DISPATCH REDUX ACTION TO UPLOAD ***
                const responseUrl = await dispatch(
                    uploadFileMedia({
                        file: currentFile.originFileObj,
                        folderName: "spending_proofs", // Use a specific folder
                        resourceType: "image"
                    })
                ).unwrap(); // Use unwrap to get result or throw error

                console.log("Proof image upload successful, URL:", responseUrl);

                // *** UPDATE FORM FIELD WITH THE RETURNED URL ***
                form.setFieldsValue({ proofImage: responseUrl });

                // Update fileList state to show 'done' status and the actual URL
                setFileList([{
                    ...currentFile, // Keep uid, name etc. from Antd's file object
                    url: responseUrl,
                    thumbUrl: responseUrl, // Use the actual URL for thumbnail too
                    status: 'done',
                }]);
                message.success(`${currentFile.name} uploaded successfully.`);

            } catch (error) {
                console.error("Proof image upload failed:", error);
                message.error(`${currentFile.name} upload failed. ${error?.message || ''}`);
                setFileList([]); // Remove the failed file from the list
                form.setFieldsValue({ proofImage: null }); // Clear the form field
            } finally {
                setIsUploading(false); // Finish uploading state
            }
        } else if (file.status === 'error') {
            // Handle Antd internal upload errors if they weren't caught above
            message.error(`${file.name} upload failed.`);
            setFileList([]); // Remove the file
            form.setFieldsValue({ proofImage: null });
            setIsUploading(false);
        }
        // If status is 'uploading' or 'done', we don't need to do anything here
    };

    // Custom button content for the Upload component
    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            {isUploading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload Proof</div>
        </button>
    );
    const expenseFormatRegex = /^([\p{L}\p{N}\s]+)\s*-\s*(\d+(\.\d+)?)\s+([\p{L}\p{N}\s]+)$/u;

    const validateExpenseFormat = (_, value) => {
        if (!value) {
            return Promise.resolve();
        }
        if (expenseFormatRegex.test(value)) {
            return Promise.resolve();
        }
        // Cập nhật thông báo lỗi ví dụ
        return Promise.reject(new Error('Format must be "Item Name - Quantity Unit", e.g., "Gạo ngon - 10 kg"'));
    };
    return (
        <Modal
            title={title}
            open={isOpen}
            onCancel={handleCancel}
            // Disable OK button if form is submitting OR image is uploading
            confirmLoading={isLoading || isUploading}
            destroyOnClose // Reset form state when modal is closed
            footer={[
                <Button key="back" onClick={handleCancel} disabled={isUploading || isLoading}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading || isUploading} // Show loading indicator
                    onClick={() => form.submit()}
                    disabled={isUploading} // Disable submit button during image upload
                >
                    {initialData && initialData.id ? 'Update' : 'Create'}
                </Button>,
            ]}
            width={600}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} name="spendingDetailForm">
                {/* Hidden field for ID (keep as is) */}
                {initialData && initialData.id && (
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                )}

                {/* Other Form Items (Spending Item, Amount, etc. - keep as is, add disabled prop) */}
                <Form.Item
                    name="spendingItemId"
                    label="Spending Item"
                    rules={[{ required: true, message: 'Please select a spending item!' }]}
                >
                    <Select placeholder="Select an item" allowClear disabled={isUploading}>
                        {spendingItems && spendingItems.map(item => (
                            <Option key={item.id} value={item.id}>
                                {item.itemName || `Item ID: ${item.id}`}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Expense Content"
                    rules={[
                        { required: true, message: 'Please enter expense content!' },
                        { validator: validateExpenseFormat }
                    ]}
                    // Cập nhật ví dụ trong help/placeholder
                    help="Format: Item Name - Quantity Unit, e.g., Gạo ST25 - 5 kg"
                >
                    <Input
                        placeholder="E.g., Xi măng Hà Tiên - 50 kg"
                        disabled={isUploading}
                    />
                </Form.Item>
                <Form.Item
                    name="amount"
                    label="Amount (VND)"
                    rules={[
                        { required: true, message: 'Please input the amount!' },
                        { type: 'number', min: 0, message: 'Amount must be a positive number!' },
                        ...(initialData == null
                            ? [{ max: remainingBalance, message: `Amount must not exceed ${remainingBalance.toLocaleString()} VND!` }]
                            : []
                        )
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        max={initialData == null ? remainingBalance : undefined} // UI restriction only when creating
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        disabled={isUploading}
                        placeholder="Enter the amount spent"
                    />
                </Form.Item>


                <Form.Item name="transactionTime" label="Transaction Time">
                    <DatePicker /*...*/ style={{ width: '100%' }} disabled={isUploading} />
                </Form.Item>

                {/* --- Proof Image Upload --- */}
                <Form.Item
                    label="Proof Image" // Label for the section
                    // Name is still important for form submission structure, even if value is set manually
                    name="proofImage"
                // No 'rules' needed here as it's optional and value comes from upload
                >
                    <Upload
                        listType="picture-card" // Display style
                        fileList={fileList} // Control the displayed files
                        maxCount={1} // Restrict to one file
                        onChange={handleUploadChange} // Use our custom handler
                        accept="image/*" // Allow only images
                        // Prevent Antd's default upload mechanism entirely
                        beforeUpload={() => false}
                        disabled={isLoading || isUploading} // Disable during main submit or image upload
                    >
                        {/* Show upload button only when fileList is empty */}
                        {fileList.length === 0 ? uploadButton : null}
                    </Upload>
                    {/* This hidden input can be removed now as form.setFieldsValue updates the value */}
                    {/* <Form.Item name="proofImage" hidden><Input /></Form.Item> */}
                </Form.Item>

            </Form>
        </Modal>
    );
}

export default SpendingDetailModal;