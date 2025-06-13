import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AirlineDistributionChart from '../AirlineDistributionChart';
import { AirlineReportsResponse } from '../AirlineDistributionChart'; // Assuming interfaces are exported

// --- Mocks ---
jest.mock('../ReusableTable', () => {
  return function MockedReusableTable() {
    return <div data-testid="reusable-table">Mocked ReusableTable</div>;
  };
});

jest.mock('../Modal', () => {
  return function MockedModal({ children, isOpen, title }: { children: React.ReactNode; isOpen: boolean; title: string }) {
    return isOpen ? (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ) : null;
  };
});

jest.mock('../EmptyStateView', () => {
  return function MockedEmptyStateView({ title, message }: { title: string; message: string }) {
    return (
      <div data-testid="empty-state">
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    );
  };
});

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div className="recharts-responsive-container">{children}</div>
    ),
  };
});

jest.mock('lucide-react', () => ({
  ExternalLink: () => <div data-testid="icon-external-link"></div>,
  Filter: () => <div data-testid="icon-filter"></div>,
  ChevronDown: () => <div data-testid="icon-chevron-down"></div>,
  Globe: () => <div data-testid="icon-globe"></div>,
  MapPin: () => <div data-testid="icon-map-pin"></div>,
}));

// --- Test Data ---
const mockApiData: AirlineReportsResponse = {
  isSuccess: true,
  statusCode: 200,
  errorMessages: [],
  result: [
    { airlineName: 'IndiGo', typeOfTravel: 'Domestic', travelRequestCount: 100, totalAirlineExpense: 500000 },
    { airlineName: 'Vistara', typeOfTravel: 'Domestic', travelRequestCount: 50, totalAirlineExpense: 400000 },
    { airlineName: 'Lufthansa', typeOfTravel: 'International', travelRequestCount: 20, totalAirlineExpense: 1200000 },
    { airlineName: 'Emirates', typeOfTravel: 'International', travelRequestCount: 30, totalAirlineExpense: 2000000 },
  ],
};

const mockEmptyApiData: AirlineReportsResponse = {
  isSuccess: true,
  statusCode: 200,
  errorMessages: [],
  result: [],
};

// --- Test Suite ---
describe('AirlineDistributionChart', () => {
  // Mock global fetch
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test Case 1: Renders correctly with data and displays totals
  test('should render chart and summary data on successful API call', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiData),
    });

    render(<AirlineDistributionChart startDate="2023-01-01" endDate="2023-12-31" />);

    await waitFor(() => {
      expect(screen.getByText('Flight Provider Insights')).toBeInTheDocument();
    });

    // Check chart elements
    expect(screen.getByText('200')).toBeInTheDocument(); // Total trips (100+50+20+30)

    // Check legend items
    expect(screen.getByText('IndiGo')).toBeInTheDocument();
    expect(screen.getByText('Lufthansa')).toBeInTheDocument();

    // Check summary stats
    expect(screen.getByText('Total Trips (All Flights)')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument(); // Total trips (corrected from '2,00' to '200')
    expect(screen.getByText('Total Cost (All Flights)')).toBeInTheDocument();
    expect(screen.getByText('₹41,00,000')).toBeInTheDocument(); // Total cost (500k+400k+1.2M+2M)
  });

  // Test Case 2: Displays loading state initially
  test('should display a loading state while fetching data', () => {
    (fetch as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    render(<AirlineDistributionChart startDate="2023-01-01" endDate="2023-12-31" />);

    expect(screen.getByText('Loading airline data...')).toBeInTheDocument();
    expect(screen.queryByText('Flight Provider Insights')).not.toBeInTheDocument();
  });

  // Test Case 3: Displays an error message on API failure
  test('should display an error message if the API call fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<AirlineDistributionChart startDate="2023-01-01" endDate="2023-12-31" />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading airline data:/)).toBeInTheDocument();
    });
    expect(screen.getByText('Error loading airline data: Network error')).toBeInTheDocument();
  });

  // Test Case 4: Displays empty state when no data is returned
  test('should render the empty state view when API returns no data', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEmptyApiData),
    });

    render(<AirlineDistributionChart startDate="2023-01-01" endDate="2023-12-31" />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('No flight data available')).toBeInTheDocument();
    expect(screen.getByText('No flight provider data is currently available to display.')).toBeInTheDocument();
    
    // Summary stats should not be rendered
    expect(screen.queryByText('Total Trips (All Flights)')).not.toBeInTheDocument();
  });

  // Test Case 5: Filters data correctly when a filter is applied
  test('should filter data and update the chart and summary when a filter is selected', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiData),
    });

    render(<AirlineDistributionChart startDate="2023-01-01" endDate="2023-12-31" />);

    await waitFor(() => expect(screen.getByText('200')).toBeInTheDocument()); // Initial total trips

    // 1. Open the filter dropdown
    const filterButton = screen.getByRole('button', { name: /All Flights/i });
    fireEvent.click(filterButton);

    // 2. Click the "International Only" filter option
    const internationalOption = await screen.findByRole('button', { name: /International Only/i });
    fireEvent.click(internationalOption);
    
    // 3. Wait for UI to update
    await waitFor(() => {
      // Check if the filter button text has changed
      expect(screen.getByRole('button', { name: /International Flights/i })).toBeInTheDocument();
    });

    // 4. Assert updated values
    // New total trips for international (20 + 30)
    expect(screen.getByText('50')).toBeInTheDocument();
    
    // Legend should only show international airlines
    expect(screen.getByText('Lufthansa')).toBeInTheDocument();
    expect(screen.getByText('Emirates')).toBeInTheDocument();
    expect(screen.queryByText('IndiGo')).not.toBeInTheDocument();
    
    // Summary should be updated
    expect(screen.getByText('Total Trips (International Flights)')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // Summary total trips
    expect(screen.getByText('Total Cost (International Flights)')).toBeInTheDocument();
    expect(screen.getByText('₹32,00,000')).toBeInTheDocument(); // Summary total cost (1.2M + 2M)
  });
});