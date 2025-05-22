import React from 'react';
import {
  // MapPin,
  Calendar,
  TrainFront,
  Plane,
  BusFront,
  CarTaxiFront,
  Backpack,
  Check,
  // Car,
  Hotel,
  Utensils,
  Clock,
  Navigation
} from 'lucide-react';
import { TravelRequest } from '../../data/mockData';

interface TravelInfoProps {
  travelRequest: TravelRequest;
}

const TravelInfo: React.FC<TravelInfoProps> = ({ travelRequest }) => {
  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-6">Travel Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1 */}
        <div className="space-y-4">

          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Departure Date
            </p>
            <p>{travelRequest.departureDate}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              {travelRequest.transportationType === "Flight" ? (
                <Plane className="h-4 w-4 mr-2" />
              ) : travelRequest.transportationType === "Train" ? (
                <TrainFront className="h-4 w-4 mr-2" />
              ) : travelRequest.transportationType === "Other" ? (
                <BusFront className="h-4 w-4 mr-2" />
              ) : travelRequest.transportationType === "Car Rental" ? (
                <CarTaxiFront className="h-4 w-4 mr-2" />
              ) : <Check className="h-4 w-4 mr-2" />
              }
              Transportation
            </p>
            <p>{travelRequest.transportationType}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Request Date
            </p>
            <p>{travelRequest.requestDate || 'Not specified'}</p>
          </div>

          {travelRequest.accommodationType && travelRequest.accommodationType !== 'None' && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center">
                <Hotel className="h-4 w-4 mr-2" />
                Accommodation
              </p>
              <p>{travelRequest.accommodationType}</p>
            </div>
          )}

        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          {travelRequest.returnDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Return Date
              </p>
              <p>{travelRequest.returnDate}</p>
            </div>
          )}


          {travelRequest.travelType && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center">
                <Navigation className="h-4 w-4 mr-2" />
                Travel Type
              </p>
              <p>{travelRequest.travelType}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Backpack className="h-4 w-4 mr-2" />
              Purpose of Travel
            </p>
            <p>{travelRequest.purpose}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Utensils className="h-4 w-4 mr-2" />
              Food Preference
            </p>
            <p>Vegeterian</p>
          </div>
        </div>

        {/* <div>
          <p className="text-sm text-muted-foreground -mt-4 mb-1 flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Conveyance | 
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default TravelInfo;