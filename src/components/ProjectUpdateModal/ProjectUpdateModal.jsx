
import { useState, useEffect,useRef } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, Upload, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UploadOutlined } from "@ant-design/icons";
import { updateProjectThunk, fetchProjectById } from "../../redux/project/projectSlice";
import styled from "styled-components";
import moment from 'moment-timezone';
import { uploadFileMedia } from "../../redux/helper/helperSlice";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

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
    const [editable, setEditable] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedVideos, setUploadedVideos] = useState([]);
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const [attachments, setAttachments] = useState({ images: [], videos: [] });
    const [uploading, setUploading] = useState(false);
    const isRemovingFile = useRef(false);
    useEffect(() => {
        setInitialLoading(true);
        dispatch(fetchProjectById(projectId));
    }, [dispatch, projectId]);

    useEffect(() => {
        if (projectData?.project) {
            initFormData();
        }
    }, [projectData]);

    const initFormData = () => {
        const project = projectData.project;
        const attachments = projectData.attachments || [];

        // Lọc ra URL hình ảnh
        const imageUrls = attachments
            .filter(att => att.imageUrl?.match(/\.(jpeg|jpg|png|gif)$/i))
            .map(att => att.imageUrl);

        // Lọc ra URL video
        const videoUrls = attachments
            .filter(att => att.imageUrl?.match(/\.(mp4|webm|ogg)$/i))
            .map(att => att.imageUrl);
      
        form.setFieldsValue({
            projectName: project.projectName || "",
            projectDescription: project.projectDescription || "",
            plannedStartTime: dayjs(project.plannedStartTime),
            plannedEndTime: dayjs(project.plannedEndTime),
            categoryId: project.categoryId || null,
            categoryName: project.categoryName || null,
            tagIds: projectData.projectTags?.map(t => t.tag.id) || [],
            location: project.location || "",
            projectStatus: project.projectStatus || "",
            email: project.email || "",
            phone: project.phoneNumber || "",
            images: imageUrls.map((image, index) => ({
                uid: index.toString(),
                name: `Image ${index + 1}`,
                url: image,
            }) || [])
        });
        setAttachments({
            images: imageUrls,
            videos: videoUrls,
        });

        setInitialLoading(false);
    };


    const handleImageChange = async ({ fileList }) => {
        if (isRemovingFile.current) {
            isRemovingFile.current = false;
            return;
        }
        if (fileList.length === 0) return;
    
        setUploading(true);
        const latestFile = fileList[fileList.length - 1];
    
        try {
            const response = await dispatch(
                uploadFileMedia({
                    file: latestFile.originFileObj,
                    folderName: "images",
                    resourceType: "image",
                })
            ).unwrap();
    
            latestFile.url = response;
    
            setUploadedImages((prevImages) => {
                const uploadedImages = [...prevImages, response];
            
                setAttachments((prev) => ({
                    images: [...prev.images, response], // ✅ chỉ thêm 1 ảnh mới
                    videos: prev.videos || [],
                }));
            
                form.setFieldsValue({ images: uploadedImages });
            
                return uploadedImages;
            });
            
    
            message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error(`Upload failed for ${latestFile.name}`);
        }
    
        setUploading(false);
    };
    
    const handleVideoChange = async ({ fileList }) => {
        if (isRemovingFile.current) {
            isRemovingFile.current = false;
            return;
        }
        if (fileList.length === 0) return;
    
        setUploading(true);
        const latestFile = fileList[fileList.length - 1];
    
        try {
            const response = await dispatch(uploadFileMedia({
                file: latestFile.originFileObj,
                folderName: "videos",
                resourceType: "video"
            })).unwrap();
    
            latestFile.url = response;
    
            setUploadedVideos((prevVideos) => {
                const uploadedVideos = [...prevVideos, response];
    
                setAttachments((prev) => ({
                    videos: [...prev.videos, response], // hoặc dùng Set() để tránh trùng
                    images: prev.images || []
                }));
    
                form.setFieldsValue({ videos: uploadedVideos });
    
                return uploadedVideos;
            });
    
            message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
            console.error("Error uploading video:", error);
            message.error(`Upload failed for ${latestFile.name}`);
        }
    
        setUploading(false);
    };
    
    const handleRemoveFile = async ({ file, type }) => {
        try {
            isRemovingFile.current = true;
            console.log("Deleting file:", file, type);
            if (type === "images") {
                setUploadedImages(() => {
                    const updatedImages = attachments.images.filter((image) => image !== file.url);
                    console.log("updatedImages", updatedImages);
                    setAttachments((prev) => ({
                        images: updatedImages,
                        videos: prev.videos
                    }));
                    return updatedImages;
                });
            } else {
                setUploadedVideos(() => {
                    const updatedVideos =  attachments.videos.filter((video) => video !== file.url);
                    setAttachments((prev) => ({
                        images: prev.images,
                        videos: updatedVideos,
                    }));
                    return updatedVideos;
                });
            }
            console.log("attachments", attachments);
            message.success(`Deleted ${file.name}`);
        } catch (error) {
            console.error("Error deleting file:", error);
            message.error(`Delete failed for ${file.name}`);
        }
    };
    const handleUpdate = async (values) => {
        const updatedProject = {
            id: projectData.project.id,
            projectName: values.projectName,
            phoneNumber: values.phone,
            email: values.email,
            projectDescription: values.projectDescription,
            plannedStartTime: values.plannedStartTime.toISOString(),
            plannedEndTime: values.plannedEndTime.toISOString(),
            location: values.location,
            projectStatus: projectData.project.projectStatus,
            imageUrls: attachments.images,
            videoUrls: attachments.videos,
            categoryId: projectData.project.categoryId,
            tagIds: values.tagIds
        };
        console.log("updatedProject", updatedProject);
        dispatch(updateProjectThunk(updatedProject));
        setIsOpenModal(false);
    }
    return (
        <Modal
            title={`${projectData.project.projectName} - Update`}
            centered
            open={isOpenModal}
            footer={null}
            onCancel={() => {
                setIsOpenModal(false);
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
            >
                <Form.Item label="Project Name" name="projectName" rules={[{ required: true, message: "Project Name is required" }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Valid Email is required" }]}>
                    <Input type="email" />
                </Form.Item>

                <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: "Phone Number is required" }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Project Description" name="projectDescription" rules={[{ required: true, message: "Please enter a project description" }]}>
                    <Input.TextArea />
                </Form.Item>

                <Form.Item label="Planned Start Time" name="plannedStartTime" rules={[{ required: true, message: "Start Time is required" }]}>
                    <DatePicker showTime disabled={editable} />
                </Form.Item>

                <Form.Item label="Planned End Time" name="plannedEndTime" rules={[{ required: true, message: "End Time is required" }]}>
                    <DatePicker showTime disabled={editable} />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="categoryName"
                >
                    <Select placeholder="Select a category" disabled={true}>
                    </Select>
                </Form.Item>

                {/* Tags */}
                <Form.Item
                    label="Tags"
                    name="tagIds"
                >
                    <Select
                        mode="multiple"
                        placeholder="Select tags"
                        allowClear
                        disabled
                        options={projectData.projectTags.map(taggable => ({
                            label: taggable.tag.tagName,
                            value: taggable.tag.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item label="Location" name="location" >
                    <Input readOnly />
                </Form.Item>
                <Form.Item label="Images" name="images" rules={[{ required: true, message: "At least one image is required" }]}>
                    <Upload
                        multiple
                        listType="picture"
                        beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                        beforeRemove={() => false}
                        accept="image/*"
                        onChange={handleImageChange} // Xử lý khi chọn file
                        onRemove={(file) => handleRemoveFile({ file, type: "images" })}
                        fileList={
                            Array.isArray(attachments.images)
                                ? attachments.images.map((image, index) => ({
                                    uid: index.toString(),
                                    name: `Image ${index + 1}`,
                                    url: image,
                                }))
                                : []
                        }
                    >
                        <Button icon={<UploadOutlined />} loading={uploading} >Click to Upload</Button>
                    </Upload>
                </Form.Item>
                <Form.Item label="Videos" name="videos">
                    <Upload
                        multiple
                        listType="picture"
                        beforeUpload={() => false} // Không upload ngay, chờ xử lý thủ công
                        beforeRemove={() => false}
                        accept="video/*"
                        onChange={handleVideoChange} // Xử lý khi chọn file
                        onRemove={(file) => handleRemoveFile({ file, type: "videos" })}
                        fileList={
                            Array.isArray(attachments.videos)
                                ? attachments.videos.map((image, index) => ({
                                    uid: index.toString(),
                                    name: `Video ${index + 1}`,
                                    url: image,
                                }))
                                : []
                        }
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block className="continue-button" disabled={uploading}>
                        {uploading ? "Uploading..." : "Update Project"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
export default ProjectUpdateModal;