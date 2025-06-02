// src/pages/admin/calendar/Calendar.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from './DatePicker'; 
import WeekView from './WeekView';     
import MonthView from './MonthView';
import EventSidebar from './EventSidebar';
import ViewToggle from './ViewToggle';

export interface TravelRequest {
  requestId: number;
  departureDate: string; 
  returnDate: string;
  employeeName: string;
  sourcePlace: string;
  sourceCountry: string;
  destinationPlace: string;
  destinationCountry: string;
  currentStatusName: string;
}

export interface TravelEvent {
  type: 'Departure' | 'Return';
  request: TravelRequest;
}

interface DayInfo { 
  day: number;
  currentMonth: boolean;
  month: number; 
  year: number;
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffsetMilliseconds);
  });

  const [view, setView] = useState<'Month' | 'Week'>('Week');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'Departure' | 'Return' | null>(null);
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTravelRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:5171/api/TravelRequest/Calendar');
        setTravelRequests(response.data);
      } catch (err) {
        console.error('Error fetching travel requests:', err);
        setError('Failed to load travel requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTravelRequests();
  }, []);

  useEffect(() => {
    const today = new Date();
    const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(today.getTime() + istOffsetMilliseconds);

    setSelectedDate(todayIST);

    const todayEvents = getEventsForDate(todayIST);
    if (todayEvents.length > 0) {
      setSelectedEventType(todayEvents[0].type);
    }
    
  }, [travelRequests]); 

  const getEventsForDate = (dateForEvents: Date | null): TravelEvent[] => {
    
    if (!dateForEvents) {
      return [];
    }

    const events: TravelEvent[] = [];
    const validStatuses = ['Pending', 'Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];

  
    const localYear = dateForEvents.getFullYear();
    const localMonth = dateForEvents.getMonth(); 
    const localDay = dateForEvents.getDate();

    const targetUTCFullYear = localYear;
    const targetUTCMonth = localMonth;
    const targetUTCDate = localDay;

    travelRequests.forEach((request: TravelRequest) => {
      const depDate = new Date(request.departureDate);
      const retDate = new Date(request.returnDate);

      const isDeparture =
        depDate.getUTCFullYear() === targetUTCFullYear &&
        depDate.getUTCMonth() === targetUTCMonth &&
        depDate.getUTCDate() === targetUTCDate;

      const isReturn =
        retDate.getUTCFullYear() === targetUTCFullYear &&
        retDate.getUTCMonth() === targetUTCMonth &&
        retDate.getUTCDate() === targetUTCDate;

      if (isDeparture && validStatuses.includes(request.currentStatusName)) {
        events.push({ type: 'Departure', request });
      }
      if (isReturn && validStatuses.includes(request.currentStatusName)) {
        events.push({ type: 'Return', request });
      }
    });
    return events;
  };


  const getDaysForMonth = (year: number, month: number): DayInfo[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonthDays: DayInfo[] = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const day = daysInPrevMonth - firstDayOfMonth + i + 1;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      return { day, currentMonth: false, month: prevMonth, year: prevYear };
    });

    const currentMonthDays: DayInfo[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      month: month,
      year: year,
    }));

    const totalCells = 42;
    const nextMonthDaysCount = totalCells - (prevMonthDays.length + currentMonthDays.length);

    const nextMonthDays: DayInfo[] = Array.from({ length: nextMonthDaysCount > 0 ? nextMonthDaysCount : 0 }, (_, i) => {
      const day = i + 1;
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      return { day, currentMonth: false, month: nextMonth, year: nextYear };
    });

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handlePrev = (): void => {
    const newDate = new Date(currentDate.getTime());
    if (view === 'Month') {
      newDate.setUTCMonth(newDate.getUTCMonth() - 1, 1);
      newDate.setUTCHours(currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds(), currentDate.getUTCMilliseconds());
    } else {
      newDate.setUTCDate(newDate.getUTCDate() - 7);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleNext = (): void => {
    const newDate = new Date(currentDate.getTime());
    if (view === 'Month') {
      newDate.setUTCMonth(newDate.getUTCMonth() + 1, 1);
      newDate.setUTCHours(currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds(), currentDate.getUTCMilliseconds());
    } else {
      newDate.setUTCDate(newDate.getUTCDate() + 7);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleDateSelect = (day: number, month: number, year: number): void => {
    const clickedDateLocal = new Date(year, month, day);
    const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
    const selectedDateWithIST = new Date(clickedDateLocal.getTime() - (clickedDateLocal.getTimezoneOffset() * 60000) + istOffsetMilliseconds);

    if (view === 'Month') {
      const firstOfSelectedMonth = new Date(selectedDateWithIST.getTime());
      firstOfSelectedMonth.setUTCDate(1);
      setCurrentDate(firstOfSelectedMonth);
    } else {
      const startOfSelectedWeek = new Date(selectedDateWithIST.getTime());
      startOfSelectedWeek.setUTCDate(selectedDateWithIST.getUTCDate() - selectedDateWithIST.getUTCDay());
      setCurrentDate(startOfSelectedWeek);
    }
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleViewChange = (newView: 'Month' | 'Week'): void => {
    if (selectedDate && newView === 'Week') {
      const startOfSelectedWeek = new Date(selectedDate.getTime());
      startOfSelectedWeek.setUTCDate(selectedDate.getUTCDate() - selectedDate.getUTCDay());
      setCurrentDate(startOfSelectedWeek);
    }
    setView(newView);
    setSelectedEventType(null);
  };

  const formatWeekRange = (): string => {
    const startOfWeek = new Date(currentDate.getTime());
    startOfWeek.setUTCDate(currentDate.getUTCDate() - currentDate.getUTCDay());

    const endOfWeek = new Date(startOfWeek.getTime());
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

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
                setSelectedDate={setSelectedDate}
                setSelectedEventType={setSelectedEventType}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                getEventsForDate={getEventsForDate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                setSelectedEventType={setSelectedEventType}
              />
            )}
          </div>

          <EventSidebar
            selectedDate={selectedDate}
            selectedEventType={selectedEventType}
            getEventsForDate={getEventsForDate}
            navigate={navigate}
            view={view}
            currentDate={currentDate}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;