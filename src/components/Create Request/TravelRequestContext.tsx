import React, { createContext, useContext, useReducer, ReactNode, useState, useEffect } from 'react';
import { travelRequestService } from './TravelRequestService'; // Ensure this path is correct

// Interfaces (assuming Location is defined elsewhere or you can define it here)
export interface Location { // Make sure this matches the definition used in your LocationSearch/other components
  country: string;
  city: string;
  state?: string;
  label: string;
  value: string;
}

interface TravelRequestState {
  travelType: 'domestic' | 'international';
  tripType: 'oneWay' | 'roundTrip';
  source: Location | null;
  destination: Location | null;
  departureDate: Date | null;
  returnDate: Date | null;
  transportMode: string; // Consider a more specific type e.g., 'flight' | 'train' | 'bus' | 'cab'
  requiresAccommodation: boolean;
  requiresPickup: boolean;
  requiresDropoff: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: Date | null; // Not in cURL payload, ensure this is intentional if not sent
  dropoffTime: Date | null; // Not in cURL payload, ensure this is intentional if not sent
  requestCode: string; // Not in cURL payload, ensure this is intentional if not sent
  projectCode: string;
  reason: string;
  comments: string;
  requiresFoodPreference: boolean;
  foodPreference: 'veg' | 'non-veg';
  attendedCct: boolean; // Not in cURL, ensure backend handles or add to mapping if needed
}

type TravelRequestAction =
  | { type: 'SET_TRAVEL_TYPE'; payload: 'domestic' | 'international' }
  | { type: 'SET_TRIP_TYPE'; payload: 'oneWay' | 'roundTrip' }
  | { type: 'SET_SOURCE'; payload: Location | null }
  | { type: 'SET_DESTINATION'; payload: Location | null }
  | { type: 'SET_DEPARTURE_DATE'; payload: Date | null }
  | { type: 'SET_RETURN_DATE'; payload: Date | null }
  | { type: 'SET_TRANSPORT_MODE'; payload: string }
  | { type: 'SET_REQUIRES_ACCOMMODATION'; payload: boolean }
  | { type: 'SET_REQUIRES_PICKUP'; payload: boolean }
  | { type: 'SET_REQUIRES_DROPOFF'; payload: boolean }
  | { type: 'SET_PICKUP_LOCATION'; payload: string }
  | { type: 'SET_DROPOFF_LOCATION'; payload: string }
  | { type: 'SET_PICKUP_TIME'; payload: Date | null }
  | { type: 'SET_DROPOFF_TIME'; payload: Date | null }
  | { type: 'SET_REQUEST_CODE'; payload: string }
  | { type: 'SET_PROJECT_CODE'; payload: string }
  | { type: 'SET_REASON'; payload: string }
  | { type: 'SET_COMMENTS'; payload: string }
  | { type: 'SET_REQUIRES_FOOD_PREFERENCE'; payload: boolean }
  | { type: 'SET_FOOD_PREFERENCE'; payload: 'veg' | 'non-veg' }
  | { type: 'SET_ATTENDED_CCT'; payload: boolean }
  | { type: 'RESET_FORM' };

// Initial state
const initialState: TravelRequestState = {
  travelType: 'domestic',
  tripType: 'roundTrip',
  source: null,
  destination: null,
  departureDate: null,
  returnDate: null,
  transportMode: 'flight', // Default transport mode
  requiresAccommodation: false,
  requiresPickup: false,
  requiresDropoff: false,
  pickupLocation: '',
  dropoffLocation: '',
  pickupTime: null,
  dropoffTime: null,
  requestCode: '',
  projectCode: '',
  reason: '',
  comments: '',
  requiresFoodPreference: false,
  foodPreference: 'veg', // Default food preference
  attendedCct: false,
};

// Reducer function
const travelRequestReducer = (state: TravelRequestState, action: TravelRequestAction): TravelRequestState => {
  switch (action.type) {
    case 'SET_TRAVEL_TYPE':
      // When changing travel type, international implies flight only.
      // Domestic can have other options. Reset transport mode if needed.
      const newTransportMode = action.payload === 'international' ? 'flight' : state.transportMode;
      return { ...state, travelType: action.payload, transportMode: newTransportMode };
    case 'SET_TRIP_TYPE':
      // If changing to oneWay, clear returnDate
      const newReturnDate = action.payload === 'oneWay' ? null : state.returnDate;
      return { ...state, tripType: action.payload, returnDate: newReturnDate };
    case 'SET_SOURCE':
      return { ...state, source: action.payload };
    case 'SET_DESTINATION':
      return { ...state, destination: action.payload };
    case 'SET_DEPARTURE_DATE':
      return { ...state, departureDate: action.payload };
    case 'SET_RETURN_DATE':
      return { ...state, returnDate: action.payload };
    case 'SET_TRANSPORT_MODE':
      return { ...state, transportMode: action.payload };
    case 'SET_REQUIRES_ACCOMMODATION':
      return { ...state, requiresAccommodation: action.payload };
    case 'SET_REQUIRES_PICKUP':
      // If pickup is not required, clear pickup location
      const newPickupLocation = !action.payload ? '' : state.pickupLocation;
      return { ...state, requiresPickup: action.payload, pickupLocation: newPickupLocation };
    case 'SET_REQUIRES_DROPOFF':
      // If dropoff is not required, clear dropoff location
      const newDropoffLocation = !action.payload ? '' : state.dropoffLocation;
      return { ...state, requiresDropoff: action.payload, dropoffLocation: newDropoffLocation };
    case 'SET_PICKUP_LOCATION':
      return { ...state, pickupLocation: action.payload };
    case 'SET_DROPOFF_LOCATION':
      return { ...state, dropoffLocation: action.payload };
    case 'SET_PICKUP_TIME':
      return { ...state, pickupTime: action.payload };
    case 'SET_DROPOFF_TIME':
      return { ...state, dropoffTime: action.payload };
    case 'SET_REQUEST_CODE':
      return { ...state, requestCode: action.payload };
    case 'SET_PROJECT_CODE':
      return { ...state, projectCode: action.payload };
    case 'SET_REASON':
      return { ...state, reason: action.payload };
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    case 'SET_REQUIRES_FOOD_PREFERENCE':
      return { ...state, requiresFoodPreference: action.payload };
    case 'SET_FOOD_PREFERENCE':
      return { ...state, foodPreference: action.payload };
    case 'SET_ATTENDED_CCT':
      return { ...state, attendedCct: action.payload };
    case 'RESET_FORM':
      return initialState;
    default:
      // Should be exhaustive, if not, TypeScript will warn
      // const _exhaustiveCheck: never = action;
      return state;
  }
};

// Validation function for travel locations (domestic/international consistency)
const validateTravelLocationsConsistency = (state: TravelRequestState): string | null => {
  if (!state.source?.country || !state.destination?.country) {
    return null; // Not enough info to validate
  }

  const sameCountry = state.source.country.toLowerCase() === state.destination.country.toLowerCase();

  if (state.travelType === 'domestic' && !sameCountry) {
    return `Domestic travel must be within the same country. Source: ${state.source.country}, Destination: ${state.destination.country}.`;
  }

  if (state.travelType === 'international' && sameCountry) {
    return `International travel requires different countries. Both source and destination are in ${state.source.country}.`;
  }
  return null;
};

// Success Popup Component (remains the same as provided)
const SuccessPopup: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 transform transition-all duration-300 ease-out">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-200 hover:text-white transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};


interface TravelRequestContextType {
  state: TravelRequestState;
  dispatch: React.Dispatch<TravelRequestAction>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  resetForm: () => void;
  getValidationError: () // Renamed for clarity, as it gives overall form validation error
    => string | null; // This was previously just for location consistency, now it's for the whole form for internal use
}

const TravelRequestContext = createContext<TravelRequestContextType | undefined>(undefined);

interface TravelRequestProviderProps {
  children: ReactNode;
  employeeId?: number;
}

export const TravelRequestProvider: React.FC<TravelRequestProviderProps> = ({
  children,
  employeeId = 1, // Default employeeId if not provided
}) => {
  const [state, dispatch] = useReducer(travelRequestReducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): string | null => {
    if (!state.source || !state.source.city || !state.source.country) {
      return 'Please select a valid source location (city and country).';
    }
    if (!state.destination || !state.destination.city || !state.destination.country) {
      return 'Please select a valid destination location (city and country).';
    }
    // Check if source and destination are the same
    if (state.source.value && state.destination.value && state.source.value === state.destination.value) {
        return 'Source and destination cannot be the same location.';
    }


    const locationConsistencyError = validateTravelLocationsConsistency(state);
    if (locationConsistencyError) {
      return locationConsistencyError;
    }

    if (!state.departureDate) {
      return 'Please select a departure date.';
    }
    // Check if departure date is in the past (ignoring time part for simplicity)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (state.departureDate < today) {
        return 'Departure date cannot be in the past.';
    }

    if (state.tripType === 'roundTrip') {
      if (!state.returnDate) {
        return 'Please select a return date for round trip.';
      }
      if (state.departureDate && state.returnDate && state.returnDate < state.departureDate) {
        return 'Return date must be on or after departure date.';
      }
    }

    if (!state.transportMode) {
      return 'Please select a mode of transport.';
    }
    if (!state.projectCode.trim()) {
      return 'Please enter a project code.';
    }
    if (!state.reason.trim()) {
      return 'Please enter the purpose of travel.';
    }

    if (state.requiresPickup && !state.pickupLocation.trim()) {
      return 'Please specify a pickup location when "Requires Pickup" is selected.';
    }
    if (state.requiresDropoff && !state.dropoffLocation.trim()) {
      return 'Please specify a drop-off location when "Requires Drop-off" is selected.';
    }

    return null; // Form is valid
  };
  
  // This function is kept for external use if a component specifically needs only location consistency error
  const getLocationConsistencyError = (): string | null => {
    return validateTravelLocationsConsistency(state);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null); // Clear previous errors

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      console.error("Form validation failed:", validationError);
      return;
    }

    setIsSubmitting(true);
    console.log('Form validation passed. Submitting with state:', state);

    try {
      const result = await travelRequestService.submitTravelRequest(state, employeeId);

      if (result.success) {
        console.log('Submission successful:', result);
        setSuccessMessage(result.message || 'Travel request submitted successfully!');
        setShowSuccessPopup(true);
        // Reset form after a short delay to allow popup visibility
        setTimeout(() => {
          dispatch({ type: 'RESET_FORM' });
        }, 1500);
      } else {
        console.error('Submission failed:', result.message);
        setSubmitError(result.message || 'Failed to submit travel request. Please try again.');
      }
    } catch (error: any) {
      console.error('Unexpected error in handleSubmit:', error);
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
    setSubmitError(null);
    setShowSuccessPopup(false);
  };

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <>
      <TravelRequestContext.Provider value={{
        state,
        dispatch,
        handleSubmit,
        isSubmitting,
        submitError,
        resetForm,
        getValidationError: getLocationConsistencyError // Expose the specific location consistency validator if needed by components
      }}>
        {children}
      </TravelRequestContext.Provider>

      {showSuccessPopup && (
        <SuccessPopup
          message={successMessage}
          onClose={handleCloseSuccessPopup}
        />
      )}
    </>
  );
};

export const useTravelRequest = () => {
  const context = useContext(TravelRequestContext);
  if (context === undefined) {
    throw new Error('useTravelRequest must be used within a TravelRequestProvider');
  }
  return context;
};