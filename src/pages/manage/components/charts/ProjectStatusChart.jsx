import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PROJECT_TYPES = {
  PLANNING: "PLANNING",
  DONATING: "DONATING",
  PROCESSING: "PROCESSING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
  BANNED: "BANNED",
};

const TYPE_COLORS = {
  [PROJECT_TYPES.PLANNING]: "#8884d8",
  [PROJECT_TYPES.DONATING]: "#82ca9d",
  [PROJECT_TYPES.PROCESSING]: "#ffc107",
  [PROJECT_TYPES.ACTIVE]: "#ff7300",
  [PROJECT_TYPES.FINISHED]: "#00c4b4",
  [PROJECT_TYPES.BANNED]: "#ff4d4f",
};

const processData = (projects) => {
  if (!Array.isArray(projects)) {
    return [];
  }

  const counts = projects
    .map((projectInfo) => projectInfo?.project?.projectStatus)
    .reduce((acc, type) => {
      if (Object.values(PROJECT_TYPES).includes(type)) {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {});

  return Object.values(PROJECT_TYPES).map((type) => ({
    type,
    count: counts[type] || 0,
  }));
};

const ProjectStatusChart = ({ projects }) => {
  const chartData = useMemo(() => processData(projects), [projects]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value} dự án`, "Số lượng"]}
            labelFormatter={(label) => `Loại: ${label}`}
          />
          <Bar dataKey="count">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectStatusChart;
