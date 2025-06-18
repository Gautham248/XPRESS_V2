export interface ComponentTravelRequest {
  id: string;
  userId: number;
  outboundDepartureDate: string;
  returnDepartureDate: string;
  outboundArrivalDate?: string;
  returnArrivalDate?: string;
  purpose: string;
  submissionDate: string;
  transportation?: string;
  destination?: string;
  sourcePlace?: string;
  sourceCountry?: string;
  destinationCountry?: string;
  isAccommodationRequired?: boolean;
  isPickUpRequired?: boolean;
  isDropOffRequired?: boolean;
  pickupPlace?: string;
  dropoffPlace?: string;
  comments?: string;
  isVegetarian?: boolean;
  attendedCct?: boolean;
  travelAgencyName?: string;
  totalExpense?: number;
  ticketDocumentPath?: string;
  // ------------
  accommodationDocumentPath?: string; 
  insuranceDocumentPath?: string;
  // ------------
  updatedAt?: string;
  employeeName?: string;
  isInternational?: boolean;
  isRoundTrip?: boolean;
  projectName?: string;
  selectedTicketOptionId?: number;
  createdAt?: string;
  currentStatusId: number;
  status: 'PendingReview' | 'Approved' | 'OptionsListed' | 'OptionSelected' |
           'DUApproved' | 'BUApproved' | 'TicketsDispatched' | 'InTransit' |
           'Returned' | 'Closed' | 'Cancelled' | 'Rejected' | 'Modified';
}

export interface DocumentInfo {
  id: string;
  url: string;
  friendlyName: string;
  docData: any;
}

export const STATUS_ORDER_ARRAY: ReadonlyArray<ComponentTravelRequest['status']> = [
  'PendingReview','Approved','OptionsListed','OptionSelected','DUApproved','BUApproved','TicketsDispatched','InTransit','Returned','Closed','Cancelled','Rejected','Modified'
] as const;

export const INDEX_TO_STATUS_MAP: Readonly<Record<number, ComponentTravelRequest['status']>> =
  STATUS_ORDER_ARRAY.reduce((acc, status, index) => ({...acc, [index + 1]: status}), {} as Record<number, ComponentTravelRequest['status']>);

export const STATUS_TO_INDEX_MAP: Readonly<Record<ComponentTravelRequest['status'], number>> =
  STATUS_ORDER_ARRAY.reduce((acc, status, index) => ({...acc, [status]: index + 1}), {} as Record<ComponentTravelRequest['status'], number>);

export const STATUS_DISPLAY_NAMES_HEADER: Record<ComponentTravelRequest['status'] | string, string> = {
  PendingReview: 'Pending Review', Approved: 'Approved', OptionsListed: 'Options Listed', OptionSelected: 'Option Selected', DUApproved: 'DU Approved', BUApproved: 'BU Approved', TicketsDispatched: 'Ticket Dispatched', InTransit: 'In Transit', Returned: 'Returned', Closed: 'Closed', Cancelled: 'Cancelled', Rejected: 'Rejected', Modified: 'Modified',
};

export const getDisplayStatusName = (rawStatus?: ComponentTravelRequest['status'] | string): string => {
  if (rawStatus && typeof rawStatus === 'string') return STATUS_DISPLAY_NAMES_HEADER[rawStatus] || rawStatus.replace(/([A-Z])/g, ' $1').trim();
  return 'Status Unknown';
};

export const getStatusBadgeStyles = (status?: ComponentTravelRequest['status'] | string): string => {
    if (!status) return 'bg-gray-200 text-gray-800 border border-gray-400';
    switch (status) {
      case 'PendingReview': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Approved': return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'OptionsListed': return 'bg-indigo-100 text-indigo-700 border border-indigo-300';
      case 'OptionSelected': return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'DUApproved': case 'BUApproved': return 'bg-teal-100 text-teal-700 border border-teal-300';
      case 'TicketsDispatched': return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
      case 'InTransit': return 'bg-sky-100 text-sky-700 border border-sky-300';
      case 'Returned': return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'Closed': return 'bg-green-100 text-green-700 border border-green-300';
      case 'Cancelled': return 'bg-gray-300 text-gray-700 border border-gray-300';
      case 'Rejected': return 'bg-red-100 text-red-700 border border-red-300';
      case 'Modified': return 'bg-pink-100 text-pink-700 border border-pink-300';
      default: return 'bg-gray-200 text-gray-800 border border-gray-400';
    }
};

export interface TravelRequestApiResponse {
  isSuccess: boolean;
  result: Array<{
    requestId: string;
    employeeName: string;
    departmentName: string;
    projectCode: string;
    projectManager: string;
    travelModeName: string;
    sourcePlace: string;
    sourceCountry: string;
    destinationPlace: string;
    destinationCountry: string;
    phoneNumber: string;
  }>;
  statusCode: number;
  errorMessages: string[];
}

export interface TravelRequestData {
  requestId: string;
  travelerName: string;
  departmentCode: string;
  projectCode: string;
  projectManager: string;
  transportationType: string;
  source: string;
  destination: string;
  phoneNumber: string;
}

export interface TimelineStep {
  id: string;
  status: string;
  date: string;
  description: string;
  completed: boolean;
  active?: boolean;
  rejected?: boolean;
  isModified?: boolean;
}

export interface AirlineTicketData {
    travelAgencyName: string;
    agencyBookingCharge: number;
    totalExpense: number;
    pdfFilePath: string | null;
    airlines: {
        name: string;
        cost: number;
    }[];
}

export interface Airline {
    name: string;
    cost: string;
}


export interface ApiTravelRequestDetail {
  currentStatusId: number;
  transportation: string;
  uploadedTicketPdfPath?: string;
}

export interface TravelRequestDetailApiResponse {
  isSuccess: boolean;
  result: ApiTravelRequestDetail;
  statusCode: number;
  errorMessages: string[];
}

export interface ApiTicketOptionItem {
  optionId: number;
  requestId: string;
  createdByUserId: number;
  optionDescription: string;
  createdAt: string;
  isSelected: boolean;
}

export interface TicketOptionApiResponse {
  isSuccess: boolean;
  result: ApiTicketOptionItem[];
  statusCode: number;
  errorMessages: string[];
}

export interface AddTicketOptionPayload {
  optionDescription: string;
  createdByUserId: number;
}

export interface EditTicketOptionPayload {
  optionDescription: string;
}

export interface SelectTicketOptionPayload {
  selectingUserId: number;
  comments: string;
}