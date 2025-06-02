import axios, { AxiosError } from 'axios';

// Re-define or import Location and TravelRequestState if not already available
// Ensure these definitions are consistent with TravelRequestContext.tsx
export interface Location {
  country: string;
  city: string;
  state?: string;
  label: string;
  value: string;
}

export interface TravelRequestState {
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
  // pickupTime, dropoffTime, requestCode are not in the cURL payload, so not mapped here
  projectCode: string;
  reason: string; // Maps to purposeOfTravel
  comments: string;
  requiresFoodPreference: boolean;
  foodPreference: 'veg' | 'non-veg';
  attendedCct: boolean; // Ensure backend expects/handles this if sent
}

// API specific payload structure
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
  departureDate: string; // ISO string
  returnDate: string;    // ISO string (or null if API allows for one-way, but cURL sends departureDate)
  travelModeId: number;
  isAccommodationRequired: boolean;
  isPickupRequired: boolean;
  isDropoffRequired: boolean;
  pickupLocation: string;
  dropoffLocation: string;
  comments: string;
  purposeOfTravel: string;
  foodPreference: string | null; // 'veg', 'non-veg', or null
  attendedCct: boolean;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any; // Adjust 'any' to a more specific type if you know the response structure
}

// Mapping functions
const getTravelTypeId = (travelType: 'domestic' | 'international'): number => {
  return travelType === 'domestic' ? 1 : 2;
};

const getTripTypeId = (tripType: 'oneWay' | 'roundTrip'): number => {
  return tripType === 'oneWay' ? 1 : 2;
};

const getTravelModeId = (transportMode: string): number => {
  const modeMap: { [key: string]: number } = {
    'flight': 1,
    'train': 2,
    'bus': 3,
    'cab': 4,
    // Add other modes if applicable
  };
  return modeMap[transportMode.toLowerCase()] || 1; // Default to flight, case-insensitive
};

class TravelRequestService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:5171/api', timeout: number = 15000) { // Increased timeout
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    console.log(`TravelRequestService initialized with baseUrl: ${this.baseUrl}`);
  }

  private mapFormStateToApiPayload(state: TravelRequestState, employeeId: number): ApiTravelRequest {
    if (!state.source || !state.source.city || !state.source.country) {
      throw new Error("Source location (city and country) is required for API payload.");
    }
    if (!state.destination || !state.destination.city || !state.destination.country) {
      throw new Error("Destination location (city and country) is required for API payload.");
    }
    if (!state.departureDate) {
      throw new Error("Departure date is required for API payload mapping.");
    }
    if (state.tripType === 'roundTrip' && !state.returnDate) {
      throw new Error("Return date is required for round trips during API payload mapping.");
    }

    return {
      requestId: 0, // For new requests
      employeeId: employeeId,
      travelTypeId: getTravelTypeId(state.travelType),
      tripTypeId: getTripTypeId(state.tripType),
      projectCode: state.projectCode,
      sourcePlace: state.source.city,
      sourceCountry: state.source.country,
      destinationPlace: state.destination.city,
      destinationCountry: state.destination.country,
      departureDate: state.departureDate.toISOString(),
      returnDate: state.tripType === 'oneWay'
                    ? state.departureDate.toISOString() // Per cURL: use departure date for one-way return
                    : state.returnDate!.toISOString(),  // Assert non-null due to check above
      travelModeId: getTravelModeId(state.transportMode),
      isAccommodationRequired: state.requiresAccommodation,
      isPickupRequired: state.requiresPickup,
      isDropoffRequired: state.requiresDropoff,
      pickupLocation: state.pickupLocation,
      dropoffLocation: state.dropoffLocation,
      comments: state.comments,
      purposeOfTravel: state.reason,
      foodPreference: state.requiresFoodPreference ? state.foodPreference : null,
      attendedCct: state.attendedCct, // Assuming backend handles this
    };
  }

  async submitTravelRequest(state: TravelRequestState, employeeId: number): Promise<ApiResponse> {
    let apiPayload: ApiTravelRequest;
    try {
      apiPayload = this.mapFormStateToApiPayload(state, employeeId);
    } catch (mappingError: any) {
      console.error('Error mapping form state to API payload:', mappingError);
      return {
        success: false,
        message: mappingError.message || 'Internal error: Could not prepare data for submission.',
      };
    }

    console.log('=== SUBMITTING TRAVEL REQUEST ===');
    console.log('API Endpoint:', `${this.baseUrl}/TravelRequest`);
    console.log('API Payload:', JSON.stringify(apiPayload, null, 2));

    try {
      const response = await axios.post<any>(`${this.baseUrl}/TravelRequest`, apiPayload, {
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers like Authorization if needed
          // 'Authorization': `Bearer ${your_auth_token}`
        },
        timeout: this.timeout,
      });

      console.log('=== API SUCCESS RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      // Assuming backend sends a success flag or specific status codes indicate success
      // Modify this condition based on your API's actual success response
      if (response.status === 200 || response.status === 201 || response.data?.success === true) {
        return {
          success: true,
          message: response.data?.message || 'Travel request submitted successfully!',
          data: response.data,
        };
      } else {
        // Handle cases where status is 2xx but backend indicates an issue
        return {
            success: false,
            message: response.data?.message || `Submission reported an issue (Status: ${response.status})`,
            data: response.data,
        }
      }

    } catch (error) {
      console.error('=== API SUBMISSION ERROR ===');
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>; // Type assertion for better access
        console.error('Axios Error Details:', {
          message: axiosError.message,
          code: axiosError.code,
          config: axiosError.config, // Be careful logging full config in production
          request: axiosError.request ? 'Request object present' : 'No request object',
          response: axiosError.response ? {
            status: axiosError.response.status,
            data: axiosError.response.data,
            headers: axiosError.response.headers,
          } : 'No response object',
        });

        if (axiosError.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          let detailedMessage = `Server Error: ${axiosError.response.status}. `;
          if (axiosError.response.data?.message) {
            detailedMessage += axiosError.response.data.message;
          } else if (typeof axiosError.response.data === 'string' && axiosError.response.data.length < 200) {
            detailedMessage += axiosError.response.data;
          } else {
            detailedMessage += "Please check server logs for more details.";
          }
          // Check for specific validation errors if your API returns them in a structured way
          // e.g., if (axiosError.response.data?.errors) { /* process errors */ }
          return {
            success: false,
            message: detailedMessage,
            data: axiosError.response.data,
          };
        } else if (axiosError.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.error('Network Error / No Response. Is the server running and CORS configured?');
          return {
            success: false,
            message: 'Network error or no response from server. Please check your connection and the server status. (Also check for CORS issues in browser console)',
          };
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Axios Error Setup:', axiosError.message);
          return {
            success: false,
            message: 'Error setting up request: ' + axiosError.message,
          };
        }
      } else {
        // Non-Axios error
        console.error('Unknown Error:', error);
        return {
          success: false,
          message: 'An unexpected non-HTTP error occurred. Please try again.',
        };
      }
    }
  }

  async getTravelRequests(employeeId?: number): Promise<ApiResponse> {
    const url = employeeId
      ? `${this.baseUrl}/TravelRequest/employee/${employeeId}`
      : `${this.baseUrl}/TravelRequest`;

    console.log(`Fetching travel requests from: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeout,
      });
      console.log('Successfully fetched travel requests:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching travel requests:', error);
      // Add similar detailed error handling as in submitTravelRequest if needed
      if (axios.isAxiosError(error)) {
         const axiosError = error as AxiosError<any>;
         return { 
            success: false, 
            message: axiosError.response?.data?.message || axiosError.message || 'Failed to fetch travel requests'
        };
      }
      return { success: false, message: 'Failed to fetch travel requests due to an unknown error.' };
    }
  }

  updateConfig(baseUrl?: string, timeout?: number) {
    if (baseUrl) {
        this.baseUrl = baseUrl;
        console.log(`TravelRequestService baseUrl updated to: ${this.baseUrl}`);
    }
    if (timeout) {
        this.timeout = timeout;
        console.log(`TravelRequestService timeout updated to: ${this.timeout}`);
    }
  }
}

export const travelRequestService = new TravelRequestService();
// Export types if they are needed by other components directly
// export type { TravelRequestState, ApiTravelRequest, ApiResponse, Location };