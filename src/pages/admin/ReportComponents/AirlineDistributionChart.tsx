import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ExternalLink, Filter, ChevronDown, Globe, MapPin } from 'lucide-react';
import ReusableTable from './ReusableTable';
import Modal from './Modal';
import EmptyStateView from './EmptyStateView';

interface PieChartItem {
  name: string;
  value: number;
  cost?: number;
  travelType?: 'International' | 'Domestic';
}

interface TableDataItem {
  airline: string;
  trips: number;
  cost: string;
  travel_type: string;
}

// API Response interfaces
interface AirlineReportItem {
  airlineName: string;
  typeOfTravel: 'Domestic' | 'International';
  travelRequestCount: number;
  totalAirlineExpense: number;
}

export interface AirlineReportsResponse {
  isSuccess: boolean;
  result: AirlineReportItem[];
  statusCode: number;
  errorMessages: string[];
}

interface AirlineDistributionChartProps {
  startDate?: string;
  endDate?: string;
}

type TravelTypeFilter = 'all' | 'International' | 'Domestic';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieChartItem;
    color: string;
  }>;
  label?: string;
}

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  value: number;
}

interface FilterOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

// Custom Tooltip Component - Updated to remove travel type
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-48">
        <div className="flex items-center mb-2">
          <div 
            className="w-3 h-3 rounded-sm mr-2" 
            style={{ backgroundColor: payload[0].color }}
          />
          <h3 className="font-semibold text-gray-800 text-sm">{data.name}</h3>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Trips:</span>
            <span className="font-medium text-gray-800">{data.value}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Cost:</span>
            <span className="font-medium text-gray-800">₹{(data.cost || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const AirlineDistributionChart: React.FC<AirlineDistributionChartProps> = ({ 
  startDate, 
  endDate 
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [travelTypeFilter, setTravelTypeFilter] = useState<TravelTypeFilter>('all');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  
  // State for API data - Keep original data separate
  const [originalApiData, setOriginalApiData] = useState<AirlineReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch airline data from API
  useEffect(() => {
    const fetchAirlineData = async (): Promise<void> => {
      if (!startDate || !endDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://xpress-backend-v3.onrender.com/api/AirlineReports?startDate=${startDate}&endDate=${endDate}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch airline data');
        }
        
        const data: AirlineReportsResponse = await response.json();
        
        if (data.isSuccess && data.result) {
          setOriginalApiData(data.result);
        } else {
          const errorMessage = data.errorMessages?.join(' ') || 'Unknown API error occurred';
          throw new Error(errorMessage);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setOriginalApiData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAirlineData();
  }, [startDate, endDate]);
  
  // Process data based on current filter
  const chartData = useMemo(() => {
    if (originalApiData.length === 0) return [];
    
    // Filter the original data first based on travel type filter
    let filteredApiData = originalApiData;
    if (travelTypeFilter !== 'all') {
      filteredApiData = originalApiData.filter(item => item.typeOfTravel === travelTypeFilter);
    }
    
    // Then group by airline name
    const airlineMap = new Map<string, { trips: number; cost: number; travelType: 'International' | 'Domestic' | 'Both' }>();
    
    filteredApiData.forEach(item => {
      const existing = airlineMap.get(item.airlineName);
      if (existing) {
        existing.trips += item.travelRequestCount;
        existing.cost += item.totalAirlineExpense;
        // If we already have a different travel type, mark as 'Both'
        if (existing.travelType !== item.typeOfTravel) {
          existing.travelType = 'Both';
        }
      } else {
        airlineMap.set(item.airlineName, {
          trips: item.travelRequestCount,
          cost: item.totalAirlineExpense,
          travelType: item.typeOfTravel
        });
      }
    });
    
    // Transform to chart format
    const transformedData: PieChartItem[] = Array.from(airlineMap.entries()).map(([name, data]) => ({
      name,
      value: data.trips,
      cost: data.cost,
      travelType: data.travelType === 'Both' ? undefined : data.travelType
    }));
    
    return transformedData;
  }, [originalApiData, travelTypeFilter]);
  
  // Check if filtered data is empty or only contains zero values
  const isEmptyData: boolean = chartData.length === 0 || chartData.every(item => item.value === 0);
  
  // Generate dynamic colors based on number of airlines
  const generateColors = (count: number): string[] => {
    const baseColors: string[] = [
      '#D8BFD8', // Light purple 
      '#FFC0CB', // Pink 
      '#00CED1', // Turquoise 
      '#FFA500', // Orange 
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
  const totalCost: number = chartData.reduce((sum, item) => sum + (item.cost || 0), 0);

  const renderCustomizedLabel = (props: CustomLabelProps): JSX.Element | null => {
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

  // Table headers
  const tableHeaders: string[] = ["Airline", "Trips", "Cost", "Travel Type"];
  const tableData: TableDataItem[] = chartData.map(item => ({
    airline: item.name,
    trips: item.value,
    cost: `₹${(item.cost || 0).toLocaleString()}`,
    travel_type: travelTypeFilter === 'all' 
      ? (item.travelType ? item.travelType.charAt(0).toUpperCase() + item.travelType.slice(1) : 'Both')
      : travelTypeFilter.charAt(0).toUpperCase() + travelTypeFilter.slice(1)
  }));

  // Prepare export configuration for the modal
  const exportConfig = {
    headers: tableHeaders,
    data: tableData,
    filename: `flight-provider-data-${travelTypeFilter === 'all' ? 'all' : travelTypeFilter}`
  };

  // Get filter display text
  const getFilterDisplayText = (): string => {
    switch (travelTypeFilter) {
      case 'International':
        return 'International Flights';
      case 'Domestic':
        return 'Domestic Flights';
      default:
        return 'All Flights';
    }
  };

  // Get filter icon
  const getFilterIcon = (): JSX.Element => {
    switch (travelTypeFilter) {
      case 'International':
        return <Globe className="w-4 h-4" />;
      case 'Domestic':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Filter className="w-4 h-4" />;
    }
  };

  // Flight icon for empty state
  const flightIcon: JSX.Element = (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.5 12H6.5M21.5 12L16.5 7M21.5 12L16.5 17M6.5 12L2.5 18M6.5 12L2.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  // Calculate filter counts based on original data
  const getFilterCounts = () => {
    const allCount = new Set(originalApiData.map(item => item.airlineName)).size;
    const internationalCount = new Set(
      originalApiData
        .filter(item => item.typeOfTravel === 'International')
        .map(item => item.airlineName)
    ).size;
    const domesticCount = new Set(
      originalApiData
        .filter(item => item.typeOfTravel === 'Domestic')
        .map(item => item.airlineName)
    ).size;

    return { allCount, internationalCount, domesticCount };
  };

  const { allCount, internationalCount, domesticCount } = getFilterCounts();

  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All Flights', icon: <Filter className="w-4 h-4" />, count: allCount },
    { value: 'International', label: 'International Only', icon: <Globe className="w-4 h-4" />, count: internationalCount },
    { value: 'Domestic', label: 'Domestic Only', icon: <MapPin className="w-4 h-4" />, count: domesticCount }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading airline data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-600">Error loading airline data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleScrollFade = (e: React.UIEvent<HTMLDivElement>): void => {
    const container = e.currentTarget;
    const fadeTop = document.getElementById('legend-fade-top');
    const fadeBottom = document.getElementById('legend-fade-bottom');
    
    if (fadeTop && fadeBottom) {
      // Show/hide top fade
      if (container.scrollTop > 10) {
        fadeTop.style.opacity = '1';
      } else {
        fadeTop.style.opacity = '0';
      }
      
      // Show/hide bottom fade
      const isScrolledToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      if (isScrolledToBottom) {
        fadeBottom.style.opacity = '0';
      } else {
        fadeBottom.style.opacity = '1';
      }
    }
  };

  // Custom styles object for the scrollable container
  const scrollContainerStyles: React.CSSProperties = {
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e1 #f8fafc',
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-lg font-bold text-gray-800">Flight Provider Insights</h3>
          {!isEmptyData && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="ml-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <ExternalLink size={16} />
            </button>
          )}
        </div>
        
        {/* Modern Filter UI */}
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
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isFilterOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {isEmptyData ? (
        <EmptyStateView
          icon={flightIcon}
          title="No flight data available"
          message={`No ${travelTypeFilter === 'all' ? '' : travelTypeFilter + ' '}flight provider data is currently available to display.`}
        />
      ) : (
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
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={24} fontWeight="bold">
                  {totalTrips}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Enhanced Legend with Smooth Scroll */}
          <div className="w-1/4 flex items-center">
            <div className="w-full relative">
              {/* Gradient fade indicators */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300" id="legend-fade-top" />
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none opacity-0 transition-opacity duration-300" id="legend-fade-bottom" />
              
              {/* Scrollable legend container */}
              <div 
                className="max-h-72 overflow-y-auto pr-2"
                onScroll={handleScrollFade}
                style={scrollContainerStyles}
              >
                {chartData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center mb-4 group">
                    <div 
                      className="w-3 h-3 mr-3 rounded-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-800 truncate group-hover:text-gray-900 transition-colors duration-200" 
                            title={entry.name}>
                        {entry.name}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                        ₹{(entry.cost || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary statistics */}
      {!isEmptyData && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
            <span className="text-gray-600">Total Trips ({getFilterDisplayText()})</span>
            <div className="text-lg font-semibold text-gray-800">{totalTrips.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
            <span className="text-gray-600">Total Cost ({getFilterDisplayText()})</span>
            <div className="text-lg font-semibold text-gray-800">₹{totalCost.toLocaleString()}</div>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Flight Provider Details - ${getFilterDisplayText()}`}
        startDate={startDate}
        endDate={endDate}
        exportData={exportConfig}
      >
        <ReusableTable headers={tableHeaders} data={tableData} />
      </Modal>
    </div>
  );
};

export default AirlineDistributionChart;