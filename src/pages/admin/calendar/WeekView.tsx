// src/pages/admin/calendar/WeekView.tsx
import React from 'react';
import { TravelEvent, DayInfo, TravelRequest } from './Calendar'; // Import DayInfo and TravelRequest
import EventCard from './EventCard'; // Assuming EventCard is designed for these event types

interface WeekViewProps {
  currentDate: Date;
  getEventsForDate: (date: Date) => TravelEvent[]; // Uses updated TravelEvent
  selectedDate: Date | null;
  onDayCellClick: (dayInfo: DayInfo) => void; // New prop
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  getEventsForDate,
  selectedDate,
  onDayCellClick, // Use this prop
}) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Ensure start of week is Sunday

  const weekDays: DayInfo[] = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    return {
      day: dayDate.getDate(),
      currentMonth: dayDate.getMonth() === currentDate.getMonth(), // Check if day is in current view's primary month
      month: dayDate.getMonth(),
      year: dayDate.getFullYear(),
    };
  });

  const today = new Date(); // Use local today

  // Handle day click - this will show both return and departure events
  const handleDayClick = (dayInfo: DayInfo) => {
    onDayCellClick(dayInfo);
  };

  // This function now prepares data for EventCard
  const renderEventCardsForDay = (dayInfo: DayInfo): JSX.Element[] => {
    const dayDate = new Date(dayInfo.year, dayInfo.month, dayInfo.day);
    const events = getEventsForDate(dayDate);
    const eventCards: JSX.Element[] = [];

    const outboundDepartures = events.filter(e => e.type === 'OutboundDeparture');
    const returnArrivals = events.filter(e => e.type === 'ReturnArrival');

    if (outboundDepartures.length > 0) {
      eventCards.push(
        <EventCard
          key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}-outbound`}
          type="OutboundDeparture" // Ensure EventCard handles this type
          count={outboundDepartures.length}
          requests={outboundDepartures.map(e => e.request)} // Pass requests to EventCard
          onClick={(e) => {
           
            handleDayClick(dayInfo); // Still trigger day selection to show both types
          }}
        />
      );
    }

    if (returnArrivals.length > 0) {
      eventCards.push(
        <EventCard
          key={`${dayInfo.year}-${dayInfo.month}-${dayInfo.day}-return`}
          type="ReturnArrival" // Ensure EventCard handles this type
          count={returnArrivals.length}
          requests={returnArrivals.map(e => e.request)} // Pass requests to EventCard
          onClick={(e) => {
          
            handleDayClick(dayInfo); // Still trigger day selection to show both types
          }}
        />
      );
    }
    return eventCards;
  };

  return (
    <div className="h-[calc(100vh-250px)] min-h-[384px]"> {/* Responsive height */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 h-full">
        {weekDays.map((dayInfo: DayInfo, index: number) => {
          const dayDate = new Date(dayInfo.year, dayInfo.month, dayInfo.day);
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === dayInfo.year &&
            selectedDate.getMonth() === dayInfo.month &&
            selectedDate.getDate() === dayInfo.day;

          const isToday =
            today.getFullYear() === dayInfo.year &&
            today.getMonth() === dayInfo.month &&
            today.getDate() === dayInfo.day;

          let headerClasses = `text-center text-xs sm:text-sm font-medium py-2 `;
          headerClasses += isToday ? 'text-blue-600' : 'text-gray-600';

          let dayCellClasses = `flex-1 p-1 sm:p-2 rounded-md cursor-pointer transition-all duration-200 overflow-y-auto bg-white border border-gray-200`;
          if (isSelected) {
           dayCellClasses += ` border-2 border-blue-500 ring-2 ring-blue-300 bg-white`;
          } else if (isToday) {
            dayCellClasses += ` !border-2 !border-blue-500 bg-blue-50`;
          } else {
            dayCellClasses += ` hover:bg-gray-100`;
          }

          return (
            <div key={index} className="flex flex-col h-full bg-gray-50 rounded-lg">
              <div className={headerClasses}>
                <div>{dayDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div
                  className={`text-lg font-semibold mt-1 cursor-pointer ${isSelected ? 'text-blue-700' : ''}`}
                  onClick={() => handleDayClick(dayInfo)} // Click on date number selects day and shows both event types
                >
                  {dayInfo.day}
                </div>
              </div>
              <div
                className={dayCellClasses}
                onClick={() => handleDayClick(dayInfo)} // Click anywhere in the day cell shows both event types
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