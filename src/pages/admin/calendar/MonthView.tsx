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

  // Create today's date in UTC for correct comparison
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
          // Create the date for each cell in UTC
          const date = new Date(Date.UTC(dayInfo.year, dayInfo.month, dayInfo.day));
          
          const events = getEventsForDate(date);
          const counts = getEventCounts(events);

          const isSelected =
            selectedDate &&
            selectedDate.getTime() === date.getTime();

          const isToday = date.getTime() === todayUTC.getTime();

          // Enhanced styling with clear light blue borders
          let cellClasses = `h-16 flex flex-col p-1 rounded-md cursor-pointer relative transition-all duration-200 `;

          if (isSelected) {
            // Selected date: prominent light blue border and background
            cellClasses += `bg-blue-100 border-3 border-blue-500 shadow-lg`;
          } else if (isToday) {
            // Today: lighter blue border with subtle background
            cellClasses += `bg-blue-50 border-2 border-blue-300 shadow-md`;
          } else if (dayInfo.currentMonth) {
            // Current month days: normal styling
            cellClasses += `bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md hover:border-gray-300`;
          } else {
            // Previous/next month days: muted styling
            cellClasses += `bg-gray-100 border border-gray-200 opacity-50`;
          }

          return (
            <div
              key={`month-day-${index}`}
              className={cellClasses}
              onClick={() => onDayCellClick(dayInfo)}
            >
              <span
                className={`text-center text-sm ${
                  !dayInfo.currentMonth 
                    ? 'text-gray-400 opacity-50 font-light' 
                    : isSelected 
                      ? 'font-bold text-blue-700' 
                      : isToday 
                        ? 'font-bold text-blue-600' 
                        : 'font-medium text-gray-800'
                }`}
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