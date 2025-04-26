import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, DatePicker, Button, Typography, Upload, Skeleton, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
// Use either moment or dayjs consistently
// import moment from 'moment';
import dayjs from 'dayjs'; // Using dayjs as it's imported and used
import { useDispatch } from 'react-redux';
import { uploadFileMedia } from '../../redux/helper/helperSlice'; // Adjust path

const { Title, Text } = Typography;
const { TextArea } = Input;

// --- The Modal Component (React JS) ---
const EndPhaseModal = ({
    isEndPhase,
    isOpen,
    setIsOpen,
    phase, // This object should ideally contain id, projectId, title, startTime, endTime (planned)
    onSubmit, // Expects the final payload for the API call
    loading,
}) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const [imageList, setImageList] = useState([]);
    const [videoList, setVideoList] = useState([]);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            form.resetFields();
            setImageList([]);
            setVideoList([]);
        } else if (phase) {
            console.log("Phase data:", phase);
            form.setFieldsValue({
                endTime: dayjs(),
                content: phase?.phase?.content,    // Clear notes field
            });

            const imageUrls = phase?.attachments.filter(x => x.match(/\.(jpeg|jpg|gif|png|bmp|svg)$/i));
            const videoUrls = phase?.attachments.filter(x => x.match(/\.(mp4|avi|mov|mkv)$/i));

            setImageList(convertToUploadFileList(imageUrls));
            setVideoList(convertToUploadFileList(videoUrls));
        }
    }, [isOpen, phase, form]);

    // --- Upload Handlers (Keep the improved logic) ---
    const handleImageChange = async ({ fileList: newFileList }) => {
        setImageList(newFileList);
        const lastFile = newFileList.find(f => f.uid === newFileList[newFileList.length - 1]?.uid && !f.status);
        if (!lastFile || !lastFile.originFileObj) return;
        setImageList(prevList => prevList.map(item => item.uid === lastFile.uid ? { ...item, status: 'uploading' } : item));
        setIsUploadingImage(true);
        try {
            const responseUrl = await dispatch(uploadFileMedia({ file: lastFile.originFileObj, folderName: "images", resourceType: "image" })).unwrap();
            message.success(`Uploaded ${lastFile.name}`);
            setImageList(prevList => prevList.map(item => item.uid === lastFile.uid ? { ...item, status: 'done', url: responseUrl } : item));
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error(`Upload failed for ${lastFile.name}`);
            setImageList(prevList => prevList.map(item => item.uid === lastFile.uid ? { ...item, status: 'error' } : item));
        } finally { setIsUploadingImage(false); }
    };

    const handleVideoChange = async ({ fileList: newFileList }) => {
        setVideoList(newFileList);
        const lastFile = newFileList.find(f => f.uid === newFileList[newFileList.length - 1]?.uid && !f.status);
        if (!lastFile || !lastFile.originFileObj) return;
        setVideoList(prevList => prevList.map(item => item.uid === lastFile.uid ? { ...item, status: 'uploading' } : item));
        setIsUploadingVideo(true);
        try {
            const responseUrl = await dispatch(uploadFileMedia({ file: lastFile.originFileObj, folderName: "videos", resourceType: "video" })).unwrap();
            message.success(`Uploaded ${lastFile.name}`);
            setVideoList(prevList => prevList.map(item => item.uid === lastFile.uid ? { ...item, status: 'done', url: responseUrl } : item));
        } catch (error) {
            console.error("Error uploading video:", error);
            message.error(`Upload failed for ${lastFile.name}`);
            setVideoList(prevList => prevList.map(item => item.uid === lastFile.uid ? { ...item, status: 'error' } : item));
        } finally { setIsUploadingVideo(false); }
    };

    const handleRemoveFile = ({ file, type }) => {
        if (type === "images") { setImageList(prevList => prevList.filter(item => item.uid !== file.uid)); }
        else if (type === "videos") { setVideoList(prevList => prevList.filter(item => item.uid !== file.uid)); }
        return true;
    };

    // --- Main Submit Handler ---
    const handleOk = async () => {
        try {
            if (isUploadingImage || isUploadingVideo || imageList.some(f => f.status === 'uploading') || videoList.some(f => f.status === 'uploading')) {
                message.warning('Please wait for uploads to complete.');
                return;
            }

            const formValues = await form.validateFields(); // Gets { actualEndTime, completionNotes }

            const finalImageUrls = imageList.filter(f => f.status === 'done' && f.url).map(f => f.url);
            const finalVideoUrls = videoList.filter(f => f.status === 'done' && f.url).map(f => f.url);

            const submissionData = {
                phase: {
                    id: phase?.phase?.id, // ID of the timeline record to update
                    projectId: phase?.phase?.projectId, // Include if needed by API for validation/context
                    title: phase?.phase?.title, // Usually not changed when ending a phase
                    startTime: phase?.phase?.startTime, // Usually not changed when ending a phase
                    content: formValues.content,
                },
                imageUrls: finalImageUrls,
                videoUrls: finalVideoUrls
            };
            if (isEndPhase) submissionData.phase.endTime = formValues.endTime.toISOString();
            console.log("Submitting Data for End Phase:", submissionData);

            // Call parent onSubmit function with the prepared data
            await onSubmit(submissionData);

        } catch (info) {
            if (info.errorFields) {
                console.log('Form Validation Failed:', info);
                message.error('Please fill in all required fields.');
            } else {
                console.error('Submission Error:', info);
                message.error('An error occurred during submission preparation.');
            }
        }
    };
    const convertToUploadFileList = (urls) => {
        return urls.map((url, index) => ({
            uid: `-${index}`,       // Unique ID, phải khác với file mới upload
            name: url.split('/').pop(), // Tên file
            status: 'done',
            url,                    // Hiển thị ảnh/video
        }));
    };

    // --- Render Logic (JSX) ---
    return (
        <Modal
            title={<Title level={4}>{isEndPhase ? "Complete & Report" : "Update"} Phase: {phase?.phase.title || 'Loading...'}</Title>}
            open={isOpen}
            onOk={handleOk}
            onCancel={() => setIsOpen(false)}
            confirmLoading={loading}
            destroyOnClose
            maskClosable={false}
            okText={`${isEndPhase ? "Mark as Completed" : "Update Phase"}`}
            cancelText="Cancel"
            width={700}
        >
            {!phase ? (
                <Skeleton active paragraph={{ rows: 6 }} title={false} />
            ) : (
                <Form form={form} layout="vertical" name="end_phase_form">
                    {/* Display Original Planned End Date */}
                    {isEndPhase && (
                        <>
                            <Form.Item label="Actual Start Date & Time">
                                <Text type="secondary">
                                    {phase.phase.startTime
                                        ? dayjs(phase.phase.startTime).format('YYYY-MM-DD HH:mm A') // Formatted display
                                        : 'Not Set'}
                                </Text>
                            </Form.Item>

                            <Form.Item
                                name="endTime" // Collects the actual end time
                                label="Actual Completion Date & Time"
                                rules={[{ required: true, message: 'Please select the actual completion date!' }]}
                            >
                                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                            </Form.Item>
                        </>
                    )}

                    {/* Completion Notes Input */}
                    <Form.Item
                        name="content" // Collects the notes
                        label={`${isEndPhase ? "Completion" : "Goals"} Summary / Notes`}
                        rules={[
                            { required: true, message: `Please provide a ${isEndPhase ? "completion" : "goals"} summary!` },
                            { min: 10, message: 'Notes must be at least 10 characters.' }
                        ]}
                    >
                        <TextArea rows={4} placeholder="Describe the outcome, challenges met, achievements..." />
                    </Form.Item>

                    {/* --- Upload Sections (No changes needed here) --- */}
                    <Form.Item label="Upload Images (Optional)">
                        <Upload multiple listType="picture-card" loading={isUploadingImage} fileList={imageList} beforeUpload={() => false} accept="image/*" onChange={handleImageChange} onRemove={(file) => handleRemoveFile({ file, type: "images" })}>
                            Upload Image
                        </Upload>
                    </Form.Item>
                    <Form.Item label="Upload Videos (Optional)">
                        <Upload multiple listType="picture-card" loading={isUploadingVideo} fileList={videoList} beforeUpload={() => false} accept="video/*" onChange={handleVideoChange} onRemove={(file) => handleRemoveFile({ file, type: "videos" })}>
                            Upload Video
                        </Upload>
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

// --- PropTypes Definition ---
EndPhaseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    phase: PropTypes.shape({
        id: PropTypes.string.isRequired,
        projectId: PropTypes.string, // Good to include if needed for API call
        title: PropTypes.string,     // For display
        startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), // If needed by API
        endTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]), // Planned end time for display
        // No need to require 'content' or 'status' in the incoming phase prop for *ending* it
    }), // Can be null while loading
    onSubmit: PropTypes.func.isRequired, // Receives data structure matching API expectation
    loading: PropTypes.bool,
};

export default EndPhaseModal;