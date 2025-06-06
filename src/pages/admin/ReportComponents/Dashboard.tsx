import React, { useState, useEffect } from 'react';
import { Briefcase, Ticket, AlertCircle, ArrowUpDown, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Reports from './Reports';

// API Response interface
interface ApiResponse<T> {
  isSuccess: boolean;
  result: T;
  statusCode: number;
  errorMessages: string[];
}

// API Result interfaces
interface CountResult {
  count: number;
}

interface TravelLegsResult {
  todayOutboundDepartureCount: number;
  todayReturnArrivalCount: number;
}

// Dashboard stats interface
interface DashboardStats {
  newRequestsCount: number;
  ticketActionsCount: number;
  slaBreachCount: number;
  rejectedCount: number;
  returnAndDepartureCount: number;
}

// Reusable MetricCard Component
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  iconColor: string;
  bgColor: string;
  hoverColor: string;
  onClick?: () => void;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  title, 
  value, 
  iconColor, 
  bgColor, 
  hoverColor,
  onClick,
  isLoading = false
}) => {
  return (
    <div 
      className={`${bgColor} border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden`}
      onClick={onClick}
    >
      
      <div className="absolute inset-0 overflow-hidden">
    
        <div className="absolute -top-4 -right-4 opacity-25 transform rotate-12">
          <div className="text-white drop-shadow-lg">
            {React.cloneElement(icon as React.ReactElement, { className: "h-32 w-32" })}
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      </div>
      
      <div className="relative">
        {/* Title */}
        <h3 className="text-sm text-gray-700 mb-2 font-semibold">
          {title}
        </h3>
        
        {/* Value */}
        <div className="mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {isLoading ? (
              <div className="animate-pulse bg-gray-300 h-8 w-12 rounded"></div>
            ) : (
              value
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    newRequestsCount: 0,
    ticketActionsCount: 0,
    slaBreachCount: 0,
    rejectedCount: 0,
    returnAndDepartureCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Base API URL
  const API_BASE_URL = 'http://localhost:5030';

  // API fetch utility function
  const fetchApiData = async <T,>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<T> = await response.json();
      
      if (!data.isSuccess || data.statusCode !== 200) {
        throw new Error(data.errorMessages.join(', ') || 'API request failed');
      }
      
      return data.result;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  // Fetch all dashboard statistics
  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all API endpoints concurrently
      const [
        newRequestsData,
        ticketActionsData,
        slaBreachData,
        rejectedData,
        travelLegsData
      ] = await Promise.all([
        fetchApiData<CountResult>('/api/stats/travel-requests/count/today/new'),
        fetchApiData<CountResult>('/api/stats/travel-requests/count/all-time/status/verified-or-duapproved'),
        fetchApiData<CountResult>('/api/stats/travel-requests/count/sla-breached/verified-or-duapproved'),
        fetchApiData<CountResult>('/api/stats/travel-requests/count/today/status/rejected'),
        fetchApiData<TravelLegsResult>('/api/stats/travel-requests/count/today/travel-legs')
      ]);

      // Calculate return and departure count (sum of both outbound and return)
      const returnAndDepartureCount = 
        travelLegsData.todayOutboundDepartureCount + travelLegsData.todayReturnArrivalCount;

      // Update state with fetched data
      setStats({
        newRequestsCount: newRequestsData.count,
        ticketActionsCount: ticketActionsData.count,
        slaBreachCount: slaBreachData.count,
        rejectedCount: rejectedData.count,
        returnAndDepartureCount: returnAndDepartureCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Get today's date in UTC format
  const today = new Date();
  const todayStringUTC = today.toISOString().split('T')[0]; // Format: '2025-06-01' (UTC date)

  // Handler for New Requests card click
  const handleNewRequestsClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayStringUTC);
    navigate(`/admin/travel-requests?${params.toString()}`);
  };

  // Handler for Ticket Actions card click
  const handleTicketActionsClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayStringUTC);
    params.set('status', 'Manager Approved,DU Head Approved');
    navigate(`/admin/travel-requests?${params.toString()}`);
  };

  // Handler for Rejected card click
  const handleRejectedClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayStringUTC);
    params.set('status', 'Rejected');
    navigate(`/admin/travel-requests?${params.toString()}`);
  };

  // Handler for SLA Breach card click
  const handleSLABreachClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayStringUTC);
    params.set('status', 'Manager Approved,Tickets Dispatched');
    navigate(`/admin/travel-requests?${params.toString()}`);
  };

  // Handler for Return and Departure card click
  const handleReturnDepartureClick = () => {
    navigate('/admin/calendar');
  };

  const metricsData = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "New Requests",
      value: stats.newRequestsCount,
      iconColor: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      hoverColor: "from-blue-100 to-blue-150",
      onClick: handleNewRequestsClick
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: "Ticket Actions",
      value: stats.ticketActionsCount,
      iconColor: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      hoverColor: "from-green-100 to-green-150",
      onClick: handleTicketActionsClick
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "SLA Breach",
      value: stats.slaBreachCount,
      iconColor: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      hoverColor: "from-orange-100 to-orange-150",
      onClick: handleSLABreachClick
    },
    {
      icon: <XCircle className="h-6 w-6" />,
      title: "Rejected",
      value: stats.rejectedCount,
      iconColor: "text-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      hoverColor: "from-red-100 to-red-150",
      onClick: handleRejectedClick
    },
    {
      icon: <ArrowUpDown className="h-6 w-6" />,
      title: "Return and Departure",
      value: stats.returnAndDepartureCount,
      iconColor: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      hoverColor: "from-purple-100 to-purple-150",
      onClick: handleReturnDepartureClick
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchDashboardStats}
                className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Statistics Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Today's Statistics</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {metricsData.map((metric, index) => (
            <MetricCard
              key={index}
              icon={metric.icon}
              title={metric.title}
              value={metric.value}
              iconColor={metric.iconColor}
              bgColor={metric.bgColor}
              hoverColor={metric.hoverColor}
              onClick={metric.onClick}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>

      {/* Reports Component */}
      <div className="mt-12">
        <Reports />
      </div>
    </div>
  );
};

export default Dashboard;