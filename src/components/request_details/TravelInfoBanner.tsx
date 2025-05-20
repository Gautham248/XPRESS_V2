import { Briefcase, Check, Users, Plane, TrainFront } from "lucide-react";
import { TravelRequest } from "../../data/mockData";

interface TravelInfoBannerProps {
  travelRequest: TravelRequest;
}

const TravelInfoBanner: React.FC<TravelInfoBannerProps> = ({ travelRequest }) => {
    return (
        <div className="relative bg-white rounded-lg shadow-md px-6 py-4 flex justify-between items-center w-full">
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
                            {travelRequest.departmentCode}
                        </div>
                    </div>
                    
                    {/* Project Code */}
                    <div>
                        <div className="text-xs text-gray-500 flex items-center mb-1">
                            <Check size={14} className="mr-2" />
                            Project Code
                        </div>
                        <div className="text-gray-600">
                            {travelRequest.projectCode}
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
                        <div className="text-xl font-bold text-gray-900">{travelRequest.source}</div>
                    </div>
                    <div className="flex flex-col items-center mx-2">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                            {travelRequest.transportationType === "Flight" ? (
                                <Plane size={24} className="text-blue-600" /> 
                            ) : travelRequest.transportationType === "Train" ? (
                                <TrainFront size={24} className="text-blue-600" /> 
                            ) : (
                                <Check size={24} className="text-blue-600"/>
                            )}
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-500">To</div>
                        <div className="text-xl font-bold text-gray-900">{travelRequest.destination}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelInfoBanner;