import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, List, Spin, message, Typography, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActiveRequests } from '../../redux/request/requestSlice';
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

function formatLink(type, id, title) {
    const displayTitle = title || `Untitled ${type}`;
    if (!id) return `**${displayTitle}** (Missing ID)`;
    const path = type === 'request' ? `/requests/${id}` : `/projects/${id}`;
    return `[**${displayTitle}**](${path})`;
}

function parseLocationString(locationString = "") {
    if (!locationString || typeof locationString !== 'string') return { provinceName: "" };
    const parts = locationString.split(',').map(p => p.trim());
    if (parts.length < 1) return { provinceName: "" };
    let provincePart = parts.find(p => /^(Tỉnh|Thành phố|TP)\s+/i.test(p));
    if (!provincePart && parts.length > 0) { provincePart = parts[parts.length - 1]; }
    const provinceName = provincePart ? provincePart.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim() : "";
    return { provinceName };
}

const GeminiChatBox = () => {
    const dispatch = useDispatch();
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

    const activeRequestsData = useSelector(state => state.request?.activeRequests || []);
    const activeRequestsLoading = useSelector(state => state.request?.loading);
    const activeRequestsError = useSelector(state => state.request?.error);
    const projects = useSelector(state => state.project?.projects || []);

    const assistantAvatarUrl = "https://i.imgur.com/jCVN75w.jpeg";
    const avatarSize = 45;

    const activeRequests = activeRequestsData.length > 0 ? activeRequestsData.map(item => ({
        ...(item.helpRequest || item),
        provinceCode: item.helpRequest?.provinceCode,
        categoryName: item.helpRequest?.category?.categoryName,
        attachments: item.attachments || [],
        tags: item.requestTags?.map(rt => rt.tag?.tagName) || [],
    })) : [];

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
        if (!activeRequestsLoading && activeRequestsData.length === 0) {
            dispatch(fetchActiveRequests());
        }
    }, [dispatch, activeRequestsLoading, activeRequestsData.length]);

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
                    throw new Error("Invalid province data received from API.");
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
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
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

    const findProvinceCodeByName = useCallback((name) => {
        if (!name || !localProvinces || localProvinces.length === 0) return null;
        const normalizedNameToFind = normalizeString(name);
        if (!normalizedNameToFind) return null;

        for (const province of localProvinces) {
            const normalizedFullName = normalizeString(province.name);
            if (normalizedFullName === normalizedNameToFind) return province.code;
            const nameWithoutPrefix = province.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
            const normalizedNameWithoutPrefix = normalizeString(nameWithoutPrefix);
            if (normalizedNameWithoutPrefix === normalizedNameToFind) return province.code;
        }

        for (const province of localProvinces) {
            const normalizedFullName = normalizeString(province.name);
            if (normalizedFullName.includes(normalizedNameToFind)) return province.code;
            const nameWithoutPrefix = province.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
            const normalizedNameWithoutPrefix = normalizeString(nameWithoutPrefix);
            if (normalizedNameWithoutPrefix.includes(normalizedNameToFind)) return province.code;
        }

        return null;
    }, [localProvinces]);

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
        if (!localResponse && adminContactKeywords.some(keyword => lowerCaseNormalizedMessage.includes(normalizeString(keyword)))) {
            localResponse = { role: 'model', text: `Admin contact information:\n\n*   **Phone:** 0828006916\n*   **Facebook:** [https://www.facebook.com/dtrg.1101/](https://www.facebook.com/dtrg.1101/)` };
        }

        const listRequestKeywords = ["list request", "show request", "hien thi request", "danh sach yeu cau", "list active request", "cac yeu cau hien co", "all requests"];
        if (!localResponse && listRequestKeywords.some(keyword => lowerCaseNormalizedMessage.includes(normalizeString(keyword)))) {
            if (activeRequestsLoading) {
                localResponse = { role: 'model', text: "Loading active requests..." };
            } else if (activeRequestsError) {
                 localResponse = { role: 'model', text: `Error loading requests: ${activeRequestsError}` };
            } else if (activeRequests && activeRequests.length > 0) {
                let responseText = `Here are the first 10 active requests:\n\n`;
                activeRequests.slice(0, 10).forEach((req, index) => {
                    responseText += `${index + 1}. ${formatLink('request', req.id, req.title || 'Untitled Request')}\n`;
                });
                if (activeRequests.length > 10) {
                    responseText += `\n... and ${activeRequests.length - 10} more active requests.`;
                }
                localResponse = { role: 'model', text: responseText };
            } else {
                localResponse = { role: 'model', text: "There are currently no active requests." };
            }
        }

        const listProjectKeywords = ["list project", "show project", "hien thi du an", "danh sach du an", "all projects"];
        if (!localResponse && listProjectKeywords.some(keyword => lowerCaseNormalizedMessage.includes(normalizeString(keyword)))) {
            if (projects && projects.length > 0) {
                let responseText = "Here are the first 10 active projects:\n\n";
                projects.slice(0, 10).forEach((proj, index) => {
                    responseText += `${index + 1}. ${formatLink('project', proj.id, proj.title || 'Untitled Project')}\n`;
                });
                if (projects.length > 10) {
                    responseText += `\n... and ${projects.length - 10} more projects.`;
                }
                localResponse = { role: 'model', text: responseText };
            } else {
                localResponse = { role: 'model', text: "There are currently no active projects found." };
            }
        }

        let targetCategoryName = null;
        const categoryQueryRegexes = [
             /(?:requests?|yeu cau)\s+(?:in|thuoc|voi)\s+(?:category|danh muc)\s+['"]?(.+?)['"]?/i,
             /['"]?(.+?)['"]?\s+(?:category|danh muc)\s+(?:requests?|yeu cau)/i,
             /^(?:requests?|yeu cau)\s+(?:category|danh muc)\s+['"]?(.+?)['"]?/i
            ];
        if (!localResponse) {
            for (const regex of categoryQueryRegexes) {
                const match = userMessageText.match(regex);
                if (match && match[1]) {
                    targetCategoryName = match[1].trim();
                    break;
                }
            }
        }
        if (targetCategoryName) {
            const normalizedTargetCategory = normalizeString(targetCategoryName);
            if (!normalizedTargetCategory) {
                 localResponse = { role: 'model', text: `Could not identify the category name "${targetCategoryName}". Please specify a valid category.` };
            } else if (activeRequestsLoading) {
                localResponse = { role: 'model', text: "Loading requests data..." };
            } else if (activeRequestsError) {
                localResponse = { role: 'model', text: `Error loading requests: ${activeRequestsError}` };
            } else {
                const filteredItems = activeRequests.filter(req => req.categoryName && normalizeString(req.categoryName) === normalizedTargetCategory);
                if (filteredItems.length > 0) {
                    let responseText = `Found ${filteredItems.length} request(s) in category "${targetCategoryName}" (showing max 10):\n\n`;
                    filteredItems.slice(0, 10).forEach((req, index) => {
                        responseText += `${index + 1}. ${formatLink('request', req.id, req.title || 'Untitled Request')}\n`;
                    });
                    if (filteredItems.length > 10) responseText += `\n... and ${filteredItems.length - 10} more.`;
                    localResponse = { role: 'model', text: responseText };
                } else {
                    localResponse = { role: 'model', text: `No active requests found in the category "${targetCategoryName}".` };
                }
            }
        }

        let itemTypeForLocation = null;
        let potentialLocationPhrase = null;
        const locationQueryRegex = /\b(requests?|yeu cau|projects?|du an)\b\s+(?:in|tai|o|tại|tại tỉnh|tại thành phố|ở tỉnh|ở thành phố|tai tinh|tai thanh pho|o tinh|o thanh pho)\s+(.+)/i;
        const locationMatch = !localResponse && userMessageText.match(locationQueryRegex);
        if (locationMatch) {
            const itemTypeWord = locationMatch[1].toLowerCase();
            itemTypeForLocation = (itemTypeWord.includes("request") || itemTypeWord.includes("yeu cau")) ? "request" : "project";
            potentialLocationPhrase = locationMatch[2].trim();
        } else {
            const locationNoPrepRegex = /\b(requests?|yeu cau|projects?|du an)\b\s+(.+)/i;
            const noPrepMatch = !localResponse && userMessageText.match(locationNoPrepRegex);
            if (noPrepMatch) {
                const potentialLocation = noPrepMatch[2].trim();
                const possibleCode = findProvinceCodeByName(potentialLocation);
                const commonCities = ["hanoi", "ha noi", "da nang", "danang", "ho chi minh", "hcm"];
                if (possibleCode || commonCities.includes(normalizeString(potentialLocation))) {
                    const itemTypeWord = noPrepMatch[1].toLowerCase();
                    itemTypeForLocation = (itemTypeWord.includes("request") || itemTypeWord.includes("yeu cau")) ? "request" : "project";
                    potentialLocationPhrase = potentialLocation;
                }
            }
        }

        if (itemTypeForLocation && potentialLocationPhrase) {
            if (localProvincesLoading) {
                localResponse = { role: 'model', text: "Province list is still loading, please try again shortly." };
            } else if (localProvincesError) {
                localResponse = { role: 'model', text: `Error loading province data: ${localProvincesError}` };
            } else {
                const targetProvinceCode = findProvinceCodeByName(potentialLocationPhrase);
                const matchedProvince = targetProvinceCode ? localProvinces.find(p => p.code === targetProvinceCode) : null;
                const targetProvinceNameDisplay = matchedProvince ? matchedProvince.name : potentialLocationPhrase;
                const normalizedTargetName = normalizeString(potentialLocationPhrase);

                if (!targetProvinceCode && !normalizedTargetName) {
                     localResponse = { role: 'model', text: `Cannot identify the location "${potentialLocationPhrase}". Please specify a valid province or city.` };
                } else {
                    let dataToFilter = itemTypeForLocation === "request" ? activeRequests : projects;

                    if (itemTypeForLocation === "request" && activeRequestsLoading) {
                        localResponse = { role: 'model', text: "Requests data is still loading..." };
                    } else {
                         const filteredItems = dataToFilter.filter(item => {
                             if (item.provinceCode && targetProvinceCode && String(item.provinceCode) === String(targetProvinceCode)) {
                                 return true;
                             }
                             if (item.location && typeof item.location === 'string' && normalizedTargetName) {
                                 const { provinceName: provinceNameFromString } = parseLocationString(item.location);
                                 const normalizedNameFromString = normalizeString(provinceNameFromString);
                                 if (normalizedNameFromString && normalizedNameFromString.includes(normalizedTargetName)) {
                                     return true;
                                 }
                                 if (normalizeString(item.location).includes(normalizedTargetName)) {
                                     return true;
                                 }
                             }
                             return false;
                         });

                         if (filteredItems.length > 0) {
                            let responseText = `Found ${filteredItems.length} ${itemTypeForLocation}(s) matching "${targetProvinceNameDisplay}" (showing max 10):\n\n`;
                            filteredItems.slice(0, 10).forEach((item, index) => {
                                responseText += `${index + 1}. ${formatLink(itemTypeForLocation, item.id, item.title || `Untitled ${itemTypeForLocation}`)}\n`;
                            });
                            if (filteredItems.length > 10) responseText += `\n... and ${filteredItems.length - 10} more.`;
                            localResponse = { role: 'model', text: responseText };
                        } else {
                            localResponse = { role: 'model', text: `No active ${itemTypeForLocation}s found matching the location "${targetProvinceNameDisplay}".` };
                        }
                    }
                }
            }
        }

        const mostRequestsKeywords = [
            "tinh nao nhieu yeu cau nhat", "province with most requests", "most requests province",
            "tinh thanh nao co so luong yeu cau lon nhat", "most active province",
            "tỉnh nào có số lượng request lớn nhất"
        ];
        if (!localResponse && mostRequestsKeywords.some(keyword => lowerCaseNormalizedMessage.includes(normalizeString(keyword)))) {
            if (activeRequestsLoading || localProvincesLoading) {
                localResponse = { role: 'model', text: "Loading necessary data to determine the most active province..." };
            } else if (activeRequestsError || localProvincesError) {
                localResponse = { role: 'model', text: "Sorry, there was an error loading data needed for this query." };
            } else if (activeRequests.length === 0 || localProvinces.length === 0) {
                localResponse = { role: 'model', text: "There are no active requests to analyze." };
            } else {
                const provinceCounts = {};
                let maxCount = 0;
                let provincesWithMax = [];
                let requestsWithoutProvince = 0;

                activeRequests.forEach(req => {
                    let foundCode = null;
                    if (req.provinceCode) {
                        foundCode = String(req.provinceCode);
                    } else if (req.location) {
                        const { provinceName } = parseLocationString(req.location);
                        const codeFromName = findProvinceCodeByName(provinceName);
                        if (codeFromName) {
                            foundCode = String(codeFromName);
                        }
                    }

                    if (foundCode) {
                        provinceCounts[foundCode] = (provinceCounts[foundCode] || 0) + 1;
                        if (provinceCounts[foundCode] > maxCount) {
                            maxCount = provinceCounts[foundCode];
                            provincesWithMax = [foundCode];
                        } else if (provinceCounts[foundCode] === maxCount && !provincesWithMax.includes(foundCode)) {
                            provincesWithMax.push(foundCode);
                        }
                    } else {
                        requestsWithoutProvince++;
                    }
                });

                if (provincesWithMax.length > 0) {
                    const topProvinceNames = provincesWithMax.map(code => {
                        const province = localProvinces.find(p => String(p.code) === code);
                        return province ? province.name : `Unknown Province (Code ${code})`;
                    });
                    const tie = topProvinceNames.length > 1;
                    localResponse = {
                        role: 'model',
                        text: `The province${tie ? 's' : ''} with the most active requests (${maxCount} each) ${tie ? 'are' : 'is'}: ${topProvinceNames.join(', ')}.` +
                              (requestsWithoutProvince > 0 ? `\n(${requestsWithoutProvince} requests could not be mapped to a province).` : '')
                    };
                } else if (requestsWithoutProvince > 0 && activeRequests.length > 0) {
                     localResponse = { role: 'model', text: `Could not determine the province for ${requestsWithoutProvince} out of ${activeRequests.length} requests.` };
                } else {
                     localResponse = { role: 'model', text: `Could not determine the most active province from the available data.` };
                }
            }
        }

        const titleQueryRegex = /^(?:request|show|find|tim)\s+(?:yeu cau|project|du an|request\s+)?['"]?(.+?)['"]?$/i;
        const titleMatch = !localResponse && userMessageText.match(titleQueryRegex);
        if (titleMatch) {
            const targetTitle = titleMatch[1].trim();
            const normalizedTargetTitle = normalizeString(targetTitle);

            if (!normalizedTargetTitle) {
                localResponse = { role: 'model', text: "Please specify the title you are looking for." };
            } else if (activeRequestsLoading) {
                localResponse = { role: 'model', text: "Relevant data is still loading..." };
            } else if (activeRequestsError) {
                 localResponse = { role: 'model', text: `Error loading data: ${activeRequestsError}` };
            } else {
                const foundRequests = activeRequests.filter(req => req.title && normalizeString(req.title).includes(normalizedTargetTitle));
                const foundProjects = projects.filter(proj => proj.title && normalizeString(proj.title).includes(normalizedTargetTitle));

                const allFoundItems = [
                    ...foundRequests.map(req => ({ type: 'request', data: req })),
                    ...foundProjects.map(proj => ({ type: 'project', data: proj }))
                ];

                if (allFoundItems.length > 0) {
                    let responseText = `Found ${allFoundItems.length} item(s) matching "${targetTitle}" (showing max 5):\n\n`;
                    allFoundItems.slice(0, 5).forEach((item, index) => {
                        responseText += `${index + 1}. ${formatLink(item.type, item.data?.id, item.data?.title)}\n`;
                    });
                    if (allFoundItems.length > 5) responseText += `\n...and ${allFoundItems.length - 5} more.`;
                    localResponse = { role: 'model', text: responseText };
                } else {
                    localResponse = { role: 'model', text: `No request or project found with a title similar to "${targetTitle}".` };
                }
            }
        }


        const newUserMessage = { role: 'user', text: userMessageText };
        setChatHistory(prev => [...prev, newUserMessage]);
        setInputValue('');
        setChatError(null);
        scrollToBottom();

        if (localResponse) {
            setTimeout(() => {
                setChatHistory(prev => [...prev, localResponse]);
                scrollToBottom();
            }, 300);
            return;
        }

        setIsSending(true);
        try {
            const currentHistory = JSON.parse(localStorage.getItem(chatHistoryKey) || '[]');
            const historyForBackend = currentHistory;

            const response = await APIPrivate.post('/api/chat/gemini', {
                message: userMessageText,
                history: historyForBackend
            });

            const data = response.data;
            if (!data || typeof data.reply !== 'string') {
                 console.error("Invalid response structure from backend:", data);
                 throw new Error("Received invalid data structure from the server.");
            }

            const aiMessage = { role: 'model', text: data.reply };
            setChatHistory(prev => [...prev, aiMessage]);

        } catch (err) {
            let errorMsg = "Failed to get response from the assistant.";
            if (err.response) {
                errorMsg = err.response.data?.error || err.response.data?.message || `Request failed with status: ${err.response.status}`;
                 if (err.response.data?.details) {
                    console.error("Backend error details:", err.response.data.details);
                 }
            } else if (err.request) {
                errorMsg = "Could not connect to the chat service. Please check your network.";
            } else {
                errorMsg = err.message || "An unknown error occurred.";
            }
            console.error("Error calling chat API:", err);
            setChatError(errorMsg);
            message.error(`Error: ${errorMsg}`);

            setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, an error occurred: ${errorMsg}` }]);
        } finally {
            setIsSending(false);
            scrollToBottom();
        }
    }, [
        userId, inputValue, chatHistory, activeRequests, projects, localProvinces,
        localProvincesLoading, localProvincesError, activeRequestsLoading, activeRequestsError,
        findProvinceCodeByName, dispatch, chatHistoryKey,
        scrollToBottom
    ]);

    const customEmptyText = (
       <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
           <RobotOutlined style={{ fontSize: '24px', marginBottom: '10px' }}/>
           {userId ? (
                <>
                   <p>Ask FCharity Assistant anything!</p>
                   <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                      Examples: "List active requests", "Show projects in Điện Biên", "Admin contact info"
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
                        <List.Item key={`${item.role}-${index}-${Date.now()}`} className={`chat-message ${item.role === 'user' ? 'user-message' : 'ai-message'}`}>
                             <List.Item.Meta
                                avatar={
                                    item.role === 'user'
                                     ? (currentUserAvatar
                                        ? <Avatar size={avatarSize} src={currentUserAvatar} onError={() => false} />
                                        : <Avatar size={avatarSize} icon={<UserOutlined />} />)
                                    : (assistantAvatarUrl
                                        ? <Avatar size={avatarSize} src={assistantAvatarUrl} onError={() => false} />
                                        : <Avatar size={avatarSize} style={{ backgroundColor: '#1677ff' }} icon={<RobotOutlined />} />
                                      )
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
                 {chatError && !isSending && (
                    <div className="error-message">
                        <Text type="danger">{chatError}</Text>
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
                        activeRequestsLoading || localProvincesLoading ? "Initializing assistant..." :
                        isSending ? "Assistant is replying..." :
                        "Ask FCharity Assistant..."
                    }
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={handlePressEnter}
                    disabled={!userId || isSending || activeRequestsLoading || localProvincesLoading}
                    style={{ marginRight: '10px', flexGrow: 1 }}
                 />
                 <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={isSending}
                    disabled={!userId || !inputValue.trim() || isSending || activeRequestsLoading || localProvincesLoading}
                 >
                    Send
                 </Button>
            </div>
        </div>
    );
};

export default GeminiChatBox;