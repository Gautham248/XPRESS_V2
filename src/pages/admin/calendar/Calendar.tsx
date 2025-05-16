import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TravelRequest, mockTravelRequests } from '../../../data/mockData';
import DatePicker from './DatePicker';
import WeekView from './WeekView';
import MonthView from './MonthView';
import EventSidebar from './EventSidebar';
import ViewToggle from './ViewToggle';

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
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset);
  });
  const [view, setView] = useState<'Month' | 'Week'>('Week');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<'Departure' | 'Return' | null>(null);

  const excludedStatuses: string[] = ['Tickets Dispatched', 'Rejected', 'In Transit', 'Closed', 'Returned'];
  const filteredRequests: TravelRequest[] = mockTravelRequests;

  const getEventsForDate = (date: Date): TravelEvent[] => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const adjustedDate = new Date(date.getTime() + istOffset);
    const events: TravelEvent[] = [];

    filteredRequests.forEach((request: TravelRequest) => {
      const depDate = new Date(request.departureDate);
      const retDate = new Date(request.returnDate);
      const adjustedDepDate = new Date(depDate.getTime() + istOffset);
      const adjustedRetDate = new Date(retDate.getTime() + istOffset);

      const isDeparture =
        adjustedDepDate.getFullYear() === adjustedDate.getFullYear() &&
        adjustedDepDate.getMonth() === adjustedDate.getMonth() &&
        adjustedDepDate.getDate() === adjustedDate.getDate();

      const isReturn =
        adjustedRetDate.getFullYear() === adjustedDate.getFullYear() &&
        adjustedRetDate.getMonth() === adjustedDate.getMonth() &&
        adjustedRetDate.getDate() === adjustedDate.getDate();

      if (isDeparture && request.status === 'Tickets Dispatched') {
        events.push({ type: 'Departure', request });
      }
      if (isReturn && request.status === 'Tickets Dispatched') {
        events.push({ type: 'Return', request });
      }
    });

    return events;
  };

  const getDaysForMonth = (year: number, month: number): DayInfo[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonthDays: DayInfo[] = Array.from({ length: firstDayOfMonth }, (_, i) => ({
      day: daysInPrevMonth - firstDayOfMonth + i + 1, // Fixed: Changed 'days' to 'day'
      currentMonth: false,
      month: month - 1 < 0 ? 11 : month - 1,
      year: month - 1 < 0 ? year - 1 : year,
    }));

    const currentMonthDays: DayInfo[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      month: month,
      year: year,
    }));

    const totalDaysDisplayed = 42;
    const nextMonthDays: DayInfo[] = Array.from(
      { length: totalDaysDisplayed - (prevMonthDays.length + currentMonthDays.length) },
      (_, i) => ({
        day: i + 1,
        currentMonth: false,
        month: month + 1 > 11 ? 0 : month + 1,
        year: month + 1 > 11 ? year + 1 : year,
      })
    );

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handlePrev = (): void => {
    if (view === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    }
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleNext = (): void => {
    if (view === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    }
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleDateSelect = (day: number, month: number, year: number): void => {
    const selected = new Date(year, month, day);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(selected.getTime() + istOffset);

    if (view === 'Month') {
      setCurrentDate(new Date(istDate.getFullYear(), istDate.getMonth(), 1));
    } else {
      const dayOfWeek = istDate.getDay();
      const startOfSelectedWeek = new Date(istDate);
      startOfSelectedWeek.setDate(istDate.getDate() - dayOfWeek);
      setCurrentDate(startOfSelectedWeek);
    }
    setSelectedDate(null);
    setSelectedEventType(null);
  };

  const handleViewChange = (newView: 'Month' | 'Week'): void => {
    if (selectedDate && newView === 'Week') {
      const dayOfWeek = selectedDate.getDay();
      const startOfSelectedWeek = new Date(selectedDate);
      startOfSelectedWeek.setDate(selectedDate.getDate() - dayOfWeek);
      setCurrentDate(startOfSelectedWeek);
    }
    setView(newView);
    setSelectedEventType(null);
  };

  const formatWeekRange = (): string => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${end.getFullYear()}`;
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Travel Calendar</h1>
      </div>

      <div className="flex gap-4">
        <div className="flex-[0.65] bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-4">
            <DatePicker
              currentDate={currentDate}
              view={view}
              onDateSelect={handleDateSelect}
              formatWeekRange={formatWeekRange}
            />
            <div className="flex items-center">
              <button
                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                onClick={handlePrev}
              >
                {'<'}
              </button>
              <button
                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                onClick={handleNext}
              >
                {'>'}
              </button>
            </div>
            <div className="ml-auto">
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
    </div>
  );
};

export default Calendar;