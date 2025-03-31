import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Flex } from 'antd';
const ProjectCard = ({projectData}) => {
    useEffect(()=>{
        console.log(projectData)
    })
    return ( 
    <Flex vertical gap={5} style={{ boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 8px 0px", borderRadius: "1rem" }}>
         <div style={{ position: "relative" }}>
            {/* {projectData.attachments && projectData.attachments.length > 0 ? (
                <img
                    // src={projectData.attachments[0].imageUrl}
                    alt="Request"
                    style={{ height: "11rem", width: "100%", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                />
            ) : (
                <img
                    src="https://via.placeholder.com/50"
                    alt="Placeholder"
                    style={{ height: "11rem", width: "100%", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }}
                />
            )}
            <div className="category-badge">
                {projectData.project.category.categoryName}
            </div> */}
            {/* {currentUser.id === requestData.helpRequest.user.id && (
                <div className="menu-badge">
                    <MoreOptions onEdit={() => handleEdit(requestData)} onDelete={() => handleDelete(requestData.helpRequest.id)} />
                </div>)} */}
        </div> 
        {/* Nội dung */}
        <div style={{ padding: "1rem" }} >
            {/* <a style={{ fontWeight: "bold", color: "black" }} href={`/requests/${projectData.project.id}`} >{requestData.helpRequest.title}</a>
            <p style={{ height: "3rem" }}><Paragraph ellipsis={{ tooltip: projectData.project.projectName, rows: 2, expandable: false }}>{requestData.helpRequest.content}</Paragraph ></p>
            <p className="text-gray-600 text-sm">Contact: {projectData.project.email}</p>

            {/* <div className="tags">
                {projectData.projectTags.map((tag) => (
                    <span key={tag.id}>
                        <div className="donation-badge">
                            {tag.tag.tagName}
                        </div>
                    </span>
                ))}
            </div> */}
        </div> 
    </Flex>)

            }
            
ProjectCard.propTypes = {
    projectData: PropTypes.shape({
        attachments: PropTypes.arrayOf(
            PropTypes.shape({
                imageUrl: PropTypes.string,
            })
        ),
        project: PropTypes.shape({
            id: PropTypes.string.isRequired,
            category: PropTypes.shape({
                categoryName: PropTypes.string.isRequired,
            }).isRequired,
            projectName: PropTypes.string,
            email: PropTypes.string.isRequired,
        }).isRequired,
        projectTags: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                tag: PropTypes.shape({
                    tagName: PropTypes.string.isRequired,
                }).isRequired,
            })
        ).isRequired,
    }).isRequired,
};

export default ProjectCard;