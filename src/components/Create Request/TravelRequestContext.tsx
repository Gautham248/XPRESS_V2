import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Address } from './LocationSearch';

interface Location {
  country: string;
  city: string;
  label: string;
  value: string;
}

// Define state interface
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
}

// Define action types
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
  | { type: 'SET_REASON'; payload: string };

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
    default:
      return state;
  }
};

// Create context
interface TravelRequestContextType {
  state: TravelRequestState;
  dispatch: React.Dispatch<TravelRequestAction>;
  handleSubmit: (e: React.FormEvent) => void;
}

const TravelRequestContext = createContext<TravelRequestContextType | undefined>(undefined);

// Create provider
interface TravelRequestProviderProps {
  children: ReactNode;
}

export const TravelRequestProvider: React.FC<TravelRequestProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(travelRequestReducer, initialState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(state);
    // Here you would typically send the data to your backend API
    alert('Travel request submitted successfully!');
  };

  return (
    <TravelRequestContext.Provider value={{ state, dispatch, handleSubmit }}>
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