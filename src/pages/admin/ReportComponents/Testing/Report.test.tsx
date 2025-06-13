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

// Updated to include the `onApply` function prop
interface MockDateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
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

// Updated mock to include an "Apply" button to trigger the `onApply` function
jest.mock('../DateRangePicker', () => {
  return function MockDateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, onApply }: MockDateRangePickerProps) {
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
        <button data-testid="apply-dates-button" onClick={onApply}>Apply</button>
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
  const mockApiResponse = {
      isSuccess: true,
      result: {
        requests: [], totalRequestCount: 10, rejectedCount: 2, confirmedOrOtherCount: 8,
        totalExpense: 50000, domesticExpense: 30000, internationalExpense: 20000,
        trips: [], totalTripCount: 5, domesticTripCount: 3, internationalTripCount: 2,
        passportDetails: [], expiredCount: 1, expiresIn45DaysCount: 2, expiresIn90DaysCount: 3,
        visaDetails: [],
        readableFormat: '7 Days',
      }
  };

  beforeEach(() => {
    // Reset fetch mock before each test and provide a default successful implementation
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
    } as Response);
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
  });

  // Test Case 4: Date range picker functionality works
  test('should update date range when date picker values change', async () => {
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

  // Test Case 5: Refetches data when the date range is applied
  test('should refetch data with new date range when Apply button is clicked', async () => {
    render(<Reports />);
    
    // Wait for the initial data load to complete
    await waitFor(() => {
      expect(screen.getByText('Travel Reports & Analytics')).toBeInTheDocument();
    });
    
    // Initial fetch calls (6 endpoints) should have happened
    expect(mockFetch).toHaveBeenCalledTimes(6);
    
    // Clear the mock call history to isolate the next fetch calls
    mockFetch.mockClear();
    
    // Change the date inputs
    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');
    fireEvent.change(startDateInput, { target: { value: '2023-05-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-05-31' } });
    
    // Click the "Apply" button from our updated mock
    const applyButton = screen.getByTestId('apply-dates-button');
    fireEvent.click(applyButton);
    
    // Wait for the refetch to be triggered and completed
    await waitFor(() => {
      // The 6 API endpoints should be called again
      expect(mockFetch).toHaveBeenCalledTimes(6);
    });
    
    // Verify that one of the new fetch calls includes the updated date parameters
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('startDate=2023-05-01&endDate=2023-05-31')
    );
  });
});