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
  // Check if there's no data or empty array
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm h-80 flex flex-col items-center justify-center">
        <div className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No airline data available</h3>
        <p className="text-sm text-gray-500 text-center">No flight provider data is currently available to display.</p>
      </div>
    );
  }

  // Generate dynamic colors based on number of travel agencies
  const generateColors = (count: number) => {
    // Base set of vibrant colors
    const baseColors = [
      '#D8BFD8', // Light purple (AirIndia)
      '#FFC0CB', // Pink (IndiGo)
      '#00CED1', // Turquoise (AirAsia)
      '#FFA500', // Orange (Delta Airlines)
      '#98FB98', // Pale green
      '#87CEEB', // Sky blue
      '#FFD700', // Gold
      '#FF6347', // Tomato
      '#BA55D3', // Medium orchid
      '#20B2AA', // Light sea green
      '#4682B4', // Steel blue
      '#FF4500'  // Orange red
    ];
    
    // If we have more agencies than base colors, we'll generate additional colors
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    } else {
      const extraColors = [];
      for (let i = baseColors.length; i < count; i++) {
        // Generate random colors if we need more than our base set
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
        const lightness = 45 + Math.floor(Math.random() * 25); // 45-70%
        extraColors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      }
      return [...baseColors, ...extraColors];
    }
  };
  
  const COLORS = generateColors(chartData.length);
  const totalTrips = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom renderer for the pie chart labels with explicit typing
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
    
    // Handle potential undefined values
    if (cx === undefined || cy === undefined || midAngle === undefined || 
        innerRadius === undefined || outerRadius === undefined) {
      return null;
    }
    
    const RADIAN = Math.PI / 180;
    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Flight Provider Insights</h3>
      </div>

      <div className="flex h-80">
        {/* Pie chart area - 75% width */}
        <div className="w-3/4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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