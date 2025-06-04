import React from 'react';
import { MapPin, MessageSquare } from 'lucide-react';
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
    requiresFoodPreference,
    foodPreference,
    foodPreferenceComment, // Add this to your state type
    source // Added source to get the source location
  } = state;

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

  const handlePickupLocationSelect = (location: any) => {
    let pickupLocationData;
    
    if (location.custom && location.label) {
      // For custom entries, parse the label properly
      const parsed = parseLocationFromLabel(location.label);
      pickupLocationData = {
        country: parsed.country,
        city: parsed.city,
        state: parsed.state,
        label: location.label,
        value: location.value || `${parsed.city}-${parsed.state}-${parsed.country}`.toLowerCase().replace(/\s+/g, '-')
      };
    } else {
      // For API results, use the existing logic
      pickupLocationData = {
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
    
    dispatch({ type: 'SET_PICKUP_LOCATION', payload: pickupLocationData.label });
  };

  const handleDropoffLocationSelect = (location: any) => {
    let dropoffLocationData;
    
    if (location.custom && location.label) {
      // For custom entries, parse the label properly
      const parsed = parseLocationFromLabel(location.label);
      dropoffLocationData = {
        country: parsed.country,
        city: parsed.city,
        state: parsed.state,
        label: location.label,
        value: location.value || `${parsed.city}-${parsed.state}-${parsed.country}`.toLowerCase().replace(/\s+/g, '-')
      };
    } else {
      // For API results, use the existing logic
      dropoffLocationData = {
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
    
    dispatch({ type: 'SET_DROPOFF_LOCATION', payload: dropoffLocationData.label });
  };

  // Set pickup location to source location when pickup is required
  React.useEffect(() => {
    if (requiresPickup && source && !pickupLocation) {
      const sourceLocationString = source.label || [source.city, source.state, source.country].filter(Boolean).join(", ");
      dispatch({ type: 'SET_PICKUP_LOCATION', payload: sourceLocationString });
    }
  }, [requiresPickup, source, pickupLocation, dispatch]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="h-8 w-1 bg-blue-600 rounded mr-3"></div>
        <h3 className="text-lg font-semibold text-gray-800">Additional Services</h3>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="accommodation"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={requiresAccommodation}
            onChange={(e) => 
              dispatch({ type: 'SET_REQUIRES_ACCOMMODATION', payload: e.target.checked })
            }
          />
          <label htmlFor="accommodation" className="text-sm font-medium text-gray-700">
            Requires Accommodation
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="pickup"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={requiresPickup}
            onChange={(e) => 
              dispatch({ type: 'SET_REQUIRES_PICKUP', payload: e.target.checked })
            }
          />
          <label htmlFor="pickup" className="text-sm font-medium text-gray-700">
            Requires Pickup
          </label>
        </div>

        {requiresPickup && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <div className="relative">
                  <LocationSearch 
                    onSelect={handlePickupLocationSelect}
                    placeholder="Search for pickup location..."
                    maxCustomLength={100}
                    initialValue={source ? (source.label || [source.city, source.state, source.country].filter(Boolean).join(", ")) : ""}
                    className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              {pickupLocation && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
                  <p><strong>Selected:</strong> {pickupLocation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="dropoff"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={requiresDropoff}
            onChange={(e) => 
              dispatch({ type: 'SET_REQUIRES_DROPOFF', payload: e.target.checked })
            }
          />
          <label htmlFor="dropoff" className="text-sm font-medium text-gray-700">
            Requires Drop-off
          </label>
        </div>

        {requiresDropoff && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop-off Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <div className="relative">
                  <LocationSearch 
                    onSelect={handleDropoffLocationSelect}
                    placeholder="Search for drop-off location..."
                    maxCustomLength={100}
                    className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
              {dropoffLocation && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
                  <p><strong>Selected:</strong> {dropoffLocation}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="foodPreference"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={requiresFoodPreference}
            onChange={(e) => 
              dispatch({ type: 'SET_REQUIRES_FOOD_PREFERENCE', payload: e.target.checked })
            }
          />
          <label htmlFor="foodPreference" className="text-sm font-medium text-gray-700">
            Food Preference Required
          </label>
        </div>

        {requiresFoodPreference && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block text-gray-700">
                Select Food Preference
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="veg"
                    name="foodPreference"
                    value="veg"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={foodPreference === 'veg'}
                    onChange={(e) => 
                      dispatch({ type: 'SET_FOOD_PREFERENCE', payload: e.target.value as 'veg' | 'non-veg' })
                    }
                  />
                  <label htmlFor="veg" className="text-sm font-medium text-gray-700">
                    Vegetarian
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="nonVeg"
                    name="foodPreference"
                    value="non-veg"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={foodPreference === 'non-veg'}
                    onChange={(e) => 
                      dispatch({ type: 'SET_FOOD_PREFERENCE', payload: e.target.value as 'veg' | 'non-veg' })
                    }
                  />
                  <label htmlFor="nonVeg" className="text-sm font-medium text-gray-700">
                    Non-Vegetarian
                  </label>
                </div>
              </div>
            </div>

            {/* Food Preference Comment Box */}
            {foodPreference && (
              <div className="mt-4">
                <label htmlFor="foodComment" className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span>Additional Food Requirements or Comments</span>
                  </div>
                </label>
                <div className="relative">
                  <textarea
                    id="foodComment"
                    rows={3}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Specify any allergies, dietary restrictions, or special food requirements..."
                    value={foodPreferenceComment || ''}
                    onChange={(e) => 
                      dispatch({ type: 'SET_FOOD_PREFERENCE_COMMENT', payload: e.target.value })
                    }
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {(foodPreferenceComment || '').length}/500
                  </div>
                </div>
                {foodPreferenceComment && (
                  <div className="mt-2 p-3 bg-green-50 rounded-lg text-sm border border-green-100">
                    <p className="text-green-800">
                      <strong>Note:</strong> Your food preferences and requirements have been noted.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalServicesSection;