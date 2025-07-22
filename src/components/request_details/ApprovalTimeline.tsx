import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Check, Clock, X, Edit } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';

// --- Interfaces ---
interface TimelineStep {
  id: string;
  status: string;
  date: string;
  description: string;
  details: string | null;
  completed: boolean;
  active: boolean;
  rejected: boolean;
  isModified: boolean;
  cycleId?: number; // Track modification cycle
}

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
  'Approved',
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
  PendingReview: { displayName: 'Request Submitted', icon: <Check className="h-4 w-4" /> },
  Approved: { displayName: 'Approved', icon: <Check className="h-4 w-4" /> },
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
  Pending: { displayName: 'Request Submitted', icon: <Check className="h-4 w-4" /> },
  OptionEdited: { displayName: 'Option Edited', icon: <Edit className="h-4 w-4" /> },
};

const getDisplayProperties = (rawApiStatus: string) => {
  return (
    STATUS_DISPLAY_PROPERTIES[rawApiStatus] || {
      displayName: rawApiStatus.replace(/([A-Z])/g, ' $1').trim(),
      icon: <div className="h-2 w-2 bg-gray-300 rounded-full" />,
    }
  );
};

const API_BASE_URL = 'https://xpress-deployment.onrender.com/api';
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
          `${API_BASE_URL}/TravelRequest/${requestId}/timeline`
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
      options: Partial<TimelineStep & { canceled?: boolean; details?: string | null; cycleId?: number }> = {}
    ): TimelineStep & { canceled?: boolean } => ({
      id,
      status: getDisplayProperties(rawApiStatus).displayName,
      date,
      description,
      details: options.details || null,
      completed: false,
      active: false,
      rejected: false,
      isModified: false,
      canceled: false,
      cycleId: options.cycleId,
      ...options,
    }),
    []
  );

  const processedTimelineSteps = React.useMemo((): (TimelineStep & { canceled?: boolean })[] => {
    if (!travelRequestData) return [];

    const { status: rawStatus, timelineEvents, requestDate } = travelRequestData;

    // Filter out 'BUApproved' events
    const filteredEvents = timelineEvents.filter(event => event.type !== 'BUApproved');

    // Merge duplicate events (e.g., OptionSelected)
    const mergedEvents = filteredEvents.reduce((acc: ApiTimelineEvent[], event: ApiTimelineEvent) => {
      if (event.type === 'OptionSelected' && acc[acc.length - 1]?.type === 'OptionSelected') {
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

    // Adjust rawStatus if it's 'BUApproved'
    let adjustedStatus = rawStatus;
    if (rawStatus === 'BUApproved') {
      adjustedStatus = 'TicketDispatched';
    }

    // Track modification cycles
    let currentCycle = 0;
    const cycleIndices: { startIndex: number; endIndex: number }[] = [{ startIndex: 0, endIndex: mergedEvents.length - 1 }];
    mergedEvents.forEach((event, index) => {
      if (event.type === 'Modified' && index < mergedEvents.length - 1 && mergedEvents[index + 1].type === 'PendingReview') {
        cycleIndices[cycleIndices.length - 1].endIndex = index;
        cycleIndices.push({ startIndex: index + 1, endIndex: mergedEvents.length - 1 });
        currentCycle++;
      }
    });

    // Create event steps with cycle tracking
    const eventSteps: (TimelineStep & { canceled?: boolean })[] = [];
    let latestCycleLinearIndex = -1;
    mergedEvents.forEach((event: ApiTimelineEvent, index: number) => {
      const isModified = event.type === 'Modified';
      const isRejectedEvent = event.type === 'Rejected';
      const isCanceledEvent = event.type === 'Cancelled';
      const isOptionEdited = event.type === 'OptionEdited';
      const isPendingReview = event.type === 'Pending' || event.type === 'PendingReview';
      const eventLinearIndex = LINEAR_PROGRESSION_STATUSES.indexOf((event.type === 'Pending' ? 'PendingReview' : event.type) as LinearStatus);

      // Find the cycle for this event
      const cycle = cycleIndices.find(c => index >= c.startIndex && index <= c.endIndex);
      const cycleId = cycle ? cycleIndices.indexOf(cycle) : 0;

      let completed = false;
      if (isPendingReview) {
        completed = true; // Always complete Request Submitted
      } else if (!isModified && !isRejectedEvent && !isCanceledEvent && !isOptionEdited && eventLinearIndex !== -1) {
        if (cycleId === currentCycle) {
          completed = eventLinearIndex <= LINEAR_PROGRESSION_STATUSES.indexOf(adjustedStatus as LinearStatus);
          if (completed && eventLinearIndex > latestCycleLinearIndex) {
            latestCycleLinearIndex = eventLinearIndex;
          }
        } else {
          completed = true; // Complete all linear steps in previous cycles
        }
      } else if (isRejectedEvent || isCanceledEvent || isModified || isOptionEdited) {
        completed = true; // Non-linear events are always completed
      }

      eventSteps.push(
        createTimelineStep(
          event.id || `event-${index}`,
          event.type === 'Pending' ? 'PendingReview' : event.type,
          safeFormatDate(event.date),
          event.description,
          {
            completed,
            rejected: isRejectedEvent,
            isModified: isModified || isOptionEdited,
            canceled: isCanceledEvent,
            details: event.details,
            cycleId,
          }
        )
      );
    });

    // Initialize timeline with all possible steps
    const finalTimeline: (TimelineStep & { canceled?: boolean })[] = [];
    const addedDisplayStatusesPerCycle = new Map<number, Set<string>>();

    // Add steps from events, avoiding duplicates within each cycle
    eventSteps.forEach(step => {
      const cycleId = step.cycleId || 0;
      if (!addedDisplayStatusesPerCycle.has(cycleId)) {
        addedDisplayStatusesPerCycle.set(cycleId, new Set<string>());
      }
      const cycleStatuses = addedDisplayStatusesPerCycle.get(cycleId)!;

      if (!cycleStatuses.has(step.status)) {
        finalTimeline.push(step);
        cycleStatuses.add(step.status);
      } else if (step.status === getDisplayProperties('PendingReview').displayName) {
        const existingIndex = finalTimeline.findIndex(s => s.status === step.status && s.cycleId === cycleId);
        if (existingIndex !== -1) {
          const existingDate = parse(finalTimeline[existingIndex].date, DATE_FORMAT, new Date());
          const newDate = parse(step.date, DATE_FORMAT, new Date());
          if (isValid(newDate) && (!isValid(existingDate) || newDate > existingDate)) {
            finalTimeline[existingIndex] = step;
          }
        }
      }
    });

    // Add all linear progression steps for the latest cycle
    const currentCycleStatuses = addedDisplayStatusesPerCycle.get(currentCycle) || new Set<string>();
    LINEAR_PROGRESSION_STATUSES.forEach((rawStatus, index) => {
      const displayProps = getDisplayProperties(rawStatus);
      if (!currentCycleStatuses.has(displayProps.displayName) && rawStatus !== 'BUApproved') {
        let stepStatus: 'completed' | 'active' | 'pending' = 'pending';
        if (index <= latestCycleLinearIndex) {
          stepStatus = 'completed';
        } else if (index === latestCycleLinearIndex + 1 && !isTerminal) {
          stepStatus = 'active';
        }

        const step = createTimelineStep(
          `step-${rawStatus}-${currentCycle}`,
          rawStatus,
          stepStatus === 'completed' ? safeFormatDate(requestDate) : stepStatus === 'active' ? 'Pending' : 'Not Yet Started',
          stepStatus === 'completed'
            ? `${displayProps.displayName} completed.`
            : stepStatus === 'active'
            ? `Awaiting ${displayProps.displayName.toLowerCase()}`
            : 'This step has not been reached.',
          {
            completed: stepStatus === 'completed' || rawStatus === 'PendingReview',
            active: stepStatus === 'active',
            details: null,
            cycleId: currentCycle,
          }
        );
        finalTimeline.push(step);
        currentCycleStatuses.add(displayProps.displayName);
      }
    });

    // Add global rejected/canceled if not in events
    if (isGloballyRejected && !finalTimeline.some(s => s.rejected)) {
      finalTimeline.push(
        createTimelineStep(
          'global-rejection',
          'Rejected',
          safeFormatDate(undefined),
          'Travel request was rejected.',
          { rejected: true, completed: true, cycleId: currentCycle }
        )
      );
    }
    if (isGloballyCanceled && !finalTimeline.some(s => s.canceled)) {
      finalTimeline.push(
        createTimelineStep(
          'global-cancellation',
          'Cancelled',
          safeFormatDate(undefined),
          'Travel request was cancelled.',
          { canceled: true, completed: true, cycleId: currentCycle }
        )
      );
    }

    // Ensure Request Submitted is always completed (green)
    finalTimeline.forEach((step: TimelineStep & { canceled?: boolean }) => {
      if (step.status === 'Request Submitted') {
        step.completed = true;
        step.active = false;
      }
    });

    // Sort timeline by date and cycle
    finalTimeline.sort((a: TimelineStep & { canceled?: boolean }, b: TimelineStep & { canceled?: boolean }) => {
      const dateA = parse(a.date, DATE_FORMAT, new Date());
      const dateB = parse(b.date, DATE_FORMAT, new Date());
      if (isValid(dateA) && isValid(dateB)) {
        return dateA.getTime() - dateB.getTime();
      }
      if (isValid(dateA)) return -1;
      if (isValid(dateB)) return 1;

      const cycleA = a.cycleId || 0;
      const cycleB = b.cycleId || 0;
      if (cycleA !== cycleB) return cycleA - cycleB;

      const statusOrderA = LINEAR_PROGRESSION_STATUSES.indexOf(a.status.replace(' ', '') as LinearStatus);
      const statusOrderB = LINEAR_PROGRESSION_STATUSES.indexOf(b.status.replace(' ', '') as LinearStatus);
      if (statusOrderA !== -1 && statusOrderB !== -1) {
        return statusOrderA - statusOrderB;
      }
      if (a.rejected || a.canceled) return 1;
      if (b.rejected || b.canceled) return -1;
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
    const props = getDisplayProperties(step.status.replace(' ', ''));
    if (step.rejected || step.canceled) return props.icon;
    if (step.active) return <Clock className="h-4 w-4 animate-pulse" />;
    if (step.isModified) return props.icon;
    if (step.completed) return props.icon;
    return props.icon;
  };

  if (loading) {
    return (
      <div className="card mb-6 p-6 bg-white rounded-lg shadow h-full flex justify-center items-center min-h-[200px]">
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
    <div className="card mb-6 p-6 bg-white rounded-lg shadow h-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Travel Request Timeline</h3>
      <div className="overflow-y-auto max-h-[850px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApprovalTimeline;