import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from './DatePicker'; // Assuming this component exists
import WeekView from './WeekView';     // Assuming this component exists
import MonthView from './MonthView';   // Assuming this component exists
import EventSidebar from './EventSidebar'; // Assuming this component exists
import ViewToggle from './ViewToggle';   // Assuming this component exists

const API_BASE_URL = 'http://localhost:5030';

export interface TravelRequest {
  requestId: string;
  outboundDepartureDate: string; // Expected to be UTC ISO string e.g., "2025-06-05T23:00:00Z"
  outboundArrivalDate: string;   // Expected to be UTC ISO string
  returnDepartureDate: string | null; // Expected to be UTC ISO string
  returnArrivalDate: string | null;   // Expected to be UTC ISO string
  employeeName: string;
  sourcePlace: string;
  sourceCountry: string;
  destinationPlace: string;
  destinationCountry: string;
  currentStatusName: string;
}

export interface TravelEvent {
  type: 'OutboundDeparture' | 'ReturnArrival';
  request: TravelRequest;
}

export interface DayInfo {
  day: number;
  currentMonth: boolean;
  month: number;
  year: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ApiResponse {
  isSuccess: boolean;
  result: TravelRequest[];
  statusCode: number;
  errorMessages: string[];
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    console.log("Current Date:", now);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  });

  const [view, setView] = useState<'Month' | 'Week'>('Month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  });
  const [selectedEventType, setSelectedEventType] = useState<'OutboundDeparture' | 'ReturnArrival' | null>(null);
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedRanges, setCachedRanges] = useState<Map<string, TravelRequest[]>>(new Map());

  const getVisibleDateRange = useCallback((date: Date, currentView: 'Month' | 'Week'): DateRange => {
    let startDateObj: Date;
    let endDateObj: Date;

    if (currentView === 'Month') {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      startDateObj = new Date(firstDayOfMonth);
      startDateObj.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
      endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + 41); 
    } else { 
      startDateObj = new Date(date);
      startDateObj.setDate(date.getDate() - date.getDay()); 
      endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + 6); 
    }

    const formatDateForApi = (d: Date) => d.toISOString().split('T')[0];

    return {
      startDate: formatDateForApi(startDateObj),
      endDate: formatDateForApi(endDateObj)
    };
  }, []);

  const getCacheKey = (startDate: string, endDate: string): string => {
    return `${startDate}_${endDate}`;
  };

  const fetchTravelRequestsForRange = async (startDate: string, endDate: string): Promise<TravelRequest[]> => {
    try {
      setError(null);
      const response = await axios.get<ApiResponse>(
        `${API_BASE_URL}/api/calendar/events/range`,
        { params: { startDate, endDate } }
      );
      if (response.data.isSuccess) return response.data.result || [];
      const errorMessage = response.data.errorMessages?.join(', ') || 'Unknown error occurred';
      setError(`Failed to load travel requests: ${errorMessage}`);
      return [];
    } catch (err) {
      console.error('Error fetching travel requests:', err);
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        let errorMessage = errorData?.errorMessages?.join(', ') || errorData?.message || err.response.statusText || 'Server error';
        setError(`Failed to load travel requests: ${errorMessage}`);
      } else {
        setError('Failed to load travel requests. Please try again later.');
      }
      return [];
    }
  };

  const loadDataForCurrentView = useCallback(async () => {
    setLoading(true);
    const { startDate, endDate } = getVisibleDateRange(currentDate, view);
    const cacheKey = getCacheKey(startDate, endDate);

    if (cachedRanges.has(cacheKey)) {
      setTravelRequests(cachedRanges.get(cacheKey) || []);
      setLoading(false);
      return;
    }

    const data = await fetchTravelRequestsForRange(startDate, endDate);
    setCachedRanges(prev => new Map(prev.set(cacheKey, data)));
    setTravelRequests(data);
    setLoading(false);
  }, [currentDate, view, getVisibleDateRange, cachedRanges, fetchTravelRequestsForRange]); // Added fetchTravelRequestsForRange (it's stable due to no deps)

  useEffect(() => {
    loadDataForCurrentView();
  }, [loadDataForCurrentView]);

  // Memoize getEventsForDate to prevent unnecessary recalculations if possible,
  // or ensure its dependencies are stable. Given it relies on travelRequests,
  // it will re-run when travelRequests changes.
  const getEventsForDate = useCallback((dateForEvents: Date | null): TravelEvent[] => {
    if (!dateForEvents || travelRequests.length === 0) {
      return [];
    }
  
    const events: TravelEvent[] = [];
    
    const selectedLocalYear = dateForEvents.getFullYear();
    const selectedLocalMonth = dateForEvents.getMonth(); // 0-11
    const selectedLocalDay = dateForEvents.getDate();
  
    travelRequests.forEach((request: TravelRequest) => {
      if (request.outboundDepartureDate) {
        const eventDateObj = new Date(request.outboundDepartureDate); // Parses UTC string into a Date object
        // .getFullYear(), .getMonth(), .getDate() on this object return values in LOCAL timezone
        if (
          eventDateObj.getFullYear() === selectedLocalYear &&
          eventDateObj.getMonth() === selectedLocalMonth &&
          eventDateObj.getDate() === selectedLocalDay
        ) {
          events.push({ type: 'OutboundDeparture', request });
        }
      }
  
      if (request.returnArrivalDate) {
        const eventDateObj = new Date(request.returnArrivalDate); // Parses UTC string
        if (
          eventDateObj.getFullYear() === selectedLocalYear &&
          eventDateObj.getMonth() === selectedLocalMonth &&
          eventDateObj.getDate() === selectedLocalDay
        ) {
          events.push({ type: 'ReturnArrival', request });
        }
      }
    });
    return events;
  }, [travelRequests]); // Depends only on travelRequests

  useEffect(() => {
    if (selectedDate === null) {
      const today = new Date();
      const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      setSelectedDate(normalizedToday);
    }

    if (selectedDate) {
      const events = getEventsForDate(selectedDate);
      if (events.length > 0) {
        if (!selectedEventType || !events.find(e => e.type === selectedEventType)) {
          setSelectedEventType(events[0].type);
        }
      } else {
        setSelectedEventType(null);
      }
    }
  }, [selectedDate, getEventsForDate, selectedEventType]); // Added getEventsForDate as a dependency

  const getDaysForMonth = (year: number, month: number): DayInfo[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonthDays: DayInfo[] = Array.from({ length: firstDayOfMonth }, (_, i) => ({
        day: daysInPrevMonth - firstDayOfMonth + i + 1,
        currentMonth: false,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
    }));

    const currentMonthDays: DayInfo[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1, currentMonth: true, month: month, year: year,
    }));

    const totalCells = 42; 
    const nextMonthDaysCount = totalCells - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays: DayInfo[] = Array.from({length: nextMonthDaysCount}, (_, i) => ({
        day: i + 1,
        currentMonth: false,
        month: month === 11 ? 0 : month + 1,
        year: month === 11 ? year + 1 : year,
    }));
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handlePrevNext = (direction: 'prev' | 'next'): void => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      const monthChange = direction === 'prev' ? -1 : 1;
      if (view === 'Month') newDate.setMonth(newDate.getMonth() + monthChange, 1);
      else newDate.setDate(newDate.getDate() + (monthChange * 7));
      newDate.setHours(0,0,0,0);
      return newDate;
    });
    if (selectedDate) {
      setSelectedDate(prevSelected => {
        if (!prevSelected) return null;
        const newSelected = new Date(prevSelected);
        const monthChange = direction === 'prev' ? -1 : 1;
        if (view === 'Month') newSelected.setMonth(newSelected.getMonth() + monthChange);
        else newSelected.setDate(newSelected.getDate() + (monthChange * 7));
        newSelected.setHours(0,0,0,0);
        // Boundary check: ensure newSelected is within the new currentDate's view range or set to a default like first visible day
        // For simplicity, we'll let it be, but it might select a day not immediately visible in the new month/week.
        return newSelected;
      });
    }
    setSelectedEventType(null);
  };

  const handlePrev = () => handlePrevNext('prev');
  const handleNext = () => handlePrevNext('next');

  const handleDayCellClick = (dayInfo: DayInfo): void => {
    const clickedDate = new Date(dayInfo.year, dayInfo.month, dayInfo.day, 0, 0, 0, 0);
    setSelectedDate(clickedDate);

    if (view === 'Month' && (dayInfo.month !== currentDate.getMonth() || dayInfo.year !== currentDate.getFullYear())) {
        setCurrentDate(new Date(dayInfo.year, dayInfo.month, 1, 0,0,0,0));
    } else if (view === 'Week') {
        const weekStartForClicked = new Date(clickedDate);
        weekStartForClicked.setDate(clickedDate.getDate() - clickedDate.getDay());
        weekStartForClicked.setHours(0,0,0,0);
        
        const currentViewWeekStart = new Date(currentDate);
        currentViewWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
        currentViewWeekStart.setHours(0,0,0,0);

        if(weekStartForClicked.getTime() !== currentViewWeekStart.getTime()){
            setCurrentDate(weekStartForClicked);
        }
    }
  };

  const handleDateSelect = (year: number, month: number, day: number): void => {
    const selectedFromPicker = new Date(year, month, day, 0, 0, 0, 0);
    setSelectedDate(selectedFromPicker);
    if (view === 'Month') setCurrentDate(new Date(year, month, 1, 0,0,0,0));
    else {
        const startOfWeek = new Date(year, month, day);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        setCurrentDate(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 0,0,0,0));
    }
  };

  const handleViewChange = (newView: 'Month' | 'Week'): void => {
    setView(newView);
    if (selectedDate) {
      if (newView === 'Week') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        setCurrentDate(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate(), 0,0,0,0));
      } else {
        setCurrentDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 0,0,0,0));
      }
    }
  };

  const formatWeekRange = (): string => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const yearOpt: Intl.DateTimeFormatOptions = { ...options, year: 'numeric' };
    if (startOfWeek.getFullYear() !== endOfWeek.getFullYear()) return `${startOfWeek.toLocaleDateString('en-US', yearOpt)} - ${endOfWeek.toLocaleDateString('en-US', yearOpt)}`;
    if (startOfWeek.getMonth() !== endOfWeek.getMonth()) return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}, ${endOfWeek.getFullYear()}`;
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { day: 'numeric' })}, ${endOfWeek.getFullYear()}`;
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Travel Calendar</h1>
      </div>
      {loading ? (
        <div className="text-center text-gray-600 py-10">Loading travel requests...</div>
      ) : error ? (
        <div className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:flex-[0.65] bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-center mb-4 gap-2 sm:gap-0">
              <DatePicker currentDate={currentDate} view={view} onDateSelect={handleDateSelect} formatWeekRange={formatWeekRange} />
              <div className="flex items-center">
                <button aria-label="Previous period" className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md" onClick={handlePrev}> {'<'} </button>
                <button aria-label="Next period" className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md" onClick={handleNext}> {'>'} </button>
              </div>
              <div className="sm:ml-auto mt-2 sm:mt-0"> <ViewToggle view={view} onViewChange={handleViewChange} /> </div>
            </div>
            {view === 'Month' ? (
              <MonthView currentDate={currentDate} getDaysForMonth={getDaysForMonth} getEventsForDate={getEventsForDate} selectedDate={selectedDate} onDayCellClick={handleDayCellClick} />
            ) : (
              <WeekView currentDate={currentDate} getEventsForDate={getEventsForDate} selectedDate={selectedDate} onDayCellClick={handleDayCellClick} />
            )}
          </div>
          <EventSidebar selectedDate={selectedDate} selectedEventType={selectedEventType} getEventsForDate={getEventsForDate} navigate={navigate} onEventTypeChange={setSelectedEventType} />
        </div>
      )}
    </div>
  );
};

export default Calendar;