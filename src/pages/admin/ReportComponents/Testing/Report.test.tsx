import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Reports from '../Reports';

// Define types for mock component props
interface MockStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  children?: React.ReactNode;
}

interface MockDateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

interface MockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

// Mock the child components
jest.mock('../StatCard', () => {
  // This mock assumes that any clickable elements (like a "View Details" button)
  // are passed as children to the StatCard component.
  return function MockStatCard({ title, value, subtitle, children }: MockStatCardProps) {
    return (
      <div data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <h3>{title}</h3>
        <div>{value}</div>
        <div>{subtitle}</div>
        {children}
      </div>
    );
  };
});

jest.mock('../AirlineDistributionChart', () => {
  return function MockAirlineDistributionChart() {
    return <div data-testid="airline-distribution-chart">Airline Chart</div>;
  };
});

jest.mock('../TravelAgencyBarChart', () => {
  return function MockTravelAgencyBarChart() {
    return <div data-testid="travel-agency-bar-chart">Travel Agency Chart</div>;
  };
});

jest.mock('../DateRangePicker', () => {
  return function MockDateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: MockDateRangePickerProps) {
    return (
      <div data-testid="date-range-picker">
        <input
          data-testid="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <input
          data-testid="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
    );
  };
});

// The Modal mock is essential for testing modal interactions.
jest.mock('../Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }: MockModalProps) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal" role="dialog">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="close-modal">Close</button>
        <div>{children}</div>
      </div>
    );
  };
});

// A mock for a details table that might be rendered inside the modal.
// This prevents the test from breaking if the actual component is not available.



// Define types for fetch mock
interface MockResponse {
  ok: boolean;
  json: () => Promise<any>;
}

// Mock fetch globally with proper typing
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('Reports Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Component renders loading state initially
  test('should display loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}) as Promise<Response>);
    render(<Reports />);
    expect(screen.getByText('Loading Reports...')).toBeInTheDocument();
  });

  // Test Case 2: Component renders error state when API calls fail
  test('should display error message when API calls fail', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<Reports />);
    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  // Test Case 3: Component renders successfully with API data
  test('should render dashboard with data when API calls succeed', async () => {
    const mockApiResponse = {
      isSuccess: true,
      result: {
        totalRequestCount: 10, rejectedCount: 2, confirmedOrOtherCount: 8,
        totalExpense: 50000, domesticExpense: 30000, internationalExpense: 20000,
        totalTripCount: 5, domesticTripCount: 3, internationalTripCount: 2,
        expiredCount: 1, expiresIn45DaysCount: 2, expiresIn90DaysCount: 3,
        averageProcessingTimeDays: 7,
        requests: [], trips: [], passportDetails: [], visaDetails: [],
      }
    };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockApiResponse) } as Response);

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('Travel Reports & Analytics')).toBeInTheDocument();
    });

    expect(screen.getByTestId('stat-card-total-requests')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-total-cost')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-total-trips')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-passport-status')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-visa-status')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-processing-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('airline-distribution-chart')).toBeInTheDocument();
    expect(screen.getByTestId('travel-agency-bar-chart')).toBeInTheDocument();
  });

  // Test Case 4: Date range picker functionality works
  test('should update date range when date picker values change', async () => {
    const mockApiResponse = { isSuccess: true, result: { /* empty data */ } };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockApiResponse) } as Response);
    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
    });

    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    expect(startDateInput).toHaveValue('2024-01-01');

    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    expect(endDateInput).toHaveValue('2024-12-31');
  });

  // Test Case 5: Modal functionality for showing details
  test('should open and close modal with correct details when stat card button is clicked', async () => {
    const mockApiResponse = {
      isSuccess: true,
      result: {
        passportDetails: [{ employeeName: 'John Doe', passportNumber: 'P12345', expiryDate: '2025-10-10' }],
        // Add other empty data to prevent errors
        requests: [], totalRequestCount: 0, rejectedCount: 0, confirmedOrOtherCount: 0,
        totalExpense: 0, domesticExpense: 0, internationalExpense: 0,
        totalTripCount: 0, domesticTripCount: 0, internationalTripCount: 0,
        trips: [], expiredCount: 1, expiresIn45DaysCount: 0, expiresIn90DaysCount: 0,
        visaDetails: [], averageProcessingTimeDays: 0
      }
    };
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockApiResponse) } as Response);

    render(<Reports />);

    // Wait for the component and stat cards to be rendered
    const passportCard = await screen.findByTestId('stat-card-passport-status');
    
    // Assume there is a button within the card to open the modal
    // We use `within` to scope the search to just the passport card
    const viewDetailsButton = within(passportCard).getByRole('button');
    fireEvent.click(viewDetailsButton);

    // Assert that the modal opens with the correct title and content
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Passport Details')).toBeInTheDocument();
    expect(screen.getByTestId('passport-details-table')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Assert that the modal closes when the close button is clicked
    const closeModalButton = screen.getByTestId('close-modal');
    fireEvent.click(closeModalButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});