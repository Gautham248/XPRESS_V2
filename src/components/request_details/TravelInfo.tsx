// TravelInfo.tsx
import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Calendar,
  TrainFront,
  Plane,
  BusFront,
  CarTaxiFront,
  Backpack,
  Check,
  Hotel,
  Utensils,
  Clock,
  Navigation,
  Loader2,
} from 'lucide-react';

interface ApiTravelInfoItem {
  requestId: string;
  outboundDepartureDate: string;
  outboundArrivalDate: string;
  returnDepartureDate: string | null;
  returnArrivalDate: string | null;
  transportation: string;
  isInternational: boolean;
  requestCreateDate: string;
  purposeOfTravel: string;
  isAccommodationRequired: boolean;
  isVegetarian: boolean;
  isDropOffRequired: boolean;
  isPickUpRequired: boolean;
  dropOffLocation: string | null;
  pickUpLocation: string | null;
}

interface TravelInfoApiResponse {
  isSuccess: boolean;
  result: ApiTravelInfoItem[];
  statusCode: number;
  errorMessages: string[];
}

interface TravelRequestData {
  id: string;
  outboundDepartureDate: string;
  outboundArrivalDate: string;
  returnDepartureDate: string | null;
  returnArrivalDate: string | null;
  transportationType: string;
  requestDate: string;
  accommodationType: string;
  travelType: string;
  purpose: string;
  foodPreference: string;
  pickUpLocation: string | null;
  dropOffLocation: string | null;
}

interface TravelInfoProps {
  requestId?: string;
}


const TravelInfo: React.FC<TravelInfoProps> = ({ requestId }) => {
  const [travelRequest, setTravelRequest] = useState<TravelRequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTravelData = async () => {
      if (!requestId) {
        setLoading(false);
        setError("Request ID is not provided.");
        return;
      }

      setLoading(true);
      setError(null);
      setTravelRequest(null); 

      try {
        const response = await axios.get<TravelInfoApiResponse>(
          `http://localhost:5030/api/TravelRequest/travelinfo/${requestId}`
        );

        if (response.data.isSuccess && response.data.result && response.data.result.length > 0) {
          const apiData = response.data.result[0];
          const mappedData: TravelRequestData = {
            id: apiData.requestId,
            outboundDepartureDate: apiData.outboundDepartureDate,
            outboundArrivalDate: apiData.outboundArrivalDate,
            returnDepartureDate: apiData.returnDepartureDate,
            returnArrivalDate: apiData.returnArrivalDate,
            transportationType: apiData.transportation,
            requestDate: apiData.requestCreateDate,
            accommodationType: apiData.isAccommodationRequired ? "Required" : "Not Required",
            travelType: apiData.isInternational ? "International" : "Domestic",
            purpose: apiData.purposeOfTravel,
            foodPreference: apiData.isVegetarian ? "Vegetarian" : "Non-Vegetarian",
            pickUpLocation: apiData.pickUpLocation,
            dropOffLocation: apiData.dropOffLocation,
          };
          setTravelRequest(mappedData);
        } else {
          const errorMsg = response.data.errorMessages?.length > 0
            ? response.data.errorMessages.join(', ')
            : (response.data.result && response.data.result.length === 0 ? 'Travel request details not found.' : 'Failed to retrieve travel data structure.');
          setError(errorMsg);
        }
      } catch (err: any) {
        let errorMessage = 'An unknown error occurred while fetching travel data.';

        if (axios.isAxiosError(err)) {
          const axiosErr = err as AxiosError<any>;
          if (axiosErr.response) {
            errorMessage = axiosErr.response.data?.message || 
                           axiosErr.response.data?.errorMessages?.join(', ') || 
                           axiosErr.message ||
                           "An error occurred with the server response.";
          } else if (axiosErr.request) {
            errorMessage = axiosErr.message || "Network error: Could not connect to server.";
          } else {
            errorMessage = axiosErr.message || "Error setting up request.";
          }
        } else if (err && typeof err.message === 'string' && err.message.trim() !== '') {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
        fetchTravelData();
    } else {
        setError("Request ID is not provided.");
        setLoading(false);
    }
  }, [requestId]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getTransportationIcon = (transportation: string) => {
    switch (transportation?.toLowerCase()) {
      case "flight":
        return <Plane data-testid="flight-icon" className="h-4 w-4 mr-2" />;
      case "train":
        return <TrainFront data-testid="train-icon" className="h-4 w-4 mr-2" />;
      case "bus":
        return <BusFront data-testid="bus-icon" className="h-4 w-4 mr-2" />;
      case "cab":
        return <CarTaxiFront data-testid="car-icon" className="h-4 w-4 mr-2" />;
      default:
        return <Check data-testid="default-transport-icon" className="h-4 w-4 mr-2" />;
    }
  };

  if (loading) {
    return (
      <div data-testid="loading-indicator" className="card relative bg-white rounded-lg px-6 py-4 flex justify-center items-center w-full min-h-[120px]">
        <div className="flex items-center space-x-3 text-gray-500">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading travel information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="error-message-container" className="card mb-6 p-4 border-red-200 bg-red-50 rounded-lg">
        <div className="text-red-600 font-medium">Error loading travel information</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  if (!travelRequest) {
    return (
      <div data-testid="no-data-message" className="card mb-6 p-4 border-gray-200 bg-gray-50 rounded-lg">
        <div className="text-gray-600">No travel information available for this request.</div>
      </div>
    );
  }

  return (
    <div data-testid="travel-info-success" className="card mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Travel Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Outbound Departure
            </p>
            <p className="font-medium text-gray-900">{formatDate(travelRequest.outboundDepartureDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Outbound Arrival
            </p>
            <p className="font-medium text-gray-900">{formatDate(travelRequest.outboundArrivalDate)}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Return Departure
            </p>
            <p className="font-medium text-gray-900">{formatDate(travelRequest.returnDepartureDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Return Arrival
            </p>
            <p className="font-medium text-gray-900">{formatDate(travelRequest.returnArrivalDate)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              {getTransportationIcon(travelRequest.transportationType)}
              Transportation
            </p>
            <p className="font-medium text-gray-900">{travelRequest.transportationType || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Travel Type
            </p>
            <p className="font-medium text-gray-900">{travelRequest.travelType || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Backpack className="h-4 w-4 mr-2" />
              Purpose of Travel
            </p>
            <p className="font-medium text-gray-900">{travelRequest.purpose || '-'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Hotel className="h-4 w-4 mr-2" />
              Accommodation
            </p>
            <p className="font-medium text-gray-900">{travelRequest.accommodationType || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Utensils className="h-4 w-4 mr-2" />
              Food Preference
            </p>
            <p className="font-medium text-gray-900">{travelRequest.foodPreference || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Request Date
            </p>
            <p className="font-medium text-gray-900">{formatDate(travelRequest.requestDate)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <CarTaxiFront className="h-4 w-4 mr-2" />
            Pick-up Location
          </p>
          <p className="font-medium text-gray-900">
            {travelRequest.pickUpLocation || '-'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <CarTaxiFront className="h-4 w-4 mr-2" />
            Drop-off Location
          </p>
          <p className="font-medium text-gray-900">
            {travelRequest.dropOffLocation || '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelInfo;