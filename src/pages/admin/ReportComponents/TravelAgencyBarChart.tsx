interface BarChartItem {
  name: string;
  value: number;
}

interface TravelAgencyBarChartProps {
  chartData: BarChartItem[];
}

const TravelAgencyBarChart: React.FC<TravelAgencyBarChartProps> = ({ chartData }) => {
  // Dynamic Y-axis calculation
  const maxValue = Math.max(...chartData.map(entry => entry.value), 1); // Ensure at least 1
  const yAxisStep = Math.ceil(maxValue / 5); // Divide into 5 steps, round up
  const yAxisMax = yAxisStep * 5; // Ensure we have 5 intervals
  const yAxisLabels = Array.from({ length: 6 }, (_, i) => yAxisMax - i * yAxisStep); // Generate labels from max to 0

  // Calculate bar height scaling factor
  const chartHeight = 300; // Adjusted height to account for labels above bars and legend below
  const barHeightScale = chartHeight / yAxisMax; // Pixels per unit

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Travel Agency Usage</h3>
      </div>

      <div className="w-full h-80 relative">
        {/* Y-axis labels and grid lines */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-right pr-2 text-gray-500 text-xs">
          {yAxisLabels.map((label, index) => (
            <div key={index} className={index === 0 ? 'pt-0' : index === yAxisLabels.length - 1 ? 'pb-0' : ''}>
              {label}
            </div>
          ))}
        </div>
        
        {/* Grid lines */}
        <div className="absolute left-10 right-0 top-0 bottom-4">
          {yAxisLabels.map((_, i) => (
            <div key={i} className="border-t border-gray-200" style={{ height: `${100 / (yAxisLabels.length - 1)}%` }}></div>
          ))}
        </div>
        
        {/* Chart area with bars */}
        <div className="absolute left-12 right-4 top-0 bottom-4 flex items-end justify-around">
          {chartData.map((entry, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Count label above the bar */}
              <span className="text-sm font-medium text-gray-800 mb-1">{entry.value}</span>
              {/* Bar */}
              <div 
                className={`w-12 ${index === 0 ? 'bg-purple-300' : index === 1 ? 'bg-pink-300' : index === 2 ? 'bg-cyan-300' : 'bg-orange-300'}`} 
                style={{ height: `${entry.value * barHeightScale}px` }}
              ></div>
            </div>
          ))}
        </div>
        
        {/* Legend below X-axis */}
        <div className="absolute bottom-0 left-12 right-4 flex justify-around pt-20">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 mr-1 ${index === 0 ? 'bg-purple-300' : index === 1 ? 'bg-pink-300' : index === 2 ? 'bg-cyan-300' : 'bg-orange-300'}`}></div>
              <span className="text-xs">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelAgencyBarChart;