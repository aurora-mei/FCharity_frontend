import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { curveCardinal } from "d3-shape";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { Select, MenuItem } from "@mui/material"; // Hoặc dùng component select của bạn

dayjs.extend(isoWeek);

const processData = (members, viewMode) => {
  if (!Array.isArray(members) || members.length === 0) {
    return [];
  }

  const groupedData = members
    .map((member) => member?.user?.createdDate)
    .reduce((acc, createdAt) => {
      if (!createdAt || !dayjs(createdAt).isValid()) {
        return acc;
      }

      const date = dayjs(createdAt);

      let key;
      switch (viewMode) {
        case "day":
          key = date.format("YYYY-MM-DD");
          break;
        case "week":
          key = `${date.isoWeekYear()}-W${date.isoWeek()}`;
          break;
        case "month":
          key = date.format("YYYY-MM");
          break;
        case "year":
          key = date.format("YYYY");
          break;
        default:
          key = date.format("YYYY-MM-DD");
      }

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const sortedData = Object.keys(groupedData)
    .map((key) => ({
      name: key,
      newCount: groupedData[key],
    }))
    .sort((a, b) => {
      if (viewMode === "week") {
        const [yearA, weekA] = a.name.split("-W").map(Number);
        const [yearB, weekB] = b.name.split("-W").map(Number);
        return yearA === yearB ? weekA - weekB : yearA - yearB;
      }
      return a.name.localeCompare(b.name);
    });

  let cumulativeCount = 0;
  const data = sortedData.map((item) => ({
    name: item.name,
    count: (cumulativeCount += item.newCount),
  }));

  return data;
};

const MemberOvertimeChart = ({ members }) => {
  const [viewMode, setViewMode] = useState("day");
  const cardinal = curveCardinal.tension(0.2);

  const chartData = useMemo(
    () => processData(members, viewMode),
    [members, viewMode]
  );

  console.log("members in chart", members);
  console.log("chartData", chartData);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Select
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value)}
        style={{ marginBottom: 16 }}
        className="h-[35px]"
      >
        <MenuItem value="day">Day</MenuItem>
        <MenuItem value="week">Week</MenuItem>
        <MenuItem value="month">Month</MenuItem>
        <MenuItem value="year">Year</MenuItem>
      </Select>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickFormatter={(value) => {
              if (viewMode === "week") {
                const [year, week] = value.split("-W");
                return `T${week}/${year}`;
              }
              if (viewMode === "month") return value.replace("-", "/");
              if (viewMode === "year") return value;
              return dayjs(value).format("DD/MM");
            }}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(label) => {
              if (viewMode === "week") {
                const [year, week] = label.split("-W");
                return `Week ${week}, ${year}`;
              }
              if (viewMode === "month")
                return `Month ${label.replace("-", "/")}`;
              if (viewMode === "year") return `Year ${label}`;
              return `Day ${dayjs(label).format("DD/MM/YYYY")}`;
            }}
          />
          <Area
            type={cardinal}
            dataKey="count"
            stroke="#82ca9d"
            fill="url(#colorGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MemberOvertimeChart;
