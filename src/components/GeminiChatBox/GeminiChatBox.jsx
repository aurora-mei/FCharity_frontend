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
    const avatarSize = 45; // <-- Định nghĩa kích thước mong muốn ở đây

    const activeRequests = activeRequestsData.map(item => ({
        ...item.helpRequest,
        provinceCode: item.helpRequest?.provinceCode,
        categoryName: item.helpRequest?.category?.categoryName,
        attachments: item.attachments || [],
        tags: item.requestTags?.map(rt => rt.tag?.tagName) || [],
    }));

    useEffect(() => {
        let currentUserId = null; let userAvatar = null;
        try { const storedUser = localStorage.getItem("currentUser"); if (storedUser) { const parsedUser = JSON.parse(storedUser); currentUserId = parsedUser?.id; userAvatar = parsedUser?.avatar || null; } }
        catch (err) { console.error("Error parsing currentUser:", err); }
        setUserId(currentUserId); setCurrentUserAvatar(userAvatar); setChatHistoryKey(currentUserId ? `fcharityChatHistory_${currentUserId}` : null);
    }, []);

    useEffect(() => {
        if (!chatHistoryKey) { setChatHistory([]); return; }
        try { const savedHistory = localStorage.getItem(chatHistoryKey); if (savedHistory) { const parsedHistory = JSON.parse(savedHistory); if (Array.isArray(parsedHistory) && parsedHistory.every(item => item && typeof item === 'object' && item.role && item.text)) { setChatHistory(parsedHistory); } else { localStorage.removeItem(chatHistoryKey); setChatHistory([]); } } else { setChatHistory([]); } }
        catch (e) { localStorage.removeItem(chatHistoryKey); setChatHistory([]); }
    }, [chatHistoryKey]);

    useEffect(() => {
        if (!chatHistoryKey) return;
        if (chatHistory.length > 0) { try { localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory)); } catch (e) { message.error("Could not save chat."); } }
        else { if (localStorage.getItem(chatHistoryKey)) { localStorage.removeItem(chatHistoryKey); } }
    }, [chatHistory, chatHistoryKey]);

    useEffect(() => { if (!activeRequestsLoading && activeRequestsData.length === 0) { dispatch(fetchActiveRequests()); } }, [dispatch, activeRequestsLoading, activeRequestsData.length]);

    useEffect(() => {
        let isMounted = true; setLocalProvincesLoading(true); setLocalProvincesError(null);
        fetch('https://provinces.open-api.vn/api/p/?depth=1')
            .then(res => { if (!res.ok) throw new Error(`HTTP error! ${res.status}`); return res.json(); })
            .then(data => { if (isMounted && Array.isArray(data)) { setLocalProvinces(data); } else if (isMounted) { throw new Error("Invalid province data."); } })
            .catch(err => { if (isMounted) { setLocalProvincesError(err.message || "Failed fetch."); setLocalProvinces([]); } })
            .finally(() => { if (isMounted) setLocalProvincesLoading(false); });
        return () => { isMounted = false; };
    }, []);

    const scrollToBottom = () => { setTimeout(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, 100); };
    useEffect(scrollToBottom, [chatHistory, isSending]);

    const handleInputChange = (e) => { setInputValue(e.target.value); if (chatError) setChatError(null); };
    const handlePressEnter = (e) => { if (e.key === 'Enter' && !e.shiftKey && !isSending && inputValue.trim()) { e.preventDefault(); handleSendMessage(); } };

    const findProvinceCodeByName = useCallback((name) => {
        if (!name || !localProvinces || localProvinces.length === 0) return null; const normalizedNameToFind = normalizeString(name); if (!normalizedNameToFind) return null;
        for (const province of localProvinces) { const normalizedFullName = normalizeString(province.name); if (normalizedFullName === normalizedNameToFind) return province.code; const nameWithoutPrefix = province.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim(); const normalizedNameWithoutPrefix = normalizeString(nameWithoutPrefix); if (normalizedNameWithoutPrefix === normalizedNameToFind) return province.code; }
        for (const province of localProvinces) { const normalizedFullName = normalizeString(province.name); if (normalizedFullName.includes(normalizedNameToFind)) return province.code; const nameWithoutPrefix = province.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim(); const normalizedNameWithoutPrefix = normalizeString(nameWithoutPrefix); if (normalizedNameWithoutPrefix.includes(normalizedNameToFind)) return province.code; }
        return null;
    }, [localProvinces]);

    const handleSendMessage = useCallback(async () => {
        if (!userId) { message.warn("Please log in."); return; }
        const userMessageText = inputValue.trim(); if (!userMessageText) return;
        const lowerCaseNormalizedMessage = normalizeString(userMessageText); let localResponse = null;

        const adminContactKeywords = ["admin contact", "lien lac admin", "thong tin admin", "contact admin", "admin info", "admin liên hệ", "admin thông tin", "admin contact info", "admin contact information","admin"];
        if (!localResponse && adminContactKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) { localResponse = { role: 'model', text: `Admin contact:\n\n*   **Phone:** 0828006916\n*   **Facebook:** [https://www.facebook.com/dtrg.1101/](https://www.facebook.com/dtrg.1101/)` }; }
        const listRequestKeywords = ["list request", "show request", "hien thi request", "danh sach yeu cau", "list active request", "cac yeu cau hien co", "all requests"];
        if (!localResponse && listRequestKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) { if (activeRequestsLoading) { localResponse = { role: 'model', text: "Loading requests..." }; } else if (activeRequests && activeRequests.length > 0) { let responseText = `Active requests (max 10):\n\n`; activeRequests.slice(0, 10).forEach((req, index) => { responseText += `${index + 1}. ${formatLink('request', req.id, req.title)}\n`; }); if (activeRequests.length > 10) responseText += `\n... and ${activeRequests.length - 10} more.`; localResponse = { role: 'model', text: responseText }; } else { localResponse = { role: 'model', text: "No active requests." }; } }
        const listProjectKeywords = ["list project", "show project", "hien thi du an", "danh sach du an", "all projects"];
        if (!localResponse && listProjectKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) { if (projects && projects.length > 0) { let responseText = "Active projects (max 10):\n\n"; projects.slice(0, 10).forEach((proj, index) => { responseText += `${index + 1}. ${formatLink('project', proj.id, proj.title)}\n`; }); if (projects.length > 10) responseText += `\n... and ${projects.length - 10} more.`; localResponse = { role: 'model', text: responseText }; } else { localResponse = { role: 'model', text: "No active projects." }; } }
        let targetCategoryName = null; const categoryQueryRegexes = [ /(?:requests?|yeu cau)\s+(?:in|thuoc|voi)\s+(?:category|danh muc)\s+['"]?(.+?)['"]?/i, /['"]?(.+?)['"]?\s+(?:category|danh muc)\s+(?:requests?|yeu cau)/i, /^(?:requests?|yeu cau)\s+(?:category|danh muc)\s+['"]?(.+?)['"]?/i ]; if (!localResponse) { for (const regex of categoryQueryRegexes) { const match = userMessageText.match(regex); if (match && match[1]) { targetCategoryName = match[1].trim(); break; } } }
        if (targetCategoryName) { const normalizedTargetCategory = normalizeString(targetCategoryName); if (!normalizedTargetCategory) { localResponse = { role: 'model', text: "Invalid category name." }; } else if (activeRequestsLoading) { localResponse = { role: 'model', text: "Loading requests..." }; } else if (activeRequestsError) { localResponse = { role: 'model', text: `Error loading requests: ${activeRequestsError}` }; } else { const filteredItems = activeRequests.filter(req => req.categoryName && normalizeString(req.categoryName) === normalizedTargetCategory); if (filteredItems.length > 0) { let responseText = `Requests in "${targetCategoryName}" (max 10):\n\n`; filteredItems.slice(0, 10).forEach((req, index) => { responseText += `${index + 1}. ${formatLink('request', req.id, req.title)}\n`; }); if (filteredItems.length > 10) responseText += `\n... and ${filteredItems.length - 10} more.`; localResponse = { role: 'model', text: responseText }; } else { localResponse = { role: 'model', text: `No requests found in category "${targetCategoryName}".` }; } } }
        let itemTypeForLocation = null; let potentialLocationPhrase = null; const locationQueryRegex = /\b(requests?|yeu cau|projects?|du an)\b\s+(?:in|tai|o|tại|tại tỉnh|tại thành phố|ở tỉnh|ở thành phố|tai tinh|tai thanh pho|o tinh|o thanh pho)\s+(.+)/i; const locationMatch = !localResponse && userMessageText.match(locationQueryRegex); if (locationMatch) { const itemTypeWord = locationMatch[1].toLowerCase(); itemTypeForLocation = (itemTypeWord.includes("request") || itemTypeWord.includes("yeu cau")) ? "request" : "project"; potentialLocationPhrase = locationMatch[2].trim(); } else { const locationNoPrepRegex = /\b(requests?|yeu cau|projects?|du an)\b\s+(.+)/i; const noPrepMatch = !localResponse && userMessageText.match(locationNoPrepRegex); if (noPrepMatch) { const potentialLocation = noPrepMatch[2].trim(); const possibleCode = findProvinceCodeByName(potentialLocation); if (possibleCode || ["hanoi", "ha noi", "da nang", "danang", "ho chi minh", "hcm"].includes(normalizeString(potentialLocation))) { const itemTypeWord = noPrepMatch[1].toLowerCase(); itemTypeForLocation = (itemTypeWord.includes("request") || itemTypeWord.includes("yeu cau")) ? "request" : "project"; potentialLocationPhrase = potentialLocation; } } }
        if (itemTypeForLocation && potentialLocationPhrase) { if (localProvincesLoading) { localResponse = { role: 'model', text: "Province list loading..." }; } else if (localProvincesError) { localResponse = { role: 'model', text: `Error loading province: ${localProvincesError}` }; } else { const targetProvinceCode = findProvinceCodeByName(potentialLocationPhrase); const matchedProvince = targetProvinceCode ? localProvinces.find(p => p.code === targetProvinceCode) : null; const targetProvinceNameDisplay = matchedProvince ? matchedProvince.name : potentialLocationPhrase; const normalizedTargetName = normalizeString(potentialLocationPhrase); if (!targetProvinceCode && !normalizedTargetName) { localResponse = { role: 'model', text: `Cannot identify location "${potentialLocationPhrase}".` }; } else { let dataToFilter = itemTypeForLocation === "request" ? activeRequests : projects; if (itemTypeForLocation === "request" && activeRequestsLoading) { localResponse = { role: 'model', text: "Requests loading..." }; } else { const filteredItems = dataToFilter.filter(item => { if (item.provinceCode && targetProvinceCode && String(item.provinceCode) === String(targetProvinceCode)) return true; if (item.location && typeof item.location === 'string') { const { provinceName: provinceNameFromString } = parseLocationString(item.location); const normalizedNameFromString = normalizeString(provinceNameFromString); if (normalizedNameFromString && normalizedTargetName && normalizedNameFromString.includes(normalizedTargetName)) return true; if (normalizedTargetName && normalizeString(item.location).includes(normalizedTargetName)) return true; } return false; }); if (filteredItems.length > 0) { let responseText = `${itemTypeForLocation}s matching "${targetProvinceNameDisplay}" (max 10):\n\n`; filteredItems.slice(0, 10).forEach((item, index) => { responseText += `${index + 1}. ${formatLink(itemTypeForLocation, item.id, item.title)}\n`; }); if (filteredItems.length > 10) responseText += `\n... and ${filteredItems.length - 10} more.`; localResponse = { role: 'model', text: responseText }; } else { localResponse = { role: 'model', text: `No ${itemTypeForLocation}s found matching "${targetProvinceNameDisplay}".` }; } } } } }
        const mostRequestsKeywords = ["tinh nao nhieu yeu cau nhat", "province with most requests", "most requests province", "tinh thanh nao co so luong yeu cau lon nhat", "most active province", "tỉnh nào có số lượng request lớn nhất"]; if (!localResponse && mostRequestsKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) { if (activeRequestsLoading || localProvincesLoading) { localResponse = { role: 'model', text: "Loading data..." }; } else if (activeRequestsError || localProvincesError) { localResponse = { role: 'model', text: "Error loading data." }; } else if (activeRequests.length === 0 || localProvinces.length === 0) { localResponse = { role: 'model', text: "No active requests." }; } else { const provinceCounts = {}; let maxCount = 0; let provincesWithMax = []; let requestsWithoutProvince = 0; activeRequests.forEach(req => { let foundCode = null; if (req.provinceCode) { foundCode = String(req.provinceCode); } else if (req.location) { const { provinceName } = parseLocationString(req.location); const codeFromName = findProvinceCodeByName(provinceName); if (codeFromName) { foundCode = String(codeFromName); } } if (foundCode) { provinceCounts[foundCode] = (provinceCounts[foundCode] || 0) + 1; if (provinceCounts[foundCode] > maxCount) { maxCount = provinceCounts[foundCode]; provincesWithMax = [foundCode]; } else if (provinceCounts[foundCode] === maxCount && !provincesWithMax.includes(foundCode)) { provincesWithMax.push(foundCode); } } else { requestsWithoutProvince++; } }); if (provincesWithMax.length > 0) { const topProvinceNames = provincesWithMax.map(code => { const province = localProvinces.find(p => String(p.code) === code); return province ? province.name : `Code ${code}`; }); const tie = topProvinceNames.length > 1; localResponse = { role: 'model', text: `Province(s) with most requests (${maxCount} each): ${topProvinceNames.join(', ')}.` + (requestsWithoutProvince > 0 ? `\n(${requestsWithoutProvince} unmapped)` : '') }; } else if (requestsWithoutProvince > 0 && activeRequests.length > 0) { localResponse = { role: 'model', text: `Could not map ${requestsWithoutProvince}/${activeRequests.length} requests.` }; } else { localResponse = { role: 'model', text: `Could not determine most active province.` }; } } }
        const titleQueryRegex = /^(?:request|show|find|tim)\s+(?:yeu cau|project|du an|request\s+)?['"]?(.+?)['"]?$/i; const titleMatch = !localResponse && userMessageText.match(titleQueryRegex); if (titleMatch) { const targetTitle = titleMatch[1].trim(); const normalizedTargetTitle = normalizeString(targetTitle); if (!normalizedTargetTitle) { localResponse = { role: 'model', text: "Specify title." }; } else if (activeRequestsLoading) { localResponse = { role: 'model', text: "Data loading..." }; } else if (activeRequestsError) { localResponse = { role: 'model', text: "Error loading data." }; } else { const foundRequests = activeRequests.filter(req => req.title && normalizeString(req.title).includes(normalizedTargetTitle)); const foundProjects = projects.filter(proj => proj.title && normalizeString(proj.title).includes(normalizedTargetTitle)); const allFoundItems = [ ...foundRequests.map(req => ({ type: 'request', data: req })), ...foundProjects.map(proj => ({ type: 'project', data: proj })) ]; if (allFoundItems.length > 0) { let responseText = `Found item(s) matching "${targetTitle}" (max 5):\n\n`; allFoundItems.slice(0, 5).forEach((item, index) => { responseText += `${index + 1}. ${formatLink(item.type, item.data?.id, item.data?.title)}\n`; }); if (allFoundItems.length > 5) responseText += `\n...and ${allFoundItems.length - 5} more.`; localResponse = { role: 'model', text: responseText }; } else { localResponse = { role: 'model', text: `No item found matching "${targetTitle}".` }; } } }

        const newUserMessage = { role: 'user', text: userMessageText };
        setChatHistory(prev => [...prev, newUserMessage]);
        setInputValue('');
        setChatError(null);

        if (localResponse) {
            setTimeout(() => { setChatHistory(prev => [...prev, localResponse]); }, 300);
            return;
        }

        setIsSending(true);
        try {
            const historyForBackend = chatHistory;
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
            let errorMsg = "Failed to get response from assistant.";
            if (err.response) {
                errorMsg = err.response.data?.error || err.response.data?.message || `Request failed: ${err.response.status}`;
            } else if (err.request) {
                errorMsg = "No response received from the server.";
            } else {
                errorMsg = err.message || "An unknown error occurred.";
            }
            console.error("Error calling backend chat API:", err);
            setChatError(`Error: ${errorMsg}`);
            message.error(`Error: ${errorMsg}`);
            setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, error occurred: ${errorMsg}` }]);
        } finally {
            setIsSending(false);
        }
    }, [
        userId, inputValue, chatHistory, activeRequests, projects, localProvinces,
        localProvincesLoading, localProvincesError, activeRequestsLoading, activeRequestsError,
        findProvinceCodeByName, dispatch,
    ]);

    const customEmptyText = (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            <RobotOutlined style={{ fontSize: '24px', marginBottom: '10px' }}/>
            {userId ? (
                 <>
                    <p>Ask FCharity Assistant anything!</p>
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                       Examples: "List all requests", "Requests in Điện Biên", "Contact admin"
                    </Text>
                 </>
             ) : ( <p>Please log in to use the assistant.</p> )}
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
                                     // Thêm size={avatarSize} cho avatar người dùng
                                     ? (currentUserAvatar
                                        ? <Avatar size={avatarSize} src={currentUserAvatar} onError={() => false} />
                                        : <Avatar size={avatarSize} icon={<UserOutlined />} />)
                                    // Thêm size={avatarSize} cho avatar assistant
                                    : (assistantAvatarUrl
                                        ? <Avatar size={avatarSize} src={assistantAvatarUrl} onError={() => false} />
                                        : <Avatar size={avatarSize} style={{ backgroundColor: '#1677ff' }} icon={<RobotOutlined />} />
                                      )
                                  }
                                title={<Text strong>{item.role === 'user' ? 'You' : 'Chat bot siêu đỉnh số 1'}</Text>}
                                description={ <ReactMarkdown children={item.text} components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" /> }} /> }
                             />
                         </List.Item>
                    )}
                />
                {isSending && ( <div className="loading-indicator"> <Spin size="small" /><span style={{ marginLeft: 8, color: '#555' }}>Assistant is thinking...</span> </div> )}
                 {chatError && !isSending && ( <div className="error-message"> <Text type="danger">Error: {chatError}</Text> </div> )}
                 <div ref={chatEndRef} style={{ height: "1px" }} />
            </div>
            <div className="chat-input-area">
                 <TextArea
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={ !userId ? "Log in to chat" : activeRequestsLoading || localProvincesLoading ? "Initializing..." : isSending ? "Waiting..." : "Ask FCharity Assistant..." }
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={handlePressEnter}
                    disabled={isSending || !userId || activeRequestsLoading || localProvincesLoading}
                    style={{ marginRight: '10px', flexGrow: 1 }}
                 />
                 <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={isSending}
                    disabled={!inputValue.trim() || isSending || !userId || activeRequestsLoading || localProvincesLoading}
                 >Send</Button>
            </div>
        </div>
    );
};

export default GeminiChatBox;