import axios, { AxiosError } from 'axios';

// Location interface - ensure this matches your LocationSearch component
export interface Location {
  country: string;
  city: string;
  state?: string;
  label: string;
  value: string;
}

// Frontend state interface - matches TravelRequestContext
export interface TravelRequestState {
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
  reason: string; // Maps to purposeOfTravel
  comments: string;
  requiresFoodPreference: boolean;
  foodPreference: 'veg' | 'non-veg';
  foodPreferenceComment: string | null;
  attendedCct: boolean;
  // Legacy fields for backward compatibility
  departureDate: Date | null;
  returnDate: Date | null;
}

// Backend DTO structure - Updated to match your new DTO
interface TravelRequestCreateDTO {
  userId: number;
  travelModeId: number;
  isInternational: boolean;
  isRoundTrip: boolean;
  projectCode: string;
  sourcePlace: string;
  sourceCountry: string;
  destinationPlace: string;
  destinationCountry: string;
  outboundDepartureDate: string; // ISO string (UTC)
  outboundArrivalDate: string;   // ISO string (UTC)
  returnDepartureDate?: string;  // ISO string (UTC), nullable
  returnArrivalDate?: string;    // ISO string (UTC), nullable
  isAccommodationRequired: boolean;
  isDropOffRequired: boolean;
  dropOffPlace?: string;         // NEW FIELD
  isPickUpRequired: boolean;
  pickUpPlace?: string;          // NEW FIELD
  comments?: string;
  purposeOfTravel: string;
  isVegetarian: boolean;
  foodComment?: string;
  attendedCCT: boolean;
  ldCertificatePath?: string; // Optional file path for L/D certificate
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Travel mode mapping
const getTravelModeId = (transportMode: string): number => {
  const modeMap: { [key: string]: number } = {
    'flight': 1,
    'train': 2,
    'bus': 3,
    'cab': 4,
  };
  return modeMap[transportMode.toLowerCase()] || 1; // Default to flight
};

// Helper function to combine date and time into UTC DateTime
const combineDateAndTime = (date: Date, timeString: string): Date => {
  if (!date) throw new Error('Date is required');
  
  // If no time provided, use current time or default to start of day
  if (!timeString || timeString.trim() === '') {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  
  // Parse time string (assuming format like "14:30" or "2:30 PM")
  const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
  const combinedDate = new Date(date);
  combinedDate.setHours(hours || 0, minutes || 0, 0, 0);
  
  return combinedDate;
};

class TravelRequestService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:5030/api', timeout: number = 15000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    console.log(`TravelRequestService initialized with baseUrl: ${this.baseUrl}`);
  }

  private mapFormStateToCreateDTO(state: TravelRequestState, userId: number): TravelRequestCreateDTO {
    // Validation
    if (!state.source?.city || !state.source?.country) {
      throw new Error("Source location (city and country) is required.");
    }
    if (!state.destination?.city || !state.destination?.country) {
      throw new Error("Destination location (city and country) is required.");
    }
    if (!state.outboundDepartureDate) {
      throw new Error("Outbound departure date is required.");
    }

    // Combine dates and times for UTC conversion
    const outboundDeparture = combineDateAndTime(state.outboundDepartureDate, state.outboundDepartureTime);
    
    // For arrival date, use departure date if arrival date is not specified
    const outboundArrival = state.outboundArrivalDate 
      ? combineDateAndTime(state.outboundArrivalDate, state.outboundArrivalTime)
      : outboundDeparture; // Default to same as departure if not specified

    let returnDeparture: Date | undefined;
    let returnArrival: Date | undefined;

    if (state.tripType === 'roundTrip') {
      if (!state.returnDepartureDate) {
        throw new Error("Return departure date is required for round trips.");
      }
      returnDeparture = combineDateAndTime(state.returnDepartureDate, state.returnDepartureTime);
      returnArrival = state.returnArrivalDate 
        ? combineDateAndTime(state.returnArrivalDate, state.returnArrivalTime)
        : returnDeparture; // Default to same as return departure if not specified
    }

    // Map food preference
    const isVegetarian = state.requiresFoodPreference ? state.foodPreference === 'veg' : false;
    const foodComment = state.requiresFoodPreference && state.foodPreferenceComment 
      ? state.foodPreferenceComment 
      : undefined;

    // Map pickup and dropoff locations
    const pickUpPlace = state.requiresPickup && state.pickupLocation.trim() 
      ? state.pickupLocation.trim() 
      : undefined;
    
    const dropOffPlace = state.requiresDropoff && state.dropoffLocation.trim() 
      ? state.dropoffLocation.trim() 
      : undefined;

    const dto: TravelRequestCreateDTO = {
      userId: userId,
      travelModeId: getTravelModeId(state.transportMode),
      isInternational: state.travelType === 'international',
      isRoundTrip: state.tripType === 'roundTrip',
      projectCode: state.projectCode.trim(),
      sourcePlace: state.source.city,
      sourceCountry: state.source.country,
      destinationPlace: state.destination.city,
      destinationCountry: state.destination.country,
      outboundDepartureDate: outboundDeparture.toISOString(),
      outboundArrivalDate: outboundArrival.toISOString(),
      returnDepartureDate: returnDeparture?.toISOString(),
      returnArrivalDate: returnArrival?.toISOString(),
      isAccommodationRequired: state.requiresAccommodation,
      isDropOffRequired: state.requiresDropoff,
      dropOffPlace: dropOffPlace,               // NEW FIELD MAPPING
      isPickUpRequired: state.requiresPickup,
      pickUpPlace: pickUpPlace,                 // NEW FIELD MAPPING
      comments: state.comments.trim() || undefined,
      purposeOfTravel: state.reason.trim(),
      isVegetarian: isVegetarian,
      foodComment: foodComment,
      attendedCCT: state.attendedCct,
      // ldCertificatePath will be handled separately when file upload is implemented
    };

    return dto;
  }

  async submitTravelRequest(state: TravelRequestState, userId: number): Promise<ApiResponse> {
    let dto: TravelRequestCreateDTO;
    
    try {
      dto = this.mapFormStateToCreateDTO(state, userId);
    } catch (mappingError: any) {
      console.error('Error mapping form state to DTO:', mappingError);
      return {
        success: false,
        message: mappingError.message || 'Internal error: Could not prepare data for submission.',
      };
    }

    console.log('=== SUBMITTING TRAVEL REQUEST ===');
    console.log('API Endpoint:', `${this.baseUrl}/TravelRequest`);
    console.log('Request DTO:', JSON.stringify(dto, null, 2));

    try {
      const response = await axios.post<any>(`${this.baseUrl}/TravelRequest`, dto, {
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed
          // 'Authorization': `Bearer ${authToken}`
        },
        timeout: this.timeout,
      });

      console.log('=== API SUCCESS RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);

      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: response.data?.message || 'Travel request submitted successfully!',
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.data?.message || `Submission failed with status: ${response.status}`,
          data: response.data,
        };
      }

    } catch (error) {
      console.error('=== API SUBMISSION ERROR ===');
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        console.error('Axios Error Details:', {
          message: axiosError.message,
          code: axiosError.code,
          response: axiosError.response ? {
            status: axiosError.response.status,
            data: axiosError.response.data,
          } : 'No response object',
        });

        if (axiosError.response) {
          let errorMessage = `Server Error (${axiosError.response.status}): `;
          
          if (axiosError.response.data?.message) {
            errorMessage += axiosError.response.data.message;
          } else if (axiosError.response.data?.errors) {
            // Handle validation errors if your API returns them
            const validationErrors = Object.values(axiosError.response.data.errors).flat();
            errorMessage += validationErrors.join(', ');
          } else if (typeof axiosError.response.data === 'string') {
            errorMessage += axiosError.response.data;
          } else {
            errorMessage += 'Please check server logs for details.';
          }
          
          return {
            success: false,
            message: errorMessage,
            data: axiosError.response.data,
          };
        } else if (axiosError.request) {
          return {
            success: false,
            message: 'Network error: Unable to reach server. Please check your connection and server status.',
          };
        } else {
          return {
            success: false,
            message: 'Request setup error: ' + axiosError.message,
          };
        }
      } else {
        console.error('Unknown Error:', error);
        return {
          success: false,
          message: 'An unexpected error occurred. Please try again.',
        };
      }
    }
  }

  async getTravelRequests(userId?: number): Promise<ApiResponse> {
    const url = userId
      ? `${this.baseUrl}/TravelRequests/user/${userId}`
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

// Create singleton instance with correct base URL
export const travelRequestService = new TravelRequestService('http://localhost:5030/api', 15000);