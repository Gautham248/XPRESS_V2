import React, { useState } from 'react';
import { 
  BarChart as BarChartIcon, 
  Download,
  Filter,
  ChevronDown,
  Calendar,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { mockTravelRequests, topDestinations, travelExpensesByMonth } from '../../data/mockData';

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('last6Months');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Calculate metrics
  const totalRequests = mockTravelRequests.length;
  const approvedRequests = mockTravelRequests.filter(r => r.status === 'Approved').length;
  const pendingRequests = mockTravelRequests.filter(r => r.status === 'Pending').length;
  const rejectedRequests = mockTravelRequests.filter(r => r.status === 'Rejected').length;
  
  const totalCost = mockTravelRequests.reduce((sum, request) => sum + request.estimatedCost, 0);
  const domesticCost = mockTravelRequests
    .filter(r => r.travelType === 'Domestic')
    .reduce((sum, request) => sum + request.estimatedCost, 0);
  const internationalCost = mockTravelRequests
    .filter(r => r.travelType === 'International')
    .reduce((sum, request) => sum + request.estimatedCost, 0);
  
  // Department breakdown
  const departmentCounts: Record<string, number> = {};
  mockTravelRequests.forEach(request => {
    const deptCode = request.departmentCode;
    departmentCounts[deptCode] = (departmentCounts[deptCode] || 0) + 1;
  });
  
  const departmentData = Object.entries(departmentCounts)
    .map(([dept, count]) => ({
      department: dept,
      count,
      percentage: Math.round((count / totalRequests) * 100)
    }))
    .sort((a, b) => b.count - a.count);
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Travel Reports & Analytics</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-36">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  {dateRange === 'last6Months' ? 'Last 6 Months' : 
                   dateRange === 'thisYear' ? 'This Year' : 'All Time'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            </button>
            <div className="absolute z-10 right-0 mt-1 w-40 bg-card border rounded-md shadow-elevation-3 hidden">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50">
                  Last 6 Months
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50">
                  This Year
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50">
                  All Time
                </button>
              </div>
            </div>
          </div>
          
          <button className="btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-medium text-muted-foreground mb-2">Total Requests</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-semibold">{totalRequests}</p>
              <p className="text-sm text-muted-foreground">travel requests</p>
            </div>
            <div className="flex space-x-1">
              <div className="h-16 w-4 bg-primary rounded-t-sm"></div>
              <div className="h-10 w-4 bg-warning rounded-t-sm"></div>
              <div className="h-5 w-4 bg-error rounded-t-sm"></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-primary mr-1"></div>
                <span className="text-xs">Approved</span>
              </div>
              <p className="font-medium">{approvedRequests}</p>
            </div>
            <div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-warning mr-1"></div>
                <span className="text-xs">Pending</span>
              </div>
              <p className="font-medium">{pendingRequests}</p>
            </div>
            <div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-error mr-1"></div>
                <span className="text-xs">Rejected</span>
              </div>
              <p className="font-medium">{rejectedRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-muted-foreground mb-2">Total Cost</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-semibold">${totalCost.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">estimated expenses</p>
            </div>
            <div className="flex space-x-1">
              <div className="h-8 w-4 bg-primary rounded-t-sm"></div>
              <div className="h-14 w-4 bg-secondary rounded-t-sm"></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-primary mr-1"></div>
                <span className="text-xs">Domestic</span>
              </div>
              <p className="font-medium">${domesticCost.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-secondary mr-1"></div>
                <span className="text-xs">International</span>
              </div>
              <p className="font-medium">${internationalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium text-muted-foreground mb-2">Average Cost</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-semibold">
                ${Math.round(totalCost / totalRequests).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">per travel request</p>
            </div>
            <div className="h-14 w-14 rounded-full border-4 border-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-primary mr-1"></div>
                <span className="text-xs">Domestic</span>
              </div>
              <p className="font-medium">
                ${Math.round(domesticCost / mockTravelRequests.filter(r => r.travelType === 'Domestic').length).toLocaleString()}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-secondary mr-1"></div>
                <span className="text-xs">International</span>
              </div>
              <p className="font-medium">
                ${Math.round(internationalCost / mockTravelRequests.filter(r => r.travelType === 'International').length).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Monthly Travel Expenses</h3>
            <div className="relative">
              <button className="flex items-center px-3 py-1 text-sm bg-muted rounded-md">
                <Filter className="h-3 w-3 mr-1" />
                <span>Filter</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
          
          <div className="h-64 relative">
            {/* This would be a real chart component in production */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {travelExpensesByMonth.map((expense, index) => (
                <div key={index} className="flex flex-col items-center w-1/6">
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div className="w-full bg-secondary/70 rounded-t-sm" 
                      style={{ height: `${expense.international / 800}px` }}>
                    </div>
                    <div className="w-full bg-primary rounded-t-sm" 
                      style={{ height: `${expense.domestic / 800}px` }}>
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
              <div className="w-3 h-3 rounded-sm bg-secondary/70 mr-2"></div>
              <span className="text-sm">International</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Top Destinations</h3>
            <button className="flex items-center px-3 py-1 text-sm bg-muted rounded-md">
              <Filter className="h-3 w-3 mr-1" />
              <span>All Time</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {topDestinations.map((destination, index) => (
              <div key={index} className="flex items-center">
                <div className="mr-3 w-6 text-center font-medium text-sm text-muted-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{destination.destination}</span>
                      <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                        {destination.count} trips
                      </span>
                    </div>
                    <span className="text-sm font-medium">{destination.percentOfTotal}%</span>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Department Breakdown</h3>
            <div className="relative">
              <button className="flex items-center px-3 py-1 text-sm bg-muted rounded-md">
                <Filter className="h-3 w-3 mr-1" />
                <span>All Departments</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-center py-4">
            {/* This would be a real chart component in production */}
            <div className="w-40 h-40 rounded-full border-8 border-muted relative">
              {departmentData.map((dept, index) => {
                const offset = departmentData
                  .slice(0, index)
                  .reduce((sum, d) => sum + d.percentage, 0);
                const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-warning'];
                return (
                  <div 
                    key={index}
                    className={`absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 ${colors[index % colors.length]}`}
                    style={{
                      width: '120%',
                      height: '120%',
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((offset + dept.percentage) * 0.01 * 2 * Math.PI)}% ${50 - 50 * Math.sin((offset + dept.percentage) * 0.01 * 2 * Math.PI)}%, 50% 0%)`,
                      transform: `rotate(${offset * 3.6}deg)`,
                      zIndex: departmentData.length - index
                    }}
                  ></div>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {departmentData.map((dept, index) => {
              const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-warning'];
              return (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 rounded-sm ${colors[index % colors.length]} mr-2`}></div>
                  <div>
                    <p className="text-sm font-medium">{dept.department}</p>
                    <p className="text-xs text-muted-foreground">{dept.count} requests ({dept.percentage}%)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Expense Categories</h3>
            <button className="flex items-center px-3 py-1 text-sm bg-muted rounded-md">
              <Filter className="h-3 w-3 mr-1" />
              <span>Last 6 Months</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Flights</span>
                <span className="text-sm font-medium">$45,200</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">60% of total expenses</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Hotels</span>
                <span className="text-sm font-medium">$22,600</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">30% of total expenses</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Transportation</span>
                <span className="text-sm font-medium">$7,500</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">10% of total expenses</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Meals</span>
                <span className="text-sm font-medium">$5,625</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '7.5%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">7.5% of total expenses</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Other</span>
                <span className="text-sm font-medium">$1,875</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: '2.5%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">2.5% of total expenses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;