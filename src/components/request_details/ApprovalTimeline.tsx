import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Check, Clock, X, Loader2, Edit } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { TimelineStep } from './TimelineModal'; // Assuming this is correctly imported

// --- Prop and API Data Interfaces ---
interface ApprovalTimelineProps {
  requestId: string;
}

interface ApiTimelineEvent {
  id: string;
  type: string;
  date: string; // API returns 'dd-MM-yyyy HH:mm'
  description: string;
  details: string | null;
}

interface ApiTravelRequestTimelineData {
  status: string;
  requestDate: string; // 'dd-MM-yyyy HH:mm'
  travelerName: string;
  timelineEvents: ApiTimelineEvent[];
}

// --- Constants ---
const LINEAR_PROGRESSION_STATUSES = [
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

type LinearStatus = typeof LINEAR_PROGRESSION_STATUSES[number];

const STATUS_DISPLAY_PROPERTIES: Record<string, { displayName: string; icon: React.ReactNode }> = {
  PendingReview: { displayName: 'Pending Review', icon: <Clock className="h-4 w-4" /> },
  Verified: { displayName: 'Validated', icon: <Check className="h-4 w-4" /> },
  OptionsListed: { displayName: 'Options Provided', icon: <Check className="h-4 w-4" /> },
  OptionSelected: { displayName: 'Option Confirmed', icon: <Check className="h-4 w-4" /> },
  DUApproved: { displayName: 'DU Approval', icon: <Check className="h-4 w-4" /> },
  BUApproved: { displayName: 'BU Approval', icon: <Check className="h-4 w-4" /> },
  TicketDispatched: { displayName: 'Ticket Issued', icon: <Check className="h-4 w-4" /> },
  InTransit: { displayName: 'In Transit', icon: <Check className="h-4 w-4" /> },
  Returned: { displayName: 'Returned', icon: <Check className="h-4 w-4" /> },
  Closed: { displayName: 'Closed', icon: <Check className="h-4 w-4" /> },
  Cancelled: { displayName: 'Canceled', icon: <X className="h-4 w-4" /> },
  Rejected: { displayName: 'Rejected', icon: <X className="h-4 w-4" /> },
  Modified: { displayName: 'Request Modified', icon: <Edit className="h-4 w-4" /> },
  'Request Submitted': { displayName: 'Request Submitted', icon: <Check className="h-4 w-4" /> },
};

const getDisplayProperties = (rawApiStatus: string) => {
  return (
    STATUS_DISPLAY_PROPERTIES[rawApiStatus] || {
      displayName: rawApiStatus.replace(/([A-Z])/g, ' $1').trim(),
      icon: <div className="h-2 w-2 bg-gray-300 rounded-full" />,
    }
  );
};

const API_BASE_URL = 'http://localhost:5030/api';
const DATE_FORMAT = 'dd-MM-yyyy HH:mm';

// --- Component ---
const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ requestId }) => {
  const [travelRequestData, setTravelRequestData] = useState<ApiTravelRequestTimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError('Request ID is not provided.');
      setLoading(false);
      return;
    }

    const fetchTimelineData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<{ isSuccess: boolean; result: ApiTravelRequestTimelineData; errorMessages?: string[] }>(
          `${API_BASE_URL}/TravelRequest/${requestId}/timeline`,
          {
            headers: {
              Authorization: 'Bearer <your-token>', // Replace with actual JWT token or dynamic retrieval
            },
          }
        );
        if (response.data.isSuccess && response.data.result) {
          setTravelRequestData(response.data.result);
        } else {
          setError(response.data.errorMessages?.join(', ') || 'Failed to fetch timeline data.');
          setTravelRequestData(null);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            `API Error: ${err.response?.status} - ${err.response?.data?.errorMessages?.join(', ') || err.response?.statusText || err.message}`
          );
        } else if (err instanceof Error) {
          setError(`An unexpected error occurred: ${err.message}`);
        } else {
          setError('An unknown error occurred while fetching timeline data.');
        }
        console.error('Error fetching timeline data:', err);
        setTravelRequestData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [requestId]);

  const safeFormatDate = (dateString: string | undefined, defaultText: string = 'N/A'): string => {
    if (!dateString) return defaultText;
    const parsed = parse(dateString, DATE_FORMAT, new Date());
    return isValid(parsed) ? format(parsed, DATE_FORMAT) : defaultText;
  };

  const createTimelineStep = useCallback(
    (
      id: string,
      rawApiStatus: string,
      date: string,
      description: string,
      options: Partial<TimelineStep & { canceled?: boolean; details?: string | null }> = {}
    ): TimelineStep & { canceled?: boolean } => ({
      id,
      status: getDisplayProperties(rawApiStatus).displayName,
      date,
      description,
      details: options.details || null, // Set details from options
      completed: false,
      active: false,
      rejected: false,
      isModified: false,
      canceled: false,
      ...options,
    }),
    []
  );

  const processedTimelineSteps = React.useMemo((): (TimelineStep & { canceled?: boolean })[] => {
    if (!travelRequestData) return [];

    const { status: rawStatus, timelineEvents, requestDate, travelerName } = travelRequestData;

    // Merge duplicate 'OptionSelected' events
    const mergedEvents = timelineEvents.reduce((acc: ApiTimelineEvent[], event: ApiTimelineEvent) => {
      if (event.type === 'OptionSelected' && acc[acc.length - 1]?.type === 'OptionSelected') {
        // Keep the latest event (higher ID or later date)
        const prev = acc[acc.length - 1];
        const prevDate = parse(prev.date, DATE_FORMAT, new Date());
        const currDate = parse(event.date, DATE_FORMAT, new Date());
        if (isValid(currDate) && (!isValid(prevDate) || currDate > prevDate)) {
          acc[acc.length - 1] = event;
        }
      } else {
        acc.push(event);
      }
      return acc;
    }, []);

    const isGloballyRejected = rawStatus === 'Rejected';
    const isGloballyCanceled = rawStatus === 'Cancelled';
    const isTerminal = isGloballyRejected || isGloballyCanceled || rawStatus === 'Closed';

    // Find latest completed linear event index
    const latestCompletedLinearIndex = mergedEvents
      .filter((event: ApiTimelineEvent) => !['Modified', 'Rejected', 'Cancelled'].includes(event.type))
      .reduce((maxIndex: number, event: ApiTimelineEvent) => {
        const statusIndex = LINEAR_PROGRESSION_STATUSES.indexOf(event.type as LinearStatus);
        return statusIndex > maxIndex ? statusIndex : maxIndex;
      }, -1);

    let effectiveLinearIndex = latestCompletedLinearIndex;
    const overallLinearIndex = LINEAR_PROGRESSION_STATUSES.indexOf(rawStatus as LinearStatus);
    if (overallLinearIndex > effectiveLinearIndex) {
      effectiveLinearIndex = overallLinearIndex;
    }
    if (isTerminal && overallLinearIndex === -1) {
      if (rawStatus === 'Closed') effectiveLinearIndex = LINEAR_PROGRESSION_STATUSES.length - 1;
    }

    const baseSteps: (TimelineStep & { canceled?: boolean })[] = [
      createTimelineStep(
        'request-submitted',
        'Request Submitted',
        safeFormatDate(requestDate),
        `${travelerName || 'Traveler'} submitted travel request.`,
        { completed: true }
      ),
    ];

    const eventSteps = mergedEvents.map((event: ApiTimelineEvent, index: number) => {
      const isModified = event.type === 'Modified';
      const isRejectedEvent = event.type === 'Rejected';
      const isCanceledEvent = event.type === 'Cancelled';
      const eventLinearIndex = LINEAR_PROGRESSION_STATUSES.indexOf(event.type as LinearStatus);

      let completed = false;
      if (!isModified && !isRejectedEvent && !isCanceledEvent && eventLinearIndex !== -1) {
        completed = eventLinearIndex <= effectiveLinearIndex;
      } else if (isRejectedEvent || isCanceledEvent) {
        completed = true;
      }

      return createTimelineStep(
        event.id || `event-${index}`,
        event.type,
        safeFormatDate(event.date),
        event.description,
        {
          completed,
          rejected: isRejectedEvent,
          isModified,
          canceled: isCanceledEvent,
          details: event.details, // Pass details from API event
        }
      );
    });

    let combinedSteps = [...baseSteps, ...eventSteps];

    // Remove duplicate 'Request Submitted'
    const submittedEventIndex = combinedSteps.findIndex(
      step => step.status === getDisplayProperties('Request Submitted').displayName && step.id !== 'request-submitted'
    );
    if (submittedEventIndex > -1 && combinedSteps[0].id === 'request-submitted') {
      if (JSON.stringify(combinedSteps[0]) !== JSON.stringify(combinedSteps[submittedEventIndex])) {
        combinedSteps[0] = combinedSteps[submittedEventIndex];
        combinedSteps.splice(submittedEventIndex, 1);
      } else {
        combinedSteps.splice(submittedEventIndex, 1);
      }
    }

    const finalTimeline: (TimelineStep & { canceled?: boolean })[] = [];
    const addedDisplayStatuses = new Set<string>();

    combinedSteps.forEach(step => {
      finalTimeline.push(step);
      addedDisplayStatuses.add(step.status);
    });

    // Add global rejected/canceled if not in events
    if (isGloballyRejected && !finalTimeline.some(s => s.rejected)) {
      finalTimeline.push(
        createTimelineStep(
          'global-rejection',
          'Rejected',
          safeFormatDate(undefined),
          'The travel request was rejected.',
          { rejected: true, completed: true }
        )
      );
    }
    if (isGloballyCanceled && !finalTimeline.some(s => s.canceled)) {
      finalTimeline.push(
        createTimelineStep(
          'global-cancellation',
          'Cancelled',
          safeFormatDate(undefined),
          'The travel request was cancelled.',
          { canceled: true, completed: true }
        )
      );
    }

    // Add future linear steps
    if (!isTerminal && effectiveLinearIndex < LINEAR_PROGRESSION_STATUSES.length - 1) {
      let foundActive = false;
      LINEAR_PROGRESSION_STATUSES.forEach((rawStatus, idx) => {
        const displayProps = getDisplayProperties(rawStatus);
        if (!addedDisplayStatuses.has(displayProps.displayName)) {
          if (!foundActive && idx === effectiveLinearIndex + 1) {
            finalTimeline.push(
              createTimelineStep(
                `active-${rawStatus}`,
                rawStatus,
                'Pending',
                `Awaiting ${displayProps.displayName.toLowerCase()}`,
                { active: true }
              )
            );
            foundActive = true;
          } else if (idx > effectiveLinearIndex + 1) {
            finalTimeline.push(
              createTimelineStep(
                `pending-${rawStatus}`,
                rawStatus,
                'Not Yet Started',
                'This step has not been reached.',
                { completed: false, active: false }
              )
            );
          }
        } else {
          const existingStep = finalTimeline.find(s => s.status === displayProps.displayName);
          if (
            existingStep &&
            !existingStep.completed &&
            !existingStep.rejected &&
            !existingStep.isModified &&
            !existingStep.canceled &&
            idx === effectiveLinearIndex + 1
          ) {
            existingStep.active = true;
            foundActive = true;
          }
        }
      });
    }

    // Sort timeline
    finalTimeline.sort((a, b) => {
      const dateA =
        a.date === 'Pending' || a.date === 'Not Yet Started' || a.date === 'N/A'
          ? new Date(0)
          : parse(a.date, DATE_FORMAT, new Date());
      const dateB =
        b.date === 'Pending' || b.date === 'Not Yet Started' || b.date === 'N/A'
          ? new Date(0)
          : parse(b.date, DATE_FORMAT, new Date());

      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      if (isValid(dateA) && isValid(dateB)) return dateA.getTime() - dateB.getTime();
      return 0;
    });

    return finalTimeline;
  }, [travelRequestData, createTimelineStep]);

  const getStepStyles = (step: TimelineStep & { canceled?: boolean }) => {
    if (step.rejected) return { circle: 'bg-red-100 text-red-600', line: 'bg-red-200', title: 'text-red-600', date: 'text-red-500' };
    if (step.canceled) return { circle: 'bg-yellow-100 text-yellow-600', line: 'bg-yellow-200', title: 'text-yellow-600', date: 'text-yellow-500' };
    if (step.active) return { circle: 'bg-purple-100 text-purple-600', line: 'bg-gray-200', title: 'text-purple-700 font-semibold', date: 'text-purple-500' };
    if (step.completed) return { circle: 'bg-green-100 text-green-600', line: 'bg-green-200', title: 'text-green-700', date: 'text-gray-500' };
    if (step.isModified) return { circle: 'bg-blue-100 text-blue-600', line: 'bg-gray-200', title: 'text-blue-700', date: 'text-blue-500' };
    return { circle: 'bg-gray-100 text-gray-400', line: 'bg-gray-200', title: 'text-gray-400', date: 'text-gray-400' };
  };

  const renderIcon = (step: TimelineStep & { canceled?: boolean }) => {
    const props = getDisplayProperties(step.status === getDisplayProperties('Request Submitted').displayName ? 'Request Submitted' : step.status);
    if (step.rejected || step.canceled) return props.icon;
    if (step.active) return <Clock className="h-4 w-4 animate-pulse" />;
    if (step.isModified) return props.icon;
    if (step.completed) return props.icon;
    return props.icon;
  };

  if (loading) {
    return (
      <div className="card mb-6 p-6 bg-white rounded-lg shadow h-full flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-3 text-gray-600">Loading timeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card mb-6 p-6 bg-red-50 border border-red-200 rounded-lg shadow h-full">
        <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Timeline</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!travelRequestData || processedTimelineSteps.length === 0) {
    return (
      <div className="card mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow h-full">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Travel Request Timeline</h3>
        <p className="text-gray-600">No timeline data available for this request.</p>
      </div>
    );
  }

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
                <p className={`font-medium ${styles.title} transition-colors duration-300`}>{step.status}</p>
                <p className={`text-sm ${styles.date} transition-colors duration-300`}>{step.date}</p>
                {step.description && <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>}
                {/* {step.details && <p className="text-sm text-gray-500 mt-0.5 italic">{step.details}</p>} */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalTimeline;