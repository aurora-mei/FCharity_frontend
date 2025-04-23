
import { useState, useEffect } from "react";
import { Modal, Form, Input, InputNumber, Button, DatePicker, Select, Upload, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { UploadOutlined } from "@ant-design/icons";
import { updateProjectThunk } from "../../redux/project/projectSlice";
import styled from "styled-components";
import moment from 'moment-timezone';
import { uploadFileMedia } from "../../redux/helper/helperSlice";
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
    const dispatch = useDispatch();
    const [attachments, setAttachments] = useState({ images: [], videos: [] });
    const [uploading, setUploading] = useState(false);
    useEffect(() => {
        console.log("projectData", projectData);
        initFormData();
    }, [dispatch, projectData,form]);

    const initFormData = async () => {
       console.log("projectData", projectData.project);
        form.setFieldsValue({
            projectName: projectData.project.projectName || "",
            projectDescription: projectData.project.projectDescription || "",
            plannedStartTime: projectData.project.plannedStartTime
            ? moment.utc(projectData.project.plannedStartTime).local()
            : null,
          plannedEndTime: projectData.project.plannedEndTime
            ? moment.utc(projectData.project.plannedEndTime).local()
            : null,
            categoryId: projectData.project.categoryId || null,
            categoryName: projectData.project.categoryName || null,
            tagIds: projectData.projectTags.map(t => t.tag.id) || [],
            location: projectData.project.location || "",
            images: attachments.images || [],
            videos: attachments.videos || [],
            projectStatus: projectData.project.projectStatus || "",
            email: projectData.project.email || "",
            phone: projectData.project.phoneNumber || "",
        });
        if(projectData.attachments){
            const imageUrls = projectData.attachments?.filter((url) =>
                url.imageUrl.match(/\.(jpeg|jpg|png|gif)$/i)
            ) || [];
            const videoUrls = projectData.attachments?.filter((url) =>
                url.imageUrl.match(/\.(mp4|webm|ogg)$/i)
            ) || [];
            setAttachments({
                images: imageUrls,
                videos: videoUrls
            });
            console.log("images", form.getFieldValue("images"));
            setInitialLoading(false); // Kết thúc giai đoạn load dữ liệu ban đầu
        }
    };

    const handleImageChange = async ({ fileList }) => {
        if (fileList.length === 0) return; // Nếu danh sách trống, không làm gì

        setUploading(true);
        const latestFile = fileList[fileList.length - 1];

        try {
            const response = await dispatch(uploadFileMedia({ file: latestFile.originFileObj, folderName: "images",resourceType:"image" })).unwrap();
            console.log("response", response);
            latestFile.url = response;
            setUploadedImages((prevImages) => {
                const uploadedImages = [...prevImages, response];
                setAttachments((prev) => ({
                    ...prev,
                    images: uploadedImages,
                    videos: prev.videos || []
                }));
                form.setFieldsValue({ images: uploadedImages });
                return uploadedImages;
            });

            console.log("attachments", attachments);
            message.success(`Uploaded ${latestFile.name}`);
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error(`Upload failed for ${latestFile.name}`);
        }


        console.log("attachment", attachments);
        setUploading(false);
    };

    const handleVideoChange = async ({ fileList }) => {
        if (fileList.length === 0) return;

        setUploading(true);
        const latestFile = fileList[fileList.length - 1];

        try {
            const response = await dispatch(uploadFileMedia({ file: latestFile.originFileObj, folderName: "videos",resourceType:"video" })).unwrap();
            console.log("response", response);
            latestFile.url = response;
            setUploadedVideos((prevVideos) => {
                const uploadedVideos = [...prevVideos, response];

                // Cập nhật state attachments sau khi uploadedVideos cập nhật
                setAttachments((prev) => ({
                    ...prev,
                    videos: uploadedVideos,
                    images: prev.images || []
                }));
                form.setFieldsValue({ images: uploadedVideos });
                return uploadedVideos; // Trả về danh sách mới
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
            console.log("Deleting file:", file, type);
            if (type === "images") {
                setUploadedImages((prevImages) => {
                    const updatedImages = prevImages.filter((image) => image !== file.url);
                    console.log("updatedImages", updatedImages);
                    setAttachments((prev) => ({
                        ...prev,
                        images: updatedImages,
                    }));
                    return updatedImages;
                });
            } else {
                setUploadedVideos((prevVideos) => {
                    const updatedVideos = prevVideos.filter((video) => video !== file.url);
                    setAttachments((prev) => ({
                        ...prev,
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
            imageUrls: attachments.images.map((image) => image.imageUrl),
            videoUrls: attachments.videos,
            categoryId: projectData.project.categoryId,
            tagIds: values.tagIds
        };
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
                form.resetFields();
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

                        defaultFileList={
                            Array.isArray(attachments.images)
                                ? attachments.images.map((image, index) => ({
                                    uid: index.toString(),
                                    name: `Image ${index + 1}`,
                                    url: image.imageUrl,
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
                        defaultFileList={
                            Array.isArray(attachments.videos)
                                ? attachments.videos.map((image, index) => ({
                                    uid: index.toString(),
                                    name: `Image ${index + 1}`,
                                    url: image.imageUrl,
                                }))
                                : []
                        }
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload</Button>
                    </Upload>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block className="continue-button" disabled={!uploading && editable}>
                        {uploading ? "Uploading..." : "Update Project"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
export default ProjectUpdateModal;