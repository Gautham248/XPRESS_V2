import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import TravelInfo from '../TravelInfo';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// --- Test Data ---
const mockApiSuccessResultItem = {
  requestId: 'REQ001',
  outboundDepartureDate: '2023-10-01T10:00:00Z',
  outboundArrivalDate: '2023-10-01T12:00:00Z',
  returnDepartureDate: '2023-10-05T15:00:00Z',
  returnArrivalDate: '2023-10-05T17:00:00Z',
  transportation: 'Flight',
  isInternational: true,
  requestCreateDate: '2023-09-15T09:00:00Z',
  purposeOfTravel: 'Business Meeting',
  isAccommodationRequired: true,
  isVegetarian: false,
  isDropOffRequired: true,
  isPickUpRequired: true,
};

const mockApiSuccessResponse = {
  data: {
    isSuccess: true,
    result: [mockApiSuccessResultItem],
    statusCode: 200,
    errorMessages: [],
  },
};

const mockApiSuccessResponseNoReturn = {
  data: {
    isSuccess: true,
    result: [{ ...mockApiSuccessResultItem, returnDepartureDate: null, returnArrivalDate: null }],
    statusCode: 200,
    errorMessages: [],
  },
};

const mockApiSuccessResponseNoData = {
  data: {
    isSuccess: true,
    result: [],
    statusCode: 200,
    errorMessages: [],
  },
};

const mockApiErrorResponse = {
  data: {
    isSuccess: false,
    result: [],
    statusCode: 404,
    errorMessages: ['Travel info not found via API'],
  },
};

const mockNetworkError = new AxiosError(
    'Network Error',
    undefined,
    { headers: new AxiosHeaders() } as any,
    {},
    undefined
);


describe('TravelInfo Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    jest.useRealTimers();
  });

  test('displays loading state initially and then data on successful fetch', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockApiSuccessResponse);
    render(<TravelInfo requestId="REQ001" />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Business Meeting')).toBeInTheDocument());
    expect(screen.getByTestId('travel-info-success')).toBeInTheDocument();
    expect(screen.getByTestId('flight-icon')).toBeInTheDocument(); // Check specific icon
  });

  test('displays "-" for null return dates', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockApiSuccessResponseNoReturn);
    render(<TravelInfo requestId="REQ_NO_RETURN" />);
    await waitFor(() => expect(screen.getByText('Business Meeting')).toBeInTheDocument());
    const returnDepartureLabel = screen.getByText('Return Departure');
    const returnDepartureValue = returnDepartureLabel.parentElement?.querySelector('p.font-medium.text-gray-900');
    
    const returnArrivalLabel = screen.getByText('Return Arrival');
    const returnArrivalValue = returnArrivalLabel.parentElement?.querySelector('p.font-medium.text-gray-900');

    expect(returnDepartureValue).toHaveTextContent('-');
    expect(returnArrivalValue).toHaveTextContent('-');
  });

  test('displays error state when no requestId is provided', () => {
    render(<TravelInfo />);
    expect(screen.getByTestId('error-message-container')).toBeInTheDocument();
    expect(screen.getByText('Request ID is not provided.')).toBeInTheDocument();
  });

  test('displays error state on API failure', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockApiErrorResponse);
    render(<TravelInfo requestId="REQ_API_ERROR" />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('error-message-container')).toBeInTheDocument());
    expect(screen.getByText(/Travel info not found via API/i)).toBeInTheDocument();
  });

  test('displays error state on network error', async () => {
    mockedAxios.get.mockRejectedValueOnce(mockNetworkError);
    render(<TravelInfo requestId="REQ_NETWORK_ERROR" />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('error-message-container')).toBeInTheDocument());
    expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
  });

  test('displays "Travel request details not found." when API success but empty result', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockApiSuccessResponseNoData);
    render(<TravelInfo requestId="REQ_EMPTY_RESULT" />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('error-message-container')).toBeInTheDocument());
    expect(screen.getByText('Travel request details not found.')).toBeInTheDocument();
  });

  test('displays "No travel information available" as a fallback when no data and no specific error', async () => {
    mockedAxios.get.mockImplementationOnce(async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); 
      return Promise.resolve({ data: { isSuccess: false, result: null, errorMessages: [] }}); 
    });
    render(<TravelInfo requestId="REQ_UNHANDLED_NO_DATA" />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('error-message-container')).toBeInTheDocument());
    expect(screen.getByText('Failed to retrieve travel data structure.')).toBeInTheDocument();
  });

  test('getTransportationIcon returns correct icon for "Train"', async () => {
    const trainResponse = {
      ...mockApiSuccessResponse,
      data: { ...mockApiSuccessResponse.data, result: [{ ...mockApiSuccessResultItem, transportation: 'Train' }] },
    };
    mockedAxios.get.mockResolvedValueOnce(trainResponse);
    render(<TravelInfo requestId="REQ_TRAIN_ICON" />);
    await waitFor(() => expect(screen.getByTestId('train-icon')).toBeInTheDocument());
  });

  test('getTransportationIcon returns correct icon for "Bus"', async () => {
    const busResponse = {
      ...mockApiSuccessResponse,
      data: { ...mockApiSuccessResponse.data, result: [{ ...mockApiSuccessResultItem, transportation: 'Bus' }] },
    };
    mockedAxios.get.mockResolvedValueOnce(busResponse);
    render(<TravelInfo requestId="REQ_BUS_ICON" />);
    await waitFor(() => expect(screen.getByTestId('bus-icon')).toBeInTheDocument());
  });

  test('getTransportationIcon returns default icon for unknown travel mode', async () => {
    const unknownModeResponse = {
      ...mockApiSuccessResponse,
      data: { ...mockApiSuccessResponse.data, result: [{ ...mockApiSuccessResultItem, transportation: 'Skateboard' }] },
    };
    mockedAxios.get.mockResolvedValueOnce(unknownModeResponse);
    render(<TravelInfo requestId="REQ_UNKNOWN_ICON" />);
    await waitFor(() => expect(screen.getByTestId('default-transport-icon')).toBeInTheDocument());
  });
  
  test('formatDate returns "Invalid Date" for unparseable date string', async () => {
    const invalidDateResponse = {
      ...mockApiSuccessResponse,
      data: { ...mockApiSuccessResponse.data, result: [{ ...mockApiSuccessResultItem, requestCreateDate: 'not-a-valid-date' }] },
    };
    mockedAxios.get.mockResolvedValueOnce(invalidDateResponse);
    render(<TravelInfo requestId="REQ_INVALID_DATE" />);
    await waitFor(() => expect(screen.getByText('Business Meeting')).toBeInTheDocument());
    
    const requestDateLabel = screen.getByText('Request Date');
    const requestDateValueElement = requestDateLabel.closest('div')?.querySelector('p.font-medium.text-gray-900');
    expect(requestDateValueElement).toHaveTextContent('Invalid Date');
  });
});