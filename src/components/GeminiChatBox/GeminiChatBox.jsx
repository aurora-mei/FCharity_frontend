import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, List, Spin, message, Typography, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import 'antd/dist/reset.css';
import './GeminiChatBox.pcss'; // Make sure the CSS/PCSS file name matches if you renamed the component

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API;

function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

// Consider renaming the component if desired, e.g., FCharityChatBox
const GeminiChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);
    const [localProvinces, setLocalProvinces] = useState([]);
    const [localProvincesLoading, setLocalProvincesLoading] = useState(true);
    const [localProvincesError, setLocalProvincesError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [currentUserAvatar, setCurrentUserAvatar] = useState(null);
    const [chatHistoryKey, setChatHistoryKey] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        let currentUserId = null;
        let userAvatar = null;
        try {
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                currentUserId = parsedUser?.id;
                userAvatar = parsedUser?.avatar || null; // Adjust property: 'avatarUrl' or 'avatar'
            }
        } catch (err) {
            console.error("Error parsing currentUser for chat:", err);
        }
        setUserId(currentUserId);
        setCurrentUserAvatar(userAvatar);
        if (currentUserId) {
            setChatHistoryKey(`fcharityChatHistory_${currentUserId}`); // Use app-specific key
        } else {
            setChatHistoryKey(null);
            setCurrentUserAvatar(null);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        setLocalProvincesLoading(true);
        setLocalProvincesError(null);

        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (isMounted) setLocalProvinces(data || []);
            })
            .catch(err => {
                console.error("Failed to load provinces in ChatBox:", err);
                if (isMounted) {
                    setLocalProvincesError(err.message || "Failed to fetch provinces");
                    setLocalProvinces([]);
                }
            })
            .finally(() => {
                if (isMounted) setLocalProvincesLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    const requests = useSelector(state => state.request?.requests || []);
    const projects = useSelector(state => state.project?.projects || []);

    useEffect(() => {
        if (!chatHistoryKey) {
             setChatHistory([]);
             return;
        };
        try {
            const savedHistory = localStorage.getItem(chatHistoryKey);
            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);
                if (Array.isArray(parsedHistory) && parsedHistory.every(item => item.role && item.text)) {
                    setChatHistory(parsedHistory);
                } else {
                    localStorage.removeItem(chatHistoryKey);
                    setChatHistory([]);
                }
            } else {
                 setChatHistory([]);
            }
        } catch (e) {
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
                message.error("Could not save chat history.");
            }
        } else {
            if (localStorage.getItem(chatHistoryKey)) {
                 localStorage.removeItem(chatHistoryKey);
            }
        }
    }, [chatHistory, chatHistoryKey]);

    const scrollToBottom = () => {
        setTimeout(() => {
             chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isLoading]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (error) setError(null);
    };

    const findProvinceCodeByName = useCallback((name) => {
        if (!name || !localProvinces || localProvinces.length === 0) return null;
        const normalizedNameToFind = removeVietnameseTones(name);
        const found = localProvinces.find(p => removeVietnameseTones(p.name) === normalizedNameToFind);
        if (found) return found.code;
        const containsFound = localProvinces.find(p => removeVietnameseTones(p.name).includes(normalizedNameToFind));
        return containsFound ? containsFound.code : null;
    }, [localProvinces]);

    const createReduxContext = useCallback(() => {
        let context = "";
        if (requests.length > 0) {
            context += "\nRecent Requests (Titles):\n";
            requests.slice(0, 5).forEach((req) => {
                context += `- ${req.title || 'Untitled Request'}\n`;
            });
        }
        if (projects.length > 0) {
            context += "\nActive Projects (Titles):\n";
            projects.slice(0, 5).forEach((proj) => {
                context += `- ${proj.title || 'Untitled Project'}\n`;
            });
        }
        if (context) {
            return "\n\n--- FCharity Application Context ---\n" + context + "---------------------------\n";
        }
        return "";
    }, [requests, projects]);

    const handleSendMessage = useCallback(async () => {
        if (!userId) {
             message.warn("Please log in to use the chat assistant.");
             return;
        }
        const userMessageText = inputValue.trim();
        if (!userMessageText) return;

        const lowerCaseMessage = userMessageText.toLowerCase();
        let localResponse = null;

        const listRequestKeywords = ["list request", "show request", "hiển thị request", "danh sách yêu cầu"];
        const listProjectKeywords = ["list project", "show project", "hiển thị dự án", "danh sách dự án"];
        const locationQueryRegex = /(requests?|yêu cầu|projects?|dự án)\s+(?:in|tại|ở)\s+(.+)/i;
        const locationMatch = userMessageText.match(locationQueryRegex);

        let extractedLocationName = '';

        if (locationMatch) {
            const itemType = locationMatch[1].toLowerCase().includes("request") ? "request" : "project";
            const potentialLocationPhrase = locationMatch[2].trim();
            let matchedProvinceData = null;

            if (!localProvincesLoading && !localProvincesError && localProvinces.length > 0) {
                for (const province of localProvinces) {
                    const normalizedProvName = removeVietnameseTones(province.name);
                    const normalizedPotentialPhrase = removeVietnameseTones(potentialLocationPhrase);

                    if (normalizedPotentialPhrase.startsWith(normalizedProvName)) {
                        if (!matchedProvinceData || province.name.length > matchedProvinceData.name.length) {
                             matchedProvinceData = { code: province.code, name: province.name };
                        }
                    }
                     const simpleProvName = province.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
                     const normalizedSimpleProvName = removeVietnameseTones(simpleProvName);
                      if (normalizedPotentialPhrase.startsWith(normalizedSimpleProvName)) {
                          if (!matchedProvinceData || simpleProvName.length > matchedProvinceData.name.length) {
                               matchedProvinceData = { code: province.code, name: simpleProvName };
                          }
                      }
                }
            }

            extractedLocationName = matchedProvinceData ? matchedProvinceData.name : potentialLocationPhrase;

            if (localProvincesLoading) {
                 localResponse = { role: 'model', text: "Province list loading. Try again." };
            } else if (localProvincesError) {
                 localResponse = { role: 'model', text: `Province list error: ${localProvincesError}` };
            } else if (!localProvinces || localProvinces.length === 0) {
                 localResponse = { role: 'model', text: "Province list unavailable." };
            } else if (matchedProvinceData) {
                const targetProvinceCode = matchedProvinceData.code;
                let dataToFilter = itemType === "request" ? requests : projects;

                const filteredItems = dataToFilter.filter(item => {
                    return item.provinceCode != null && targetProvinceCode != null &&
                           String(item.provinceCode) === String(targetProvinceCode);
                });

                if (filteredItems.length > 0) {
                    let responseText = `Okay, here are the ${itemType}s I found in ${extractedLocationName}:\n\n`;
                    filteredItems.slice(0, 10).forEach((item, index) => {
                         const title = item.title || `Untitled ${itemType}`;
                         const id = item.id;
                         const viewPath = itemType === 'request' ? `/requests/${id}` : `/projects/${id}`;
                         responseText += `${index + 1}. **${title}**${id ? `\n   (View: ${viewPath})` : ' (Missing ID)'}\n`;
                     });
                    localResponse = { role: 'model', text: responseText };
                } else {
                    localResponse = { role: 'model', text: `I couldn't find any active ${itemType}s listed for ${extractedLocationName} in the current data.` };
                }
            } else {
                 localResponse = { role: 'model', text: `Sorry, I couldn't precisely match the location "${potentialLocationPhrase}" to a known province.` };
            }
        }
        else if (listRequestKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
             if (requests && requests.length > 0) {
                 let responseText = "Recent requests:\n\n";
                 requests.slice(0, 10).forEach((req, index) => {
                     const title = req.title || 'Untitled Request';
                     const id = req.id;
                     responseText += `${index + 1}. **${title}**${id ? ` (View: /requests/${id})` : ' (Missing ID)'}\n`;
                 });
                 localResponse = { role: 'model', text: responseText };
             } else {
                 localResponse = { role: 'model', text: "No requests loaded." };
             }
         }
        else if (listProjectKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
             localResponse = { role: 'model', text: "Project listing not fully implemented." };
         }

        const newUserMessage = { role: 'user', text: userMessageText };
        setChatHistory(prev => [...prev, newUserMessage]);
        setInputValue('');
        setError(null);

        if (localResponse) {
            setTimeout(() => {
                setChatHistory(prev => [...prev, localResponse]);
            }, 500);
            return;
        }

        setIsLoading(true);

        if (!GEMINI_API_KEY) {
            message.error('API key not configured.');
            setError('API Key missing');
            setIsLoading(false);
            return;
        }

        const currentHistoryForApi = chatHistory;
        const apiPayloadContents = currentHistoryForApi.reduce((acc, msg) => {
             if (acc.length === 0 || acc[acc.length - 1].role !== msg.role) {
                 acc.push({ role: msg.role, parts: [{ text: msg.text }] });
             } else {
                  acc[acc.length - 1].parts[0].text += "\n" + msg.text;
             }
             return acc;
         }, []);
        apiPayloadContents.push({ role: 'user', parts: [{ text: userMessageText }] });


        const reduxContext = createReduxContext();
        const systemInstruction = `You are FCharity Assistant, a helpful AI for the FCharity platform. Focus on charity topics and use provided context. Be friendly and professional.`;

        // Prepend system instruction and context to the last user message for the API
        const lastUserPartIndex = apiPayloadContents.length - 1;
        if (lastUserPartIndex >= 0 && apiPayloadContents[lastUserPartIndex].role === 'user') {
             apiPayloadContents[lastUserPartIndex].parts[0].text = `${systemInstruction}${reduxContext}\n\nUser: ${apiPayloadContents[lastUserPartIndex].parts[0].text}`;
        }


        const apiPayload = { contents: apiPayloadContents };

        console.log("Sending API payload");

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', },
                 body: JSON.stringify(apiPayload),
             });
            const data = await response.json();

            if (!response.ok) {
                 console.error("API Error Response:", data);
                 const apiErrorMessage = data?.error?.message || `API request failed: ${response.status}`;
                 if (data?.promptFeedback?.blockReason) {
                      throw new Error(`Blocked: ${data.promptFeedback.blockReason}.`);
                 }
                throw new Error(apiErrorMessage);
            }

            const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiResponseText) {
                  const finishReason = data.candidates?.[0]?.finishReason;
                  const blockReason = data.promptFeedback?.blockReason;
                  if (finishReason === 'SAFETY' || blockReason) {
                       throw new Error(`Response blocked (Reason: ${finishReason || blockReason || 'Unknown'}).`);
                  } else if (finishReason === 'MAX_TOKENS') {
                      throw new Error("Response reached maximum length.");
                  } else {
                       console.warn("Gemini response issue:", data);
                       throw new Error('Empty/invalid response from AI.');
                  }
             }

            const aiMessage = { role: 'model', text: aiResponseText };
            setChatHistory(prev => [...prev, aiMessage]);

        } catch (err) {
             console.error("Error sending/processing message:", err);
             setError(err.message || 'Unexpected error.');
             message.error(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }

    }, [
        userId,
        inputValue,
        chatHistory,
        requests,
        projects,
        localProvinces,
        localProvincesLoading,
        localProvincesError,
        findProvinceCodeByName,
        createReduxContext
    ]);

    const handlePressEnter = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            handleSendMessage();
        }
    };

     const customEmptyText = (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            <RobotOutlined style={{ fontSize: '24px', marginBottom: '10px' }}/>
            <p>{userId ? "Ask FCharity Assistant anything!" : "Please log in to chat."}</p>
            {userId && <Text type="secondary">Type your message below.</Text>}
        </div>
     );

     return (
         <div className="gemini-chatbox-container">
             <div className="chat-display-area">
                 <List
                    itemLayout="horizontal"
                    dataSource={chatHistory}
                    locale={{ emptyText: customEmptyText }}
                    renderItem={(item) => (
                         <List.Item className={`chat-message ${item.role === 'user' ? 'user-message' : 'ai-message'}`}>
                             <List.Item.Meta
                                avatar={
                                    item.role === 'user' ?
                                    (currentUserAvatar ? <Avatar src={currentUserAvatar} /> : <Avatar icon={<UserOutlined />} />)
                                    :
                                    <Avatar style={{ backgroundColor: '#1890ff' }} icon={<RobotOutlined />} />
                                }
                                title={item.role === 'user' ? 'You' : 'FCharity Assistant'}
                                description={
                                    <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, wordBreak: 'break-word' }}>
                                        {item.text}
                                    </Paragraph>
                                }
                             />
                         </List.Item>
                    )}
                 />
                 {isLoading && ( <div className="loading-indicator"> <Spin size="small" /><span> FCharity Assistant is thinking...</span> </div> )}
                 {error && !isLoading && ( <div className="error-message"> <Text type="danger">Error: {error}</Text> </div> )}
                 <div ref={chatEndRef} style={{ height: "1px" }} />
             </div>
             <div className="chat-input-area">
                 <TextArea
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={userId ? "Ask FCharity Assistant... (Shift+Enter for new line)" : "Log in to chat"}
                    autoSize={{ minRows: 1, maxRows: 5 }}
                    onPressEnter={handlePressEnter}
                    disabled={isLoading || !userId}
                    style={{ marginRight: '10px' }}
                 />
                 <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={isLoading}
                    disabled={!inputValue.trim() || isLoading || !userId}
                 >
                     Send
                 </Button>
             </div>
         </div>
     );
};

export default GeminiChatBox; 