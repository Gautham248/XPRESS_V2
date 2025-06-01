import React from 'react';
import { Briefcase, Ticket, AlertCircle, ArrowUpDown, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Reports from './Reports';
import { mockTravelRequests } from '../../../data/mockData';

// Reusable MetricCard Component
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  iconColor: string;
  bgColor: string;
  hoverColor: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  title, 
  value, 
  iconColor, 
  bgColor, 
  hoverColor,
  onClick
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
        <h3 className="text-sm  text-gray-700 mb-2 font-semibold">
          {title}
        </h3>
        
        {/* Value */}
        <div className="mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Get today's date dynamically (June 1, 2025, 04:15 PM IST)
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // Format: '2025-06-01'

  // Helper function to check if a date string matches today
  const isToday = (dateString: string) => {
    return dateString.split('T')[0] === todayString;
  };

  // Calculate counts for each card using mockTravelRequests
  const newRequestsCount = mockTravelRequests.filter(request => 
    isToday(request.requestDate)
  ).length;

  const ticketActionsCount = mockTravelRequests.filter(request => {
    // Count requests that are currently in "Manager Approved" or "DU Head Approved" status
    // These are requests that need ticket booking action
    const relevantStatuses = ['Manager Approved', 'DU Head Approved'];
    return relevantStatuses.includes(request.status);
  }).length;

  const rejectedCount = mockTravelRequests.filter(request => {
    if (!request.timeline) return false;
    const latestTimelineEntry = request.timeline
      .filter(entry => entry.type === 'Rejected')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return latestTimelineEntry && isToday(latestTimelineEntry.date);
  }).length;

  const returnAndDepartureCount = mockTravelRequests.filter(request => 
    isToday(request.departureDate) || isToday(request.returnDate)
  ).length;

  // Handler for New Requests card click
  const handleNewRequestsClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayString);
    navigate(`/admin/travel-requests?${params.toString()}`);
  };

  // Handler for Ticket Actions card click
  const handleTicketActionsClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayString);
    params.set('status', 'Manager Approved,DU Head Approved');
    navigate(`/admin/travel-requests?${params.toString()}`);
  };

  // Handler for Rejected card click
  const handleRejectedClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayString);
    params.set('status', 'Rejected');
    navigate(`/admin/travel-requests?${params.toString()}`);
  };

  // Handler for SLA Breach card click
  const handleSLABreachClick = () => {
    const params = new URLSearchParams();
    params.set('date', todayString);
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
      value: newRequestsCount,
      iconColor: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      hoverColor: "from-blue-100 to-blue-150",
      onClick: handleNewRequestsClick
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: "Ticket Actions",
      value: ticketActionsCount,
      iconColor: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      hoverColor: "from-green-100 to-green-150",
      onClick: handleTicketActionsClick
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "SLA Breach",
      value: 0, // Unchanged as per requirement
      iconColor: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      hoverColor: "from-orange-100 to-orange-150",
      onClick: handleSLABreachClick
    },
    {
      icon: <XCircle className="h-6 w-6" />,
      title: "Rejected",
      value: rejectedCount,
      iconColor: "text-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      hoverColor: "from-red-100 to-red-150",
      onClick: handleRejectedClick
    },
    {
      icon: <ArrowUpDown className="h-6 w-6" />,
      title: "Return and Departure",
      value: returnAndDepartureCount,
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