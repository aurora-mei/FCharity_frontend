import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { MessageOutlined, CloseOutlined, RobotOutlined } from '@ant-design/icons';
import GeminiChatbox from '../GeminiChatBox/GeminiChatBox';
import './FloatingChatButton.pcss';

const FloatingChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {isOpen && (
                <div className="chatbox-wrapper">
                   <div className="chatbox-header">
                       <span><RobotOutlined /> FCharity Assistant</span>
                       <Button
                           type="text"
                           icon={<CloseOutlined />}
                           onClick={toggleChat}
                           size="small"
                           className="close-chat-button"
                       />
                   </div>
                    <GeminiChatbox />
                </div>
            )}

            <Tooltip title={isOpen ? "Close Chat" : "Chat with AI Assistant"} placement="left">
                <Button
                    className="floating-chat-button"
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={isOpen ? <CloseOutlined /> : <MessageOutlined />}
                    onClick={toggleChat}
                />
            </Tooltip>
        </>
    );
};

export default FloatingChatButton;