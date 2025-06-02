import React from 'react';
import {
  Calendar,
  TrainFront,
  Plane,
  BusFront,
  CarTaxiFront,
  Backpack,
  Check,
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
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatFoodPreference = (preference: string) => {
    switch (preference?.toLowerCase()) {
      case 'vegetarian':
      case 'veg':
        return 'Vegetarian';
      case 'non-vegetarian':
      case 'non-veg':
        return 'Non-Vegetarian';
      case 'no-preference':
      case 'no preference':
        return 'No Preference';
      default:
        return preference || 'Not specified';
    }
  };

  const getTransportationIcon = (transportation: string) => {
    switch (transportation) {
      case "Flight":
        return <Plane className="h-4 w-4 mr-2" />;
      case "Train":
        return <TrainFront className="h-4 w-4 mr-2" />;
      case "Other":
        return <BusFront className="h-4 w-4 mr-2" />;
      case "Car Rental":
        return <CarTaxiFront className="h-4 w-4 mr-2" />;
      default:
        return <Check className="h-4 w-4 mr-2" />;
    }
  };

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
            <p>{formatDate(travelRequest.departureDate || '')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              {getTransportationIcon(travelRequest.transportationType || '')}
              Transportation
            </p>
            <p>{travelRequest.transportationType || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Request Date
            </p>
            <p>{formatDate(travelRequest.requestDate || '')}</p>
          </div>
          {travelRequest.accommodationType && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center">
                <Hotel className="h-4 w-4 mr-2" />
                Accommodation
              </p>
              <p>{travelRequest.accommodationType ? 'Required' : 'Not Required'}</p>
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
              <p>{formatDate(travelRequest.returnDate)}</p>
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
            <p>{travelRequest.purpose|| 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Utensils className="h-4 w-4 mr-2" />
              Food Preference
            </p>
            <p>{formatFoodPreference('veg')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelInfo;