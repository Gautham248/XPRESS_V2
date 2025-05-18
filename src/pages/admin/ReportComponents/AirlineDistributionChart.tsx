import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PieChartItem {
  name: string;
  value: number;
}

interface AirlineDistributionChartProps {
  chartData: PieChartItem[];
}

const AirlineDistributionChart: React.FC<AirlineDistributionChartProps> = ({ chartData }) => {
  const COLORS = ['#D8BFD8', '#FFC0CB', '#00CED1', '#FFA500'];
  const totalTrips = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom renderer for the pie chart labels (only numbers)
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Airline Distribution</h3>
      </div>

      <div className="flex h-80">
        {/* Pie chart area - 75% width */}
        <div className="w-3/4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ right: 0 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={24} fontWeight="bold">
                {totalTrips}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend area - 25% width */}
        <div className="w-1/4 flex items-center">
          <div className="w-full">
            {chartData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center mb-4">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{entry.name}</span>
                  <span className="text-xs text-gray-500">{entry.value} trips</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirlineDistributionChart;