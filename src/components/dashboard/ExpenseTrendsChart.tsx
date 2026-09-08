'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { formatRupiah, formatRupiahCompact } from '@/lib/utils/currency';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart as RechartsPie,
  Pie,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

const COLORS = [
  '#3B82F6', // Blue
  '#2DD4BF', // Teal
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

export const ExpenseTrendsChart: React.FC = () => {
  const { transactions, categories, selectedMonth, selectedYear } = useApp();
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');

  // Filter expenses for current month
  const monthExpenses = transactions.filter((tx) => {
    if (tx.transaction_type !== 'expense') return false;
    const d = new Date(tx.transaction_date);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Aggregate spending by category
  const categoryTotals: Record<string, { name: string; amount: number }> = {};
  monthExpenses.forEach((tx) => {
    const catId = tx.category_id;
    const catName = tx.category?.name || 'Lainnya';
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = { name: catName, amount: 0 };
    }
    categoryTotals[catId].amount += Number(tx.amount);
  });

  const chartData = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
  const totalExpenseSum = chartData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            Distribusi Pengeluaran
          </h3>
          <p className="text-xs text-gray-400">Total belanja: {formatRupiah(totalExpenseSum)}</p>
        </div>

        {/* Toggle Bar vs Donut */}
        <div className="flex items-center p-1 rounded-lg bg-surface border border-surface-border gap-1">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md transition ${
              chartType === 'bar' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
            title="Diagram Batang"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`p-1.5 rounded-md transition ${
              chartType === 'donut' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
            title="Diagram Lingkaran"
          >
            <PieIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart View */}
      <div className="flex-1 min-h-[260px] flex items-center justify-center">
        {chartData.length === 0 ? (
          <div className="text-center text-gray-500 text-xs">
            Belum ada data pengeluaran di periode ini
          </div>
        ) : chartType === 'bar' ? (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis
                  type="number"
                  tickFormatter={(val) => formatRupiahCompact(val)}
                  stroke="#64748B"
                  fontSize={10}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  width={110}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Total']}
                  contentStyle={{
                    backgroundColor: '#11182E',
                    borderColor: '#232F55',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <RechartsPie>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Nominal']}
                  contentStyle={{
                    backgroundColor: '#11182E',
                    borderColor: '#232F55',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </RechartsPie>
            </ResponsiveContainer>

            {/* Compact Legend */}
            <div className="flex flex-wrap justify-center gap-2 max-h-16 overflow-y-auto px-2">
              {chartData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-gray-300">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="truncate max-w-[80px]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
