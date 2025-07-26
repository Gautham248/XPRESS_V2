import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isValid, isBefore } from 'date-fns';
import Select from 'react-select';
import {
  Plane,
  Train,
  BusFront as Bus,
  Car,
  X,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
} from 'lucide-react';

// --- INTERFACES ---
export interface DetailedTravelRequest {
  requestId: string;
  userId: number;
  travelModeId: number;
  isInternational: boolean;
  isRoundTrip: boolean;
  projectCode: string;
  sourcePlace: string;
  sourceCountry: string;
  destinationPlace: string;
  destinationCountry: string;
  outboundDepartureDate: string;
  outboundArrivalDate: string | null;
  returnDepartureDate: string | null;
  returnArrivalDate: string | null;
  isAccommodationRequired: boolean;
  isDropOffRequired: boolean;
  dropOffPlace: string | null;
  isPickUpRequired: boolean;
  pickUpPlace: string | null;
  comments: string;
  purposeOfTravel: string;
  isVegetarian: boolean;
  foodComment: string;
  attendedCCT: boolean;
  ldCertificatePath: string;
  currentStatusId: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// UPDATED Address INTERFACE (from your provided LocationSearch)
export interface Address {
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
  value?: string; // New: Unique identifier for the location
  label?: string; // New: Display name for the location
  custom?: boolean; // New: Flag if it's a custom user input
  postcode?: string;
}

// UPDATED Suggestion INTERFACE (from your provided LocationSearch)
interface Suggestion {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
    [key: string]: string | undefined;
  };
}

interface ProjectCodeOption { value: string; label: string; }

// --- LOCATION SEARCH SUB-COMPONENT (UPDATED TO BE CONTROLLED) ---
interface LocationSearchProps {
  onSelect: (location: Address) => void;
  placeholder?: string;
  className?: string;
  maxCustomLength?: number;
  value: string; // ADDED: Controlled value prop
  onChange: (value: string) => void; // ADDED: onChange handler for text input
  disabled?: boolean; // Added back from original modal props
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelect,
  placeholder = "Type a city...",
  className = "",
  maxCustomLength = 100,
  value,
  onChange,
  disabled = false,
}) => {
  const query = value;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCustomOption, setShowCustomOption] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // New states for managing dropdown visibility and interaction
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false); // To keep dropdown open while hovering over suggestions

  // Ref for the component wrapper to detect clicks outside
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside handler for the component (input + dropdown)
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the wrapperRef and the dropdown is not being hovered
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsInputFocused(false); // Close dropdown if clicked outside
        setIsDropdownHovered(false); // Also reset this state
      }
    };

    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowCustomOption(false);
        setHasSearched(false);
      }
    }, 500);

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearTimeout(delayDebounce);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [query]); // Depend on query to re-run debounce effect

  const fetchSuggestions = async (input: string) => {
    setLoading(true);
    // Reset these states only when starting a new search
    setSuggestions([]);
    setShowCustomOption(false);
    setHasSearched(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`, // Changed to 'q' for general search, allows countries.
        {
          headers: {
            "User-Agent": "TravelRequestApp (admin@travelrequestapp.com)",
          },
        }
      );
      const data = await response.json();

      // Filter for results that have at least a city OR a country.
      const filtered: Suggestion[] = data.filter(
        (item: any) =>
          item.address &&
          (item.address.city || item.address.town || item.address.village || item.address.country)
      );

      setSuggestions(filtered);
      setHasSearched(true);

      // Show custom option if no *filtered* results found and query is not empty and not loading
      setShowCustomOption(
        !loading && filtered.length === 0 && query.trim().length > 0
      );

    } catch (error) {
      console.error("Fetch error:", error);
      setHasSearched(true);
      setShowCustomOption(query.trim().length > 0); // Allow custom if fetch failed
    } finally {
      setLoading(false);
    }
  };

  const cleanDisplayName = (suggestion: Suggestion) => {
    let displayName = suggestion.display_name;
    // Attempt to remove postcode if present
    if (suggestion.address && suggestion.address.postcode) {
      displayName = displayName.replace(new RegExp(`(,\\s*)?${suggestion.address.postcode}(,\\s*)?`, 'g'), ', ');
      displayName = displayName.replace(/,\s*,/g, ',');
      displayName = displayName.replace(/,\s*$/, '');
    }
    return displayName;
  };

  const handleSelect = (suggestion: Suggestion) => {
    const address = suggestion.address;
    const displayName = cleanDisplayName(suggestion);

    const cityPart = address.city || address.town || address.village || "";
    const statePart = address.state || "";
    const countryPart = address.country || "";

    const locationData: Address = {
      city: cityPart,
      state: statePart,
      country: countryPart,
      value: `${cityPart}-${statePart}-${countryPart}`.toLowerCase().replace(/\s+/g, '-'),
      label: displayName,
      postcode: address.postcode
    };

    onSelect(locationData);
    onChange(displayName); // This updates the input field's text
    setSuggestions([]);
    setShowCustomOption(false);
    setHasSearched(false);
    setIsInputFocused(false); // Hide dropdown after selection
  };

  const handleCustomSelect = () => {
    if (!showCustomOption || query.trim().length === 0) return;

    const parts = query.split(',').map(part => part.trim()).filter(Boolean); // Filter out empty parts

    let cityPart = "";
    let statePart = "";
    let countryPart = "";

    if (parts.length === 1) {
      cityPart = parts[0];
    } else if (parts.length >= 2) {
      countryPart = parts[parts.length - 1];
      if (parts.length >= 3) {
          statePart = parts[parts.length - 2];
          cityPart = parts.slice(0, parts.length - 2).join(', ');
      } else { // Exactly two parts: City, Country
          cityPart = parts[0];
      }
    }

    const locationData: Address = {
      city: cityPart,
      state: statePart,
      country: countryPart,
      value: `${cityPart}-${statePart}-${countryPart}`.toLowerCase().replace(/\s+/g, '-'),
      label: query,
      custom: true
    };

    onSelect(locationData);
    onChange(query);
    setSuggestions([]);
    setShowCustomOption(false);
    setHasSearched(false);
    setIsInputFocused(false); // Hide dropdown after custom selection
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showCustomOption) {
      e.preventDefault();
      handleCustomSelect();
    }
  };

  // Determine if dropdown should be shown
  const shouldShowDropdown =
    isInputFocused && !disabled && (
      loading || // If loading, show loading indicator within dropdown
      (query.length > 2 && suggestions.length > 0) || // If sufficient query & results, show results
      showCustomOption || // If custom option is available, show it
      (query.length > 0 && !hasSearched && !loading && query.length <= 2) // If query exists but not yet searched/loading & short, show hint
    );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
        <input
            type="text"
            value={value}
            onChange={(e) => {
                if (e.target.value.length <= maxCustomLength) {
                    onChange(e.target.value);
                }
                setIsInputFocused(true); // Ensure dropdown is visible when typing
            }}
            onFocus={() => {
                setIsInputFocused(true);
                // Re-fetch suggestions if re-focusing and query is long enough but not yet searched
                if (query.length > 2 && !hasSearched && !loading) {
                    fetchSuggestions(query);
                }
            }}
            onBlur={() => {
                // Delay hiding dropdown to allow click on suggestions to register
                setTimeout(() => {
                    if (!isDropdownHovered) { // Only hide if mouse isn't hovering over dropdown
                        setIsInputFocused(false);
                    }
                }, 100); // Small delay to allow click event to register before blur fully takes effect
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className} ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'}`}
            disabled={disabled}
        />
      </div>

      {loading && !shouldShowDropdown && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>}

      {shouldShowDropdown && (
        <ul
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          onMouseEnter={() => setIsDropdownHovered(true)}
          onMouseLeave={() => setIsDropdownHovered(false)}
        >
          {loading && query.length > 2 && ( // Show loading indicator in dropdown only if query is long enough
            <li className="relative cursor-default select-none py-2 px-3 text-gray-500">Loading suggestions...</li>
          )}
          {!loading && suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <li key={i} onClick={() => handleSelect(s)} className="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100">{cleanDisplayName(s)}</li>
            ))
          ) : (!loading && query.length > 2 && hasSearched && !showCustomOption) ? (
            <li className="relative cursor-default select-none py-2 px-3 text-gray-500">No results found.</li>
          ) : null}
          {showCustomOption && (
            <li
              onClick={handleCustomSelect}
              className="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100 flex items-center"
            >
              <span className="text-blue-600 font-medium">Use custom:</span>
              <span className="ml-2">{query}</span>
            </li>
          )}
          {/* Hint for user to type more for suggestions */}
          {!loading && query.length <= 2 && query.length > 0 && isInputFocused && (
            <li className="relative cursor-default select-none py-2 px-3 text-gray-500">Keep typing for suggestions...</li>
          )}
        </ul>
      )}

      {query.length > maxCustomLength * 0.8 && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {query.length}/{maxCustomLength}
        </div>
      )}
    </div>
  );
};

// --- MAIN MODAL COMPONENT ---
interface EditTravelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: DetailedTravelRequest | null;
  onUpdate: (updatedData: any) => void;
  status: string | null;
}
const EditTravelRequestModal: React.FC<EditTravelRequestModalProps> = ({ isOpen, onClose, request, onUpdate, status }) => {
    const [formData, setFormData] = useState({
        travelType: 'Domestic' as 'Domestic' | 'International', tripType: 'Round Trip' as 'One Way' | 'Round Trip',
        source: null as Address | null,
        destination: null as Address | null,
        sourceText: '',
        destinationText: '',
        projectCode: '',
        departureDate: '', departureTime: '', departureArrivalDate: '', departureArrivalTime: '',
        returnDepartureDate: '', returnDepartureTime: '', returnArrivalDate: '', returnArrivalTime: '',
        modeOfTransport: 'Flight' as 'Flight' | 'Train' | 'Bus' | 'Cab',
        purpose: '', comments: '',
        requiresAccommodation: false, requiresPickup: false, pickupLocation: '',
        requiresDropoff: false, dropoffLocation: '',
        requiresFoodPreference: false, foodPreference: '' as 'veg' | 'non-veg' | '', foodPreferenceComment: '',
    });

    const [projectCodesList, setProjectCodesList] = useState<ProjectCodeOption[]>([]);
    const [projectCodesLoading, setProjectCodesLoading] = useState<boolean>(true);
    const [projectCodesError, setProjectCodesError] = useState<string | null>(null);

    const isPartiallyLocked = status === 'InTransit';

    useEffect(() => {
        const fetchProjectCodes = async () => {
          setProjectCodesLoading(true); setProjectCodesError(null);
          try {
            const response = await fetch('http://localhost:5030/api/RMT/project-codes');
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const data: string[] = await response.json();
            setProjectCodesList(data.map((code: string) => ({ value: code, label: code })));
          } catch (error) {
            console.error("Failed to fetch project codes:", error);
            setProjectCodesError("Failed to load codes. You can enter one manually.");
          } finally { setProjectCodesLoading(false); }
        };
        fetchProjectCodes();
    }, []);

    useEffect(() => {
        if (request) {
            const getTravelModeName = (id: number): 'Flight' | 'Train' | 'Bus' | 'Cab' => {
                switch (id) {
                    case 1: return 'Flight';
                    case 2: return 'Train';
                    case 3: return 'Bus';
                    case 4: return 'Cab';
                    default: return 'Flight';
                }
            };

            const formatDate = (isoDate: string | null) => {
                const dateObj = isoDate ? parseISO(isoDate) : null;
                if (dateObj && isValid(dateObj)) {
                    return {
                        date: format(dateObj, 'yyyy-MM-dd'),
                        time: format(dateObj, 'HH:mm'),
                    };
                }
                const today = new Date();
                return {
                    date: format(today, 'yyyy-MM-dd'),
                    time: format(today, 'HH:mm'),
                };
            };

            const formatOptionalDate = (isoDate: string | null) => {
                if (!isoDate) return { date: '', time: '' };
                const dateObj = parseISO(isoDate);
                if (isValid(dateObj) && dateObj.getFullYear() > 1) {
                    return {
                        date: format(dateObj, 'yyyy-MM-dd'),
                        time: format(dateObj, 'HH:mm'),
                    };
                }
                return { date: '', time: '' };
            };

            const outbound = formatDate(request.outboundDepartureDate);
            const outboundArrival = formatOptionalDate(request.outboundArrivalDate);
            const returnDep = formatOptionalDate(request.returnDepartureDate);
            const returnArr = formatOptionalDate(request.returnArrivalDate);

            const sourceDisplay = [request.sourcePlace, request.sourceCountry].filter(Boolean).join(', ');
            const destinationDisplay = [request.destinationPlace, request.destinationCountry].filter(Boolean).join(', ');

            setFormData({
                travelType: request.isInternational ? 'International' : 'Domestic',
                tripType: request.isRoundTrip ? 'Round Trip' : 'One Way',
                source: {
                    city: request.sourcePlace || '',
                    country: request.sourceCountry || '',
                    label: sourceDisplay,
                    custom: false
                },
                destination: {
                    city: request.destinationPlace || '',
                    country: request.destinationCountry || '',
                    label: destinationDisplay,
                    custom: false
                },
                sourceText: sourceDisplay,
                destinationText: destinationDisplay,
                projectCode: request.projectCode || '',
                departureDate: outbound.date,
                departureTime: outbound.time,
                departureArrivalDate: outboundArrival.date,
                departureArrivalTime: outboundArrival.time,
                returnDepartureDate: returnDep.date,
                returnDepartureTime: returnDep.time,
                returnArrivalDate: returnArr.date,
                returnArrivalTime: returnArr.time,
                modeOfTransport: getTravelModeName(request.travelModeId),
                purpose: request.purposeOfTravel || '',
                comments: request.comments || '',
                requiresAccommodation: request.isAccommodationRequired,
                requiresPickup: request.isPickUpRequired,
                pickupLocation: request.pickUpPlace || '', // Ensure it's a string for LocationSearch component
                requiresDropoff: request.isDropOffRequired,
                dropoffLocation: request.dropOffPlace || '', // Ensure it's a string for LocationSearch component
                requiresFoodPreference: request.isVegetarian || !!request.foodComment,
                foodPreference: request.isVegetarian ? 'veg' : 'non-veg',
                foodPreferenceComment: request.foodComment || '',
            });
        }
    }, [request]);

    if (!isOpen) return null;

    const createISODate = (date: string, time: string) => {
        if (!date || date.trim() === '') {
            return null;
        }

        const cleanDate = date.trim();
        const cleanTime = time?.trim() || '00:00';

        try {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(cleanDate)) {
                console.warn(`Invalid date format: ${cleanDate}`);
                return null;
            }

            const timePattern = /^\d{2}:\d{2}$/;
            if (!timePattern.test(cleanTime)) {
                console.warn(`Invalid time format: ${cleanTime}`);
                return null;
            }

            const dateObj = new Date(`${cleanDate}T${cleanTime}:00`);

            if (isNaN(dateObj.getTime())) {
                console.warn(`Invalid date/time combination: ${cleanDate} ${cleanTime}`);
                return null;
            }

            return dateObj.toISOString();

        } catch (error) {
            console.error("Error creating ISO date:", error);
            return null;
        }
    };

    const getTravelModeId = (modeOfTransport: string) => {
        const modeMap: { [key: string]: number } = {
            'Flight': 1,
            'Train': 2,
            'Bus': 3,
            'Car': 4,
            'Ship': 5,
            'Other': 6
        };
        return modeMap[modeOfTransport] || 6;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!formData.departureDate) {
                alert('Departure date is required');
                return;
            }

            if (!formData.projectCode) {
                alert('Project code is required');
                return;
            }

            if (!formData.source || !formData.destination) {
                alert('Source and destination locations are required.');
                return;
            }

            const finalSourcePlace = formData.source.city || formData.source.town || formData.source.village || '';
            const finalSourceCountry = formData.source.country || '';

            const finalDestinationPlace = formData.destination.city || formData.destination.town || formData.destination.village || '';
            const finalDestinationCountry = formData.destination.country || '';

            if (!finalSourceCountry) {
                alert('Source country is required. Please select a valid source location or type a custom one including country.');
                return;
            }
            if (!finalDestinationCountry) {
                alert('Destination country is required. Please select a valid destination location or type a custom one including country.');
                return;
            }

            const outboundDepartureDate = createISODate(formData.departureDate, formData.departureTime);
            if (!outboundDepartureDate) {
                alert('Invalid departure date or time format');
                return;
            }

            if (formData.tripType === 'Round Trip') {
                if (!formData.returnDepartureDate) {
                    alert('Return departure date is required for round trips');
                    return;
                }

                const returnDepartureDate = createISODate(formData.returnDepartureDate, formData.returnDepartureTime);
                if (!returnDepartureDate) {
                    alert('Invalid return departure date or time format');
                    return;
                }
            }

            const mappedData = {
                travelModeId: getTravelModeId(formData.modeOfTransport),
                isInternational: formData.travelType === 'International',
                isRoundTrip: formData.tripType === 'Round Trip',
                projectCode: formData.projectCode.trim(),
                sourcePlace: finalSourcePlace,
                sourceCountry: finalSourceCountry,
                destinationPlace: finalDestinationPlace,
                destinationCountry: finalDestinationCountry,
                outboundDepartureDate: outboundDepartureDate,
                outboundArrivalDate: createISODate(formData.departureArrivalDate, formData.departureArrivalTime),
                returnDepartureDate: formData.tripType === 'Round Trip'
                    ? createISODate(formData.returnDepartureDate, formData.returnDepartureTime)
                    : null,
                returnArrivalDate: formData.tripType === 'Round Trip'
                    ? createISODate(formData.returnArrivalDate, formData.returnArrivalTime)
                    : null,
                isAccommodationRequired: formData.requiresAccommodation,
                isDropOffRequired: formData.requiresDropoff,
                // FIX START: Handle DropOffPlace for null vs '' consistently
                dropOffPlace: formData.requiresDropoff
                    ? (formData.dropoffLocation?.trim() || '') // If required, send trimmed value or empty string
                    : (request?.dropOffPlace === null ? null : ''), // If NOT required, send null if original was null, otherwise empty string
                // FIX END
                isPickUpRequired: formData.requiresPickup,
                // FIX START: Handle PickUpPlace for null vs '' consistently
                pickUpPlace: formData.requiresPickup
                    ? (formData.pickupLocation?.trim() || '') // If required, send trimmed value or empty string
                    : (request?.pickUpPlace === null ? null : ''), // If NOT required, send null if original was null, otherwise empty string
                // FIX END
                comments: formData.comments?.trim() || '',
                purposeOfTravel: formData.purpose?.trim() || '',
                isVegetarian: formData.requiresFoodPreference ? formData.foodPreference === 'veg' : false,
                foodComment: formData.requiresFoodPreference ? (formData.foodPreferenceComment || '') : '',
                attendedCCT: request?.attendedCCT ?? true,
                ldCertificatePath: request?.ldCertificatePath ?? ""
            };

            console.log('Mapped data being sent:', JSON.stringify(mappedData, null, 2));

            onUpdate(mappedData);

        } catch (error) {
            console.error('Error in form submission:', error);
            alert('There was an error processing your request. Please check the console for details.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };

    const transportOptions = [ { value: 'Flight', label: 'Flight', icon: Plane }, { value: 'Train', label: 'Train', icon: Train }, { value: 'Bus', label: 'Bus', icon: Bus }, { value: 'Cab', label: 'Cab', icon: Car } ];
    const availableTransportOptions = formData.travelType === 'International' ? transportOptions.filter(opt => opt.value === 'Flight') : transportOptions;
    const renderSegmentedButton = (name: 'travelType' | 'tripType', value: string, label: string, disabled: boolean = false) => ( <button type="button" disabled={disabled} onClick={() => setFormData(prev => ({...prev, [name]: value as any}))} className={`px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formData[name] === value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>{label}</button>);
    const renderTransportButton = (value: 'Flight' | 'Train' | 'Bus' | 'Cab', label: string, Icon: React.ElementType) => ( <button type="button" onClick={() => setFormData(prev => ({ ...prev, modeOfTransport: value }))} className={`flex-1 p-3 text-sm font-medium border rounded-md flex items-center justify-center gap-2 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formData.modeOfTransport === value ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}><Icon className="h-4 w-4" /> {label}</button>);
    const IconInput = ({ icon: Icon, type, name, value, onChange, disabled, ...props }: any) => ( <div className="relative"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" /><input type={type} name={name} value={value} onChange={onChange} className={`w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'}`} disabled={disabled} {...props} /></div>);

    // Helper function to parse text input into an Address object for immediate state update
    const parseTextInputToAddress = (text: string): Address => {
      const parts = text.split(',').map(part => part.trim()).filter(Boolean);

      let cityPart = "";
      let statePart = "";
      let countryPart = "";

      if (parts.length === 1) {
          cityPart = parts[0];
      } else if (parts.length >= 2) {
          countryPart = parts[parts.length - 1];
          if (parts.length >= 3) {
              statePart = parts[parts.length - 2];
              cityPart = parts.slice(0, parts.length - 2).join(', ');
          } else { // Exactly two parts: City, Country
              cityPart = parts[0];
          }
      }

      return {
          city: cityPart,
          state: statePart,
          country: countryPart,
          label: text, // The label is just the raw text typed by the user
          custom: true,
          value: `${cityPart}-${statePart}-${countryPart}`.toLowerCase().replace(/\s+/g, '-')
      };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
            <div className="relative bg-gray-50 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10"><h2 className="text-xl font-bold text-gray-800">Edit Travel Request</h2><button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"><X className="w-6 h-6" /></button></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-white p-5 rounded-lg border space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Type</label>
                            <div className="inline-flex rounded-md shadow-sm">{renderSegmentedButton('travelType', 'Domestic', 'Domestic', isPartiallyLocked)}{renderSegmentedButton('travelType', 'International', 'International', isPartiallyLocked)}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                            <div className="inline-flex rounded-md shadow-sm">{renderSegmentedButton('tripType', 'One Way', 'One Way', isPartiallyLocked)}{renderSegmentedButton('tripType', 'Round Trip', 'Round Trip', isPartiallyLocked)}</div>
                          </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border space-y-4">
                        <h3 className="font-semibold text-gray-800 text-lg">Travel Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source Location</label>
                                <LocationSearch
                                    value={formData.sourceText}
                                    onChange={(text) => setFormData(p => ({ ...p, sourceText: text, source: parseTextInputToAddress(text) }))}
                                    onSelect={(loc) => setFormData(p => ({ ...p, source: loc, sourceText: loc.label || '' }))}
                                    placeholder="Search for source..."
                                    disabled={isPartiallyLocked}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                <LocationSearch
                                    value={formData.destinationText}
                                    onChange={(text) => setFormData(p => ({ ...p, destinationText: text, destination: parseTextInputToAddress(text) }))}
                                    onSelect={(loc) => setFormData(p => ({ ...p, destination: loc, destinationText: loc.label || '' }))}
                                    placeholder="Search for destination..."
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="projectCode" className="block text-sm font-medium text-gray-700 mb-1">Project Code *</label>
                            <Select inputId="projectCode" options={projectCodesList} value={projectCodesList.find(o => o.value === formData.projectCode) || null} onChange={(o) => setFormData(p => ({ ...p, projectCode: o ? o.value : '' }))} placeholder="Select or type..." isClearable isLoading={projectCodesLoading} isDisabled={projectCodesLoading || isPartiallyLocked} noOptionsMessage={() => projectCodesError || 'No matching codes'} />
                            {projectCodesError && <p className="text-xs text-red-500 mt-1">{projectCodesError}</p>}
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border space-y-4">
                        <div className="flex items-center"><div className="h-6 w-1 bg-green-500 rounded mr-3"></div><h3 className="font-semibold text-gray-800 text-lg">Departure</h3></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Departure Date *</label><IconInput icon={Calendar} type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} disabled={isPartiallyLocked}/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><IconInput icon={Clock} type="time" name="departureTime" value={formData.departureTime} onChange={handleChange} disabled={isPartiallyLocked}/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label><IconInput icon={Calendar} type="date" name="departureArrivalDate" value={formData.departureArrivalDate} onChange={handleChange} disabled={isPartiallyLocked} min={formData.departureDate}/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><IconInput icon={Clock} type="time" name="departureArrivalTime" value={formData.departureArrivalTime} onChange={handleChange} disabled={isPartiallyLocked}/></div>
                        </div>
                    </div>
                    {formData.tripType === 'Round Trip' && (
                        <div className="bg-white p-5 rounded-lg border space-y-4">
                            <div className="flex items-center"><div className="h-6 w-1 bg-orange-500 rounded mr-3"></div><h3 className="font-semibold text-gray-800 text-lg">Return</h3></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label><IconInput icon={Calendar} type="date" name="returnDepartureDate" value={formData.returnDepartureDate} onChange={handleChange} min={formData.departureArrivalDate || formData.departureDate} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><IconInput icon={Clock} type="time" name="returnDepartureTime" value={formData.returnDepartureTime} onChange={handleChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label><IconInput icon={Calendar} type="date" name="returnArrivalDate" value={formData.returnArrivalDate} onChange={handleChange} min={formData.returnDepartureDate} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><IconInput icon={Clock} type="time" name="returnArrivalTime" value={formData.returnArrivalTime} onChange={handleChange} /></div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white p-5 rounded-lg border space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Transport</label>
                            <div className="flex flex-wrap gap-2">{availableTransportOptions.map(opt => renderTransportButton(opt.value as any, opt.label, opt.icon))}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">Purpose of Travel</label><textarea name="purpose" id="purpose" rows={4} value={formData.purpose} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50" placeholder="Provide details..."></textarea></div>
                            <div><label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label><textarea name="comments" id="comments" rows={4} value={formData.comments} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50" placeholder="Any special requirements..."></textarea></div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border">
                        <h3 className="font-semibold text-gray-800 text-lg mb-4">Additional Services</h3>
                        <div className="space-y-4">
                            <div className="flex items-center"><input type="checkbox" id="requiresAccommodation" name="requiresAccommodation" checked={formData.requiresAccommodation} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed" disabled={isPartiallyLocked}/><label htmlFor="requiresAccommodation" className="ml-2 block text-sm text-gray-900">Requires Accommodation</label></div>
                            <div>
                                <div className="flex items-center"><input type="checkbox" id="requiresPickup" name="requiresPickup" checked={formData.requiresPickup} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed" disabled={isPartiallyLocked}/><label htmlFor="requiresPickup" className="ml-2 block text-sm text-gray-900">Requires Pickup</label></div>
                                {formData.requiresPickup && <div className="pl-6 mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                                    <LocationSearch
                                        value={formData.pickupLocation}
                                        onChange={(text) => setFormData(p => ({ ...p, pickupLocation: text }))}
                                        onSelect={(loc) => setFormData(p => ({ ...p, pickupLocation: loc.label || '' }))}
                                        placeholder="Search for pickup location..."
                                        disabled={isPartiallyLocked}
                                    />
                                </div>}
                            </div>
                            <div>
                                <div className="flex items-center"><input type="checkbox" id="requiresDropoff" name="requiresDropoff" checked={formData.requiresDropoff} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="requiresDropoff" className="ml-2 block text-sm text-gray-900">Requires Dropoff</label></div>
                                {formData.requiresDropoff && <div className="pl-6 mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label>
                                    <LocationSearch
                                        value={formData.dropoffLocation}
                                        onChange={(text) => setFormData(p => ({ ...p, dropoffLocation: text }))}
                                        onSelect={(loc) => setFormData(p => ({ ...p, dropoffLocation: loc.label || '' }))}
                                        placeholder="Search for dropoff location..."
                                    />
                                </div>}
                            </div>
                            <div>
                                <div className="flex items-center"><input type="checkbox" id="requiresFoodPreference" name="requiresFoodPreference" checked={formData.requiresFoodPreference} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed" disabled={isPartiallyLocked}/><label htmlFor="requiresFoodPreference" className="ml-2 block text-sm text-gray-900">Food Preference Required</label></div>
                                {formData.requiresFoodPreference && (
                                    <div className="pl-6 mt-3 space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">Select Food Preference</label>
                                        <div className="flex gap-x-6">
                                            <div className="flex items-center"><input type="radio" id="veg" name="foodPreference" value="veg" checked={formData.foodPreference === 'veg'} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" disabled={isPartiallyLocked}/><label htmlFor="veg" className="ml-2 block text-sm text-gray-700">Vegetarian</label></div>
                                            <div className="flex items-center"><input type="radio" id="non-veg" name="foodPreference" value="non-veg" checked={formData.foodPreference === 'non-veg'} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed" disabled={isPartiallyLocked}/><label htmlFor="non-veg" className="ml-2 block text-sm text-gray-700">Non-Vegetarian</label></div>
                                        </div>
                                        <div className="relative">
                                            <label htmlFor="foodComment" className="block text-sm font-medium text-gray-700 mb-2"><div className="flex items-center space-x-2"><MessageSquare className="h-4 w-4 text-gray-500" /><span>Additional Food Requirements</span></div></label>
                                            <textarea id="foodComment" name="foodPreferenceComment" rows={3} className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-200 disabled:cursor-not-allowed" placeholder="Specify any allergies or dietary restrictions..." value={formData.foodPreferenceComment} onChange={handleChange} maxLength={500} disabled={isPartiallyLocked}/>
                                            <div className="absolute bottom-2 right-3 text-xs text-gray-400">{formData.foodPreferenceComment.length}/500</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Update Request</button></div>
                </form>
            </div>
        </div>
    );
};
export default EditTravelRequestModal;