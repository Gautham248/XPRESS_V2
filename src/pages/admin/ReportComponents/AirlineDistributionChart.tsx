import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ExternalLink } from 'lucide-react';
import ReusableTable from './ReusableTable';
import Modal from './Modal';

interface PieChartItem {
  name: string;
  value: number;
}

interface TableDataItem {
  airline: string;
  trips: number;
  percentage: string;
}

interface AirlineDistributionChartProps {
  chartData: PieChartItem[];
  startDate?: string;
  endDate?: string;
}

const AirlineDistributionChart: React.FC<AirlineDistributionChartProps> = ({ chartData, startDate, endDate }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Generate dynamic colors based on number of travel agencies
  const generateColors = (count: number): string[] => {
    const baseColors: string[] = [
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
    
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    } else {
      const extraColors: string[] = [];
      for (let i = baseColors.length; i < count; i++) {
        const hue: number = Math.floor(Math.random() * 360);
        const saturation: number = 70 + Math.floor(Math.random() * 30);
        const lightness: number = 45 + Math.floor(Math.random() * 25);
        extraColors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
      }
      return [...baseColors, ...extraColors];
    }
  };
  
  const COLORS: string[] = generateColors(chartData.length);
  const totalTrips: number = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomizedLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    value: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
    
    if (cx === undefined || cy === undefined || midAngle === undefined || 
        innerRadius === undefined || outerRadius === undefined) {
      return null;
    }
    
    const RADIAN: number = Math.PI / 180;
    const radius: number = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
    const x: number = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
    const y: number = Number(cy) + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
        {value}
      </text>
    );
  };

  const tableHeaders: string[] = ["Airline", "Trips", "Percentage"];
  const tableData: TableDataItem[] = chartData.map(item => ({
    airline: item.name,
    trips: item.value,
    percentage: `${((item.value / totalTrips) * 100).toFixed(1)}%`
  }));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-800">Flight Provider Insights</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="flex h-80">
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Flight Provider Details"
        startDate={startDate}
        endDate={endDate}
      >
        <ReusableTable headers={tableHeaders} data={tableData} />
      </Modal>
    </div>
  );
};

export default AirlineDistributionChart;