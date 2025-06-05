import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from './DatePicker';
import WeekView from './WeekView';
import MonthView from './MonthView';
import EventSidebar from './EventSidebar';
import ViewToggle from './ViewToggle';

const API_BASE_URL = 'http://localhost:5030';

export interface TravelRequest {
  requestId: string;
  outboundDepartureDate: string;
  outboundArrivalDate: string;
  returnDepartureDate: string | null;
  returnArrivalDate: string | null;
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

// API Response interface
interface ApiResponse {
  isSuccess: boolean;
  result: TravelRequest[];
  statusCode: number;
  errorMessages: string[];
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date(2025, 5, 5); // June 5, 2025
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  });

  const [view, setView] = useState<'Month' | 'Week'>('Month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const now = new Date(2025, 5, 5); // June 5, 2025
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  });
  const [selectedEventType, setSelectedEventType] = useState<'OutboundDeparture' | 'ReturnArrival' | null>(null);
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedRanges, setCachedRanges] = useState<Map<string, TravelRequest[]>>(new Map());

  const getVisibleDateRange = useCallback((date: Date, currentView: 'Month' | 'Week'): DateRange => {
    let startDate: Date;
    let endDate: Date;

    if (currentView === 'Month') {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      startDate = new Date(firstDayOfMonth);
      startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 41);
    } else {
      startDate = new Date(date);
      startDate.setDate(date.getDate() - date.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }

    const formatDateForApi = (d: Date) => d.toISOString().split('T')[0];

    return {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate)
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
        {
          params: {
            startDate,
            endDate
          }
        }
      );
      
      // Handle the new API response structure
      if (response.data.isSuccess) {
        return response.data.result || [];
      } else {
        const errorMessage = response.data.errorMessages?.join(', ') || 'Unknown error occurred';
        setError(`Failed to load travel requests: ${errorMessage}`);
        return [];
      }
    } catch (err) {
      console.error('Error fetching travel requests:', err);
      if (axios.isAxiosError(err) && err.response) {
        // Try to handle both old and new error response formats
        const errorData = err.response.data;
        let errorMessage = 'Server error';
        
        if (errorData?.errorMessages && Array.isArray(errorData.errorMessages)) {
          errorMessage = errorData.errorMessages.join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (err.response.statusText) {
          errorMessage = err.response.statusText;
        }
        
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
  }, [currentDate, view, getVisibleDateRange, cachedRanges]);

  useEffect(() => {
    loadDataForCurrentView();
  }, [loadDataForCurrentView]);

  // Only set initial selectedDate if it's null (prevents override on travelRequests change)
  useEffect(() => {
    if (selectedDate === null) {
      const today = new Date(2025, 5, 5); // June 5, 2025
      const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      setSelectedDate(normalizedToday);
    }

    if (selectedDate) {
      const events = getEventsForDate(selectedDate);
      if (events.length > 0) {
        if (!selectedEventType) {
          setSelectedEventType(events[0].type);
        }
      } else {
        setSelectedEventType(null);
      }
    }
  }, [travelRequests, selectedDate, selectedEventType]);

  const getEventsForDate = (dateForEvents: Date | null): TravelEvent[] => {
    if (!dateForEvents || travelRequests.length === 0) {
      return [];
    }

    const events: TravelEvent[] = [];
    const targetDate = new Date(dateForEvents.getFullYear(), dateForEvents.getMonth(), dateForEvents.getDate(), 0, 0, 0, 0);

    travelRequests.forEach((request: TravelRequest) => {
      const outboundDepDate = new Date(request.outboundDepartureDate);
      const normalizedOutboundDepDate = new Date(outboundDepDate.getFullYear(), outboundDepDate.getMonth(), outboundDepDate.getDate(), 0, 0, 0, 0);
      if (
        normalizedOutboundDepDate.getFullYear() === targetDate.getFullYear() &&
        normalizedOutboundDepDate.getMonth() === targetDate.getMonth() &&
        normalizedOutboundDepDate.getDate() === targetDate.getDate()
      ) {
        events.push({ type: 'OutboundDeparture', request });
      }

      if (request.returnArrivalDate) {
        const returnArrDate = new Date(request.returnArrivalDate);
        const normalizedReturnArrDate = new Date(returnArrDate.getFullYear(), returnArrDate.getMonth(), returnArrDate.getDate(), 0, 0, 0, 0);
        if (
          normalizedReturnArrDate.getFullYear() === targetDate.getFullYear() &&
          normalizedReturnArrDate.getMonth() === targetDate.getMonth() &&
          normalizedReturnArrDate.getDate() === targetDate.getDate()
        ) {
          events.push({ type: 'ReturnArrival', request });
        }
      }
    });
    return events;
  };

  const getDaysForMonth = (year: number, month: number): DayInfo[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonthDays: DayInfo[] = [];
    for (let i = firstDayOfMonth; i > 0; i--) {
      prevMonthDays.push({
        day: daysInPrevMonth - i + 1,
        currentMonth: false,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
      });
    }

    const currentMonthDays: DayInfo[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      month: month,
      year: year,
    }));

    const totalCells = 42;
    const nextMonthDaysCount = totalCells - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays: DayInfo[] = [];

    if (nextMonthDaysCount > 0) {
      for (let i = 1; i <= nextMonthDaysCount; i++) {
        nextMonthDays.push({
          day: i,
          currentMonth: false,
          month: month === 11 ? 0 : month + 1,
          year: month === 11 ? year + 1 : year,
        });
      }
    }
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handlePrev = (): void => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (view === 'Month') {
        newDate.setMonth(newDate.getMonth() - 1, 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
    // Update selectedDate to the same day in the new month/week if possible
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (view === 'Month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
    }
    setSelectedEventType(null);
  };

  const handleNext = (): void => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (view === 'Month') {
        newDate.setMonth(newDate.getMonth() + 1, 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
    // Update selectedDate to the same day in the new month/week if possible
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (view === 'Month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
    }
    setSelectedEventType(null);
  };

  const handleDayCellClick = (dayInfo: DayInfo): void => {
    const clickedDate = new Date(dayInfo.year, dayInfo.month, dayInfo.day);
    clickedDate.setHours(0, 0, 0, 0);
    setSelectedDate(clickedDate);

    const newCurrentDate = new Date(dayInfo.year, dayInfo.month, 1);
    newCurrentDate.setHours(0, 0, 0, 0);
    setCurrentDate(newCurrentDate);

    if (view === 'Week') {
      const currentWeekStart = new Date(currentDate);
      currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      if (clickedDate < currentWeekStart || clickedDate > currentWeekEnd) {
        const newWeekDate = new Date(dayInfo.year, dayInfo.month, dayInfo.day - clickedDate.getDay());
        newWeekDate.setHours(0, 0, 0, 0);
        setCurrentDate(newWeekDate);
      }
    }

    const eventsOnSelectedDate = getEventsForDate(clickedDate);
    if (eventsOnSelectedDate.length > 0) {
      setSelectedEventType(eventsOnSelectedDate[0].type);
    } else {
      setSelectedEventType(null);
    }
  };

  const handleDateSelect = (year: number, month: number, day: number): void => {
    const selectedFromPicker = new Date(year, month, day);
    selectedFromPicker.setHours(0, 0, 0, 0);

    const newCurrentDate = new Date(year, month, 1);
    newCurrentDate.setHours(0, 0, 0, 0);
    setCurrentDate(newCurrentDate);

    setSelectedDate(selectedFromPicker);

    const eventsOnSelectedDate = getEventsForDate(selectedFromPicker);
    if (eventsOnSelectedDate.length > 0) {
      setSelectedEventType(eventsOnSelectedDate[0].type);
    } else {
      setSelectedEventType(null);
    }
  };

  const handleViewChange = (newView: 'Month' | 'Week'): void => {
    setView(newView);
    if (newView === 'Week' && selectedDate) {
      const startOfWeekOfSelectedDate = new Date(selectedDate);
      startOfWeekOfSelectedDate.setDate(selectedDate.getDate() - selectedDate.getDay());
      startOfWeekOfSelectedDate.setHours(0, 0, 0, 0);
      setCurrentDate(startOfWeekOfSelectedDate);
    } else if (newView === 'Month' && selectedDate) {
      const newCurrentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      newCurrentDate.setHours(0, 0, 0, 0);
      setCurrentDate(newCurrentDate);
    }
  };

  const formatWeekRange = (): string => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}, ${endOfWeek.getFullYear()}`;
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Travel Calendar</h1>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading travel requests...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:flex-[0.65] bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-center mb-4 gap-2 sm:gap-0">
              <DatePicker
                currentDate={currentDate}
                view={view}
                onDateSelect={handleDateSelect}
                formatWeekRange={formatWeekRange}
              />
              <div className="flex items-center">
                <button
                  aria-label="Previous period"
                  className="px-2 py-1 text-gray-600 hover:text-gray-800"
                  onClick={handlePrev}
                >
                  {'<'}
                </button>
                <button
                  aria-label="Next period"
                  className="px-2 py-1 text-gray-600 hover:text-gray-800"
                  onClick={handleNext}
                >
                  {'>'}
                </button>
              </div>
              <div className="sm:ml-auto mt-2 sm:mt-0">
                <ViewToggle view={view} onViewChange={handleViewChange} />
              </div>
            </div>

            {view === 'Month' ? (
              <MonthView
                currentDate={currentDate}
                getDaysForMonth={getDaysForMonth}
                getEventsForDate={getEventsForDate}
                selectedDate={selectedDate}
                onDayCellClick={handleDayCellClick}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                getEventsForDate={getEventsForDate}
                selectedDate={selectedDate}
                onDayCellClick={handleDayCellClick}
              />
            )}
          </div>

          <EventSidebar
            selectedDate={selectedDate}
            selectedEventType={selectedEventType}
            getEventsForDate={getEventsForDate}
            navigate={navigate}
            onEventTypeChange={setSelectedEventType}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;