import React, { useState } from 'react';
import { Download, Briefcase, DollarSign, Plane } from 'lucide-react';
import StatCard from './StatCard';
import AirlineDistributionChart from './AirlineDistributionChart';
import TravelAgencyBarChart from './TravelAgencyBarChart';
import { mockTravelRequests } from '../../../data/mockData';
import DateRangePicker from './DateRangePicker';

// Define TypeScript interfaces
interface TravelRequest {
  id: string;
  requestDate: string;
  status: string;
  travelType: 'Domestic' | 'International';
  estimatedCost: number;
  airline?: string;
  travelAgency?: string;
}
interface ChartDataItem {
  name: string;
  value: number;
  cost?: number;
}



const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter requests based on date range if provided
  const filteredRequests = mockTravelRequests.filter((request: TravelRequest) => {
    const requestDate = new Date(request.requestDate);
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('9999-12-31');
    return requestDate >= start && requestDate <= end;
  });

  // First Box: Total Requests
  const totalRequests = filteredRequests.length;

  const approvedStatuses = ['Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];
  const approvedRequests = filteredRequests.filter((r: TravelRequest) =>
    approvedStatuses.includes(r.status)
  ).length;

  const rejectedRequests = filteredRequests.filter(
    (r: TravelRequest) => r.status === 'Rejected'
  ).length;

  const pendingRequests = totalRequests - approvedRequests - rejectedRequests;

  // Second Box: Total Cost for Approved Requests (Domestic and International)
  const approvedRequestsData = filteredRequests.filter((r: TravelRequest) =>
    approvedStatuses.includes(r.status)
  );

  const totalCost = approvedRequestsData.reduce(
    (sum: number, request: TravelRequest) => sum + request.estimatedCost,
    0
  );

  const domesticCost = approvedRequestsData
    .filter((r: TravelRequest) => r.travelType === 'Domestic')
    .reduce((sum: number, request: TravelRequest) => sum + request.estimatedCost, 0);

  const internationalCost = approvedRequestsData
    .filter((r: TravelRequest) => r.travelType === 'International')
    .reduce((sum: number, request: TravelRequest) => sum + request.estimatedCost, 0);

  // Third Box: Total Number of Trips (Domestic and International)
  const tripStatuses = ['Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];
  const totalTrips = filteredRequests.filter((r: TravelRequest) =>
    tripStatuses.includes(r.status)
  ).length;

  const domesticTrips = filteredRequests
    .filter((r: TravelRequest) => tripStatuses.includes(r.status) && r.travelType === 'Domestic')
    .length;

  const internationalTrips = filteredRequests
    .filter((r: TravelRequest) => tripStatuses.includes(r.status) && r.travelType === 'International')
    .length;

  // Dynamic airline data from filtered requests
 const getAirlineDistribution = (): ChartDataItem[] => {
  const airlineCounts: Record<string, number> = {};
  const airlineCosts: Record<string, number> = {};
  
  filteredRequests
    .filter((req: TravelRequest) => req.airline && tripStatuses.includes(req.status))
    .forEach((req: TravelRequest) => {
      if (req.airline) {
        airlineCounts[req.airline] = (airlineCounts[req.airline] || 0) + 1;
        airlineCosts[req.airline] = (airlineCosts[req.airline] || 0) + req.estimatedCost;
      }
    });
  
  return Object.entries(airlineCounts).map(([name, value]) => ({
    name,
    value,
    cost: airlineCosts[name] || 0
  }));
};
  const airlineData = getAirlineDistribution();
  
  // Get agency distribution data
const getAgencyDistribution = (): ChartDataItem[] => {
  const agencyCounts: Record<string, number> = {};
  const agencyCosts: Record<string, number> = {};
  
  filteredRequests
    .filter((req: TravelRequest) => req.travelAgency && tripStatuses.includes(req.status))
    .forEach((req: TravelRequest) => {
      if (req.travelAgency) {
        agencyCounts[req.travelAgency] = (agencyCounts[req.travelAgency] || 0) + 1;
        agencyCosts[req.travelAgency] = (agencyCosts[req.travelAgency] || 0) + req.estimatedCost;
      }
    });

  return Object.entries(agencyCounts).map(([name, value]) => ({
    name,
    value,
    cost: agencyCosts[name] || 0
  }));
};


  const agencyData = getAgencyDistribution();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Travel Reports & Analytics</h2>

        <div className="flex items-center gap-3">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          <button className="btn-primary flex items-center px-4 py-2 bg-blue-600 text-white rounded-md">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Travel Agency Usage */}
        <TravelAgencyBarChart chartData={agencyData} startDate={startDate} endDate={endDate} />

        {/* Pie Chart: Airline Distribution */}
        <AirlineDistributionChart chartData={airlineData} startDate={startDate} endDate={endDate} />
      </div>
    </div>
  );
};

export default Reports;