import { useState } from 'react';

interface BarChartItem {
  name: string;
  value: number;
}

interface TravelAgencyBarChartProps {
  chartData?: BarChartItem[];
}

const TravelAgencyBarChart: React.FC<TravelAgencyBarChartProps> = ({ chartData }) => {
  // Handle the case where chartData is undefined
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-3xl mx-auto">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  // Dynamic Y-axis calculation based on data
  const maxDataValue = Math.max(...chartData.map(item => item.value));
  // Round up to next nice number - add 1 to ensure bars don't touch the top
  const yAxisMax = Math.ceil(maxDataValue) + 1; 
  
  // Calculate bar height scaling factor
  const chartHeight = 220; // Chart area height
  const barHeightScale = chartHeight / yAxisMax; // Pixels per unit

  return (
    <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 text-center">Agency Booking Metrics</h2>
      </div>

      <div className="relative h-64">
        {/* Y-axis line */}
        <div className="absolute left-14 top-0 bottom-8 w-px bg-gray-300"></div>
        
        {/* Y-axis label */}
        <div className="absolute -left-12 top-1/2 -rotate-90 transform text-sm font-medium text-gray-700">
          Booking Count
        </div>
        
        {/* Y-axis values and grid lines */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
          {Array.from({ length: yAxisMax + 1 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="text-xs font-medium text-gray-600 w-10 text-right pr-2">
                {yAxisMax - i}
              </span>
              <div className="absolute left-14 right-0 h-px bg-gray-200"></div>
            </div>
          ))}
        </div>
        
        {/* X-axis line */}
        <div className="absolute left-14 right-0 bottom-8 h-px bg-gray-300"></div>
            {/* X-axis label */}
   <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700">
  Travel Agency
</div>

        
        {/* Chart area with bars */}
        <div className="absolute left-16 right-4 top-0 bottom-1 flex items-end justify-around">
          {chartData.map((entry, index) => (
            <div key={index} className="flex flex-col items-center group">
              {/* Value label above bar */}
              <div className="text-sm font-semibold text-gray-700 mb-1">
                {entry.value}
              </div>
              
              {/* Bar */}
              <div 
                className={`w-16 ${
                  index === 0 ? 'bg-purple-400' : 
                  index === 1 ? 'bg-pink-400' : 
                  index === 2 ? 'bg-cyan-400' : 
                  'bg-orange-400'
                }`} 
                style={{ height: `${entry.value * barHeightScale}px` }}
              ></div>
              
              {/* X-axis label (agency name) directly below the x-axis */}
              <div className="mt-2 text-sm font-medium text-gray-700">
                {entry.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelAgencyBarChart;