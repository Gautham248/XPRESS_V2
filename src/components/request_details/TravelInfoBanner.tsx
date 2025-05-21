import { Briefcase, Check, Users, Plane, TrainFront } from "lucide-react";
import { TravelRequest, getStatusColor } from "../../data/mockData";

interface TravelInfoBannerProps {
    travelRequest: TravelRequest;
}

const TravelInfoBanner: React.FC<TravelInfoBannerProps> = ({ travelRequest }) => {
    const statusColor = getStatusColor(travelRequest.status);

    return (
        <div className="card relative bg-white rounded-lg px-6 py-4 flex justify-between items-center w-full">
            {/* Status Badge - Top Right */}
            <div className="absolute top-5 right-6">
                <div className={`px-4 py-3 rounded-full text-sm font-medium ${statusColor} flex items-center`}>
                    {travelRequest.status}
                </div>
            </div>

            {/* Left Section - Employee Info */}
            <div className="flex-none">
                {/* Employee Name Row */}
                <h2 className="text-3xl font-bold text-gray-800 mb-3">{travelRequest.travelerName}</h2>

                {/* Details in Single Row */}
                <div className="flex flex-col items-start gap-1">
                    {/* Department */}
                    <div className="flex gap-2">
                        <div className="text-sm text-gray-500 flex items-center mb-1">
                            <Briefcase size={14} className="mr-2" />
                            Department:
                        </div>
                        <div className="text-sm text-gray-600">
                            {travelRequest.departmentCode}
                        </div>
                    </div>

                    {/* Project Code */}
                    <div className="flex gap-2">
                        <div className="text-sm text-gray-500 flex items-center mb-1">
                            <Check size={14} className="mr-2" />
                            Project Code:
                        </div>
                        <div className="text-sm text-gray-600">
                            {travelRequest.projectCode}
                        </div>
                    </div>

                    {/* Manager */}
                    <div className="flex gap-2">
                        <div className="text-sm text-gray-500 flex items-center mb-1">
                            <Users size={14} className="mr-2" />
                            Manager:
                        </div>
                        <div className="text-sm text-gray-600">
                            {travelRequest.managerName}
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section - Travel Info */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex items-center space-x-6">
                    <div className="text-right">
                        <div className="text-xs text-gray-500">From</div>
                        <div className="text-2xl font-bold text-gray-900">{travelRequest.source}</div>
                    </div>
                    <div className="flex flex-col items-center mx-2">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                            {travelRequest.transportationType === "Flight" ? (
                                <Plane size={24} className="text-blue-600" />
                            ) : travelRequest.transportationType === "Train" ? (
                                <TrainFront size={24} className="text-blue-600" />
                            ) : (
                                <Check size={24} className="text-blue-600" />
                            )}
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-500">To</div>
                        <div className="text-2xl font-bold text-gray-900">{travelRequest.destination}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelInfoBanner;
