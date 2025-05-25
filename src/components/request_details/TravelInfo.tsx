import React, { useState, useEffect } from 'react';
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
  Navigation
} from 'lucide-react';
import { TravelRequest } from '../../data/mockData';

interface TravelInfoProps {
  travelRequest: TravelRequest;
}

interface TravelInfoData {
  requestId: number;
  departureDate: string;
  returnDate: string;
  transportation: string;
  travelTypeName: string;
  requestCreateDate: string;
  purposeOfTravel: string;
  isAccommodationRequired: boolean;
  foodPreference: string;
  pickupLocation: string;
  dropoffLocation: string;
}

const TravelInfo: React.FC<TravelInfoProps> = ({ travelRequest }) => {
  const [travelInfoData, setTravelInfoData] = useState<TravelInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTravelInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const travelInfoURL = `http://localhost:5171/api/TravelRequest/travelinfo/${travelRequest.id}`;
      console.log('Fetching from URL:', travelInfoURL);
      
      const response = await axios.get<TravelInfoData[] | TravelInfoData>(travelInfoURL, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
        withCredentials: false
      });
      
      console.log('API Response:', response.data);
      
      // Handle both array and object responses
      let responseData: TravelInfoData;
      if (Array.isArray(response.data)) {
        // If response is an array, take the first item
        if (response.data.length > 0) {
          responseData = response.data[0];
        } else {
          throw new Error('Empty array returned from API');
        }
      } else {
        // If response is already an object
        responseData = response.data;
      }
      
      setTravelInfoData(responseData);
    } catch (err) {
      console.error('Error fetching travel info:', err);
      
      if (axios.isAxiosError(err)) {
        console.log('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url
        });
        
        if (err.response?.status === 400) {
          setError(`Bad Request (400): ${err.response.data?.message || 'Invalid request parameters'}`);
        } else if (err.response?.status === 404) {
          setError('Travel info not found (404)');
        } else if (err.response?.status === 500) {
          setError('Server error (500) - please try again later');
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timeout - please try again');
        } else {
          setError(`Request failed (${err.response?.status || 'Network Error'})`);
        }
      } else {
        setError('Failed to load travel information');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelInfo();
  }, [travelRequest.id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatFoodPreference = (preference: string) => {
    switch (preference?.toLowerCase()) {
      case 'vegetarian':
      case 'veg':
        return 'Vegetarian';
      case 'non-vegetarian':
      case 'non-veg':
        return 'Non-Vegetarian';
      case 'no-preference':
      case 'no preference':
        return 'No Preference';
      default:
        return preference || 'Not specified';
    }
  };

  if (loading) {
    return (
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-6">Travel Information</h3>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading travel information...</div>
        </div>
      </div>
    );
  }

  // Use API data if available, otherwise fallback to original travelRequest data
  const displayData = travelInfoData || {
    requestId: 0,
    departureDate: travelRequest.departureDate,
    returnDate: travelRequest.returnDate || '',
    transportation: travelRequest.transportationType,
    travelTypeName: travelRequest.travelType || '',
    requestCreateDate: travelRequest.requestDate || '',
    purposeOfTravel: travelRequest.purpose,
    isAccommodationRequired: travelRequest.accommodationType !== 'None',
    foodPreference: 'vegetarian',
    pickupLocation: '',
    dropoffLocation: ''
  };

  return (
    <div className="card mb-6">
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-6">Travel Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1 */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Departure Date
            </p>
            <p>{formatDate(displayData.departureDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              {displayData.transportation === "Flight" ? (
                <Plane className="h-4 w-4 mr-2" />
              ) : displayData.transportation === "Train" ? (
                <TrainFront className="h-4 w-4 mr-2" />
              ) : displayData.transportation === "Other" ? (
                <BusFront className="h-4 w-4 mr-2" />
              ) : displayData.transportation === "Car Rental" ? (
                <CarTaxiFront className="h-4 w-4 mr-2" />
              ) : <Check className="h-4 w-4 mr-2" />
              }
              Transportation
            </p>
            <p>{displayData.transportation}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Request Date
            </p>
            <p>{formatDate(displayData.requestCreateDate)}</p>
          </div>
          {displayData.isAccommodationRequired && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center">
                <Hotel className="h-4 w-4 mr-2" />
                Accommodation
              </p>
              <p>Required</p>
            </div>
          )}
        </div>
        
        {/* Column 2 */}
        <div className="space-y-4">
          {displayData.returnDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Return Date
              </p>
              <p>{formatDate(displayData.returnDate)}</p>
            </div>
          )}
          {displayData.travelTypeName && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center">
                <Navigation className="h-4 w-4 mr-2" />
                Travel Type
              </p>
              <p>{displayData.travelTypeName}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Backpack className="h-4 w-4 mr-2" />
              Purpose of Travel
            </p>
            <p>{displayData.purposeOfTravel}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center">
              <Utensils className="h-4 w-4 mr-2" />
              Food Preference
            </p>
            <p>{formatFoodPreference(displayData.foodPreference)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelInfo;

{/* <div>
          <p className="text-sm text-muted-foreground -mt-4 mb-1 flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Conveyance | 
          </p>
        </div> */}