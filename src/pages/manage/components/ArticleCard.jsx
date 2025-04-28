import React from "react";
import { useNavigate } from "react-router-dom";

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const formatDate = (isoString) => {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date(isoString));
  };

  function extractFirstImageUrl(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const firstImg = doc.querySelector("img");
    if (firstImg) {
      return firstImg.src;
    }
    return null;
  }

  function extractFirstParagraph(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const firstP = doc.querySelector("p");
    if (firstP) {
      return firstP.textContent;
    }
    return null;
  }

  return (
    <div
      className="w-[350px] shrink-0 border border-gray-300 rounded-sm overflow-hidden hover:cursor-pointer hover:shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 transition duration-200"
      onClick={() => {
        navigate(
          `/organizations/${article?.organization?.organizationId}/articles/${article?.articleId}`
        );
      }}
      title="Click to view article detail"
    >
      <div className="w-full h-[150px] bg-gray-100 overflow-hidden">
        <img
          src={
            extractFirstImageUrl(article?.content) ||
            "https://placehold.co/600x400?text=Article"
          }
          alt="article image"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-3">
        <p style={{ margin: "0" }} className="text-xs text-gray-700">
          {article?.organization?.organizationName}
        </p>
        <p className="font-semibold">{article?.title}</p>
        <p
          className="mb-6 h-[60px] text-sm overflow-hidden text-ellipsis line-clamp-3 indent-6"
          style={{ margin: "0" }}
        >
          {extractFirstParagraph(article?.content)}
        </p>
        <div className="flex items-center justify-end gap-2 my-2 text-xs">
          <div>{article?.views} views</div>
          <div>{article?.likes} likes</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300">
              <img
                src={
                  // article?.author?.avatar ||
                  "https://avatar.iran.liara.run/public"
                }
                alt=""
                className="object-cover w-full h-full"
              />
            </div>
            <p style={{ margin: "0" }} className="text-sm">
              {article?.author?.fullName}
            </p>
          </div>
          <div className="flex items-center">
            <p style={{ margin: "0" }} className="text-sm">
              {formatDate(article?.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
