import React, { useState } from 'react';
import { Download, Briefcase, DollarSign, Plane, FileText, CreditCard, Clock } from 'lucide-react';
import StatCard from './StatCard';
import AirlineDistributionChart from './AirlineDistributionChart';
import TravelAgencyBarChart from './TravelAgencyBarChart';
import { mockTravelRequests } from '../../../data/mockData';
import DateRangePicker from './DateRangePicker';
import { Globe } from "lucide-react"

// Define TypeScript interfaces
interface TravelRequest {
  id: string;
  requestDate: string;
  status: string;
  travelType: 'Domestic' | 'International';
  estimatedCost: number;
  airline?: string;
  travelAgency?: string;
  passportExpiry?: string;
  visaExpiry?: string;
  finalBookingDate?: string;
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

  // Fourth Box: Passport Status
  const getPassportStatus = () => {
    const today = new Date();
    const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    
    let withinOneMonth = 0;
    let withinThreeMonths = 0;
    let expired = 0;
    
    filteredRequests.forEach((request: TravelRequest) => {
      if (request.passportExpiry) {
        const expiryDate = new Date(request.passportExpiry);
        if (expiryDate < today) {
          expired++;
        } else if (expiryDate <= oneMonthFromNow) {
          withinOneMonth++;
        } else if (expiryDate <= threeMonthsFromNow) {
          withinThreeMonths++;
        }
      }
    });
    
    return { withinOneMonth, withinThreeMonths, expired };
  };

  const passportStatus = getPassportStatus();

  // Fifth Box: Visa Status  
  const getVisaStatus = () => {
    const today = new Date();
    const oneMonthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    
    let withinOneMonth = 0;
    let withinThreeMonths = 0;
    let expired = 0;
    
    filteredRequests.forEach((request: TravelRequest) => {
      if (request.visaExpiry) {
        const expiryDate = new Date(request.visaExpiry);
        if (expiryDate < today) {
          expired++;
        } else if (expiryDate <= oneMonthFromNow) {
          withinOneMonth++;
        } else if (expiryDate <= threeMonthsFromNow) {
          withinThreeMonths++;
        }
      }
    });
    
    return { withinOneMonth, withinThreeMonths, expired };
  };

  const visaStatus = getVisaStatus();

  // Sixth Box: Average Processing Time
  const getAverageProcessingTime = () => {
    const completedRequests = filteredRequests.filter((r: TravelRequest) => 
      r.finalBookingDate && approvedStatuses.includes(r.status)
    );
    
    if (completedRequests.length === 0) return 0;
    
    const totalDays = completedRequests.reduce((sum: number, request: TravelRequest) => {
      const requestDate = new Date(request.requestDate);
      const bookingDate = new Date(request.finalBookingDate!);
      const diffTime = Math.abs(bookingDate.getTime() - requestDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return Math.round(totalDays / completedRequests.length);
  };

  const avgProcessingTime = getAverageProcessingTime();

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Travel Reports & Analytics</h2>
        </div>

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

      {/* First Row - Original 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* First Box: Total Requests */}
        <StatCard 
          title="Total Requests"
          value={totalRequests}
          subtitle="Requests"
          icon={<Briefcase />}
          iconClass="text-blue-600"
          iconBgClass="bg-blue-100"
        >
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-blue-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs">Approved</span>
              </div>
              <p className="font-medium">{approvedRequests}</p>
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
          subtitle="Expenses"
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
          subtitle="Trips"
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

      {/* Second Row - New 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fourth Box: Passport Status */}
        <StatCard 
          title="Passport Status"
          value={passportStatus.expired}
          subtitle='Expired Passports'
          icon={<FileText />}
          iconClass="text-orange-600"
          iconBgClass="bg-orange-100"
        >
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-orange-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs text-gray-600">Expires in 1 Month</span>
              </div>
              <p className="font-semibold text-orange-600">{passportStatus.withinOneMonth}</p>
            </div>
            <div className="bg-yellow-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs text-gray-600">Expires in 3 Months</span>
              </div>
              <p className="font-semibold text-yellow-600">{passportStatus.withinThreeMonths}</p>
            </div>
          </div>
        </StatCard>

        {/* Fifth Box: Visa Status */}
        <StatCard 
          title="Visa Status"
          value={visaStatus.expired}
          subtitle='Expired Visas'
          icon={<Globe />}
          iconClass="text-teal-600"
          iconBgClass="bg-teal-100"
        >
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-teal-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs text-gray-600">Expires in 1 Month</span>
              </div>
              <p className="font-semibold text-teal-600">{visaStatus.withinOneMonth}</p>
            </div>
            <div className="bg-cyan-50 py-2 rounded">
              <div className="flex items-center justify-center">
                <span className="text-xs text-gray-600">Expires in 3 Months</span>
              </div>
              <p className="font-semibold text-cyan-600">{visaStatus.withinThreeMonths}</p>
            </div>
          </div>
        </StatCard>

        {/* Sixth Box: Average Processing Time */}
        <StatCard 
          title="Processing Time"
          value={`${avgProcessingTime} days`} 
          subtitle="average completion time"
          icon={<Clock />}
          iconClass="text-cyan-600"
          iconBgClass="bg-cyan-100"
        >
        
        </StatCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Travel Agency Usage - Wrapped in a Box */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <TravelAgencyBarChart chartData={agencyData} startDate={startDate} endDate={endDate} />
        </div>

        {/* Pie Chart: Airline Distribution - Wrapped in a Box */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <AirlineDistributionChart chartData={airlineData} startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  );
};

export default Reports;