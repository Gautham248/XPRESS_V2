import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TravelAgencyBarChart from '../TravelAgencyBarChart';

// Mock the child components
jest.mock('../EmptyStateView', () => {
  return function MockEmptyStateView({ title, message }: any) {
    return <div data-testid="empty-state">{title}: {message}</div>;
  };
});

jest.mock('../Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }: any) {
    return isOpen ? (
      <div data-testid="modal">
        <div>{title}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        {children}
      </div>
    ) : null;
  };
});

jest.mock('../ReusableTable', () => {
  return function MockReusableTable({ headers, data }: any) {
    return (
      <div data-testid="reusable-table">
        <div>Headers: {headers.join(', ')}</div>
        <div>Rows: {data.length}</div>
      </div>
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('TravelAgencyBarChart', () => {
  const mockApiResponse = {
    isSuccess: true,
    result: [
      {
        travelAgencyName: 'Agency A',
        travelType: 'International' as const,
        requestCount: 15,
        totalExpense: 50000
      },
      {
        travelAgencyName: 'Agency A',
        travelType: 'Domestic' as const,
        requestCount: 10,
        totalExpense: 25000
      },
      {
        travelAgencyName: 'Agency B',
        travelType: 'International' as const,
        requestCount: 8,
        totalExpense: 30000
      }
    ],
    statusCode: 200,
    errorMessages: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });
  });

  // Test Case 1: Component renders with loading state initially
  test('1. should render loading state when dates are provided', () => {
    render(<TravelAgencyBarChart startDate="2024-01-01" endDate="2024-01-31" />);
    
    expect(screen.getByText('Loading travel agency data...')).toBeInTheDocument();
    expect(screen.getByText('Agency Booking Metrics')).toBeInTheDocument();
  });

  // Test Case 2: Component fetches and displays data successfully
  test('2. should fetch and display travel agency data', async () => {
    render(<TravelAgencyBarChart startDate="2024-01-01" endDate="2024-01-31" />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://xpress-backend-v3.onrender.com/api/TravelAgencyStats/stats?startDate=2024-01-01&endDate=2024-01-31'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Total Bookings (All Bookings)')).toBeInTheDocument();
      expect(screen.getByText('33')).toBeInTheDocument(); // 15 + 10 + 8
      expect(screen.getByText('₹1,05,000')).toBeInTheDocument(); // 50000 + 25000 + 30000
    });
  });

  // Test Case 3: Filter dropdown functionality
  test('3. should toggle filter dropdown and change filters', async () => {
    render(<TravelAgencyBarChart startDate="2024-01-01" endDate="2024-01-31" />);
    
    await waitFor(() => {
      expect(screen.getByText('All Bookings')).toBeInTheDocument();
    });

    // Click filter button
    const filterButton = screen.getByText('All Bookings').closest('button');
    fireEvent.click(filterButton!);

    // Check dropdown options
    expect(screen.getByText('International Only')).toBeInTheDocument();
    expect(screen.getByText('Domestic Only')).toBeInTheDocument();

    // Select international filter
    fireEvent.click(screen.getByText('International Only'));
    
    await waitFor(() => {
      expect(screen.getByText('International Bookings')).toBeInTheDocument();
    });
  });

  // Test Case 5: Error handling when API fails
  test('5. should display error message when API call fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<TravelAgencyBarChart startDate="2024-01-01" endDate="2024-01-31" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  // Test Case 6: Handle API response with error messages
  test('6. should display API error messages when isSuccess is false', async () => {
    const errorResponse = {
      isSuccess: false,
      result: [],
      statusCode: 400,
      errorMessages: ['Invalid date range', 'Unauthorized access']
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => errorResponse
    });
    
    render(<TravelAgencyBarChart startDate="2024-01-01" endDate="2024-01-31" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Invalid date range, Unauthorized access')).toBeInTheDocument();
    });
  });

  // Test Case 7: Empty state when no data is available
  test('7. should show empty state when no data is returned', async () => {
    const emptyResponse = {
      isSuccess: true,
      result: [],
      statusCode: 200,
      errorMessages: []
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyResponse
    });
    
    render(<TravelAgencyBarChart startDate="2024-01-01" endDate="2024-01-31" />);
    
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText(/No agency data available/)).toBeInTheDocument();
    });
  });

  // Test Case 8: Component behavior without start and end dates
  test('8. should not fetch data when startDate or endDate is missing', () => {
    render(<TravelAgencyBarChart />);
    
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText('Loading travel agency data...')).toBeInTheDocument();
  });

  // Test Case 10: HTTP error response handling
  test('10. should handle HTTP error responses', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    render(<TravelAgencyBarChart startDate="2024-01-01" endDate="2024-01-31" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch travel agency data')).toBeInTheDocument();
    });
  });
});