import { TravelEvent } from './Calendar';

interface DayInfo {
  day: number;
  currentMonth: boolean;
  month: number;
  year: number;
}

interface MonthViewProps {
  currentDate: Date;
  getDaysForMonth: (year: number, month: number) => DayInfo[];
  getEventsForDate: (date: Date) => TravelEvent[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedEventType: (type: 'Departure' | 'Return' | null) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  getDaysForMonth,
  getEventsForDate,
  selectedDate,
  setSelectedDate,
  setSelectedEventType,
}) => {
  const monthDays: DayInfo[] = getDaysForMonth(currentDate.getFullYear(), currentDate.getMonth());
  const weekdayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const todayIST = new Date(today.getTime() + istOffset);

  const handleDateClick = (day: number, month: number, year: number): void => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    setSelectedEventType(null);
  };

  const getEventCounts = (events: TravelEvent[]): { Departure: number; Return: number } => {
    const counts = {
      Departure: 0,
      Return: 0,
    };

    events.forEach((event: TravelEvent) => {
      if (event.type === 'Departure') counts.Departure++;
      if (event.type === 'Return') counts.Return++;
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
          const date = new Date(dayInfo.year, dayInfo.month, dayInfo.day);
          const events = getEventsForDate(date);
          const counts = getEventCounts(events);
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === date.getFullYear() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getDate() === date.getDate();
          const isToday =
            date.getFullYear() === todayIST.getFullYear() &&
            date.getMonth() === todayIST.getMonth() &&
            dayInfo.day === todayIST.getDate();

          return (
            <div
              key={`month-day-${index}`}
              className={`h-16 flex flex-col p-1 rounded-md cursor-pointer relative
                ${dayInfo.currentMonth ? 'bg-white border border-gray-200 shadow-sm' : 'bg-gray-100 opacity-50'}
                ${isSelected ? 'bg-blue-100' : ''}
                ${isToday ? 'bg-blue-200' : ''}
                hover:bg-gray-200 hover:shadow-sm hover:border hover:border-gray-300 transition-all duration-200`}
              onClick={() => handleDateClick(dayInfo.day, dayInfo.month, dayInfo.year)}
            >
              <span
                className={`text-gray-800 text-center ${
                  !dayInfo.currentMonth ? 'text-gray-400 opacity-50 font-light' : 'font-medium'
                }`}
              >
                {dayInfo.day}
              </span>
              <div className="absolute bottom-1.5 right-1 flex space-x-1">
                {counts.Departure > 0 && (
                  <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                    {counts.Departure}
                  </div>
                )}
                {counts.Return > 0 && (
                  <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                    {counts.Return}
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