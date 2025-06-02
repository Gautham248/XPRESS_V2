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
  
  // Helper function to create timeline steps
  const createTimelineStep = (
    id: string,
    status: string,
    date: string,
    description: string,
    options: Partial<TimelineStep> = {}
  ): TimelineStep => ({
    id,
    status,
    date,
    description,
    completed: false,
    active: false,
    rejected: false,
    isModified: false,
    ...options
  });

  // Check if request is rejected
  const isRejected = travelRequest.status === 'Rejected' || 
    (travelRequest.timeline?.some(event => event.type === 'Rejected') ?? false);

  // Get latest completed status index
  const getLatestCompletedIndex = (): number => {
    if (isRejected) return -1;

    if (travelRequest.timeline) {
      return travelRequest.timeline
        .filter(event => event.type !== 'Modified')
        .reduce((maxIndex, event) => {
          const statusIndex = REQUEST_STATUSES.indexOf(event.type as any);
          return statusIndex > maxIndex ? statusIndex : maxIndex;
        }, -1);
    }

    const statusIndex = REQUEST_STATUSES.indexOf(travelRequest.status as any);
    return statusIndex !== -1 ? statusIndex : 0;
  };

  const latestCompletedIndex = getLatestCompletedIndex();
  const isFullyCompleted = latestCompletedIndex === REQUEST_STATUSES.length - 1;
  const activeRequestStatus = (isRejected || isFullyCompleted) 
    ? null 
    : REQUEST_STATUSES[latestCompletedIndex + 1];

  // Create default timeline when no timeline data exists
  const createDefaultTimeline = (): TimelineStep[] => {
    const baseTimeline = [
      createTimelineStep(
        '1',
        'Request Submitted',
        travelRequest.requestDate,
        `${travelRequest.travelerName} submitted travel request`,
        { completed: true }
      )
    ];

    if (isRejected) {
      baseTimeline.push(
        createTimelineStep(
          '2',
          'Request Rejected',
          format(new Date(), 'dd-MM-yyyy HH:mm'),
          `${travelRequest.managerName} rejected the request`,
          { rejected: true }
        )
      );
      return baseTimeline;
    }

    const statusTimeline = REQUEST_STATUSES
      .map((status, index) => {
        const isCompleted = index <= latestCompletedIndex;
        const isActive = index === latestCompletedIndex + 1;
        
        return createTimelineStep(
          `${index + 2}`,
          status === 'Pending' ? 'Awaiting Approval' : status,
          isCompleted ? format(new Date(), 'dd-MM-yyyy HH:mm') : 'Pending',
          isCompleted 
            ? `${travelRequest.managerName} ${status.toLowerCase()} the request`
            : `Pending ${status.toLowerCase()}`,
          { completed: isCompleted, active: isActive }
        );
      })
      .filter(item => 
        item.completed || 
        item.active || 
        (latestCompletedIndex === REQUEST_STATUSES.length - 1 && item.status === 'Travel Completed')
      );

    return [...baseTimeline, ...statusTimeline];
  };

  // Process existing timeline data
  const processExistingTimeline = (): TimelineStep[] => {
    if (!travelRequest.timeline) return [];
    
    return travelRequest.timeline.map((event, index) => {
      const isModified = event.type === 'Modified';
      const statusIndex = isModified ? -1 : REQUEST_STATUSES.indexOf(event.type as any);
      const isCompleted = !isModified && statusIndex <= latestCompletedIndex;
      const isActive = !isModified && statusIndex === latestCompletedIndex + 1;

      return createTimelineStep(
        event.id || `event-${index}`,
        event.type.charAt(0).toUpperCase() + event.type.slice(1),
        format(new Date(event.date), 'dd-MM-yyyy HH:mm'),
        event.description,
        {
          completed: isCompleted,
          active: isActive,
          rejected: event.type === 'Rejected',
          isModified
        }
      );
    });
  };

  // Get processed timeline
  const processedTimeline = travelRequest.timeline 
    ? processExistingTimeline() 
    : createDefaultTimeline();

  // Build full timeline with active and pending steps
  const buildFullTimeline = (): TimelineStep[] => {
    let timeline = [...processedTimeline];

    // Add active step if needed
    if (activeRequestStatus && !timeline.some(step => step.status === activeRequestStatus)) {
      timeline.push(
        createTimelineStep(
          `active-${activeRequestStatus}`,
          activeRequestStatus,
          'Pending',
          'Pending',
          { active: true }
        )
      );
    }

    // Add pending steps if not completed or rejected
    if (!isFullyCompleted && !isRejected) {
      const existingStatuses = new Set(timeline.map(step => step.status));
      
      const pendingSteps = REQUEST_STATUSES
        .filter(status => !existingStatuses.has(status))
        .map(status => 
          createTimelineStep(
            `pending-${status}`,
            status,
            'Incomplete',
            'Incomplete'
          )
        );

      timeline = [...timeline, ...pendingSteps];
    }

    return timeline;
  };

  const fullTimeline = buildFullTimeline();

  // Get step styling
  const getStepStyles = (step: TimelineStep) => {
    if (step.rejected) {
      return {
        circle: 'bg-red-100 text-red-600',
        line: 'bg-red-200',
        title: 'text-red-600',
        date: 'text-red-500'
      };
    }
    if (step.active) {
      return {
        circle: 'bg-purple-100 text-purple-500',
        line: 'bg-gray-200',
        title: 'text-purple-600',
        date: 'text-purple-500'
      };
    }
    if (step.completed) {
      return {
        circle: 'bg-green-100 text-green-500',
        line: 'bg-green-200',
        title: 'text-green-600',
        date: 'text-gray-500'
      };
    }
    if (step.isModified) {
      return {
        circle: 'bg-blue-100 text-blue-500',
        line: 'bg-gray-200',
        title: 'text-blue-600',
        date: 'text-blue-500'
      };
    }
    return {
      circle: 'bg-gray-100 text-gray-400',
      line: 'bg-gray-200',
      title: 'text-gray-400',
      date: 'text-gray-400'
    };
  };

  // Render appropriate icon
  const renderIcon = (step: TimelineStep) => {
    if (step.rejected) return <X className="h-4 w-4" />;
    if (step.active) return <Clock className="h-4 w-4" />;
    if (step.isModified) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
          />
        </svg>
      );
    }
    return <Check className="h-4 w-4" />;
  };

  return (
    <div className="card mb-6 p-6 bg-white rounded-lg shadow h-full">
      <h3 className="text-lg font-semibold mb-6">Travel Request Timeline</h3>

      <div className="space-y-6">
        {fullTimeline.map((step, index) => {
          const styles = getStepStyles(step);
          const isLastStep = index === fullTimeline.length - 1;
          
          return (
            <div key={step.id} className="flex items-start relative">
              {/* Connector Line */}
              {!isLastStep && (
                <div
                  className={`absolute left-[1rem] top-[2rem] w-0.5 h-[calc(100%-1rem)] ${styles.line}`}
                />
              )}
              
              {/* Circle Indicator */}
              <div className={`mr-4 flex flex-col items-center w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${styles.circle}`}>
                {renderIcon(step)}
              </div>
              
              {/* Status and Description */}
              <div>
                <p className={`font-medium ${styles.title}`}>
                  {step.status}
                </p>
                <p className={`text-sm ${styles.date}`}>
                  {step.date}
                </p>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalTimeline;