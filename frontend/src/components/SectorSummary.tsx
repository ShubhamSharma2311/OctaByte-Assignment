import React from 'react';
import { SectorSummary } from '../types/portfolio';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SectorSummaryProps {
  sectors: SectorSummary[];
}

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

export const SectorSummaryComponent: React.FC<SectorSummaryProps> = ({ sectors }) => {
  if (!sectors || sectors.length === 0) {
    return null;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartData = sectors.map((sector, index) => ({
    name: sector.sector,
    value: sector.totalInvestment,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector Summary</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Sector</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Investment</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Present Value</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Gain/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sectors.map((sector, index) => (
                  <tr key={sector.sector} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">{sector.sector}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 text-sm text-gray-900">
                      {formatCurrency(sector.totalInvestment)}
                    </td>
                    <td className="text-right py-3 text-sm text-gray-900">
                      {formatCurrency(sector.totalPresentValue)}
                    </td>
                    <td className={`text-right py-3 text-sm font-semibold px-2 rounded border ${
                      (sector.gainLoss || 0) >= 0 ? 'text-green-900 bg-green-100 border-green-300' : 'text-red-900 bg-red-100 border-red-300'
                    }`}>
                      {formatCurrency(sector.gainLoss || 0)}
                      <br />
                      <span className="text-xs font-medium">
                        ({(sector.gainLossPercentage || 0).toFixed(2)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Investment Distribution</h3>
          
          <div className="h-48 w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  fontSize={10}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Investment']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};