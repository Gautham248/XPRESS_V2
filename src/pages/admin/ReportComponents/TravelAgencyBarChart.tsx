import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import EmptyStateView from './EmptyStateView';
import Modal from './Modal';
import ReusableTable from './ReusableTable';

interface BarChartItem {
  name: string;
  value: number;
}

interface TravelAgencyBarChartProps {
  chartData?: BarChartItem[];
  startDate?: string;
  endDate?: string;
}

const TravelAgencyBarChart: React.FC<TravelAgencyBarChartProps> = ({ 
   chartData, startDate, endDate 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if there's no data or empty array
  if (!chartData || chartData.length === 0) {
    // Document icon for empty state
    const documentIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    );

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-4 flex justify-start items-center">
          <h3 className="text-lg font-semibold text-gray-800">Agency Booking Metrics</h3>
        </div>
        <EmptyStateView 
          icon={documentIcon}
          title="No agency data available"
          message="No travel agency data is currently available to display."
        />
      </div>
    );
  }

  // Convert chart data to table format for the ReusableTable component
  const tableHeaders = ['Agency', 'Bookings', 'Percentage'];
  
  // Calculate total bookings for percentage calculation
  const totalBookings = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Format data for the table
  const tableData = chartData.map(item => ({
    agency: item.name,
    bookings: item.value,
    percentage: `${((item.value / totalBookings) * 100).toFixed(1)}%`
  }));

  // Dynamic Y-axis calculation based on data
  const maxDataValue = Math.max(...chartData.map(item => item.value));
  // Round up to next nice number - add 1 to ensure bars don't touch the top
  const yAxisMax = Math.ceil(maxDataValue) + 1; 
  
  // Calculate bar height scaling factor
  const chartHeight = 220; // Chart area height
  const barHeightScale = chartHeight / yAxisMax; // Pixels per unit

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center pb-6">
          <h3 className="text-lg font-bold text-gray-800 ">Agency Booking Metrics</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-2 text-blue-600 hover:text-blue-800 mb-1"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="relative h-64 flex justify-center">
        <div className="w-full max-w-lg relative">
          {/* Y-axis line */}
          <div className="absolute left-14 top-0 bottom-8 w-px bg-gray-300"></div>
          
          {/* Y-axis label */}
          <div className="absolute -left-12 top-1/2 -rotate-90 transform text-sm font-medium text-gray-800">
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
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700">
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

      {/* Modal component with ReusableTable */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Travel Agency Details"
        startDate={startDate}
        endDate={endDate}
      >
        <div className="px-6">
          <ReusableTable 
            headers={tableHeaders}
            data={tableData}
          />
        </div>
      </Modal>
    </div>
  );
};

export default TravelAgencyBarChart;