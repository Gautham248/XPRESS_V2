export interface TravelRequest {
  id: string;
  travelerName: string;
  travelType: 'Domestic' | 'International';
  departureDate: string;
  returnDate: string;
  source: string;
  destination: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Manager Approved' | 'Tickets Dispatched' | 'Tickets Selected' | 'DU Head Approved' | 'In-transit' | 'Returned' | 'Closed';
  estimatedCost: number;
  transportationType: 'Flight' | 'Train' | 'Car Rental' | 'Other';
  accommodationType: 'Hotel' | 'Airbnb' | 'None' | 'Other';
  requestDate: string;
  departmentCode: string;
  managerName: string;
  reportingManager: string;
  priority: 'Low' | 'Medium' | 'High';
  projectCode: string;
  timeline?: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'submission' | 'approval' | 'rejection' | 'modification' | 'completion' | 'managerApproval' | 'duHeadApproval' | 'ticketsSelected' | 'ticketsDispatched' | 'inTransit' | 'returned' | 'closed';
  date: string;
  actor: string;
  description: string;
  details?: string;
}

// Helper function to get status color
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Manager Approved':
      return 'bg-purple-100 text-purple-800';
    case 'Tickets Dispatched':
      return 'bg-green-100 text-green-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Tickets Selected':
      return 'bg-blue-100 text-blue-800';
    case 'DU Head Approved':
      return 'bg-indigo-100 text-indigo-800';
    case 'In-transit':
      return 'bg-orange-100 text-orange-800';
    case 'Returned':
      return 'bg-teal-100 text-teal-800';
    case 'Closed':
      return 'bg-gray-100 text-gray-800';
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Completed':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const mockTravelRequests: TravelRequest[] = [
  {
    id: 'TR-2023-001',
    travelerName: 'John Smith',
    travelType: 'Domestic',
    departureDate: '2025-02-15',
    returnDate: '2025-02-20',
    source: 'Los Angeles, CA',
    destination: 'New York, NY',
    purpose: 'Annual Marketing Conference',
    status: 'Manager Approved',
    estimatedCost: 2500,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-05-20',
    departmentCode: 'MKT-01',
    managerName: 'Sarah Parker',
    reportingManager: 'Sarah Parker',
    priority: 'Medium',
    projectCode: 'PRJ001',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-05-20T09:30:00',
        actor: 'John Smith',
        description: 'Travel request submitted',
        details: 'Initial submission for Marketing Conference'
      },
      {
        id: 'TL-002',
        type: 'modification',
        date: '2023-05-21T14:15:00',
        actor: 'John Smith',
        description: 'Updated accommodation details',
        details: 'Changed hotel preference to Marriott'
      },
      {
        id: 'TL-003',
        type: 'managerApproval',
        date: '2023-05-22T10:00:00',
        actor: 'Sarah Parker',
        description: 'Request approved by manager',
        details: 'Approved with standard travel policy compliance'
      }
    ]
  },
  {
    id: 'TR-2023-002',
    travelerName: 'Emily Johnson',
    travelType: 'International',
    departureDate: '2025-03-10',
    returnDate: '2025-03-17',
    source: 'New York, NY',
    destination: 'London, UK',
    purpose: 'Client Meeting',
    status: 'Tickets Selected',
    estimatedCost: 4800,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-01',
    departmentCode: 'SLS-03',
    managerName: 'Michael Davis',
    reportingManager: 'Michael Davis',
    priority: 'High',
    projectCode: 'PRJ002',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-01T11:20:00',
        actor: 'Emily Johnson',
        description: 'Travel request submitted',
        details: 'Initial submission for London client meeting'
      },
      {
        id: 'TL-002',
        type: 'modification',
        date: '2023-06-02T09:45:00',
        actor: 'Emily Johnson',
        description: 'Updated cost estimation',
        details: 'Adjusted budget due to currency exchange rates'
      },
      {
        id: 'TL-003',
        type: 'managerApproval',
        date: '2023-06-03T14:00:00',
        actor: 'Michael Davis',
        description: 'Request approved by manager',
        details: 'Approved with budget adjustments'
      },
      {
        id: 'TL-004',
        type: 'ticketsSelected',
        date: '2023-06-04T09:00:00',
        actor: 'Emily Johnson',
        description: 'Tickets selected',
        details: 'Selected flights for London trip'
      }
    ]
  },
  {
    id: 'TR-2023-003',
    travelerName: 'Robert Chen',
    travelType: 'Domestic',
    departureDate: '2025-02-25',
    returnDate: '2025-02-27',
    source: 'Atlanta, GA',
    destination: 'Chicago, IL',
    purpose: 'Regional Sales Meeting',
    status: 'Tickets Dispatched',
    estimatedCost: 1200,
    transportationType: 'Train',
    accommodationType: 'Hotel',
    requestDate: '2023-05-28',
    departmentCode: 'SLS-02',
    managerName: 'Sarah Parker',
    reportingManager: 'Sarah Parker',
    priority: 'Medium',
    projectCode: 'PRJ003',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-05-28T10:00:00',
        actor: 'Robert Chen',
        description: 'Travel request submitted',
        details: 'Initial submission for Regional Sales Meeting'
      },
      {
        id: 'TL-002',
        type: 'managerApproval',
        date: '2023-05-29T15:30:00',
        actor: 'Sarah Parker',
        description: 'Request approved by manager',
        details: 'Approved with standard policy compliance'
      },
      {
        id: 'TL-003',
        type: 'ticketsSelected',
        date: '2023-05-30T09:00:00',
        actor: 'Robert Chen',
        description: 'Tickets selected',
        details: 'Selected train tickets for Chicago'
      },
      {
        id: 'TL-004',
        type: 'ticketsDispatched',
        date: '2023-05-31T11:00:00',
        actor: 'Travel Desk',
        description: 'Tickets dispatched',
        details: 'Train tickets dispatched to traveler'
      }
    ]
  },
  {
    id: 'TR-2023-004',
    travelerName: 'Lisa Wong',
    travelType: 'International',
    departureDate: '2025-04-05',
    returnDate: '2025-04-12',
    source: 'San Francisco, CA',
    destination: 'Tokyo, Japan',
    purpose: 'Product Launch',
    status: 'DU Head Approved',
    estimatedCost: 6500,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-10',
    departmentCode: 'PRD-05',
    managerName: 'David Wilson',
    reportingManager: 'David Wilson',
    priority: 'High',
    projectCode: 'PRJ004',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-10T08:00:00',
        actor: 'Lisa Wong',
        description: 'Travel request submitted',
        details: 'Initial submission for Product Launch in Tokyo'
      },
      {
        id: 'TL-002',
        type: 'modification',
        date: '2023-06-11T13:00:00',
        actor: 'Lisa Wong',
        description: 'Updated travel dates',
        details: 'Extended return date by 2 days'
      },
      {
        id: 'TL-003',
        type: 'managerApproval',
        date: '2023-06-12T10:00:00',
        actor: 'David Wilson',
        description: 'Request approved by manager',
        details: 'Approved with extended travel dates'
      },
      {
        id: 'TL-004',
        type: 'duHeadApproval',
        date: '2023-06-13T09:00:00',
        actor: 'David Wilson',
        description: 'Request approved by DU Head',
        details: 'Final approval for international travel'
      }
    ]
  },
  {
    id: 'TR-2023-005',
    travelerName: 'Michael Taylor',
    travelType: 'Domestic',
    departureDate: '2025-03-20',
    returnDate: '2025-03-22',
    source: 'Boston, MA',
    destination: 'San Francisco, CA',
    purpose: 'Tech Conference',
    status: 'Rejected',
    estimatedCost: 1800,
    transportationType: 'Flight',
    accommodationType: 'Airbnb',
    requestDate: '2023-06-15',
    departmentCode: 'IT-02',
    managerName: 'Jennifer Lee',
    reportingManager: 'Jennifer Lee',
    priority: 'Low',
    projectCode: 'PRJ005',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-15T09:00:00',
        actor: 'Michael Taylor',
        description: 'Travel request submitted',
        details: 'Initial submission for Tech Conference'
      },
      {
        id: 'TL-002',
        type: 'rejection',
        date: '2023-06-16T14:00:00',
        actor: 'Jennifer Lee',
        description: 'Request rejected by manager',
        details: 'Rejected due to budget constraints'
      }
    ]
  },
  {
    id: 'TR-2023-006',
    travelerName: 'Samantha Davis',
    travelType: 'Domestic',
    departureDate: '2025-02-20',
    returnDate: '2025-02-22',
    source: 'Houston, TX',
    destination: 'Miami, FL',
    purpose: 'Client Meeting',
    status: 'Closed',
    estimatedCost: 1500,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-05-25',
    departmentCode: 'SLS-01',
    managerName: 'Michael Davis',
    reportingManager: 'Michael Davis',
    priority: 'Medium',
    projectCode: 'PRJ006',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-05-25T10:00:00',
        actor: 'Samantha Davis',
        description: 'Travel request submitted',
        details: 'Initial submission for Client Meeting'
      },
      {
        id: 'TL-002',
        type: 'managerApproval',
        date: '2023-05-26T15:00:00',
        actor: 'Michael Davis',
        description: 'Request approved by manager',
        details: 'Approved for client meeting'
      },
      {
        id: 'TL-003',
        type: 'ticketsSelected',
        date: '2023-05-27T09:00:00',
        actor: 'Samantha Davis',
        description: 'Tickets selected',
        details: 'Selected flights to Miami'
      },
      {
        id: 'TL-004',
        type: 'ticketsDispatched',
        date: '2023-05-28T11:00:00',
        actor: 'Travel Desk',
        description: 'Tickets dispatched',
        details: 'Flight tickets dispatched to traveler'
      },
      {
        id: 'TL-005',
        type: 'inTransit',
        date: '2023-06-30T08:00:00',
        actor: 'System',
        description: 'Traveler in transit',
        details: 'Departed for Miami'
      },
      {
        id: 'TL-006',
        type: 'returned',
        date: '2023-07-02T18:00:00',
        actor: 'System',
        description: 'Traveler returned',
        details: 'Returned from Miami'
      },
      {
        id: 'TL-007',
        type: 'closed',
        date: '2023-07-03T09:00:00',
        actor: 'Michael Davis',
        description: 'Request closed',
        details: 'Travel request closed after completion'
      }
    ]
  },
  {
    id: 'TR-2023-007',
    travelerName: 'David Wilson',
    travelType: 'International',
    departureDate: '2025-05-10',
    returnDate: '2025-05-15',
    source: 'Chicago, IL',
    destination: 'Paris, France',
    purpose: 'Industry Exhibition',
    status: 'Pending',
    estimatedCost: 4200,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-20',
    departmentCode: 'MKT-03',
    managerName: 'Sarah Parker',
    reportingManager: 'Sarah Parker',
    priority: 'Medium',
    projectCode: 'PRJ007',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-20T09:00:00',
        actor: 'David Wilson',
        description: 'Travel request submitted',
        details: 'Initial submission for Industry Exhibition'
      }
    ]
  },
  {
    id: 'TR-2023-008',
    travelerName: 'James Brown',
    travelType: 'Domestic',
    departureDate: '2025-03-05',
    returnDate: '2025-03-07',
    source: 'Philadelphia, PA',
    destination: 'Boston, MA',
    purpose: 'Training Workshop',
    status: 'In-transit',
    estimatedCost: 1350,
    transportationType: 'Train',
    accommodationType: 'Hotel',
    requestDate: '2023-06-05',
    departmentCode: 'HR-01',
    managerName: 'Jennifer Lee',
    reportingManager: 'Jennifer Lee',
    priority: 'Low',
    projectCode: 'PRJ008',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-05T10:00:00',
        actor: 'James Brown',
        description: 'Travel request submitted',
        details: 'Initial submission for Training Workshop'
      },
      {
        id: 'TL-002',
        type: 'managerApproval',
        date: '2023-06-06T14:00:00',
        actor: 'Jennifer Lee',
        description: 'Request approved by manager',
        details: 'Approved for training workshop'
      },
      {
        id: 'TL-003',
        type: 'ticketsSelected',
        date: '2023-06-07T09:00:00',
        actor: 'James Brown',
        description: 'Tickets selected',
        details: 'Selected train tickets to Boston'
      },
      {
        id: 'TL-004',
        type: 'ticketsDispatched',
        date: '2023-06-08T11:00:00',
        actor: 'Travel Desk',
        description: 'Tickets dispatched',
        details: 'Train tickets dispatched to traveler'
      },
      {
        id: 'TL-005',
        type: 'inTransit',
        date: '2023-07-05T08:00:00',
        actor: 'System',
        description: 'Traveler in transit',
        details: 'Departed for Boston'
      }
    ]
  },
  {
    id: 'TR-2023-009',
    travelerName: 'Alex Martinez',
    travelType: 'International',
    departureDate: '2025-04-15',
    returnDate: '2025-04-20',
    source: 'Miami, FL',
    destination: 'Berlin, Germany',
    purpose: 'Technology Summit',
    status: 'Tickets Selected',
    estimatedCost: 3800,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-25',
    departmentCode: 'IT-01',
    managerName: 'David Wilson',
    reportingManager: 'David Wilson',
    priority: 'High',
    projectCode: 'PRJ009',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-25T09:00:00',
        actor: 'Alex Martinez',
        description: 'Travel request submitted',
        details: 'Initial submission for Technology Summit'
      },
      {
        id: 'TL-002',
        type: 'managerApproval',
        date: '2023-06-26T14:00:00',
        actor: 'David Wilson',
        description: 'Request approved by manager',
        details: 'Approved for Technology Summit'
      },
      {
        id: 'TL-003',
        type: 'ticketsSelected',
        date: '2023-06-27T09:00:00',
        actor: 'Alex Martinez',
        description: 'Tickets selected',
        details: 'Selected flights to Berlin'
      }
    ]
  },
  {
    id: 'TR-2023-010',
    travelerName: 'Jennifer Lee',
    travelType: 'Domestic',
    departureDate: '2025-03-12',
    returnDate: '2025-03-14',
    source: 'Portland, OR',
    destination: 'Denver, CO',
    purpose: 'Team Building Retreat',
    status: 'Returned',
    estimatedCost: 1600,
    transportationType: 'Flight',
    accommodationType: 'Airbnb',
    requestDate: '2023-06-12',
    departmentCode: 'HR-02',
    managerName: 'Michael Davis',
    reportingManager: 'Michael Davis',
    priority: 'Medium',
    projectCode: 'PRJ010',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-12T09:00:00',
        actor: 'Jennifer Lee',
        description: 'Travel request submitted',
        details: 'Initial submission for Team Building Retreat'
      },
      {
        id: 'TL-002',
        type: 'managerApproval',
        date: '2023-06-13T14:00:00',
        actor: 'Michael Davis',
        description: 'Request approved by manager',
        details: 'Approved for team building retreat'
      },
      {
        id: 'TL-003',
        type: 'ticketsSelected',
        date: '2023-06-14T09:00:00',
        actor: 'Jennifer Lee',
        description: 'Tickets selected',
        details: 'Selected flights to Denver'
      },
      {
        id: 'TL-004',
        type: 'ticketsDispatched',
        date: '2023-06-15T11:00:00',
        actor: 'Travel Desk',
        description: 'Tickets dispatched',
        details: 'Flight tickets dispatched to traveler'
      },
      {
        id: 'TL-005',
        type: 'inTransit',
        date: '2023-07-12T08:00:00',
        actor: 'System',
        description: 'Traveler in transit',
        details: 'Departed for Denver'
      },
      {
        id: 'TL-006',
        type: 'returned',
        date: '2023-07-14T18:00:00',
        actor: 'System',
        description: 'Traveler returned',
        details: 'Returned from Denver'
      }
    ]
  },
  {
    id: 'TR-2023-011',
    travelerName: 'Sophie Miller',
    travelType: 'International',
    departureDate: '2025-05-05',
    returnDate: '2025-05-12',
    source: 'Los Angeles, CA',
    destination: 'Sydney, Australia',
    purpose: 'Global Partners Meeting',
    status: 'Pending',
    estimatedCost: 7200,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-28',
    departmentCode: 'BIZ-01',
    managerName: 'Sarah Parker',
    reportingManager: 'Sarah Parker',
    priority: 'High',
    projectCode: 'PRJ011',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-28T09:00:00',
        actor: 'Sophie Miller',
        description: 'Travel request submitted',
        details: 'Initial submission for Global Partners Meeting'
      }
    ]
  },
  {
    id: 'TR-2023-012',
    travelerName: 'William Jackson',
    travelType: 'Domestic',
    departureDate: '2025-03-25',
    returnDate: '2025-03-28',
    source: 'Austin, TX',
    destination: 'Seattle, WA',
    purpose: 'Industry Conference',
    status: 'Tickets Dispatched',
    estimatedCost: 1900,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-15',
    departmentCode: 'ENG-02',
    managerName: 'David Wilson',
    reportingManager: 'David Wilson',
    priority: 'Medium',
    projectCode: 'PRJ012',
    timeline: [
      {
        id: 'TL-001',
        type: 'submission',
        date: '2023-06-15T09:00:00',
        actor: 'William Jackson',
        description: 'Travel request submitted',
        details: 'Initial submission for Industry Conference'
      },
      {
        id: 'TL-002',
        type: 'managerApproval',
        date: '2023-06-16T14:00:00',
        actor: 'David Wilson',
        description: 'Request approved by manager',
        details: 'Approved for industry conference'
      },
      {
        id: 'TL-003',
        type: 'ticketsSelected',
        date: '2023-06-17T09:00:00',
        actor: 'William Jackson',
        description: 'Tickets selected',
        details: 'Selected flights to Seattle'
      },
      {
        id: 'TL-004',
        type: 'ticketsDispatched',
        date: '2023-06-18T11:00:00',
        actor: 'Travel Desk',
        description: 'Tickets dispatched',
        details: 'Flight tickets dispatched to traveler'
      }
    ]
  }
];

// The rest of the file remains unchanged
export interface DashboardStat {
  label: string;
  value: number;
  changePercent: number;
  icon: string;
}

export const dashboardStats: DashboardStat[] = [
  {
    label: 'Total Requests',
    value: 142,
    changePercent: 12,
    icon: 'Briefcase'
  },
  {
    label: 'Pending Approvals',
    value: 15,
    changePercent: -5,
    icon: 'Clock'
  },
  {
    label: 'This Month Trips',
    value: 38,
    changePercent: 23,
    icon: 'Plane'
  },
  {
    label: 'Monthly Budget',
    value: 85400,
    changePercent: 8,
    icon: 'DollarSign'
  }
];

export interface UpcomingTrip {
  id: string;
  destination: string;
  dates: string;
  traveler: string;
  status: string;
}

export const upcomingTrips: UpcomingTrip[] = [
  {
    id: 'TR-2023-002',
    destination: 'London, UK',
    dates: 'Mar 10 - Mar 17',
    traveler: 'Emily Johnson',
    status: 'Tickets Selected'
  },
  {
    id: 'TR-2023-008',
    destination: 'Boston, MA',
    dates: 'Mar 05 - Mar 07',
    traveler: 'James Brown',
    status: 'In-transit'
  },
  {
    id: 'TR-2023-010',
    destination: 'Denver, CO',
    dates: 'Mar 12 - Mar 14',
    traveler: 'Jennifer Lee',
    status: 'Returned'
  },
  {
    id: 'TR-2023-012',
    destination: 'Seattle, WA',
    dates: 'Mar 25 - Mar 28',
    traveler: 'William Jackson',
    status: 'Tickets Dispatched'
  }
];

export interface TravelExpense {
  month: string;
  domestic: number;
  international: number;
}

export const travelExpensesByMonth: TravelExpense[] = [
  { month: 'Jan', domestic: 15200, international: 23400 },
  { month: 'Feb', domestic: 12800, international: 18700 },
  { month: 'Mar', domestic: 21300, international: 32500 },
  { month: 'Apr', domestic: 18500, international: 27600 },
  { month: 'May', domestic: 24700, international: 41200 },
  { month: 'Jun', domestic: 28300, international: 38900 }
];

export interface TopDestination {
  destination: string;
  count: number;
  percentOfTotal: number;
}

export const topDestinations: TopDestination[] = [
  { destination: 'New York, NY', count: 32, percentOfTotal: 22.5 },
  { destination: 'San Francisco, CA', count: 24, percentOfTotal: 16.9 },
  { destination: 'London, UK', count: 18, percentOfTotal: 12.7 },
  { destination: 'Chicago, IL', count: 15, percentOfTotal: 10.6 },
  { destination: 'Tokyo, Japan', count: 12, percentOfTotal: 8.5 }
];