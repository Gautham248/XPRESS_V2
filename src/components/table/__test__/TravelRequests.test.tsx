import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TravelRequests from '../TravelRequests';

describe('TravelRequests Component', () => {
  const mockNavigate = jest.fn();
  const mockLocalStorage = {
    getItem: jest.fn(),
  };

  // Mock the useNavigate hook
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  // Mock react-datepicker to avoid CSS import issues
  jest.mock('react-datepicker', () => ({ default: () => <div>Mocked DatePicker</div> }));

  // Helper function to create a mock Response object
  const createMockResponse = (ok: boolean, jsonData: any, status: number = 200, statusText: string = 'OK'): Response => {
    const response: Response = {
      ok,
      status,
      statusText,
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: () => createMockResponse(ok, jsonData, status, statusText),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      json: () => Promise.resolve(jsonData),
      text: () => Promise.resolve(JSON.stringify(jsonData)),
    } as Response;
    return response;
  };

  // Helper function to set up the component with mocked API response
  const setupTravelRequests = async (
    fetchResponse: Response,
    role: 'admin' | 'duhead' | 'manager' = 'manager',
    initialEntries: string[] = ['/manager/team-requests'],
    userEmail: string = 'test@example.com',
    token: string = 'mock-token'
  ) => {
    global.fetch = jest.fn(() => Promise.resolve(fetchResponse));
    global.localStorage = mockLocalStorage as any;
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        role,
        userEmail,
        token,
        userId: 1,
        userName: 'Test User',
      })
    );

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <TravelRequests />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      if (!fetchResponse.ok) {
        expect(screen.getByText(/Failed to fetch travel requests/i)).toBeInTheDocument();
      } else {
        // If the response is successful but returns no data
        if (fetchResponse.ok && JSON.stringify(fetchResponse).includes('[]')) {
          expect(screen.getByText('No data found matching your criteria.')).toBeInTheDocument();
        } else {
          // Check for a known element to confirm data is loaded
          expect(screen.getByTestId(/row-/)).toBeInTheDocument();
        }
      }
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockLocalStorage.getItem.mockClear();
  });

  test('renders loading state initially', () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // Simulate pending fetch
    render(
      <MemoryRouter>
        <TravelRequests />
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders error state when local storage is missing user data', async () => {
    global.fetch = jest.fn();
    global.localStorage = mockLocalStorage as any;
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <MemoryRouter>
        <TravelRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User data not found in local storage. Please log in again.')).toBeInTheDocument();
    });
  });

  test('renders error state when user email or token is missing', async () => {
    global.fetch = jest.fn();
    global.localStorage = mockLocalStorage as any;
    mockLocalStorage.getItem.mockReturnValue(
      JSON.stringify({
        role: 'manager',
        userEmail: '',
        token: '',
        userId: 1,
        userName: 'Test User',
      })
    );

    render(
      <MemoryRouter>
        <TravelRequests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User email or token not found in local storage.')).toBeInTheDocument();
    });
  });

  test('renders error state on fetch failure', async () => {
    await setupTravelRequests(
      createMockResponse(false, {}, 500, 'Internal Server Error'),
      'manager'
    );
    expect(screen.getByText('Failed to fetch travel requests. Please try again later.')).toBeInTheDocument();
  });

  describe('Data Rendering for Different Roles', () => {
    const mockData = [
      {
        requestId: 'TR001',
        employeeName: 'John Doe',
        isInternational: false,
        isRoundTrip: true,
        outboundDepartureDate: '2025-06-10T00:00:00Z',
        outboundArrivalDate: '2025-06-10T05:00:00Z',
        returnDepartureDate: '2025-06-15T00:00:00Z',
        returnArrivalDate: '2025-06-15T05:00:00Z',
        sourcePlace: 'New York',
        sourceCountry: 'USA',
        destinationPlace: 'Chicago',
        destinationCountry: 'USA',
        purposeOfTravel: 'Client Meeting',
        currentStatusName: 'PendingReview',
        duId: 'IT',
        comments: 'Urgent travel',
        projectName: 'PROJ001',
        travelModeName: 'Flight',
        projectManagerName: 'Jane Smith',
      },
      {
        requestId: 'TR002',
        employeeName: 'Alice Smith',
        isInternational: true,
        isRoundTrip: false,
        outboundDepartureDate: '2025-06-12T00:00:00Z',
        outboundArrivalDate: '2025-06-12T08:00:00Z',
        returnDepartureDate: null,
        returnArrivalDate: null,
        sourcePlace: 'London',
        sourceCountry: 'UK',
        destinationPlace: 'Tokyo',
        destinationCountry: 'Japan',
        purposeOfTravel: 'Conference',
        currentStatusName: 'Rejected',
        duId: 'HR',
        comments: null,
        projectName: 'PROJ002',
        travelModeName: 'Flight',
        projectManagerName: 'Bob Johnson',
      },
    ];

    test('renders travel requests data correctly for manager role', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);

      // Check row for TR001
      const row1 = screen.getByTestId('row-TR001');
      expect(row1).toBeInTheDocument();
      expect(screen.getByTestId('cell-TR001-requestId')).toHaveTextContent('TR001');
      expect(screen.getByTestId('cell-TR001-currentStatusName')).toHaveTextContent('PendingReview');
      expect(screen.getByTestId('cell-TR001-travelType')).toHaveTextContent('Domestic');
      expect(screen.getByTestId('cell-TR001-isRoundTrip')).toHaveTextContent('Round Trip');
      expect(screen.getByTestId('cell-TR001-employeeName')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('cell-TR001-destination')).toHaveTextContent('Chicago, USA');
      expect(screen.getByTestId('cell-TR001-source')).toHaveTextContent('New York, USA');
      expect(screen.getByTestId('cell-TR001-outboundDepartureDate')).toHaveTextContent('2025-06-10');
      expect(screen.getByTestId('cell-TR001-outboundArrivalDate')).toHaveTextContent('2025-06-10');
      expect(screen.getByTestId('cell-TR001-returnDepartureDate')).toHaveTextContent('2025-06-15');
      expect(screen.getByTestId('cell-TR001-returnArrivalDate')).toHaveTextContent('2025-06-15');
      expect(screen.getByTestId('cell-TR001-duId')).toHaveTextContent('IT');
      expect(screen.getByTestId('cell-TR001-purposeOfTravel')).toHaveTextContent('Client Meeting');
      expect(screen.getByTestId('cell-TR001-comments')).toHaveTextContent('Urgent travel');
      expect(screen.getByTestId('cell-TR001-projectName')).toHaveTextContent('PROJ001');
      expect(screen.getByTestId('cell-TR001-travelModeName')).toHaveTextContent('Flight');
      expect(screen.getByTestId('cell-TR001-projectManagerName')).toHaveTextContent('Jane Smith');
      expect(screen.getByTestId('cell-TR001-travelDates')).toHaveTextContent('Jun 10, 2025 - Jun 15, 2025');

      // Check row for TR002
      const row2 = screen.getByTestId('row-TR002');
      expect(row2).toBeInTheDocument();
      expect(screen.getByTestId('cell-TR002-travelType')).toHaveTextContent('International');
      expect(screen.getByTestId('cell-TR002-isRoundTrip')).toHaveTextContent('One Way');
      expect(screen.getByTestId('cell-TR002-returnDepartureDate')).toHaveTextContent('N/A');
      expect(screen.getByTestId('cell-TR002-returnArrivalDate')).toHaveTextContent('N/A');
      expect(screen.getByTestId('cell-TR002-comments')).toHaveTextContent('N/A');
      expect(screen.getByTestId('cell-TR002-travelDates')).toHaveTextContent('N/A');
    });

    test('renders travel requests data correctly for duhead role', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'duhead', ['/manager/team-requests'], 'vaisakh.s@experionglobal.com');

      // Verify the API was called with the correct endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5030/api/TravelRequest/ByDUH/vaisakh.s%40experionglobal.com',
        expect.any(Object)
      );

      // Check row for TR001
      expect(screen.getByTestId('cell-TR001-requestId')).toHaveTextContent('TR001');
      expect(screen.getByTestId('cell-TR001-travelType')).toHaveTextContent('Domestic');
      expect(screen.getByTestId('cell-TR001-isRoundTrip')).toHaveTextContent('Round Trip');
    });

    test('renders travel requests data correctly for admin role', async () => {
      const response = createMockResponse(true, mockData);
      await setupTravelRequests(response, 'admin', ['/admin/travel-requests']);

      // Verify the API was called with the correct endpoint
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5030/api/TravelRequest/travelrequests',
        expect.any(Object)
      );

      // Check row for TR001
      expect(screen.getByTestId('cell-TR001-requestId')).toHaveTextContent('TR001');
      expect(screen.getByTestId('cell-TR001-travelType')).toHaveTextContent('Domestic');
      expect(screen.getByTestId('cell-TR001-isRoundTrip')).toHaveTextContent('Round Trip');
    });

    test('does not render excluded fields', async () => {
      const response = createMockResponse(true, {
        isSuccess: true,
        result: [
          {
            ...mockData[0],
            isPickupRequired: true,
            isDropoffRequired: false,
            pickupPlace: 'Airport',
            dropoffPlace: 'Hotel',
            isVegetarian: true,
            attendedCct: false,
            travelAgencyName: 'Expedia',
            totalExpense: 1500,
            uploadedTicketPdfPath: '/path/to/ticket.pdf',
            createdAt: '2025-06-01T00:00:00Z',
            updatedAt: '2025-06-02T00:00:00Z',
          },
        ],
      });
      await setupTravelRequests(response, 'manager');

      // Check that excluded fields are not rendered
      expect(screen.queryByText('true')).not.toBeInTheDocument(); // isPickupRequired
      expect(screen.queryByText('false')).not.toBeInTheDocument(); // isDropoffRequired, attendedCct
      expect(screen.queryByText('Airport')).not.toBeInTheDocument();
      expect(screen.queryByText('Hotel')).not.toBeInTheDocument();
      expect(screen.queryByText('Expedia')).not.toBeInTheDocument();
      expect(screen.queryByText('1500')).not.toBeInTheDocument();
      expect(screen.queryByText('/path/to/ticket.pdf')).not.toBeInTheDocument();
      expect(screen.queryByText('2025-06-01')).not.toBeInTheDocument();
      expect(screen.queryByText('2025-06-02')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    const mockData = [
      {
        requestId: 'TR001',
        employeeName: 'John Doe',
        isInternational: false,
        isRoundTrip: true,
        outboundDepartureDate: '2025-06-10T00:00:00Z',
        outboundArrivalDate: '2025-06-10T05:00:00Z',
        returnDepartureDate: '2025-06-15T00:00:00Z',
        returnArrivalDate: '2025-06-15T05:00:00Z',
        sourcePlace: 'New York',
        sourceCountry: 'USA',
        destinationPlace: 'Chicago',
        destinationCountry: 'USA',
        purposeOfTravel: 'Client Meeting',
        currentStatusName: 'PendingReview',
        duId: 'IT',
        comments: 'Urgent travel',
      },
    ];

    test('navigates to correct path on row click for manager role (team-requests)', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);
      const row = screen.getByTestId('row-TR001');
      await userEvent.click(row);
      expect(mockNavigate).toHaveBeenCalledWith('/manager/team-requests/TR001');
    });

    test('navigates to correct path on row click for manager role (my-requests)', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/my-requests']);
      const row = screen.getByTestId('row-TR001');
      await userEvent.click(row);
      expect(mockNavigate).toHaveBeenCalledWith('/manager/my-requests/TR001');
    });

    test('navigates to correct path on row click for admin role', async () => {
      const response = createMockResponse(true, mockData);
      await setupTravelRequests(response, 'admin', ['/admin/travel-requests']);
      const row = screen.getByTestId('row-TR001');
      await userEvent.click(row);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/travel-requests/TR001');
    });

    test('navigates to correct path on view details button click', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);
      const viewButton = screen.getByTestId('view-details-TR001');
      await userEvent.click(viewButton);
      expect(mockNavigate).toHaveBeenCalledWith('/manager/team-requests/TR001');
    });
  });

  describe('Action Buttons', () => {
    const createMockDataWithStatus = (status: string) => [
      {
        requestId: 'TR001',
        employeeName: 'John Doe',
        isInternational: false,
        isRoundTrip: true,
        outboundDepartureDate: '2025-06-10T00:00:00Z',
        outboundArrivalDate: '2025-06-10T05:00:00Z',
        returnDepartureDate: '2025-06-15T00:00:00Z',
        returnArrivalDate: '2025-06-15T05:00:00Z',
        sourcePlace: 'New York',
        sourceCountry: 'USA',
        destinationPlace: 'Chicago',
        destinationCountry: 'USA',
        purposeOfTravel: 'Client Meeting',
        currentStatusName: status,
        duId: 'IT',
        comments: 'Urgent travel',
      },
    ];

    test('renders approve and reject buttons for PendingReview status', async () => {
      const response = createMockResponse(true, {
        isSuccess: true,
        result: createMockDataWithStatus('PendingReview'),
      });
      await setupTravelRequests(response, 'manager');
      expect(screen.getByTestId('approve-TR001')).toBeInTheDocument();
      expect(screen.getByTestId('reject-TR001')).toBeInTheDocument();
    });

    test('renders approve and reject buttons for DUApproved status', async () => {
      const response = createMockResponse(true, {
        isSuccess: true,
        result: createMockDataWithStatus('DUApproved'),
      });
      await setupTravelRequests(response, 'manager');
      expect(screen.getByTestId('approve-TR001')).toBeInTheDocument();
      expect(screen.getByTestId('reject-TR001')).toBeInTheDocument();
    });

    test('renders approve and reject buttons for OptionSelected status', async () => {
      const response = createMockResponse(true, {
        isSuccess: true,
        result: createMockDataWithStatus('OptionSelected'),
      });
      await setupTravelRequests(response, 'manager');
      expect(screen.getByTestId('approve-TR001')).toBeInTheDocument();
      expect(screen.getByTestId('reject-TR001')).toBeInTheDocument();
    });

    test('does not render approve and reject buttons for Rejected status', async () => {
      const response = createMockResponse(true, {
        isSuccess: true,
        result: createMockDataWithStatus('Rejected'),
      });
      await setupTravelRequests(response, 'manager');
      expect(screen.queryByTestId('approve-TR001')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reject-TR001')).not.toBeInTheDocument();
    });

    test('triggers approve action on button click', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      const response = createMockResponse(true, {
        isSuccess: true,
        result: createMockDataWithStatus('PendingReview'),
      });
      await setupTravelRequests(response, 'manager');
      const approveButton = screen.getByTestId('approve-TR001');
      await userEvent.click(approveButton);
      expect(consoleLogSpy).toHaveBeenCalledWith('Approving item:', 'TR001');
      consoleLogSpy.mockRestore();
    });

    test('triggers reject action on button click', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      const response = createMockResponse(true, {
        isSuccess: true,
        result: createMockDataWithStatus('PendingReview'),
      });
      await setupTravelRequests(response, 'manager');
      const rejectButton = screen.getByTestId('reject-TR001');
      await userEvent.click(rejectButton);
      expect(consoleLogSpy).toHaveBeenCalledWith('Rejecting item:', 'TR001');
      consoleLogSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty API response', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: [] });
      await setupTravelRequests(response, 'manager');
      expect(screen.getByText('No data found matching your criteria.')).toBeInTheDocument();
    });

    test('handles null dates gracefully', async () => {
      const response = createMockResponse(true, {
        isSuccess: true,
        result: [
          {
            requestId: 'TR001',
            employeeName: 'John Doe',
            isInternational: false,
            isRoundTrip: true,
            outboundDepartureDate: null,
            outboundArrivalDate: null,
            returnDepartureDate: null,
            returnArrivalDate: null,
            sourcePlace: 'New York',
            sourceCountry: 'USA',
            destinationPlace: 'Chicago',
            destinationCountry: 'USA',
            purposeOfTravel: 'Client Meeting',
            currentStatusName: 'PendingReview',
            duId: 'IT',
            comments: 'Urgent travel',
          },
        ],
      });
      await setupTravelRequests(response, 'manager');
      expect(screen.getByTestId('cell-TR001-outboundDepartureDate')).toHaveTextContent('N/A');
      expect(screen.getByTestId('cell-TR001-outboundArrivalDate')).toHaveTextContent('N/A');
      expect(screen.getByTestId('cell-TR001-returnDepartureDate')).toHaveTextContent('N/A');
      expect(screen.getByTestId('cell-TR001-returnArrivalDate')).toHaveTextContent('N/A');
      expect(screen.getByTestId('cell-TR001-travelDates')).toHaveTextContent('N/A');
    });
  });
});