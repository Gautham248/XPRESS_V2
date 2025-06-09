import React, { useState, useEffect } from 'react';
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
  User,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { dashboardStats, getStatusColor } from '../../data/mockData';
import { mockUserDocuments } from '../../data/documentData';

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
  timeline?: Array<{
    id: string;
    type: string;
    date: string;
    actor: string;
    description: string;
    details?: string;
  }>;
}

interface UserDocuments {
  userId: string;
  userName: string;
  visaDocuments: Array<{
    id: string;
    visaNumber: string;
    visaClass: string;
    issuingCountry: string;
    issuingPost: string;
    issueDate: string;
    expiryDate: string;
    documentUrl: string;
  }>;
  passportDocuments: Array<{
    id: string;
    passportNumber: string;
    issuingCountry: string;
    issueDate: string;
    expiryDate: string;
    documentUrl: string;
  }>;
  aadharDocuments: Array<{
    id: string;
    fullName: string;
    aadharNumber: string;
    documentUrl: string;
  }>;
}

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();

  // State for travel requests
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);

  // Get user data from local storage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentUser = {
    id: user?.userId || 'USER001',
    name: user?.userName || 'John Smith',
    role: user?.role || 'Employee',
    department: user?.userDU , // As per original code
    photo: '',
  };

  // Fetch travel requests from API
  useEffect(() => {
    const fetchTravelRequests = async () => {
      if (!user?.userId || !user?.token) {
        console.error('User ID or token not found in local storage');
        setTravelRequests([]);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5030/api/TravelRequest/ByUser/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();

        if (data.isSuccess) {
          // Map API response to TravelRequest interface
          const mappedRequests = data.result.map((trip: any) => ({
            id: trip.requestId,
            travelerName: user.userName,
            travelType: trip.destination.includes('India')
              ? 'Domestic'
              : 'International',
            departureDate: trip.outboundDepartureDate,
            returnDate: trip.returnDepartureDate || '', // Handle null return date
            source: 'Unknown',
            destination: trip.destination,
            purpose: trip.purposeOfTravel,
            status: trip.currentStatusName,
            estimatedCost: 0,
            transportationType: 'Unknown',
            accommodationType: 'Unknown',
            requestDate: trip.outboundDepartureDate, // Fallback to departure date
            departmentCode: currentUser.department,
            managerName: 'Unknown',
            reportingManager: 'Unknown',
            priority: 'Medium',
            projectCode: 'Unknown',
          }));
          setTravelRequests(mappedRequests);
        } else {
          console.error('Failed to fetch travel requests:', data.errorMessages);
          setTravelRequests([]);
        }
      } catch (error) {
        console.error('Error fetching travel requests:', error);
        setTravelRequests([]);
      }
    };

    fetchTravelRequests();
  }, []);

  // Filter travel requests based on user (no status filter)
  const filteredRequests = travelRequests.filter(
    (request) => request.travelerName === currentUser.name
  );

  // Document expiry alerts
  const userDocs = mockUserDocuments.find((doc) => doc.userId === currentUser.id);
  const documentAlerts = [
    ...(userDocs?.visaDocuments || []).map((doc) => ({
      type: 'Visa',
      message: `Visa ${doc.visaNumber} for ${doc.issuingCountry} expires on ${doc.expiryDate}`,
      daysUntilExpiry: differenceInDays(parseISO(doc.expiryDate), new Date()),
    })),
    ...(userDocs?.passportDocuments || []).map((doc) => ({
      type: 'Passport',
      message: `Passport ${doc.passportNumber} expires on ${doc.expiryDate}`,
      daysUntilExpiry: differenceInDays(parseISO(doc.expiryDate), new Date()),
    })),
  ].filter((alert) => alert.daysUntilExpiry <= 45);

  // SLA alerts for delayed requests
  const slaAlerts = filteredRequests
    .filter(
      (request) =>
        ['PendingReview', 'Verified'].includes(request.status) &&
        differenceInDays(new Date(), parseISO(request.requestDate)) > 3
    )
    .map((request) => ({
      id: request.id,
      message: `Request ${request.id} delayed at ${request.status} stage`,
    }));

  const handleRowClick = (item: TravelRequest) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    if (!user) return;

    const path = window.location.pathname;
    let basePath = '';
    if (user.role === 'admin') {
      basePath = '/admin/travel-requests';
    } else  {
      basePath = path.includes('team-requests')
        ? '/manager/team-requests'
        : '/manager/my-requests';
    } 
    navigate(`${basePath}/${item.id}`);
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
        return 'bg-blue-500';
      case 'Clock':
        return 'bg-yellow-500';
      case 'Plane':
        return 'bg-indigo-500';
      case 'DollarSign':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Navigation handlers for the buttons
  const handleNewRequestClick = () => {
    navigate('/manager/new-request');
  };

  const handleUploadDocumentsClick = () => {
    navigate('/manager/documents');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <User className="h-10 w-10 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold">{currentUser.name}</h2>
            <p className="text-sm text-gray-500">
              {currentUser.role} | {currentUser.department}
            </p>
          </div>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button 
            onClick={handleNewRequestClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            New Travel Request
          </button>
          <button 
            onClick={handleUploadDocumentsClick}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            <Upload className="h-4 w-4 inline mr-2" /> Upload Documents
          </button>
        </div>
      </div>

      {/* Active Travel Requests */}
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Active Travel Requests</h3>
        </div>
        {filteredRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No active requests. Start a new request!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Destination
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Travel Dates
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Purpose
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  {/* <th className="text-right py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th> */}
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
                    <td className="py-3 px-4">
                      {format(parseISO(trip.departureDate), 'MMM dd')} -{' '}
                      {trip.returnDate
                        ? format(parseISO(trip.returnDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4">{trip.purpose}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    {/* <td className="py-3 px-4 text-right">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                      {['DUApproved', 'Verified', 'Closed'].includes(trip.status) && (
                        <button className="text-sm text-blue-600 hover:text-blue-800 ml-2">
                          Add Subtrip
                        </button>
                      )}
                    </td> */}
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
          {/* <button className="text-sm text-blue-600 hover:text-blue-800">
            Upload New
          </button> */}
        </div>
        {userDocs &&
        (userDocs.visaDocuments.length > 0 ||
          userDocs.passportDocuments.length > 0 ||
          userDocs.aadharDocuments.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDocs.visaDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 flex items-start space-x-3"
              >
                <FileText className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium">
                    Visa: {doc.visaNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires: {doc.expiryDate}
                  </p>
                  <p
                    className={`text-sm ${
                      differenceInDays(parseISO(doc.expiryDate), new Date()) <= 30
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {differenceInDays(parseISO(doc.expiryDate), new Date()) <= 45
                      ? `Expires in ${differenceInDays(
                          parseISO(doc.expiryDate),
                          new Date()
                        )} days`
                      : 'Valid'}
                  </p>
                </div>
              </div>
            ))}
            {userDocs.passportDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 flex items-start space-x-3"
              >
                <FileText className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium">
                    Passport: {doc.passportNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires: {doc.expiryDate}
                  </p>
                  <p
                    className={`text-sm ${
                      differenceInDays(parseISO(doc.expiryDate), new Date()) <= 30
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {differenceInDays(parseISO(doc.expiryDate), new Date()) <= 45
                      ? `Expires in ${differenceInDays(
                          parseISO(doc.expiryDate),
                          new Date()
                        )} days`
                      : 'Valid'}
                  </p>
                </div>
              </div>
            ))}
            {userDocs.aadharDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 flex items-start space-x-3"
              >
                <FileText className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="font-medium">
                    Aadhar: {doc.aadharNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Name: {doc.fullName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No documents uploaded. Start by uploading a document!
          </p>
        )}
      </div>

      {/* Travel Policy Snapshot */}
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Travel Policy</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <a href="#" className="text-blue-600 hover:text-blue-800">
              Experion Travel Policy v3.1
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-500">
              Last acknowledged on 12-Jul-2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;