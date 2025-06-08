import React from 'react';
import { TravelEvent, DayInfo } from './Calendar'; 
import EventCard from './EventCard';

interface WeekViewProps {
  currentDate: Date;
  getEventsForDate: (date: Date) => TravelEvent[];
  selectedDate: Date | null;
  onDayCellClick: (dayInfo: DayInfo) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  getEventsForDate,
  selectedDate,
  onDayCellClick,
}) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setUTCDate(currentDate.getUTCDate() - currentDate.getUTCDay());

  const weekDays: DayInfo[] = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setUTCDate(startOfWeek.getUTCDate() + i);
    return {
      day: dayDate.getUTCDate(),
      currentMonth: dayDate.getUTCMonth() === currentDate.getUTCMonth(),
      month: dayDate.getUTCMonth(),
      year: dayDate.getUTCFullYear(),
    };
  });

  // Create today's date in UTC for correct comparison
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  const handleDayClick = (dayInfo: DayInfo) => {
    onDayCellClick(dayInfo);
  };

  const renderEventCardsForDay = (dayInfo: DayInfo): JSX.Element[] => {
    // Create the date for each cell in UTC
    const dayDate = new Date(Date.UTC(dayInfo.year, dayInfo.month, dayInfo.day));
    
    const events = getEventsForDate(dayDate);
    const eventCards: JSX.Element[] = [];
    
    const outboundDepartures = events.filter(e => e.type === 'OutboundDeparture');
    const returnArrivals = events.filter(e => e.type === 'ReturnArrival');

    if (outboundDepartures.length > 0) {
      eventCards.push(
        <EventCard
          key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}-outbound`}
          type="OutboundDeparture"
          count={outboundDepartures.length}
          requests={outboundDepartures.map(e => e.request)}
          onClick={() => handleDayClick(dayInfo)}
        />
      );
    }

    if (returnArrivals.length > 0) {
      eventCards.push(
        <EventCard
          key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}-return`}
          type="ReturnArrival"
          count={returnArrivals.length}
          requests={returnArrivals.map(e => e.request)}
          onClick={() => handleDayClick(dayInfo)}
        />
      );
    }
    return eventCards;
  };

  return (
    <div className="h-[calc(100vh-250px)] min-h-[384px]">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 h-full">
        {weekDays.map((dayInfo: DayInfo, index: number) => {
          // Create the date in UTC for comparisons
          const dayDate = new Date(Date.UTC(dayInfo.year, dayInfo.month, dayInfo.day));
          
          const isSelected = selectedDate && selectedDate.getTime() === dayDate.getTime();
          const isToday = dayDate.getTime() === todayUTC.getTime();

          // Enhanced header styling with better contrast
          let headerClasses = `text-center text-xs sm:text-sm font-medium py-2 `;
          if (isSelected) {
            headerClasses += 'text-blue-700 font-bold';
          } else if (isToday) {
            headerClasses += 'text-blue-600 font-bold';
          } else {
            headerClasses += 'text-gray-600';
          }

          // Enhanced day cell styling with distinct borders
          let dayCellClasses = `flex-1 p-1 sm:p-2 rounded-md cursor-pointer transition-all duration-200 overflow-y-auto `;
          
          if (isSelected) {
            // Selected date: prominent blue border and background
            dayCellClasses += `bg-blue-50 border-2 border-blue-500 shadow-lg`;
          } else if (isToday) {
            // Today: light blue border with subtle background
            dayCellClasses += `bg-blue-25 border-2 border-blue-300 shadow-md`;
          } else {
            // Regular dates: light border with hover effects
            dayCellClasses += `bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm`;
          }

          // Container styling for the entire day column
          let containerClasses = `flex flex-col h-full rounded-lg shadow-sm `;
          if (isSelected) {
            containerClasses += `bg-blue-100 border-3 border-blue-400 shadow-lg`;
          } else if (isToday) {
            containerClasses += `bg-blue-50 border-2 border-blue-300 shadow-md`;
          } else {
            containerClasses += `bg-gray-50 border border-gray-200`;
          }

          return (
            <div key={index} className={containerClasses}>
              <div className={headerClasses}>
                <div>{dayDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}</div>
                <div
                  className={`text-lg font-semibold mt-1 cursor-pointer ${
                    isSelected ? 'text-blue-700' : isToday ? 'text-blue-600' : 'text-gray-800'
                  }`}
                  onClick={() => handleDayClick(dayInfo)}
                >
                  {dayInfo.day}
                </div>
              </div>
              <div
                className={dayCellClasses}
                onClick={() => handleDayClick(dayInfo)}
              >
                {renderEventCardsForDay(dayInfo).length > 0 ? (
                  <div className="space-y-1 sm:space-y-2">
                    {renderEventCardsForDay(dayInfo)}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs sm:text-sm text-center pt-4">No events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;