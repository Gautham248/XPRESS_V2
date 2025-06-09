import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
  jest.mock('react-datepicker', () => {
    const MockDatePicker = ({ selected, onChange, placeholderText }: any) => {
      return (
        <input
          type="text"
          data-testid={placeholderText}
          value={selected ? selected.toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : null;
            onChange(date);
          }}
          placeholder={placeholderText}
        />
      );
    };
    return MockDatePicker;
  });

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
    await waitFor(async () => {
      if (!fetchResponse.ok) {
        expect(screen.getByText(/Great News/i)).toBeInTheDocument();
      } else {
        const jsonData = await fetchResponse.json();
        if (fetchResponse.ok && (Array.isArray(jsonData) ? jsonData : jsonData.result).length === 0) {
          expect(screen.getByText('Great news!')).toBeInTheDocument();
        } else {
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

  describe('Additional Functional Test Cases for TravelRequests', () => {
    const mockData = [
      {
        requestId: 'TR001',
        employeeName: 'John Doe',
        isInternational: false,
        isRoundTrip: true,
        outboundDepartureDate: '2025-06-10T00:00:00Z', // IST: 2025-06-10 05:30:00
        outboundArrivalDate: '2025-06-10T05:00:00Z',
        returnDepartureDate: '2025-06-15T00:00:00Z', // IST: 2025-06-15 05:30:00
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
        outboundDepartureDate: '2025-06-12T00:00:00Z', // IST: 2025-06-12 05:30:00
        outboundArrivalDate: '2025-06-12T08:00:00Z',
        returnDepartureDate: null,
        returnArrivalDate: null,
        sourcePlace: 'London',
        sourceCountry: 'UK',
        destinationPlace: 'Tokyo',
        destinationCountry: 'Japan',
        purposeOfTravel: 'Conference',
        currentStatusName: 'Approved',
        duId: 'HR',
        comments: null,
        projectName: 'PROJ002',
        travelModeName: 'Flight',
        projectManagerName: 'Bob Johnson',
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
      mockNavigate.mockClear();
      mockLocalStorage.getItem.mockClear();
    });

    test('searches travel requests by employee name', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);

      const searchInput = screen.getByRole('textbox');
      await userEvent.type(searchInput, 'John');

      expect(screen.getByTestId('row-TR001')).toBeInTheDocument();
      expect(screen.queryByTestId('row-TR002')).not.toBeInTheDocument();
    });

    test('searches travel requests by project name', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);

      const searchInput = screen.getByRole('textbox');
      await userEvent.type(searchInput, 'PROJ001');

      expect(screen.getByTestId('row-TR001')).toBeInTheDocument();
      expect(screen.queryByTestId('row-TR002')).not.toBeInTheDocument();
    });

    test('filters travel requests by status Approved', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);

      const statusFilterButton = screen.getByText(/Status:/i);
      await userEvent.click(statusFilterButton);

      expect(screen.getByText('PendingReview')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();

      const approvedCheckbox = screen.getByRole('checkbox', { name: 'Approved' });
      await userEvent.click(approvedCheckbox);

      expect(screen.queryByTestId('row-TR001')).not.toBeInTheDocument();
      expect(screen.getByTestId('row-TR002')).toBeInTheDocument();
    });

    test('filters travel requests by travel dates range', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);

      const dateFilterTypeSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(dateFilterTypeSelect, 'travelDates');

      const startDatePicker = screen.getByTestId('Start date');
      const endDatePicker = screen.getByTestId('End date');

      fireEvent.change(startDatePicker, { target: { value: '2025-06-11' } });
      fireEvent.change(endDatePicker, { target: { value: '2025-06-14' } });

      await waitFor(() => {
        expect(screen.getByTestId('row-TR001')).toBeInTheDocument();
        expect(screen.queryByTestId('row-TR002')).not.toBeInTheDocument();
      });
    });

    test('filters travel requests by request date', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);

      const dateFilterTypeSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(dateFilterTypeSelect, 'requestDate');

      const startDatePicker = screen.getByTestId('Start date');
      const endDatePicker = screen.getByTestId('End date');

      fireEvent.change(startDatePicker, { target: { value: '2025-06-11' } });
      fireEvent.change(endDatePicker, { target: { value: '2025-06-11' } });

      await waitFor(() => {
        expect(screen.queryByTestId('row-TR001')).not.toBeInTheDocument();
        expect(screen.queryByTestId('row-TR002')).not.toBeInTheDocument();
        expect(screen.getByText('No data found matching your criteria.')).toBeInTheDocument();
      });
    });

    test('clears all filters and shows all data', async () => {
      const response = createMockResponse(true, { isSuccess: true, result: mockData });
      await setupTravelRequests(response, 'manager', ['/manager/team-requests']);

      const searchInput = screen.getByRole('textbox');
      await userEvent.type(searchInput, 'John');

      const statusFilterButton = screen.getByText(/Status:/i);
      await userEvent.click(statusFilterButton);
      const approvedCheckbox = screen.getByRole('checkbox', { name: 'Approved' });
      await userEvent.click(approvedCheckbox);

      expect(screen.queryByTestId('row-TR002')).not.toBeInTheDocument();

      const clearFiltersButton = screen.getByText('Clear All Filters');
      await userEvent.click(clearFiltersButton);

      await waitFor(() => {
        expect(screen.getByTestId('row-TR001')).toBeInTheDocument();
        expect(screen.getByTestId('row-TR002')).toBeInTheDocument();
      });
    });
  });
});