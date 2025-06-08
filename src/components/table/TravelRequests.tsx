import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import DataTable from './DataTable';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface TravelRequest {
  id: string;
  status: string;
  travelerName: string;
  projectCode: string;
  travelType: string;
  source: string;
  destination: string;
  travelDates: string;
  departmentCode: string;
  reportingManager: string;
  departureDate: string;
  returnDate: string | null;
  purposeOfTravel: string;
  isAccommodationRequired: boolean;
  isPickupRequired: boolean;
  isDropoffRequired: boolean;
  comments: string;
  isVegetarian: boolean;
  attendedCct: boolean;
  travelModeName: string;
}

interface User {
  role: string;
  token: string;
  userEmail: string;
  userId: number;
  userName: string;
}

const TravelRequests: React.FC = () => {
  const navigate = useNavigate();
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const headers = [
    { key: 'id', displayName: 'Request ID', sortable: true, filterable: true },
    { key: 'status', displayName: 'Status', sortable: true, filterable: true },
    { key: 'travelerName', displayName: 'Traveler', sortable: true, filterable: true },
    { key: 'projectCode', displayName: 'Project Code', sortable: true, filterable: true },
    { key: 'travelType', displayName: 'Type', sortable: true },
    { key: 'source', displayName: 'Source', sortable: true, filterable: true },
    { key: 'destination', displayName: 'Destination', sortable: true, filterable: true },
    { key: 'travelDates', displayName: 'Travel Dates', sortable: true },
    { key: 'departmentCode', displayName: 'Department', sortable: true },
    { key: 'reportingManager', displayName: 'Manager', sortable: true },
    { key: 'purposeOfTravel', displayName: 'Purpose', sortable: true, filterable: true },
    { key: 'isAccommodationRequired', displayName: 'Accommodation', sortable: true },
    { key: 'isPickupRequired', displayName: 'Pickup', sortable: true },
    { key: 'isDropoffRequired', displayName: 'Dropoff', sortable: true },
    { key: 'comments', displayName: 'Comments', sortable: true, filterable: true },
    { key: 'isVegetarian', displayName: 'Vegetarian', sortable: true },
    { key: 'attendedCct', displayName: 'Attended CCT', sortable: true },
    { key: 'travelModeName', displayName: 'Travel Mode', sortable: true, filterable: true },
  ];

  useEffect(() => {
    const fetchTravelRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve user data from local storage
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('User data not found in local storage. Please log in again.');
        }

        const user: User = JSON.parse(userString);
        if (!user?.userEmail || !user?.token) {
          throw new Error('User email or token not found in local storage.');
        }

        const email = user.userEmail; // "advait.kumar@experionglobal.com"
        const token = user.token;

        const response = await fetch(
          `http://localhost:5030/api/TravelRequest/ByProjectManager/${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.isSuccess && Array.isArray(data.result)) {
          const mappedData: TravelRequest[] = data.result.map((item: any) => {
            // Convert UTC dates to IST
            const convertUtcToIst = (utcDate: string | null): Date | null => {
              if (!utcDate) return null;
              const date = parseISO(utcDate);
              const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
              return new Date(date.getTime() + istOffset);
            };

            const departureDateIst = convertUtcToIst(item.outboundDepartureDate);
            const returnDateIst = convertUtcToIst(item.returnDepartureDate);

            return {
              id: item.requestId,
              status: item.currentStatusName,
              travelerName: item.employeeName,
              projectCode: item.projectName,
              travelType: item.isInternational ? 'International' : 'Domestic',
              source: `${item.sourcePlace}, ${item.sourceCountry}`,
              destination: `${item.destinationPlace}, ${item.destinationCountry}`,
              travelDates: `${departureDateIst ? format(departureDateIst, 'MMM dd, yyyy') : 'N/A'} - ${
                returnDateIst ? format(returnDateIst, 'MMM dd, yyyy') : 'N/A'
              }`,
              departureDate: item.outboundDepartureDate,
              returnDate: item.returnDepartureDate,
              departmentCode: item.duId.toString(),
              reportingManager: item.projectManagerName,
              purposeOfTravel: item.purposeOfTravel,
              isAccommodationRequired: item.isAccommodationRequired,
              isPickupRequired: item.isPickupRequired,
              isDropoffRequired: item.isDropoffRequired,
              comments: item.comments || 'N/A',
              isVegetarian: item.isVegetarian,
              attendedCct: item.attendedCct,
              travelModeName: item.travelModeName,
            };
          });
          setTravelRequests(mappedData);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch travel requests. Please try again later.');
        console.error('Error fetching travel requests:', err);
        setTravelRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelRequests();
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pendingreview':
        return 'bg-yellow-100 text-yellow-800';
      case 'duapproved':
        return 'bg-blue-100 text-blue-800';
      case 'optionselected':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRowClick = (item: TravelRequest) => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    if (!user) return;

    const path = window.location.pathname;
    let basePath = '';
    if (user.role === 'admin') {
      basePath = '/admin/travel-requests';
    } else {
      basePath = path.includes('team-requests') ? '/manager/team-requests' : '/manager/my-requests';
    }
    navigate(`${basePath}/${item.id}`);
  };

  const handleApproveAction = (item: TravelRequest) => {
    console.log('Approving item:', item.id);
    // Add your approval logic here, e.g., API call to update status
  };

  const handleRejectAction = (item: TravelRequest) => {
    console.log('Rejecting item:', item.id);
    // Add your rejection logic here, e.g., API call to update status
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <DataTable<TravelRequest>
      headers={headers}
      data={travelRequests}
      title="Travel Requests"
      searchableFields={['travelerName', 'destination', 'id', 'projectCode', 'source', 'purposeOfTravel', 'comments', 'travelModeName']}
      statusOptions={['PendingReview', 'DUApproved', 'OptionSelected', 'Rejected']}
      typeOptions={['Domestic', 'International']}
      dateFilterKey="departureDate"
      newButtonLabel="New Request"
      newButtonPath="/create-request"
      getStatusColor={getStatusColor}
      getTypeColor={(type: string) =>
        type === 'Domestic' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
      }
      renderActions={(item: TravelRequest) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="View Details"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(item);
            }}
          >
            <Eye size={18} />
          </button>
          {['PendingReview', 'DUApproved', 'OptionSelected'].includes(item.status) && (
            <>
              <button
                className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                title="Approve"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveAction(item);
                }}
              >
                <CheckCircle size={18} />
              </button>
              <button
                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Reject"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectAction(item);
                }}
              >
                <XCircle size={18} />
              </button>
            </>
          )}
        </div>
      )}
      onRowClick={handleRowClick}
    />
  );
};

export default TravelRequests;