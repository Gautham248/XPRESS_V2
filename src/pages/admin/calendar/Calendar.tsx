// src/pages/admin/calendar/Calendar.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from './DatePicker'; // Assuming these are in the same directory
import WeekView from './WeekView';     // or adjust paths as needed
import MonthView from './MonthView';
import EventSidebar from './EventSidebar';
import ViewToggle from './ViewToggle';

export interface TravelRequest {
  requestId: number;
  departureDate: string; // Assume these dates are UTC strings from API (e.g., "2023-10-26T10:00:00Z")
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

interface DayInfo { // Used by MonthView, typically for local calendar display
  day: number;
  currentMonth: boolean;
  month: number; // 0-11
  year: number;
}

const Calendar: React.FC = () => {
  const navigate = useNavigate();

  // currentDate will store a Date object.
  // Internally, Date objects hold a UTC timestamp.
  // We initialize it to represent "now" in IST for display purposes.
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date(); // In tests, this 'now' is mocked to a specific UTC time
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
        // Replace with your actual API endpoint
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
    // This effect sets the selectedDate to "today IST" when the component mounts or travelRequests load.
    const today = new Date(); // In tests, 'today' is mocked
    const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(today.getTime() + istOffsetMilliseconds);

    setSelectedDate(todayIST); // select "today"

    // Check for events on "today" to pre-select an event type if any
    const todayEvents = getEventsForDate(todayIST);
    if (todayEvents.length > 0) {
      setSelectedEventType(todayEvents[0].type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelRequests]); // Only re-run if travelRequests changes

  const getEventsForDate = (dateForEvents: Date): TravelEvent[] => {
    const events: TravelEvent[] = [];
    const validStatuses = ['Pending', 'Tickets Dispatched', 'In-transit', 'Returned', 'Closed'];

    // Get UTC components of the date we're checking events for
    const targetUTCDate = dateForEvents.getUTCDate();
    const targetUTCMonth = dateForEvents.getUTCMonth();
    const targetUTCFullYear = dateForEvents.getUTCFullYear();

    travelRequests.forEach((request: TravelRequest) => {
      // Assume request.departureDate and request.returnDate are UTC strings from API
      const depDate = new Date(request.departureDate); // Parses into a Date object (UTC if 'Z' present)
      const retDate = new Date(request.returnDate);

      // Compare UTC day, month, and year
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
    // This function is for display logic (MonthView), so using local date components is typical.
    // 'year' and 'month' (0-11) are for the month being displayed.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon, ...
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

    const totalCells = 42; // 6 weeks * 7 days
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
    const newDate = new Date(currentDate.getTime()); // Clone to preserve original UTC timestamp
    if (view === 'Month') {
      newDate.setUTCMonth(newDate.getUTCMonth() - 1, 1); // Set to 1st day of the previous month (UTC)
      // Optionally, reset time to maintain consistency if your currentDate has a specific time
      // For month view, typically midnight UTC of the 1st is fine.
      // If you want to maintain the IST offset time part:
      newDate.setUTCHours(currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds(), currentDate.getUTCMilliseconds());
      // Or set to a fixed time, e.g., UTC midnight for simplicity if the time component doesn't matter for month changes:
      // newDate.setUTCHours(0, 0, 0, 0);
    } else { // Week view
      newDate.setUTCDate(newDate.getUTCDate() - 7);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleNext = (): void => {
    const newDate = new Date(currentDate.getTime()); // Clone
    if (view === 'Month') {
      newDate.setUTCMonth(newDate.getUTCMonth() + 1, 1); // Set to 1st day of the next month (UTC)
      // Maintain original time component (which includes IST offset)
      newDate.setUTCHours(currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds(), currentDate.getUTCMilliseconds());
      // Or set to UTC midnight for simplicity:
      // newDate.setUTCHours(0, 0, 0, 0);
    } else { // Week view
      newDate.setUTCDate(newDate.getUTCDate() + 7);
    }
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleDateSelect = (day: number, month: number, year: number): void => {
    // day, month, year are from the DatePicker, assumed to be local calendar components
    // Construct a date that represents the start of that day in the local timezone
    const clickedDateLocal = new Date(year, month, day);

    // Convert this local day to a UTC timestamp, then apply the IST offset logic
    // to maintain consistency with how `currentDate` and `selectedDate` are handled.
    const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
    // Get UTC timestamp of the start of the clicked local day, then add IST offset
    const selectedDateWithIST = new Date(clickedDateLocal.getTime() - (clickedDateLocal.getTimezoneOffset() * 60000) + istOffsetMilliseconds);


    if (view === 'Month') {
      // For month view, set currentDate to the 1st of the selected month, maintaining time
      const firstOfSelectedMonth = new Date(selectedDateWithIST.getTime());
      firstOfSelectedMonth.setUTCDate(1);
      setCurrentDate(firstOfSelectedMonth);
    } else { // Week view
      // For week view, set currentDate to the start of the week containing the selected date
      const startOfSelectedWeek = new Date(selectedDateWithIST.getTime());
      startOfSelectedWeek.setUTCDate(selectedDateWithIST.getUTCDate() - selectedDateWithIST.getUTCDay()); // getUTCDay is 0 for Sun
      setCurrentDate(startOfSelectedWeek);
    }
    // setSelectedDate(selectedDateWithIST); // Select the clicked date itself
    // Resetting selection on date range change is already handled by handlePrev/Next
    // For this function, it's more about setting the range (currentDate)
    setSelectedDate(null); // Or, you might want to set the selected date here
    setSelectedEventType(null);
  };

  const handleViewChange = (newView: 'Month' | 'Week'): void => {
    if (selectedDate && newView === 'Week') {
      // If a date is selected and switching to Week view,
      // set currentDate to the start of the week containing the selectedDate.
      const startOfSelectedWeek = new Date(selectedDate.getTime());
      startOfSelectedWeek.setUTCDate(selectedDate.getUTCDate() - selectedDate.getUTCDay()); // getUTCDay is 0 for Sun
      setCurrentDate(startOfSelectedWeek);
    }
    // If switching to Month view, currentDate usually becomes the 1st of the month.
    // This is implicitly handled if a date is selected via DatePicker, or handlePrev/Next is used.
    // If no date is selected, currentDate remains as is, and MonthView will display based on its month.
    setView(newView);
    setSelectedEventType(null); // Clear event type selection on view change
  };

  const formatWeekRange = (): string => {
    // currentDate is already IST-adjusted. For display, use methods that respect this.
    // Or, for purely date-based display, UTC methods are safer for consistency.
    const startOfWeek = new Date(currentDate.getTime());
    startOfWeek.setUTCDate(currentDate.getUTCDate() - currentDate.getUTCDay()); // Sunday

    const endOfWeek = new Date(startOfWeek.getTime());
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Saturday

    // Use toLocaleDateString for potentially localized formatting if needed,
    // but ensure consistent timezone for display if that's important.
    // For tests, we used toISOString().split('T')[0] which is UTC date.
    // For user display, toLocaleDateString might be better.
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
        <div className="flex flex-col lg:flex-row gap-4"> {/* Responsive layout */}
          <div className="lg:flex-[0.65] bg-white rounded-lg shadow-sm p-4"> {/* Adjusted flex basis */}
            <div className="flex flex-col sm:flex-row items-center mb-4 gap-2 sm:gap-0"> {/* Responsive header */}
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
              <div className="sm:ml-auto mt-2 sm:mt-0"> {/* Margin for spacing */}
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

          <EventSidebar // Will take remaining space on lg, stack on smaller screens
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