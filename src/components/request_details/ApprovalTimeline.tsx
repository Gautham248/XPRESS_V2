import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Check, Clock, X, Loader2, Edit } from 'lucide-react'; // Added Edit for Modified
import { format, isValid } from 'date-fns';
import { TimelineStep } from './TimelineModal'; // Assuming this is correctly imported

// --- Prop and API Data Interfaces ---
interface ApprovalTimelineProps {
  requestId: string;
}

interface ApiTimelineEvent {
  id: string;
  // The 'type' from API should match one of the keys in STATUS_DISPLAY_NAMES or be a fallback
  type: string;
  date: string; // ISO date string from API
  description: string;
  // userName?: string;
}

interface ApiTravelRequestTimelineData {
  // The 'status' from API should match one of the keys in STATUS_DISPLAY_NAMES or be a fallback
  status: string; // Overall current status of the request
  requestDate: string; // ISO date string for initial submission
  travelerName: string;
  // managerName?: string;
  timelineEvents: ApiTimelineEvent[];
}

// --- Constants ---
// These are the RAW status strings expected from the API for linear progression
export const LINEAR_PROGRESSION_STATUSES = [
  'PendingReview',
  'Verified',
  'OptionsListed',
  'OptionSelected',
  'DUApproved',
  'BUApproved',
  'TicketDispatched',
  'InTransit',
  'Returned',
  'Closed',
] as const;

// Type for the linear progression statuses
type LinearStatus = typeof LINEAR_PROGRESSION_STATUSES[number];

// All possible status types from the image, used for display mapping and type checking
const ALL_API_STATUSES = [
  ...LINEAR_PROGRESSION_STATUSES,
  'Cancelled',
  'Rejected',
  'Modified',
  // Add any other distinct status that might come from API event.type or overallStatus
] as const;
type AnyApiStatus = typeof ALL_API_STATUSES[number];


const STATUS_DISPLAY_NAMES: Record<string, string> = {
  PendingReview: 'Pending Review',
  Verified: 'Verified',
  OptionsListed: 'Options Listed',
  OptionSelected: 'Option Selected',
  DUApproved: 'DU Approved',
  BUApproved: 'BU Approved',
  TicketDispatched: 'Ticket Dispatched',
  InTransit: 'In Transit',
  Returned: 'Returned',
  Closed: 'Closed',
  Cancelled: 'Cancelled',
  Rejected: 'Rejected',
  Modified: 'Request Modified',
  'Request Submitted': 'Request Submitted', // For the initial step
};

const getDisplayStatus = (rawApiStatus: string): string => {
  return STATUS_DISPLAY_NAMES[rawApiStatus] || rawApiStatus.replace(/([A-Z])/g, ' $1').trim(); // Fallback
};

const API_BASE_URL = 'http://localhost:5030/api';

// --- Component ---
const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ requestId }) => {
  const [travelRequestData, setTravelRequestData] = useState<ApiTravelRequestTimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError("Request ID is not provided.");
      setLoading(false);
      return;
    }
    const fetchTimelineData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<{ isSuccess: boolean; result: ApiTravelRequestTimelineData; errorMessages?: string[] }>(
          `${API_BASE_URL}/TravelRequest/${requestId}/timeline`
        );
        if (response.data.isSuccess && response.data.result) {
          setTravelRequestData(response.data.result);
        } else {
          setError(response.data.errorMessages?.join(', ') || "Failed to fetch timeline data.");
          setTravelRequestData(null);
        }
      } catch (err) {
        // ... (error handling as before)
        if (axios.isAxiosError(err)) {
          setError(`API Error: ${err.response?.status} - ${err.response?.data?.errorMessages?.join(', ') || err.response?.statusText || err.message}`);
        } else if (err instanceof Error) {
          setError(`An unexpected error occurred: ${err.message}`);
        } else {
           setError("An unknown error occurred while fetching timeline data.");
        }
        console.error("Error fetching timeline data:", err);
        setTravelRequestData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTimelineData();
  }, [requestId]);

  const safeFormatDate = (dateString: string | undefined, defaultText: string = 'N/A'): string => {
    if (!dateString) return defaultText;
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'dd-MM-yyyy HH:mm') : defaultText;
  };
  
  const createTimelineStep = useCallback((
    id: string,
    rawApiStatus: string, // Expects raw API status like 'PendingReview'
    date: string,
    description: string,
    options: Partial<TimelineStep & { cancelled?: boolean }> = {} // Add cancelled here
  ): TimelineStep & { cancelled?: boolean } => ({
    id,
    status: getDisplayStatus(rawApiStatus), // Set display-friendly status
    date,
    description,
    completed: false,
    active: false,
    rejected: false,
    isModified: false,
    cancelled: false,
    ...options
  }), []);

  const processedTimelineSteps = React.useMemo((): (TimelineStep & { cancelled?: boolean })[] => {
    if (!travelRequestData) return [];

    const { status: overallRawStatus, timelineEvents, requestDate, travelerName } = travelRequestData;

    const isGloballyRejected = overallRawStatus === 'Rejected';
    const isGloballyCancelled = overallRawStatus === 'Cancelled';
    const isTerminalOverall = isGloballyRejected || isGloballyCancelled || overallRawStatus === 'Closed';

    // Find the highest index in LINEAR_PROGRESSION_STATUSES that matches a non-modified/rejected/cancelled event type
    const latestCompletedLinearEventIndex = timelineEvents
      .filter(event => event.type !== 'Modified' && event.type !== 'Rejected' && event.type !== 'Cancelled')
      .reduce((maxIndex, event) => {
        const statusIndex = LINEAR_PROGRESSION_STATUSES.indexOf(event.type as LinearStatus);
        return statusIndex > maxIndex ? statusIndex : maxIndex;
      }, -1);
    
    let effectiveLatestCompletedLinearIndex = latestCompletedLinearEventIndex;
    const overallLinearStatusIndex = LINEAR_PROGRESSION_STATUSES.indexOf(overallRawStatus as LinearStatus);
    if (overallLinearStatusIndex > latestCompletedLinearEventIndex) {
        effectiveLatestCompletedLinearIndex = overallLinearStatusIndex;
    }
    if (isTerminalOverall && overallLinearStatusIndex === -1) { // If terminal but not in linear, consider all linear steps before it done.
        if(overallRawStatus === 'Closed') effectiveLatestCompletedLinearIndex = LINEAR_PROGRESSION_STATUSES.length -1;
        // For Rejected/Cancelled, effective index might stay based on last linear event
    }


    const baseSteps: (TimelineStep & { cancelled?: boolean })[] = [
      createTimelineStep(
        'request-submitted',
        'Request Submitted', // Special raw status for this step
        safeFormatDate(requestDate),
        `${travelerName || 'Traveler'} submitted travel request.`,
        { completed: true }
      )
    ];

    const eventBasedSteps = timelineEvents.map((event, index) => {
      const isModified = event.type === 'Modified';
      const isRejectedEvent = event.type === 'Rejected';
      const isCancelledEvent = event.type === 'Cancelled';
      const eventLinearStatusIndex = LINEAR_PROGRESSION_STATUSES.indexOf(event.type as LinearStatus);
      
      let completed = false;
      if (!isModified && !isRejectedEvent && !isCancelledEvent && eventLinearStatusIndex !== -1) {
        completed = eventLinearStatusIndex <= effectiveLatestCompletedLinearIndex;
      } else if (isRejectedEvent || isCancelledEvent) {
        completed = true; // These are final "completed" events
      }

      return createTimelineStep(
        event.id || `event-${index}`,
        event.type, // Pass raw API type
        safeFormatDate(event.date),
        event.description,
        {
          completed: completed,
          rejected: isRejectedEvent,
          isModified: isModified,
          cancelled: isCancelledEvent,
        }
      );
    });
    
    let combinedSteps = [...baseSteps, ...eventBasedSteps];
    // De-duplication logic for 'Request Submitted' (as before)
    const submittedEventIndex = combinedSteps.findIndex(step => step.status === getDisplayStatus('Request Submitted') && step.id !== 'request-submitted');
    if (submittedEventIndex > -1 && combinedSteps[0].id === 'request-submitted') {
        if (JSON.stringify(combinedSteps[0]) !== JSON.stringify(combinedSteps[submittedEventIndex])) {
             combinedSteps[0] = combinedSteps[submittedEventIndex];
             combinedSteps.splice(submittedEventIndex, 1);
        } else {
            combinedSteps.splice(submittedEventIndex, 1);
        }
    }


    const finalTimeline: (TimelineStep & { cancelled?: boolean })[] = [];
    const addedDisplayStatuses = new Set<string>();

    combinedSteps.forEach(step => {
      finalTimeline.push(step);
      addedDisplayStatuses.add(step.status); // Add display status
    });
    
    // Handle overall rejected/cancelled status if not represented by an event
    if (isGloballyRejected && !finalTimeline.some(s => s.rejected)) {
        finalTimeline.push(createTimelineStep('global-rejection', 'Rejected', safeFormatDate(undefined), 'The travel request was rejected.', { rejected: true, completed: true }));
    }
    if (isGloballyCancelled && !finalTimeline.some(s => s.cancelled)) {
        finalTimeline.push(createTimelineStep('global-cancellation', 'Cancelled', safeFormatDate(undefined), 'The travel request was cancelled.', { cancelled: true, completed: true }));
    }

    if (!isTerminalOverall && effectiveLatestCompletedLinearIndex < LINEAR_PROGRESSION_STATUSES.length -1) {
      let foundActive = false;
      LINEAR_PROGRESSION_STATUSES.forEach((rawStatusName, idx) => {
        const displayStatusName = getDisplayStatus(rawStatusName);
        if (!addedDisplayStatuses.has(displayStatusName)) {
          if (!foundActive && idx === effectiveLatestCompletedLinearIndex + 1) {
            finalTimeline.push(
              createTimelineStep(`active-${rawStatusName}`, rawStatusName, 'Pending', `Awaiting ${displayStatusName.toLowerCase()}`, { active: true })
            );
            foundActive = true;
          } else if (idx > effectiveLatestCompletedLinearIndex + 1) {
            finalTimeline.push(
              createTimelineStep(`pending-${rawStatusName}`, rawStatusName, 'Not Yet Started', 'This step has not been reached.', { completed: false, active: false })
            );
          }
        } else {
            const existingStep = finalTimeline.find(s => s.status === displayStatusName);
            if (existingStep && !existingStep.completed && !existingStep.rejected && !existingStep.isModified && !existingStep.cancelled && idx === effectiveLatestCompletedLinearIndex + 1) {
                existingStep.active = true;
                foundActive = true;
            }
        }
      });
    }
    
    // A simple sort: completed first, then active, then by order in LINEAR_PROGRESSION_STATUSES for pending
    // More sophisticated sorting might be needed if API events are out of order.
    finalTimeline.sort((a, b) => {
        const dateA = new Date(a.date === 'Pending' || a.date === 'Not Yet Started' || a.date === 'N/A' ? 0 : a.date.split(' ')[0].split('-').reverse().join('-') + ' ' + (a.date.split(' ')[1] || '00:00')).getTime();
        const dateB = new Date(b.date === 'Pending' || b.date === 'Not Yet Started' || b.date === 'N/A' ? 0 : b.date.split(' ')[0].split('-').reverse().join('-') + ' ' + (b.date.split(' ')[1] || '00:00')).getTime();
        
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        
        if (dateA !== 0 && dateB !== 0 && dateA !== dateB) return dateA - dateB;
        
        // For non-dated items or same-date items, use LINEAR_PROGRESSION_STATUSES order
        // This requires getting the raw status back if possible, or matching display status to it.
        // This part is tricky; for now, we rely on the build order mostly.
        return 0; 
    });


    return finalTimeline;

  }, [travelRequestData, createTimelineStep]);

  if (loading) { /* ... loading UI ... */ 
    return (
      <div className="card mb-6 p-6 bg-white rounded-lg shadow h-full flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600">Loading timeline...</span>
      </div>
    );
  }
  if (error) { /* ... error UI ... */ 
    return (
      <div className="card mb-6 p-6 bg-red-50 border border-red-200 rounded-lg shadow h-full">
        <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Timeline</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  if (!travelRequestData || processedTimelineSteps.length === 0) { /* ... no data UI ... */ 
    return (
      <div className="card mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow h-full">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Travel Request Timeline</h3>
        <p className="text-gray-600">No timeline data available for this request.</p>
      </div>
    );
  }
  
  const getStepStyles = (step: TimelineStep & { cancelled?: boolean }) => {
    if (step.rejected) return { circle: 'bg-red-100 text-red-600', line: 'bg-red-200', title: 'text-red-600', date: 'text-red-500' };
    if (step.cancelled) return { circle: 'bg-yellow-100 text-yellow-600', line: 'bg-yellow-200', title: 'text-yellow-600', date: 'text-yellow-500' }; // Style for Cancelled
    if (step.active) return { circle: 'bg-purple-100 text-purple-600', line: 'bg-gray-200', title: 'text-purple-700 font-semibold', date: 'text-purple-500' };
    if (step.completed) return { circle: 'bg-green-100 text-green-600', line: 'bg-green-200', title: 'text-green-700', date: 'text-gray-500' };
    if (step.isModified) return { circle: 'bg-blue-100 text-blue-600', line: 'bg-gray-200', title: 'text-blue-700', date: 'text-blue-500' };
    return { circle: 'bg-gray-100 text-gray-400', line: 'bg-gray-200', title: 'text-gray-400', date: 'text-gray-400' };
  };

  const renderIcon = (step: TimelineStep & { cancelled?: boolean }) => {
    if (step.rejected) return <X className="h-4 w-4" />;
    if (step.cancelled) return <X className="h-4 w-4" />; // Using X for cancelled too, or a different icon
    if (step.active) return <Clock className="h-4 w-4 animate-pulse" />;
    if (step.isModified) return <Edit className="h-4 w-4" />; // Using Edit lucide icon
    if (step.completed) return <Check className="h-4 w-4" />;
    return <div className="h-2 w-2 bg-gray-300 rounded-full"></div>;
  };

  return (
    <div className="card mb-6 p-6 bg-white rounded-lg shadow h-full">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Travel Request Timeline</h3>
      <div className="space-y-6">
        {processedTimelineSteps.map((step, index) => {
          const styles = getStepStyles(step);
          const isLastStep = index === processedTimelineSteps.length - 1;
          
          return (
            <div key={step.id || `timeline-step-${index}`} className="flex items-start relative">
              {!isLastStep && (
                <div
                  className={`absolute left-[0.9375rem] top-8 w-0.5 h-[calc(100%-1.5rem)] ${styles.line} transition-colors duration-300`}
                />
              )}
              <div className={`mr-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.circle} transition-colors duration-300`}>
                {renderIcon(step)}
              </div>
              <div className="flex-grow">
                <p className={`font-medium ${styles.title} transition-colors duration-300`}>
                  {step.status} {/* This is now the display-friendly status */}
                </p>
                <p className={`text-sm ${styles.date} transition-colors duration-300`}>
                  {step.date}
                </p>
                {step.description && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalTimeline;