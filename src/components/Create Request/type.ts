export interface Location {
  country: string;
  city: string;
  label: string;
  value: string;
}

export type TravelType = 'domestic' | 'international';
export type TripType = 'oneWay' | 'roundTrip';

export interface TravelRequestState {
  travelType: TravelType;
  tripType: TripType;
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

export type TravelRequestAction = 
  | { type: 'SET_TRAVEL_TYPE', payload: TravelType }
  | { type: 'SET_TRIP_TYPE', payload: TripType }
  | { type: 'SET_SOURCE', payload: Location | null }
  | { type: 'SET_DESTINATION', payload: Location | null }
  | { type: 'SET_DEPARTURE_DATE', payload: Date | null }
  | { type: 'SET_RETURN_DATE', payload: Date | null }
  | { type: 'SET_TRANSPORT_MODE', payload: string }
  | { type: 'SET_REQUIRES_ACCOMMODATION', payload: boolean }
  | { type: 'SET_REQUIRES_PICKUP', payload: boolean }
  | { type: 'SET_REQUIRES_DROPOFF', payload: boolean }
  | { type: 'SET_PICKUP_LOCATION', payload: string }
  | { type: 'SET_DROPOFF_LOCATION', payload: string }
  | { type: 'SET_PICKUP_TIME', payload: Date | null }
  | { type: 'SET_DROPOFF_TIME', payload: Date | null }
  | { type: 'SET_REQUEST_CODE', payload: string }
  | { type: 'SET_PROJECT_CODE', payload: string }
  | { type: 'SET_REASON', payload: string };