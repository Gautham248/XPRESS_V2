import React from 'react';
import { 
  User, 
  Building, 
  Calendar, 
  Plane, 
  Tag, 
  DollarSign,
  Briefcase // Added for projectCode
} from 'lucide-react';
import { TravelRequest } from '../../data/mockData';

interface TravelRequestInfoProps {
  travelRequest: TravelRequest;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}

const TravelRequestInfo: React.FC<TravelRequestInfoProps> = ({
  travelRequest,
  getStatusColor,
  getPriorityColor,
}) => {
  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-6">Travel Request Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <div className="flex items-center">
              <span 
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(travelRequest.status)}`}
              >
                {travelRequest.status}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Traveler</p>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{travelRequest.travelerName}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Department</p>
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{travelRequest.departmentCode}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Manager</p>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{travelRequest.managerName}</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Request Date</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{travelRequest.requestDate}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Project Code</p>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{travelRequest.projectCode}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Travel Type</p>
            <div className="flex items-center">
              <Plane className="h-4 w-4 mr-2 text-muted-foreground" />
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  travelRequest.travelType === 'Domestic' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-secondary/10 text-secondary'
                }`}
              >
                {travelRequest.travelType}
              </span>
            </div>
          </div>
          
          {/* <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Priority</p>
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(travelRequest.priority)}`}
              >
                {travelRequest.priority}
              </span>
            </div>
          </div> */}
{/*           
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Estimated Cost</p>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">${travelRequest.estimatedCost.toLocaleString()}</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default TravelRequestInfo;