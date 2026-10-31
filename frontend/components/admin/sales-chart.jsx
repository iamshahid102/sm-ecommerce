"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

function shortDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PK", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function SalesChart({ data }) {
  const rows = data.map((entry) => ({
    ...entry,
    label: shortDate(entry.date),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={rows}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-PK", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value), "Revenue"]}
            labelFormatter={(label) => label}
            contentStyle={{
              borderRadius: 12,
              borderColor: "var(--border)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
