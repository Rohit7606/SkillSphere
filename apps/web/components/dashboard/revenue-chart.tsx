"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ 
  title = "Revenue Analytics", 
  subtitle = "Income velocity over time",
  isClient = false 
}: { 
  title?: string; 
  subtitle?: string;
  isClient?: boolean;
}) {
  const [period, setPeriod] = useState('6M');

  const chartData = useMemo(() => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (period === '1Y') {
      return monthNames.map((name, index) => {
        // Future months are 0. Past/current months grow deterministically so they don't randomly jump on re-render.
        const total = index <= currentMonthIndex ? 1200 + (index * 450) + (index % 2 === 0 ? 250 : 0) : 0;
        return { name, total };
      });
    } else if (period === 'ALL') {
      // Last 5 years up to the current year
      return Array.from({ length: 5 }).map((_, i) => {
        const year = currentYear - 4 + i;
        const total = 18000 + (i * 7500) + (i % 2 === 0 ? -1500 : 2000);
        return { name: year.toString(), total };
      });
    } else {
      // 6M: Exactly the last 6 months ending on the current month
      return Array.from({ length: 6 }).map((_, i) => {
        let monthIndex = currentMonthIndex - 5 + i;
        if (monthIndex < 0) monthIndex += 12; // Handle wrapping around to previous year (e.g., Jan -> Dec)
        const name = monthNames[monthIndex];
        const total = 2200 + (i * 350) + (i % 3 === 0 ? 400 : 0);
        return { name, total };
      });
    }
  }, [period]);

  return (
    <div className="md:col-span-2 xl:col-span-3 bg-surface rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border min-h-[450px] flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-text-secondary mt-1">
            {period === '6M' ? (isClient ? 'Spending over the past 6 months' : 'Income velocity over the past 6 months') : 
             period === '1Y' ? (isClient ? 'Monthly spend for this year' : 'Monthly income for this year') : 
             (isClient ? 'Year-over-year spending' : 'Year-over-year growth')}
          </p>
        </div>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-background border border-border text-foreground text-sm rounded-xl focus:ring-2 focus:ring-accent-primary focus:border-accent-primary block pl-4 pr-10 py-2.5 outline-none font-bold transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"
        >
          <option value="6M">Last 6 Months</option>
          <option value="1Y">This Year</option>
          <option value="ALL">All Time</option>
        </select>
      </div>
      
      <div className="w-full h-[350px] mt-4 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
