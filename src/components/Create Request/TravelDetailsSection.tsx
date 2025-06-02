import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Plane, Train, Bus, Car, AlertCircle, MapPin, Calendar } from 'lucide-react';
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
    projectCode,
    reason,
    comments
  } = state;

  // Country validation for both domestic and international travel
  const [validationError, setValidationError] = React.useState<string | null>(null);

  useEffect(() => {
    // Check validation when travel type or locations change
    if (source && destination) {
      // Check if source and destination are the same
      const sourceLocation = `${source.city}-${source.state}-${source.country}`.toLowerCase();
      const destinationLocation = `${destination.city}-${destination.state}-${destination.country}`.toLowerCase();
      
      if (sourceLocation === destinationLocation) {
        setValidationError('Source and destination cannot be the same location');
        return;
      }

      // Check country validation
      if (source.country && destination.country) {
        const sameCountry = source.country === destination.country;
        
        if (travelType === 'domestic' && !sameCountry) {
          setValidationError(
            `Domestic travel must be within the same country. Source: ${source.country}, Destination: ${destination.country}`
          );
        } else if (travelType === 'international' && sameCountry) {
          setValidationError(
            `International travel requires different countries. Both source and destination are in ${source.country}`
          );
        } else {
          setValidationError(null);
        }
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [travelType, source, destination]);

  const parseLocationFromLabel = (label: string) => {
    const parts = label.split(',').map(part => part.trim());
    
    let city = "";
    let state = "";
    let country = "";
    
    if (parts.length === 1) {
      // Only city provided
      city = parts[0];
    } else if (parts.length === 2) {
      // City and Country
      city = parts[0];
      country = parts[1]; // Last element is country
    } else if (parts.length === 3) {
      // City, State, Country
      city = parts[0];
      state = parts[1];
      country = parts[2]; // Last element is country
    } else if (parts.length >= 4) {
      // City, District/Area, State, Country (like Kochi, Ernakulam, Kerala, India)
      city = parts[0];
      state = parts[parts.length - 2]; // Second to last is state
      country = parts[parts.length - 1]; // Last element is country
    }
    
    return { city, state, country };
  };

  const handleSourceSelect = (location: any) => {
    let sourceLocation;
    
    if (location.custom && location.label) {
      // For custom entries, parse the label properly
      const parsed = parseLocationFromLabel(location.label);
      sourceLocation = {
        country: parsed.country,
        city: parsed.city,
        state: parsed.state,
        label: location.label,
        value: location.value || `${parsed.city}-${parsed.state}-${parsed.country}`.toLowerCase().replace(/\s+/g, '-')
      };
    } else {
      // For API results, use the existing logic
      sourceLocation = {
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
    }
    
    dispatch({ type: 'SET_SOURCE', payload: sourceLocation });
  };

  const handleDestinationSelect = (location: any) => {
    let destinationLocation;
    
    if (location.custom && location.label) {
      // For custom entries, parse the label properly
      const parsed = parseLocationFromLabel(location.label);
      destinationLocation = {
        country: parsed.country,
        city: parsed.city,
        state: parsed.state,
        label: location.label,
        value: location.value || `${parsed.city}-${parsed.state}-${parsed.country}`.toLowerCase().replace(/\s+/g, '-')
      };
    } else {
      // For API results, use the existing logic
      destinationLocation = {
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
    }
    
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
              <h4 className="text-sm font-medium text-red-800"></h4>
              <p className="text-sm text-red-700 mt-1">{validationError}</p>
            </div>
          </div>
        )}

        {/* Source and Destination */}        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <div className="relative">
                <LocationSearch 
                  onSelect={handleSourceSelect}
                  placeholder="Search for source location..."
                  maxCustomLength={100}
                  className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            {source && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
                <p><strong>Selected:</strong> {source.label || [source.city, source.state, source.country].filter(Boolean).join(", ")}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <div className="relative">
                <LocationSearch 
                  onSelect={handleDestinationSelect}
                  placeholder="Search for destination location..."
                  maxCustomLength={100}
                  className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
            {destination && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
                <p><strong>Selected:</strong> {destination.label || [destination.city, destination.state, destination.country].filter(Boolean).join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Code */}
        <div className="max-w-md">
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

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
              <DatePicker
                selected={departureDate}
                onChange={(date) => 
                  dispatch({ type: 'SET_DEPARTURE_DATE', payload: date })
                }
                className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                minDate={new Date()}
                placeholderText="Select departure date"
                required
              />
            </div>
          </div>

          {tripType === 'roundTrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <DatePicker
                  selected={returnDate}
                  onChange={(date) => 
                    dispatch({ type: 'SET_RETURN_DATE', payload: date })
                  }
                  className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  minDate={departureDate || new Date()}
                  placeholderText="Select return date"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Mode of Transport */}
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
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => dispatch({ type: 'SET_TRANSPORT_MODE', payload: value })}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Purpose of Travel and Comments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Travel
            </label>
            <textarea
              className="block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              rows={4}
              value={reason}
              onChange={(e) => dispatch({ type: 'SET_REASON', payload: e.target.value })}
              placeholder="Provide details about the purpose of your travel..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea
              className="block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              rows={4}
              value={comments}
              onChange={(e) => dispatch({ type: 'SET_COMMENTS', payload: e.target.value })}
              placeholder="Any additional comments or special requirements..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailsSection;