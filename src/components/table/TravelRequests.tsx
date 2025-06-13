import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import DataTable from './DataTable';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface TravelRequest {
  [key: string]: any;
}

interface User {
  role: string;
  token: string;
  userEmail: string;
  userId: number;
  userName: string;
}

interface Header {
  key: string;
  displayName: string;
  sortable?: boolean;
  filterable?: boolean;
}

const TravelRequests: React.FC = () => {
  const navigate = useNavigate();
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [headers, setHeaders] = useState<Header[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>(''); // State for role
  const [statusOptions, setStatusOptions] = useState<string[]>([]); // State for status options

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

        const email = user.userEmail;
        const token = user.token;
        setRole(user.role); // Set the role state

        // Determine the API endpoint based on the user's role
        let apiUrl = '';
        if (user.role === 'admin') {
          apiUrl = 'https://xpress-deployment.onrender.com/api/TravelRequest/travelrequests';
        } else if (user.role === 'duhead') {
          apiUrl = `https://xpress-deployment.onrender.com/api/TravelRequest/ByDUH/${encodeURIComponent(email)}`;
        } else {
          apiUrl = `https://xpress-deployment.onrender.com/api/TravelRequest/ByProjectManager/${encodeURIComponent(email)}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch travel requests.');
        }

        const data = await response.json();

        // Handle response based on the role
        let travelRequestData: any[];
        if (user.role === 'admin') {
          if (!Array.isArray(data)) {
            throw new Error('Invalid API response format: Expected an array for admin role');
          }
          travelRequestData = data;
        } else {
          if (!data.isSuccess || !Array.isArray(data.result)) {
            throw new Error('Invalid API response format');
          }
          travelRequestData = data.result;
        }

        // Define the priority fields in the specified order
        const priorityFields = [
          { key: 'requestId', displayName: 'Request ID', sortable: true, filterable: true },
          { key: 'currentStatusName', displayName: 'Status', sortable: true, filterable: false },
          { key: 'travelType', displayName: 'Type', sortable: true, filterable: false },
          { key: 'isRoundTrip', displayName: 'Trip Type', sortable: true, filterable: true },
          { key: 'employeeName', displayName: 'Traveler', sortable: true, filterable: true },
          { key: 'destination', displayName: 'Destination', sortable: true, filterable: true },
          { key: 'source', displayName: 'Source', sortable: true, filterable: true },
          { key: 'outboundDepartureDate', displayName: 'Outbound Departure', sortable: true, filterable: true },
          { key: 'outboundArrivalDate', displayName: 'Outbound Arrival', sortable: true, filterable: true },
          { key: 'returnDepartureDate', displayName: 'Inbound Departure', sortable: true, filterable: true },
          { key: 'returnArrivalDate', displayName: 'Inbound Arrival', sortable: true, filterable: true },
          { key: 'duId', displayName: 'Department', sortable: true, filterable: true },
          { key: 'purposeOfTravel', displayName: 'Purpose', sortable: true, filterable: true },
          { key: 'comments', displayName: 'Comments', sortable: true, filterable: true },
        ];

        // Dynamically generate headers for remaining fields
        const dynamicHeaders: Header[] = [];
        const sampleItem = travelRequestData[0];
        if (sampleItem) {
          const priorityKeys = new Set(priorityFields.map(field => field.key));
          const excludedKeys = new Set([
            'isPickupRequired',
            'isDropoffRequired',
            'pickupPlace',
            'dropoffPlace',
            'isVegetarian',
            'attendedCct',
            'travelAgencyName',
            'totalExpense',
            'uploadedTicketPdfPath',
            'createdAt',
            'updatedAt',
            'outboundDepartureDate',
            'returnDepartureDate',
            'isInternational',
            'sourcePlace',
            'sourceCountry',
            'destinationPlace',
            'destinationCountry'
          ]);

          // Add remaining fields from the API response
          Object.keys(sampleItem).forEach((key) => {
            if (priorityKeys.has(key) || excludedKeys.has(key)) {
              return;
            }

            let displayName = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())
              .trim();

            if (key === 'projectName') displayName = 'Project Code';
            if (key === 'travelModeName') displayName = 'Travel Mode';
            if (key === 'projectManagerName') displayName = 'Manager';

            dynamicHeaders.push({
              key,
              displayName,
              sortable: true,
              filterable: true,
            });
          });

          dynamicHeaders.unshift(
            { key: 'travelDates', displayName: 'Travel Dates', sortable: true, filterable: false }
          );
        }

        setHeaders([...priorityFields, ...dynamicHeaders]);

        const mappedData: TravelRequest[] = travelRequestData.map((item: any) => {
          const convertUtcToIst = (utcDate: string | null): string | null => {
            if (!utcDate) return null;
            const date = parseISO(utcDate);
            const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
            const istDate = new Date(date.getTime() + istOffset);
            return format(istDate, 'dd-MM-yyyy');
          };

          const departureDateIst = convertUtcToIst(item.outboundDepartureDate);
          const returnDateIst = convertUtcToIst(item.returnDepartureDate);
          const outboundArrivalDateIst = convertUtcToIst(item.outboundArrivalDate);
          const returnArrivalDateIst = convertUtcToIst(item.returnArrivalDate);

          return {
            ...item,
            id: item.requestId,
            travelType: item.isInternational ? 'International' : 'Domestic',
            isRoundTrip: item.isRoundTrip ? 'Round Trip' : 'One Way',
            source: item.sourcePlace && item.sourceCountry ? `${item.sourcePlace}, ${item.sourceCountry}` : 'N/A',
            destination: item.destinationPlace && item.destinationCountry ? `${item.destinationPlace}, ${item.destinationCountry}` : 'N/A',
            travelDates: departureDateIst && returnDateIst 
              ? `${departureDateIst} - ${returnDateIst}` 
              : 'N/A',
            departureDate: item.outboundDepartureDate,
            returnDate: item.returnDepartureDate,
            outboundDepartureDate: departureDateIst || 'N/A',
            outboundArrivalDate: outboundArrivalDateIst || 'N/A',
            returnDepartureDate: returnDateIst || 'N/A',
            returnArrivalDate: returnArrivalDateIst || 'N/A',
            comments: item.comments || 'N/A',
            departmentCode: item.duId ? item.duId.toString() : 'N/A',
          };
        });

        // Extract all unique statuses from the data
        const uniqueStatuses = [...new Set(mappedData.map(item => item.currentStatusName))].filter(status => status != null).sort();
        setStatusOptions(uniqueStatuses);

        setTravelRequests(mappedData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch travel requests.');
        console.error('Error fetching travel requests:', err);
        setTravelRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelRequests();
  }, []);

  // Function to get the page title based on the user's role
  const getPageTitle = () => {
    if (!role) return 'Dashboard';
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`;
  };

  const getStatusColor = (status: string | undefined): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
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

  const getTripTypeColor = (tripType: string | undefined): string => {
    if (!tripType) return 'bg-gray-100 text-gray-800';
    return tripType === 'Round Trip' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
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
  };

  const handleRejectAction = (item: TravelRequest) => {
    console.log('Rejecting item:', item.id);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-blue-600">Great News !</h2>
        <p className="text-gray-600">You have no travel requests to be worried about</p>
      </div>
    );
  }

  if (travelRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-green-600">Great news!</h2>
        <p className="text-gray-600">There are no travel requests awaiting your approval.</p>
      </div>
    );
  }

  return (
    <DataTable<TravelRequest>
      headers={headers}
      data={travelRequests}
      title={getPageTitle()}
      searchableFields={['projectName', 'employeeName', 'source', 'destination']}
      statusOptions={statusOptions}
      typeOptions={['Domestic', 'International']}
      dateFilterKey="departureDate"
      getStatusColor={getStatusColor}
      getTypeColor={(type: string) =>
        type === 'Domestic' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
      }
      getTripTypeColor={getTripTypeColor}
      renderActions={(item: TravelRequest) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="View Details"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(item);
            }}
            data-testid={`view-details-${item.id}`}
          >
            <Eye size={18} />
          </button>
          {['PendingReview', 'DUApproved', 'OptionSelected'].includes(item.currentStatusName) && (
            <>
              <button
                className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                title="Approve"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApproveAction(item);
                }}
                data-testid={`approve-${item.id}`}
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
                data-testid={`reject-${item.id}`}
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