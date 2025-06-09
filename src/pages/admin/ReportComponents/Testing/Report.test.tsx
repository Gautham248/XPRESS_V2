import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

jest.mock('../Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }: MockModalProps) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="close-modal">Close</button>
        {children}
      </div>
    );
  };
});

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
    // Mock fetch to return a pending promise to keep loading state
    mockFetch.mockImplementation(() => new Promise(() => {}) as Promise<Response>);

    render(<Reports />);
    
    expect(screen.getByText('Loading Reports...')).toBeInTheDocument();
  });

  // Test Case 2: Component renders error state when API calls fail
  test('should display error message when API calls fail', async () => {
    // Mock fetch to reject
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  // Test Case 3: Component renders successfully with API data
  test('should render dashboard with data when API calls succeed', async () => {
    // Mock successful API responses
    const mockApiResponse = {
      isSuccess: true,
      result: {
        requests: [],
        totalRequestCount: 10,
        rejectedCount: 2,
        confirmedOrOtherCount: 8,
        totalExpense: 50000,
        domesticExpense: 30000,
        internationalExpense: 20000,
        totalTripCount: 5,
        domesticTripCount: 3,
        internationalTripCount: 2,
        trips: [],
        passportDetails: [],
        expiredCount: 1,
        expiresIn45DaysCount: 2,
        expiresIn90DaysCount: 3,
        visaDetails: [],
        averageProcessingTimeDays: 7
      }
    };

    const mockResponse: MockResponse = {
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    };

    mockFetch.mockResolvedValue(mockResponse as Response);

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('Travel Reports & Analytics')).toBeInTheDocument();
    });

    // Check if stat cards are rendered
    expect(screen.getByTestId('stat-card-total-requests')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-total-cost')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-total-trips')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-passport-status')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-visa-status')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-processing-metrics')).toBeInTheDocument();

    // Check if charts are rendered
    expect(screen.getByTestId('airline-distribution-chart')).toBeInTheDocument();
    expect(screen.getByTestId('travel-agency-bar-chart')).toBeInTheDocument();
  });

  // Test Case 4: Date range picker functionality works
  test('should update date range when date picker values change', async () => {
    // Mock successful API responses
    const mockApiResponse = {
      isSuccess: true,
      result: {
        requests: [],
        totalRequestCount: 0,
        rejectedCount: 0,
        confirmedOrOtherCount: 0,
        totalExpense: 0,
        domesticExpense: 0,
        internationalExpense: 0,
        totalTripCount: 0,
        domesticTripCount: 0,
        internationalTripCount: 0,
        trips: [],
        passportDetails: [],
        expiredCount: 0,
        expiresIn45DaysCount: 0,
        expiresIn90DaysCount: 0,
        visaDetails: [],
        averageProcessingTimeDays: 0
      }
    };

    const mockResponse: MockResponse = {
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    };

    mockFetch.mockResolvedValue(mockResponse as Response);

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
    });

    const startDateInput = screen.getByTestId('start-date') as HTMLInputElement;
    const endDateInput = screen.getByTestId('end-date') as HTMLInputElement;

    // Change start date
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    expect(startDateInput.value).toBe('2024-01-01');

    // Change end date
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    expect(endDateInput.value).toBe('2024-12-31');
  });

  // Test Case 5: Export button functionality
  test('should show alert when export button is clicked', async () => {
    // Mock successful API responses
    const mockApiResponse = {
      isSuccess: true,
      result: {
        requests: [],
        totalRequestCount: 0,
        rejectedCount: 0,
        confirmedOrOtherCount: 0,
        totalExpense: 0,
        domesticExpense: 0,
        internationalExpense: 0,
        totalTripCount: 0,
        domesticTripCount: 0,
        internationalTripCount: 0,
        trips: [],
        passportDetails: [],
        expiredCount: 0,
        expiresIn45DaysCount: 0,
        expiresIn90DaysCount: 0,
        visaDetails: [],
        averageProcessingTimeDays: 0
      }
    };

    const mockResponse: MockResponse = {
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    };

    mockFetch.mockResolvedValue(mockResponse as Response);

    // Mock window.alert with proper typing
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<Reports />);

    await waitFor(() => {
      expect(screen.getByText('Export Reports')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export Reports');
    fireEvent.click(exportButton);

    expect(alertSpy).toHaveBeenCalledWith('Export functionality is not yet implemented.');

    alertSpy.mockRestore();
  });
});