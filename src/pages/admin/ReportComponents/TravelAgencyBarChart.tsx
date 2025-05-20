import React from 'react';

interface BarChartItem {
  name: string;
  value: number;
}

interface TravelAgencyBarChartProps {
  chartData?: BarChartItem[];
}

const TravelAgencyBarChart: React.FC<TravelAgencyBarChartProps> = ({ 
  chartData
}) => {

  // Check if there's no data or empty array
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm h-80 flex flex-col items-center justify-center">
        <div className="text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No agency data available</h3>
        <p className="text-sm text-gray-500 text-center">No travel agency data is currently available to display.</p>
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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">Agency Booking Metrics</h3>
      </div>

      <div className="relative h-64 flex justify-center">
        <div className="w-full max-w-lg relative">
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
                  style={{ 
                    height: `${entry.value * barHeightScale}px`
                  }}
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
    </div>
  );
};

export default TravelAgencyBarChart;