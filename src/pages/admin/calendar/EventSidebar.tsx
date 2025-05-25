import { NavigateFunction } from 'react-router-dom';

interface TravelRequest {
  requestId: number;
  employeeName: string;
  sourcePlace: string;
  sourceCountry: string;
  destinationPlace: string;
  destinationCountry: string;
  currentStatusName: string;
}

interface TravelEvent {
  type: 'Departure' | 'Return';
  request: TravelRequest;
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

  const getEventTypeStyles = (eventType: 'Departure' | 'Return') => {
    if (eventType === 'Departure') {
      return {
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-50',
        hoverBgColor: 'hover:bg-blue-100',
        badgeColor: 'bg-blue-500',
        textColor: 'text-blue-700',
        icon: (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      };
    } else {
      return {
        borderColor: 'border-green-500',
        bgColor: 'bg-green-50',
        hoverBgColor: 'hover:bg-green-100',
        badgeColor: 'bg-green-500',
        textColor: 'text-green-700',
        icon: (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        )
      };
    }
  };

  return (
    <div className="flex-[0.35] bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-fit overflow-hidden">
      {/* Header */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mr-3">
          <svg
            className="w-5 h-5 text-gray-600"
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
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedDate ? formatDate(selectedDate) : (view === 'Month' ? formatMonth(currentDate) : formatDate(currentDate))}
          </h2>
          {selectedDate && (
            <p className="text-sm text-gray-500 mt-1">Travel Events</p>
          )}
        </div>
      </div>

      {/* Content */}
      {selectedDate ? (
        <div className="space-y-2" style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'hidden' }}>
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate)
              .filter((event: TravelEvent) => !selectedEventType || event.type === selectedEventType)
              .map((event: TravelEvent, idx: number) => {
                const isDeparture = event.type === 'Departure';
                const fromPlace = isDeparture ? event.request.sourcePlace : event.request.destinationPlace;
                const fromCountry = isDeparture ? event.request.sourceCountry : event.request.destinationCountry;
                const toPlace = isDeparture ? event.request.destinationPlace : event.request.sourcePlace;
                const toCountry = isDeparture ? event.request.destinationCountry : event.request.sourceCountry;

                const styles = getEventTypeStyles(event.type);

                return (
                  <div
                    key={`${event.type}-${event.request.requestId}-${idx}`}
                    className={`${styles.bgColor} p-3 rounded-md border-l-3 ${styles.borderColor} cursor-pointer
                      ${styles.hoverBgColor} transition-all duration-200 hover:shadow-md overflow-hidden`}
                    onClick={() => navigate(`/admin/travel-requests/${event.request.requestId}`)}
                  >
                    {/* Event Type Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white ${styles.badgeColor}`}>
                        {styles.icon}
                        {event.type.toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        ID: #{event.request.requestId}
                      </span>
                    </div>

                    {/* Employee Name */}
                    <div className="mb-2">
                      <h3 className="text-base font-semibold text-gray-800">
                        {event.request.employeeName}
                      </h3>
                    </div>

                    {/* Route Information */}
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <div className="flex items-center mr-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          <span className="font-medium text-gray-600">From:</span>
                        </div>
                        <span className="text-gray-800 font-medium">
                          {fromPlace}, {fromCountry}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <div className="flex items-center mr-2">
                          <div className={`w-2 h-2 rounded-full mr-2 ${event.type === 'Departure' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                          <span className="font-medium text-gray-600">To:</span>
                        </div>
                        <span className="text-gray-800 font-medium">
                          {toPlace}, {toCountry}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center text-sm mt-2">
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className="ml-2 text-gray-800 font-medium">
                          {event.request.currentStatusName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No travel events</p>
              <p className="text-gray-400 text-sm mt-1">No travel requests scheduled for this date</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium text-lg">Select a date</p>
          <p className="text-gray-400 text-sm mt-2">Choose a date from the calendar to view travel events</p>
        </div>
      )}
    </div>
  );
};

export default EventSidebar;