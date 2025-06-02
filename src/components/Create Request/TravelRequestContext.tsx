import React, { createContext, useContext, useReducer, ReactNode, useState } from 'react';
import { travelRequestService } from './TravelRequestService';

interface Location {
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
  transportMode: string;
  requiresAccommodation: boolean;
  requiresPickup: boolean;
  requiresDropoff: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: Date | null;
  dropoffTime: Date | null;
  requestCode: string;
  projectCode: string;
  reason: string;
  comments: string;
  requiresFoodPreference: boolean;
  foodPreference: 'veg' | 'non-veg';
  attendedCct: boolean;
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
  transportMode: 'flight',
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
  foodPreference: 'veg',
  attendedCct: false,
};

// Reducer function
const travelRequestReducer = (state: TravelRequestState, action: TravelRequestAction): TravelRequestState => {
  switch (action.type) {
    case 'SET_TRAVEL_TYPE':
      return { ...state, travelType: action.payload };
    case 'SET_TRIP_TYPE':
      return { ...state, tripType: action.payload };
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
      return { ...state, requiresPickup: action.payload };
    case 'SET_REQUIRES_DROPOFF':
      return { ...state, requiresDropoff: action.payload };
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
      return state;
  }
};

// Validation function for travel locations
const validateTravelLocations = (state: TravelRequestState): string | null => {
  if (!state.source?.country || !state.destination?.country) {
    return null; // No validation if countries are not selected yet
  }

  const sameCountry = state.source.country === state.destination.country;

  if (state.travelType === 'domestic' && !sameCountry) {
    return `Domestic travel must be within the same country. Source: ${state.source.country}, Destination: ${state.destination.country}`;
  }

  if (state.travelType === 'international' && sameCountry) {
    return `International travel requires different countries. Both source and destination are in ${state.source.country}`;
  }

  return null;
};

// Create context
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

// Create provider
interface TravelRequestProviderProps {
  children: ReactNode;
  employeeId?: number; // Make employeeId configurable
}

export const TravelRequestProvider: React.FC<TravelRequestProviderProps> = ({ 
  children, 
  employeeId = 1 // Default employeeId
}) => {
  const [state, dispatch] = useReducer(travelRequestReducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getValidationError = (): string | null => {
    return validateTravelLocations(state);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setSubmitError(null);

    // Check for validation errors before proceeding
    const validationError = getValidationError();
    if (validationError) {
      setSubmitError(validationError);
      alert(`Validation Error: ${validationError}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the service to submit the request
      const result = await travelRequestService.submitTravelRequest(state, employeeId);
      
      if (result.success) {
        alert(result.message || 'Travel request submitted successfully!');
        
        // Optionally reset form after successful submission
        // dispatch({ type: 'RESET_FORM' });
        
        // If you have navigation, you can redirect here
        // navigate('/travel-requests');
      } else {
        setSubmitError(result.message || 'Failed to submit travel request');
        alert(result.message || 'Failed to submit travel request');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
      alert(errorMessage);
      console.error('Unexpected error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
    setSubmitError(null);
  };

  return (
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
  );
};

// Custom hook to use the context
export const useTravelRequest = () => {
  const context = useContext(TravelRequestContext);
  if (context === undefined) {
    throw new Error('useTravelRequest must be used within a TravelRequestProvider');
  }
  return context;
};