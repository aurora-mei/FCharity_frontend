import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import helperApi from "../../../redux/helper/helperApi";
import { useDispatch, useSelector } from "react-redux";
import {
  createArticle,
  getAuthor,
} from "../../../redux/organization/organizationSlice";

class CustomUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    try {
      const file = await this.loader.file;
      const response = await helperApi.uploadFile({
        file: file,
        folderName: "organizations",
      });
      return {
        default: response, // URL trả về trực tiếp
        sources: [], // Mảng rỗng để ngăn CKEditor tạo srcset
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  abort() {}
}

function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new CustomUploadAdapter(loader);
  };
}

function DisableImageSrcset(editor) {
  editor.conversion.for("downcast").add((dispatcher) => {
    dispatcher.on(
      "attribute:srcset",
      (evt, data, conversionApi) => {
        // Ngăn không cho tạo srcset
        evt.stop();
      },
      { priority: "high" }
    );
  });
}

const ArticleCreator = ({ setIsCreatingArticle }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const dispatch = useDispatch();
  const ownedOrganization = useSelector(
    (state) => state.organization.ownedOrganization
  );
  const author = useSelector((state) => state.organization.author);

  useEffect(() => {
    dispatch(getAuthor());
  }, []);

  const handleSubmit = async () => {
    try {
      const cleanContent = content.replace(/srcset="[^"]*"/g, "");

      await dispatch(
        createArticle({
          articleId: null,
          organization: ownedOrganization,
          title,
          content: cleanContent,
          author,
          views: 0,
          likes: 0,
        })
      ).unwrap();

      alert("Bài viết được tạo!");
      setTitle("");
      setContent("");
      setIsCreatingArticle(false);
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setIsCreatingArticle(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề bài viết"
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CKEditor
        editor={ClassicEditor}
        config={{
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "bulletedList",
            "numberedList",
            "|",
            "imageUpload",
            "blockQuote",
            "undo",
            "redo",
          ],
          extraPlugins: [CustomUploadAdapterPlugin, DisableImageSrcset], // Thêm plugin custom
          image: {
            upload: {
              types: ["jpeg", "png", "gif"],
            },
            toolbar: [
              "imageTextAlternative",
              "|",
              "imageStyle:alignLeft",
              "imageStyle:full",
              "imageStyle:alignRight",
            ],
            styles: [
              "full",
              "alignLeft",
              "alignRight",
              "alignCenter",
              "alignBlock",
              "inline",
              "side",
            ],
            resizeUnit: "px",
            resizeOptions: [
              {
                name: "resizeImage:original",
                value: null,
                icon: "original",
              },
            ],
          },
        }}
        data={content}
        onChange={(event, editor) => {
          setContent(editor.getData());
        }}
        onError={(error) => console.error("CKEditor lỗi:", error)}
      />
      <div className="flex justify-end items-center gap-3">
        <div
          type="button"
          onClick={handleSubmit}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:cursor-pointer"
        >
          Đăng bài
        </div>
        <div
          type="button"
          onClick={handleCancel}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 hover:cursor-pointer"
        >
          Hủy
        </div>
      </div>
    </div>
  );
};

export default ArticleCreator;
