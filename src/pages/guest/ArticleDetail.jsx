import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { useSelector } from "react-redux";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const ArticleDetail = () => {
  const [liked, setLiked] = useState(false);

  const currentArticle = useSelector(
    (state) => state.organization.currentArticle
  );

  const handleLike = async () => {
    if (!liked && article?.articleId) {
      try {
        await onLike(article.articleId);
        setLiked(true);
      } catch (error) {
        console.error("Failed to like article:", error);
      }
    }
  };

  if (!currentArticle) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentArticle) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-red-500">
        Bài viết không tồn tại hoặc đã bị xóa
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4">
      {/* Article Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          {currentArticle.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {currentArticle?.author?.fullName || "Đang tải..."}
          </div>

          <div className="flex items-center">
            <span>Created at: </span>
            <svg
              className="w-4 h-4 mr-1 ml-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {format(new Date(currentArticle.createdAt), "dd MMMM yyyy", {
              locale: vi,
            })}
          </div>
          <div className="flex items-center">
            <span>Updated at: </span>
            <svg
              className="w-4 h-4 mr-1 ml-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {format(new Date(currentArticle.updatedAt), "dd MMMM yyyy", {
              locale: vi,
            })}
          </div>
          <div className="flex items-center gap-1">
            <span>Views: </span>
            {currentArticle.views}
            <MdOutlineRemoveRedEye />
          </div>
        </div>
      </div>

      <div
        className="prose max-w-none prose-lg prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(currentArticle.content, {
            ALLOWED_TAGS: [
              "p",
              "h1",
              "h2",
              "h3",
              "h4",
              "h5",
              "h6",
              "strong",
              "em",
              "blockquote",
              "ul",
              "ol",
              "li",
              "a",
              "img",
              "figure",
              "figcaption",
            ],
            ALLOWED_ATTR: [
              "href",
              "src",
              "alt",
              "title",
              "width",
              "height",
              "loading",
              "class",
            ],
          }).replace(/<img /g, '<img loading="lazy" class="my-4" '),
        }}
      />
    </div>
  );
};

export default ArticleDetail;
