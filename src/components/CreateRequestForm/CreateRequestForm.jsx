import React, { useEffect, useState, useCallback } from "react"; // Thêm useCallback nếu cần
import { Form, Input, Button, Checkbox, Typography, Select, Upload, message, Spin } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import "antd/dist/reset.css";
import { useDispatch, useSelector } from 'react-redux';
import { createRequest } from '../../redux/request/requestSlice';
import { fetchCategories } from '../../redux/category/categorySlice'; // Chỉ import action
import { fetchTags } from '../../redux/tag/tagSlice';             // Chỉ import action
import { uploadFileMedia } from "../../redux/helper/helperSlice";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../LoadingModal/index.jsx"; // Giả sử component này tồn tại

const { Title } = Typography;
const { Option } = Select;

// --- Các hàm hỗ trợ parse địa chỉ và tìm kiếm ---
function parseLocationString(locationString = "") {
  const parts = locationString.split(",").map(p => p.trim()).filter(Boolean); // Lọc bỏ phần tử rỗng
  if (parts.length < 3) {
    // Trả về những gì có thể nếu không đủ 3 phần
    return {
      detail: parts.join(", "), // Ghép lại những gì còn lại làm detail
      communeName: "",
      districtName: "",
      provinceName: parts.length > 0 ? parts[parts.length - 1].replace(/^(tỉnh|thành phố|tp)\s*/i, "").trim() : "" // Cố gắng lấy tỉnh nếu có ít nhất 1 phần tử
    };
  }
  const provincePart = parts[parts.length - 1];
  const districtPart = parts[parts.length - 2];
  const communePart = parts[parts.length - 3];
  const detailParts = parts.slice(0, parts.length - 3);

  const detail = detailParts.join(", ").trim();
  const provinceName = provincePart.replace(/^(tỉnh|thành phố|tp)\s*/i, "").trim();
  const districtName = districtPart.replace(/^(huyện|quận|thị xã|thành phố|tp)\s*/i, "").trim();
  const communeName = communePart.replace(/^(xã|phường|thị trấn)\s*/i, "").trim();
  return { detail, communeName, districtName, provinceName };
}

function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d") // Thay đ -> d
    .replace(/Đ/g, "D") // Thay Đ -> D
    .toLowerCase();
}

// Hàm tìm kiếm chung, linh hoạt hơn
const findLocationByName = (items, nameToFind) => {
  if (!nameToFind || !items || items.length === 0) return null;
  const normalizedNameToFind = removeVietnameseTones(nameToFind);
  // Ưu tiên khớp chính xác hoàn toàn (sau khi bỏ dấu)
  let found = items.find(item => removeVietnameseTones(item.name) === normalizedNameToFind);
  if (found) return found;
  // Nếu không, tìm khớp chứa (includes)
  found = items.find(item => removeVietnameseTones(item.name).includes(normalizedNameToFind));
  return found;
};
// --- Kết thúc hàm hỗ trợ ---

const CreateRequestForm = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- State từ Redux (Truy cập trực tiếp state) ---
  const requestLoading = useSelector((state) => state.request.loading);
  const categories = useSelector((state) => state.category.categories) || [];
  const categoriesLoading = useSelector((state) => state.category.loading);
  const categoriesError = useSelector((state) => state.category.error);
  const tags = useSelector((state) => state.tag.tags) || [];
  const tagsLoading = useSelector((state) => state.tag.loading);
  const tagsError = useSelector((state) => state.tag.error);

  // --- State cục bộ ---
  const [attachments, setAttachments] = useState({ images: [], videos: [] });
  const [uploading, setUploading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true); // Loading dữ liệu ban đầu (địa chỉ + redux)
  const [aiLoading, setAiLoading] = useState(false); // Loading cho chức năng AI

  /* -----------------------------------------
     FETCH DỮ LIỆU BAN ĐẦU (Redux + Provinces API)
     ----------------------------------------- */
  // Hàm load danh sách tỉnh (dùng useCallback để tránh tạo lại nếu không cần)
  const loadProvinces = useCallback(async () => {
    // Không set initialLoading ở đây, để useEffect chính quản lý
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProvinces(data || []);
      return data || []; // Trả về data để useEffect khác dùng nếu cần
    } catch (error) {
      console.error("Failed to load provinces:", error);
      setProvinces([]);
      message.error("Failed to load province list. Please try refreshing the page.");
      return []; // Trả về mảng rỗng khi lỗi
    }
  }, []); // Không có dependency, chỉ tạo 1 lần

  useEffect(() => {
    let isMounted = true; // Flag để tránh cập nhật state nếu component unmounted
    setInitialLoading(true); // Bắt đầu loading tổng thể

    const fetchInitialData = async () => {
      // Dispatch fetch Redux data
      // Chỉ fetch nếu chưa có dữ liệu để tránh gọi lại không cần thiết
      if (!categories || categories.length === 0) {
        dispatch(fetchCategories());
      }
      if (!tags || tags.length === 0) {
        dispatch(fetchTags());
      }

      // Fetch provinces
      await loadProvinces();

      // Chỉ set initialLoading = false nếu component vẫn còn mounted
      // Việc parse địa chỉ sẽ diễn ra trong useEffect khác phụ thuộc vào provinces
      if (isMounted) {
        // setInitialLoading(false); // Sẽ set false trong useEffect parse địa chỉ
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false; // Đánh dấu component đã unmount
    };
  }, [dispatch, loadProvinces]); // Phụ thuộc vào dispatch và hàm loadProvinces

  /* ---------------------------------------------------------
     PARSE ĐỊA CHỈ USER & SET FORM (Sau khi provinces load xong)
     --------------------------------------------------------- */
  // Hàm load districts (dùng useCallback)
  const loadDistricts = useCallback(async (provinceCode) => {
    if (!provinceCode) return [];
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const dist = data.districts || [];
      setDistricts(dist);
      return dist;
    } catch (err) {
      console.error("Failed to load districts:", err);
      message.error("Failed to load districts.");
      setDistricts([]);
      return [];
    }
  }, []); // Không có dependency

  // Hàm load communes (dùng useCallback)
  const loadCommunes = useCallback(async (districtCode) => {
    if (!districtCode) return [];
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const wards = data.wards || [];
      setCommunes(wards);
      return wards;
    } catch (err) {
      console.error("Failed to load communes:", err);
      message.error("Failed to load communes/wards.");
      setCommunes([]);
      return [];
    }
  }, []); // Không có dependency


  useEffect(() => {
    let isMounted = true;
    const initFormData = async () => {
      // Vẫn đang trong giai đoạn initial loading cho đến khi parse xong
      // setInitialLoading(true); // Không cần set lại ở đây

      const storedUser = localStorage.getItem("currentUser");
      let addressProcessed = false; // Cờ kiểm tra đã xử lý địa chỉ chưa

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Luôn set email/phone nếu có
          form.setFieldsValue({
            email: parsedUser.email || "",
            phone: parsedUser.phoneNumber || "",
          });

          // Chỉ xử lý địa chỉ nếu có và provinces đã load
          if (parsedUser.address && provinces && provinces.length > 0) {
            const { detail, communeName, districtName, provinceName } = parseLocationString(parsedUser.address);
            form.setFieldsValue({ location: detail || "" });

            const foundProv = findLocationByName(provinces, provinceName);
            if (foundProv) {
              form.setFieldsValue({ province: foundProv.code });
              if (isMounted) setSelectedProvince(foundProv.code); // Chỉ set state nếu mounted
              const distData = await loadDistricts(foundProv.code);

              if (isMounted && distData && distData.length > 0) {
                const foundDist = findLocationByName(distData, districtName);
                if (foundDist) {
                  form.setFieldsValue({ district: foundDist.code });
                  if (isMounted) setSelectedDistrict(foundDist.code);
                  const commData = await loadCommunes(foundDist.code);

                  if (isMounted && commData && commData.length > 0) {
                    const foundComm = findLocationByName(commData, communeName);
                    if (foundComm) {
                      form.setFieldsValue({ commune: foundComm.code });
                    }
                  }
                }
              }
            }
            addressProcessed = true;
          } else {
            // Nếu không có địa chỉ user hoặc provinces chưa load, vẫn đánh dấu là xong phần địa chỉ
            addressProcessed = true;
          }
        } catch (error) {
          console.error("Error parsing currentUser or address:", error);
          addressProcessed = true; // Coi như xong dù lỗi
        }
      } else {
        addressProcessed = true; // Không có user, coi như xong phần địa chỉ
      }

      // Chỉ kết thúc initial loading khi component còn mounted VÀ việc xử lý địa chỉ đã hoàn tất
      if (isMounted && addressProcessed) {
        setInitialLoading(false);
      }
    };

    // Chạy khi provinces đã có dữ liệu (không rỗng)
    if (provinces && provinces.length > 0) {
      initFormData();
    } else if (!initialLoading && (!provinces || provinces.length === 0)) {
      // Nếu fetch tỉnh bị lỗi (provinces rỗng) và không còn trong trạng thái loading ban đầu -> kết thúc loading
      if (isMounted) setInitialLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [provinces, form, loadDistricts, loadCommunes, initialLoading]); // Thêm initialLoading vào dependency để xử lý trường hợp fetch tỉnh lỗi

  /* ------------------------------------------------------
     XỬ LÝ THAY ĐỔI SELECT ĐỊA CHỈ
     ------------------------------------------------------ */
  const handleProvinceChange = useCallback(async (value) => {
    setSelectedProvince(value);
    form.setFieldsValue({ district: null, commune: null });
    setDistricts([]);
    setCommunes([]);
    setSelectedDistrict(null);
    if (value) {
      await loadDistricts(value);
    }
  }, [form, loadDistricts]);

  const handleDistrictChange = useCallback(async (value) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ commune: null });
    setCommunes([]);
    if (value) {
      await loadCommunes(value);
    }
  }, [form, loadCommunes]);

  /* ----------------------------------
     XỬ LÝ UPLOAD FILE
     ---------------------------------- */
  const handleFileChange = useCallback(async ({ file, fileList }, type) => {
    // Chỉ xử lý file mới được thêm (có originFileObj) và chưa bị đánh dấu lỗi/removed
    if (!file.originFileObj || file.status === 'error' || file.status === 'removed') {
      // Cập nhật fileList trong form nếu file bị xóa thủ công khỏi UI trước khi upload xong
      if (file.status === 'removed') {
        const currentList = form.getFieldValue(type) || [];
        form.setFieldsValue({ [type]: currentList.filter(f => f.uid !== file.uid) });
        // Đồng thời gọi handleRemoveFile để xóa khỏi attachments nếu đã upload
        handleRemoveFile({ file, type });
      }
      return;
    }

    setUploading(true);
    const currentFileUid = file.uid; // Lưu uid để cập nhật đúng file

    try {
      const folderName = type === 'images' ? 'images' : 'videos';
      const responseUrl = await dispatch(uploadFileMedia({ file: file.originFileObj, folderName,resourceType:type })).unwrap();

      // Cập nhật state attachments
      setAttachments(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), responseUrl]
      }));

      // Cập nhật fileList trong form state để Antd hiển thị đúng
      const updatedList = (form.getFieldValue(type) || []).map(f =>
        f.uid === currentFileUid ? { ...f, status: 'done', url: responseUrl, response: responseUrl, name: f.name || `uploaded_${type}` } : f
      );
      form.setFieldsValue({ [type]: updatedList });

      message.success(`Uploaded ${file.name}`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      message.error(`Upload failed for ${file.name}. ${error?.message || ''}`);
      // Cập nhật fileList trong form state để Antd hiển thị lỗi
      const updatedList = (form.getFieldValue(type) || []).map(f =>
        f.uid === currentFileUid ? { ...f, status: 'error', error: { message: `Upload failed: ${error?.message || 'Unknown error'}` } } : f
      );
      form.setFieldsValue({ [type]: updatedList });
    } finally {
      // Kiểm tra xem còn file nào đang uploading không (có thể cần logic phức tạp hơn)
      // Tạm thời set false nếu không còn file nào có status 'uploading' trong form
      const imagesList = form.getFieldValue('images') || [];
      const videosList = form.getFieldValue('videos') || [];
      const stillUploading = [...imagesList, ...videosList].some(f => f.status === 'uploading');
      if (!stillUploading) {
        setUploading(false);
      }
    }
  }, [dispatch, form]); // Bỏ handleRemoveFile khỏi dependency

  const handleRemoveFile = useCallback(({ file, type }) => {
    const fileUrlToRemove = file.url || file.response; // Lấy URL đã upload

    // Xóa khỏi state attachments nếu có URL
    if (fileUrlToRemove) {
      setAttachments(prev => ({
        ...prev,
        [type]: (prev[type] || []).filter(url => url !== fileUrlToRemove)
      }));
    }

    // Xóa khỏi Form state (fileList) để cập nhật UI
    const currentList = form.getFieldValue(type) || [];
    form.setFieldsValue({ [type]: currentList.filter(f => f.uid !== file.uid) });

    message.success(`Removed ${file.name || 'file'}`);
    return true; // Trả về true để Antd xóa khỏi UI
  }, [form]);


  /* -------------------------------------------
     HÀM GENERATE WITH AI
     ------------------------------------------- */
  const mapAiSuggestionsToIds = useCallback((suggestedCategoryName, suggestedTagNames) => {
    let categoryId = undefined;
    let tagIds = [];

    if (!categories || categories.length === 0 || !tags || tags.length === 0) {
      console.error("Categories or Tags not loaded yet for mapping.");
      return { categoryId, tagIds };
    }

    if (suggestedCategoryName) {
      const normSuggestedCat = removeVietnameseTones(suggestedCategoryName);
      const foundCategory = categories.find(c => removeVietnameseTones(c.categoryName) === normSuggestedCat);
      if (foundCategory) {
        categoryId = foundCategory.id;
      } else {
        console.warn(`AI suggested category "${suggestedCategoryName}" not found. Normalized: "${normSuggestedCat}"`);
      }
    }

    if (Array.isArray(suggestedTagNames)) {
      tagIds = suggestedTagNames
        .map(tagName => {
          if (!tagName) return undefined;
          const normSuggestedTag = removeVietnameseTones(tagName);
          const foundTag = tags.find(t => removeVietnameseTones(t.tagName) === normSuggestedTag);
          if (!foundTag) {
            console.warn(`AI suggested tag "${tagName}" not found. Normalized: "${normSuggestedTag}"`);
          }
          return foundTag?.id;
        })
        .filter(id => id !== undefined);
    }

    return { categoryId, tagIds };
  }, [categories, tags]); // Phụ thuộc vào categories và tags từ Redux

  // Hàm Generate with AI được cập nhật
  const generateRequestWithAI = useCallback(async () => {
    // --- Kiểm tra dữ liệu categories/tags từ Redux ---
    if (categoriesLoading || tagsLoading) {
      message.warn("Categories and Tags are still loading. Please wait.");
      return;
    }
    if (categoriesError || tagsError) {
      message.error("Failed to load Categories or Tags. Cannot generate with AI.");
      return;
    }
    if (!categories || categories.length === 0 || !tags || tags.length === 0) {
      message.error("Categories or Tags data is missing. Cannot generate with AI.");
      return;
    }
    // --- Kết thúc kiểm tra ---

    setAiLoading(true);

    try {
      // Lấy các giá trị hiện tại từ form
      const currentValues = form.getFieldsValue();
      const aiHint = currentValues.aiHint || "a general community support request"; // Hint mặc định

      // Lấy tên categories và tags từ Redux state
      const categoryNamesString = categories.map(c => c.categoryName).join(", ");
      const tagNamesString = tags.map(t => t.tagName).join(", ");

      // Lấy thông tin địa chỉ hiện tại từ form để cung cấp context
      const provinceObj = provinces.find(p => p.code === currentValues.province);
      const districtObj = districts.find(d => d.code === currentValues.district);
      const communeObj = communes.find(c => c.code === currentValues.commune);
      const locationContext = [
        currentValues.location, // Address detail
        communeObj?.name,
        districtObj?.name,
        provinceObj?.name,
      ].filter(Boolean).join(", ") || "any location";


      // ---- PROMPT cho AI ----
      const prompt = `
          You are an assistant helping create a support request for a Vietnamese platform.
          Based on the user hint: "${aiHint}"
          Current location context (if available): ${locationContext}
          Is it an emergency? ${currentValues.isEmergency ? "Yes" : "No"}

          Available Categories (choose ONE exactly): ${categoryNamesString}
          Available Tags (choose one or more exactly): ${tagNamesString}

          Generate the following:
          1.  A concise and relevant Title in Vietnamese or English (max 15 words).
          2.  Detailed Content describing the request in Vietnamese or English (100-150 words).
          3.  Suggest ONE Category Name exactly from the "Available Categories" list that best fits the request.
          4.  Suggest relevant Tag Names (as an array of strings) exactly from the "Available Tags" list.

          Format the response strictly as a JSON object like this, with no extra text before or after:
          {
            "title": "Generated title",
            "content": "Generated content.",
            "category": "Chosen Category Name",
            "tags": ["Chosen Tag Name 1", "Chosen Tag Name 2"]
          }
          `;
      // ---- KẾT THÚC PROMPT ----

      // Lấy API Key
      const GEMINI_API = import.meta.env.VITE_GEMINI_API;
      if (!GEMINI_API) {
        throw new Error("Gemini API key not configured.");
      }

      // Gọi API Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      // Kiểm tra response từ API
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Cố gắng parse lỗi JSON
        throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      // Lấy dữ liệu từ response
      const data = await response.json();

      // Kiểm tra cấu trúc dữ liệu trả về cơ bản
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Invalid response structure from Gemini:", data);
        throw new Error("No valid response content received from Gemini.");
      }

      // --- Xử lý và Parse JSON từ phản hồi AI ---
      let aiResponseText = data.candidates[0].content.parts[0].text.trim(); // Trim whitespace đầu/cuối
      let aiSuggestion;

      console.log("Raw AI Response Text:", aiResponseText); // Log text gốc từ AI

      try {
        // 1. Cố gắng parse trực tiếp
        aiSuggestion = JSON.parse(aiResponseText);
      } catch (initialParseError) {
        console.warn("Initial JSON parse failed. Attempting robust extraction...", initialParseError.message);

        // 2. Nếu parse trực tiếp lỗi, thử trích xuất khối JSON ({...} hoặc [...])
        const jsonMatch = aiResponseText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

        if (jsonMatch && jsonMatch[0]) {
          const extractedJson = jsonMatch[0];
          console.log("Attempting to parse extracted JSON:", extractedJson);
          try {
            // 3. Cố gắng parse khối JSON đã trích xuất
            aiSuggestion = JSON.parse(extractedJson);
          } catch (secondaryParseError) {
            console.error("Failed to parse even the extracted JSON:", extractedJson, secondaryParseError);
            // Ném lỗi nếu việc trích xuất và parse lại vẫn thất bại
            throw new Error(`AI response format is invalid. Could not extract or parse valid JSON. Error: ${secondaryParseError.message}`);
          }
        } else {
          // 4. Nếu không tìm thấy cấu trúc JSON nào trong chuỗi
          console.error("Could not find any JSON structure ({...} or [...]) in the AI response:", aiResponseText);
          throw new Error("AI response does not appear to contain valid JSON data.");
        }
      }
      // --- Kết thúc xử lý JSON ---

      // --- Kiểm tra kết quả sau khi parse thành công ---
      if (!aiSuggestion || typeof aiSuggestion !== 'object') {
        console.error("Parsed AI suggestion is not an object:", aiSuggestion);
        throw new Error("Parsed AI response is not a valid object.");
      }

      // Kiểm tra các trường bắt buộc trong JSON object
      if (!aiSuggestion.title || !aiSuggestion.content || !aiSuggestion.category || !Array.isArray(aiSuggestion.tags)) {
        console.error("Invalid JSON structure in AI response:", aiSuggestion);
        throw new Error("AI response JSON is missing required fields (title, content, category, tags array).");
      }

      // --- Ánh xạ tên Category/Tags sang IDs ---
      const { categoryId, tagIds } = mapAiSuggestionsToIds(aiSuggestion.category, aiSuggestion.tags);

      // --- Cập nhật các trường trong Form ---
      form.setFieldsValue({
        title: aiSuggestion.title,
        content: aiSuggestion.content,
        categoryId: categoryId, // Sẽ là undefined nếu không tìm thấy
        tagIds: tagIds,         // Sẽ là mảng rỗng nếu không tìm thấy tag nào
      });

      // --- Hiển thị thông báo thành công/cảnh báo ---
      let successMessage = "AI generated title and content.";
      if (!categoryId && aiSuggestion.category) {
        message.warning(`AI suggested category '${aiSuggestion.category}' could not be matched. Please select manually.`);
      } else if (categoryId) {
        successMessage += " Category auto-selected.";
      }

      // Kiểm tra các tags không khớp
      const unmatchedTags = aiSuggestion.tags.filter(tagName => {
        if (!tagName) return false;
        const normSuggestedTag = removeVietnameseTones(tagName);
        return !tags.some(t => removeVietnameseTones(t.tagName) === normSuggestedTag);
      });

      if (unmatchedTags.length > 0) {
        message.warning(`Could not match AI suggested tags: ${unmatchedTags.join(', ')}. Please review tags.`);
      } else if (tagIds.length > 0 && tagIds.length === aiSuggestion.tags.length) {
        // Chỉ báo auto-selected nếu tất cả đều khớp VÀ có ít nhất 1 tag
        successMessage += " Tags auto-selected.";
      } else if (tagIds.length > 0) {
        // Nếu có tag khớp nhưng không phải tất cả
        successMessage += " Some tags auto-selected.";
      }

      message.success(successMessage);

    } catch (error) {
      // Log lỗi chi tiết và hiển thị thông báo chung cho người dùng
      console.error("Error in generateRequestWithAI:", error);
      message.error(`Failed to generate request with AI: ${error.message}`);
    } finally {
      // Luôn tắt trạng thái loading của AI
      setAiLoading(false);
    }
  }, [
    // Danh sách dependencies cho useCallback
    form,
    categories,
    tags,
    categoriesLoading,
    tagsLoading,
    categoriesError,
    tagsError,
    provinces,
    districts,
    communes,
    mapAiSuggestionsToIds // Hàm map cũng cần là dependency
  ]);


  /* -----------------------
     XỬ LÝ SUBMIT FORM
     ----------------------- */
  const onFinish = useCallback(async (values) => {
    if (uploading) {
      message.warn("Please wait for files to finish uploading.");
      return;
    }
    if (!attachments.images || attachments.images.length === 0) {
      // Validation rule trong Form.Item sẽ xử lý việc này, nhưng check lại cho chắc
      form.validateFields(['images']).catch(() => { }); // Trigger validation message
      message.error("Please upload at least one image.");
      return;
    }

    const provinceObj = provinces.find((p) => p.code === values.province);
    const districtObj = districts.find((d) => d.code === values.district);
    const communeObj = communes.find((c) => c.code === values.commune);

    const fullAddress = [
      values.location || "",
      communeObj?.name,
      districtObj?.name,
      provinceObj?.name
    ].filter(Boolean).join(", ");

    let currentUser = {};
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing currentUser:", error);
        message.error("Could not get user information. Please log in again.");
        return;
      }
    } else {
      message.error("User not found. Please log in.");
      return;
    }
    if (!currentUser.id) {
      message.error("User ID not found. Please log in again.");
      return;
    }

    const requestData = {
      title: values.title,
      content: values.content,
      phone: values.phone,
      email: values.email,
      location: values.location,
      provinceCode: values.province,
      districtCode: values.district,
      communeCode: values.commune,
      fullAddress: fullAddress,
      categoryId: values.categoryId,
      tagIds: values.tagIds || [],
      isEmergency: values.isEmergency || false,
      userId: currentUser.id,
      imageUrls: attachments.images || [],
      videoUrls: attachments.videos || [],
    };

    console.log("Final Request Data to Submit:", requestData);

    try {
      await dispatch(createRequest(requestData)).unwrap(); // unwrap để bắt lỗi từ thunk
      message.success("Create request successfully!");
      navigate('/user/manage-profile/myrequests', { replace: true });
    } catch (error) {
      console.error("Error creating request:", error);
      // Hiển thị lỗi cụ thể từ rejectedWithValue hoặc lỗi chung
      const errorMessage = error?.message || error || "Failed to create request. Please try again.";
      message.error(errorMessage);
    }
  }, [
    dispatch, navigate, form, uploading, attachments,
    provinces, districts, communes // Thêm các state địa chỉ vào dependency
  ]);

  /* --------------------------------------
     HIỂN THỊ LOADING MODAL
     -------------------------------------- */
  // Chỉ hiển thị loading modal cho các hoạt động chính, không phải loading AI/upload
  const showLoadingModal = initialLoading || requestLoading;
  if (showLoadingModal) {
    let loadingText = "Loading...";
    if (initialLoading) loadingText = "Loading initial data...";
    else if (requestLoading) loadingText = "Submitting request...";
    // Không hiển thị modal khi categories/tags đang load ngầm
    return <LoadingModal message={loadingText} />;
  }


  /* ---------------
     RENDER UI
     --------------- */
  const aiDataReady = !categoriesLoading && !tagsLoading && categories.length > 0 && tags.length > 0;
  const aiDataHasError = !!categoriesError || !!tagsError;

  return (
    <div className="upper-container-request" style={{ paddingTop: '20px', paddingBottom: '50px' }}> {/* Thêm padding */}
      <div className="container-request" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="create-request-form">
          <div className="request-header" style={{ marginBottom: '25px', textAlign: 'center' }}>
            <Title level={3} style={{ lineHeight: '1', marginBottom: '10px' }} className="title">
              Create a New Support Request
            </Title>
            <p className="subtitle" style={{ color: '#888' }}>
              Fill in the details below or use AI to help generate your request.
            </p>
          </div>
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isEmergency: false }}>
            {/* --- AI Generation --- */}
            <Title level={5} style={{ marginTop: '20px' }}>AI Assistant</Title>
            <Form.Item
              label="AI Hint (Optional)"
              name="aiHint"
              tooltip="Give the AI a short instruction (e.g., 'help needed for elderly neighbor after storm')"
            >
              <Input placeholder="Enter a hint for AI generation" disabled={!aiDataReady || aiDataHasError || aiLoading} />
            </Form.Item>
            <Form.Item>
              <Button
                className="continue-button" // Giữ class nếu cần
                type="dashed"
                onClick={generateRequestWithAI}
                loading={aiLoading}
                disabled={aiLoading || !aiDataReady || aiDataHasError}
                block
                icon={<svg width="16" height="16" viewBox="0 0 1024 1024" fill="currentColor"><path d="M928 444H820V336c0-30.9-25.1-56-56-56H652V168c0-30.9-25.1-56-56-56H320c-30.9 0-56 25.1-56 56v112H152c-30.9 0-56 25.1-56 56v112H64c-17.7 0-32 14.3-32 32v112c0 17.7 14.3 32 32 32h44v112c0 30.9 25.1 56 56 56h112v112c0 30.9 25.1 56 56 56h276c30.9 0 56-25.1 56-56V808h112c30.9 0 56-25.1 56-56V640h44c17.7 0 32-14.3 32-32V508c0-17.7-14.3-32-32-32zM676 808H404V696h272v112zm112-168H288V528h500v112zm112-168H176V360h728v112z"></path></svg>} // Example AI icon
              >
                {aiLoading ? "Generating..." : (!aiDataReady ? "Loading data for AI..." : (aiDataHasError ? "Data error, cannot use AI" : "Generate with AI"))}
              </Button>
              {categoriesError && <p style={{ color: 'red', fontSize: 'small', marginTop: '5px' }}>Error loading categories. AI generation disabled.</p>}
              {tagsError && <p style={{ color: 'red', fontSize: 'small', marginTop: '5px' }}>Error loading tags. AI generation disabled.</p>}
            </Form.Item>
            {/* --- Request Details --- */}
            <Title level={5}>Request Details</Title>
            <Form.Item label="Request Title" name="title" rules={[{ required: true, message: "Title is required" }]}>
              <Input placeholder="e.g., Need help cleaning up after flood" />
            </Form.Item>
            <Form.Item label="Describe your request" name="content" rules={[{ required: true, message: "Content is required" }]}>
              <Input.TextArea rows={5} placeholder="Provide details about the situation and what kind of help you need." />
            </Form.Item>
            {/* --- Categorization --- */}
            <Title level={5} style={{ marginTop: '20px' }}>Categorization</Title>
            <Form.Item label="Category" name="categoryId" rules={[{ required: true, message: "Category is required" }]}>
              <Select placeholder="Select the main category" allowClear loading={categoriesLoading} disabled={categoriesLoading || !!categoriesError}>
                {categories.map(c => <Option key={c.id} value={c.id}>{c.categoryName}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Tags" name="tagIds" rules={[{ required: true, message: "Please select at least one relevant tag" }]}>
              <Select mode="multiple" placeholder="Select relevant tags" allowClear loading={tagsLoading} disabled={tagsLoading || !!tagsError}>
                {tags.map(t => <Option key={t.id} value={t.id}>{t.tagName}</Option>)}
              </Select>
            </Form.Item>
            {/* --- Contact Information --- */}
            <Title level={5} style={{ marginTop: '20px' }}>Contact Information</Title>
            <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Phone is required" }, { pattern: /^[0-9]+$/, message: "Please enter numbers only" }]}>
              <Input placeholder="Your contact phone number" />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
              <Input placeholder="Your contact email address" />
            </Form.Item>

            {/* --- Location --- */}
            <Title level={5} style={{ marginTop: '20px' }}>Location</Title>
            <Form.Item
              label="Address Detail (Street, Number)"
              name="location"
              rules={[{ required: true, message: "Address detail is required" }]}
              tooltip="Enter the specific street address or describe the location."
            >
              <Input placeholder="e.g., 123 Nguyen Trai Street, near the market" />
            </Form.Item>
            <Form.Item label="Province/City" name="province" rules={[{ required: true, message: "Province/City is required" }]}>
              <Select placeholder="Select Province/City" onChange={handleProvinceChange} showSearch filterOption={(input, option) =>
                removeVietnameseTones(option.children).includes(removeVietnameseTones(input))}>
                {provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="District" name="district" rules={[{ required: true, message: "District is required" }]}>
              <Select placeholder={selectedProvince ? "Select District" : "Select Province first"} onChange={handleDistrictChange} disabled={!selectedProvince || districts.length === 0} showSearch filterOption={(input, option) =>
                removeVietnameseTones(option.children).includes(removeVietnameseTones(input))}>
                {districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item label="Commune/Ward/Town" name="commune" rules={[{ required: true, message: "Commune/Ward/Town is required" }]}>
              <Select placeholder={selectedDistrict ? "Select Commune/Ward/Town" : "Select District first"} disabled={!selectedDistrict || communes.length === 0} showSearch filterOption={(input, option) =>
                removeVietnameseTones(option.children).includes(removeVietnameseTones(input))}>
                {communes.map(c => <Option key={c.code} value={c.code}>{c.name}</Option>)}
              </Select>
            </Form.Item>

            {/* --- Media Uploads --- */}
            <Title level={5} style={{ marginTop: '20px' }}>Media (Photos/Videos)</Title>
            <Form.Item
              label="Images"
              name="images"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
              rules={[{
                validator: async (_, value) => {
                  if (!attachments.images || attachments.images.length === 0) {
                    return Promise.reject(new Error('Please upload at least one image!'));
                  }
                  return Promise.resolve();
                }
              }]}
              tooltip="Upload relevant photos of the situation."
            >
              <Upload
                multiple listType="picture-card" // Changed listType for better preview
                accept="image/*"
                onChange={(info) => handleFileChange(info, 'images')}
                onRemove={(file) => handleRemoveFile({ file, type: 'images' })}
              // fileList is managed by Form
              >
                <div><UploadOutlined /><div>Upload Images</div></div>
              </Upload>
            </Form.Item>
            <Form.Item
              label="Videos (Optional)"
              name="videos"
              valuePropName="fileList"
              getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
              tooltip="Upload short videos if helpful."
            >
              <Upload
                multiple listType="picture-card" // Changed listType
                accept="video/*"
                onChange={(info) => handleFileChange(info, 'videos')}
                onRemove={(file) => handleRemoveFile({ file, type: 'videos' })}
              // fileList is managed by Form
              >
                <div><UploadOutlined /><div>Upload Videos</div></div>
              </Upload>
            </Form.Item>

            {/* --- Emergency --- */}
            <Form.Item name="isEmergency" valuePropName="checked" style={{ marginTop: '20px' }}>
              <Checkbox> <span style={{ fontWeight: 'bold', color: 'red' }}>This is an Emergency Request</span></Checkbox>
            </Form.Item>

            {/* --- Submit Button --- */}
            <Form.Item style={{ marginTop: '30px' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large" // Make button bigger
                className="continue-button" // Keep class if styling depends on it
                disabled={uploading || aiLoading || requestLoading} // Disable when any loading is active
              >
                {uploading ? "Uploading Files..." : (requestLoading ? "Submitting Request..." : "Submit Request")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestForm;