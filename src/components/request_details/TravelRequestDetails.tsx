import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import {
  Check,
  X,
  FileText,
  ChevronLeft,
  Download,
  MessageSquare,
  Lock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ApprovalTimeline from './ApprovalTimeline';
import TravelInfo from './TravelInfo';
import TicketComponent from './ticket_options/TicketOptionsComponent';
import TravelInfoBanner from './TravelInfoBanner';
import { useModal } from './confirmation_modal/hooks/useModal';
import ConfirmationModal from './confirmation_modal/ConfirmationModal';

export interface ComponentTravelRequest {
  id: string;
  outboundDepartureDate: string;
  returnDepartureDate: string;
  outboundArrivalDate?: string;
  returnArrivalDate?: string;
  purpose: string;
  submissionDate: string;
  transportation?: string;
  destination?: string;
  sourcePlace?: string;
  sourceCountry?: string;
  destinationCountry?: string;
  isAccommodationRequired?: boolean;
  isPickUpRequired?: boolean;
  isDropOffRequired?: boolean;
  pickupPlace?: string;
  dropoffPlace?: string;
  comments?: string;
  isVegetarian?: boolean;
  attendedCct?: boolean;
  travelAgencyName?: string;
  totalExpense?: number;
  uploadedTicketPdfPath?: string;
  updatedAt?: string;
  employeeName?: string;
  isInternational?: boolean;
  isRoundTrip?: boolean;
  projectName?: string;
  selectedTicketOptionId?: number;
  createdAt?: string;
  currentStatusId: number;
  status: 'PendingReview' | 'Verified' | 'OptionsListed' | 'OptionSelected' | 
           'DUApproved' | 'BUApproved' | 'TicketsDispatched' | 'InTransit' | 
           'Returned' | 'Closed' | 'Cancelled' | 'Rejected' | 'Modified';
}

export const STATUS_ORDER_ARRAY: ReadonlyArray<ComponentTravelRequest['status']> = [
  'PendingReview',     // Index 0
  'Verified',          // Index 1
  'OptionsListed',     // Index 2
  'OptionSelected',   // Index 3
  'DUApproved',        // Index 4
  'BUApproved',        // Index 5
  'TicketsDispatched', // Index 6
  'InTransit',         // Index 7
  'Returned',          // Index 8
  'Closed',            // Index 9
  'Cancelled',         // Index 10
  'Rejected',          // Index 11
  'Modified'           // Index 12
] as const;

// Map from index (status ID) to status name
export const INDEX_TO_STATUS_MAP: Readonly<Record<number, ComponentTravelRequest['status']>> = 
  STATUS_ORDER_ARRAY.reduce((acc, status, index) => {
    const statusId = index + 1;
    acc[statusId] = status;
    return acc;
  }, {} as Record<number, ComponentTravelRequest['status']>);

// Map from status name to index (status ID)
export const STATUS_TO_INDEX_MAP: Readonly<Record<ComponentTravelRequest['status'], number>> = 
  STATUS_ORDER_ARRAY.reduce((acc, status, index) => {
    acc[status] = index + 1;
    return acc;
  }, {} as Record<ComponentTravelRequest['status'], number>);

const STATUS_DISPLAY_NAMES_HEADER: Record<ComponentTravelRequest['status'] | string, string> = {
  PendingReview: 'Pending Review',
  Verified: 'Verified',
  OptionsListed: 'Options Listed',
  OptionSelected: 'Option Selected',
  DUApproved: 'DU Approved',
  BUApproved: 'BU Approved',
  TicketsDispatched: 'Ticket Dispatched',
  InTransit: 'In Transit',
  Returned: 'Returned',
  Closed: 'Closed',
  Cancelled: 'Cancelled',
  Rejected: 'Rejected',
  Modified: 'Modified',
};

const getDisplayStatusName = (rawStatus?: ComponentTravelRequest['status'] | string): string => {
  if (rawStatus && typeof rawStatus === 'string') {
    return STATUS_DISPLAY_NAMES_HEADER[rawStatus] || rawStatus.replace(/([A-Z])/g, ' $1').trim();
  }
  return 'Status Unknown';
};

const getStatusBadgeStyles = (status?: ComponentTravelRequest['status'] | string): string => {
  if (status && typeof status === 'string') {
    switch (status) {
      case 'PendingReview':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Verified':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'OptionsListed':
        return 'bg-indigo-100 text-indigo-700 border border-indigo-300';
      case 'OptionSelected':
        return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'DUApproved':
      case 'BUApproved':
        return 'bg-teal-100 text-teal-700 border border-teal-300';
      case 'TicketsDispatched':
        return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
      case 'InTransit':
        return 'bg-sky-100 text-sky-700 border border-sky-300';
      case 'Returned':
        return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'Closed':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-700 border border-gray-300';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'Modified':
        return 'bg-pink-100 text-pink-700 border border-pink-300';
      default:
        return 'bg-gray-200 text-gray-800 border border-gray-400';
    }
  }
  return 'bg-gray-200 text-gray-800 border border-gray-400'; // Fallback
};

const TravelRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOpen, title, content, buttons, openModal, closeModal } = useModal();

  const [travelRequestData, setTravelRequestData] = useState<ComponentTravelRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [actionTaken, setActionTaken] = useState(false);


  const [requestClosed, setRequestClosed] = useState(false);

  const userString = localStorage.getItem('user');
  let role = '';
  let userId: number | undefined = undefined;
  let currentUser: any = null;

  if (userString) {
    const user = JSON.parse(userString);
    role = user.role;
    userId = parseInt(user.userId, 10);
    currentUser = user;
  }

  const fetchTravelRequest = useCallback(async () => {
    if (!id) {
      setError("Travel Request ID is missing.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5030/api/TravelRequest/${id}`);
      if (!response.ok) {
        let errorMsg = `Failed to fetch travel request: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.errorMessages?.join(', ') || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      const apiData = data.result; 

      if (data.isSuccess && apiData) {
        const statusName = INDEX_TO_STATUS_MAP[apiData.currentStatusId] || 'PendingReview';
        
        setTravelRequestData({
          id: apiData.requestId,
          outboundDepartureDate: apiData.outboundDepartureDate,
          returnDepartureDate: apiData.returnDepartureDate,
          purpose: apiData.purposeOfTravel,
          submissionDate: apiData.createdAt,
          transportation: apiData.travelModeName,
          destination: apiData.destinationPlace,
          sourcePlace: apiData.sourcePlace,
          sourceCountry: apiData.sourceCountry,
          destinationCountry: apiData.destinationCountry,
          outboundArrivalDate: apiData.outboundArrivalDate,
          returnArrivalDate: apiData.returnArrivalDate,
          isAccommodationRequired: apiData.isAccommodationRequired,
          isPickUpRequired: apiData.isPickupRequired,
          isDropOffRequired: apiData.isDropoffRequired,
          pickupPlace: apiData.pickupPlace,
          dropoffPlace: apiData.dropoffPlace,
          comments: apiData.comments,
          isVegetarian: apiData.isVegetarian,
          attendedCct: apiData.attendedCct,
          travelAgencyName: apiData.travelAgencyName,
          totalExpense: apiData.totalExpense,
          uploadedTicketPdfPath: apiData.uploadedTicketPdfPath,
          updatedAt: apiData.updatedAt,
          employeeName: apiData.employeeName,
          isInternational: apiData.isInternational,
          isRoundTrip: apiData.isRoundTrip,
          projectName: apiData.projectName,
          selectedTicketOptionId: apiData.selectedTicketOptionId,
          createdAt: apiData.createdAt,
          currentStatusId: apiData.currentStatusId,
          status: statusName
        });
      } else {
        throw new Error(data.errorMessages?.join(', ') || 'Travel request data not found or invalid format.');
      }
    } catch (err) {
      console.error('Error fetching travel request:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTravelRequest();
  }, [fetchTravelRequest]);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB');
  };

  const handleDownloadDocuments = () => {
    if (travelRequestData?.uploadedTicketPdfPath) {
      window.open(travelRequestData.uploadedTicketPdfPath, '_blank');
    } else {
      alert('No document path available for download.');
    }
  };

  const handleFeedbackSubmit = () => {
    let feedbackText = '';
    openModal(
      <div className="space-y-4">
        <textarea className="w-full p-2 border rounded" placeholder="Enter your feedback..." rows={4} onChange={(e) => feedbackText = e.target.value} />
      </div>,
      async () => {
        try {
          const response = await fetch(`http://localhost:5030/api/TravelRequest/${id}/travelfeedback`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedbackText, submittingUserId: userId }),
          });
          if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
          setFeedbackSubmitted(true);
          closeModal();
        } catch (error) {
          console.error('Failed to submit feedback:', error);
        }
      }, 'Submit Feedback', 'Send'
    );
  };

  const handleCloseRequest = () => { 
    let closingRemarks = '';
    openModal(
      <div className="space-y-4">
        <p className="text-red-600 mb-3 italic">
          This will mark the travel request as closed and finalized. This action cannot be undone.
        </p>
        <textarea
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
          placeholder="Closing remarks (optional)..."
          rows={4}
          onChange={(e) => closingRemarks = e.target.value}
        />
      </div>,
      async () => {
        if (!currentUser || !id) {
            setError("Cannot close request: User or Request ID is missing.");
            return;
        }

        const CLOSED_STATUS_ID = 10;
        const payload = {
          requestId: id,
          newStatusId: CLOSED_STATUS_ID,
          userId: parseInt(currentUser.userId, 10),
          comments: closingRemarks,
          actionType: "CloseRequest"
        };
        
        try {
            const response = await axios.put(`http://localhost:5030/api/TravelRequest/${id}/updatestatus`, payload);

            if (response.data.isSuccess) {
                setRequestClosed(true);
                alert('Request closed successfully!');
                // await fetchTravelRequest();
                closeModal();
            } else {
                setError(response.data.errorMessages?.join(', ') || 'Failed to close the request.');
            }
        } catch (err) {
            console.error('Error closing request:', err);
            setError(axios.isAxiosError(err) ? err.message : 'An unexpected error occurred.');
        }
      },
      'Finalize request',
      'Confirm'
    );
  };

  const handleApproveSubmit = async () => {
    if (!userId) return;
    let comment = '';
    openModal(
      <div className="space-y-4">
        <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add approval comments (optional)" rows={4} onChange={(e) => comment = e.target.value}/>
      </div>,
      async () => {
        try {
          const response = await fetch(`http://localhost:5030/api/Approvals/${id}/manager/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approvingUserId: userId, comments: comment })
          });
          const responseData = await response.json();
          if (!response.ok || !responseData.isSuccess) throw new Error(responseData.errorMessages?.join(', ') || 'Approval failed');
          setActionTaken(true);
          await fetchTravelRequest();
          closeModal();
        } catch (error) {
          alert(`Failed to approve request: ${error instanceof Error ? error.message : String(error)}`);
        }
      }, 'Approve Travel Request', 'Confirm Approval'
    );
  };

  const handleRejectSubmit = async () => {
    if (!userId) return;
    let comment = '';
    openModal(
      <div className="space-y-4">
        <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add rejection reason (required)" rows={4} onChange={(e) => comment = e.target.value} />
      </div>,
      async () => {
        if (!comment.trim()) { alert('Please provide a rejection reason'); return; }
        try {
          const response = await fetch(`http://localhost:5030/api/Approvals/${id}/manager/reject`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rejectingUserId: userId, comments: comment })
          });
          const responseData = await response.json();
          if (!response.ok || !responseData.isSuccess) throw new Error(responseData.errorMessages?.join(', ') || 'Rejection failed');
          setActionTaken(true);
          await fetchTravelRequest();
          closeModal();
        } catch (error) {
          alert(`Failed to reject request: ${error instanceof Error ? error.message : String(error)}`);
        }
      }, 'Reject Travel Request', 'Confirm Rejection'
    );
  };

  if (isLoading) { 
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg">Loading travel request details...</p>
      </div>
    );
  }
  if (error) { 
    return (
      <div className="card my-8 p-8 text-center bg-red-50 border-red-200">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-red-700">Error Loading Request</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button className="btn-primary" onClick={() => navigate('/travel-requests')}>Back to Travel Requests</button>
      </div>
    );
  }
  if (!travelRequestData) { 
    return (
      <div className="card my-8 p-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Travel Request Not Found</h3>
        <button className="btn-primary" onClick={() => navigate('/travel-requests')}>Back to Travel Requests</button>
      </div>
    );
  }

  const statusBadgeClasses = getStatusBadgeStyles(travelRequestData.status);
  const displayStatusName = getDisplayStatusName(travelRequestData.status);

  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';

  const showFeedbackButton = isEmployee && travelRequestData.status === 'Returned' && !feedbackSubmitted;
  const showCloseRequestButton = isAdmin && travelRequestData.status === 'Returned' && !requestClosed;
  const showManagerActionButtons = isManager && travelRequestData.status === 'PendingReview' && !actionTaken;

  return (
    <div className="space-y-6 animate-fadeIn">
      <ConfirmationModal isOpen={isOpen} title={title} content={content} onClose={closeModal} buttons={buttons} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors" aria-label="Go back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 flex-wrap">
              {travelRequestData.id}
              {travelRequestData.status && (<span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${statusBadgeClasses}`}>{displayStatusName}</span>)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {travelRequestData.destination || travelRequestData.purpose} • {formatDate(travelRequestData.outboundDepartureDate)} to {formatDate(travelRequestData.returnArrivalDate || travelRequestData.returnDepartureDate)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 md:ml-auto">
          {showCloseRequestButton && ( 
            <button className="btn-secondary flex items-center" onClick={handleCloseRequest}>
              <Lock className="h-4 w-4 mr-2" />
              Finalize Request
            </button>
          )}
          {showFeedbackButton && ( 
            <button className="btn-secondary flex items-center" onClick={handleFeedbackSubmit}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Feedback
            </button>
          )}
          {showManagerActionButtons && ( 
            <>
              <button className="bg-secondary rounded-md px-4 text-white flex items-center" onClick={handleApproveSubmit}><Check className="h-4 w-4 mr-2" />Approve</button>
              <button className="bg-red-600 rounded-md px-4 text-white flex items-center" onClick={handleRejectSubmit}><X className="h-4 w-4 mr-2" />Reject</button>
            </>
          )}
          <button className="btn-primary flex items-center" onClick={handleDownloadDocuments} disabled={!travelRequestData.uploadedTicketPdfPath}>
            <Download className="h-4 w-4 mr-2" />
            Travel Docs
          </button>
          <button className="btn-accent flex items-center"><FileText className="h-4 w-4 mr-2" />Export</button>
        </div>
      </div>

      {id && <TravelInfoBanner requestId={id} />} 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {id && <TravelInfo requestId={id} />}
          {id && <TicketComponent requestId={id} />}
        </div>
        <div className="lg:col-span-1">
          {id && <ApprovalTimeline requestId={id} />}
        </div>
      </div>
    </div>
  );
};

export default TravelRequestDetails;