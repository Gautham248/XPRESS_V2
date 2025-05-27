import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { TravelRequest } from '../../data/mockData';
import { TimelineStep } from './TimelineModal';

interface ApprovalTimelineProps {
  travelRequest: TravelRequest;
}

export const REQUEST_STATUSES = [
  'Pending',
  'Manager Approved',
  'Tickets Selected',
  'DU Head Approved',
  'Tickets Dispatched',
  'In-transit',
  'Returned',
  'Closed'
] as const;

const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ travelRequest }) => {

  const isRejected = travelRequest.status === 'Rejected' ||
    (travelRequest.timeline && travelRequest.timeline.some(event => event.type === 'Rejected'));

  const getLatestCompletedIndex = () => {
    if (isRejected) return -1;

    // If we have a timeline, use that to determine progress
    if (travelRequest.timeline) {
      let lastCompletedIndex = -1;

      travelRequest.timeline.forEach(event => {
        if (event.type === 'Modified') return; // Skip Modified events

        const statusIndex = REQUEST_STATUSES.indexOf(event.type as any);
        if (statusIndex > lastCompletedIndex) {
          lastCompletedIndex = statusIndex;
        }
      });

      return lastCompletedIndex;
    }

    const statusIndex = REQUEST_STATUSES.indexOf(travelRequest.status as any);
    return statusIndex !== -1 ? statusIndex : 0;
  };

  const latestCompletedIndex = getLatestCompletedIndex();
  const isFullyCompleted = latestCompletedIndex === REQUEST_STATUSES.length - 1;

  // Determine active request status
  const activeRequestStatus = isRejected || isFullyCompleted
    ? null
    : REQUEST_STATUSES[latestCompletedIndex + 1];

  // Determine incomplete request status
  // const incompleteRequestStatuses = isRejected || isFullyCompleted
  //   ? []
  //   : activeRequestStatus
  //     ? REQUEST_STATUSES.slice(latestCompletedIndex + 2)
  //     : REQUEST_STATUSES.slice(latestCompletedIndex + 1);

  const defaultTimeline: TimelineStep[] = [
    {
      id: '1',
      status: 'Request Submitted',
      date: travelRequest.requestDate,
      description: `${travelRequest.travelerName} submitted travel request`,
      completed: true,
    },
    ...(isRejected
      ? [
        {
          id: '2',
          status: 'Request Rejected',
          date: format(new Date(), 'dd-MM-yyyy HH:mm'),
          description: `${travelRequest.managerName} rejected the request`,
          completed: false,
          rejected: true,
        },
      ]
      : REQUEST_STATUSES.map((status, index) => ({
        id: `${index + 2}`,
        status: status === 'Pending' ? 'Awaiting Approval' : status,
        date: index <= latestCompletedIndex
          ? format(new Date(), 'dd-MM-yyyy HH:mm')
          : 'Pending',
        description: index <= latestCompletedIndex
          ? `${travelRequest.managerName} ${status.toLowerCase()} the request`
          : `Pending ${status.toLowerCase()}`,
        completed: index <= latestCompletedIndex,
        active: index === latestCompletedIndex + 1,
      })).filter(item =>
        item.completed || item.active ||
        (latestCompletedIndex === REQUEST_STATUSES.length - 1 && item.status === 'Travel Completed')
      )
    ),
  ];

  // Process timeline data with proper active status marking
  const processedTimeline = travelRequest.timeline
    ? travelRequest.timeline.map((event, index) => {
      const isModified = event.type === 'Modified';
      const statusIndex = isModified ? -1 : REQUEST_STATUSES.indexOf(event.type as any);
      const isCompleted = isModified
        ? false
        : statusIndex <= latestCompletedIndex;
      const isActive = !isModified && statusIndex === latestCompletedIndex + 1;

      return {
        id: event.id || `event-${index}`,
        status: event.type.charAt(0).toUpperCase() + event.type.slice(1),
        date: format(new Date(event.date), 'dd-MM-yyyy HH:mm'),
        description: event.description,
        completed: isCompleted,
        active: isActive,
        rejected: event.type === 'Rejected',
        isModified,
      };
    })
    : defaultTimeline;

  // Show only the first 2 steps in the preview
  let previewTimeline = [...processedTimeline];

  // If there's an active status and it's not already part of the processedTimeline, add it
  let activeStep: TimelineStep | undefined;
  if (activeRequestStatus && !previewTimeline.some(step => step.status === activeRequestStatus)) {
    activeStep = {
      id: `active-${activeRequestStatus}`,
      status: activeRequestStatus,
      date: 'Pending',
      description: `Pending`,
      completed: false,
      active: true,
    };

    previewTimeline.push(activeStep);
  }

  // Then get the last two steps
  previewTimeline = previewTimeline.slice(-2).reverse();

  // Get the last completed status
  // const lastCompletedStatus = latestCompletedIndex >= 0
  //   ? processedTimeline[latestCompletedIndex].status
  //   : null;

  const existingStatuses = new Set([
    ...processedTimeline.map((step) => step.status),
    ...(activeStep ? [activeStep.status] : []),
  ]);

  let fullTimeline: TimelineStep[] = [...processedTimeline];

  // Only add active and incomplete steps if not fully completed or rejected
  if (!isFullyCompleted && !isRejected) {
    if (activeStep) {
      fullTimeline.push(activeStep);
    }

    const pendingSteps: TimelineStep[] = REQUEST_STATUSES
      .filter((status) => !existingStatuses.has(status))
      .map((status) => ({
        id: `pending-${status}`,
        status,
        date: 'Incomplete',
        description: 'Incomplete',
        completed: false,
      }));

    fullTimeline = [...fullTimeline, ...pendingSteps];
  }


  return (
    <div className="card mb-6 p-6 bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-6">Travel Request Timeline</h3>

      <div className="space-y-6">
        {fullTimeline.map((step, index) => (
          <div key={step.id} className="flex items-start relative">
            {/* Connector Line */}
            {index < fullTimeline.length - 1 && (
              <div
                className={`absolute left-[1rem] top-[2rem] w-0.5 h-[calc(100%-1rem)] ${step.rejected
                  ? 'bg-red-200'
                  : step.completed
                    ? 'bg-green-200'
                    : 'bg-gray-200'
                  }`}
              />
            )}
            {/* Circle Indicator */}
            <div
              className={`mr-4 flex flex-col items-center w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.rejected
                ? 'bg-red-100 text-red-600'
                : step.active
                  ? 'bg-purple-100 text-purple-500'
                  : step.completed
                    ? 'bg-green-100 text-green-500'
                    : step.isModified
                      ? 'bg-blue-100 text-blue-500'
                      : 'bg-gray-100 text-gray-400'
                }`}
            >
              {step.rejected ? (
                <X className="h-4 w-4" />
              ) : step.active ? (
                <Clock className="h-4 w-4" />
              ) : step.isModified ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <Check className="h-4 w-4" />
              )}
            </div>
            {/* Status and Description */}
            <div>
              <p
                className={`font-medium ${step.rejected
                  ? 'text-red-600'
                  : step.active
                    ? 'text-purple-600'
                    : step.completed
                      ? 'text-green-600'
                      : step.isModified
                        ? 'text-blue-600'
                        : 'text-gray-400'
                  }`}
              >
                {step.status}
              </p>
              <p
                className={`text-sm ${step.rejected
                  ? 'text-red-500'
                  : step.active
                    ? 'text-purple-500'
                    : step.completed
                      ? 'text-gray-500'
                      : step.isModified
                        ? 'text-blue-500'
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
      {/* <div className="mt-4">
        <button
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => setIsModalOpen(true)}
        >
          View More
        </button>
      </div>

      {/* Modal for Full Timeline */}
      {/* {isModalOpen && (
        <TimelineModal
          timeline={fullTimeline}
          onClose={() => setIsModalOpen(false)}
        />
      )} */}
    </div>
  );
};

export default ApprovalTimeline;