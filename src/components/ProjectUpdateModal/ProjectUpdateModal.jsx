import { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, Upload, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UploadOutlined } from "@ant-design/icons";
import { updateProjectThunk, fetchProjectById } from "../../redux/project/projectSlice";
import styled from "styled-components";
// Removed moment import as dayjs is used
import { uploadFileMedia } from "../../redux/helper/helperSlice";
import { useParams } from "react-router-dom";
import dayjs from "dayjs"; // Ensure dayjs is imported

// --- StyledButton component remains the same ---
const StyledButton = styled(Button)`
    background-color:green;
    border-radius: 0.5rem;
    color: white;
   font-size: 1rem !important;
    font-weight: 500;
    padding:1rem;
    // box-shadow:rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
    &:hover{
        box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 8px 0px;
        background-color: green !important;
        border-color: black !important;
        color: white !important;
    }
`;

const ProjectUpdateModal = ({ projectData, form, isOpenModal, setIsOpenModal }) => {
    // --- States and Hooks remain the same ---
    const [editable, setEditable] = useState(false); // Note: editable is defined but not used for disabling DatePickers, using disabledDate instead
    const [initialLoading, setInitialLoading] = useState(true);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const [attachments, setAttachments] = useState({ images: [], videos: [] });
    const [uploading, setUploading] = useState(false);
    const isRemovingFile = useRef(false);

    // --- useEffect hooks remain the same ---
    useEffect(() => {
        setInitialLoading(true);
        dispatch(fetchProjectById(projectId));
    }, [dispatch, projectId]);

    useEffect(() => {
        if (projectData?.project) {
            initFormData();
        }
    }, [projectData]);

    // --- initFormData remains mostly the same ---
    const initFormData = () => {
        const project = projectData.project;
        const attachmentsData = projectData.attachments || []; // Renamed to avoid conflict with state

        // Lọc ra URL hình ảnh
        const imageUrls = attachmentsData
            .filter(att => att.imageUrl?.match(/\.(jpeg|jpg|png|gif)$/i))
            .map(att => att.imageUrl);

        // Lọc ra URL video
        const videoUrls = attachmentsData
            .filter(att => att.imageUrl?.match(/\.(mp4|webm|ogg)$/i))
            .map(att => att.imageUrl);

        form.setFieldsValue({
            projectName: project.projectName || "",
            projectDescription: project.projectDescription || "",
            // Ensure values are Dayjs objects for DatePicker
            plannedStartTime: project.plannedStartTime ? dayjs(project.plannedStartTime) : null,
            plannedEndTime: project.plannedEndTime ? dayjs(project.plannedEndTime) : null,
            categoryId: project.categoryId || null,
            categoryName: project.categoryName || null,
            tagIds: projectData.projectTags?.map(t => t.tag.id) || [],
            location: project.location || "",
            projectStatus: project.projectStatus || "",
            email: project.email || "",
            phone: project.phoneNumber || "",
            // Form values for 'images' and 'videos' are usually managed by Upload component's fileList, not directly set here unless needed for initial display
        });

        // Initialize attachments state correctly
        setAttachments({
            images: imageUrls,
            videos: videoUrls,
        });

        // Initialize uploaded state if needed (e.g., for displaying initial files in Upload)
        // This part seems slightly off in the original, let's adjust to sync with Upload's fileList
        setUploadedImages(imageUrls.map((url, index) => ({
            uid: `initial-img-${index}`,
            name: `Image ${index + 1}`,
            status: 'done', // Important for Upload component
            url: url,
        })));
         setUploadedVideos(videoUrls.map((url, index) => ({
            uid: `initial-vid-${index}`,
            name: `Video ${index + 1}`,
            status: 'done', // Important for Upload component
            url: url,
        })));


        setInitialLoading(false);
    };


    // --- File handling functions remain the same ---
    const handleImageChange = async ({ fileList }) => {
        if (isRemovingFile.current) {
            isRemovingFile.current = false; // Reset flag after removal check
            setUploadedImages(fileList); // Update state to reflect removal in UI
             setAttachments(prev => ({
                ...prev,
                images: fileList.map(f => f.url || f.response) // Update attachments based on remaining fileList
            }));
            return;
        }

        // Filter out files that are already uploaded or currently uploading
        const newFiles = fileList.filter(file => !file.url && !file.status);
        if (newFiles.length === 0) {
            setUploadedImages(fileList); // Ensure fileList state is updated even if no new files
            return;
        }

        setUploading(true);
        const latestFile = newFiles[newFiles.length - 1]; // Process the newest file added

        // Update UI optimistically
        setUploadedImages(fileList);

        try {
            const response = await dispatch(
                uploadFileMedia({
                    file: latestFile.originFileObj,
                    folderName: "images",
                    resourceType: "image",
                })
            ).unwrap();

             // Update the specific file item in the state with the URL and done status
            const updatedFileList = fileList.map(file => {
                if (file.uid === latestFile.uid) {
                    return { ...file, url: response, status: 'done', response }; // Add response if needed later
                }
                return file;
            });
            setUploadedImages(updatedFileList);


            // Update the main attachments state
            setAttachments((prev) => ({
                images: [...prev.images, response],
                videos: prev.videos || [],
            }));

            message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error(`Upload failed for ${latestFile.name}`);
             // Update the specific file item in the state with error status
             const updatedFileList = fileList.map(file => {
                if (file.uid === latestFile.uid) {
                    return { ...file, status: 'error' };
                }
                return file;
            });
            setUploadedImages(updatedFileList);
        } finally {
             // Check if any other files are still uploading before setting uploading to false
            const stillUploading = fileList.some(f => f.status === 'uploading');
            if (!stillUploading) {
                setUploading(false);
            }
        }
    };

    const handleVideoChange = async ({ fileList }) => {
         if (isRemovingFile.current) {
            isRemovingFile.current = false; // Reset flag
            setUploadedVideos(fileList); // Update state to reflect removal
             setAttachments(prev => ({
                ...prev,
                videos: fileList.map(f => f.url || f.response) // Update attachments based on remaining fileList
            }));
            return;
        }

        const newFiles = fileList.filter(file => !file.url && !file.status);
         if (newFiles.length === 0) {
            setUploadedVideos(fileList);
            return;
        }

        setUploading(true);
        const latestFile = newFiles[newFiles.length - 1];

        // Update UI optimistically
        setUploadedVideos(fileList);


        try {
            const response = await dispatch(uploadFileMedia({
                file: latestFile.originFileObj,
                folderName: "videos",
                resourceType: "video"
            })).unwrap();

             // Update the specific file item in the state
            const updatedFileList = fileList.map(file => {
                if (file.uid === latestFile.uid) {
                    return { ...file, url: response, status: 'done', response };
                }
                return file;
            });
            setUploadedVideos(updatedFileList);


            setAttachments((prev) => ({
                videos: [...prev.videos, response],
                images: prev.images || []
            }));

            message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
            console.error("Error uploading video:", error);
            message.error(`Upload failed for ${latestFile.name}`);
             // Update the specific file item in the state with error status
             const updatedFileList = fileList.map(file => {
                if (file.uid === latestFile.uid) {
                    return { ...file, status: 'error' };
                }
                return file;
            });
            setUploadedVideos(updatedFileList);
        } finally {
             const stillUploading = fileList.some(f => f.status === 'uploading');
            if (!stillUploading) {
                setUploading(false);
            }
        }
    };

     const handleRemoveFile = async (file, type) => {
        // Set the flag *before* updating state that triggers onChange
        isRemovingFile.current = true;

        try {
            // Find the URL to remove (might be in file.url or file.response depending on upload state)
            const urlToRemove = file.url || file.response;
            if (!urlToRemove) {
                 console.warn("File URL not found for removal:", file);
                 // Still need to update the UI list even if URL is missing
                 if (type === 'images') {
                    setUploadedImages(prev => prev.filter(f => f.uid !== file.uid));
                 } else {
                    setUploadedVideos(prev => prev.filter(f => f.uid !== file.uid));
                 }
                 isRemovingFile.current = false; // Reset flag
                 return; // Exit if no URL to remove from attachments
            }


            console.log(`Attempting to remove ${type}:`, urlToRemove);

            if (type === "images") {
                const updatedImages = attachments.images.filter((image) => image !== urlToRemove);
                setAttachments((prev) => ({
                    ...prev,
                    images: updatedImages,
                }));
                 // Update the fileList state for the Upload component
                 setUploadedImages(prev => prev.filter(f => f.uid !== file.uid));
            } else { // videos
                const updatedVideos = attachments.videos.filter((video) => video !== urlToRemove);
                setAttachments((prev) => ({
                    ...prev,
                    videos: updatedVideos,
                }));
                 // Update the fileList state for the Upload component
                 setUploadedVideos(prev => prev.filter(f => f.uid !== file.uid));
            }

             console.log("Updated attachments after removal:", attachments);
            message.success(`Removed ${file.name}`);

        } catch (error) {
            console.error("Error removing file:", error);
            message.error(`Removal failed for ${file.name}`);
        } finally {
             // It's important to reset the flag *after* the state updates that might trigger onChange have potentially run,
             // though ideally onChange shouldn't run if we return false from beforeRemove.
             // Using a small timeout can be a safeguard, but ideally handleRemoveFile logic completes fully before onChange check.
             // Let's reset it directly here for now. If issues persist, a timeout might be needed.
            // setTimeout(() => { isRemovingFile.current = false; }, 0);
             // No, the flag is checked at the *start* of onChange. Resetting it here is fine.
             // The key is setting it *before* the state update causing the list change.
        }
        // Return true to allow Ant Design's default removal behavior from the list *after* our logic runs
        // Or return false if we solely manage the list via state (which we are doing with setUploadedImages/Videos)
        return false; // Prevents default antd removal, we control state fully
    };


    const handleUpdate = async (values) => {
        // Ensure dates are formatted correctly (ISO string)
         const plannedStartTimeISO = values.plannedStartTime ? values.plannedStartTime.toISOString() : null;
         const plannedEndTimeISO = values.plannedEndTime ? values.plannedEndTime.toISOString() : null;


        const updatedProject = {
            id: projectData.project.id,
            projectName: values.projectName,
            phoneNumber: values.phone,
            email: values.email,
            projectDescription: values.projectDescription,
            plannedStartTime: plannedStartTimeISO,
            plannedEndTime: plannedEndTimeISO,
            location: values.location,
            projectStatus: projectData.project.projectStatus, // Assuming status doesn't change here
            // Use the latest state of attachments
            imageUrls: attachments.images || [],
            videoUrls: attachments.videos || [],
            categoryId: projectData.project.categoryId, // Assuming category doesn't change here
            tagIds: values.tagIds || [], // Assuming tags don't change here, or get from form 'values' if they can
        };
        console.log("Submitting Updated Project Data:", updatedProject);

        try {
             await dispatch(updateProjectThunk(updatedProject)).unwrap();
             message.success("Project updated successfully!");
             setIsOpenModal(false);
             // Optionally re-fetch data or update local state further if needed
        } catch (error) {
             console.error("Failed to update project:", error);
             message.error("Failed to update project. Please try again.");
        }

    };

    // --- Helper functions for DatePickers ---
    const disabledStartDate = (current) => {
        // Can not select days before today
        return current && current < dayjs().startOf('day');
    };

    const disabledEndDate = (current) => {
        const startTime = form.getFieldValue('plannedStartTime');
        if (!startTime) {
            // If start time is not selected, disable dates before today as well (optional)
            return current && current < dayjs().startOf('day');
        }
        // Can not select days before the selected start time day
        // Use startOf('day') to allow selecting the same day
        return current && current < startTime.startOf('day');
    };
     // Function to handle changes in Start Date to potentially clear End Date
     const handleStartDateChange = (date) => {
        const endDate = form.getFieldValue('plannedEndTime');
        // If an end date exists and the new start date is after it, clear the end date
        if (endDate && date && date.isAfter(endDate)) {
            form.setFieldsValue({ plannedEndTime: null });
        }
    };

    return (
        <Modal
            title={`${projectData?.project?.projectName || 'Project'} - Update`} // Added safety check
            centered
            open={isOpenModal}
            footer={null} // Keep custom footer if needed, or null
            onCancel={() => setIsOpenModal(false)}
            // Increase width if content is cramped
             width={800} // Example width adjustment
        >
            {initialLoading ? (
                 <div>Loading...</div> // Or use Antd Spin
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                    initialValues={{ // Set initial values directly in Form for better control
                        projectName: projectData.project.projectName || "",
                        projectDescription: projectData.project.projectDescription || "",
                        plannedStartTime: projectData.project.plannedStartTime ? dayjs(projectData.project.plannedStartTime) : null,
                        plannedEndTime: projectData.project.plannedEndTime ? dayjs(projectData.project.plannedEndTime) : null,
                        categoryName: projectData.project.categoryName || null,
                        tagIds: projectData.projectTags?.map(t => t.tag.id) || [],
                        location: projectData.project.location || "",
                        email: projectData.project.email || "",
                        phone: projectData.project.phoneNumber || "",
                        // images/videos initial value is handled by Upload's fileList prop
                    }}
                >
                    {/* --- Form Items mostly the same --- */}
                    <Form.Item label="Project Name" name="projectName" rules={[{ required: true, message: "Project Name is required" }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Valid Email is required" }]}>
                        <Input type="email" />
                    </Form.Item>

                    <Form.Item label="Phone Number" name="phone" rules={[{ required: true, pattern: /^[0-9]+$/, message: "Phone Number must contain only digits" }, {min: 10, max: 15, message:"Phone number must be between 10 and 15 digits"}]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Project Description" name="projectDescription" rules={[{ required: true, message: "Please enter a project description" }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item label="Planned Start Time" name="plannedStartTime" rules={[{ required: true, message: "Start Time is required" }]}>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss" // Explicit format
                            disabledDate={disabledStartDate} // Disable past dates
                           // Removed 'disabled' prop, controlled by disabledDate now
                             onChange={handleStartDateChange} // Add onChange handler
                        />
                    </Form.Item>

                    <Form.Item
                        label="Planned End Time"
                        name="plannedEndTime"
                        rules={[
                             { required: true, message: "End Time is required" },
                             // Add custom validator rule
                             ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startTime = getFieldValue('plannedStartTime');
                                    if (!value || !startTime) {
                                        return Promise.resolve(); // Don't validate if either is empty
                                    }
                                    if (value.isAfter(startTime)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('End Time must be after Start Time!'));
                                },
                            }),
                        ]}
                         dependencies={['plannedStartTime']} // Make validation depend on startTime
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss" // Explicit format
                            disabledDate={disabledEndDate} // Disable dates before start date
                             // Removed 'disabled' prop
                             // Consider disabling time as well if needed: disabledTime={disabledEndTime}
                        />
                    </Form.Item>


                    <Form.Item label="Category" name="categoryName">
                         {/* Category likely shouldn't be editable here, keep disabled */}
                        <Select placeholder="Select a category" disabled={true}>
                            {/* Optionally populate if needed, but seems read-only */}
                            <Select.Option value={projectData?.project?.categoryId}>
                                 {projectData?.project?.categoryName}
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Tags" name="tagIds" >
                        {/* Tags likely shouldn't be editable here, keep disabled */}
                        <Select
                            mode="multiple"
                            placeholder="Select tags"
                            allowClear
                            disabled={true}
                            options={projectData?.projectTags?.map(taggable => ({
                                label: taggable.tag.tagName,
                                value: taggable.tag.id,
                            })) || []} // Ensure options is always an array
                        />
                    </Form.Item>

                    <Form.Item label="Location" name="location">
                        {/* Location likely shouldn't be editable here, keep readOnly */}
                        <Input readOnly />
                    </Form.Item>

                     {/* --- Upload components --- */}
                     {/* Use uploadedImages/Videos state for fileList */}
                    <Form.Item label="Images" name="images" valuePropName="fileList" getValueFromEvent={(e) => { // Ensure form links correctly with Upload state
                            if (Array.isArray(e)) { return e; } return e && e.fileList;
                        }}
                          rules={[{ required: true, message: "At least one image is required" },
                           // Custom rule to check if the underlying attachments array is empty
                                () => ({
                                    validator(_, value) { // value here is the fileList from Upload
                                        if (attachments.images && attachments.images.length > 0) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('At least one image is required'));
                                    },
                                })
                          ]}
                          >
                        <Upload
                            multiple
                            listType="picture-card" // Use picture-card for better preview
                             // Use component's state for fileList
                            fileList={uploadedImages}
                            beforeUpload={() => false} // We handle upload manually
                            accept="image/*"
                            onChange={handleImageChange}
                            onRemove={(file) => handleRemoveFile(file, "images")} // Pass type
                             // beforeRemove={file => handleRemoveFile(file, 'images')} // Alternative way
                        >
                             {/* Limit number of uploads if desired */}
                             {uploadedImages.length >= 8 ? null : <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                        </Upload>
                    </Form.Item>

                     <Form.Item label="Videos" name="videos" valuePropName="fileList" getValueFromEvent={(e) => {
                           if (Array.isArray(e)) { return e; } return e && e.fileList;
                        }}
                         >
                         <Upload
                            multiple
                            listType="picture-card"
                            fileList={uploadedVideos}
                            beforeUpload={() => false}
                            accept="video/*"
                            onChange={handleVideoChange}
                            onRemove={(file) => handleRemoveFile(file, "videos")} // Pass type
                             // beforeRemove={file => handleRemoveFile(file, 'videos')}
                        >
                             {uploadedVideos.length >= 3 ? null : <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                         {/* Use the StyledButton */}
                        <StyledButton type="primary" htmlType="submit" block disabled={uploading || initialLoading}>
                            {uploading ? "Uploading..." : "Update Project"}
                        </StyledButton>
                    </Form.Item>
                </Form>
             )}
        </Modal>
    );
}
export default ProjectUpdateModal;