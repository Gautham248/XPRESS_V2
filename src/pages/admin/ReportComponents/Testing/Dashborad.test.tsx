import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch
global.fetch = jest.fn();

const mockSuccessResponse = (data: any) => ({
  ok: true,
  json: async () => ({
    isSuccess: true,
    result: data,
    statusCode: 200,
    errorMessages: [],
  }),
});

beforeEach(() => {
  jest.clearAllMocks();
});

// Helper to wrap in Router
const renderWithRouter = (ui: React.ReactElement) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

// ✅ Test 1: Dashboard renders with header
test('renders dashboard header', () => {
  renderWithRouter(<Dashboard />);
  const header = screen.getByText(/Admin Dashboard/i);
  expect(header).toBeInTheDocument();
});

// ✅ Test 2: Displays correct values after API calls complete
test('displays correct metric values from API', async () => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('travel-legs')) {
      return Promise.resolve(
        mockSuccessResponse({
          todayOutboundDepartureCount: 3,
          todayReturnArrivalCount: 2,
        })
      );
    }
    if (url.includes('new')) {
      return Promise.resolve(mockSuccessResponse({ count: 10 }));
    }
    if (url.includes('verified-or-duapproved') && !url.includes('sla-breached')) {
      return Promise.resolve(mockSuccessResponse({ count: 25 }));
    }
    if (url.includes('sla-breached')) {
      return Promise.resolve(mockSuccessResponse({ count: 3 }));
    }
    if (url.includes('rejected')) {
      return Promise.resolve(mockSuccessResponse({ count: 7 }));
    }
    return Promise.resolve(mockSuccessResponse({ count: 0 }));
  });

  renderWithRouter(<Dashboard />);
  
  await waitFor(() => {
    expect(screen.getByText('10')).toBeInTheDocument(); // New Requests
    expect(screen.getByText('25')).toBeInTheDocument(); // Ticket Actions
    expect(screen.getByText('3')).toBeInTheDocument();  // SLA Breach
    expect(screen.getByText('7')).toBeInTheDocument();  // Rejected
    expect(screen.getByText('5')).toBeInTheDocument();  // Return and Departure (3+2)
  });
});

// ✅ Test 3: Renders all 5 metric cards
test('renders all 5 metric cards', async () => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('travel-legs')) {
      return Promise.resolve(
        mockSuccessResponse({
          todayOutboundDepartureCount: 2,
          todayReturnArrivalCount: 3,
        })
      );
    }
    return Promise.resolve(mockSuccessResponse({ count: 5 }));
  });

  renderWithRouter(<Dashboard />);
  await waitFor(() => {
    expect(screen.getByText('New Requests')).toBeInTheDocument();
    expect(screen.getByText('Ticket Actions')).toBeInTheDocument();
    expect(screen.getByText('SLA Breach')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Return and Departure')).toBeInTheDocument();
  });
});

// ✅ Test 4: Handles API error gracefully
test('displays error when API fails', async () => {
  (global.fetch as jest.Mock).mockImplementation(() =>
    Promise.reject(new Error('API Failed'))
  );

  renderWithRouter(<Dashboard />);
  const errorMessage = await screen.findByText(/Failed to load dashboard statistics/i);
  expect(errorMessage).toBeInTheDocument();
});

// ✅ Test 5: Renders "Today's Statistics" section header
test('renders today\'s statistics section header', async () => {
  (global.fetch as jest.Mock).mockImplementation(() =>
    Promise.resolve(mockSuccessResponse({ count: 1 }))
  );

  renderWithRouter(<Dashboard />);
  
  await waitFor(() => {
    const sectionHeader = screen.getByText("Today's Statistics");
    expect(sectionHeader).toBeInTheDocument();
  });
});