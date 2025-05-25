import React, { useState, useEffect } from "react";
import axios from "axios";
import { Briefcase, Check, Users, Plane, TrainFront } from "lucide-react";
import { TravelRequest } from "../../data/mockData";

interface TravelInfoBannerProps {
  travelRequest: TravelRequest;
}

interface TravelInfoBannerData {
  requestId: number;
  employeeName: string;
  departmentName: string;
  projectCode: string;
  travelModeName: string;
  sourcePlace: string;
  sourceCountry: string;
  destinationPlace: string;
  destinationCountry: string;
}

const TravelInfoBanner: React.FC<TravelInfoBannerProps> = ({ travelRequest }) => {
    const [bannerData, setBannerData] = useState<TravelInfoBannerData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTravelInfoBanner = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const travelInfoBannerURL = `http://localhost:5171/api/TravelRequest/infobanner/${travelRequest.id}`;
            console.log('Fetching from URL:', travelInfoBannerURL);
            
            const response = await axios.get<TravelInfoBannerData[] | TravelInfoBannerData>(travelInfoBannerURL, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout: 10000,
                withCredentials: false
            });
            
            console.log('API Response:', response.data);
            
            // Handle both array and object responses
            let responseData: TravelInfoBannerData;
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
            
            setBannerData(responseData);
        } catch (err) {
            console.error('Error fetching travel info banner:', err);
            
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
                    setError('Travel request not found (404)');
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
            
            // Fallback to original travelRequest data
            // setBannerData({
            //     requestId: 0,
            //     employeeName: travelRequest.travelerName,
            //     departmentName: travelRequest.departmentCode,
            //     projectCode: travelRequest.projectCode,
            //     travelModeName: travelRequest.transportationType,
            //     sourcePlace: travelRequest.source,
            //     sourceCountry: "",
            //     destinationPlace: travelRequest.destination,
            //     destinationCountry: ""
            // });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTravelInfoBanner();
    }, [travelRequest.id]);

    if (loading) {
        return (
            <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-center items-center w-full h-32">
                <div className="text-gray-500">Loading travel information...</div>
            </div>
        );
    }

    const displayData = bannerData || {
        requestId: 0,
        employeeName: travelRequest.travelerName,
        departmentName: travelRequest.departmentCode,
        projectCode: travelRequest.projectCode,
        travelModeName: travelRequest.transportationType,
        sourcePlace: travelRequest.source,
        sourceCountry: "",
        destinationPlace: travelRequest.destination,
        destinationCountry: ""
    };

    return (
        <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-between items-center w-full">
            {error && (
                <div className="absolute top-2 right-2 text-xs text-red-500">
                    {error}
                </div>
            )}
            
            {/* Left Section - Employee Info */}
            <div className="flex-none">
                {/* Employee Name Row */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{displayData.employeeName}</h2>
               
                {/* Details in Single Row */}
                <div className="flex items-start gap-8">
                    {/* Department */}
                    <div>
                        <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Briefcase size={14} className="mr-2" />
                            Department
                        </div>
                        <div className="text-gray-600">
                            {displayData.departmentName}
                        </div>
                    </div>
                   
                    {/* Project Code */}
                    <div>
                        <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Check size={14} className="mr-2" />
                            Project Code
                        </div>
                        <div className="text-gray-600">
                            {displayData.projectCode}
                        </div>
                    </div>
                   
                    {/* Manager */}
                    <div>
                        <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Users size={14} className="mr-2" />
                            Manager
                        </div>
                        <div className="text-gray-600">
                            {travelRequest.managerName}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Section - Travel Info */}
            <div className="flex-grow flex justify-end items-center">
                <div className="flex items-center space-x-6">
                    <div className="text-right">
                        <div className="text-xs text-gray-500">From</div>
                        <div className="text-xl font-bold text-gray-900">{displayData.sourcePlace}</div>
                        {displayData.sourceCountry && (
                            <div className="text-sm text-gray-500">{displayData.sourceCountry}</div>
                        )}
                    </div>
                    <div className="flex flex-col items-center mx-2">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                            {displayData.travelModeName === "Flight" ? (
                                <Plane size={24} className="text-blue-600" />
                            ) : displayData.travelModeName === "Train" ? (
                                <TrainFront size={24} className="text-blue-600" />
                            ) : (
                                <Check size={24} className="text-blue-600"/>
                            )}
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-500">To</div>
                        <div className="text-xl font-bold text-gray-900">{displayData.destinationPlace}</div>
                        {displayData.destinationCountry && (
                            <div className="text-sm text-gray-500">{displayData.destinationCountry}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelInfoBanner;