import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  FileText
} from 'lucide-react';
import { mockTravelRequests, TravelRequest } from '../../data/mockData';
import TravelRequestInfo from './TravelRequestInfo';
import ApprovalTimeline from './ApprovalTimeline';
import TravelInfo from './TravelInfo';
import TicketComponent from './ticket_options/TicketOptionsComponent';
import TravelInfoBanner from './TravelInfoBanner';
 
const TravelRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
 
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
 
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-success/20 text-success';
      case 'Pending':
        return 'bg-warning/20 text-warning';
      case 'Rejected':
        return 'bg-error/20 text-error';
      case 'Completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
 
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-error/20 text-error';
      case 'Medium':
        return 'bg-warning/20 text-warning';
      case 'Low':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
 
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          {/* <button
            className="mr-4 p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => navigate('/travel-requests')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button> */}
          <div>
            <h2 className="text-2xl font-semibold">
              {travelRequest.id} - {travelRequest.purpose}
            </h2>
            <p className="text-muted-foreground">
              {travelRequest.destination} • {travelRequest.departureDate} to {travelRequest.returnDate}
            </p>
          </div>
        </div>
       
        <div className="flex space-x-3">
          {travelRequest.status === 'Pending' && (
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

      <div>
        <TravelInfoBanner travelRequest={travelRequest} />
      </div>
     
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 h-auto">
        <div className="lg:col-span-1 space-y-6">
          <TravelRequestInfo
            travelRequest={travelRequest}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
         
          <TravelInfo travelRequest={travelRequest} />
        </div>
       
        <div className="lg:col-span-1 space-y-6">
          <ApprovalTimeline travelRequest={travelRequest} />
 
          <TicketComponent travelRequest={travelRequest} />
        </div>
      </div>
 
     
    </div>
  );
};
 
export default TravelRequestDetails;