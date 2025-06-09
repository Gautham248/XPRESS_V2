import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  X,
  Edit, // Added Edit icon
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getStatusColor } from '../../data/mockData';
 
// --- Interfaces are unchanged ---
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
 
interface Document {
  id: string;
  documentType: string;
  documentNumber: string;
  issuingCountry?: string;
  issuingPost?: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl: string;
  fullName?: string;
  visaClass?: string;
}
 
interface UserDocuments {
  userId: string;
  userName: string;
  documents: Document[];
}
 
const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
 
  // State for travel requests and documents
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [userDocuments, setUserDocuments] = useState<UserDocuments | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
 
  // State to manage which document is being previewed
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<Document | null>(null);
 
  // Get user data from local storage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentUser = {
    id: user?.userId || 'USER001',
    name: user?.userName || 'John Smith',
    role: user?.role || 'Employee',
    department: user?.userDU,
    photo: '',
  };
 
  // Fetch documents from API
  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!user?.userId || !user?.token) {
        console.error('User ID or token not found in local storage');
        setDocumentsError('User authentication required');
        setDocumentsLoading(false);
        return;
      }
 
      try {
        setDocumentsLoading(true);
        setDocumentsError(null);
 
        const response = await axios.get(
          `http://localhost:5030/api/Documents/User/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const apiDocuments = Array.isArray(response.data)
          ? response.data
          : response.data.documents || response.data.result || [];
 
        if (apiDocuments && apiDocuments.length > 0) {
         
          const mappedDocuments = apiDocuments.map((apiDoc: any) => ({
            id: String(apiDoc.id),
            documentType: apiDoc.idType,
            documentUrl: apiDoc.documentPath,
            documentNumber: apiDoc.visaNumber || apiDoc.passportNumber || apiDoc.aadharNumber || '',
            issueDate: apiDoc.visaIssueDate || apiDoc.passportIssueDate || apiDoc.uploadDate,
            expiryDate: apiDoc.visaExpiryDate || apiDoc.passportExpiryDate,
            issuingCountry: apiDoc.issuingCountry,
            fullName: apiDoc.fullName,
            visaClass: apiDoc.visaClass,
          }));
 
          const newUserDocuments = {
            userId: user.userId,
            userName: user.userName,
            documents: mappedDocuments,
          };
 
          setUserDocuments(newUserDocuments);
         
        } else {
          setUserDocuments({
            userId: user.userId,
            userName: user.userName,
            documents: [],
          });
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocumentsError('Error loading documents');
      } finally {
        setDocumentsLoading(false);
      }
    };
 
    fetchUserDocuments();
}, []);
 
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
          const mappedRequests = data.result.map((trip: any) => ({
            id: trip.requestId,
            travelerName: user.userName,
            travelType: trip.destination.includes('India')
              ? 'Domestic'
              : 'International',
            departureDate: trip.outboundDepartureDate,
            returnDate: trip.returnDepartureDate || '',
            source: 'Unknown',
            destination: trip.destination,
            purpose: trip.purposeOfTravel,
            status: trip.currentStatusName,
            estimatedCost: 0,
            transportationType: 'Unknown',
            accommodationType: 'Unknown',
            requestDate: trip.outboundDepartureDate,
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
  const documentAlerts = userDocuments?.documents
    ? userDocuments.documents
        .filter((doc) => doc.expiryDate)
        .map((doc) => ({
          type: doc.documentType,
          message: `${doc.documentType} ${doc.documentNumber} expires on ${doc.expiryDate}`,
          daysUntilExpiry: differenceInDays(parseISO(doc.expiryDate!), new Date()),
        }))
        .filter((alert) => alert.daysUntilExpiry <= 45)
    : [];
 
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
 
  // Edit button handler - placeholder for now
  const handleEditClick = (e: React.MouseEvent, request: TravelRequest) => {
    e.stopPropagation(); // Prevent row click
    // TODO: Add edit functionality here
    console.log('Edit clicked for request:', request.id);
  };
 
  // Check if edit button should be disabled
  const isEditDisabled = (status: string) => {
    return status === 'Returned' || status === 'Closed';
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
 
  // Navigation handlers for the buttons
  const handleNewRequestClick = () => { navigate('/manager/new-request'); };
  const handleUploadDocumentsClick = () => { navigate('/manager/documents'); };
 
  // Helper function to get document display info
  const getDocumentDisplayInfo = (doc: Document) => {
    switch (doc.documentType) {
      case 'Visa':
        return {
          title: `Visa: ${doc.documentNumber || ''}`,
          subtitle: doc.issuingCountry ? `Country: ${doc.issuingCountry}` : '',
          additionalInfo: doc.visaClass ? `Class: ${doc.visaClass}` : '',
        };
      case 'Passport':
        return {
          title: `Passport: ${doc.documentNumber || ''}`,
          subtitle: doc.issuingCountry ? `Issued by: ${doc.issuingCountry}` : '',
          additionalInfo: '',
        };
      case 'Aadhar':
        return {
          title: `Aadhar: ${doc.documentNumber || ''}`,
          subtitle: doc.fullName ? `Name: ${doc.fullName}` : '',
          additionalInfo: '',
        };
      default:
        return {
          title: `${doc.documentType}: ${doc.documentNumber || ''}`,
          subtitle: '',
          additionalInfo: '',
        };
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500 w-16">Edit</th>
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
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => handleEditClick(e, trip)}
                        disabled={isEditDisabled(trip.status)}
                        className={`p-2 rounded-md transition-colors ${
                          isEditDisabled(trip.status)
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        }`}
                        title={isEditDisabled(trip.status) ? 'Cannot edit closed or returned requests' : 'Edit request'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4">{trip.destination}</td>
                    <td className="py-3 px-4">
                      {trip.departureDate ? format(parseISO(trip.departureDate), 'MMM dd') : 'N/A'} -{' '}
                      {trip.returnDate ? format(parseISO(trip.returnDate), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="py-3 px-4">{trip.purpose}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-sm text-blue-600 hover:text-blue-800">View Details</button>
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
        </div>
       
        {documentsLoading ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading documents...</p>
          </div>
        ) : documentsError ? (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{documentsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 mt-2"
            >
              Retry
            </button>
          </div>
        ) : userDocuments && userDocuments.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDocuments.documents.map((doc) => {
              const displayInfo = getDocumentDisplayInfo(doc);
              const daysUntilExpiry = doc.expiryDate ? differenceInDays(parseISO(doc.expiryDate), new Date()) : null;
             
              return (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 flex items-start space-x-3 hover:shadow-md hover:border-blue-500 transition-all cursor-pointer"
                  onClick={() => setSelectedDocForPreview(doc)}
                >
                  <FileText className="h-6 w-6 text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{displayInfo.title}</p>
                    {displayInfo.subtitle && <p className="text-sm text-gray-500">{displayInfo.subtitle}</p>}
                    {displayInfo.additionalInfo && <p className="text-sm text-gray-500">{displayInfo.additionalInfo}</p>}
                    {doc.expiryDate && (
                      <>
                        <p className="text-sm text-gray-500">Expires: {format(parseISO(doc.expiryDate), 'MMM dd, yyyy')}</p>
                        {daysUntilExpiry !== null && (
                          <p className={`text-sm ${daysUntilExpiry <= 30 ? 'text-red-600' : daysUntilExpiry <= 45 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {daysUntilExpiry <= 0 ? 'Expired' : daysUntilExpiry <= 45 ? `Expires in ${daysUntilExpiry} days` : 'Valid'}
                          </p>
                        )}
                      </>
                    )}
                    {doc.issueDate && <p className="text-sm text-gray-500">Issued: {format(parseISO(doc.issueDate), 'MMM dd, yyyy')}</p>}
                  </div>
                </div>
              );
            })}
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
            <a href="https://experiontechnologies.sharepoint.com/sites/QualityManagementSystem/Quality%20Management%20System/Forms/AllItems.aspx?id=%2Fsites%2FQualityManagementSystem%2FQuality%20Management%20System%2F04%2EPolicies%2FPL03%20Travel%20Policy%2Epdf&parent=%2Fsites%2FQualityManagementSystem%2FQuality%20Management%20System%2F04%2EPolicies" className="text-blue-600 hover:text-blue-800" target='blank'>
              Experion Travel Policy
            </a>
          </div>
        </div>
      </div>
 
      {/* Preview Modal */}
      {selectedDocForPreview && (
         <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDocForPreview(null)}
         >
          <div
            className="relative bg-white rounded-lg p-3 max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
                className="absolute top-3 right-3 p-1 bg-white rounded-full shadow-md text-gray-800 hover:text-red-500 transition-colors z-10"
                onClick={() => setSelectedDocForPreview(null)}
                aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="pt-8 h-full">
              {selectedDocForPreview.documentUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                    src={`${selectedDocForPreview.documentUrl}#view=FitH`}
                    title={`${selectedDocForPreview.documentType} Preview`}
                    className="w-full rounded"
                    style={{ minHeight: '500px', height: 'calc(90vh - 4rem)' }}
                />
              ) : (
                <img
                    src={selectedDocForPreview.documentUrl}
                    alt={`${selectedDocForPreview.documentType} Preview`}
                    className="max-w-full max-h-[calc(90vh-4rem)] object-contain mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// New dashboard
 
export default EmployeeDashboard;