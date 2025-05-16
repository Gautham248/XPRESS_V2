import EventCard from './EventCard';

interface TravelEvent {
  type: 'Departure' | 'Return';
  request: any;
}

interface WeekViewProps {
  currentDate: Date;
  getEventsForDate: (date: Date) => TravelEvent[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedEventType: (type: 'Departure' | 'Return' | null) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  getEventsForDate,
  selectedDate,
  setSelectedDate,
  setSelectedEventType,
}) => {
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

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

  const renderEventCards = (day: Date, events: TravelEvent[]): JSX.Element => {
    const counts = getEventCounts(events);
    const cards: JSX.Element[] = [];

    if (counts.Departure > 0) {
      cards.push(
        <EventCard
          key="departure"
          type="Departure"
          count={counts.Departure}
          onClick={() => {
            setSelectedDate(day);
            setSelectedEventType('Departure');
          }}
        />
      );
    }

    if (counts.Return > 0) {
      cards.push(
        <EventCard
          key="return"
          type="Return"
          count={counts.Return}
          onClick={() => {
            setSelectedDate(day);
            setSelectedEventType('Return');
          }}
        />
      );
    }

    return cards.length > 0 ? (
      <div className="flex flex-col space-y-2">
        {cards}
      </div>
    ) : (
      <div className="text-gray-500 text-sm text-center py-2">No events</div>
    );
  };

  return (
    <div className="h-[384px]">
      <div className="grid grid-cols-7 gap-2 h-full">
        {weekDays.map((day: Date, index: number) => {
          const events = getEventsForDate(day);
          const isSelected =
            selectedDate &&
            selectedDate.getFullYear() === day.getFullYear() &&
            selectedDate.getMonth() === day.getMonth() &&
            selectedDate.getDate() === day.getDate();
          const isToday =
            day.getFullYear() === todayIST.getFullYear() &&
            day.getMonth() === todayIST.getMonth() &&
            day.getDate() === todayIST.getDate();

          return (
            <div key={index} className="flex flex-col h-full">
              <div className="text-center text-gray-600 font-medium">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`h-10 flex items-center justify-center rounded-md cursor-pointer relative
                  ${isSelected ? 'bg-blue-100' : 'bg-gray-50'}
                  ${isToday ? 'bg-blue-200' : ''}
                  hover:bg-gray-200 hover:shadow-sm hover:border hover:border-gray-300 transition-all duration-200`}
                onClick={() => handleDateClick(day.getDate(), day.getMonth(), day.getFullYear())}
              >
                <span className="text-gray-800 text-lg">{day.getDate()}</span>
              </div>
              <div className="flex-1 mt-2 flex flex-col space-y-1 overflow-auto">
                {renderEventCards(day, events)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;