import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, List, Spin, message, Typography, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActiveRequests } from '../../redux/request/requestSlice';
// import { fetchProjects } from '../../redux/project/projectSlice'; // If you have projects

import ReactMarkdown from 'react-markdown';
import './GeminiChatBox.pcss';

const { Text } = Typography;
const { TextArea } = Input;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API;

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

    if (!provincePart && parts.length > 0) {
        provincePart = parts[parts.length - 1];
    }

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
    // const projectsLoading = useSelector(state => state.project?.loading);

    const activeRequests = activeRequestsData.map(item => ({
        ...item.helpRequest,
        provinceCode: item.helpRequest?.provinceCode,
        categoryName: item.helpRequest?.category?.categoryName,
        attachments: item.attachments || [],
        tags: item.requestTags?.map(rt => rt.tag?.tagName) || [],
    }));

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
            console.error("Error parsing currentUser for chat:", err);
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
                if (Array.isArray(parsedHistory) && parsedHistory.every(item => item && typeof item === 'object' && item.role && item.text)) {
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
            // dispatch(fetchProjects());
        }
    }, [dispatch, activeRequestsLoading, activeRequestsData.length]);

    useEffect(() => {
        let isMounted = true;
        setLocalProvincesLoading(true);
        setLocalProvincesError(null);
        fetch('https://provinces.open-api.vn/api/p/?depth=1')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error fetching provinces! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (isMounted && Array.isArray(data)) {
                     setLocalProvinces(data);
                } else if (isMounted) {
                     throw new Error("Invalid province data format received.");
                }
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

    const scrollToBottom = () => {
        setTimeout(() => {
             chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
    };
    useEffect(scrollToBottom, [chatHistory, isSending]);

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
            if (normalizedFullName === normalizedNameToFind) {
                return province.code;
            }
            const nameWithoutPrefix = province.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
            const normalizedNameWithoutPrefix = normalizeString(nameWithoutPrefix);
            if (normalizedNameWithoutPrefix === normalizedNameToFind) {
                return province.code;
            }
        }
        for (const province of localProvinces) {
             const normalizedFullName = normalizeString(province.name);
             if (normalizedFullName.includes(normalizedNameToFind)) {
                 return province.code;
             }
             const nameWithoutPrefix = province.name.replace(/^(Tỉnh|Thành phố|TP)\s+/i, "").trim();
             const normalizedNameWithoutPrefix = normalizeString(nameWithoutPrefix);
              if (normalizedNameWithoutPrefix.includes(normalizedNameToFind)) {
                 return province.code;
             }
        }

        return null;
    }, [localProvinces]);

    const createChatContext = useCallback(() => {
        let context = "";

        if (activeRequestsLoading) {
            context += "\n(Loading active requests...)\n";
        } else if (activeRequests && activeRequests.length > 0) {
            context += "\n--- Currently Active Requests (Sample) ---\n";
            activeRequests.slice(0, 7).forEach((req) => {
                context += `- Title: ${req.title || 'Untitled Request'}, ID: ${req.id}, Category: ${req.categoryName || 'N/A'}, Location: ${req.location || 'Unknown'}, ProvinceCode: ${req.provinceCode || 'N/A'}\n`;
            });
            context += `(Total: ${activeRequests.length} active requests)\n`;
            context += "-----------------------------------------\n";
        } else {
            context += "\n(No active requests found)\n";
        }

        // if (projectsLoading) {
        //     context += "\n(Loading active projects...)\n";
        // } else
        if (projects && projects.length > 0) {
            context += "\n--- Active Projects (Sample) ---\n";
            projects.slice(0, 5).forEach((proj) => {
                context += `- Title: ${proj.title || 'Untitled Project'}, ID: ${proj.id}\n`;
            });
             context += `(Total: ${projects.length} active projects)\n`;
             context += "-----------------------------\n";
        } else {
             context += "\n(No active projects found)\n";
        }

        return context ? "\n\n--- FCharity Application Context ---\n" + context : "";
    }, [activeRequests, projects, activeRequestsLoading /*, projectsLoading */]);

    const handleSendMessage = useCallback(async () => {
        if (!userId) {
            message.warn("Please log in to use the chat assistant.");
            return;
        }
        const userMessageText = inputValue.trim();
        if (!userMessageText) return;

        const lowerCaseNormalizedMessage = normalizeString(userMessageText);
        let localResponse = null;

        // --- START LOCAL RESPONSES ---

        // 1. Admin Contact Info
        const adminContactKeywords = ["admin contact", "lien lac admin", "thong tin admin", "contact admin", "admin info", "admin liên hệ", "admin thông tin", "admin contact info", "admin contact information","admin"];
        if (!localResponse && adminContactKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) {
            localResponse = {
                role: 'model',
                text: `Here is the admin contact information:\n\n*   **Phone:** 0828006916\n*   **Facebook:** [https://www.facebook.com/dtrg.1101/](https://www.facebook.com/dtrg.1101/)`
            };
        }

        // 2. List all requests
        const listRequestKeywords = ["list request", "show request", "hien thi request", "danh sach yeu cau", "list active request", "cac yeu cau hien co", "all requests"];
        if (!localResponse && listRequestKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) {
            if (activeRequestsLoading) {
                localResponse = { role: 'model', text: "Still loading active requests, please wait a moment..." };
            } else if (activeRequests && activeRequests.length > 0) {
                let responseText = `Here are the currently active requests (showing up to 10):\n\n`;
                activeRequests.slice(0, 10).forEach((req, index) => {
                    responseText += `${index + 1}. ${formatLink('request', req.id, req.title)}\n`;
                });
                if (activeRequests.length > 10) responseText += `\n... and ${activeRequests.length - 10} more.`;
                localResponse = { role: 'model', text: responseText };
            } else {
                localResponse = { role: 'model', text: "No active requests found at the moment." };
            }
        }

        // 3. List all projects
        const listProjectKeywords = ["list project", "show project", "hien thi du an", "danh sach du an", "all projects"];
        if (!localResponse && listProjectKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) {
            // if (projectsLoading) { ... }
            if (projects && projects.length > 0) {
                let responseText = "Here are the active projects (showing up to 10):\n\n";
                projects.slice(0, 10).forEach((proj, index) => {
                    responseText += `${index + 1}. ${formatLink('project', proj.id, proj.title)}\n`;
                });
                 if (projects.length > 10) responseText += `\n... and ${projects.length - 10} more.`;
                localResponse = { role: 'model', text: responseText };
            } else {
                localResponse = { role: 'model', text: "No active projects found at the moment." };
            }
        }

        // 4. List requests by Category
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
                localResponse = { role: 'model', text: "Please specify a valid category name." };
            } else if (activeRequestsLoading) {
                localResponse = { role: 'model', text: "Still loading requests, please try asking about the category again shortly." };
            } else if (activeRequestsError) {
                localResponse = { role: 'model', text: `Sorry, there was an error loading requests: ${activeRequestsError}` };
            } else {
                const filteredItems = activeRequests.filter(req => {
                    return req.categoryName && normalizeString(req.categoryName) === normalizedTargetCategory;
                });

                if (filteredItems.length > 0) {
                    let responseText = `Okay, here are the active requests found in the "${targetCategoryName}" category (showing up to 10):\n\n`;
                    filteredItems.slice(0, 10).forEach((req, index) => {
                        responseText += `${index + 1}. ${formatLink('request', req.id, req.title)}\n`;
                    });
                    if (filteredItems.length > 10) responseText += `\n... and ${filteredItems.length - 10} more.`;
                    localResponse = { role: 'model', text: responseText };
                } else {
                     localResponse = { role: 'model', text: `I couldn't find any active requests in the "${targetCategoryName}" category right now.` };
                }
            }
        }

        // 5. List requests/projects by Location
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
                 if (possibleCode || ["hanoi", "ha noi", "da nang", "danang", "ho chi minh", "hcm"].includes(normalizeString(potentialLocation))) { // Heuristic for major cities
                     const itemTypeWord = noPrepMatch[1].toLowerCase();
                     itemTypeForLocation = (itemTypeWord.includes("request") || itemTypeWord.includes("yeu cau")) ? "request" : "project";
                     potentialLocationPhrase = potentialLocation;
                 }
             }
        }

        if (itemTypeForLocation && potentialLocationPhrase) {
            if (localProvincesLoading) {
                localResponse = { role: 'model', text: "The province list is still loading. Please wait a moment and try searching by location again." };
            } else if (localProvincesError) {
                localResponse = { role: 'model', text: `Error loading province list, cannot search by location: ${localProvincesError}` };
            } else {
                const targetProvinceCode = findProvinceCodeByName(potentialLocationPhrase);
                const matchedProvince = targetProvinceCode ? localProvinces.find(p => p.code === targetProvinceCode) : null;
                const targetProvinceNameDisplay = matchedProvince ? matchedProvince.name : potentialLocationPhrase;
                 const normalizedTargetName = normalizeString(potentialLocationPhrase); // Use user input for string matching

                if (!targetProvinceCode && !normalizedTargetName) {
                     localResponse = { role: 'model', text: `Sorry, I couldn't confidently identify the location "${potentialLocationPhrase}". Please try specifying the province or city name clearly.` };
                } else {
                    let dataToFilter = itemTypeForLocation === "request" ? activeRequests : projects;
                     if (itemTypeForLocation === "request" && activeRequestsLoading) {
                         localResponse = { role: 'model', text: "Requests are still loading. Please try searching by location again shortly." };
                     } // else if (itemTypeForLocation === "project" && projectsLoading) { ... }
                     else {
                         const filteredItems = dataToFilter.filter(item => {
                            if (item.provinceCode && targetProvinceCode && String(item.provinceCode) === String(targetProvinceCode)) {
                                return true;
                            }
                            if (item.location && typeof item.location === 'string') {
                                const { provinceName: provinceNameFromString } = parseLocationString(item.location);
                                const normalizedNameFromString = normalizeString(provinceNameFromString);

                                if (normalizedNameFromString && normalizedTargetName && normalizedNameFromString.includes(normalizedTargetName)) {
                                    return true;
                                }
                                // Check if the raw location string contains the normalized target name
                                if (normalizedTargetName && normalizeString(item.location).includes(normalizedTargetName)) {
                                    return true;
                                }
                            }
                            return false;
                        });

                        if (filteredItems.length > 0) {
                            let responseText = `Okay, here are the active ${itemTypeForLocation}s I found matching "${targetProvinceNameDisplay}" (showing up to 10):\n\n`;
                            filteredItems.slice(0, 10).forEach((item, index) => {
                                responseText += `${index + 1}. ${formatLink(itemTypeForLocation, item.id, item.title)}\n`;
                            });
                            if (filteredItems.length > 10) responseText += `\n... and ${filteredItems.length - 10} more.`;
                            localResponse = { role: 'model', text: responseText };
                        } else {
                            localResponse = { role: 'model', text: `I couldn't find any active ${itemTypeForLocation}s matching "${targetProvinceNameDisplay}" based on the available location data.` };
                        }
                    }
                }
            }
        }

        // 6. Find province with most requests
        const mostRequestsKeywords = ["tinh nao nhieu yeu cau nhat", "province with most requests", "most requests province", "tinh thanh nao co so luong yeu cau lon nhat", "most active province", "tỉnh nào có số lượng request lớn nhất"];
         if (!localResponse && mostRequestsKeywords.some(keyword => lowerCaseNormalizedMessage.includes(keyword))) {
             if (activeRequestsLoading || localProvincesLoading) {
                 localResponse = { role: 'model', text: "Still loading data needed to determine the most active province. Please ask again in a moment." };
             } else if (activeRequestsError || localProvincesError) {
                 localResponse = { role: 'model', text: "Sorry, there was an error loading the data needed to answer that." };
             } else if (activeRequests.length === 0 || localProvinces.length === 0) {
                 localResponse = { role: 'model', text: "There are currently no active requests to analyze for province activity." };
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
                         text: `The ${tie ? 'provinces tied' : 'province'} with the most active requests (${maxCount} each) currently ${tie ? 'are' : 'is'}: ${topProvinceNames.join(', ')}.` +
                               (requestsWithoutProvince > 0 ? `\n(${requestsWithoutProvince} requests couldn't be reliably mapped to a known province).` : '')
                     };
                 } else if (requestsWithoutProvince > 0 && activeRequests.length > 0) {
                     localResponse = { role: 'model', text: `Could not determine province information for most active requests (${requestsWithoutProvince} out of ${activeRequests.length}).` };
                 } else {
                     localResponse = { role: 'model', text: `Could not determine the province with the most requests. There might be issues mapping requests to provinces.` };
                 }
             }
         }

        // 7. Find request/project by Title
        const titleQueryRegex = /^(?:request|show|find|tim)\s+(?:yeu cau|project|du an|request\s+)?['"]?(.+?)['"]?$/i;
        const titleMatch = !localResponse && userMessageText.match(titleQueryRegex);

        if (titleMatch) {
            const targetTitle = titleMatch[1].trim();
            const normalizedTargetTitle = normalizeString(targetTitle);

            if (!normalizedTargetTitle) {
                localResponse = { role: 'model', text: "Please specify a title to search for." };
            } else if (activeRequestsLoading /* || projectsLoading */) {
                 localResponse = { role: 'model', text: "Data is still loading. Please try searching by title again shortly." };
            } else if (activeRequestsError /* || projectsError */) {
                 localResponse = { role: 'model', text: "Sorry, there was an error loading data needed for the title search." };
            } else {
                const foundRequests = activeRequests.filter(req =>
                    req.title && normalizeString(req.title).includes(normalizedTargetTitle)
                );
                const foundProjects = projects.filter(proj =>
                    proj.title && normalizeString(proj.title).includes(normalizedTargetTitle)
                );

                const allFoundItems = [
                    ...foundRequests.map(req => ({ type: 'request', data: req })),
                    ...foundProjects.map(proj => ({ type: 'project', data: proj }))
                ];

                if (allFoundItems.length > 0) {
                    let responseText = `Okay, I found the following item(s) matching "${targetTitle}" (showing up to 5):\n\n`;
                    allFoundItems.slice(0, 5).forEach((item, index) => {
                        responseText += `${index + 1}. ${formatLink(item.type, item.data?.id, item.data?.title)}\n`;
                    });
                    if (allFoundItems.length > 5) {
                        responseText += `\n...and ${allFoundItems.length - 5} more.`;
                    }
                    localResponse = { role: 'model', text: responseText };
                } else {
                    localResponse = { role: 'model', text: `Sorry, I couldn't find any active request or project with a title similar to "${targetTitle}".` };
                }
            }
        }

        // --- END LOCAL RESPONSES ---

        const newUserMessage = { role: 'user', text: userMessageText };
        setChatHistory(prev => [...prev, newUserMessage]);
        setInputValue('');
        setChatError(null);

        if (localResponse) {
            setTimeout(() => {
                setChatHistory(prev => [...prev, localResponse]);
            }, 300);
            return; // Return early if local response was generated
        }

        // --- Fallback to Gemini API ---
        setIsSending(true);

        if (!GEMINI_API_KEY) {
            const errorMsg = 'API key is not configured. Please contact the administrator.';
            message.error(errorMsg);
            setChatError(errorMsg);
            setChatHistory(prev => [...prev, { role: 'model', text: `Configuration error: ${errorMsg}` }]);
            setIsSending(false);
            return;
        }

        const historyForApi = chatHistory.map(msg => ({
             role: msg.role,
             parts: [{ text: msg.text }],
         }));
         // Don't push the user message again here, it was added to chatHistory already.
         // The API payload will use the updated chatHistory.

        const chatContext = createChatContext();
        const systemInstruction = `You are FCharity Assistant, a helpful AI integrated into the FCharity platform. Your primary goal is to assist users by answering questions about active help requests and projects based *only* on the provided Application Context.
- Be friendly, professional, and concise.
- Focus on charity-related topics relevant to the FCharity platform.
- **Use the Application Context below to answer questions about specific requests or projects.** If the context doesn't contain the information, state that you don't have specific details based on the provided sample context. Do not invent information.
- When listing requests or projects, provide links using Markdown: [**Item Title**](/requests/{id}) or [**Item Title**](/projects/{id}). Use the ID from the context.
- If asked for information not in the context (e.g., details of a request not listed), politely state that the specific item wasn't in the provided sample context and suggest searching the platform.
- Do not answer questions outside the scope of FCharity or the provided context. If asked about admin contact info, state that you cannot provide personal contact details but suggest checking the official website or contacting support through designated channels.
- Respond in the same language as the user's query (English or Vietnamese).`;


        // Prepare the Gemini payload using the latest chat history
        const apiPayloadContents = chatHistory.map(msg => ({
             role: msg.role,
             parts: [{ text: msg.text }],
         }));

        const apiPayload = {
             contents: [
                 // Combine instruction, context, and the conversation history ending with the latest user query
                 {
                     role: 'user',
                     parts: [{ text: `${systemInstruction}${chatContext}\n\n--- Conversation History ---` }]
                 },
                 ...apiPayloadContents.slice(0,-1).map(c => ({ role: c.role, parts: c.parts})), // Send history except last user msg
                 {
                    role: 'user', // Ensure the last message is marked as user
                    parts: [{text: userMessageText}] // Send only the text of the last user message here
                 }

             ],
              "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
              ],
              "generationConfig": {
                "temperature": 0.7,
                "topK": 1,
                "topP": 1,
                "maxOutputTokens": 2048,
              }
         };


        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', },
                 body: JSON.stringify(apiPayload),
             });

            const data = await response.json();

            if (!response.ok) {
                 const apiErrorMessage = data?.error?.message || `API request failed with status: ${response.status}`;
                 if (data?.promptFeedback?.blockReason) {
                      throw new Error(`Content blocked by API: ${data.promptFeedback.blockReason}. Reason: ${data.promptFeedback?.blockReasonMessage || 'Safety/Policy Violation'}`);
                 }
                throw new Error(apiErrorMessage);
            }

            const candidate = data.candidates?.[0];
            const finishReason = candidate?.finishReason;
            const safetyRatings = candidate?.safetyRatings;

            let blockedBySafety = false;
            if (safetyRatings) {
                blockedBySafety = safetyRatings.some(rating => rating.blocked);
            }

            if (finishReason === 'STOP') {
                 const aiResponseText = candidate?.content?.parts?.[0]?.text;
                 if (!aiResponseText) {
                     throw new Error('AI stopped generating response unexpectedly with no text.');
                 }
                 const aiMessage = { role: 'model', text: aiResponseText.trim() };
                 setChatHistory(prev => [...prev, aiMessage]);

            } else if (finishReason === 'SAFETY' || blockedBySafety) {
                 throw new Error(`Response blocked by safety filters. Finish Reason: ${finishReason}.`);
            } else if (finishReason === 'MAX_TOKENS') {
                 const partialText = candidate?.content?.parts?.[0]?.text || "";
                 const aiMessage = { role: 'model', text: partialText.trim() + "\n\n(Response may be incomplete as it reached the maximum length.)" };
                 setChatHistory(prev => [...prev, aiMessage]);
            } else if (finishReason === 'RECITATION') {
                 throw new Error(`Response blocked due to potential recitation of copyrighted material.`);
            } else {
                throw new Error(`AI generation finished unexpectedly. Reason: ${finishReason || 'Unknown'}. Response data: ${JSON.stringify(data)}`);
            }

        } catch (err) {
             console.error("Error calling Gemini API:", err);
             const errorMsg = `Error: ${err.message || 'An unexpected error occurred while contacting the AI assistant.'}`;
             setChatError(errorMsg);
             message.error(errorMsg);
             setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error: ${err.message}` }]);
        } finally {
            setIsSending(false);
        }

    }, [
        userId, inputValue, chatHistory, activeRequests, projects, localProvinces,
        localProvincesLoading, localProvincesError, activeRequestsLoading, activeRequestsError,
        findProvinceCodeByName, createChatContext, dispatch, /* projectsLoading, projectsError */
    ]);

    const customEmptyText = (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            <RobotOutlined style={{ fontSize: '24px', marginBottom: '10px' }}/>
            {userId ? (
                 <>
                    <p>Ask FCharity Assistant anything about active requests or projects!</p>
                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                       Examples: "List all requests", "Show 'Wishes' category requests", "Requests in Điện Biên", "Find request 'pony'", "tỉnh nào nhiều yêu cầu nhất?", "Contact admin"
                    </Text>
                 </>
             ) : (
                 <p>Please log in to use the FCharity Assistant.</p>
             )}

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
                                    ? (currentUserAvatar ? <Avatar src={currentUserAvatar} onError={() => false} /> : <Avatar icon={<UserOutlined />} />)
                                    : <Avatar style={{ backgroundColor: '#1677ff' }} icon={<RobotOutlined />} />
                                }
                                title={<Text strong>{item.role === 'user' ? 'You' : 'FCharity Assistant'}</Text>}
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
                        <span style={{ marginLeft: 8, color: '#555' }}>FCharity Assistant is thinking...</span>
                    </div>
                )}
                 {chatError && !isSending && (
                    <div className="error-message">
                        <Text type="danger">Error: {chatError}</Text>
                    </div>
                 )}
                 <div ref={chatEndRef} style={{ height: "1px" }} />
            </div>

            <div className="chat-input-area">
                 <TextArea
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={
                        !userId ? "Log in to chat with the assistant" :
                        activeRequestsLoading || localProvincesLoading ? "Assistant is initializing (loading data)..." :
                        isSending ? "Waiting for response..." :
                        "Ask FCharity Assistant... (Shift+Enter for new line)"
                    }
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
                 >
                     Send
                 </Button>
            </div>
        </div>
    );
};

export default GeminiChatBox;