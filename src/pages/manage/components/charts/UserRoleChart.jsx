import React from "react";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const UserRolePieChart = ({ currentOrganizationMembers }) => {
  const data = [
    {
      name: "CEO",
      value: currentOrganizationMembers.filter(
        (member) => member.memberRole === "CEO"
      ).length,
    },
    {
      name: "Manager",
      value: currentOrganizationMembers.filter(
        (member) => member.memberRole === "MANAGER"
      ).length,
    },
    {
      name: "Member",
      value: currentOrganizationMembers.filter(
        (member) => member.memberRole === "MEMBER"
      ).length,
    },
  ];

  const COLORS = ["#9810FA", "#F0B100", "#2B7FFF"]; // Đỏ, Xanh dương, Xanh lá

  const renderLegend = ({ payload }) => {
    return (
      <ul className="flex flex-col gap-1">
        {payload.map((entry, index) => (
          <li
            key={`item-${index}`}
            className="flex items-center text-xs font-semibold text-gray-800"
          >
            <span
              className="w-2 h-2 mr-1 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            {entry.value}: {entry.payload.value}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={15}
          outerRadius={42}
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const total = data.reduce((sum, entry) => sum + entry.value, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return [`${value} (${percentage}%)`, name];
          }}
          contentStyle={{
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "1px solid #e5e7eb",
          }}
          wrapperStyle={{
            zIndex: 1000,
          }}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconSize={8}
          content={renderLegend}
          wrapperStyle={{
            fontSize: "10px",
            paddingLeft: "4px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default UserRolePieChart;
