import { Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { InvestmentWithAsset } from '@shared/types';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface InvestmentStatsProps {
  investments: InvestmentWithAsset[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];

export const InvestmentStats: React.FC<InvestmentStatsProps> = ({ investments }) => {
  const totalInvested = investments.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const totalValue = investments.reduce((acc, curr) => acc + curr.currentValue, 0);
  const totalReturn = totalValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Data for Asset Allocation
  const allocationData = Object.values(
    investments.reduce(
      (acc, curr) => {
        if (!acc[curr.asset.assetType]) {
          acc[curr.asset.assetType] = { name: curr.asset.assetType, value: 0 };
        }
        acc[curr.asset.assetType].value += curr.currentValue;
        return acc;
      },
      {} as Record<string, { name: string; value: number }>
    )
  );

  // Data for Performance Chart - show all assets user has invested in
  const performanceData = investments.map((inv) => ({
    name: inv.asset.assetName,
    invested: inv.investedAmount,
    current: inv.currentValue,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-400">Total Portfolio Value</p>
              <h2 className="text-xl sm:text-3xl font-bold text-white mt-1 sm:mt-2 truncate">
                {formatCurrency(totalValue)}
              </h2>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-400">Total Return</p>
              <h2
                className={`text-xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate ${
                  totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {totalReturn >= 0 ? '+' : ''}
                {formatCurrency(totalReturn)}
              </h2>
              <p
                className={`text-xs mt-1 ${totalReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {returnPercentage.toFixed(2)}% All time
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-400">Total Assets</p>
              <h2 className="text-xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">
                {investments.length}
              </h2>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {investments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">
              No investment data available. Add some investments to see your portfolio analytics.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="min-h-[350px] sm:min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-4">
                {allocationData.map((entry: { name: string; value: number }, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs sm:text-sm text-slate-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[350px] sm:min-h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Performance by Asset</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" hide={true} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="invested" fill="#64748b" radius={[4, 4, 0, 0]} name="Invested" />
                  <Bar
                    dataKey="current"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    name="Current Value"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
