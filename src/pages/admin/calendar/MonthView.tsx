import React from 'react';
import { TravelEvent, DayInfo } from './Calendar';

interface MonthViewProps {
  currentDate: Date;
  getDaysForMonth: (year: number, month: number) => DayInfo[];
  getEventsForDate: (date: Date) => TravelEvent[];
  selectedDate: Date | null;
  onDayCellClick: (dayInfo: DayInfo) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  getDaysForMonth,
  getEventsForDate,
  selectedDate,
  onDayCellClick,
}) => {
  const monthDays: DayInfo[] = getDaysForMonth(currentDate.getUTCFullYear(), currentDate.getUTCMonth());
  const weekdayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // --- FIX #1: Create today's date in UTC for correct comparison ---
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));


  const getEventCounts = (events: TravelEvent[]): { OutboundDeparture: number; ReturnArrival: number } => {
    const counts = {
      OutboundDeparture: 0,
      ReturnArrival: 0,
    };

    events.forEach((event: TravelEvent) => {
      if (event.type === 'OutboundDeparture') counts.OutboundDeparture++;
      if (event.type === 'ReturnArrival') counts.ReturnArrival++;
    });

    return counts;
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {weekdayNames.map((day: string) => (
          <div key={day} className="text-center text-gray-600 font-medium">
            {day}
          </div>
        ))}
        {monthDays.map((dayInfo: DayInfo, index: number) => {
          // --- FIX #2: Create the date for each cell in UTC ---
          const date = new Date(Date.UTC(dayInfo.year, dayInfo.month, dayInfo.day));
          
          const events = getEventsForDate(date);
          const counts = getEventCounts(events);

          const isSelected =
            selectedDate &&
            selectedDate.getTime() === date.getTime();

          const isToday = date.getTime() === todayUTC.getTime();

          return (
            <div
              key={`month-day-${index}`}
              className={`h-16 flex flex-col p-1 rounded-md cursor-pointer relative
                ${dayInfo.currentMonth ? 'bg-white border border-gray-200 shadow-sm' : 'bg-gray-100 opacity-50'}
                ${isSelected ? 'bg-blue-100 border-2 border-blue-400' : ''}
                ${isToday && !isSelected ? 'bg-blue-50' : ''}
                hover:bg-gray-200 hover:shadow-sm hover:border hover:border-gray-300 transition-all duration-200`}
              onClick={() => onDayCellClick(dayInfo)}
            >
              <span
                className={`text-gray-800 text-center ${
                  !dayInfo.currentMonth ? 'text-gray-400 opacity-50 font-light' : 'font-medium'
                } ${isToday ? 'font-bold text-blue-600' : ''}`}
              >
                {dayInfo.day}
              </span>
              <div className="absolute bottom-1.5 right-1 flex space-x-1">
                {counts.OutboundDeparture > 0 && (
                  <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs" title={`${counts.OutboundDeparture} Outbound Departures`}>
                    {counts.OutboundDeparture}
                  </div>
                )}
                {counts.ReturnArrival > 0 && (
                  <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs" title={`${counts.ReturnArrival} Return Arrivals`}>
                    {counts.ReturnArrival}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;