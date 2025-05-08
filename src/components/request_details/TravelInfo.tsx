import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Plane, 
  Hotel 
} from 'lucide-react';
import { TravelRequest } from '../../data/mockData';

interface TravelInfoProps {
  travelRequest: TravelRequest;
}

const TravelInfo: React.FC<TravelInfoProps> = ({ travelRequest }) => {
  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-6">Travel Information</h3>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">Source</p>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{travelRequest.source}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">Destination</p>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{travelRequest.destination}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Departure Date</p>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{travelRequest.departureDate}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Return Date</p>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{travelRequest.returnDate}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">Purpose of Travel</p>
        <p>{travelRequest.purpose}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Transportation</p>
          <div className="flex items-center">
            <Plane className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{travelRequest.transportationType}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-1">Accommodation</p>
          <div className="flex items-center">
            <Hotel className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{travelRequest.accommodationType}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelInfo;