import React, { useState } from 'react';
import { Download, Briefcase, Plane, FileText, Clock, ExternalLink, Globe, Coins } from 'lucide-react';
import StatCard from './StatCard';
import AirlineDistributionChart from './AirlineDistributionChart';
import TravelAgencyBarChart from './TravelAgencyBarChart';
import { mockTravelRequests } from '../../../data/mockData';
import DateRangePicker from './DateRangePicker';
import Modal from './Modal';


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
  travelerName?: string;
  departmentCode?: string;
  previousRequestDate?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
  cost?: number;
  travelType?: 'international' | 'domestic';
}

interface ModalData {
  title: string;
  data: TravelRequest[];
  headers: string[];
}

interface CalculatedExpiryStatus {
  expiredCount: number;
  withinOneMonthCount: number; // This will now represent "within 45 days"
  withinOneToThreeMonthsCount: number; // This will now represent "within 45-90 days"
  modalRelevantItems: TravelRequest[];
}

// Helper function to format date as YYYY-MM-DD for input fields
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Reports: React.FC = () => {
  // Calculate default date range: 6 months ago to today
  const getInitialEndDate = (): Date => {
    const date = new Date();
    return date;
  };
  const getInitialStartDate = (): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6); // 6 months ago
    return date;
  };

  const [startDate, setStartDate] = useState<string>(formatDateForInput(getInitialStartDate()));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(getInitialEndDate()));
  const [modalData, setModalData] = useState<ModalData | null>(null);

  // Sample data for "Processing Metrics" card context
  const processingContextSampleData: TravelRequest[] = [
    { id: 'PT001', requestDate: '2025-01-10', status: 'Tickets Dispatched', travelType: 'Domestic', estimatedCost: 15000 },
    { id: 'PT002', requestDate: '2025-02-15', status: 'In-transit', travelType: 'International', estimatedCost: 45000 },
    { id: 'PT003', requestDate: '2025-03-20', status: 'Closed', travelType: 'Domestic', estimatedCost: 12000 },
    { id: 'PT004', requestDate: '2025-03-22', status: 'Pending', travelType: 'Domestic', estimatedCost: 10000 },
    { id: 'PT005', requestDate: '2025-03-25', status: 'Manager Approved', travelType: 'International', estimatedCost: 50000 },
  ];

  // Sample data for Passport Status
  const passportSampleData: TravelRequest[] = [
    {
      id: 'PS001', travelerName: 'John Doe', departmentCode: 'HR-101', requestDate: '2025-01-10', status: 'Active', travelType: 'Domestic', estimatedCost: 100,
      passportExpiry: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0], // Expires in 20 days
    },
    {
      id: 'PS002', travelerName: 'Jane Smith', departmentCode: 'IT-202', requestDate: '2025-02-15', status: 'Active', travelType: 'International', estimatedCost: 200,
      passportExpiry: new Date(new Date().setDate(new Date().getDate() + 70)).toISOString().split('T')[0], // Expires in 70 days
    },
    {
      id: 'PS003', travelerName: 'Alice Wonder', departmentCode: 'FIN-301', requestDate: '2025-03-10', status: 'Active', travelType: 'International', estimatedCost: 300,
      passportExpiry: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0], // Expired 10 days ago
    },
    {
      id: 'PS004', travelerName: 'Bob Builder', departmentCode: 'ENG-401', requestDate: '2025-04-01', status: 'Active', travelType: 'Domestic', estimatedCost: 400,
      passportExpiry: new Date(new Date().setDate(new Date().getDate() + 40)).toISOString().split('T')[0], // Expires in 40 days
    },
    {
      id: 'PS005', travelerName: 'Charlie Brown', departmentCode: 'ENG-402', requestDate: '2025-04-05', status: 'Active', travelType: 'Domestic', estimatedCost: 500,
      passportExpiry: new Date(new Date().setDate(new Date().getDate() + 85)).toISOString().split('T')[0], // Expires in 85 days
    },
  ];

  // Sample data for Visa Status
  const visaSampleData: TravelRequest[] = [
    {
      id: 'VS001', travelerName: 'Carlos Ray', departmentCode: 'HR-101', requestDate: '2025-01-10', status: 'Active', travelType: 'International', estimatedCost: 150,
      visaExpiry: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString().split('T')[0], // Expires in 25 days
    },
    {
      id: 'VS002', travelerName: 'Diana Prince', departmentCode: 'MKT-505', requestDate: '2025-03-20', status: 'Active', travelType: 'International', estimatedCost: 250,
      visaExpiry: new Date(new Date().setDate(new Date().getDate() + 80)).toISOString().split('T')[0], // Expires in 80 days
    },
    {
      id: 'VS003', travelerName: 'Edward Nigma', departmentCode: 'RND-601', requestDate: '2025-04-10', status: 'Active', travelType: 'International', estimatedCost: 350,
      visaExpiry: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], // Expired 5 days ago
    },
  ];

  // Filter requests based on date range
  const filteredRequests = mockTravelRequests.filter((request: TravelRequest) => {
    const requestDate = new Date(request.requestDate);
    let startFilterDate: Date;
    let endFilterDate: Date;

    if (startDate) {
      startFilterDate = new Date(startDate);
      startFilterDate.setHours(0, 0, 0, 0);
    } else {
      const defaultStart = new Date();
      defaultStart.setMonth(defaultStart.getMonth() - 6);
      defaultStart.setHours(0, 0, 0, 0);
      startFilterDate = defaultStart;
    }

    if (endDate) {
      endFilterDate = new Date(endDate);
      endFilterDate.setHours(23, 59, 59, 999);
    } else {
      const defaultEnd = new Date();
      defaultEnd.setHours(23, 59, 59, 999);
      endFilterDate = defaultEnd;
    }

    return requestDate >= startFilterDate && requestDate <= endFilterDate;
  });

  const approvedStatuses = ['Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];

  const totalRequests = filteredRequests.length;
  const approvedRequestsCount = filteredRequests.filter(r => approvedStatuses.includes(r.status)).length;
  const rejectedRequestsCount = filteredRequests.filter(r => r.status === 'Rejected').length;

  const approvedRequestsData = filteredRequests.filter(r => approvedStatuses.includes(r.status));
  const totalCost = approvedRequestsData.reduce((sum, r) => sum + r.estimatedCost, 0);
  const domesticCost = approvedRequestsData.filter(r => r.travelType === 'Domestic').reduce((sum, r) => sum + r.estimatedCost, 0);
  const internationalCost = approvedRequestsData.filter(r => r.travelType === 'International').reduce((sum, r) => sum + r.estimatedCost, 0);

  const tripStatuses = ['Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];
  const totalTrips = filteredRequests.filter(r => tripStatuses.includes(r.status)).length;
  const domesticTrips = filteredRequests.filter(r => tripStatuses.includes(r.status) && r.travelType === 'Domestic').length;
  const internationalTrips = filteredRequests.filter(r => tripStatuses.includes(r.status) && r.travelType === 'International').length;

  // Function to calculate expiry statuses
  const calculateExpiryStatus = (items: TravelRequest[], dateKey: 'passportExpiry' | 'visaExpiry'): CalculatedExpiryStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fortyFiveDayMarker = new Date(today);
    fortyFiveDayMarker.setDate(today.getDate() + 45); // 45 days from today

    const ninetyDayMarker = new Date(today);
    ninetyDayMarker.setDate(today.getDate() + 90); // 90 days from today

    let expiredCount = 0;
    let withinFortyFiveDaysCount = 0; // Counts items expiring in (0, 45] days
    let withinNinetyDaysCumulativeCount = 0; // Counts items expiring in (0, 90] days and not expired

    const modalRelevantItems: TravelRequest[] = [];

    items.forEach(item => {
      const expiryDateString = item[dateKey];
      if (expiryDateString) {
        const expiryDate = new Date(expiryDateString);
        expiryDate.setHours(0, 0, 0, 0); // Ensure comparison at date level

        let isRelevantForModal = false;

        if (expiryDate < today) {
          expiredCount++;
          isRelevantForModal = true;
        } else { // Not expired
          if (expiryDate <= fortyFiveDayMarker) { // Expires within 0-45 days (inclusive)
            withinFortyFiveDaysCount++;
          }
          if (expiryDate <= ninetyDayMarker) { // Expires within 0-90 days (inclusive)
            withinNinetyDaysCumulativeCount++;
            isRelevantForModal = true;
          }
        }
        if (isRelevantForModal) {
          modalRelevantItems.push(item);
        }
      }
    });

    // withinFortyFiveToNinetyDaysCount is for items expiring between 45 days (exclusive) and 90 days (inclusive)
    const withinFortyFiveToNinetyDaysCount = withinNinetyDaysCumulativeCount - withinFortyFiveDaysCount;

    return {
      expiredCount,
      withinOneMonthCount: withinFortyFiveDaysCount, // Re-using the key for "within 45 days"
      withinOneToThreeMonthsCount: withinFortyFiveToNinetyDaysCount < 0 ? 0 : withinFortyFiveToNinetyDaysCount, // Re-using the key for "within 45-90 days"
      modalRelevantItems,
    };
  };

  const passportStatus = calculateExpiryStatus(passportSampleData, 'passportExpiry');
  const visaStatus = calculateExpiryStatus(visaSampleData, 'visaExpiry');

  const getSimplifiedProcessingMetrics = () => {
    const avgDays = 1;
    let slaBreachCount = 0;
    let withinSLA = 0;
    const relevantRequests = filteredRequests.filter(r => approvedStatuses.includes(r.status));
    const sourceForCounts = relevantRequests.length > 0
        ? relevantRequests
        : processingContextSampleData.filter(r => approvedStatuses.includes(r.status));

    if (sourceForCounts.length > 0) {
      slaBreachCount = Math.floor(sourceForCounts.length * 0.2);
      withinSLA = sourceForCounts.length - slaBreachCount;
    } else {
      slaBreachCount = 1; withinSLA = 3;
    }
    return { avgDays, slaBreachCount, withinSLA };
  };
  const processingTimeData = getSimplifiedProcessingMetrics();

  const getAirlineDistribution = (): ChartDataItem[] => {
    const airlineCounts: Record<string, number> = {};
    const airlineCosts: Record<string, number> = {};
    const airlineTravelTypes: Record<string, { domestic: number; international: number }> = {};
    filteredRequests
      .filter(req => req.airline && tripStatuses.includes(req.status))
      .forEach(req => {
        if (req.airline) {
          airlineCounts[req.airline] = (airlineCounts[req.airline] || 0) + 1;
          airlineCosts[req.airline] = (airlineCosts[req.airline] || 0) + req.estimatedCost;
          if (!airlineTravelTypes[req.airline]) airlineTravelTypes[req.airline] = { domestic: 0, international: 0 };
          if (req.travelType === 'Domestic') airlineTravelTypes[req.airline].domestic++;
          else airlineTravelTypes[req.airline].international++;
        }
      });
    return Object.entries(airlineCounts).map(([name, value]) => ({
      name, value, cost: airlineCosts[name] || 0,
      travelType: airlineTravelTypes[name]?.domestic >= airlineTravelTypes[name]?.international ? 'domestic' : 'international',
    }));
  };
  const airlineData = getAirlineDistribution();

  const getAgencyDistribution = (): ChartDataItem[] => {
    const agencyData: Record<string, { domestic: { count: number; cost: number }, international: { count: number; cost: number } }> = {};
    filteredRequests
      .filter(req => req.travelAgency && tripStatuses.includes(req.status))
      .forEach(req => {
        if (req.travelAgency) {
          if (!agencyData[req.travelAgency]) agencyData[req.travelAgency] = { domestic: { count: 0, cost: 0 }, international: { count: 0, cost: 0 } };
          if (req.travelType === 'Domestic') {
            agencyData[req.travelAgency].domestic.count++;
            agencyData[req.travelAgency].domestic.cost += req.estimatedCost;
          } else {
            agencyData[req.travelAgency].international.count++;
            agencyData[req.travelAgency].international.cost += req.estimatedCost;
          }
        }
      });
    const result: ChartDataItem[] = [];
    Object.entries(agencyData).forEach(([agencyName, data]) => {
      if (data.domestic.count > 0) result.push({ name: `${agencyName} (Domestic)`, value: data.domestic.count, cost: data.domestic.cost, travelType: 'domestic' });
      if (data.international.count > 0) result.push({ name: `${agencyName} (International)`, value: data.international.count, cost: data.international.cost, travelType: 'international' });
    });
    return result;
  };
  const agencyData = getAgencyDistribution();

  const openModal = (title: string, data: TravelRequest[], headers: string[]) => setModalData({ title, data, headers });
  const closeModal = () => setModalData(null);

  const requestHeaders = ['ID', 'Request Date', 'Status', 'Travel Type'];
  const costHeaders = ['ID', 'Request Date', 'Status', 'Travel Type', 'Estimated Cost'];
  const tripHeaders = ['ID', 'Request Date', 'Status', 'Travel Type', 'Airline', 'Travel Agency'];
  const processingHeaders = ['ID', 'Request Date', 'Status', 'Travel Type'];
  const passportHeaders = ['ID', 'Traveler Name', 'Expiry Date', 'Department Code'];
  const visaHeaders = ['ID', 'Traveler Name', 'Expiry Date', 'Department Code'];

  const formatExportData = (data: TravelRequest[], headers: string[]) => {
    return data.map(request => {
      const row: Record<string, any> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase().trim();
        if (lowerHeader === 'id') row[header] = request.id;
        else if (lowerHeader === 'request date') row[header] = request.requestDate;
        else if (lowerHeader === 'status') row[header] = request.status;
        else if (lowerHeader === 'travel type') row[header] = request.travelType;
        else if (lowerHeader === 'estimated cost') row[header] = request.estimatedCost;
        else if (lowerHeader === 'airline') row[header] = request.airline || 'N/A';
        else if (lowerHeader === 'travel agency') row[header] = request.travelAgency || 'N/A';
        else if (lowerHeader === 'traveler name') row[header] = request.travelerName || 'N/A';
        else if (lowerHeader === 'expiry date') row[header] = request.passportExpiry || request.visaExpiry || 'N/A';
        else if (lowerHeader === 'department code') row[header] = request.departmentCode || 'N/A';
        else if (lowerHeader === 'previous request date') row[header] = request.previousRequestDate || 'N/A';
        else row[header] = 'N/A';
      });
      return row;
    });
  };

  const handleExportAllReports = () => alert("Export functionality for all reports is not yet implemented.");

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">Travel Reports & Analytics</h2>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
          <button onClick={handleExportAllReports} className="btn-primary flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4 mr-2" /> Export Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <StatCard title="Total Requests" value={totalRequests} subtitle="Requests" icon={<Briefcase />} iconClass="text-blue-600" iconBgClass="bg-blue-100">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="bg-blue-50 py-2 rounded"><span className="text-xs">Approved</span><p className="font-medium">{approvedRequestsCount}</p></div>
              <div className="bg-red-50 py-2 rounded"><span className="text-xs">Rejected</span><p className="font-medium">{rejectedRequestsCount}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Total Requests Details', filteredRequests, requestHeaders)} className="absolute top-5 left-[160px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed requests"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
        <div className="relative">
          <StatCard title="Total Cost" value={`₹${totalCost.toLocaleString()}`} subtitle="Expenses" icon={<Coins />} iconClass="text-green-600" iconBgClass="bg-green-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-green-50 py-2 rounded"><span className="text-xs">Domestic</span><p className="font-medium">₹{domesticCost.toLocaleString()}</p></div>
              <div className="bg-emerald-50 py-2 rounded"><span className="text-xs">International</span><p className="font-medium">₹{internationalCost.toLocaleString()}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Total Cost Details', approvedRequestsData, costHeaders)} className="absolute top-5 left-[120px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed costs"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
        <div className="relative">
          <StatCard title="Total Trips" value={totalTrips} subtitle="Trips" icon={<Plane />} iconClass="text-purple-600" iconBgClass="bg-purple-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-purple-50 py-2 rounded"><span className="text-xs">Domestic</span><p className="font-medium">{domesticTrips}</p></div>
              <div className="bg-indigo-50 py-2 rounded"><span className="text-xs">International</span><p className="font-medium">{internationalTrips}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Total Trips Details', filteredRequests.filter(r => tripStatuses.includes(r.status)), tripHeaders)} className="absolute top-5 left-[120px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed trips"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <StatCard title="Passport Status" value={passportStatus.expiredCount} subtitle="Expired Passports" icon={<FileText />} iconClass="text-orange-600" iconBgClass="bg-orange-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-orange-50 py-2 rounded"><span className="text-xs text-gray-600">Expires in 45 Days</span><p className="font-semibold text-orange-600">{passportStatus.withinOneMonthCount}</p></div>
              <div className="bg-yellow-50 py-2 rounded"><span className="text-xs text-gray-600">Expires in 45-90 Days</span><p className="font-semibold text-yellow-600">{passportStatus.withinOneToThreeMonthsCount}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Passport Status Details', passportStatus.modalRelevantItems, passportHeaders)} className="absolute top-5 left-[170px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed passport status"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
        <div className="relative">
          <StatCard title="Visa Status" value={visaStatus.expiredCount} subtitle="Expired Visas" icon={<Globe />} iconClass="text-teal-600" iconBgClass="bg-teal-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-teal-50 py-2 rounded"><span className="text-xs text-gray-600">Expires in 45 Days</span><p className="font-semibold text-teal-600">{visaStatus.withinOneMonthCount}</p></div>
              <div className="bg-cyan-50 py-2 rounded"><span className="text-xs text-gray-600">Expires in 45-90 Days</span><p className="font-semibold text-cyan-600">{visaStatus.withinOneToThreeMonthsCount}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Visa Status Details', visaStatus.modalRelevantItems, visaHeaders)} className="absolute top-5 left-[125px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed visa status"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
        <div className="relative">
          <StatCard title="Processing Metrics" value={`${processingTimeData.avgDays} days`} subtitle="Avg Completion Time" icon={<Clock />} iconClass="text-cyan-600" iconBgClass="bg-cyan-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-cyan-50 py-2 rounded"><span className="text-xs text-gray-600">Within SLA</span><p className="font-semibold text-cyan-600">{processingTimeData.withinSLA}</p></div>
              <div className="bg-red-50 py-2 rounded"><span className="text-xs text-gray-600">SLA Breach</span><p className="font-semibold text-red-600">{processingTimeData.slaBreachCount}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Processing Metrics Details',
            filteredRequests.filter(r => approvedStatuses.includes(r.status)).length > 0
            ? filteredRequests.filter(r => approvedStatuses.includes(r.status))
            : processingContextSampleData.filter(r => approvedStatuses.includes(r.status)),
            processingHeaders)} className="absolute top-5 left-[200px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed processing metrics"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white shadow-sm"><TravelAgencyBarChart chartData={agencyData} startDate={startDate} endDate={endDate} /></div>
        <div className="border rounded-lg p-4 bg-white shadow-sm"><AirlineDistributionChart chartData={airlineData} startDate={startDate} endDate={endDate} /></div>
      </div>

      {modalData && (
        <Modal isOpen={!!modalData} onClose={closeModal} title={modalData.title} startDate={startDate} endDate={endDate}
          exportData={{ headers: modalData.headers, data: formatExportData(modalData.data, modalData.headers), filename: modalData.title.toLowerCase().replace(/\s+/g, '-') + '_report' }}>
          {modalData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>{modalData.headers.map((h, i) => <th key={i} className="px-4 py-2 whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>
                  {modalData.data.map(request => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      {modalData.headers.map(header => {
                         let cellValue: string | number = '';
                         const lowerHeader = header.toLowerCase().trim();
                         if (lowerHeader === 'id') cellValue = request.id;
                         else if (lowerHeader === 'request date') cellValue = request.requestDate;
                         else if (lowerHeader === 'status') cellValue = request.status;
                         else if (lowerHeader === 'travel type') cellValue = request.travelType;
                         else if (lowerHeader === 'estimated cost') cellValue = `₹${request.estimatedCost.toLocaleString()}`;
                         else if (lowerHeader === 'airline') cellValue = request.airline || 'N/A';
                         else if (lowerHeader === 'travel agency') cellValue = request.travelAgency || 'N/A';
                         else if (lowerHeader === 'traveler name') cellValue = request.travelerName || 'N/A';
                         else if (lowerHeader === 'expiry date') cellValue = request.passportExpiry || request.visaExpiry || 'N/A';
                         else if (lowerHeader === 'department code') cellValue = request.departmentCode || 'N/A';
                         else if (lowerHeader === 'previous request date') cellValue = request.previousRequestDate || 'N/A';
                         else cellValue = 'N/A';
                         return <td key={`${request.id}-${header}`} className="px-4 py-2 whitespace-nowrap">{cellValue}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (<p className="text-center text-gray-500 py-4">No data available for this selection.</p>)}
        </Modal>
      )}
    </div>
  );
};

export default Reports;