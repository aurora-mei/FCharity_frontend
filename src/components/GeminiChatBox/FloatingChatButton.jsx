import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { MessageOutlined, CloseOutlined, RobotOutlined } from '@ant-design/icons'; // Thêm icon Robot
import GeminiChatbox from './GeminiChatBox';
import './FloatingChatButton.pcss'; // File CSS/PCSS cho component này

const FloatingChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Container cho Chatbox khi mở */}
            {isOpen && (
                <div className="chatbox-wrapper">
                   {/* Optional: Thêm tiêu đề và nút đóng */}
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
                    <GeminiChatbox /> {/* Đặt GeminiChatbox vào đây */}
                </div>
            )}

            {/* Nút bấm nổi để mở/đóng chat */}
            <Tooltip title={isOpen ? "Close Chat" : "Chat with AI Assistant"} placement="left">
                <Button
                    className="floating-chat-button"
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={isOpen ? <CloseOutlined /> : <MessageOutlined />} // Thay đổi icon dựa trên state
                    onClick={toggleChat}
                />
            </Tooltip>
        </>
    );
};

export default FloatingChatButton;