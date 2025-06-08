// src/pages/admin/calendar/EventCard.tsx
import React from 'react';
import { PlaneTakeoff, PlaneLanding } from 'lucide-react'; // Using PlaneLanding for ReturnArrival
import { TravelRequest } from './Calendar'; // Assuming TravelRequest is exported from Calendar.tsx

interface EventCardProps {
  type: 'OutboundDeparture' | 'ReturnArrival';
  count: number;
  requests: TravelRequest[]; // To pass the actual request data, though not fully utilized in display yet
  onClick: (type: 'OutboundDeparture' | 'ReturnArrival') => void;
}

const EventCard: React.FC<EventCardProps> = ({ type, count, requests, onClick }) => {
  const isOutboundDeparture = type === 'OutboundDeparture';

  const cardTitle = isOutboundDeparture
    ? `${count} Outbound Departure${count !== 1 ? 's' : ''}`
    : `${count} Return Arrival${count !== 1 ? 's' : ''}`;

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 ease-out group
        ${isOutboundDeparture
          ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 hover:from-blue-100 hover:via-blue-200 hover:to-blue-300 border border-blue-200 hover:border-blue-300'
          : 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 hover:from-emerald-100 hover:via-emerald-200 hover:to-emerald-300 border border-emerald-200 hover:border-emerald-300'
        }
        hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95
        p-2 sm:p-3 w-full text-center min-h-[70px] sm:min-h-[80px] flex flex-col justify-center items-center
      `}
      onClick={() => onClick(type)} // Call the passed onClick with the card's type
      title={cardTitle}
      aria-label={cardTitle}
    >
      {/* Icon container */}
      <div className={`
        relative z-10 w-6 h-6 sm:w-7 sm:h-7 mb-1 rounded-full flex items-center justify-center
        transition-all duration-300 group-hover:scale-110
        ${isOutboundDeparture
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30'
        }
      `}>
        {isOutboundDeparture ? (
          <PlaneTakeoff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        ) : (
          <PlaneLanding // Using PlaneLanding for ReturnArrival
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5`}
          />
        )}
      </div>

      {/* Event type label */}
      <div className={`
        relative z-10 font-semibold text-xs sm:text-sm leading-tight mb-0.5
        ${isOutboundDeparture ? 'text-blue-700' : 'text-emerald-700'}
      `}>
        {isOutboundDeparture ? 'Outbound' : 'Return'} {/* Shortened label */}
      </div>

      {/* Count */}
      <div className={`
        relative z-10 text-lg sm:text-xl font-bold tabular-nums
        ${isOutboundDeparture ? 'text-blue-600' : 'text-emerald-600'}
        drop-shadow-sm
      `}>
        {count}
      </div>

      {/* Subtle shine effect on hover - optional */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-lg" />
    </div>
  );
};


const EventCardDemo = () => {
 
  const demoOutboundRequests: TravelRequest[] = Array.from({ length: 3 }, (_, i) => ({
    requestId: `OB${i + 1}`,
    employeeName: `Employee ${String.fromCharCode(65 + i)}`, // A, B, C
    currentStatusName: i % 2 === 0 ? 'Pending' : 'Tickets Dispatched',
    outboundDepartureDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
    outboundArrivalDate: new Date(Date.now() + (i + 0.5) * 24 * 60 * 60 * 1000).toISOString(),
    returnDepartureDate: null,
    returnArrivalDate: null,
    sourcePlace: 'City X',
    sourceCountry: 'Country A',
    destinationPlace: 'City Y',
    destinationCountry: 'Country B',
  }));

  const demoReturnRequests: TravelRequest[] = Array.from({ length: 2 }, (_, i) => ({
    requestId: `RA${i + 1}`,
    employeeName: `Traveler ${i + 1}`,
    currentStatusName: 'Returned',
    outboundDepartureDate: new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000).toISOString(),
    outboundArrivalDate: new Date(Date.now() - (i + 4.5) * 24 * 60 * 60 * 1000).toISOString(),
    returnDepartureDate: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
    returnArrivalDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
    sourcePlace: 'City Y',
    sourceCountry: 'Country B',
    destinationPlace: 'City X',
    destinationCountry: 'Country A',
  }));

  const handleCardClick = (type: 'OutboundDeparture' | 'ReturnArrival') => {
    console.log(`Card clicked! Type: ${type}`);
    
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Event Card Demo</h2>

        <div className="grid grid-cols-2 gap-3">
          <EventCard
            type="OutboundDeparture"
            count={demoOutboundRequests.length}
            requests={demoOutboundRequests}
            onClick={handleCardClick}
          />
          <EventCard
            type="ReturnArrival"
            count={demoReturnRequests.length}
            requests={demoReturnRequests}
            onClick={handleCardClick}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Simulated Calendar Week Cell</h3>
          <div className="p-2 bg-white rounded-lg shadow min-h-[200px]">
            <div className="space-y-2">
                <EventCard type="OutboundDeparture" count={6} requests={demoOutboundRequests} onClick={handleCardClick} />
                <EventCard type="ReturnArrival" count={3} requests={demoReturnRequests} onClick={handleCardClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default EventCard;