import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, List, Spin, message, Typography, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import './GeminiChatBox.pcss';
import { APIPrivate } from '../../config/API/api';

const { Text } = Typography;
const { TextArea } = Input;

function removeVietnameseTones(str) {
    if (!str) return "";
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
    return str.toLowerCase();
}
const normalizeString = removeVietnameseTones;

const GeminiChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [chatError, setChatError] = useState(null);
    const chatEndRef = useRef(null);

    const [localProvinces, setLocalProvinces] = useState([]);
    const [localProvincesLoading, setLocalProvincesLoading] = useState(true);
    const [localProvincesError, setLocalProvincesError] = useState(null);

    const [userId, setUserId] = useState(null);
    const [currentUserAvatar, setCurrentUserAvatar] = useState(null);
    const [chatHistoryKey, setChatHistoryKey] = useState(null);

    const assistantAvatarUrl = "https://i.imgur.com/jCVN75w.jpeg";
    const avatarSize = 45;

    useEffect(() => {
        let currentUserId = null;
        let userAvatar = null;
        try {
            const storedUser = localStorage.getItem("currentUser");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                currentUserId = parsedUser?.id;
                userAvatar = parsedUser?.avatar || null;
            }
        } catch (err) {
            console.error("Error parsing currentUser from localStorage:", err);
        }
        setUserId(currentUserId);
        setCurrentUserAvatar(userAvatar);
        setChatHistoryKey(currentUserId ? `fcharityChatHistory_${currentUserId}` : null);
    }, []);

    useEffect(() => {
        if (!chatHistoryKey) {
            setChatHistory([]);
            return;
        }
        try {
            const savedHistory = localStorage.getItem(chatHistoryKey);
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);
                if (Array.isArray(parsedHistory) && parsedHistory.every(item => item && typeof item === 'object' && item.role && typeof item.text === 'string')) {
                    setChatHistory(parsedHistory);
                } else {
                    console.warn("Invalid chat history format found in localStorage. Clearing.");
                    localStorage.removeItem(chatHistoryKey);
                    setChatHistory([]);
                }
            } else {
                setChatHistory([]);
            }
        } catch (e) {
            console.error("Error reading chat history from localStorage:", e);
            localStorage.removeItem(chatHistoryKey);
            setChatHistory([]);
        }
    }, [chatHistoryKey]);

    useEffect(() => {
        if (!chatHistoryKey) return;

        if (chatHistory.length > 0) {
            try {
                localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
            } catch (e) {
                console.error("Could not save chat history to localStorage:", e);
                message.error("Could not save chat history.");
            }
        } else {
            if (localStorage.getItem(chatHistoryKey)) {
                localStorage.removeItem(chatHistoryKey);
            }
        }
    }, [chatHistory, chatHistoryKey]);

    useEffect(() => {
        let isMounted = true;
        setLocalProvincesLoading(true);
        setLocalProvincesError(null);
        fetch('https://provinces.open-api.vn/api/p/?depth=1')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error fetching provinces! Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (isMounted && Array.isArray(data)) {
                    setLocalProvinces(data);
                } else if (isMounted) {
                    console.warn("Invalid province data received or component unmounted.");
                    if (isMounted) setLocalProvinces([]);
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error("Failed to fetch provinces:", err);
                    setLocalProvincesError(err.message || "Failed to fetch provinces.");
                    setLocalProvinces([]);
                }
            })
            .finally(() => {
                if (isMounted) setLocalProvincesLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
             setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
             }, 50);
        });
    }, []);

    useEffect(scrollToBottom, [chatHistory, isSending, scrollToBottom]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (chatError) setChatError(null);
    };

    const handlePressEnter = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSending && inputValue.trim()) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = useCallback(async () => {
        if (!userId) {
            message.warn("Please log in to use the chat assistant.");
            return;
        }
        const userMessageText = inputValue.trim();
        if (!userMessageText) return;

        const lowerCaseNormalizedMessage = normalizeString(userMessageText);
        let localResponse = null;

        const adminContactKeywords = ["admin contact", "lien lac admin", "thong tin admin", "contact admin", "admin info", "admin liên hệ", "admin thông tin", "admin contact info", "admin contact information", "admin"];
        if (adminContactKeywords.some(keyword => lowerCaseNormalizedMessage.includes(normalizeString(keyword)))) {
            localResponse = { role: 'model', text: `Admin contact information:\n\n*   **Phone:** 0828006916\n*   **Facebook:** [https://www.facebook.com/dtrg.1101/](https://www.facebook.com/dtrg.1101/)` };
        }

        const newUserMessage = { role: 'user', text: userMessageText };
        setChatHistory(prev => [...prev, newUserMessage]);
        setInputValue('');
        setChatError(null);
        scrollToBottom();

        if (localResponse) {
            setIsSending(true);
            setTimeout(() => {
                setChatHistory(prev => [...prev, localResponse]);
                setIsSending(false);
                scrollToBottom();
            }, 500);
            return;
        }

        setIsSending(true);
        try {
            const currentHistory = JSON.parse(localStorage.getItem(chatHistoryKey) || '[]');
            const historyForBackend = currentHistory.filter(msg => msg.role === 'user' || msg.role === 'model');

            console.log("Sending to backend:", { message: userMessageText, history: historyForBackend });

            const response = await APIPrivate.post('/api/chat/gemini', {
                message: userMessageText,
                history: historyForBackend
            });

            const data = response.data;

            if (!data || typeof data.reply !== 'string') {
                console.error("Invalid response structure from backend:", data);
                throw new Error("Received invalid reply format from the server.");
            }

            const aiMessage = { role: 'model', text: data.reply };
            setChatHistory(prev => [...prev, aiMessage]);

        } catch (err) {
            let errorMsg = "Failed to get response from the assistant.";
            if (err.response) {
                errorMsg = err.response.data?.error || err.response.data?.message || `Request failed: ${err.response.status}`;
                console.error("Backend Error Response:", err.response.data);
            } else if (err.request) {
                errorMsg = "Could not connect to the chat service. Please check network.";
            } else {
                errorMsg = err.message || "An unknown error occurred.";
            }
            console.error("Error calling chat API:", err);
            setChatError(errorMsg);
            message.error(`Chat Error: ${errorMsg}`, 5);

        } finally {
            setIsSending(false);
            scrollToBottom();
        }
    }, [
        userId,
        inputValue,
        chatHistoryKey,
        scrollToBottom
    ]);

    const customEmptyText = (
       <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
           <Avatar size={avatarSize + 10} src={assistantAvatarUrl} style={{ marginBottom: '15px' }}/>
           {userId ? (
                <>
                   <p style={{ fontWeight: 500, fontSize: '1.1em' }}>How can Saku BOT help you today?</p>
                   <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                      Ask about active requests, projects, locations, or admin info.
                   </Text>
                </>
            ) : ( <p>Please log in to use the chat assistant.</p> )}
       </div>
    );

    return (
        <div className="gemini-chatbox-container">
            <div className="chat-display-area">
                <List
                    itemLayout="horizontal"
                    dataSource={chatHistory}
                    locale={{ emptyText: customEmptyText }}
                    renderItem={(item, index) => (
                        <List.Item key={`${item.role}-${index}`} className={`chat-message ${item.role === 'user' ? 'user-message' : 'ai-message'}`}>
                             <List.Item.Meta
                                avatar={
                                    item.role === 'user'
                                     ? (currentUserAvatar
                                        ? <Avatar size={avatarSize} src={currentUserAvatar} onError={() => false} />
                                        : <Avatar size={avatarSize} icon={<UserOutlined />} />)
                                    : (<Avatar size={avatarSize} src={assistantAvatarUrl} onError={() => false} icon={<RobotOutlined />} />)
                                  }
                                title={<Text strong>{item.role === 'user' ? 'You' : 'Saku BOT'}</Text>}
                                description={
                                    <ReactMarkdown
                                        children={item.text}
                                        components={{
                                            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                                        }}
                                    />
                                }
                             />
                         </List.Item>
                    )}
                />
                {isSending && (
                    <div className="loading-indicator">
                        <Spin size="small" />
                        <span style={{ marginLeft: 8, color: '#555' }}>Assistant is thinking...</span>
                    </div>
                )}
                 <div ref={chatEndRef} style={{ height: "1px" }} />
            </div>

            <div className="chat-input-area">
                 <TextArea
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={
                        !userId ? "Please log in to chat" :
                        localProvincesLoading ? "Initializing..." :
                        isSending ? "Assistant is replying..." :
                        "Ask Saku BOT..."
                    }
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={handlePressEnter}
                    disabled={!userId || isSending || localProvincesLoading}
                    style={{ marginRight: '10px', flexGrow: 1 }}
                 />
                 <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={isSending}
                    disabled={!userId || !inputValue.trim() || isSending || localProvincesLoading}
                 >
                    Send
                 </Button>
            </div>
        </div>
    );
};

export default GeminiChatBox;