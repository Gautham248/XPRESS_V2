import React, { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns'; 
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
  outboundArrivalDate: string;
  returnDepartureDate: string | null;
  returnArrivalDate: string | null;
  isAccommodationRequired: boolean;
  isDropOffRequired: boolean;
  dropOffPlace: string;
  isPickUpRequired: boolean;
  pickUpPlace: string;
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
 
export interface Address { city?: string; state?: string; country?: string; label?: string; custom?: boolean; }
interface Suggestion { display_name: string; address: { city?: string; town?: string; village?: string; state?: string; country?: string; postcode?: string; }; }
interface ProjectCodeOption { value: string; label: string; }
 
// --- LOCATION SEARCH SUB-COMPONENT ---
interface LocationSearchProps { onSelect: (location: Address & { custom?: boolean }) => void; placeholder?: string; className?: string; initialValue?: string; disabled?: boolean; }
const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect, placeholder = "Type a city...", className = "", initialValue = "", disabled = false }) => {
  const [query, setQuery] = useState<string>(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => { setQuery(initialValue); }, [initialValue]);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) { fetchSuggestions(query); } else { setSuggestions([]); setShowDropdown(false); }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);
  const fetchSuggestions = async (input: string) => {
    setLoading(true); setShowDropdown(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`, { headers: { "User-Agent": "TravelRequestApp" } });
      setSuggestions(await response.json());
    } catch (error) { console.error("Fetch error:", error); } finally { setLoading(false); }
  };
  const cleanDisplayName = (displayName: string) => displayName.split(', ').slice(0, 4).join(', ');
  const handleSelect = (suggestion: Suggestion) => {
    const { address, display_name } = suggestion;
    const displayName = cleanDisplayName(display_name);
    const locationData: Address = { city: address.city || address.town || address.village || "", state: address.state || "", country: address.country || "", label: displayName, };
    onSelect(locationData); setQuery(displayName); setShowDropdown(false);
  };
  return (
    <div className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => query.length > 2 && setShowDropdown(true)} placeholder={placeholder} className={`w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className} ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'}`} disabled={disabled} />
      </div>
      {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>}
      {showDropdown && !disabled && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {suggestions.length > 0 ? (suggestions.map((s, i) => <li key={i} onClick={() => handleSelect(s)} className="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100">{cleanDisplayName(s.display_name)}</li>)) : !loading && query.length > 2 ? (<li className="relative cursor-default select-none py-2 px-3 text-gray-500">No results found.</li>) : null}
        </ul>
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
        source: null as Address | null, destination: null as Address | null,
        sourceText: '', destinationText: '', projectCode: '',
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
            const response = await fetch('https://xpress-deployment.onrender.com/api/RMT/project-codes');
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
           
            // --- UPDATED FUNCTION TO HANDLE INVALID DATES ---
            const splitISODate = (isoDate: string | null) => {
                if (!isoDate) {
                    return { date: '', time: '' };
                }
               
                try {
                    const dateObj = parseISO(isoDate);
 
                    // Check if the parsed date is valid. If not, default to today.
                    if (!isValid(dateObj)) {
                        console.warn(`Invalid date string received: "${isoDate}". Defaulting to today.`);
                        const today = new Date();
                        return {
                            date: format(today, 'yyyy-MM-dd'),
                            time: format(today, 'HH:mm'),
                        };
                    }
 
                    // If valid, format and return the date and time.
                    return {
                        date: format(dateObj, 'yyyy-MM-dd'),
                        time: format(dateObj, 'HH:mm'),
                    };
                } catch (error) {
                    // Fallback for any other unexpected errors during parsing
                    console.error(`Error parsing date: "${isoDate}". Defaulting to today.`, error);
                    const today = new Date();
                    return {
                        date: format(today, 'yyyy-MM-dd'),
                        time: format(today, 'HH:mm'),
                    };
                }
            };
 
            const outbound = splitISODate(request.outboundDepartureDate);
            const outboundArrival = splitISODate(request.outboundArrivalDate);
            const returnDep = splitISODate(request.returnDepartureDate);
            const returnArr = splitISODate(request.returnArrivalDate);
 
            const sourceDisplay = [request.sourcePlace, request.sourceCountry].filter(Boolean).join(', ');
            const destinationDisplay = [request.destinationPlace, request.destinationCountry].filter(Boolean).join(', ');
 
            setFormData({
                travelType: request.isInternational ? 'International' : 'Domestic',
                tripType: request.isRoundTrip ? 'Round Trip' : 'One Way',
                source: { label: sourceDisplay },
                destination: { label: destinationDisplay },
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
                pickupLocation: request.pickUpPlace || '',
               
                requiresDropoff: request.isDropOffRequired,
                dropoffLocation: request.dropOffPlace || '',
               
                requiresFoodPreference: request.isVegetarian || !!request.foodComment,
                foodPreference: request.isVegetarian ? 'veg' : 'non-veg',
                foodPreferenceComment: request.foodComment || '',
            });
        }
    }, [request]);
 
    if (!isOpen) return null;
 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };
 
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
       
        const extractLocationData = (locationLabel: string) => {
            if (!locationLabel) return { place: '', country: '' };
            const parts = locationLabel.split(', ').filter(Boolean);
            if (parts.length === 0) return { place: '', country: '' };
            const country = parts[parts.length - 1];
            const place = parts.slice(0, -1).join(', ') || parts[0];
            return { place, country };
        };
 
        const createISODate = (date: string, time: string) => {
            if (!date) return null;
            return new Date(`${date}T${time || '00:00'}:00`).toISOString();
        };
 
        const getTravelModeId = (mode: string) => ({ Flight: 1, Train: 2, Bus: 3, Cab: 4 }[mode] || 0);
 
        const sourceData = extractLocationData(formData.source?.label || formData.sourceText);
        const destinationData = extractLocationData(formData.destination?.label || formData.destinationText);
       
        const mappedData = {
            travelModeId: getTravelModeId(formData.modeOfTransport),
            isInternational: formData.travelType === 'International',
            isRoundTrip: formData.tripType === 'Round Trip',
            projectCode: formData.projectCode,
            sourcePlace: sourceData.place,
            sourceCountry: sourceData.country,
            destinationPlace: destinationData.place,
            destinationCountry: destinationData.country,
            outboundDepartureDate: createISODate(formData.departureDate, formData.departureTime),
            outboundArrivalDate: createISODate(formData.departureArrivalDate, formData.departureArrivalTime),
            returnDepartureDate: formData.tripType === 'Round Trip' ? createISODate(formData.returnDepartureDate, formData.returnDepartureTime) : null,
            returnArrivalDate: formData.tripType === 'Round Trip' ? createISODate(formData.returnArrivalDate, formData.returnArrivalTime) : null,
            isAccommodationRequired: formData.requiresAccommodation,
            isDropOffRequired: formData.requiresDropoff,
            dropOffPlace: formData.requiresDropoff ? formData.dropoffLocation : "",
            isPickUpRequired: formData.requiresPickup,
            pickUpPlace: formData.requiresPickup ? formData.pickupLocation : "",
            comments: formData.comments,
            purposeOfTravel: formData.purpose,
            isVegetarian: formData.requiresFoodPreference ? formData.foodPreference === 'veg' : false,
            foodComment: formData.requiresFoodPreference ? formData.foodPreferenceComment : "",
            attendedCCT: request?.attendedCCT ?? true,
            ldCertificatePath: request?.ldCertificatePath ?? "string"
        };
       
        onUpdate(mappedData);
    };
   
    // --- Render Logic ---
    const transportOptions = [ { value: 'Flight', label: 'Flight', icon: Plane }, { value: 'Train', label: 'Train', icon: Train }, { value: 'Bus', label: 'Bus', icon: Bus }, { value: 'Cab', label: 'Cab', icon: Car } ];
    const availableTransportOptions = formData.travelType === 'International' ? transportOptions.filter(opt => opt.value === 'Flight') : transportOptions;
   
    const renderSegmentedButton = (name: 'travelType' | 'tripType', value: string, label: string, disabled: boolean = false) => ( <button type="button" disabled={disabled} onClick={() => setFormData(prev => ({...prev, [name]: value as any}))} className={`px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formData[name] === value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>{label}</button>);
    const renderTransportButton = (value: 'Flight' | 'Train' | 'Bus' | 'Cab', label: string, Icon: React.ElementType) => ( <button type="button" onClick={() => setFormData(prev => ({ ...prev, modeOfTransport: value }))} className={`flex-1 p-3 text-sm font-medium border rounded-md flex items-center justify-center gap-2 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${formData.modeOfTransport === value ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-white text-gray-700 hover:bg-gray-50'}`}><Icon className="h-4 w-4" /> {label}</button>);
    const IconInput = ({ icon: Icon, type, name, value, onChange, disabled, ...props }: any) => ( <div className="relative"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" /><input type={type} name={name} value={value} onChange={onChange} className={`w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-50'}`} disabled={disabled} {...props} /></div>);
   
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
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Source Location</label><LocationSearch onSelect={(loc) => setFormData(p => ({ ...p, source: loc, sourceText: loc.label || '' }))} initialValue={formData.sourceText} placeholder="Search for source..." disabled={isPartiallyLocked}/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Destination</label><LocationSearch onSelect={(loc) => setFormData(p => ({ ...p, destination: loc, destinationText: loc.label || ''}))} initialValue={formData.destinationText} placeholder="Search for destination..."/></div>
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
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label><IconInput icon={Calendar} type="date" name="departureArrivalDate" value={formData.departureArrivalDate} onChange={handleChange} disabled={isPartiallyLocked}/></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><IconInput icon={Clock} type="time" name="departureArrivalTime" value={formData.departureArrivalTime} onChange={handleChange} disabled={isPartiallyLocked}/></div>
                        </div>
                    </div>
                    {formData.tripType === 'Round Trip' && (
                        <div className="bg-white p-5 rounded-lg border space-y-4">
                            <div className="flex items-center"><div className="h-6 w-1 bg-orange-500 rounded mr-3"></div><h3 className="font-semibold text-gray-800 text-lg">Return</h3></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label><IconInput icon={Calendar} type="date" name="returnDepartureDate" value={formData.returnDepartureDate} onChange={handleChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><IconInput icon={Clock} type="time" name="returnDepartureTime" value={formData.returnDepartureTime} onChange={handleChange} /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label><IconInput icon={Calendar} type="date" name="returnArrivalDate" value={formData.returnArrivalDate} onChange={handleChange} /></div>
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
                                {formData.requiresPickup && <div className="pl-6 mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label><LocationSearch onSelect={(loc) => setFormData(p => ({ ...p, pickupLocation: loc.label || '' }))} initialValue={formData.pickupLocation} placeholder="Search for pickup location..." disabled={isPartiallyLocked}/></div>}
                            </div>
                            <div>
                                <div className="flex items-center"><input type="checkbox" id="requiresDropoff" name="requiresDropoff" checked={formData.requiresDropoff} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="requiresDropoff" className="ml-2 block text-sm text-gray-900">Requires Dropoff</label></div>
                                {formData.requiresDropoff && <div className="pl-6 mt-2"><label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Location</label><LocationSearch onSelect={(loc) => setFormData(p => ({ ...p, dropoffLocation: loc.label || '' }))} initialValue={formData.dropoffLocation} placeholder="Search for dropoff location..." /></div>}
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