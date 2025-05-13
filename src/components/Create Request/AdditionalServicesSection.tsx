import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useTravelRequest } from './TravelRequestContext';
import LocationSearch from './LocationSearch';

const AdditionalServicesSection: React.FC = () => {
  const { state, dispatch } = useTravelRequest();
  const { 
    requiresAccommodation, 
    requiresPickup, 
    requiresDropoff, 
    pickupLocation, 
    dropoffLocation, 
    pickupTime, 
    dropoffTime 
  } = state;

  const handlePickupLocationSelect = (location: any) => {
    const locationString = `${location.city || location.town || location.village || ''}, ${location.state || ''}, ${location.country || ''}`;
    dispatch({ type: 'SET_PICKUP_LOCATION', payload: locationString });
  };

  const handleDropoffLocationSelect = (location: any) => {
    const locationString = `${location.city || location.town || location.village || ''}, ${location.state || ''}, ${location.country || ''}`;
    dispatch({ type: 'SET_DROPOFF_LOCATION', payload: locationString });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-6">Additional Services</h3>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="accommodation"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={requiresAccommodation}
            onChange={(e) => 
              dispatch({ type: 'SET_REQUIRES_ACCOMMODATION', payload: e.target.checked })
            }
          />
          <label htmlFor="accommodation" className="text-sm font-medium">
            Requires Accommodation
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="pickup"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={requiresPickup}
            onChange={(e) => 
              dispatch({ type: 'SET_REQUIRES_PICKUP', payload: e.target.checked })
            }
          />
          <label htmlFor="pickup" className="text-sm font-medium">
            Requires Pickup
          </label>
        </div>

        {requiresPickup && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="text-sm font-medium">
                Pickup Location
                <LocationSearch 
                  onSelect={handlePickupLocationSelect}
                  placeholder="Search for pickup location..."
                />
                {pickupLocation && (
                  <div className="mt-2 p-2 bg-primary/5 rounded-md text-sm">
                    <p><strong>Selected:</strong> {pickupLocation}</p>
                  </div>
                )}
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">
                Preferred Pickup Time
                <DatePicker
                  selected={pickupTime}
                  onChange={(date) => 
                    dispatch({ type: 'SET_PICKUP_TIME', payload: date })
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="dropoff"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={requiresDropoff}
            onChange={(e) => 
              dispatch({ type: 'SET_REQUIRES_DROPOFF', payload: e.target.checked })
            }
          />
          <label htmlFor="dropoff" className="text-sm font-medium">
            Requires Drop-off
          </label>
        </div>

        {requiresDropoff && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="text-sm font-medium">
                Drop-off Location
                <LocationSearch 
                  onSelect={handleDropoffLocationSelect}
                  placeholder="Search for drop-off location..."
                />
                {dropoffLocation && (
                  <div className="mt-2 p-2 bg-primary/5 rounded-md text-sm">
                    <p><strong>Selected:</strong> {dropoffLocation}</p>
                  </div>
                )}
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">
                Preferred Drop-off Time
                <DatePicker
                  selected={dropoffTime}
                  onChange={(date) => 
                    dispatch({ type: 'SET_DROPOFF_TIME', payload: date })
                  }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalServicesSection;