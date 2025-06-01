import React from 'react';
import { Briefcase, Ticket, AlertCircle, ArrowUpDown, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import
import Reports from './Reports';

// Reusable MetricCard Component
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  iconColor: string;
  bgColor: string;
  hoverColor: string;
  onClick?: () => void; // Add optional onClick prop
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  icon, 
  title, 
  value, 
  iconColor, 
  bgColor, 
  hoverColor,
  onClick // Add onClick to props
}) => {
  return (
    <div 
      className={`${bgColor} border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden`}
      onClick={onClick} // Add onClick handler
    >
      {/* Creative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large background icon - more visible */}
        <div className="absolute -top-4 -right-4 opacity-25 transform rotate-12">
          <div className="text-white drop-shadow-lg">
            {React.cloneElement(icon as React.ReactElement, { className: "h-32 w-32" })}
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-4 right-8 w-4 h-4 bg-white/10 rounded-full"></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      </div>
      
      <div className="relative z-10">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-700 mb-2 font-semibold">
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
  const navigate = useNavigate(); // Add useNavigate hook

  // Handler for Return and Departure card click
  const handleReturnDepartureClick = () => {
    navigate('/admin/calendar');
  };

  const metricsData = [
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "New Requests",
      value: 6,
      iconColor: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      hoverColor: "from-blue-100 to-blue-150"
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: "Ticket Actions",
      value: 11,
      iconColor: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      hoverColor: "from-green-100 to-green-150"
    },
    {
      icon: <AlertCircle className="h-6 w-6" />,
      title: "SLA Breach",
      value: 0,
      iconColor: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      hoverColor: "from-orange-100 to-orange-150"
    },
    {
      icon: <XCircle className="h-6 w-6" />,
      title: "Rejected",
      value: 0,
      iconColor: "text-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      hoverColor: "from-red-100 to-red-150"
    },
    {
      icon: <ArrowUpDown className="h-6 w-6" />,
      title: "Return and Departure",
      value: 0,
      iconColor: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      hoverColor: "from-purple-100 to-purple-150",
      onClick: handleReturnDepartureClick // Add onClick for this specific card
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      </div>

      {/* Upcoming Events Section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
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
              onClick={metric.onClick} // Pass onClick if it exists
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