import React, { useEffect, useState } from "react";
import ArticleCreator from "./components/ArticleCreator";
import { useDispatch, useSelector } from "react-redux";
import { getArticleByOrganizationId } from "../../redux/organization/organizationSlice";
import ArticleManagement from "./components/ArticleManagement";
import ArticleEditor from "./components/ArticleEditor";
import { Link } from "react-router-dom";
import { Empty } from "antd";

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
    <div>
      {currentOrganization && (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Article Management</h1>
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
      )}
      {!currentOrganization && (
        <div className="p-6">
          <div className="flex justify-end items-center">
            <Link
              to="/organizations"
              className="bg-blue-500 px-3 py-2 rounded-md text-white hover:bg-blue-600 hover:cursor-pointer"
            >
              Discover organizations
            </Link>
          </div>
          <div className="flex justify-center items-center min-h-[500px]">
            <Empty description="You are not a manager of any organization" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationArticle;
