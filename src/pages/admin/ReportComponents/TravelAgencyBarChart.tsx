import React, { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Filter, ChevronDown, Globe, MapPin } from 'lucide-react';
import EmptyStateView from './EmptyStateView';
import Modal from './Modal';
import ReusableTable from './ReusableTable';
 
interface TravelAgencyApiResponse {
  isSuccess: boolean;
  result: TravelAgencyApiItem[];
  statusCode: number;
  errorMessages: string[];
}
 
interface TravelAgencyApiItem {
  travelAgencyName: string;
  travelType: 'International' | 'Domestic';
  requestCount: number;
  totalExpense: number;
}
 
interface BarChartItem {
  name: string;
  value: number;
  cost?: number;
  travelType?: 'international' | 'domestic';
  internationalCount?: number;
  domesticCount?: number;
  internationalCost?: number;
  domesticCost?: number;
}
 
interface TableDataItem {
  agency: string;
  bookings: number;
  cost: string;
  travel_type: string;
}
 
interface TravelAgencyBarChartProps {
  startDate?: string;
  endDate?: string;
}
 
type TravelTypeFilter = 'all' | 'international' | 'domestic';
 
const TravelAgencyBarChart: React.FC<TravelAgencyBarChartProps> = ({
   startDate, endDate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelTypeFilter, setTravelTypeFilter] = useState<TravelTypeFilter>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [chartData, setChartData] = useState<BarChartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    const fetchTravelAgencyData = async () => {
      if (!startDate || !endDate) return;
     
      setLoading(true);
      setError(null);
     
      try {
        const response = await fetch(
          `http://localhost:5030/api/TravelAgencyStats/stats?startDate=${startDate}&endDate=${endDate}`
        );
       
        if (!response.ok) {
          throw new Error('Failed to fetch travel agency data');
        }
       
        const data: TravelAgencyApiResponse = await response.json();
       
        if (data.isSuccess && data.result) {
          // Group by agency name and sum up the values
          const groupedData: { [key: string]: BarChartItem } = {};
         
          data.result.forEach(item => {
            const agencyName = item.travelAgencyName;
            const isInternational = item.travelType.toLowerCase() === 'international';
           
            if (!groupedData[agencyName]) {
              groupedData[agencyName] = {
                name: agencyName,
                value: 0,
                cost: 0,
                internationalCount: 0,
                domesticCount: 0,
                internationalCost: 0,
                domesticCost: 0
              };
            }
           
            // Add to totals
            groupedData[agencyName].value += item.requestCount;
            groupedData[agencyName].cost! += item.totalExpense;
           
            // Track by type for filtering
            if (isInternational) {
              groupedData[agencyName].internationalCount! += item.requestCount;
              groupedData[agencyName].internationalCost! += item.totalExpense;
            } else {
              groupedData[agencyName].domesticCount! += item.requestCount;
              groupedData[agencyName].domesticCost! += item.totalExpense;
            }
          });
         
          const transformedData: BarChartItem[] = Object.values(groupedData);
          setChartData(transformedData);
        } else {
          const errorMessage = data.errorMessages?.join(', ') || 'Unknown API error occurred';
          throw new Error(errorMessage);
        }
      } catch (err: any) {
        setError(err.message);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };
 
    fetchTravelAgencyData();
  }, [startDate, endDate]);
 
  const filteredChartData = useMemo(() => {
    if (!chartData) return [];
   
    if (travelTypeFilter === 'all') {
      return chartData;
    }
   
    // Filter and transform data based on travel type
    return chartData.map(item => {
      if (travelTypeFilter === 'international') {
        return {
          ...item,
          value: item.internationalCount || 0,
          cost: item.internationalCost || 0
        };
      } else {
        return {
          ...item,
          value: item.domesticCount || 0,
          cost: item.domesticCost || 0
        };
      }
    }).filter(item => item.value > 0);
  }, [chartData, travelTypeFilter]);

  // Enhanced responsive calculations
  const responsiveCalculations = useMemo(() => {
    const dataCount = filteredChartData.length;
    if (dataCount === 0) return { barWidth: 60, spacing: 16, shouldScroll: false };

    // Available chart width (accounting for Y-axis space and padding)
    const availableWidth = 400; // Adjust based on your container
    const minBarWidth = 40;
    const maxBarWidth = 100;
    const minSpacing = 8;
    const maxSpacing = 24;

    // Calculate optimal bar width and spacing
    let barWidth = Math.floor(availableWidth / dataCount * 0.7);
    let spacing = Math.floor(availableWidth / dataCount * 0.3);

    // Apply constraints
    barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, barWidth));
    spacing = Math.max(minSpacing, Math.min(maxSpacing, spacing));

    // Check if we need horizontal scrolling
    const totalWidth = dataCount * (barWidth + spacing) - spacing;
    const shouldScroll = totalWidth > availableWidth;

    return {
      barWidth,
      spacing,
      shouldScroll,
      totalWidth: shouldScroll ? totalWidth : availableWidth
    };
  }, [filteredChartData.length]);
 
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
    { value: 'international', label: 'International Only', icon: <Globe className="w-4 h-4" />, count: chartData?.filter(item => (item.internationalCount || 0) > 0).length || 0 },
    { value: 'domestic', label: 'Domestic Only', icon: <MapPin className="w-4 h-4" />, count: chartData?.filter(item => (item.domesticCount || 0) > 0).length || 0 }
  ];
 
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Agency Booking Metrics</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading travel agency data...</div>
        </div>
      </div>
    );
  }
 
  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Agency Booking Metrics</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }
 
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
            className="fixed inset-0 z-5"
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
 
  const tableHeaders = ['Agency', 'Bookings', 'Cost', 'Travel Type'];
 
  const totalBookings = filteredChartData.reduce((sum, item) => sum + item.value, 0);
  const totalCost = filteredChartData.reduce((sum, item) => sum + (item.cost || 0), 0);
 
  const tableData: TableDataItem[] = filteredChartData.map(item => ({
    agency: item.name,
    bookings: item.value,
    cost: `₹${(item.cost || 0).toLocaleString()}`,
    travel_type: travelTypeFilter === 'all' ? 'Combined' :
                travelTypeFilter.charAt(0).toUpperCase() + travelTypeFilter.slice(1)
  }));
 
  // Prepare export data configuration
  const exportConfig = {
    headers: tableHeaders,
    data: tableData,
    filename: `travel-agency-metrics-${travelTypeFilter === 'all' ? 'all' : travelTypeFilter}-${new Date().toISOString().split('T')[0]}`
  };
 
  // Dynamic Y-axis calculation based on filtered data
  const maxDataValue = Math.max(...filteredChartData.map(item => item.value), 0);
  const yAxisMax = Math.ceil(maxDataValue*1.1) ;
 
  // Calculate bar height scaling factor
  const chartHeight = 220;
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
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
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
          className="fixed inset-0 z-10"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Enhanced Scalable Chart Container */}
      <div className="relative h-64 flex justify-center">
        <div className="w-full max-w-4xl relative">
          {/* Y-axis line */}
          <div className="absolute left-14 top-0 bottom-8 w-px bg-gray-300"></div>
         
          {/* Y-axis label */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 transform text-sm font-medium text-gray-800">
            Booking Count
          </div>
         
          {/* Y-axis values and grid lines */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
            {Array.from({ length: yAxisMax + 1 }).map((_, i) => (
              <div key={i} className="flex items-center relative">
                <span className="text-xs font-medium text-gray-600 w-10 text-right pr-2">
                  {yAxisMax - i}
                </span>
                <div
                  className="absolute h-px bg-gray-200"
                  style={{
                    left: '3.5rem',
                    right: '1rem',
                    top: '50%',    
                    transform: 'translateY(-50%)'
                  }}
                ></div>
              </div>
            ))}
          </div>
         
          {/* X-axis line */}
          <div className="absolute left-14 right-0 bottom-7 h-px bg-gray-300"></div>
         
          {/* X-axis label */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700">
            Travel Agency
          </div>
 
          {/* Scrollable Chart Container */}
          <div 
            className={`absolute left-16 right-4 top-0 bottom-1 ${responsiveCalculations.shouldScroll ? 'overflow-x-auto' : ''}`}
            style={{ 
              width: responsiveCalculations.shouldScroll ? 'calc(100% - 5rem)' : 'calc(100% - 5rem)'
            }}
          >
            <div 
              className="flex items-end justify-start h-full"
              style={{ 
                width: responsiveCalculations.shouldScroll ? `${responsiveCalculations.totalWidth}px` : '100%',
                minWidth: '100%'
              }}
            >
              {filteredChartData.map((entry, index) => {
                const colors = [
                  'bg-purple-400', 'bg-pink-400', 'bg-cyan-400', 'bg-orange-400',
                  'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400',
                  'bg-indigo-400', 'bg-teal-400', 'bg-lime-400', 'bg-rose-400'
                ];
                const barColor = colors[index % colors.length];
                const isLastBar = index === filteredChartData.length - 1;
               
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center group relative" 
                    style={{ 
                      width: `${responsiveCalculations.barWidth}px`,
                      marginRight: isLastBar ? '0' : `${responsiveCalculations.spacing}px`
                    }}
                  >
               
                    <div className="text-sm font-semibold text-gray-700 mb-1">
                      {entry.value}
                    </div>
                   
                    {/* Responsive Bar */}
                    <div className="relative flex justify-center w-full">
                      <div
                        className={`${barColor} relative flex items-center justify-center transition-all duration-300 hover:opacity-80`}
                        style={{
                          width: `${Math.max(responsiveCalculations.barWidth * 0.8, 32)}px`,
                          height: `${Math.max(entry.value * (chartHeight / yAxisMax), 20)}px`,
                          minHeight: '20px'
                        }}
                      >
                        {/* Cost label - conditionally render based on bar width */}
                        {responsiveCalculations.barWidth >= 50 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="-rotate-90 text-xs font-medium text-white whitespace-nowrap">
                              ₹{(entry.cost || 0).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                   
                    {/* Responsive Agency Name */}
                    <div 
                      className="mt-2 text-xs font-medium text-gray-700 text-center w-full px-1 leading-tight"
                      style={{
                        fontSize: responsiveCalculations.barWidth < 60 ? '10px' : '12px',
                        lineHeight: responsiveCalculations.barWidth < 60 ? '12px' : '14px'
                      }}
                    >
                      {/* Truncate long names for narrow bars */}
                      {responsiveCalculations.barWidth < 60 && entry.name.length > 10 
                        ? `${entry.name.substring(0, 8)}...` 
                        : entry.name
                      }
                    </div>

                    {/* Tooltip for narrow bars */}
                    {responsiveCalculations.barWidth < 50 && (
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        <div>{entry.name}</div>
                        <div>₹{(entry.cost || 0).toLocaleString()}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
          <div className="text-lg font-semibold text-gray-800">₹{totalCost.toLocaleString()}</div>
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