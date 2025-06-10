import React, { useState, useEffect, useCallback } from 'react'; // FIX: Added useCallback
import { Briefcase, Plane, FileText, Clock, ExternalLink, Globe, Coins } from 'lucide-react';
import StatCard from './StatCard';
import AirlineDistributionChart from './AirlineDistributionChart';
import TravelAgencyBarChart from './TravelAgencyBarChart';
import DateRangePicker from './DateRangePicker';
import Modal from './Modal';


interface TravelRequest {
  id?: string; 
  requestDate?: string;
  status?: string;
  travelType?: 'Domestic' | 'International';
  estimatedCost?: number;
  airline?: string;
  travelAgency?: string;
  employeeName?: string;
  employeeEmail?: string;
  department?: string;
  expiryDate?: string;
  docStatus?: 'Expired' | 'Not Expired';
  travelerName?: string;
  passportExpiry?: string;
  visaExpiry?: string;
  departmentCode?: string;
}

interface DocumentDetail {
  employeeName: string;
  employeeEmail: string;
  expiryDate: string;
  department: string;
  docStatus: 'Expired' | 'Not Expired';
}

interface PassportStatusResponse {
  passportDetails: DocumentDetail[];
  expiredCount: number;
  expiresIn45DaysCount: number;
  expiresIn90DaysCount: number;
}

interface VisaStatusResponse {
  visaDetails: DocumentDetail[];
  expiredCount: number;
  expiresIn45DaysCount: number;
  expiresIn90DaysCount: number;
}

interface ProcessingTimeResponse {
  averageDays: number;
  averageHours: number;
  averageMinutes: number;
  readableFormat: string;
  totalRequestsCalculated: number;
}

interface StatusOverviewData {
  requests: TravelRequest[];
  totalRequestCount: number;
  rejectedCount: number;
  confirmedOrOtherCount: number;
}

interface ExpenseOverviewData {
  requests: TravelRequest[];
  totalExpense: number;
  domesticExpense: number;
  internationalExpense: number;
}

interface TripDetailsData {
  trips: TravelRequest[];
  totalTripCount: number;
  domesticTripCount: number;
  internationalTripCount: number;
}

interface ModalData {
  title: string;

  data: (TravelRequest | DocumentDetail)[]; 
  headers: string[];
}

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const Reports: React.FC = () => {
  const getInitialEndDate = (): Date => new Date();
  const getInitialStartDate = (): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  };

  const [appliedStartDate, setAppliedStartDate] = useState<string>(formatDateForInput(getInitialStartDate()));
  const [appliedEndDate, setAppliedEndDate] = useState<string>(formatDateForInput(getInitialEndDate()));
  
  const [startDate, setStartDate] = useState<string>(formatDateForInput(getInitialStartDate()));
  const [endDate, setEndDate] = useState<string>(formatDateForInput(getInitialEndDate()));

  const [statusData, setStatusData] = useState<StatusOverviewData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseOverviewData | null>(null);
  const [tripData, setTripData] = useState<TripDetailsData | null>(null);
  
  const [passportData, setPassportData] = useState<PassportStatusResponse | null>(null);
  const [visaData, setVisaData] = useState<VisaStatusResponse | null>(null);
  const [processingTimeData, setProcessingTimeData] = useState<ProcessingTimeResponse | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);

 
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const dashboardBaseUrl = 'http://localhost:5030/api/Dashboard';
    const docStatusBaseUrl = 'http://localhost:5030/api/document-status';
    const processingTimeBaseUrl = 'http://localhost:5030/api/ProcessingTime';
    const params = `?startDate=${appliedStartDate}&endDate=${appliedEndDate}`;
    
    const endpoints = {
      status: `${dashboardBaseUrl}/status-overview${params}`,
      expense: `${dashboardBaseUrl}/expense-overview${params}`,
      trip: `${dashboardBaseUrl}/trip-details${params}`,
      passport: `${docStatusBaseUrl}/passport${params}`,
      visa: `${docStatusBaseUrl}/visa${params}`,
      processingTime: `${processingTimeBaseUrl}/average-review-to-dispatch${params}`,
    };

    try {
      const responses = await Promise.all(Object.values(endpoints).map(url => fetch(url)));

      for (const res of responses) {
        if (!res.ok) {
          throw new Error('Network response was not ok. Please check the API server.');
        }
      }

      const [statusJson, expenseJson, tripJson, passportJson, visaJson, processingTimeJson] = await Promise.all(responses.map(res => res.json()));
      
      const allSuccess = [statusJson, expenseJson, tripJson, passportJson, visaJson, processingTimeJson].every(json => json.isSuccess);

      if (allSuccess) {
        setStatusData(statusJson.result);
        setExpenseData(expenseJson.result);
        setTripData(tripJson.result);
        setPassportData(passportJson.result);
        setVisaData(visaJson.result);
        setProcessingTimeData(processingTimeJson.result);
      } else {
        const errorMessages = [
          ...(statusJson.errorMessages || []), 
          ...(expenseJson.errorMessages || []), 
          ...(tripJson.errorMessages || []),
          ...(passportJson.errorMessages || []),
          ...(visaJson.errorMessages || []),
          ...(processingTimeJson.errorMessages || []),
        ].filter(Boolean).join(' ');
        throw new Error(errorMessages || 'An unknown API error occurred.');
      }
    } catch (err: any) {
      setError(err.message);
      setStatusData(null); 
      setExpenseData(null); 
      setTripData(null);
      setPassportData(null);
      setVisaData(null);
      setProcessingTimeData(null);
    } finally {
      setLoading(false);
    }
  }, [appliedStartDate, appliedEndDate]); 

  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

 
  const handleApplyDateRange = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };
  
  const openModal = (title: string, data: (TravelRequest | DocumentDetail)[], headers: string[]) => 
    setModalData({ title, data, headers });
  
  const closeModal = () => setModalData(null);
  
  const requestHeaders = ['ID', 'Request Date', 'Status', 'Travel Type'];
  const costHeaders = ['ID', 'Request Date', 'Status', 'Travel Type', 'Estimated Cost'];
  const tripHeaders = ['ID', 'Request Date', 'Status', 'Travel Type', 'Airline', 'Travel Agency'];
  
  const passportHeaders = ['Employee Name', 'Email', 'Department', 'Expiry Date', 'Status'];
  const visaHeaders = ['Employee Name', 'Email', 'Department', 'Expiry Date', 'Status'];
  
  const formatExportData = (data: (TravelRequest | DocumentDetail)[], headers: string[]) => { return []; };

  if (loading) return <div className="text-center p-10 font-semibold">Loading Reports...</div>;
  if (error) return <div className="text-center p-10 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6 animate-fadeIn">
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
            onApply={handleApplyDateRange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <StatCard title="Total Requests" value={statusData?.totalRequestCount ?? 0} subtitle="Requests" icon={<Briefcase />} iconClass="text-blue-600" iconBgClass="bg-blue-100">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div className="bg-blue-50 py-2 rounded"><span className="text-xs">Ticketed</span><p className="font-medium">{statusData?.confirmedOrOtherCount ?? 0}</p></div>
              <div className="bg-red-50 py-2 rounded"><span className="text-xs">Rejected</span><p className="font-medium">{statusData?.rejectedCount ?? 0}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Total Requests Details', statusData?.requests ?? [], requestHeaders)} className="absolute top-5 left-[160px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed requests"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
        <div className="relative">
          <StatCard title="Total Cost" value={`₹${(expenseData?.totalExpense ?? 0).toLocaleString()}`} subtitle="Expenses" icon={<Coins />} iconClass="text-green-600" iconBgClass="bg-green-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-green-50 py-2 rounded"><span className="text-xs">Domestic</span><p className="font-medium">₹{(expenseData?.domesticExpense ?? 0).toLocaleString()}</p></div>
              <div className="bg-emerald-50 py-2 rounded"><span className="text-xs">International</span><p className="font-medium">₹{(expenseData?.internationalExpense ?? 0).toLocaleString()}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Total Cost Details', expenseData?.requests ?? [], costHeaders)} className="absolute top-5 left-[120px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed costs"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
        <div className="relative">
          <StatCard title="Total Trips" value={tripData?.totalTripCount ?? 0} subtitle="Trips" icon={<Plane />} iconClass="text-purple-600" iconBgClass="bg-purple-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-purple-50 py-2 rounded"><span className="text-xs">Domestic</span><p className="font-medium">{tripData?.domesticTripCount ?? 0}</p></div>
              <div className="bg-indigo-50 py-2 rounded"><span className="text-xs">International</span><p className="font-medium">{tripData?.internationalTripCount ?? 0}</p></div>
            </div>
          </StatCard>
          <button onClick={() => openModal('Total Trips Details', tripData?.trips ?? [], tripHeaders)} className="absolute top-5 left-[120px] p-1 rounded-full hover:bg-gray-100 z-20" aria-label="View detailed trips"><ExternalLink className="h-5 w-5 text-gray-600" /></button>
        </div>
      </div>
      
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <StatCard 
            title="Passport Status" 
            value={passportData?.expiredCount ?? 0} 
            subtitle="Expired Passports" 
            icon={<FileText />} 
            iconClass="text-orange-600" 
            iconBgClass="bg-orange-100"
          >
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-orange-50 py-2 rounded">
                <span className="text-xs text-gray-600">Expires in 45 Days</span>
                <p className="font-semibold text-orange-600">{passportData?.expiresIn45DaysCount ?? 0}</p>
              </div>
              <div className="bg-yellow-50 py-2 rounded">
                <span className="text-xs text-gray-600">Expires in 45-90 Days</span>
                <p className="font-semibold text-yellow-600">{passportData?.expiresIn90DaysCount ?? 0}</p>
              </div>
            </div>
          </StatCard>
          <button 
            onClick={() => openModal('Passport Status Details', passportData?.passportDetails ?? [], passportHeaders)} 
            className="absolute top-5 left-[170px] p-1 rounded-full hover:bg-gray-100 z-20" 
            aria-label="View detailed passport status"
          >
            <ExternalLink className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <StatCard 
            title="Visa Status" 
            value={visaData?.expiredCount ?? 0} 
            subtitle="Expired Visas" 
            icon={<Globe />} 
            iconClass="text-teal-600" 
            iconBgClass="bg-teal-100"
          >
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-teal-50 py-2 rounded">
                <span className="text-xs text-gray-600">Expires in 45 Days</span>
                <p className="font-semibold text-teal-600">{visaData?.expiresIn45DaysCount ?? 0}</p>
              </div>
              <div className="bg-cyan-50 py-2 rounded">
                <span className="text-xs text-gray-600">Expires in 45-90 Days</span>
                <p className="font-semibold text-cyan-600">{visaData?.expiresIn90DaysCount ?? 0}</p>
              </div>
            </div>
          </StatCard>
          <button 
            onClick={() => openModal('Visa Status Details', visaData?.visaDetails ?? [], visaHeaders)} 
            className="absolute top-5 left-[125px] p-1 rounded-full hover:bg-gray-100 z-20" 
            aria-label="View detailed visa status"
          >
            <ExternalLink className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <StatCard 
          title="Processing Metrics" 
          value={processingTimeData?.readableFormat ?? 'N/A'} 
          subtitle="Avg Completion Time" 
          icon={<Clock />} 
          iconClass="text-cyan-600" 
          iconBgClass="bg-cyan-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 bg-white shadow-sm"><TravelAgencyBarChart startDate={appliedStartDate} endDate={appliedEndDate} /></div>
        <div className="border rounded-lg p-4 bg-white shadow-sm"><AirlineDistributionChart startDate={appliedStartDate} endDate={appliedEndDate} /></div>
      </div>

      {modalData && (
        <Modal 
          isOpen={!!modalData} 
          onClose={closeModal} 
          title={modalData.title} 
          startDate={appliedStartDate} 
          endDate={appliedEndDate} 
          exportData={{ headers: modalData.headers, data: formatExportData(modalData.data, modalData.headers), filename: modalData.title.toLowerCase().replace(/\s+/g, '-') + '_report' }}
        >
          {modalData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>{modalData.headers.map((h, i) => (<th key={i} className="px-4 py-2 whitespace-nowrap">{h}</th>))}</tr></thead>
                <tbody>
                  {modalData.data.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {modalData.headers.map(header => {
                        const key = header.toLowerCase().replace(/\s+/g, '');
                        // A more robust way to get cell values
                        const getCellValue = () => {
                          if ('id' in item && key === 'id') return item.id;
                          if ('requestDate' in item && key === 'requestdate') return item.requestDate ? new Date(item.requestDate).toLocaleDateString() : 'N/A';
                          if (key === 'status') return (item as TravelRequest).status || (item as DocumentDetail).docStatus;
                          if ('travelType' in item && key === 'traveltype') return item.travelType;
                          if ('estimatedCost' in item && key === 'estimatedcost') return item.estimatedCost ? `₹${item.estimatedCost.toLocaleString()}` : 'N/A';
                          if ('airline' in item && key === 'airline') return item.airline;
                          if ('travelAgency' in item && key === 'travelagency') return item.travelAgency;
                          if (key === 'employeename') return (item as TravelRequest).employeeName || (item as TravelRequest).travelerName || (item as DocumentDetail).employeeName;
                          if (key === 'email') return (item as TravelRequest).employeeEmail || (item as DocumentDetail).employeeEmail;
                          if (key === 'department') return (item as TravelRequest).department || (item as TravelRequest).departmentCode || (item as DocumentDetail).department;
                          if ('expiryDate' in item && key === 'expirydate') return item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A';
                          return 'N/A';
                        };

                        return (<td key={`${index}-${header}`} className="px-4 py-2 whitespace-nowrap">{getCellValue()}</td>);
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