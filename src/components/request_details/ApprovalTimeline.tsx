import React, { useState } from 'react';
import {
  Check,
  Clock,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { TravelRequest } from '../../data/mockData';
import TimelineModal from './TimelineModal';
 
interface ApprovalTimelineProps {
  travelRequest: TravelRequest;
}
 
const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ travelRequest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  // Default timeline if no timeline field is provided
  const defaultTimeline = [
    {
      id: '1',
      status: 'Request Submitted',
      date: travelRequest.requestDate,
      description: `${travelRequest.travelerName} submitted travel request`,
      completed: true,
    },
    ...(travelRequest.status === 'Pending'
      ? [
          {
            id: '2',
            status: 'Awaiting Approval',
            date: 'Now',
            description: 'Pending manager approval',
            completed: false,
            active: true,
          },
        ]
      : travelRequest.status === 'Rejected'
      ? [
          {
            id: '2',
            status: 'Request Rejected',
            date: format(new Date(), 'dd-MM-yyyy HH:mm'), // Current date as fallback
            description: `${travelRequest.managerName} rejected the request`,
            completed: false,
            rejected: true,
          },
        ]
      : travelRequest.status === 'Closed' || travelRequest.status === 'Completed' || travelRequest.status === 'Returned'
      ? [
          {
            id: '2',
            status: 'Request Approved',
            date: format(new Date(), 'dd-MM-yyyy HH:mm'), // Fallback date
            description: `${travelRequest.managerName} approved the request`,
            completed: true,
          },
          {
            id: '3',
            status: 'Travel Completed',
            date: travelRequest.returnDate,
            description: 'Travel completed successfully',
            completed: true,
          },
        ]
      : [
          {
            id: '2',
            status: travelRequest.status,
            date: format(new Date(), 'dd-MM-yyyy HH:mm'), // Fallback date
            description: `${travelRequest.managerName} updated the request`,
            completed: true,
          },
        ]),
  ];
 
  // Use the timeline field if available, otherwise fall back to default
  const timeline = travelRequest.timeline
    ? travelRequest.timeline.map((event, _index) => ({
        id: event.id,
        status: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        date: format(new Date(event.date), 'dd-MM-yyyy HH:mm'),
        description: event.description,
        completed: event.type !== 'submission' || travelRequest.status !== 'Pending',
        active: event.type === 'submission' && travelRequest.status === 'Pending',
        rejected: event.type === 'rejection',
      }))
    : defaultTimeline;
 
  // Show only the first 2 steps in the preview
  const previewTimeline = timeline.slice(0, 2);
 
  return (
    <div className="card mb-6 p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6">Approval Timeline</h3>
 
      <div className="space-y-6">
        {previewTimeline.map((step, index) => (
          <div key={step.id} className="flex items-start relative">
            {/* Connector Line */}
            {index < previewTimeline.length - 1 && (
              <div
                className={`absolute left-[1rem] top-[2rem] w-0.5 h-[calc(100%-1rem)] ${
                  step.rejected
                    ? 'bg-red-200'
                    : step.completed
                    ? 'bg-green-200'
                    : 'bg-gray-200'
                }`}
              />
            )}
            {/* Circle Indicator */}
            <div
              className={`mr-4 flex flex-col items-center w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                step.rejected
                  ? 'bg-red-100 text-red-600'
                  : step.active
                  ? 'bg-purple-100 text-purple-500'
                  : step.completed
                  ? 'bg-green-100 text-green-500'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.rejected ? (
                <X className="h-4 w-4" />
              ) : step.active ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </div>
            {/* Status and Description */}
            <div>
              <p
                className={`font-medium ${
                  step.rejected
                    ? 'text-red-600'
                    : step.active
                    ? 'text-purple-600'
                    : step.completed
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {step.status}
              </p>
              <p
                className={`text-sm ${
                  step.rejected
                    ? 'text-red-500'
                    : step.active
                    ? 'text-purple-500'
                    : step.completed
                    ? 'text-gray-500'
                    : 'text-gray-400'
                }`}
              >
                {step.date}
              </p>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
 
      {/* View More Button - Always shown */}
      <div className="mt-4">
        <button
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => setIsModalOpen(true)}
        >
          View More
        </button>
      </div>
 
      {/* Modal for Full Timeline */}
      {isModalOpen && (
        <TimelineModal
          timeline={timeline}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
 
export default ApprovalTimeline;