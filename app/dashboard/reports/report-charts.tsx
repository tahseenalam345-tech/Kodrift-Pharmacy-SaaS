"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

type DailyData = {
  date: string;
  revenue: number;
  profit: number;
  expense: number;
};

export function ReportCharts({ data }: { data: DailyData[] }) {
  // Format dates for X-Axis
  const formattedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      displayDate: new Date(d.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Chart 1: Revenue vs Expenses (Bar Chart) */}
      <div className="bg-white border border-border p-5 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-6 ml-2">
          Revenue vs Expenses Overview
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "#6B7280" }} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs ${val / 1000}k`} />
              <Tooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                /* TypeScript Error Fixed Here: changed value: number to value: any */
                formatter={(value: any) => [`Rs ${Number(value).toLocaleString()}`, undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: "bold", paddingTop: "20px" }} />
              <Bar dataKey="revenue" name="Sales Revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name="Operating Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Net Profit Trend (Area Chart) */}
      <div className="bg-white border border-border p-5 rounded-3xl shadow-sm">
        <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-6 ml-2">
          Net Profit Margin Trend
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: "#6B7280" }} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs ${val / 1000}k`} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                /* TypeScript Error Fixed Here: changed value: number to value: any */
                formatter={(value: any) => [`Rs ${Number(value).toLocaleString()}`, "Profit"]}
              />
              <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}