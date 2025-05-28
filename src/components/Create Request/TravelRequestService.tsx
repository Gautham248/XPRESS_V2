import axios from 'axios';

// Types for the service
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

interface ApiTravelRequest {
  requestId: number;
  employeeId: number;
  travelTypeId: number;
  tripTypeId: number;
  projectCode: string;
  sourcePlace: string;
  sourceCountry: string;
  destinationPlace: string;
  destinationCountry: string;
  departureDate: string;
  returnDate: string;
  travelModeId: number;
  isAccommodationRequired: boolean;
  isPickupRequired: boolean;
  isDropoffRequired: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  comments: string;
  purposeOfTravel: string;
  foodPreference: string | null;
  attendedCct: boolean;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Mapping functions
const getTravelTypeId = (travelType: string): number => {
  return travelType === 'domestic' ? 1 : 2;
};

const getTripTypeId = (tripType: string): number => {
  return tripType === 'oneWay' ? 1 : 2;
};

const getTravelModeId = (transportMode: string): number => {
  const modeMap: { [key: string]: number } = {
    'flight': 1,
    'train': 2,
    'bus': 3,
    'cab': 4
  };
  return modeMap[transportMode] || 1;
};

// Service class
class TravelRequestService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'https://localhost:7152/api', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Convert form state to API payload format
   */
  private mapFormStateToApiPayload(state: TravelRequestState, employeeId: number = 1): ApiTravelRequest {
    return {
      requestId: 1,
      employeeId: employeeId,
      travelTypeId: getTravelTypeId(state.travelType),
      tripTypeId: getTripTypeId(state.tripType),
      projectCode: state.projectCode,
      sourcePlace: state.source?.city || '',
      sourceCountry: state.source?.country || '',
      destinationPlace: state.destination?.city || '',
      destinationCountry: state.destination?.country || '',
      departureDate: state.departureDate?.toISOString() || new Date().toISOString(),
      returnDate: state.returnDate?.toISOString() || new Date().toISOString(),
      travelModeId: getTravelModeId(state.transportMode),
      isAccommodationRequired: state.requiresAccommodation,
      isPickupRequired: state.requiresPickup,
      isDropoffRequired: state.requiresDropoff,
      pickupLocation: state.pickupLocation,
      dropoffLocation: state.dropoffLocation,
      comments: state.comments,
      purposeOfTravel: state.reason,
      foodPreference: state.requiresFoodPreference ? state.foodPreference : null,
      attendedCct: state.attendedCct
    };
  }

  /**
   * Submit travel request to API
   */
  async submitTravelRequest(state: TravelRequestState, employeeId?: number): Promise<ApiResponse> {
    try {
      const apiPayload = this.mapFormStateToApiPayload(state, employeeId);
      
      // Log the payload for debugging
      console.log('=== FORM SUBMISSION DATA ===');
      console.log('Raw Form State:', state);
      console.log('\n=== API PAYLOAD ===');
      console.log(JSON.stringify(apiPayload, null, 2));
      console.log('\n=== API ENDPOINT ===');
      console.log(`POST ${this.baseUrl}/TravelRequest`);

      const response = await axios.post(`${this.baseUrl}/TravelRequest`, apiPayload, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        timeout: this.timeout,
      });

      console.log('\n=== API SUCCESS RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      return {
        success: true,
        message: 'Travel request submitted successfully!',
        data: response.data
      };

    } catch (error) {
      console.error('\n=== API ERROR ===');
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Data:', error.response.data);
          console.error('Response Headers:', error.response.headers);
          
          return {
            success: false,
            message: error.response.data?.message || 'Failed to submit travel request',
            data: error.response.data
          };
        } else if (error.request) {
          console.error('Network Error:', error.request);
          return {
            success: false,
            message: 'Network error: Please check your connection and try again.'
          };
        } else {
          console.error('Error:', error.message);
          return {
            success: false,
            message: 'An unexpected error occurred. Please try again.'
          };
        }
      } else {
        console.error('Unknown Error:', error);
        return {
          success: false,
          message: 'An unexpected error occurred. Please try again.'
        };
      }
    }
  }

  async getTravelRequests(employeeId?: number): Promise<ApiResponse> {
    try {
      const url = employeeId 
        ? `${this.baseUrl}/TravelRequest/employee/${employeeId}`
        : `${this.baseUrl}/TravelRequest`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          
        },
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Error fetching travel requests:', error);
      return {
        success: false,
        message: 'Failed to fetch travel requests'
      };
    }
  }


  updateConfig(baseUrl?: string, timeout?: number) {
    if (baseUrl) this.baseUrl = baseUrl;
    if (timeout) this.timeout = timeout;
  }
}

// Export singleton instance
export const travelRequestService = new TravelRequestService();
export { TravelRequestService };
export type { TravelRequestState, ApiTravelRequest, ApiResponse, Location };