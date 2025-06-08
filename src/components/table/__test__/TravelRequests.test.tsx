import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import TravelRequests from '../TravelRequests';
import { TravelRequest } from '../../../data/mockData';

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
    fetchResponse: Response = createMockResponse(true, {
      isSuccess: true,
      result: [
        {
          requestId: 'TR001',
          employeeName: 'John Doe',
          isInternational: false,
          outboundDepartureDate: '2025-06-10',
          returnDepartureDate: '2025-06-15',
          sourcePlace: 'New York',
          sourceCountry: 'USA',
          destinationPlace: 'Chicago',
          destinationCountry: 'USA',
          purpose: 'Client Meeting',
          currentStatusName: 'PendingReview',
          estimatedCost: 1200,
          transportationType: 'Flight',
          accommodationType: 'Hotel',
          requestDate: '2025-06-01',
          departmentCode: 'IT',
          managerName: 'Jane Smith',
          reportingManager: 'Jane Smith',
          priority: 'High',
          projectName: 'PROJ001',
          travelAgency: 'Expedia',
          airline: 'American Airlines',
        },
      ],
    }),
    initialEntries: string[] = ['/manager/team-requests']
  ) => {
    global.fetch = jest.fn(() => Promise.resolve(fetchResponse));
    global.localStorage = mockLocalStorage as any;
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ role: 'manager' }));

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <TravelRequests />
      </MemoryRouter>
    );

    // Wait for the component to finish loading
    await waitFor(() => {
      if (!fetchResponse.ok) {
        expect(screen.getByText('Failed to fetch travel requests. Please try again later.')).toBeInTheDocument();
      } else {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
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

  test('renders error state on fetch failure', async () => {
    await setupTravelRequests(
      createMockResponse(false, {}, 500, 'Internal Server Error')
    );
    expect(screen.getByText('Failed to fetch travel requests. Please try again later.')).toBeInTheDocument();
  });

  test('renders travel requests data correctly', async () => {
    await setupTravelRequests();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('PROJ001')).toBeInTheDocument();
    expect(screen.getByText('Domestic')).toBeInTheDocument();
    expect(screen.getByText('New York, USA')).toBeInTheDocument();
    expect(screen.getByText('Chicago, USA')).toBeInTheDocument();
    // Check dates separately to handle potential split elements
    expect(screen.getByText('2025-06-10')).toBeInTheDocument();
    expect(screen.getByText('2025-06-15')).toBeInTheDocument();
  });

  test('navigates to correct path on row click', async () => {
    await setupTravelRequests();
    // Use a test ID to reliably select the row
    const row = screen.getByTestId('row-TR001');
    await userEvent.click(row);
    expect(mockNavigate).toHaveBeenCalledWith('/manager/team-requests/TR001');
  });

  describe('Action Buttons', () => {
    test('triggers approve action on button click', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      await setupTravelRequests();
      const approveButton = screen.getByRole('button', { name: /approve/i });
      await userEvent.click(approveButton);
      expect(consoleLogSpy).toHaveBeenCalledWith('Approving item:', 'TR001');
      consoleLogSpy.mockRestore();
    });

    test('triggers reject action on button click', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      await setupTravelRequests();
      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await userEvent.click(rejectButton);
      expect(consoleLogSpy).toHaveBeenCalledWith('Rejecting item:', 'TR001');
      consoleLogSpy.mockRestore();
    });
  });
});