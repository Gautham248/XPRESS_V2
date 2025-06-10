import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; 
import {
  Upload,
  FileText,
  User,
  X,
  Edit,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getStatusColor } from '../../data/mockData';
import EditTravelRequestModal, { DetailedTravelRequest } from './EditTravelRequestModal';
 
// --- INTERFACES ---
interface TravelRequest {
  id: string;
  humanReadableId: string;
  travelerName: string;
  travelType: 'Domestic' | 'International';
  tripType?: 'One Way' | 'Round Trip';
  departureDate: string;
  returnDate: string;
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
}
 
interface Document {
  id: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl: string;
  issuingCountry?: string;
  fullName?: string;
  visaClass?: string;
}
 
interface UserDocuments {
  userId: string;
  userName: string;
  documents: Document[];
}
 
// --- MAIN DASHBOARD COMPONENT ---
const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
 
  // State for data
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [userDocuments, setUserDocuments] = useState<UserDocuments | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
 
  // State for UI
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<Document | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequestForEdit, setSelectedRequestForEdit] = useState<DetailedTravelRequest | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
 
  // State to hold the specific ID required for the POST /edit endpoint
  const [selectedRequestIdForEdit, setSelectedRequestIdForEdit] = useState<string | null>(null);
  const [selectedRequestStatus, setSelectedRequestStatus] = useState<string | null>(null);
 
 
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentUser = {
    id: user?.userId || 'USER001',
    name: user?.userName || 'John Smith',
    role: user?.role || 'Employee',
    department: user?.userDU,
  };
 
  // --- API CALLS ---
  const fetchTravelRequests = useCallback(async () => {
    if (!user?.userId || !user?.token) return;
   
    const endpoint = `http://localhost:5030/api/TravelRequest/ByUser/${user.userId}`;
 
    try {
      const response = await fetch(
        endpoint,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const data = await response.json();
     
      if (data.isSuccess) {
        const mappedRequests = data.result.map((trip: any): TravelRequest => ({
          id: trip.requestId,
          humanReadableId: trip.requestNumber || trip.requestId,
          travelerName: user.userName,
          travelType: trip.isInternational ? 'International' : 'Domestic',
          tripType: trip.isRoundTrip ? 'Round Trip' : 'One Way',
          departureDate: trip.outboundDepartureDate,
          returnDate: trip.returnDepartureDate || '',
          destination: trip.destination,
          purpose: trip.purposeOfTravel,
          status: trip.currentStatusName,
          transportationType: trip.modeOfTransportName || 'Flight',
          projectCode: trip.projectCode || 'Unknown',
          estimatedCost: 0,
          accommodationType: trip.isAccommodationRequired ? 'Required' : 'None',
          requestDate: trip.outboundDepartureDate,
          departmentCode: currentUser.department,
          managerName: 'Unknown',
          reportingManager: 'Unknown',
          priority: 'Medium',
        }));
        setTravelRequests(mappedRequests);
      } else {
        toast.error("Could not load travel requests.");
      }
    } catch (error) {
      console.error('Error fetching travel requests:', error);
      toast.error("Failed to fetch travel requests.");
    }
  }, [user?.userId, user?.token, user?.userName, currentUser.department]);
 
  useEffect(() => {
    fetchTravelRequests();
  }, [fetchTravelRequests]);
 
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
        toast.error('Failed to load your documents.');
      } finally {
        setDocumentsLoading(false);
      }
    };
 
    fetchUserDocuments();
  }, []);

  // --- EVENT HANDLERS ---
  const handleRowClick = (item: TravelRequest) => navigate(`/manager/my-requests/${item.id}`);
 
  const handleEditClick = async (e: React.MouseEvent, request: TravelRequest) => {
    e.stopPropagation();
    if (!user?.token) {
      toast.error("Authentication error. Please log in again.");
      return;
    }
   
    setIsFetchingDetails(true);
    const loadingToast = toast.loading('Fetching request details...');
    try {
      const endpoint = `http://localhost:5030/api/TravelRequest/${request.id}`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
     
      toast.dismiss(loadingToast);
      if (response.data.isSuccess) {
        setSelectedRequestForEdit(response.data.result);
        setSelectedRequestIdForEdit(request.humanReadableId);
        setSelectedRequestStatus(request.status);
        setIsEditModalOpen(true);
      } else {
        console.error("Failed to fetch details:", response.data.errorMessages);
        toast.error(`Could not fetch details: ${response.data.errorMessages.join(', ')}`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error fetching detailed travel request:", error);
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data.message || 'A server error occurred.'
        : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsFetchingDetails(false);
    }
  };
 
  const handleUpdateRequest = async (updatedData: any) => {
      const humanReadableId = selectedRequestIdForEdit;
     
      if (!humanReadableId) {
          toast.error("Error: No request ID was found. Please try again.");
          return;
      }
      if (!user?.token) {
          toast.error("Authentication error. Please log in again.");
          return;
      }
 
      const endpoint = `http://localhost:5030/api/travelrequests/${humanReadableId}/edit`;
      
      const loadingToast = toast.loading('Updating request...');
      try {
        const response = await axios.post(endpoint, updatedData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`,
            },
        });
 
        toast.dismiss(loadingToast);
        if (response.status === 200 || response.status === 204) {
            toast.success('Travel request updated successfully!');
            setIsEditModalOpen(false);
            setSelectedRequestForEdit(null);
            setSelectedRequestIdForEdit(null);
            setSelectedRequestStatus(null);
            await fetchTravelRequests();
        } else {
            toast.error(`Update failed with status: ${response.status}`);
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error("Error updating travel request:", error);
       
        const errorMessage = (axios.isAxiosError(error) && error.response)
          ? error.response.data?.errorMessages?.join(', ') ||
            error.response.data?.message ||
            error.response.data?.title ||
            `Request failed with status: ${error.response.status}`
          : 'An unknown error occurred.';
         
        toast.error(`Update failed: ${errorMessage}`);
      }
  };
 
  const isEditDisabled = (status: string) => {
    const nonEditableStatuses = ['Returned', 'Closed', 'Cancelled', 'Rejected'];
    return nonEditableStatuses.includes(status);
  };
 
   const getDocumentDisplayInfo = (doc: Document) => {
    switch (doc.documentType) {
      case 'Visa':
        return {
          title: `Visa: ${doc.documentNumber || ''}`,
          subtitle: doc.issuingCountry ? `Country: ${doc.issuingCountry}` : '',
        };
      case 'Passport':
        return {
          title: `Passport: ${doc.documentNumber || ''}`,
          subtitle: doc.issuingCountry ? `Issued by: ${doc.issuingCountry}` : '',
        };
      case 'Aadhar':
        return {
          title: `Aadhar: ${doc.documentNumber || ''}`,
          subtitle: doc.fullName ? `Name: ${doc.fullName}` : '',
        };
      default:
        return {
          title: `${doc.documentType}: ${doc.documentNumber || ''}`,
          subtitle: '',
        };
    }
  };
 
 
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <User className="h-10 w-10 text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold">{currentUser.name}</h2>
            <p className="text-sm text-gray-500">{currentUser.role} | {currentUser.department}</p>
          </div>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button onClick={() => navigate('/manager/new-request')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">New Travel Request</button>
          <button onClick={() => navigate('/manager/documents')} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"><Upload className="h-4 w-4 inline mr-2" /> Upload Documents</button>
        </div>
      </div>
 
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-6">Active Travel Requests</h3>
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500 w-16">Edit</th><th className="text-left py-3 px-4 font-medium text-gray-500">Destination</th><th className="text-left py-3 px-4 font-medium text-gray-500">Travel Dates</th><th className="text-left py-3 px-4 font-medium text-gray-500">Purpose</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th><th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th></tr></thead>
              <tbody>
                {travelRequests.length > 0 ? travelRequests.map((trip) => (
                  <tr key={trip.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(trip)}>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => handleEditClick(e, trip)}
                        disabled={isEditDisabled(trip.status) || isFetchingDetails}
                        className={`p-2 rounded-md transition-colors ${isEditDisabled(trip.status) ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'}`}
                        title={isEditDisabled(trip.status) ? `Cannot edit a '${trip.status}' request` : 'Edit request'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4">{trip.destination}</td>
                    <td className="py-3 px-4">{trip.departureDate ? format(parseISO(trip.departureDate), 'MMM dd') : 'N/A'} - {trip.returnDate ? format(parseISO(trip.returnDate), 'MMM dd, yyyy') : 'N/A'}</td>
                    <td className="py-3 px-4">{trip.purpose}</td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>{trip.status}</span></td>
                    <td className="py-3 px-4 text-right"><button className="text-sm text-blue-600 hover:text-blue-800">View Details</button></td>
                  </tr>
                )) : <tr><td colSpan={6} className="text-gray-500 text-center py-10">No active requests found.</td></tr>}
              </tbody>
            </table>
        </div>
      </div>
     
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-6">Document Repository</h3>
        {documentsLoading ? <p>Loading documents...</p> : documentsError ? <p className='text-red-500'>{documentsError}</p> : userDocuments && userDocuments.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDocuments.documents.map((doc) => {
              const displayInfo = getDocumentDisplayInfo(doc);
              const daysUntilExpiry = doc.expiryDate ? differenceInDays(parseISO(doc.expiryDate), new Date()) : null;
              return (
                <div key={doc.id} className="border rounded-lg p-4 flex items-start space-x-3 hover:shadow-md hover:border-blue-500 cursor-pointer" onClick={() => setSelectedDocForPreview(doc)}>
                  <FileText className="h-6 w-6 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{displayInfo.title}</p>
                    {displayInfo.subtitle && <p className="text-sm text-gray-500">{displayInfo.subtitle}</p>}
                    {doc.expiryDate && <p className={`text-sm ${daysUntilExpiry !== null && daysUntilExpiry <= 30 ? 'text-red-600' : 'text-gray-500'}`}>Expires: {format(parseISO(doc.expiryDate), 'MMM dd, yyyy')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500 text-center py-6">No documents uploaded.</p>}
      </div>
 
      <div className="card bg-white shadow-sm p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Travel Policy</h3>
        <a href="https://experiontechnologies.sharepoint.com/..." className="text-blue-600 hover:text-blue-800 flex items-center space-x-2" target='_blank' rel="noopener noreferrer"><FileText className="h-5 w-5" /><span>Experion Travel Policy</span></a>
      </div>
 
      {/* RENDER MODALS */}
      <EditTravelRequestModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRequestStatus(null);
        }}
        request={selectedRequestForEdit}
        onUpdate={handleUpdateRequest}
        status={selectedRequestStatus}
      />
     
      {selectedDocForPreview && (
         <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDocForPreview(null)}>
          <div className="relative bg-white rounded-lg p-3 max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 p-1 bg-white rounded-full shadow-md text-gray-800 hover:text-red-500 z-10" onClick={() => setSelectedDocForPreview(null)} aria-label="Close preview"><X className="w-6 h-6" /></button>
            <div className="pt-8 h-full">
              {selectedDocForPreview.documentUrl.toLowerCase().endsWith('.pdf') ?
                <iframe src={`${selectedDocForPreview.documentUrl}#view=FitH`} title={`${selectedDocForPreview.documentType} Preview`} className="w-full rounded" style={{ height: 'calc(90vh - 4rem)' }} /> :
                <img src={selectedDocForPreview.documentUrl} alt={`${selectedDocForPreview.documentType} Preview`} className="max-w-full max-h-[calc(90vh-4rem)] object-contain mx-auto" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default EmployeeDashboard;