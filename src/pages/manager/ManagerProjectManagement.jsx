import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ManagerProjectManagement = () => {
  const { organizationId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiService.getAllProjects(organizationId);
        setProjects(response.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, [organizationId]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createProject(
        organizationId,
        newProject
      );
      setProjects([...projects, response.data]);
      setNewProject({ name: "", description: "", status: "Active" });
      alert("Project created successfully!");
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Failed to create project");
    }
  };

  const projectStatusData = [
    {
      name: "Active",
      value: projects.filter((p) => p.status === "Active").length,
    },
    {
      name: "Completed",
      value: projects.filter((p) => p.status === "Completed").length,
    },
    {
      name: "Pending",
      value: projects.filter((p) => p.status === "Pending").length,
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "members", label: "Members" },
    { id: "tasks", label: "Tasks" },
    { id: "reports", label: "Reports" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div>
            <h3 className="text-xl font-medium text-gray-700 mb-4">
              Projects Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600">Total Projects</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {projects.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600">Active Projects</p>
                <p className="text-2xl font-semibold text-green-600">
                  {projectStatusData[0].value}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-600">Pending Projects</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {projectStatusData[2].value}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Project Status Distribution
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder="Project Name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                placeholder="Description"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newProject.status}
                onChange={(e) =>
                  setNewProject({ ...newProject, status: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Project
              </button>
            </form>
          </div>
        );
      case "members":
        return (
          <div className="text-gray-600">
            List of members working on projects (to be implemented).
          </div>
        );
      case "tasks":
        return (
          <div className="text-gray-600">
            List of tasks for projects (to be implemented).
          </div>
        );
      case "reports":
        return (
          <div className="text-gray-600">
            Project reports (to be implemented).
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">
            Project Management
          </h1>

          <nav className="flex space-x-4 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerProjectManagement;
