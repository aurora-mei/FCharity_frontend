import { useState, useEffect } from "react";
import { Form, Input, Select, Button, Checkbox, DatePicker, Upload,message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { fetchCategories } from "../../redux/category/categorySlice";
import {fetchMyOrganization, fetchOrganizationMembers } from "../../redux/organization/organizationSlice";
import { createProjectThunk } from "../../redux/project/projectSlice";
import {fetchRequestById} from "../../redux/request/requestSlice";
import { uploadFileHelper } from "../../redux/helper/helperSlice";
import { useParams,useNavigate } from "react-router-dom";
import { fetchTags } from "../../redux/tag/tagSlice";
import { useDispatch, useSelector } from "react-redux";
import LoadingModal from "../LoadingModal/index.jsx";
import useLoading from "../../hooks/useLoading";
import styled from 'styled-components';
import PropTypes from 'prop-types';

const { Option } = Select;
const FormStyled = styled.div`
  .upper-container-project {
    background-color:white;
    border-radius: 10px;
  }
  .container-project {
    padding:2rem;
  }
  .back-button {
    padding:1rem !important;
    background-color: var(--primary-button-bg-color);
    border-color: var(--primary-button-bg-color);
    color: white !important;
    font-size:0.8rem !important;
  &:hover{
    padding:1rem !important;
    background-color: var(--primary-button-bg-color) !important;
    border-color: var(--primary-button-bg-color) !important;
    box-shadow: 0 0 0 2px var(--primary-button-bg-color); 
  }
  }
`

const ProjectForm = ({requestId,myOrganization}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadingUI = useLoading();
  const loading = useSelector((state) => state.organization.loading);
  const categories = useSelector((state) => state.category.categories || []);
  const tags = useSelector((state) => state.tag.tags || []);
  const requestData = useSelector((state) => state.request.currentRequest);
  const members = useSelector((state) => state.organization.myOrganizationMembers);
  const [initialLoading, setInitialLoading] = useState(true);
  const [attachments, setAttachments] = useState({}); // Lưu danh sách file đã upload
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [createdSuccess, setCreatedSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
   
   
    dispatch(fetchRequestById(requestId));
    dispatch(fetchCategories());
    dispatch(fetchTags());
    console.log("myOrganization", myOrganization);
    if (myOrganization.organizationId) {
      dispatch(fetchOrganizationMembers(myOrganization.organizationId));
    }
    if (form.getFieldValue("email") === undefined) {
      initFormData();
    }
  }, [dispatch,myOrganization.organizationId]);
 
  const initFormData = async () => {
    console.log("myOrganizationmember", members);
    // Lấy user từ localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        // Gán email, phone, location (detail) vào form
        form.setFieldsValue({
          email: parsedUser.email || "",
          phone: parsedUser.phoneNumber || "",
        });
      } catch (error) {
        console.error("Error parsing currentUser:", error);
      }
    }
    setInitialLoading(false); // Kết thúc giai đoạn load dữ liệu ban đầu
  };

  const handleImageChange = async ({ fileList }) => {
    if (fileList.length === 0) return; // Nếu danh sách trống, không làm gì

    setUploading(true);
    const latestFile = fileList[fileList.length - 1];

    try {
      const response = await dispatch(uploadFileHelper({ file: latestFile.originFileObj, folderName: "images" })).unwrap();
      console.log("response", response);
      latestFile.url = response;
      setUploadedImages((prevImages) => {
        const uploadedImages = [...prevImages, response];
        setAttachments((prev) => ({
          ...prev,
          images: uploadedImages,
          videos: prev.videos || []
        }));
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
      const response = await dispatch(uploadFileHelper({ file: latestFile.originFileObj, folderName: "videos" })).unwrap();
      console.log("response", response);
      latestFile.url = response;
      setUploadedVideos((prevVideos) => {
        const updatedVideos = [...prevVideos, response];

        // Cập nhật state attachments sau khi uploadedVideos cập nhật
        setAttachments((prev) => ({
          ...prev,
          videos: updatedVideos,
          images: prev.images || []
        }));

        return updatedVideos; // Trả về danh sách mới
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
  const takeFromRequest = () => {
    setInitialLoading(true);
    form.setFieldsValue({
      location: requestData.helpRequest.location || "",
      categoryId: requestData.helpRequest.category.id,
      tagIds: requestData.requestTags?.map((taggable) => taggable.tag.id) || [],
    });
    console.log("Request Data:", requestData);
    setInitialLoading(false);
  };
  const onFinish = async (values) => {
       // Lấy userId
      //  let myOrganization = {};
      //  const storedMyOrganization = localStorage.getItem("myOrganization");
      //  if (storedMyOrganization) {
      //    try {
      //     myOrganization = JSON.parse(storedMyOrganization);
      //    } catch (error) {
      //      console.error("Error parsing myOrganization:", error);
      //    }
      //  }
   
       // Tạo object gửi lên API
       const projectData = {
         ...values,
         requestId:requestId,
         organizationId: myOrganization.organizationId,
         tagIds: values.tagIds,
         imageUrls: attachments.images,
         videoUrls: attachments.videos,
       };
   
       console.log("Final Project Data:", projectData);
       try {
         await dispatch(createProjectThunk(projectData)).unwrap();
         setCreatedSuccess(true);
         message.success("Create project successfully!");
       } catch (error) {
         console.error("Error creating Project:", error);
         message.error("Failed to create project");
       }
    
  };
  if (loadingUI || loading || initialLoading) {
    return <LoadingModal />;
  }
  return (
    <FormStyled>
    <div className="upper-container-project">
      <div className="container-project">
        <div className="create-project-form">
          <div className="project-header">
            <h3 className="title">Create a Project</h3>
            <p className="subtitle">Fill in the details to create a new project.</p>
            <Button type="primary" className="back-button" onClick={takeFromRequest}>Take information from request</Button>
          </div>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item label="Project Name" name="projectName" rules={[{ required: true, message: "Project Name is required" }]}>
              <Input readOnly={createdSuccess}/>
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Valid Email is required" }]}>
              <Input type="email" readOnly={createdSuccess}/>
            </Form.Item>

            <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: "Phone Number is required" }]}>
              <Input readOnly={createdSuccess}/>
            </Form.Item>

            <Form.Item label="Project Description" name="projectDescription" rules={[{ required: true, message: "Please enter a project description" }]}>
              <Input.TextArea readOnly={createdSuccess}/>
            </Form.Item>

            <Form.Item label="Planned Start Time" name="plannedStartTime" rules={[{ required: true, message: "Start Time is required" }]}>
              <DatePicker showTime disabled={createdSuccess}/>
            </Form.Item>

            <Form.Item label="Planned End Time" name="plannedEndTime" rules={[{ required: true, message: "End Time is required" }]}>
              <DatePicker showTime disabled={createdSuccess}/>
            </Form.Item>

            <Form.Item label="Leader" name="leaderId" rules={[{ required: true, message: "Leader is required" }]}>
              <Select placeholder="Select a leader" disabled={createdSuccess}>
                {members.map(member => (
                  <Option key={member.id} value={member.user.id}>{member.user.fullName}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Category"
              name="categoryId"
              rules={[{ required: true, message: "Category is required" }]}
            >
              <Select placeholder="Select a category" disabled={createdSuccess}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.categoryName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Tags */}
            <Form.Item
              label="Tags"
              name="tagIds"
              rules={[{ required: true, message: "At least one tag is required" }]}
            >
              <Select mode="multiple" placeholder="Select tags" allowClear disabled={createdSuccess}>
                {Array.isArray(tags) &&
                  tags.map(tag => (
                    <Option key={tag.id} value={tag.id}>
                      {tag.tagName}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label="Location" name="location" rules={[{ required: true, message: "Address is required" }]} >
              <Input readOnly/>
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
              >
                <Button icon={<UploadOutlined />} loading={uploading} disabled={createdSuccess}>Click to Upload</Button>
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
              >
                <Button icon={<UploadOutlined />} loading={uploading} disabled={createdSuccess}>Click to Upload</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block className="continue-button" disabled={!uploading && createdSuccess}>
                {uploading ? "Uploading..." : "Create Project"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
    </FormStyled>
  );
};
ProjectForm.propTypes = {
  requestId: PropTypes.string.isRequired,
  myOrganization: PropTypes.shape({
    organizationId: PropTypes.string,
  }).isRequired,
};

export default ProjectForm;
