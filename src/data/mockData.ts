export interface TravelRequest {
  id: string;
  travelerName: string;
  travelType: 'Domestic' | 'International';
  departureDate: string;
  returnDate: string;
  destination: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  estimatedCost: number;
  transportationType: 'Flight' | 'Train' | 'Car Rental' | 'Other';
  accommodationType: 'Hotel' | 'Airbnb' | 'None' | 'Other';
  requestDate: string;
  departmentCode: string;
  managerName: string;
  priority: 'Low' | 'Medium' | 'High';
  timeline?: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'submission' | 'approval' | 'rejection' | 'modification' | 'completion';
  date: string;
  actor: string;
  description: string;
  details?: string;
}

export const mockTravelRequests: TravelRequest[] = [
  {
    id: 'TR-2023-001',
    travelerName: 'John Smith',
    travelType: 'Domestic',
    departureDate: '2023-06-15',
    returnDate: '2023-06-20',
    destination: 'New York, NY',
    purpose: 'Annual Marketing Conference',
    status: 'Approved',
    estimatedCost: 2500,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-05-20',
    departmentCode: 'MKT-01',
    managerName: 'Sarah Parker',
    priority: 'Medium',
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
        type: 'approval',
        date: '2023-05-22T10:00:00',
        actor: 'Sarah Parker',
        description: 'Request approved',
        details: 'Approved with standard travel policy compliance'
      }
    ]
  },
  {
    id: 'TR-2023-002',
    travelerName: 'Emily Johnson',
    travelType: 'International',
    departureDate: '2023-07-10',
    returnDate: '2023-07-17',
    destination: 'London, UK',
    purpose: 'Client Meeting',
    status: 'Pending',
    estimatedCost: 4800,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-01',
    departmentCode: 'SLS-03',
    managerName: 'Michael Davis',
    priority: 'High',
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
      }
    ]
  },
  {
    id: 'TR-2023-003',
    travelerName: 'Robert Chen',
    travelType: 'Domestic',
    departureDate: '2023-06-25',
    returnDate: '2023-06-27',
    destination: 'Chicago, IL',
    purpose: 'Regional Sales Meeting',
    status: 'Approved',
    estimatedCost: 1200,
    transportationType: 'Train',
    accommodationType: 'Hotel',
    requestDate: '2023-05-28',
    departmentCode: 'SLS-02',
    managerName: 'Sarah Parker',
    priority: 'Medium'
  },
  {
    id: 'TR-2023-004',
    travelerName: 'Lisa Wong',
    travelType: 'International',
    departureDate: '2023-08-05',
    returnDate: '2023-08-12',
    destination: 'Tokyo, Japan',
    purpose: 'Product Launch',
    status: 'Approved',
    estimatedCost: 6500,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-10',
    departmentCode: 'PRD-05',
    managerName: 'David Wilson',
    priority: 'High'
  },
  {
    id: 'TR-2023-005',
    travelerName: 'Michael Taylor',
    travelType: 'Domestic',
    departureDate: '2023-07-20',
    returnDate: '2023-07-22',
    destination: 'San Francisco, CA',
    purpose: 'Tech Conference',
    status: 'Rejected',
    estimatedCost: 1800,
    transportationType: 'Flight',
    accommodationType: 'Airbnb',
    requestDate: '2023-06-15',
    departmentCode: 'IT-02',
    managerName: 'Jennifer Lee',
    priority: 'Low'
  },
  {
    id: 'TR-2023-006',
    travelerName: 'Samantha Davis',
    travelType: 'Domestic',
    departureDate: '2023-06-30',
    returnDate: '2023-07-02',
    destination: 'Miami, FL',
    purpose: 'Client Meeting',
    status: 'Completed',
    estimatedCost: 1500,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-05-25',
    departmentCode: 'SLS-01',
    managerName: 'Michael Davis',
    priority: 'Medium'
  },
  {
    id: 'TR-2023-007',
    travelerName: 'David Wilson',
    travelType: 'International',
    departureDate: '2023-09-10',
    returnDate: '2023-09-15',
    destination: 'Paris, France',
    purpose: 'Industry Exhibition',
    status: 'Pending',
    estimatedCost: 4200,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-20',
    departmentCode: 'MKT-03',
    managerName: 'Sarah Parker',
    priority: 'Medium'
  },
  {
    id: 'TR-2023-008',
    travelerName: 'James Brown',
    travelType: 'Domestic',
    departureDate: '2023-07-05',
    returnDate: '2023-07-07',
    destination: 'Boston, MA',
    purpose: 'Training Workshop',
    status: 'Approved',
    estimatedCost: 1350,
    transportationType: 'Train',
    accommodationType: 'Hotel',
    requestDate: '2023-06-05',
    departmentCode: 'HR-01',
    managerName: 'Jennifer Lee',
    priority: 'Low'
  },
  {
    id: 'TR-2023-009',
    travelerName: 'Alex Martinez',
    travelType: 'International',
    departureDate: '2023-08-15',
    returnDate: '2023-08-20',
    destination: 'Berlin, Germany',
    purpose: 'Technology Summit',
    status: 'Pending',
    estimatedCost: 3800,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-25',
    departmentCode: 'IT-01',
    managerName: 'David Wilson',
    priority: 'High'
  },
  {
    id: 'TR-2023-010',
    travelerName: 'Jennifer Lee',
    travelType: 'Domestic',
    departureDate: '2023-07-12',
    returnDate: '2023-07-14',
    destination: 'Denver, CO',
    purpose: 'Team Building Retreat',
    status: 'Approved',
    estimatedCost: 1600,
    transportationType: 'Flight',
    accommodationType: 'Airbnb',
    requestDate: '2023-06-12',
    departmentCode: 'HR-02',
    managerName: 'Michael Davis',
    priority: 'Medium'
  },
  {
    id: 'TR-2023-011',
    travelerName: 'Sophie Miller',
    travelType: 'International',
    departureDate: '2023-09-05',
    returnDate: '2023-09-12',
    destination: 'Sydney, Australia',
    purpose: 'Global Partners Meeting',
    status: 'Pending',
    estimatedCost: 7200,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-28',
    departmentCode: 'BIZ-01',
    managerName: 'Sarah Parker',
    priority: 'High'
  },
  {
    id: 'TR-2023-012',
    travelerName: 'William Jackson',
    travelType: 'Domestic',
    departureDate: '2023-07-25',
    returnDate: '2023-07-28',
    destination: 'Seattle, WA',
    purpose: 'Industry Conference',
    status: 'Approved',
    estimatedCost: 1900,
    transportationType: 'Flight',
    accommodationType: 'Hotel',
    requestDate: '2023-06-15',
    departmentCode: 'ENG-02',
    managerName: 'David Wilson',
    priority: 'Medium'
  }
];

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
    dates: 'Jul 10 - Jul 17',
    traveler: 'Emily Johnson',
    status: 'Pending'
  },
  {
    id: 'TR-2023-008',
    destination: 'Boston, MA',
    dates: 'Jul 5 - Jul 7',
    traveler: 'James Brown',
    status: 'Approved'
  },
  {
    id: 'TR-2023-010',
    destination: 'Denver, CO',
    dates: 'Jul 12 - Jul 14',
    traveler: 'Jennifer Lee',
    status: 'Approved'
  },
  {
    id: 'TR-2023-012',
    destination: 'Seattle, WA',
    dates: 'Jul 25 - Jul 28',
    traveler: 'William Jackson',
    status: 'Approved'
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