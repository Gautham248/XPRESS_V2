import React, { useState, useMemo } from 'react';
import { ExternalLink, Filter, ChevronDown, Globe, MapPin } from 'lucide-react';
import EmptyStateView from './EmptyStateView';
import Modal from './Modal';
import ReusableTable from './ReusableTable';

interface BarChartItem {
  name: string; // Assumed to be like "TA-1 (Domestic)" or "TA-2 (International)"
  value: number;
  cost?: number;
  travelType?: 'international' | 'domestic';
}

interface TableDataItem {
  agency: string;
  bookings: number;
  cost: string;
  travel_type: string;
}

interface TravelAgencyBarChartProps {
  chartData?: BarChartItem[];
  startDate?: string;
  endDate?: string;
}

type TravelTypeFilter = 'all' | 'international' | 'domestic';

const TravelAgencyBarChart: React.FC<TravelAgencyBarChartProps> = ({ 
   chartData, startDate, endDate 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelTypeFilter, setTravelTypeFilter] = useState<TravelTypeFilter>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Filter data based on travel type
  const filteredChartData = useMemo(() => {
    if (!chartData) return [];
    if (travelTypeFilter === 'all') {
      return chartData;
    }
    return chartData.filter(item => item.travelType === travelTypeFilter);
  }, [chartData, travelTypeFilter]);

  // Check if filtered data is empty or only contains zero values
  const isEmptyData = !filteredChartData || filteredChartData.length === 0 || filteredChartData.every(item => item.value === 0);

  // Get filter display text
  const getFilterDisplayText = (): string => {
    switch (travelTypeFilter) {
      case 'international':
        return 'International Bookings';
      case 'domestic':
        return 'Domestic Bookings';
      default:
        return 'All Bookings';
    }
  };

  // Get filter icon
  const getFilterIcon = () => {
    switch (travelTypeFilter) {
      case 'international':
        return <Globe className="w-4 h-4" />;
      case 'domestic':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  // Document icon for empty state
  const documentIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002-2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );

  const filterOptions = [
    { value: 'all', label: 'All Bookings', icon: <Filter className="w-4 h-4" />, count: chartData?.length || 0 },
    { value: 'international', label: 'International Only', icon: <Globe className="w-4 h-4" />, count: chartData?.filter(item => item.travelType === 'international').length || 0 },
    { value: 'domestic', label: 'Domestic Only', icon: <MapPin className="w-4 h-4" />, count: chartData?.filter(item => item.travelType === 'domestic').length || 0 }
  ];

  if (isEmptyData) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Agency Booking Metrics</h2>
          </div>
          
          {/* Filter UI even in empty state */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg text-sm font-medium text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md min-w-[160px]"
            >
              {getFilterIcon()}
              <span className="flex-1 text-left">{getFilterDisplayText()}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden">
                <div className="py-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTravelTypeFilter(option.value as TravelTypeFilter);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                        travelTypeFilter === option.value 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`${travelTypeFilter === option.value ? 'text-blue-600' : 'text-gray-400'}`}>
                          {option.icon}
                        </span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlay to close dropdown when clicking outside */}
        {isFilterOpen && (
          <div 
            className="fixed inset-0 z-5" // z-index was 5, ensure it's below dropdown (z-10)
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        <EmptyStateView 
          icon={documentIcon}
          title="No agency data available"
          message={`No ${travelTypeFilter === 'all' ? '' : travelTypeFilter + ' '}travel agency data is currently available to display.`}
        />
      </div>
    );
  }

  // Convert chart data to table format for the ReusableTable component
  const tableHeaders = ['Agency', 'Bookings', 'Cost', 'Travel Type'];
  
  // Calculate total bookings and total cost
  const totalBookings = filteredChartData.reduce((sum, item) => sum + item.value, 0);
  const totalCost = filteredChartData.reduce((sum, item) => sum + (item.cost || 0), 0);
  
  // Format data for the table with travel type
  const tableData: TableDataItem[] = filteredChartData.map(item => ({
    agency: item.name, // Keep original name for table
    bookings: item.value,
    cost: `$${(item.cost || 0).toLocaleString()}`,
    travel_type: item.travelType ? item.travelType.charAt(0).toUpperCase() + item.travelType.slice(1) : 'Unknown'
  }));

  // Prepare export data configuration
  const exportConfig = {
    headers: tableHeaders,
    data: tableData,
    filename: `travel-agency-metrics-${travelTypeFilter === 'all' ? 'all' : travelTypeFilter}-${new Date().toISOString().split('T')[0]}`
  };

  // Dynamic Y-axis calculation based on filtered data
  const maxDataValue = Math.max(...filteredChartData.map(item => item.value), 0); // Added 0 to handle empty filteredChartData gracefully for Math.max
  const yAxisMax = Math.ceil(maxDataValue) + 1; 
  
  // Calculate bar height scaling factor
  const chartHeight = 220; // This is the effective drawing height for bars
  const barHeightScale = yAxisMax > 1 ? chartHeight / (yAxisMax -1) : chartHeight;
                       


  return (
    <div className="bg-white rounded-lg pt-6 ">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center pb-6">
          <h3 className="text-5lg font-bold text-gray-800">Agency Booking Metrics</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-2 text-blue-600 hover:text-blue-800 mb-1 transition-colors duration-200"
          >
            <ExternalLink size={16} />
          </button>
        </div>

        {/* Modern Filter UI */}
        <div className="relative -top-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg text-sm font-medium text-gray-700 transition-all duration-200 shadow-sm hover:shadow-md min-w-[160px]"
          >
            {getFilterIcon()}
            <span className="flex-1 text-left">{getFilterDisplayText()}</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden"> {/* Increased z-index for dropdown */}
              <div className="py-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTravelTypeFilter(option.value as TravelTypeFilter);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                      travelTypeFilter === option.value 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`${travelTypeFilter === option.value ? 'text-blue-600' : 'text-gray-400'}`}>
                        {option.icon}
                      </span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isFilterOpen && (
        <div 
          className="fixed inset-0 z-10" // z-index for overlay, must be below dropdown
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      <div className="relative h-64 flex justify-center">
        <div className="w-full max-w-lg relative"> {/* This is the main chart plotting area */}
          {/* Y-axis line */}
          <div className="absolute left-14 top-0 bottom-8 w-px bg-gray-300"></div>
          
          {/* Y-axis label */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 transform text-sm font-medium text-gray-800">
            Booking Count
          </div>
          
          {/* Y-axis values and grid lines */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
            {Array.from({ length: yAxisMax + 1 }).map((_, i) => (
              <div key={i} className="flex items-center relative"> {/* Added relative for grid line positioning */}
                <span className="text-xs font-medium text-gray-600 w-10 text-right pr-2">
                  {yAxisMax - i}
                </span>
                {/* Improved Grid line: spans from Y-axis line to right edge of bar area */}
                <div 
                  className="absolute h-px bg-gray-200"
                  style={{ 
                    left: '3.5rem', /* Corresponds to left-14 (Y-axis line) relative to chart parent */
                    right: '1rem',  /* Corresponds to right-4 (bar area end) relative to chart parent */
                    top: '50%',     
                    transform: 'translateY(-50%)' 
                  }}
                ></div>
              </div>
            ))}
          </div>
          
          {/* X-axis line */}
          <div className="absolute left-14 right-0 bottom-8 h-px bg-gray-300"></div>
          
          {/* X-axis label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700">
            Travel Agency
          </div>

          {/* Chart area with bars - MODIFIED bottom position */}
          <div className="absolute left-16 right-4 top-0 bottom-1 flex items-end justify-around">
            {filteredChartData.map((entry, index) => {
              const colors = [
                'bg-purple-400', 'bg-pink-400', 'bg-cyan-400', 'bg-orange-400',
                'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400',
                'bg-indigo-400', 'bg-teal-400', 'bg-lime-400', 'bg-rose-400'
              ];
              const barColor = colors[index % colors.length];
              
              // MODIFICATION: Parse entry.name to remove "(Domestic)" or "(International)" part for display
              const displayName = entry.name.split('(')[0].trim();
              
              return (
                <div key={index} className="flex flex-col items-center group relative" style={{ minWidth: `${Math.max(80, 400 / filteredChartData.length)}px` }}>
                  {/* Booking count above bar */}
                  <div className="text-sm font-semibold text-gray-700 mb-1">
                    {entry.value}
                  </div>
                  
                  {/* Bar with cost displayed vertically inside the bar */}
                  <div className="relative flex justify-center">
                    <div 
                      className={`${barColor} relative flex items-center justify-center`}
                      style={{ 
                        width: `${Math.max(64, 300 / filteredChartData.length)}px`,
                        height: `${entry.value * (chartHeight / yAxisMax)}px`, // Use consistent scaling factor
                        minHeight: '40px' 
                      }}
                    >
                      {/* Cost label positioned vertically inside the bar */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="-rotate-90 text-xs font-medium text-white whitespace-nowrap">
                          ${(entry.cost || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* X-axis label (agency name) - MODIFIED to use displayName and centered */}
                  <div className="mt-2 text-sm font-medium text-gray-700 text-center w-full px-1 break-words">
                    {displayName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="mt-16 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
          <span className="text-gray-600">Total Bookings ({getFilterDisplayText()})</span>
          <div className="text-lg font-semibold text-gray-800">{totalBookings.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
          <span className="text-gray-600">Total Cost ({getFilterDisplayText()})</span>
          <div className="text-lg font-semibold text-gray-800">${totalCost.toLocaleString()}</div>
        </div>
      </div>

      {/* Modal component with ReusableTable and export functionality */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Travel Agency Details - ${getFilterDisplayText()}`}
        startDate={startDate}
        endDate={endDate}
        exportData={exportConfig}
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