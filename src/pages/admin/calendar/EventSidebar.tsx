import { NavigateFunction } from 'react-router-dom';

interface TravelEvent {
  type: 'Departure' | 'Return';
  request: any;
}

interface EventSidebarProps {
  selectedDate: Date | null;
  selectedEventType: 'Departure' | 'Return' | null;
  getEventsForDate: (date: Date) => TravelEvent[];
  navigate: NavigateFunction;
  view: 'Month' | 'Week';
  currentDate: Date;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  selectedDate,
  selectedEventType,
  getEventsForDate,
  navigate,
  view,
  currentDate,
}) => {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex-[0.35] bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit">
      <div className="flex items-center mb-4">
        <svg
          className="w-5 h-5 mr-2 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h2 className="text-lg font-medium text-gray-800">
          {selectedDate ? formatDate(selectedDate) : (view === 'Month' ? formatMonth(currentDate) : formatDate(currentDate))}
        </h2>
      </div>

      {selectedDate ? (
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate)
              .filter((event: TravelEvent) => !selectedEventType || event.type === selectedEventType)
              .map((event: TravelEvent, idx: number) => (
                <div
                  key={`${event.type}-${event.request.id}-${idx}`}
                  className={`bg-gray-50 p-3 rounded-md border-l-4 cursor-pointer
                    ${event.type === 'Departure' ? 'border-blue-500' : 'border-green-500'}
                    hover:bg-gray-100 transition-colors duration-200`}
                  onClick={() => navigate(`/admin/travel-requests/${event.request.id}`)}
                >
                  <p className="text-gray-800 font-medium">{event.request.travelerName}</p>
                  <p className="text-gray-600 text-sm">{event.type}</p>
                  <p className="text-gray-600 text-sm">Project: {event.request.projectCode}</p>
                  <p className="text-gray-600 text-sm">ID: {event.request.id}</p>
                </div>
              ))
          ) : (
            <p className="text-gray-600">No travel requests for this date.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Select a date to view details.</p>
      )}
    </div>
  );
};

export default EventSidebar;