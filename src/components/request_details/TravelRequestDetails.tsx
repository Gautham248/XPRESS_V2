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
  const [, setApproveComment] = useState('');
  const [, setRejectComment] = useState('');
  const [actionTaken, setActionTaken] = useState(false);
  const [requestClosed, setRequestClosed] = useState(false);

  const userString = localStorage.getItem('user');
  let role = ''

  if (userString) {
    const user = JSON.parse(userString);
    role = user.role;
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
    let feedbackText = '';

    openModal(
      <div className="space-y-4">
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Enter your feedback..."
          rows={4}
          onChange={(e) => feedbackText = e.target.value}
        />
      </div>,
      () => {
        console.log('Feedback submitted:', feedbackText);
        setFeedbackSubmitted(true);
      },
      'Submit Feedback',
      'Send',
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
          className="w-full p-2 border rounded"
          placeholder="Closing remarks (optional)..."
          rows={4}
          onChange={(e) => closingRemarks = e.target.value}
        />
      </div>,
      () => {
        console.log('Request Closed with remarks:', closingRemarks);
        setRequestClosed(true);
        travelRequest.status = 'Closed';
      },
      'Finalize request',
      'Confirm',
    );
  };

  const handleApproveSubmit = () => {
    let comment = '';

    openModal(
      <div className="space-y-4">
        <textarea
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add approval comments (optional)"
          rows={4}
          onChange={(e) => comment = e.target.value}
        />
      </div>,
      () => {
        // API call for approval using PUT method
        fetch(`http://localhost:5030/api/Approvals/${id}/manager/approve`, {
          method: 'PUT', // Changed to PUT
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approvingUserId: 4, // Hardcoded as 4 for now
            comments: comment
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Approval failed');
            }
            return response.json();
          })
          .then(data => {
            console.log('Request approved with comment:', comment);
            setActionTaken(true);
            setApproveComment('');
            travelRequest.status = 'Approved';
          })
          .catch(error => {
            console.error('Error approving request:', error);
            alert('Failed to approve request. Please try again.');
          });
      },
      'Approve Travel Request',
      'Confirm Approval'
    );
  };

  const handleRejectSubmit = () => {
    let comment = '';

    openModal(
      <div className="space-y-4">
        <textarea
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add rejection reason (required)"
          rows={4}
          onChange={(e) => comment = e.target.value}
        />
      </div>,
      () => {
        if (!comment.trim()) {
          alert('Please provide a rejection reason');
          return;
        }

        // API call for rejection using PUT method
        fetch(`http://localhost:5030/api/Approvals/${id}/manager/reject`, {
          method: 'PUT', // Changed to PUT
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rejectingUserId: 4, // Hardcoded as 4 for now
            comments: comment
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Rejection failed');
            }
            return response.json();
          })
          .then(data => {
            console.log('Request rejected with reason:', comment);
            setActionTaken(true);
            setRejectComment('');
            travelRequest.status = 'Rejected';
          })
          .catch(error => {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request. Please try again.');
          });
      },
      'Reject Travel Request',
      'Confirm Rejection'
    );
  };

  const statusColor = getStatusColor(travelRequest.status);
  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';

  const showFeedbackButton = isEmployee &&
    (travelRequest.status === 'Returned') &&
    !feedbackSubmitted;

  const showCloseRequestButton = isAdmin &&
    travelRequest.status === 'Returned' &&
    !requestClosed;

  const showManagerActionButtons = isManager &&
    travelRequest.status === 'PendingReview' &&
    !actionTaken;

  return (
    <div className="space-y-6 animate-fadeIn">
      <ConfirmationModal
        isOpen={isOpen}
        title={title}
        content={content}
        onClose={closeModal}
        buttons={buttons}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-medium px-3 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
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

          {showCloseRequestButton && (
            <button
              className="btn-secondary flex items-center"
              onClick={handleCloseRequest}
            >
              <Lock className="h-4 w-4 mr-2" />
              Finalize Request
            </button>
          )}

          {showFeedbackButton && (
            <button
              className="btn-secondary flex items-center"
              onClick={handleFeedbackSubmit}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Feedback
            </button>
          )}

          <button
            className="btn-primary flex items-center"
            onClick={handleDownloadDocuments}
          >
            <Download className="h-4 w-4 mr-2" />
            Travel Docs
          </button>

          {showManagerActionButtons && (
            <>
              <button
                className="btn-primary flex items-center"
                onClick={handleApproveSubmit}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button
                className="btn-secondary flex items-center"
                onClick={handleRejectSubmit}
              >
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

      <div>
        <TravelInfoBanner requestId={id} />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1 space-y-6">
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