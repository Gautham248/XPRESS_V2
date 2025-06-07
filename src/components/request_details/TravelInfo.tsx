import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  Loader2
} from 'lucide-react';

// Define interfaces for the new API response
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
}

interface TravelInfoApiResponse {
  isSuccess: boolean;
  result: ApiTravelInfoItem[];
  statusCode: number;
  errorMessages: string[];
}

// Props for the component
interface TravelInfoProps {
  requestId?: string;
}

// Internal state structure for the fetched and mapped travel data
interface TravelRequestData {
  id: string;
  outboundDepartureDate: string;
  outboundArrivalDate: string;
  returnDepartureDate: string | null;
  returnArrivalDate: string | null;
  transportationType: string;
  requestDate: string;
  accommodationType: string; // "Required" or "Not Required"
  travelType: string;      // "International" or "Domestic"
  purpose: string;
  foodPreference: string;  // "Vegetarian" or "Non-Vegetarian"
  isPickUpRequired: boolean;
  isDropOffRequired: boolean;
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

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<TravelInfoApiResponse>(
          `http://localhost:5030/api/TravelRequest/travelinfo/${requestId}`
        );

        if (response.data.isSuccess && response.data.result && response.data.result.length > 0) {
          const apiData = response.data.result[0]; // Assuming the first result is the one we need
          
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
            isPickUpRequired: apiData.isPickUpRequired,
            isDropOffRequired: apiData.isDropOffRequired,
          };
          
          setTravelRequest(mappedData);
        } else {
          const errorMsg = response.data.errorMessages?.length > 0 
            ? response.data.errorMessages.join(', ') 
            : (response.data.result && response.data.result.length === 0 ? 'Travel request details not found.' : 'Failed to retrieve travel data structure.');
          throw new Error(errorMsg);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(`API Error: ${err.response?.status} - ${err.response?.data?.errorMessages?.join(', ') || err.response?.statusText || err.message}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching travel data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTravelData();
  }, [requestId]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      // If dateString is present but invalid, you might want to return the original string or a specific error mark
      return 'Invalid Date'; 
    }
  };

  const getTransportationIcon = (transportation: string) => {
    switch (transportation?.toLowerCase()) {
      case "flight":
        return <Plane className="h-4 w-4 mr-2" />;
      case "train":
        return <TrainFront className="h-4 w-4 mr-2" />;
      case "bus":
        return <BusFront className="h-4 w-4 mr-2" />;
      case "car rental":
        return <CarTaxiFront className="h-4 w-4 mr-2" />;
      case "other": // If API sends "Other" explicitly
        return <Check className="h-4 w-4 mr-2" />; // Or a generic transport icon
      default:
        return <Check className="h-4 w-4 mr-2" />; // Default icon for unspecified or unknown
    }
  };

  if (loading) {
    return (
      <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-center items-center w-full min-h-[120px]">
        <div className="flex items-center space-x-3 text-gray-500">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading travel information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card mb-6 p-4 border-red-200 bg-red-50 rounded-lg">
        <div className="text-red-600 font-medium">Error loading travel information</div>
        <div className="text-red-500 text-sm mt-1">{error}</div>
      </div>
    );
  }

  if (!travelRequest) {
    return (
      <div className="card mb-6 p-4 border-gray-200 bg-gray-50 rounded-lg">
        <div className="text-gray-600">No travel information available for this request.</div>
      </div>
    );
  }

  return (
    <div className="card mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-semibold mb-6 text-gray-900">Travel Information</h3>
      
      {/* Travel Dates Section */}
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

      {/* Main Travel Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Column 1 */}
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
        
        {/* Column 2 */}
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

      {/* Conveyance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <CarTaxiFront className="h-4 w-4 mr-2" />
            Pick-up Service
          </p>
          <p className="font-medium text-gray-900">
            {travelRequest.isPickUpRequired ? 'Required' : 'Not Required'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <CarTaxiFront className="h-4 w-4 mr-2" />
            Drop-off Service
          </p>
          <p className="font-medium text-gray-900">
            {travelRequest.isDropOffRequired ? 'Required' : 'Not Required'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelInfo;