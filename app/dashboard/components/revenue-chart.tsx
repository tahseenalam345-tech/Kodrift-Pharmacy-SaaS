"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
  }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            dy={10}
          />
          {/* Added width={65} to prevent text cutoff */}
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `Rs ${value}`}
            width={65} 
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            itemStyle={{ color: '#0B4A57', fontWeight: 'bold' }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0B4A57"
            strokeWidth={3}
            dot={{ r: 4, fill: '#0B4A57', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#E06A4E', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}