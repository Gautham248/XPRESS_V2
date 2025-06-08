import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  returnDate: string;
}

const TravelRequests: React.FC = () => {
  const navigate = useNavigate();
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
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
  ];

  useEffect(() => {
    const fetchTravelRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5030/api/TravelRequest/ByProjectManager/nithu.kb%40experionglobal.com', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any necessary authorization headers, e.g., 'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.isSuccess && Array.isArray(data.result)) {
          const mappedData: TravelRequest[] = data.result.map((item: any) => ({
            id: item.requestId,
            status: item.currentStatusName,
            travelerName: item.employeeName,
            projectCode: item.projectName,
            travelType: item.isInternational ? 'International' : 'Domestic',
            source: `${item.sourcePlace}, ${item.sourceCountry}`,
            destination: `${item.destinationPlace}, ${item.destinationCountry}`,
            travelDates: `${item.outboundDepartureDate} - ${item.returnDepartureDate}`,
            departureDate: item.outboundDepartureDate,
            returnDate: item.returnDepartureDate,
            departmentCode: 'Unknown', // API response doesn't provide this; adjust as needed
            reportingManager: 'Unknown', // API response doesn't provide this; adjust as needed
          }));
          setTravelRequests(mappedData);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        setError('Failed to fetch travel requests. Please try again later.');
        console.error('Error fetching travel requests:', err);
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
      searchableFields={['travelerName', 'destination', 'id', 'projectCode', 'source']}
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












// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import DataTable from './DataTable'; // Assuming DataTable.tsx is in the same directory or correct path
// import { mockTravelRequests, TravelRequest, getStatusColor } from '../../data/mockData';
// import { Eye, CheckCircle, XCircle } from 'lucide-react'; // Import the icons you need

// const TravelRequests: React.FC = () => {
//   const navigate = useNavigate();

//   const headers = [
//     { key: 'id', displayName: 'Request ID', sortable: true, filterable: true },
//     { key: 'status', displayName: 'Status', sortable: true, filterable: true },
//     { key: 'travelerName', displayName: 'Traveler', sortable: true, filterable: true },
//     { key: 'projectCode', displayName: 'Project Code', sortable: true, filterable: true },
//     { key: 'travelType', displayName: 'Type', sortable: true },
//     { key: 'source', displayName: 'Source', sortable: true, filterable: true },
//     { key: 'destination', displayName: 'Destination', sortable: true, filterable: true },
//     { key: 'travelDates', displayName: 'Travel Dates', sortable: true },
//     { key: 'departmentCode', displayName: 'Department', sortable: true },
//     { key: 'reportingManager', displayName: 'Manager', sortable: true },
//   ];

//   const handleRowClick = (item: TravelRequest) => {
//     const userString = localStorage.getItem('user');
//     const user = userString ? JSON.parse(userString) : null;
//     if (!user) return;

//     const path = window.location.pathname;
//     let basePath = '';
//     if (user.role === 'admin') {
//       basePath = '/admin/travel-requests';
//     } else  {
//       basePath = path.includes('team-requests') ? '/manager/team-requests' : '/manager/my-requests';
//     } 
//     navigate(`${basePath}/${item.id}`); 
//   };

//   const handleApproveAction = (item: TravelRequest) => {
//     console.log("Approving item:", item.id);
//     // Add your approval logic here
//   };

//   const handleRejectAction = (item: TravelRequest) => {
//     console.log("Rejecting item:", item.id);
//     // Add your rejection logic here
//   };

//   return (
//     <DataTable<TravelRequest>
//       headers={headers}
//       data={mockTravelRequests}
//       title="Travel Requests"
//       searchableFields={['travelerName', 'destination', 'id', 'projectCode', 'source']}
//       statusOptions={[
//         'Pending',
//         'Approved',
//         'Rejected',
//         'Completed',
//         'Manager Approved',
//         'Tickets Dispatched',
//         'Tickets Selected',
//         'DU Head Approved',
//         'In-transit',
//         'Returned',
//         'Closed',
//       ]}
//       typeOptions={['Domestic', 'International']}
//       dateFilterKey="departureDate"
//       newButtonLabel="New Request"
//       newButtonPath="/create-request"
//       getStatusColor={getStatusColor}
//       getTypeColor={(type: string) =>
//         type === 'Domestic' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
//       }
//       renderActions={(item: TravelRequest) => (
//         <div className="flex items-center justify-end gap-1.5">
//           <button 
//             className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
//             title="View Details" // Tooltip text
//             onClick={(e) => {
//               e.stopPropagation();
//               handleRowClick(item);
//             }}
//           >
//             <Eye size={18} />
//           </button>

//           {/* Conditionally render Approve/Reject based on status */}
//           {/* Adjust these conditions based on your application's workflow */}
//           {['Pending', 'Manager Approved', 'DU Head Approved', 'Tickets Selected'].includes(item.status) && (
//             <>
//               <button 
//                 className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
//                 title="Approve" // Tooltip text
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleApproveAction(item); 
//                 }}
//               >
//                 <CheckCircle size={18} />
//               </button>
//               <button 
//                 className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
//                 title="Reject" // Tooltip text
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleRejectAction(item);
//                 }}
//               >
//                 <XCircle size={18} />
//               </button>
//             </>
//           )}
//           {/* Edit button has been removed */}
//         </div>
//       )}
//       onRowClick={handleRowClick}
//     />
//   );
// };

// export default TravelRequests;