import React, { useState } from 'react';
import { 
  Briefcase, 
  Clock, 
  Plane, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  MapPin,
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  User
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  dashboardStats, 
  mockTravelRequests,
  
} from '../../data/mockData';
import {mockUserDocuments} from '../../data/documentData';
import { getStatusColor } from '../../data/mockData';

interface TravelRequest {
  id: string;
  travelerName: string;
  travelType: 'Domestic' | 'International';
  departureDate: string;
  returnDate: string;
  source: string;
  destination: string;
  purpose: string;
  status: string;
  estimatedCost: number;
  transportationType: string;
  accommodationType: string;
  requestDate: string;
  departmentCode: string;
  managerName: string;
  reportingManager: string;
  priority: string;
  projectCode: string;
  travelAgency?: string;
  airline?: string;
  timeline?: Array<{ id: string; type: string; date: string; actor: string; description: string; details?: string }>;
}

interface UserDocuments {
  userId: string;
  userName: string;
  visaDocuments: Array<{ id: string; visaNumber: string; visaClass: string; issuingCountry: string; issuingPost: string; issueDate: string; expiryDate: string; documentUrl: string }>;
  passportDocuments: Array<{ id: string; passportNumber: string; issuingCountry: string; issueDate: string; expiryDate: string; documentUrl: string }>;
  aadharDocuments: Array<{ id: string; fullName: string; aadharNumber: string; documentUrl: string }>;
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock user data (assuming logged-in user)
  const currentUser = { id: 'USER001', name: 'John Smith', role: 'Employee', department: 'MKT-01', photo: '' };

  // Filter travel requests based on user (no status filter)
  const filteredRequests = mockTravelRequests.filter(request => 
    request.travelerName === currentUser.name
  );

  // Document expiry alerts
  const userDocs = mockUserDocuments.find(doc => doc.userId === currentUser.id);
  const documentAlerts = [
    ...(userDocs?.visaDocuments || []).map(doc => ({
      type: 'Visa',
      message: `Visa ${doc.visaNumber} for ${doc.issuingCountry} expires on ${doc.expiryDate}`,
      daysUntilExpiry: differenceInDays(parseISO(doc.expiryDate), new Date())
    })),
    ...(userDocs?.passportDocuments || []).map(doc => ({
      type: 'Passport',
      message: `Passport ${doc.passportNumber} expires on ${doc.expiryDate}`,
      daysUntilExpiry: differenceInDays(parseISO(doc.expiryDate), new Date())
    }))
  ].filter(alert => alert.daysUntilExpiry <= 45);

  // SLA alerts for delayed requests
  const slaAlerts = filteredRequests
    .filter(request => ['Pending', 'Manager Approved'].includes(request.status) && 
      differenceInDays(new Date(), parseISO(request.requestDate)) > 3)
    .map(request => ({
      id: request.id,
      message: `Request ${request.id} delayed at ${request.status} stage`
    }));

  const handleRowClick = (item: TravelRequest) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    if (!user) return;

    const path = window.location.pathname;
    let basePath = '';
    if (user.role === 'admin') {
      basePath = '/admin/travel-requests';
    } else if (user.role === 'manager') {
      basePath = path.includes('team-requests') ? '/manager/team-requests' : '/manager/my-requests';
    } else if (user.role === 'employee') {
      basePath = '/employee/my-requests';
    }
    navigate(`${basePath}/${item.id}`);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return Briefcase;
      case 'Clock': return Clock;
      case 'Plane': return Plane;
      case 'DollarSign': return DollarSign;
      default: return Briefcase;
    }
  };

  const getIconBackgroundColor = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return 'bg-blue-500';
      case 'Clock': return 'bg-yellow-500';
      case 'Plane': return 'bg-indigo-500';
      case 'DollarSign': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <User className="h-10 w-10 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold">{currentUser.name}</h2>
            <p className="text-sm text-gray-500">{currentUser.role} | {currentUser.department}</p>
          </div>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            New Travel Request
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100">
            <Upload className="h-4 w-4 inline mr-2" /> Upload Documents
          </button>
        </div>
      </div>

      

      {/* Active Travel Requests */}
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Active Travel Requests</h3>
          {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <Calendar className="h-4 w-4 inline mr-2" /> View Calendar
          </button> */}
        </div>
        {filteredRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No active requests. Start a new request!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Travel Dates</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Purpose</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((trip, index) => (
                  <tr 
                    key={index} 
                    className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(trip)}
                  >
                    <td className="py-3 px-4">{trip.id}</td>
                    <td className="py-3 px-4">{trip.destination}</td>
                    <td className="py-3 px-4">{format(parseISO(trip.departureDate), 'MMM dd')} - {format(parseISO(trip.returnDate), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4">{trip.purpose}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
                      {['Approved', 'Tickets Selected', 'Tickets Dispatched'].includes(trip.status) && (
                        <button className="text-sm text-blue-600 hover:text-blue-800 ml-2">Add Subtrip</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Repository */}
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Document Repository</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">Upload New</button>
        </div>
        {userDocs && (userDocs.visaDocuments.length > 0 || userDocs.passportDocuments.length > 0 || userDocs.aadharDocuments.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDocs.visaDocuments.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 flex items-start space-x-3">
                <FileText className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium">Visa: {doc.visaNumber}</p>
                  <p className="text-sm text-gray-500">Expires: {doc.expiryDate}</p>
                  <p className={`text-sm ${differenceInDays(parseISO(doc.expiryDate), new Date()) <= 30 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {differenceInDays(parseISO(doc.expiryDate), new Date()) <= 45 ? `Expires in ${differenceInDays(parseISO(doc.expiryDate), new Date())} days` : 'Valid'}
                  </p>
                </div>
              </div>
            ))}
            {userDocs.passportDocuments.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 flex items-start space-x-3">
                <FileText className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium">Passport: {doc.passportNumber}</p>
                  <p className="text-sm text-gray-500">Expires: {doc.expiryDate}</p>
                  <p className={`text-sm ${differenceInDays(parseISO(doc.expiryDate), new Date()) <= 30 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {differenceInDays(parseISO(doc.expiryDate), new Date()) <= 45 ? `Expires in ${differenceInDays(parseISO(doc.expiryDate), new Date())} days` : 'Valid'}
                  </p>
                </div>
              </div>
            ))}
            {userDocs.aadharDocuments.map(doc => (
              <div key={doc.id} className="border rounded-lg p-4 flex items-start space-x-3">
                <FileText className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium">Aadhar: {doc.aadharNumber}</p>
                  <p className="text-sm text-gray-500">Name: {doc.fullName}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No documents uploaded. Start by uploading a document!</p>
        )}
      </div>

      {/* Travel Policy Snapshot */}
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Travel Policy</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <a href="#" className="text-blue-600 hover:text-blue-800">Experion Travel Policy v3.1</a>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-500">Last acknowledged on 12-Jul-2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;