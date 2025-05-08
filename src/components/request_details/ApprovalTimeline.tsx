import React from 'react';
import { 
  Check, 
  Clock, 
  X 
} from 'lucide-react';
import { TravelRequest } from '../../data/mockData';

interface ApprovalTimelineProps {
  travelRequest: TravelRequest;
}

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ travelRequest }) => {
  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-6">Approval Timeline</h3>
      
      <div className="space-y-6">
        <div className="flex">
          <div className="mr-4 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white">
              <Check className="h-4 w-4" />
            </div>
            <div className="w-0.5 h-full bg-border mt-2"></div>
          </div>
          <div>
            <p className="font-medium">Request Submitted</p>
            <p className="text-sm text-muted-foreground mb-1">{travelRequest.requestDate}</p>
            <p className="text-sm">{travelRequest.travelerName} submitted travel request</p>
          </div>
        </div>
        
        {travelRequest.status === 'Pending' ? (
          <div className="flex">
            <div className="mr-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="font-medium">Awaiting Approval</p>
              <p className="text-sm text-muted-foreground mb-1">Now</p>
              <p className="text-sm">Pending manager approval</p>
            </div>
          </div>
        ) : travelRequest.status === 'Approved' ? (
          <div className="flex">
            <div className="mr-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white">
                <Check className="h-4 w-4" />
              </div>
              <div className="w-0.5 h-full bg-border mt-2"></div>
            </div>
            <div>
              <p className="font-medium">Request Approved</p>
              <p className="text-sm text-muted-foreground mb-1">2023-06-05</p>
              <p className="text-sm">{travelRequest.managerName} approved the request</p>
            </div>
          </div>
        ) : travelRequest.status === 'Completed' ? (
          <div className="flex">
            <div className="mr-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white">
                <Check className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="font-medium">Travel Completed</p>
              <p className="text-sm text-muted-foreground mb-1">{travelRequest.returnDate}</p>
              <p className="text-sm">Travel completed successfully</p>
            </div>
          </div>
        ) : (
          <div className="flex">
            <div className="mr-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center text-white">
                <X className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="font-medium">Request Rejected</p>
              <p className="text-sm text-muted-foreground mb-1">2023-06-17</p>
              <p className="text-sm">{travelRequest.managerName} rejected the request</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalTimeline;