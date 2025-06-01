import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  FileText,
  ChevronLeft,
  Download,
  MessageSquare,
  Lock
} from 'lucide-react';
import { mockTravelRequests, TravelRequest, getStatusColor } from '../../data/mockData';
// import TravelRequestInfo from './TravelRequestInfo';
import ApprovalTimeline from './ApprovalTimeline';
import TravelInfo from './TravelInfo';
import TicketComponent from './ticket_options/TicketOptionsComponent';
import TravelInfoBanner from './TravelInfoBanner';
import { useModal } from './confirmation_modal/hooks/useModal';
import ConfirmationModal from './confirmation_modal/ConfirmationModal';

const TravelRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOpen, title, content, buttons, openModal, closeModal } = useModal();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // const user = { role: 'employee' }; // This would come from your auth context
  const userString = localStorage.getItem('user');
  let role = ''

  if (userString) {
    const user = JSON.parse(userString);
    role = user.role;

      console.log('User role:', role);
  } else {
      console.log('No user found in localStorage.');
  }

  const travelRequest = mockTravelRequests.find(request => request.id === id) as TravelRequest;

  if (!travelRequest) {
    return (
      <div className="card my-8 p-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Travel Request Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The travel request you're looking for could not be found.
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate('/travel-requests')}
        >
          Back to Travel Requests
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  const handleDownloadDocuments = () => {
    console.log('Downloading documents for request:', id);
  };

  const handleFeedbackSubmit = () => {
    openModal(
      <div className="space-y-4">
        <textarea
          className="w-full p-2 border rounded" 
          placeholder="Enter your feedback..."
          rows={4}
        />
      </div>,
      () => {
        console.log('Feedback submitted');
        setFeedbackSubmitted(true);
      },
      'Submit Feedback',
      'Send',
    );
  };

  const handleCloseRequest = () => {
    openModal(
      <p>Are you sure you want to close this travel request?</p>,
      () => {
        console.log('Request closed');
        // In a real app, you would update the mock data or make an API call
      },
      'Confirm Request Closure'
    );
  };

  const statusColor = getStatusColor(travelRequest.status);
  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';

  // Conditions for showing feedback button
  const showFeedbackButton = isEmployee && 
    (travelRequest.status === 'Returned') &&
    !feedbackSubmitted;

  // Conditions for showing close request button
  const showCloseRequestButton = isAdmin && 
    travelRequest.status === 'Returned' && 
    feedbackSubmitted;

  return (
    <div className="space-y-6 animate-fadeIn">
      <ConfirmationModal
        isOpen={isOpen}
        title={title}
        content={content}
        onClose={closeModal}
        buttons={buttons}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-3 flex-wrap">
              {travelRequest.id}
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor}`}>
                {travelRequest.status}
              </span>
            </h2>
            <p className="text-muted-foreground">
              {travelRequest.destination} • {formatDate(travelRequest.departureDate)} to {formatDate(travelRequest.returnDate)}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button 
            className="btn-accent flex items-center"
            onClick={handleDownloadDocuments}
          >
            <Download className="h-4 w-4 mr-2" />
            Travel Docs
          </button>

          {showFeedbackButton && (
            <button 
              className="btn-secondary flex items-center"
              onClick={handleFeedbackSubmit}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Feedback
            </button>
          )}

          {showCloseRequestButton && (
            <button 
              className="btn-primary flex items-center"
              onClick={handleCloseRequest}
            >
              <Lock className="h-4 w-4 mr-2" />
              Finalize Request
            </button>
          )}

          {isManager && travelRequest.status === 'Pending' && (
            <>
              <button className="btn-primary flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button className="btn-secondary flex items-center">
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
            </>
          )}
          
          <button className="btn-accent flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Travel Info Banner */}
      <div>
        <TravelInfoBanner travelRequest={travelRequest} />
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1 space-y-6">
          {/* <TravelRequestInfo
            travelRequest={travelRequest}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          /> */}
          
          <TravelInfo travelRequest={travelRequest} />
          
          <TicketComponent travelRequest={travelRequest} />
        </div>

        <div className="w-full lg:w-[450px] flex flex-col">
          <div className="flex-grow">
            <ApprovalTimeline travelRequest={travelRequest} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelRequestDetails;