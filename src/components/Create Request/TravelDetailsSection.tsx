// File: src/components/TravelRequest/TravelDetailsSection.tsx
import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Plane, Train, Bus, Car } from 'lucide-react';
import { useTravelRequest } from './TravelRequestContext';
import LocationSearch from './LocationSearch';

const TravelDetailsSection: React.FC = () => {
  const { state, dispatch } = useTravelRequest();
  const { 
    travelType, 
    tripType, 
    source, 
    destination, 
    departureDate, 
    returnDate, 
    transportMode 
  } = state;

  const handleSourceSelect = (location: any) => {
    const sourceLocation = {
      country: location.country || '',
      city: location.city || location.town || location.village || '',
      state: location.state || '',  // Include state in the location data
      label: location.label || [
        location.city || location.town || location.village || '',
        location.state || '',
        location.country || ''
      ].filter(Boolean).join(", "),
      value: location.value || `${location.city || location.town || location.village || ''}-${location.state || ''}-${location.country || ''}`.toLowerCase().replace(/\s+/g, '-')
    };
    dispatch({ type: 'SET_SOURCE', payload: sourceLocation });
  };

  const handleDestinationSelect = (location: any) => {
    const destinationLocation = {
      country: location.country || '',
      city: location.city || location.town || location.village || '',
      state: location.state || '',  // Include state in the location data
      label: location.label || [
        location.city || location.town || location.village || '',
        location.state || '',
        location.country || ''
      ].filter(Boolean).join(", "),
      value: location.value || `${location.city || location.town || location.village || ''}-${location.state || ''}-${location.country || ''}`.toLowerCase().replace(/\s+/g, '-')
    };
    dispatch({ type: 'SET_DESTINATION', payload: destinationLocation });
  };

  const transportOptions = travelType === 'international' 
    ? [{ value: 'flight', label: 'Flight', icon: Plane }]
    : [
        { value: 'flight', label: 'Flight', icon: Plane },
        { value: 'train', label: 'Train', icon: Train },
        { value: 'bus', label: 'Bus', icon: Bus },
        { value: 'cab', label: 'Cab', icon: Car },
      ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-6">Travel Details</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">
              Source Location
              <LocationSearch 
                onSelect={handleSourceSelect}
                placeholder="Search for source location..."
                maxCustomLength={100}
              />
              {source && (
                <div className="mt-2 p-2 bg-primary/5 rounded-md text-sm">
                  <p><strong>Selected:</strong> {source.label || [source.city, source.state, source.country].filter(Boolean).join(", ")}</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="text-sm font-medium">
              Destination
              <LocationSearch 
                onSelect={handleDestinationSelect}
                placeholder="Search for destination location..."
                maxCustomLength={100}
              />
              {destination && (
                <div className="mt-2 p-2 bg-primary/5 rounded-md text-sm">
                  <p><strong>Selected:</strong> {destination.label || [destination.city, destination.state, destination.country].filter(Boolean).join(", ")}</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">
              Departure Date
              <DatePicker
                selected={departureDate}
                onChange={(date) => 
                  dispatch({ type: 'SET_DEPARTURE_DATE', payload: date })
                }
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                minDate={new Date()}
                placeholderText="Select departure date"
                required
              />
            </label>
          </div>

          {tripType === 'roundTrip' && (
            <div>
              <label className="text-sm font-medium">
                Return Date
                <DatePicker
                  selected={returnDate}
                  onChange={(date) => 
                    dispatch({ type: 'SET_RETURN_DATE', payload: date })
                  }
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  minDate={departureDate || new Date()}
                  placeholderText="Select return date"
                  required
                />
              </label>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Mode of Transport</label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {transportOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={`flex items-center justify-center p-4 rounded-md border ${
                  transportMode === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted bg-muted hover:bg-muted/70'
                }`}
                onClick={() => dispatch({ type: 'SET_TRANSPORT_MODE', payload: value })}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailsSection;