import React from 'react';
import { 
  Briefcase, 
  Clock, 
  Plane, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  dashboardStats, 
  upcomingTrips, 
  travelExpensesByMonth,
  topDestinations 
} from '../../data/mockData';
import { getStatusBadgeStyles } from '../../components/request_details/TravelRequestDetails';

const ManagerDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = getIconComponent(stat.icon);
          return (
            <div key={index} className="card hover:shadow-elevation-3 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <h3 className="text-2xl font-semibold mt-2">
                    {stat.label.includes('Budget') ? `$${stat.value.toLocaleString()}` : stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-full ${getIconBackgroundColor(stat.icon)}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium flex items-center ${stat.changePercent >= 0 ? 'text-success' : 'text-error'}`}>
                  {stat.changePercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.changePercent)}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Monthly Travel Expenses</h3>
              <select className="bg-muted rounded-md border-input px-3 py-1 text-sm">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div className="h-64 relative">
              {/* This would normally be a chart component */}
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {travelExpensesByMonth.map((expense, index) => (
                  <div key={index} className="flex flex-col items-center w-1/6">
                    <div className="w-full flex flex-col items-center space-y-1">
                      <div className="w-full bg-primary/20 rounded-t-sm" 
                        style={{ height: `${expense.international / 1000}px` }}>
                      </div>
                      <div className="w-full bg-primary rounded-t-sm" 
                        style={{ height: `${expense.domestic / 1000}px` }}>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{expense.month}</span>
                  </div>
                ))}
              </div>
              
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">
                Amount (USD)
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-primary mr-2"></div>
                <span className="text-sm">Domestic</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-primary/20 mr-2"></div>
                <span className="text-sm">International</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Top Destinations</h3>
              <button className="text-sm text-primary hover:text-primary-light">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {topDestinations.map((destination, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{destination.destination}</span>
                      <span className="text-sm">{destination.count} trips</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${destination.percentOfTotal}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Upcoming Trips</h3>
          <button className="btn-primary">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Destination</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Travel Dates</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Traveler</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingTrips.map((trip, index) => (
                <tr 
                  key={index} 
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4">{trip.id}</td>
                  <td className="py-3 px-4">{trip.destination}</td>
                  <td className="py-3 px-4">{trip.dates}</td>
                  <td className="py-3 px-4">{trip.traveler}</td>
                  <td className="py-3 px-4">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(trip.status)}`}
                    >
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-sm text-primary hover:text-primary-light font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Briefcase':
      return Briefcase;
    case 'Clock':
      return Clock;
    case 'Plane':
      return Plane;
    case 'DollarSign':
      return DollarSign;
    default:
      return Briefcase;
  }
};

const getIconBackgroundColor = (iconName: string) => {
  switch (iconName) {
    case 'Briefcase':
      return 'bg-primary';
    case 'Clock':
      return 'bg-warning';
    case 'Plane':
      return 'bg-secondary';
    case 'DollarSign':
      return 'bg-success';
    default:
      return 'bg-primary';
  }
};

export default ManagerDashboard;