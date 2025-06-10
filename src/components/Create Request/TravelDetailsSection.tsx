import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Plane, Train, Bus, Car, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import Select from 'react-select'; 
import { useTravelRequest } from './TravelRequestContext';
import LocationSearch from './LocationSearch';

interface ProjectCodeOption {
  value: string;
  label: string;
}

const TravelDetailsSection: React.FC = () => {
  const { state, dispatch } = useTravelRequest();
  const { 
    travelType, 
    tripType, 
    source, 
    destination, 
    outboundDepartureDate,
    outboundDepartureTime,
    outboundArrivalDate,
    outboundArrivalTime,
    returnDepartureDate,
    returnDepartureTime,
    returnArrivalDate,
    returnArrivalTime,
    transportMode,
    projectCode,
    reason,
    comments
  } = state;

  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDateFields, setShowDateFields] = useState<boolean>(false);

  const [projectCodesList, setProjectCodesList] = useState<ProjectCodeOption[]>([]);
  const [projectCodesLoading, setProjectCodesLoading] = useState<boolean>(true);
  const [projectCodesError, setProjectCodesError] = useState<string | null>(null);

  useEffect(() => {
    if (source && destination) {
      const sourceLocation = `${source.city}-${source.state}-${source.country}`.toLowerCase();
      const destinationLocation = `${destination.city}-${destination.state}-${destination.country}`.toLowerCase();
      
      if (sourceLocation === destinationLocation) {
        setValidationError('Source and destination cannot be the same location');
        return;
      }

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

  useEffect(() => {
    const fetchProjectCodes = async () => {
      setProjectCodesLoading(true);
      setProjectCodesError(null);
      try {
        const response = await fetch('http://localhost:5030/api/RMT/project-codes');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: string[] = await response.json(); 
        
        const formattedCodes = data.map((code: string) => ({
          value: code,
          label: code 
        }));
        

        setProjectCodesList(formattedCodes);
      } catch (error) {
        console.error("Failed to fetch project codes:", error);
        setProjectCodesError("Failed to load project codes. You can enter it manually.");
      } finally {
        setProjectCodesLoading(false);
      }
    };

    fetchProjectCodes();
  }, []);


  const parseLocationFromLabel = (label: string) => {
    const parts = label.split(',').map(part => part.trim());
    let city = "", state = "", country = "";
    if (parts.length === 1) city = parts[0];
    else if (parts.length === 2) { city = parts[0]; country = parts[1]; }
    else if (parts.length === 3) { city = parts[0]; state = parts[1]; country = parts[2]; }
    else if (parts.length >= 4) { city = parts[0]; state = parts[parts.length - 2]; country = parts[parts.length - 1]; }
    return { city, state, country };
  };

  const handleSourceSelect = (location: any) => {
    let sourceLocation;
    if (location.custom && location.label) {
      const parsed = parseLocationFromLabel(location.label);
      sourceLocation = { country: parsed.country, city: parsed.city, state: parsed.state, label: location.label, value: location.value || `${parsed.city}-${parsed.state}-${parsed.country}`.toLowerCase().replace(/\s+/g, '-') };
    } else {
      sourceLocation = { country: location.country || '', city: location.city || location.town || location.village || '', state: location.state || '', label: location.label || [location.city || location.town || location.village || '', location.state || '', location.country || ''].filter(Boolean).join(", "), value: location.value || `${location.city || location.town || location.village || ''}-${location.state || ''}-${location.country || ''}`.toLowerCase().replace(/\s+/g, '-') };
    }
    dispatch({ type: 'SET_SOURCE', payload: sourceLocation });
  };

  const handleDestinationSelect = (location: any) => {
    let destinationLocation;
    if (location.custom && location.label) {
      const parsed = parseLocationFromLabel(location.label);
      destinationLocation = { country: parsed.country, city: parsed.city, state: parsed.state, label: location.label, value: location.value || `${parsed.city}-${parsed.state}-${parsed.country}`.toLowerCase().replace(/\s+/g, '-') };
    } else {
      destinationLocation = { country: location.country || '', city: location.city || location.town || location.village || '', state: location.state || '', label: location.label || [location.city || location.town || location.village || '', location.state || '', location.country || ''].filter(Boolean).join(", "), value: location.value || `${location.city || location.town || location.village || ''}-${location.state || ''}-${location.country || ''}`.toLowerCase().replace(/\s+/g, '-') };
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

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
      backgroundColor: '#f9fafb',
      minHeight: 'calc(2.25rem + 2px + 0.75rem)', 
      paddingLeft: '0.25rem',
      paddingRight: '0.25rem',
      boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      },
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    }),
    input: (provided: any) => ({ ...provided, color: '#374151', margin: '0px', paddingTop: '0px', paddingBottom: '0px' }),
    valueContainer: (provided: any) => ({ ...provided, padding: '0px 6px' }),
    singleValue: (provided: any) => ({ ...provided, color: '#374151' }),
    placeholder: (provided: any) => ({ ...provided, color: '#9ca3af' }),
    menu: (provided: any) => ({ ...provided, zIndex: 20, backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }),
    option: (provided: any, state: any) => ({ ...provided, backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : '#fff', color: state.isSelected ? '#fff' : '#374151', '&:active': { backgroundColor: '#2563eb' } }),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center mb-6">
        <div className="h-8 w-1 bg-blue-600 rounded mr-3"></div>
        <h3 className="text-lg font-semibold text-gray-800">Travel Details</h3>
      </div>
      
      <div className="space-y-6">
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Validation Error</h4>
              <p className="text-sm text-red-700 mt-1">{validationError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <LocationSearch 
                onSelect={handleSourceSelect}
                placeholder="Search for source location..."
                maxCustomLength={100}
                className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            {source && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
                <p><strong>Selected:</strong> {source.label || [source.city, source.state, source.country].filter(Boolean).join(", ")}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
              <LocationSearch 
                onSelect={handleDestinationSelect}
                placeholder="Search for destination location..."
                maxCustomLength={100}
                className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            {destination && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
                <p><strong>Selected:</strong> {destination.label || [destination.city, destination.state, destination.country].filter(Boolean).join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-6">
          <div className="flex-1 max-w-md">
            <label htmlFor="projectCodeSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Project Code *
            </label>
            {projectCodesLoading ? (
              <div className="block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500">
                Loading project codes...
              </div>
            ) : (
              <>
                <Select
                  inputId="projectCodeSelect"
                  options={projectCodesList}
                  value={projectCodesList.find(option => option.value === projectCode) || null}
                  onChange={(selectedOption: ProjectCodeOption | null) =>
                    dispatch({ type: 'SET_PROJECT_CODE', payload: selectedOption ? selectedOption.value : '' })
                  }
                  placeholder="Select or type to search project code..."
                  isClearable
                  isSearchable
                  isLoading={projectCodesLoading}
                  isDisabled={projectCodesLoading}
                  styles={customSelectStyles}
                  noOptionsMessage={() => projectCodesError ? 'Error loading codes' : 'No matching project codes'}
                />
                {projectCodesError && !projectCodesList.length && (
                   <>
                      <p className="text-xs text-red-500 mt-1">{projectCodesError}</p>
                      <input
                          type="text"
                          className="mt-2 block w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          value={projectCode}
                          onChange={(e) => dispatch({ type: 'SET_PROJECT_CODE', payload: e.target.value })}
                          placeholder="Enter project code (fallback)"
                      />
                   </>
                )}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ opacity: 0, width: "100%", height: 0, position: "absolute", padding: 0, border: 0 }}
                  value={projectCode}
                  onChange={() => {}}
                  required
                />
              </>
            )}
          </div>
          
          <div className="mt-4 lg:mt-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show Arrival Times
            </label>
            <div className="flex items-center">
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showDateFields ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                onClick={() => setShowDateFields(!showDateFields)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showDateFields ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="ml-3 text-sm text-gray-600">
                {showDateFields ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Departure Section */}
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="h-6 w-1 bg-green-600 rounded mr-3"></div>
            <h4 className="text-md font-semibold text-gray-800">Departure</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <DatePicker
                    selected={outboundDepartureDate}
                    onChange={(date) => dispatch({ type: 'SET_OUTBOUND_DEPARTURE_DATE', payload: date })}
                    className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    minDate={new Date()}
                    placeholderText="Select departure date"
                    dateFormat="dd/MM/yy"
                    required
                  />
                </div>
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <input
                    type="time"
                    className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-2 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    value={outboundDepartureTime || ''}
                    onChange={(e) => dispatch({ type: 'SET_OUTBOUND_DEPARTURE_TIME', payload: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {showDateFields && (
              <div className="flex gap-4"> 
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                    <DatePicker
                      selected={outboundArrivalDate}
                      onChange={(date) => dispatch({ type: 'SET_OUTBOUND_ARRIVAL_DATE', payload: date })}
                      className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      minDate={outboundDepartureDate || new Date()}
                      placeholderText="Select arrival date"
                      dateFormat="dd/MM/yy"
                    />
                  </div>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <input
                      type="time"
                      className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-2 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                      value={outboundArrivalTime || ''}
                      onChange={(e) => dispatch({ type: 'SET_OUTBOUND_ARRIVAL_TIME', payload: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Return Section */}
        {tripType === 'roundTrip' && (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-6 w-1 bg-orange-600 rounded mr-3"></div>
              <h4 className="text-md font-semibold text-gray-800">Return</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                    <DatePicker
                      selected={returnDepartureDate}
                      onChange={(date) => dispatch({ type: 'SET_RETURN_DEPARTURE_DATE', payload: date })}
                      className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      minDate={outboundArrivalDate || outboundDepartureDate || new Date()}
                      placeholderText="Select return departure"
                      dateFormat="dd/MM/yy"
                      required
                    />
                  </div>
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <input
                      type="time"
                      className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-2 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                      value={returnDepartureTime || ''}
                      onChange={(e) => dispatch({ type: 'SET_RETURN_DEPARTURE_TIME', payload: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {showDateFields && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arrival Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                      <DatePicker
                        selected={returnArrivalDate}
                        onChange={(date) => dispatch({ type: 'SET_RETURN_ARRIVAL_DATE', payload: date })}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        minDate={returnDepartureDate || outboundArrivalDate || outboundDepartureDate || new Date()}
                        placeholderText="Select return arrival"
                        dateFormat="dd/MM/yy"
                      />
                    </div>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                      <input
                        type="time"
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-2 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                        value={returnArrivalTime || ''}
                        onChange={(e) => dispatch({ type: 'SET_RETURN_ARRIVAL_TIME', payload: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mode of Transport *
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Travel *
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