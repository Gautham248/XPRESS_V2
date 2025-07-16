import React from 'react';
import { TravelEvent, TravelRequest } from './Calendar'; // Import main types
import { NavigateFunction } from 'react-router-dom';
import { CalendarDays, PlaneTakeoff, PlaneIcon, Calendar, MapPin, Flag, Clock, User, ArrowRight } from 'lucide-react';

interface EventSidebarProps {
  selectedDate: Date | null;
  selectedEventType: 'OutboundDeparture' | 'ReturnArrival' | null;
  getEventsForDate: (date: Date) => TravelEvent[];
  navigate: NavigateFunction;
  onEventTypeChange?: (type: 'OutboundDeparture' | 'ReturnArrival' | null) => void;
}

const EventSidebar: React.FC<EventSidebarProps> = ({
  selectedDate,
  selectedEventType,
  getEventsForDate,
  navigate,
  onEventTypeChange,
}) => {
  if (!selectedDate) {
    return (
      <div className="lg:flex-[0.35] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm p-6 text-center">
        <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-sm">
          <Calendar className="h-12 w-12 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-700 mb-2">Select a date</p>
        <p className="text-sm text-gray-500">Click on a day in the calendar to see travel events.</p>
      </div>
    );
  }

  const eventsForSelectedDate = getEventsForDate(selectedDate);
  let displayedEvents: TravelEvent[] = [];
  let title = "Events";

  if (selectedEventType) {
    displayedEvents = eventsForSelectedDate.filter(event => event.type === selectedEventType);
    title = selectedEventType === 'OutboundDeparture' ? "Outbound Departures" : "Return Arrivals";
  } else if (eventsForSelectedDate.length > 0) {
    displayedEvents = eventsForSelectedDate;
    title = "All Events for Selected Date";
  }

  
  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'UTC' 
    };
    
    return `${date.toLocaleDateString('en-GB', dateOptions)}, ${date.toLocaleTimeString('en-GB', timeOptions)}`;
  };

  const formatTravelDates = (departureDate: string | null | undefined, arrivalDate: string | null | undefined): string => {
    const departure = formatDateTime(departureDate);
    const arrival = formatDateTime(arrivalDate);
    
    if (departure && arrival) {
      return `${departure} → ${arrival}`;
    } else if (departure) {
      return departure;
    } else if (arrival) {
      return arrival;
    }
    return '';
  };

  const handleRequestClick = (requestId: string) => {
    navigate(`/admin/travel-requests/${requestId}`);
  };

  const getEventColorClasses = (eventType: 'OutboundDeparture' | 'ReturnArrival') => {
    if (eventType === 'OutboundDeparture') {
      return {
        background: 'bg-gradient-to-r from-blue-50 to-blue-100',
        border: 'border-blue-200 hover:border-blue-300',
        iconColor: 'text-blue-600',
        accent: 'bg-blue-500'
      };
    } else {
      return {
        background: 'bg-gradient-to-r from-emerald-50 to-emerald-100',
        border: 'border-emerald-200 hover:border-emerald-300',
        iconColor: 'text-emerald-600',
        accent: 'bg-emerald-500'
      };
    }
  };

  const getStatusStyle = (status: string) => {
    const statusMap = {
      'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'Tickets Dispatched': 'bg-blue-100 text-blue-800 border-blue-200',
      'In-transit': 'bg-purple-100 text-purple-800 border-purple-200',
      'Returned': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200',
      'PendingReview': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="lg:flex-[0.35] bg-white rounded-xl shadow-sm p-4 sm:p-6 h-full max-h-[calc(100vh-150px)] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="bg-blue-500 rounded-lg p-2 mr-3">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
              {selectedDate.toLocaleDateString('en-GB', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'UTC' 
              })}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedDate.getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Event Type Tabs */}
      {onEventTypeChange && eventsForSelectedDate.some(e => e.type === 'OutboundDeparture') && eventsForSelectedDate.some(e => e.type === 'ReturnArrival') && (
        <div className="mb-6 bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => onEventTypeChange('OutboundDeparture')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedEventType === 'OutboundDeparture' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PlaneTakeoff className="h-4 w-4 inline mr-1" />
            Departures
          </button>
          <button
            onClick={() => onEventTypeChange('ReturnArrival')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedEventType === 'ReturnArrival' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <PlaneIcon className="h-4 w-4 inline mr-1" />
            Arrivals
          </button>
        </div>
      )}

      {/* Events List */}
      {displayedEvents.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <p className="font-medium mb-1">No events scheduled</p>
          <p className="text-sm">
            No {selectedEventType ? (selectedEventType === 'OutboundDeparture' ? 'departures' : 'arrivals') : 'events'} for this date.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedEvents.map((event) => {
            const colorClasses = getEventColorClasses(event.type);
            const request = event.request;
            const outboundDates = formatTravelDates(request.outboundDepartureDate, request.outboundArrivalDate);
            const returnDates = formatTravelDates(request.returnDepartureDate, request.returnArrivalDate);
            
            return (
              <div
                key={request.requestId}
                onClick={() => handleRequestClick(request.requestId)}
                className={`${colorClasses.background} rounded-xl border ${colorClasses.border} hover:shadow-md transition-all cursor-pointer overflow-hidden group`}
              >
                {/* Event Type Indicator */}
                <div className={`h-1 ${colorClasses.accent} group-hover:h-1.5 transition-all`}></div>
                
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${colorClasses.iconColor} bg-white/50 mr-3`}>
                        {event.type === 'OutboundDeparture' ? (
                          <PlaneTakeoff className="h-4 w-4" />
                        ) : (
                          <PlaneIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base flex items-center">
                          <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          {request.employeeName}
                        </h3>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(request.currentStatusName)}`}>
                      {request.currentStatusName}
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-xs text-gray-700">
                      <MapPin className="h-3.5 w-3.5 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="font-medium mr-1">From:</span>
                      <span className="truncate">{request.sourcePlace}, {request.sourceCountry}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <Flag className="h-3.5 w-3.5 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="font-medium mr-1">To:</span>
                      <span className="truncate">{request.destinationPlace}, {request.destinationCountry}</span>
                    </div>
                  </div>

                  {/* Travel Dates */}
                  <div className="space-y-2 text-xs">
                    {outboundDates && (
                      <div className="text-gray-600">
                        <div className="flex items-center">
                          <PlaneTakeoff className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-gray-800 mr-2">Outbound:</span>
                            <span className="break-words">{outboundDates}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {returnDates && (
                      <div className="text-gray-600">
                        <div className="flex items-center">
                          <PlaneIcon className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-gray-800 mr-2">Return:</span>
                            <span className="break-words">{returnDates}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventSidebar;