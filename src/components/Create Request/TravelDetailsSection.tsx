import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Plane, Train, Bus, Car, AlertCircle } from 'lucide-react';
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
    transportMode,
    projectCode
  } = state;

  // Country validation for domestic travel
  const [validationError, setValidationError] = React.useState<string | null>(null);

  useEffect(() => {
    // Clear validation error when travel type changes
    if (travelType === 'international') {
      setValidationError(null);
    }
    
    // Check for country mismatch in domestic travel
    if (travelType === 'domestic' && source?.country && destination?.country 
        && source.country !== destination.country) {
      setValidationError(`Domestic travel must be within the same country. 
        Source: ${source.country}, Destination: ${destination.country}`);
    } else {
      setValidationError(null);
    }
  }, [travelType, source?.country, destination?.country]);

  const handleSourceSelect = (location: any) => {
    const sourceLocation = {
      country: location.country || '',
      city: location.city || location.town || location.village || '',
      state: location.state || '',
      label: location.label || [
        location.city || location.town || location.village || '',
        location.state || '',
        location.country || ''
      ].filter(Boolean).join(", "),
      value: location.value || `${location.city || location.town || location.village || ''}-${location.state || ''}-${location.country || ''}`.toLowerCase().replace(/\s+/g, '-')
    };
    
    dispatch({ type: 'SET_SOURCE', payload: sourceLocation });
    
    // Validate countries match for domestic travel when both source and destination are selected
    if (travelType === 'domestic' && destination?.country && location.country 
        && location.country !== destination.country) {
      setValidationError(`Domestic travel must be within the same country. 
        Source: ${location.country}, Destination: ${destination.country}`);
    } else {
      setValidationError(null);
    }
  };

  const handleDestinationSelect = (location: any) => {
    const destinationLocation = {
      country: location.country || '',
      city: location.city || location.town || location.village || '',
      state: location.state || '',
      label: location.label || [
        location.city || location.town || location.village || '',
        location.state || '',
        location.country || ''
      ].filter(Boolean).join(", "),
      value: location.value || `${location.city || location.town || location.village || ''}-${location.state || ''}-${location.country || ''}`.toLowerCase().replace(/\s+/g, '-')
    };
    
    dispatch({ type: 'SET_DESTINATION', payload: destinationLocation });
    
    // Validate countries match for domestic travel when both source and destination are selected
    if (travelType === 'domestic' && source?.country && location.country 
        && source.country !== location.country) {
      setValidationError(`Domestic travel must be within the same country. 
        Source: ${source.country}, Destination: ${location.country}`);
    } else {
      setValidationError(null);
    }
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="h-8 w-1 bg-blue-600 rounded mr-3"></div>
        <h3 className="text-lg font-semibold text-gray-800">Travel Details</h3>
      </div>
      
      <div className="space-y-6">
        {/* Validation Error Alert */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Validation Error</h4>
              <p className="text-sm text-red-700 mt-1">{validationError}</p>
            </div>
          </div>
        )}

        {/* Project Code Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Code
          </label>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            value={projectCode}
            onChange={(e) => dispatch({ type: 'SET_PROJECT_CODE', payload: e.target.value })}
            placeholder="Enter project code"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Location
            </label>
            <LocationSearch 
              onSelect={handleSourceSelect}
              placeholder="Search for source location..."
              maxCustomLength={100}
            />
            {source && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm border border-blue-100">
                <p><strong>Selected:</strong> {source.label || [source.city, source.state, source.country].filter(Boolean).join(", ")}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <LocationSearch 
              onSelect={handleDestinationSelect}
              placeholder="Search for destination location..."
              maxCustomLength={100}
            />
            {destination && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm border border-blue-100">
                <p><strong>Selected:</strong> {destination.label || [destination.city, destination.state, destination.country].filter(Boolean).join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure Date
            </label>
            <DatePicker
              selected={departureDate}
              onChange={(date) => 
                dispatch({ type: 'SET_DEPARTURE_DATE', payload: date })
              }
              className="block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              minDate={new Date()}
              placeholderText="Select departure date"
              required
            />
          </div>

          {tripType === 'roundTrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date
              </label>
              <DatePicker
                selected={returnDate}
                onChange={(date) => 
                  dispatch({ type: 'SET_RETURN_DATE', payload: date })
                }
                className="block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                minDate={departureDate || new Date()}
                placeholderText="Select return date"
                required
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mode of Transport
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {transportOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={`flex items-center justify-center p-3 rounded-md border transition ${
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