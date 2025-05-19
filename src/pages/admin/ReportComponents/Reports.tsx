import React, { useState } from 'react';
import { Download, Calendar, Briefcase, DollarSign, Plane } from 'lucide-react';
import StatCard from './StatCard';
import AirlineDistributionChart from './AirlineDistributionChart';
import TravelAgencyBarChart from './TravelAgencyBarChart';
import { mockTravelRequests } from '../../../data/mockData';

// Define type for travel requests

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter requests based on date range if provided
  const filteredRequests = mockTravelRequests.filter((request) => {
    const requestDate = new Date(request.requestDate);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('9999-12-31');
    return requestDate >= start && requestDate <= end;
  });

  // First Box: Total Requests
  const totalRequests = filteredRequests.length;

  const approvedStatuses = ['Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];
  const approvedRequests = filteredRequests.filter((r) =>
    approvedStatuses.includes(r.status)
  ).length;

  const rejectedRequests = filteredRequests.filter(
    (r) => r.status === 'Rejected'
  ).length;

  const pendingRequests = totalRequests - approvedRequests - rejectedRequests;

  // Second Box: Total Cost for Approved Requests (Domestic and International)
  const approvedRequestsData = filteredRequests.filter((r) =>
    approvedStatuses.includes(r.status)
  );

  const totalCost = approvedRequestsData.reduce(
    (sum, request) => sum + request.estimatedCost,
    0
  );

  const domesticCost = approvedRequestsData
    .filter((r) => r.travelType === 'Domestic')
    .reduce((sum, request) => sum + request.estimatedCost, 0);

  const internationalCost = approvedRequestsData
    .filter((r) => r.travelType === 'International')
    .reduce((sum, request) => sum + request.estimatedCost, 0);

  // Third Box: Total Number of Trips (Domestic and International)
  const tripStatuses = ['Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];
  const totalTrips = filteredRequests.filter((r) =>
    tripStatuses.includes(r.status)
  ).length;

  const domesticTrips = filteredRequests
    .filter((r) => tripStatuses.includes(r.status) && r.travelType === 'Domestic')
    .length;

  const internationalTrips = filteredRequests
    .filter((r) => tripStatuses.includes(r.status) && r.travelType === 'International')
    .length;

  // Dynamic airline data from filtered requests
  const getAirlineDistribution = () => {
    const airlineCounts: Record<string, number> = {};
    
    filteredRequests
      .filter(req => req.airline && tripStatuses.includes(req.status))
      .forEach(req => {
        if (req.airline) {
          airlineCounts[req.airline] = (airlineCounts[req.airline] || 0) + 1;
        }
      });
    
    return Object.entries(airlineCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const airlineData = getAirlineDistribution();
  
  // Get agency distribution data
  const getAgencyDistribution = () => {
    const agencyCounts: Record<string, number> = {};
    
    filteredRequests
      .filter(req => req.travelAgency && tripStatuses.includes(req.status))
      .forEach(req => {
        if (req.travelAgency) {
          agencyCounts[req.travelAgency] = (agencyCounts[req.travelAgency] || 0) + 1;
        }
      });

    // If no agency data is available, use sample data
    if (Object.keys(agencyCounts).length === 0) {
      return [
        { name: 'TA-1', value: 2 },
        { name: 'TA-2', value: 1 },
        { name: 'TA-3', value: 1 },
        { name: 'TA-4', value: 1 }
      ];
    }
    
    return Object.entries(agencyCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const agencyData = getAgencyDistribution();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Travel Reports & Analytics</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 pr-3 py-2 bg-muted rounded-md text-sm min-w-36"
                placeholder="Start Date"
              />
            </div>
            <span className="text-sm text-muted-foreground">to</span>
            <div className="relative">
              <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 pr-3 py-2 bg-muted rounded-md text-sm min-w-36"
                placeholder="End Date"
              />
            </div>
          </div>

          <button className="btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First Box: Total Requests */}
        <StatCard 
          title="Total Requests"
          value={totalRequests}
          subtitle="travel requests"
          icon={<Briefcase />}
          iconClass="text-blue-600"
          iconBgClass="bg-blue-100"
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">Approved</span>
              </div>
              <p className="font-medium">{approvedRequests}</p>
            </div>
            <div className="bg-yellow-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">Pending</span>
              </div>
              <p className="font-medium">{pendingRequests}</p>
            </div>
            <div className="bg-red-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">Rejected</span>
              </div>
              <p className="font-medium">{rejectedRequests}</p>
            </div>
          </div>
        </StatCard>

        {/* Second Box: Total Cost */}
        <StatCard 
          title="Total Cost"
          value={`$${totalCost.toLocaleString()}`}
          subtitle="estimated expenses"
          icon={<DollarSign />}
          iconClass="text-green-600"
          iconBgClass="bg-green-100"
        >
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-green-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">Domestic</span>
              </div>
              <p className="font-medium">${domesticCost.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">International</span>
              </div>
              <p className="font-medium">
                ${internationalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </StatCard>

        {/* Third Box: Total Number of Trips */}
        <StatCard 
          title="Total Trips"
          value={totalTrips}
          subtitle="completed trips"
          icon={<Plane />}
          iconClass="text-purple-600"
          iconBgClass="bg-purple-100"
        >
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-purple-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">Domestic</span>
              </div>
              <p className="font-medium">
                {domesticTrips}
              </p>
            </div>
            <div className="bg-indigo-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">International</span>
              </div>
              <p className="font-medium">
                {internationalTrips}
              </p>
            </div>
          </div>
        </StatCard>
      </div>

      {/* New Section: Bar Chart and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Travel Agency Usage */}
        <TravelAgencyBarChart chartData={agencyData} />

        {/* Pie Chart: Airline Distribution */}
        <AirlineDistributionChart chartData={airlineData} />
      </div>
    </div>
  );
};

export default Reports;