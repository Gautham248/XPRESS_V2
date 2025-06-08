import React, { createContext, useContext, useReducer, ReactNode, useState, useEffect } from 'react';
import { travelRequestService } from './TravelRequestService'; 


export interface Location {
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
  outboundDepartureDate: Date | null;
  outboundDepartureTime: string;
  outboundArrivalDate: Date | null;
  outboundArrivalTime: string;
  returnDepartureDate: Date | null;
  returnDepartureTime: string;
  returnArrivalDate: Date | null;
  returnArrivalTime: string;
  transportMode: string;
  requiresAccommodation: boolean;
  requiresPickup: boolean;
  requiresDropoff: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  projectCode: string;
  reason: string; 
  comments: string;
  requiresFoodPreference: boolean;
  foodPreference: 'veg' | 'non-veg';
  foodPreferenceComment: string | null;
  attendedCct: boolean;
  departureDate: Date | null;
  returnDate: Date | null;
}

type TravelRequestAction =
  | { type: 'SET_TRAVEL_TYPE'; payload: 'domestic' | 'international' }
  | { type: 'SET_TRIP_TYPE'; payload: 'oneWay' | 'roundTrip' }
  | { type: 'SET_SOURCE'; payload: Location | null }
  | { type: 'SET_DESTINATION'; payload: Location | null }
  | { type: 'SET_OUTBOUND_DEPARTURE_DATE'; payload: Date | null }
  | { type: 'SET_OUTBOUND_DEPARTURE_TIME'; payload: string }
  | { type: 'SET_OUTBOUND_ARRIVAL_DATE'; payload: Date | null }
  | { type: 'SET_OUTBOUND_ARRIVAL_TIME'; payload: string }
  | { type: 'SET_RETURN_DEPARTURE_DATE'; payload: Date | null }
  | { type: 'SET_RETURN_DEPARTURE_TIME'; payload: string }
  | { type: 'SET_RETURN_ARRIVAL_DATE'; payload: Date | null }
  | { type: 'SET_RETURN_ARRIVAL_TIME'; payload: string }
  | { type: 'SET_DEPARTURE_DATE'; payload: Date | null } // Legacy
  | { type: 'SET_RETURN_DATE'; payload: Date | null } // Legacy
  | { type: 'SET_TRANSPORT_MODE'; payload: string }
  | { type: 'SET_REQUIRES_ACCOMMODATION'; payload: boolean }
  | { type: 'SET_REQUIRES_PICKUP'; payload: boolean }
  | { type: 'SET_REQUIRES_DROPOFF'; payload: boolean }
  | { type: 'SET_PICKUP_LOCATION'; payload: string }
  | { type: 'SET_DROPOFF_LOCATION'; payload: string }
  | { type: 'SET_PROJECT_CODE'; payload: string }
  | { type: 'SET_REASON'; payload: string }
  | { type: 'SET_COMMENTS'; payload: string }
  | { type: 'SET_REQUIRES_FOOD_PREFERENCE'; payload: boolean }
  | { type: 'SET_FOOD_PREFERENCE'; payload: 'veg' | 'non-veg' }
  | { type: 'SET_FOOD_PREFERENCE_COMMENT'; payload: string }
  | { type: 'SET_ATTENDED_CCT'; payload: boolean }
  | { type: 'RESET_FORM' };

const initialState: TravelRequestState = {
  travelType: 'domestic',
  tripType: 'roundTrip',
  source: null,
  destination: null,
  outboundDepartureDate: null,
  outboundDepartureTime: '',
  outboundArrivalDate: null,
  outboundArrivalTime: '',
  returnDepartureDate: null,
  returnDepartureTime: '',
  returnArrivalDate: null,
  returnArrivalTime: '',
  transportMode: 'flight',
  requiresAccommodation: false,
  requiresPickup: false,
  requiresDropoff: false,
  pickupLocation: '',
  dropoffLocation: '',
  projectCode: '',
  reason: '',
  comments: '',
  requiresFoodPreference: false,
  foodPreference: 'veg',
  foodPreferenceComment: null,
  attendedCct: false,
  departureDate: null,
  returnDate: null,
};

const travelRequestReducer = (state: TravelRequestState, action: TravelRequestAction): TravelRequestState => {
  switch (action.type) {
    case 'SET_TRAVEL_TYPE':
      const newTransportMode = action.payload === 'international' ? 'flight' : state.transportMode;
      return { ...state, travelType: action.payload, transportMode: newTransportMode };
    
    case 'SET_TRIP_TYPE':
      if (action.payload === 'oneWay') {
        return { 
          ...state, 
          tripType: action.payload, 
          returnDate: null,
          returnDepartureDate: null,
          returnDepartureTime: '',
          returnArrivalDate: null,
          returnArrivalTime: ''
        };
      }
      return { ...state, tripType: action.payload };
    
    case 'SET_SOURCE':
      return { ...state, source: action.payload };
    
    case 'SET_DESTINATION':
      return { ...state, destination: action.payload };
    
    case 'SET_OUTBOUND_DEPARTURE_DATE':
      return { 
        ...state, 
        outboundDepartureDate: action.payload,
        departureDate: action.payload 
      };
    
    case 'SET_OUTBOUND_DEPARTURE_TIME':
      return { ...state, outboundDepartureTime: action.payload };
    
    case 'SET_OUTBOUND_ARRIVAL_DATE':
      return { ...state, outboundArrivalDate: action.payload };
    
    case 'SET_OUTBOUND_ARRIVAL_TIME':
      return { ...state, outboundArrivalTime: action.payload };
    
    case 'SET_RETURN_DEPARTURE_DATE':
      return { 
        ...state, 
        returnDepartureDate: action.payload,
        returnDate: action.payload 
      };
    
    case 'SET_RETURN_DEPARTURE_TIME':
      return { ...state, returnDepartureTime: action.payload };
    
    case 'SET_RETURN_ARRIVAL_DATE':
      return { ...state, returnArrivalDate: action.payload };
    
    case 'SET_RETURN_ARRIVAL_TIME':
      return { ...state, returnArrivalTime: action.payload };
    
    
    case 'SET_DEPARTURE_DATE':
      return { 
        ...state, 
        departureDate: action.payload,
        outboundDepartureDate: action.payload
      };
    
    case 'SET_RETURN_DATE':
      return { 
        ...state, 
        returnDate: action.payload,
        returnDepartureDate: action.payload
      };
    
    case 'SET_TRANSPORT_MODE':
      return { ...state, transportMode: action.payload };
    
    case 'SET_REQUIRES_ACCOMMODATION':
      return { ...state, requiresAccommodation: action.payload };
    
    case 'SET_REQUIRES_PICKUP':
      const newPickupLocation = !action.payload ? '' : state.pickupLocation;
      return { ...state, requiresPickup: action.payload, pickupLocation: newPickupLocation };
    
    case 'SET_REQUIRES_DROPOFF':
      const newDropoffLocation = !action.payload ? '' : state.dropoffLocation;
      return { ...state, requiresDropoff: action.payload, dropoffLocation: newDropoffLocation };
    
    case 'SET_PICKUP_LOCATION':
      return { ...state, pickupLocation: action.payload };
    
    case 'SET_DROPOFF_LOCATION':
      return { ...state, dropoffLocation: action.payload };
    
    case 'SET_PROJECT_CODE':
      return { ...state, projectCode: action.payload };
    
    case 'SET_REASON':
      return { ...state, reason: action.payload };
    
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    
    case 'SET_REQUIRES_FOOD_PREFERENCE':
      if (!action.payload) {
        return { 
          ...state, 
          requiresFoodPreference: action.payload,
          foodPreference: 'veg',
          foodPreferenceComment: null
        };
      }
      return { ...state, requiresFoodPreference: action.payload };
    
    case 'SET_FOOD_PREFERENCE':
      return { ...state, foodPreference: action.payload };
    
    case 'SET_FOOD_PREFERENCE_COMMENT':
      const comment = action.payload.trim() === '' ? null : action.payload;
      return { ...state, foodPreferenceComment: comment };
    
    case 'SET_ATTENDED_CCT':
      return { ...state, attendedCct: action.payload };
    
    case 'RESET_FORM':
      return initialState;
    
    default:
      return state;
  }
};


const validateTravelLocationsConsistency = (state: TravelRequestState): string | null => {
  if (!state.source?.country || !state.destination?.country) {
    return null; 
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

// Utility function to get user ID from localStorage
const getUserIdFromLocalStorage = (): number | null => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.userId || null;
    }
    return null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

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
  getValidationError: () => string | null;
}

const TravelRequestContext = createContext<TravelRequestContextType | undefined>(undefined);

interface TravelRequestProviderProps {
  children: ReactNode;
}

export const TravelRequestProvider: React.FC<TravelRequestProviderProps> = ({
  children,
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
    
    if (state.source.value && state.destination.value && state.source.value === state.destination.value) {
      return 'Source and destination cannot be the same location.';
    }

    const locationConsistencyError = validateTravelLocationsConsistency(state);
    if (locationConsistencyError) {
      return locationConsistencyError;
    }

    if (!state.outboundDepartureDate) {
      return 'Please select an outbound departure date.';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (state.outboundDepartureDate < today) {
      return 'Outbound departure date cannot be in the past.';
    }

    if (state.tripType === 'roundTrip') {
      if (!state.returnDepartureDate) {
        return 'Please select a return departure date for round trip.';
      }
      if (state.outboundDepartureDate && state.returnDepartureDate && state.returnDepartureDate < state.outboundDepartureDate) {
        return 'Return departure date must be on or after outbound departure date.';
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

    if (state.requiresFoodPreference && !state.foodPreference) {
      return 'Please select a food preference.';
    }

    return null; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      console.error("Form validation failed:", validationError);
      return;
    }

    // Get userId from localStorage
    const userId = getUserIdFromLocalStorage();
    if (!userId) {
      setSubmitError('User not found. Please log in again.');
      console.error('No user found in localStorage.');
      return;
    }

    setIsSubmitting(true);
    console.log('Form validation passed. Submitting with state:', state);

    try {
      const result = await travelRequestService.submitTravelRequest(state, userId);

      if (result.success) {
        console.log('Submission successful:', result);
        setSuccessMessage(result.message || 'Travel request submitted successfully!');
        setShowSuccessPopup(true);
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

  const getValidationError = (): string | null => {
    return validateTravelLocationsConsistency(state);
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
        getValidationError
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