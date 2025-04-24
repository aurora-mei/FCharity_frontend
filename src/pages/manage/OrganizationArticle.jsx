import React, { useEffect, useState } from "react";
import ArticleCreator from "./components/ArticleCreator";
import { useDispatch, useSelector } from "react-redux";
import { getArticleByOrganizationId } from "../../redux/organization/organizationSlice";
import ArticleManagement from "./components/ArticleManagement";
import ArticleEditor from "./components/ArticleEditor";

const OrganizationArticle = () => {
  const dispatch = useDispatch();

  const currentOrganization = useSelector(
    (state) => state.organization.currentOrganization
  );
  const organizationArticles = useSelector(
    (state) => state.organization.organizationArticles
  );

  useEffect(() => {
    if (currentOrganization?.organizationId) {
      dispatch(getArticleByOrganizationId(currentOrganization.organizationId));
    }
  }, [currentOrganization]);

  const [isCreatingArticle, setIsCreatingArticle] = useState(false);

  const [editingArticle, setEditingArticle] = useState(null);
  const [isEditingArticle, setIsEditingArticle] = useState(false);

  console.log("organizationArticles: ", organizationArticles);

  return (
    <div className="px-4">
      <p className="text-xl font-semibold ">Quản lý bài viết</p>
      {!isCreatingArticle && (
        <div className="flex items-center justify-end">
          <div
            onClick={() => {
              setIsCreatingArticle(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
          >
            Create New Article
          </div>
        </div>
      )}
      {isCreatingArticle && (
        <div>
          <h2>Tạo bài viết</h2>
          <ArticleCreator setIsCreatingArticle={setIsCreatingArticle} />
        </div>
      )}
      {isEditingArticle && editingArticle && (
        <div>
          <h2>Sửa bài viết</h2>
          <ArticleEditor
            article={editingArticle}
            setIsEditingArticle={setIsEditingArticle}
          />
        </div>
      )}
      <ArticleManagement
        articles={organizationArticles}
        setIsEditingArticle={setIsEditingArticle}
        setEditingArticle={setEditingArticle}
      />
    </div>
  );
};

export default OrganizationArticle;
