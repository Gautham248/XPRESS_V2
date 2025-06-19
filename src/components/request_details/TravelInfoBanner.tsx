import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Briefcase, Check, Users, Plane, TrainFront, Loader2, AlertCircle, Phone } from "lucide-react";
import { TravelRequestApiResponse, TravelRequestData } from "./types";

interface TravelInfoBannerProps {
  requestId?: string;
}

const API_BASE_URL = 'http://localhost:5030/api';

const TravelInfoBanner: React.FC<TravelInfoBannerProps> = ({ 
  requestId, 
}) => {
  const apiUrl = `${API_BASE_URL}/TravelRequest/infobanner`;
  const [travelRequest, setTravelRequest] = useState<TravelRequestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    // If no requestId provided, can't fetch
    if (!requestId) {
      setError("No request ID provided");
      setLoading(false);
      return;
    }

    const fetchTravelRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construct API URL with request ID
        const url = `${apiUrl}/${requestId}`;
        const response = await axios.get<TravelRequestApiResponse>(url);
        
        if (response.data.isSuccess && response.data.result.length > 0) {
            const apiData = response.data.result[0];
            // console.log(apiData);
          
          // Transform API data to component format
          const transformedData: TravelRequestData = {
            requestId: apiData.requestId,
            travelerName: apiData.employeeName,
            departmentCode: apiData.departmentName,
            projectManager: apiData.projectManager,
            projectCode: apiData.projectCode,
            transportationType: apiData.travelModeName,
            source: `${apiData.sourcePlace}, ${apiData.sourceCountry}`,
            destination: `${apiData.destinationPlace}, ${apiData.destinationCountry}`,
            phoneNumber: apiData.phoneNumber
          };
          
          setTravelRequest(transformedData);
        } else {
          if (response.data.errorMessages && response.data.errorMessages.length > 0) {
            setError(response.data.errorMessages.join(', '));
          } else if (response.data.isSuccess && response.data.result.length === 0) {
            setError("No travel request found");
          } else {
            setError("Failed to retrieve travel request data.");
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosErr = err as AxiosError<any>;
          if (axiosErr.response) {
            setError(axiosErr.response.data?.message || axiosErr.response.data?.errorMessages?.join(', ') || axiosErr.message || "An error occurred with the server response.");
          } else if (axiosErr.request) {
            setError(axiosErr.message || "Network error: Could not connect to server.");
          } else {
            setError(axiosErr.message || "Error setting up request.");
          }
        } else if (err instanceof Error) {
          setError(err.message || "An unexpected error occurred.");
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTravelRequest();
  }, [requestId, apiUrl]);

//   console.log(travelRequest);  

  const getTravelModeIcon = (travelMode: string) => {
    switch (travelMode) {
      case "Flight":
        return <Plane size={24} className="text-blue-600" />;
      case "Train":
        return <TrainFront size={24} className="text-blue-600" />;
      default:
        return <Check size={24} className="text-blue-600" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-center items-center w-full min-h-[120px]">
        <div className="flex items-center space-x-3 text-gray-500">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading travel request...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-center items-center w-full min-h-[120px]">
        <div className="flex items-center space-x-3 text-red-500">
          <AlertCircle size={24} />
          <div className="text-center">
            <div className="font-medium">Failed to load travel request</div>
            <div className="text-sm text-red-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!travelRequest) {
    return (
      <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-center items-center w-full min-h-[120px]">
        <div className="flex items-center space-x-3 text-gray-500">
          <AlertCircle size={24} />
          <span>No travel request data available</span>
        </div>
      </div>
    );
  }

  // Success state - render the banner
  return (
    <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-between items-center w-full" data-testid="travel-info-banner-success">
      {/* Left Section - Employee Info */}
      <div className="flex-none">
        {/* Employee Name Row */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{travelRequest.travelerName}</h2>
       
        {/* Details in Single Row */}
        <div className="flex items-start gap-8">
          {/* Department */}
          <div>
            <div className="text-xs text-gray-500 flex items-center mb-1">
              <Briefcase size={14} className="mr-2" />
              Department
            </div>
            <div className="text-gray-600">
              {travelRequest.departmentCode || '-'}
            </div>
          </div>
         
          {/* Project Code */}
          <div>
            <div className="text-xs text-gray-500 flex items-center mb-1">
              <Check size={14} className="mr-2" />
              Project Code
            </div>
            <div className="text-gray-600">
              {travelRequest.projectCode || '-'}
            </div>
          </div>
         
          {/* Manager */}
          <div>
            <div className="text-xs text-gray-500 flex items-center mb-1">
              <Users size={14} className="mr-2" />
              Manager
            </div>
            <div className="text-gray-600">
              {travelRequest.projectManager || '-'}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <div className="text-xs text-gray-500 flex items-center mb-1">
              <Phone size={14} className="mr-2" />
              Contact
            </div>
            <div className="text-gray-600">
              {travelRequest.phoneNumber || '-'}
            </div>
          </div>
        </div>
      </div>
     
      {/* Right Section - Travel Info */}
      <div className="flex-grow flex justify-end items-center">
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-xs text-gray-500">From</div>
            <div className="text-xl font-bold text-gray-900">{travelRequest.source || 'Not specified'}</div>
          </div>
          <div className="flex flex-col items-center mx-2">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
              {getTravelModeIcon(travelRequest.transportationType || 'Other')}
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs text-gray-500">To</div>
            <div className="text-xl font-bold text-gray-900">{travelRequest.destination || 'Not specified'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelInfoBanner;