import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from './DatePicker'; 
import WeekView from './WeekView';     
import MonthView from './MonthView';   
import EventSidebar from './EventSidebar'; 
import ViewToggle from './ViewToggle';   

const API_BASE_URL = 'https://xpress-deployment.onrender.com';

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

interface ApiResponse {
  isSuccess: boolean;
  result: TravelRequest[];
  statusCode: number;
  errorMessages: string[];
}

// Utility functions for UTC date handling
const createUTCDate = (year: number, month: number, day: number): Date => {
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

const getCurrentUTCDate = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
};

const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const parseUTCDateString = (dateString: string): Date => {
  const date = new Date(dateString);
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));
};

const Calendar: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const utcDate = getCurrentUTCDate();
    console.log("Current UTC Date:", utcDate);
    return utcDate;
  });

  const [view, setView] = useState<'Month' | 'Week'>('Month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    return getCurrentUTCDate();
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
      const firstDayOfMonth = createUTCDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
      startDateObj = new Date(firstDayOfMonth);
      startDateObj.setUTCDate(firstDayOfMonth.getUTCDate() - firstDayOfMonth.getUTCDay());
      endDateObj = new Date(startDateObj);
      endDateObj.setUTCDate(startDateObj.getUTCDate() + 41); 
    } else { 
      startDateObj = new Date(date);
      startDateObj.setUTCDate(date.getUTCDate() - date.getUTCDay()); 
      endDateObj = new Date(startDateObj);
      endDateObj.setUTCDate(startDateObj.getUTCDate() + 6); 
    }

    return {
      startDate: formatDateForApi(startDateObj),
      endDate: formatDateForApi(endDateObj)
    };
  }, []);

  const getCacheKey = (startDate: string, endDate: string): string => {
    return `${startDate}_${endDate}`;
  };

  const fetchTravelRequestsForRange = useCallback(async (startDate: string, endDate: string): Promise<TravelRequest[]> => {
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
  }, []);

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
  }, [currentDate, view, getVisibleDateRange, cachedRanges, fetchTravelRequestsForRange]);

  useEffect(() => {
    loadDataForCurrentView();
  }, [loadDataForCurrentView]);

  const getEventsForDate = useCallback((dateForEvents: Date | null): TravelEvent[] => {
    if (!dateForEvents || travelRequests.length === 0) {
      return [];
    }
  
    const events: TravelEvent[] = [];
    
    const selectedUTCYear = dateForEvents.getUTCFullYear();
    const selectedUTCMonth = dateForEvents.getUTCMonth(); // 0-11
    const selectedUTCDay = dateForEvents.getUTCDate();
  
    travelRequests.forEach((request: TravelRequest) => {
      if (request.outboundDepartureDate) {
        const eventDateObj = parseUTCDateString(request.outboundDepartureDate);
        if (
          eventDateObj.getUTCFullYear() === selectedUTCYear &&
          eventDateObj.getUTCMonth() === selectedUTCMonth &&
          eventDateObj.getUTCDate() === selectedUTCDay
        ) {
          events.push({ type: 'OutboundDeparture', request });
        }
      }
  
      if (request.returnArrivalDate) {
        const eventDateObj = parseUTCDateString(request.returnArrivalDate);
        if (
          eventDateObj.getUTCFullYear() === selectedUTCYear &&
          eventDateObj.getUTCMonth() === selectedUTCMonth &&
          eventDateObj.getUTCDate() === selectedUTCDay
        ) {
          events.push({ type: 'ReturnArrival', request });
        }
      }
    });
    return events;
  }, [travelRequests]);

  useEffect(() => {
    if (selectedDate === null) {
      const todayUTC = getCurrentUTCDate();
      setSelectedDate(todayUTC);
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
  }, [selectedDate, getEventsForDate, selectedEventType]);

  const getDaysForMonth = (year: number, month: number): DayInfo[] => {
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const firstDayOfMonth = createUTCDate(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getUTCDay();
    const daysInPrevMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const prevMonthDays: DayInfo[] = Array.from({ length: firstDayOfWeek }, (_, i) => ({
        day: daysInPrevMonth - firstDayOfWeek + i + 1,
        currentMonth: false,
        month: month === 0 ? 11 : month - 1,
        year: month === 0 ? year - 1 : year,
    }));

    const currentMonthDays: DayInfo[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1, 
      currentMonth: true, 
      month: month, 
      year: year,
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
      if (view === 'Month') {
        newDate.setUTCMonth(newDate.getUTCMonth() + monthChange, 1);
      } else {
        newDate.setUTCDate(newDate.getUTCDate() + (monthChange * 7));
      }
      // Ensure time is set to UTC midnight
      newDate.setUTCHours(0, 0, 0, 0);
      return newDate;
    });
    
    if (selectedDate) {
      setSelectedDate(prevSelected => {
        if (!prevSelected) return null;
        const newSelected = new Date(prevSelected);
        const monthChange = direction === 'prev' ? -1 : 1;
        if (view === 'Month') {
          newSelected.setUTCMonth(newSelected.getUTCMonth() + monthChange);
        } else {
          newSelected.setUTCDate(newSelected.getUTCDate() + (monthChange * 7));
        }
        newSelected.setUTCHours(0, 0, 0, 0);
        return newSelected;
      });
    }
    setSelectedEventType(null);
  };

  const handlePrev = () => handlePrevNext('prev');
  const handleNext = () => handlePrevNext('next');

  const handleDayCellClick = (dayInfo: DayInfo): void => {
    const clickedDate = createUTCDate(dayInfo.year, dayInfo.month, dayInfo.day);
    setSelectedDate(clickedDate);

    if (view === 'Month' && (dayInfo.month !== currentDate.getUTCMonth() || dayInfo.year !== currentDate.getUTCFullYear())) {
        setCurrentDate(createUTCDate(dayInfo.year, dayInfo.month, 1));
    } else if (view === 'Week') {
        const weekStartForClicked = new Date(clickedDate);
        weekStartForClicked.setUTCDate(clickedDate.getUTCDate() - clickedDate.getUTCDay());
        weekStartForClicked.setUTCHours(0, 0, 0, 0);
        
        const currentViewWeekStart = new Date(currentDate);
        currentViewWeekStart.setUTCDate(currentDate.getUTCDate() - currentDate.getUTCDay());
        currentViewWeekStart.setUTCHours(0, 0, 0, 0);

        if(weekStartForClicked.getTime() !== currentViewWeekStart.getTime()){
            setCurrentDate(weekStartForClicked);
        }
    }
  };

  
  const handleDateSelect = (year: number, month: number, day?: number): void => {
    const dayToUse = day ?? 1; // Use 1 if day is undefined
    const selectedFromPicker = createUTCDate(year, month, dayToUse);
    setSelectedDate(selectedFromPicker);
    
    if (view === 'Month') {
      setCurrentDate(createUTCDate(year, month, 1));
    } else {
        const startOfWeek = new Date(selectedFromPicker);
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());
        setCurrentDate(createUTCDate(
          startOfWeek.getUTCFullYear(), 
          startOfWeek.getUTCMonth(), 
          startOfWeek.getUTCDate()
        ));
    }
  };

  const handleViewChange = (newView: 'Month' | 'Week'): void => {
    setView(newView);
    if (selectedDate) {
      if (newView === 'Week') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setUTCDate(selectedDate.getUTCDate() - selectedDate.getUTCDay());
        setCurrentDate(createUTCDate(
          startOfWeek.getUTCFullYear(), 
          startOfWeek.getUTCMonth(), 
          startOfWeek.getUTCDate()
        ));
      } else {
        setCurrentDate(createUTCDate(
          selectedDate.getUTCFullYear(), 
          selectedDate.getUTCMonth(), 
          1
        ));
      }
    }
  };

  const formatWeekRange = (): string => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setUTCDate(currentDate.getUTCDate() - currentDate.getUTCDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      timeZone: 'UTC' 
    };
    const yearOpt: Intl.DateTimeFormatOptions = { 
      ...options, 
      year: 'numeric', 
      timeZone: 'UTC' 
    };
    
    if (startOfWeek.getUTCFullYear() !== endOfWeek.getUTCFullYear()) {
      return `${startOfWeek.toLocaleDateString('en-US', yearOpt)} - ${endOfWeek.toLocaleDateString('en-US', yearOpt)}`;
    }
    if (startOfWeek.getUTCMonth() !== endOfWeek.getUTCMonth()) {
      return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}, ${endOfWeek.getUTCFullYear()}`;
    }
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} - ${endOfWeek.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })}, ${endOfWeek.getUTCFullYear()}`;
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
              <DatePicker 
                currentDate={currentDate} 
                view={view} 
                onDateSelect={handleDateSelect} 
                formatWeekRange={formatWeekRange} 
              />
              <div className="flex items-center">
                <button 
                  aria-label="Previous period" 
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md" 
                  onClick={handlePrev}
                > 
                  {'<'} 
                </button>
                <button 
                  aria-label="Next period" 
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md" 
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