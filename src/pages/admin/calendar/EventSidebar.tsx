// src/pages/admin/calendar/EventSidebar.tsx
import React from 'react';
import { TravelEvent, TravelRequest } from './Calendar'; // Import main types
import { NavigateFunction } from 'react-router-dom';
import { CalendarDays, PlaneTakeoff, PlaneLanding, User, MapPin, Flag, Info } from 'lucide-react';

interface EventSidebarProps {
  selectedDate: Date | null;
  selectedEventType: 'OutboundDeparture' | 'ReturnArrival' | null;
  getEventsForDate: (date: Date) => TravelEvent[];
  navigate: NavigateFunction;
  // Optional: A function to switch the selectedEventType if tabs are used in sidebar
  onEventTypeChange?: (type: 'OutboundDeparture' | 'ReturnArrival' | null) => void;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  selectedDate,
  selectedEventType,
  getEventsForDate,
  navigate,
  onEventTypeChange, // Optional prop for tab-like behavior
}) => {
  if (!selectedDate) {
    return (
      <div className="lg:flex-[0.35] bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium">Select a date</p>
        <p className="text-sm">Click on a day in the calendar to see travel events.</p>
      </div>
    );
  }

  const eventsForSelectedDate = getEventsForDate(selectedDate);
  let displayedEvents: TravelEvent[] = []; // Changed to TravelEvent[] to include type info
  let title = "Events";

  if (selectedEventType) {
    displayedEvents = eventsForSelectedDate.filter(event => event.type === selectedEventType);
    title = selectedEventType === 'OutboundDeparture' ? "Outbound Departures" : "Return Arrivals";
  } else if (eventsForSelectedDate.length > 0) {
    // If no specific type is selected, show all events for the day
    displayedEvents = eventsForSelectedDate;
    title = "All Events for Selected Date";
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const handleRequestClick = (requestId: string) => {
    // Example navigation: navigate to a travel request detail page
    // Adjust the path as per your routing setup
    navigate(`/admin/travel-requests/${requestId}`);
    // Or if it's a modal:
    // openModalWithRequest(requestId);
  };

  // Helper function to get color classes based on event type
  const getEventColorClasses = (eventType: 'OutboundDeparture' | 'ReturnArrival') => {
    if (eventType === 'OutboundDeparture') {
      return {
        background: 'bg-blue-50',
        border: 'border-blue-200 hover:border-blue-300',
        iconColor: 'text-blue-500'
      };
    } else {
      return {
        background: 'bg-green-50',
        border: 'border-green-200 hover:border-green-300',
        iconColor: 'text-green-500'
      };
    }
  };

  return (
    <div className="lg:flex-[0.35] bg-white rounded-lg shadow-sm p-4 sm:p-6 h-full max-h-[calc(100vh-150px)] overflow-y-auto">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">
        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </h2>
      <p className="text-lg font-medium text-blue-600 mb-4">{title}</p>

      {/* Optional: Tabs to switch between OutboundDeparture and ReturnArrival if both exist */}
      {onEventTypeChange && eventsForSelectedDate.some(e => e.type === 'OutboundDeparture') && eventsForSelectedDate.some(e => e.type === 'ReturnArrival') && (
        <div className="mb-4 flex border-b">
          <button
            onClick={() => onEventTypeChange('OutboundDeparture')}
            className={`py-2 px-4 font-medium ${selectedEventType === 'OutboundDeparture' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Outbound Departures
          </button>
          <button
            onClick={() => onEventTypeChange('ReturnArrival')}
            className={`py-2 px-4 font-medium ${selectedEventType === 'ReturnArrival' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Return Arrivals
          </button>
        </div>
      )}

      {displayedEvents.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <Info className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p>No {selectedEventType ? (selectedEventType === 'OutboundDeparture' ? 'outbound departures' : 'return arrivals') : 'events'} scheduled for this date.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {displayedEvents.map((event) => {
            const colorClasses = getEventColorClasses(event.type);
            const request = event.request;
            
            return (
              <li
                key={request.requestId}
                onClick={() => handleRequestClick(request.requestId)}
                className={`${colorClasses.background} p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${colorClasses.border}`}
              >
                <div className="flex items-center mb-2">
                  {event.type === 'OutboundDeparture' ? (
                    <PlaneTakeoff className={`h-5 w-5 ${colorClasses.iconColor} mr-3 flex-shrink-0`} />
                  ) : (
                    <PlaneLanding className={`h-5 w-5 ${colorClasses.iconColor} mr-3 flex-shrink-0`} />
                  )}
                  <h3 className="text-md sm:text-lg font-semibold text-gray-700 truncate" title={request.employeeName}>
                    {request.employeeName}
                  </h3>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                  <p className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium">From:</span> {request.sourcePlace}, {request.sourceCountry}
                  </p>
                  <p className="flex items-center">
                    <Flag className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium">To:</span> {request.destinationPlace}, {request.destinationCountry}
                  </p>
                  <p>
                    <span className="font-medium">Outbound:</span> {formatDate(request.outboundDepartureDate)} - {formatDate(request.outboundArrivalDate)}
                  </p>
                  {request.returnDepartureDate && (
                    <p>
                      <span className="font-medium">Return:</span> {formatDate(request.returnDepartureDate)} - {formatDate(request.returnArrivalDate)}
                    </p>
                  )}
                  <p className="mt-1 pt-1 border-t border-gray-200">
                    <span className="font-medium">Status:</span> 
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ml-2
                      ${request.currentStatusName === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.currentStatusName === 'Tickets Dispatched' ? 'bg-blue-100 text-blue-700' :
                        request.currentStatusName === 'In-transit' ? 'bg-indigo-100 text-indigo-700' :
                        request.currentStatusName === 'Returned' ? 'bg-green-100 text-green-700' :
                        request.currentStatusName === 'Closed' ? 'bg-gray-200 text-gray-700' :
                        'bg-gray-100 text-gray-600' // Default
                      }`}
                    >
                      {request.currentStatusName}
                    </span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default EventSidebar;